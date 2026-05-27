import { NextResponse } from "next/server";
import { getCachedData, setCachedData, logApiMetric } from "@/lib/youtube-cache";
import { Innertube, UniversalCache } from "youtubei.js";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)$/i);
  if (!match) return 0;
  const hours = Number(match[1] ?? "0");
  const minutes = Number(match[2] ?? "0");
  const seconds = Number(match[3] ?? "0");
  return hours * 3600 + minutes * 60 + seconds;
}

// 1. Unofficial Fallback
async function fetchPlaylistUnofficial(playlistId: string): Promise<PlaylistVideo[] | null> {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const playlist = await yt.getPlaylist(playlistId);
    
    if (!playlist || !playlist.items) return null;

    // Load all items (up to 500)
    let currentItems = playlist.items;
    let hasContinuation = playlist.has_continuation;
    
    while (hasContinuation && currentItems.length < 500) {
      try {
        const next = await playlist.getContinuation();
        currentItems.push(...Array.from(next.items));
        hasContinuation = next.has_continuation;
      } catch {
        break; // Stop if continuation fails
      }
    }

    const videos: PlaylistVideo[] = currentItems.map((item: any) => ({
      videoId: item.id || "",
      url: `https://www.youtube.com/watch?v=${item.id}`,
      title: item.title?.text || "Unknown Title",
      description: "", // Playlist items usually don't have full descriptions
      channelName: item.author?.name || "",
      thumbnailUrl: item.thumbnails?.[0]?.url || "",
      tags: [],
      views: 0,
      likes: 0,
      comments: 0,
      uploadedAt: "",
      duration: item.duration?.text || "0:00",
      durationSeconds: item.duration?.seconds || 0,
    })).filter(v => v.videoId);

    return videos.length > 0 ? videos : null;
  } catch (err) {
    console.error("youtubei.js playlist error", err);
    return null;
  }
}

// 2. Official Fallback
async function fetchPlaylistOfficial(playlistId: string): Promise<PlaylistVideo[] | null> {
  let key = getNextApiKey();
  if (!key) return null;

  while (key) {
    try {
      let videoIds: string[] = [];
      let nextPageToken: string | undefined = undefined;
      const maxPages = 10;
      let pageCount = 0;

      do {
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${key}`;
        if (nextPageToken) url += `&pageToken=${nextPageToken}`;
        
        const res = await fetch(url, { cache: "no-store" });
        const payload = await res.json();

        if (res.status === 403 && payload.error?.errors?.[0]?.reason === "quotaExceeded") {
          reportQuotaExceeded(key);
          key = getNextApiKey();
          break; // outer while loop will catch the new key
        }

        if (!payload.items) break;

        for (const item of payload.items) {
          if (item.contentDetails?.videoId) videoIds.push(item.contentDetails.videoId);
        }

        nextPageToken = payload.nextPageToken;
        pageCount++;
      } while (nextPageToken && pageCount < maxPages);

      if (videoIds.length === 0) return null;

      const playlistVideos: PlaylistVideo[] = [];
      const chunks = [];
      for (let i = 0; i < videoIds.length; i += 50) chunks.push(videoIds.slice(i, i + 50));

      for (const chunk of chunks) {
        const idsParam = chunk.join(",");
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${idsParam}&key=${key}`;
        const res = await fetch(url, { cache: "no-store" });
        const payload = await res.json();

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

      return playlistVideos.length > 0 ? playlistVideos : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url") || searchParams.get("list");

  if (!target) {
    return NextResponse.json({ error: "Missing playlist url or list ID" }, { status: 400 });
  }

  let playlistId = target;
  const listMatch = target.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (listMatch) playlistId = listMatch[1];
  else if (target.includes("/")) return NextResponse.json({ error: "Invalid YouTube playlist URL." }, { status: 400 });

  const cacheKey = `playlist_${playlistId}`;
  let isCached = false;
  let statusCode = 200;

  try {
    const cached = await getCachedData<{ items: PlaylistVideo[] }>(cacheKey);
    if (cached) {
      isCached = true;
      logApiMetric({ toolSlug: "youtube-playlist", endpoint: "/api/youtube-playlist", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    let items = await fetchPlaylistUnofficial(playlistId);
    
    if (!items) {
      items = await fetchPlaylistOfficial(playlistId);
    }

    if (!items || items.length === 0) {
      statusCode = 404;
      logApiMetric({ toolSlug: "youtube-playlist", endpoint: "/api/youtube-playlist", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json({ error: "Playlist is empty or does not exist." }, { status: 404 });
    }

    const payload = { items };
    // Cache for 12 hours (43200s)
    await setCachedData(cacheKey, payload, 43200);

    logApiMetric({ toolSlug: "youtube-playlist", endpoint: "/api/youtube-playlist", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json(payload);

  } catch (error: any) {
    statusCode = 500;
    logApiMetric({ toolSlug: "youtube-playlist", endpoint: "/api/youtube-playlist", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json({ error: "Failed to fetch playlist data." }, { status: 500 });
  }
}
