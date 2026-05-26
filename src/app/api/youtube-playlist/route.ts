import { NextResponse } from "next/server";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PlaylistItem = {
  contentDetails?: {
    videoId: string;
  };
};

type PlaylistItemResponse = {
  nextPageToken?: string;
  items?: PlaylistItem[];
  error?: any;
};

type VideoItem = {
  id: string;
  snippet?: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      high?: { url: string };
      default?: { url: string };
    };
    tags?: string[];
  };
  contentDetails?: {
    duration: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
};

type VideoResponse = {
  items?: VideoItem[];
  error?: any;
};

export type PlaylistVideo = {
  videoId: string;
  url: string;
  title: string;
  description: string;
  channelName: string;
  thumbnailUrl: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  uploadedAt: string;
  duration: string;
  durationSeconds: number;
};

export type PlaylistDataResponse = {
  items: PlaylistVideo[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)$/i);
  if (!match) return 0;
  const hours = Number(match[1] ?? "0");
  const minutes = Number(match[2] ?? "0");
  const seconds = Number(match[3] ?? "0");
  return hours * 3600 + minutes * 60 + seconds;
}

// Fallback logic for YouTube API keys
async function fetchWithFailover(urlTemplate: (key: string) => string): Promise<any> {
  let key = getNextApiKey();
  if (!key) throw new Error("No YouTube API keys available or all quotas exceeded.");

  while (key) {
    const res = await fetch(urlTemplate(key), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    
    if (res.ok) {
      return await res.json();
    }

    if (res.status === 403 || res.status === 400) {
      await res.json().catch(() => ({})); // consume body
      reportQuotaExceeded(key);
      key = getNextApiKey();
      if (key) continue;
    }
    
    throw new Error(`YouTube API request failed: ${res.status}`);
  }
  throw new Error("YouTube API quota exceeded across all available keys.");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main route
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("url") || searchParams.get("list");

    if (!target) {
      return NextResponse.json({ error: "Missing playlist url or list ID" }, { status: 400 });
    }

    // Extract playlist ID
    let playlistId = target;
    const listMatch = target.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (listMatch) {
      playlistId = listMatch[1];
    } else {
      // Sometimes people just paste the raw ID
      if (target.includes("/")) {
        return NextResponse.json({ error: "Invalid YouTube playlist URL." }, { status: 400 });
      }
    }

    // Phase 1: Fetch all video IDs in the playlist (up to 500)
    let videoIds: string[] = [];
    let nextPageToken: string | undefined = undefined;
    const maxPages = 10; // 500 videos max
    let pageCount = 0;

    do {
      const payload: PlaylistItemResponse = await fetchWithFailover((key) => {
        const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
        url.searchParams.set("part", "contentDetails");
        url.searchParams.set("playlistId", playlistId);
        url.searchParams.set("maxResults", "50");
        url.searchParams.set("key", key);
        if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);
        return url.toString();
      });

      if (!payload.items) break;

      for (const item of payload.items) {
        if (item.contentDetails?.videoId) {
          videoIds.push(item.contentDetails.videoId);
        }
      }

      nextPageToken = payload.nextPageToken;
      pageCount++;
    } while (nextPageToken && pageCount < maxPages);

    if (videoIds.length === 0) {
      return NextResponse.json({ error: "Playlist is empty or does not exist." }, { status: 404 });
    }

    // Phase 2: Fetch video details (durations and titles) in chunks of 50
    const playlistVideos: PlaylistVideo[] = [];

    // Chunk array helper
    const chunkArray = (arr: string[], size: number) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    const chunks = chunkArray(videoIds, 50);

    for (const chunk of chunks) {
      const idsParam = chunk.join(",");
      const payload: VideoResponse = await fetchWithFailover((key) => {
        const url = new URL("https://www.googleapis.com/youtube/v3/videos");
        url.searchParams.set("part", "snippet,contentDetails,statistics");
        url.searchParams.set("id", idsParam);
        url.searchParams.set("key", key);
        return url.toString();
      });

      if (payload.items) {
        for (const item of payload.items) {
          const duration = item.contentDetails?.duration || "PT0S";
          playlistVideos.push({
            videoId: item.id,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            title: item.snippet?.title || "Unknown Title",
            description: item.snippet?.description || "",
            channelName: item.snippet?.channelTitle || "",
            thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || "",
            tags: item.snippet?.tags || [],
            views: Number(item.statistics?.viewCount || 0),
            likes: Number(item.statistics?.likeCount || 0),
            comments: Number(item.statistics?.commentCount || 0),
            uploadedAt: item.snippet?.publishedAt || "",
            duration,
            durationSeconds: parseDurationToSeconds(duration),
          });
        }
      }
    }

    return NextResponse.json({ items: playlistVideos });
  } catch (error: any) {
    console.error("Playlist fetch error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to fetch playlist data." }, { status: 500 });
  }
}
