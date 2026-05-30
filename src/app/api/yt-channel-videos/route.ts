import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/youtube-cache";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveChannelTarget(input: string): { type: "id" | "handle"; value: string } {
  const t = input.trim();
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://www.youtube.com/${t}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel" && parts[1]) return { type: "id", value: parts[1] };
    if (parts[0]?.startsWith("@")) return { type: "handle", value: parts[0] };
    if (parts[0] === "c" || parts[0] === "user") return { type: "handle", value: parts[1] ?? "" };
  } catch { /* ignored */ }
  return { type: "handle", value: t.startsWith("@") ? t : `@${t.replace(/^@/, "")}` };
}

async function resolveChannelId(target: { type: "id" | "handle"; value: string }, key: string): Promise<string | null> {
  if (target.type === "id") return target.value;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(target.value)}&maxResults=1&key=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) return null;
  return data.items?.[0]?.id?.channelId ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("target")?.trim() ?? "";
  const maxResults = Math.min(Number(searchParams.get("max") ?? "50"), 50);

  if (!input) {
    return NextResponse.json({ error: "Paste a YouTube channel URL or @handle." }, { status: 400 });
  }

  const target = resolveChannelTarget(input);
  const cacheKey = `channel_videos_${target.value}_${maxResults}`;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    let key = getNextApiKey();
    if (!key) {
      return NextResponse.json({ error: "YouTube API quota reached. Try again later." }, { status: 503 });
    }

    const channelId = await resolveChannelId(target, key);
    if (!channelId) {
      return NextResponse.json({ error: "Channel not found." }, { status: 404 });
    }

    // Get channel uploads playlist
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=contentDetails,snippet&key=${key}`,
      { cache: "no-store" }
    );
    const channelData = await channelRes.json();
    if (!channelRes.ok) {
      if (channelRes.status === 403 && channelData.error?.errors?.[0]?.reason === "quotaExceeded") {
        reportQuotaExceeded(key);
      }
      return NextResponse.json({ error: "Unable to fetch channel data." }, { status: 502 });
    }

    const channel = channelData.items?.[0];
    const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;
    const channelTitle = channel?.snippet?.title ?? "";

    if (!uploadsPlaylistId) {
      return NextResponse.json({ error: "Could not find uploads playlist for this channel." }, { status: 404 });
    }

    // Fetch videos from uploads playlist
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${maxResults}&key=${key}`,
      { cache: "no-store" }
    );
    const videosData = await videosRes.json();
    if (!videosRes.ok) {
      return NextResponse.json({ error: "Unable to fetch channel videos." }, { status: 502 });
    }

    const videos = (videosData.items ?? []).map((item: any) => {
      const videoId = item.snippet?.resourceId?.videoId ?? "";
      return {
        videoId,
        title: item.snippet?.title ?? "",
        publishedAt: item.snippet?.publishedAt ?? "",
        thumbnail: item.snippet?.thumbnails?.medium?.url ?? "",
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    });

    const payload = {
      channelId,
      channelTitle,
      totalFetched: videos.length,
      videos,
    };

    await setCachedData(cacheKey, payload, 3600);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Unable to fetch channel videos right now." }, { status: 502 });
  }
}
