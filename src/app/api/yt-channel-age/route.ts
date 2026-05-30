import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/youtube-cache";
import { Innertube, UniversalCache } from "youtubei.js";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveChannelTarget(input: string): string {
  const t = input.trim();
  if (!t) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://www.youtube.com/${t}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel" && parts[1]) return `channel/${parts[1]}`;
    if (parts[0]?.startsWith("@")) return parts[0];
    if (parts[0] === "c" || parts[0] === "user") return parts[1] || "";
  } catch { /* ignored */ }
  return t.startsWith("@") ? t : `@${t.replace(/^@/, "")}`;
}

async function fetchViaOfficial(channelPath: string) {
  let key = getNextApiKey();
  if (!key) return null;

  // Try to get channel ID from path
  const channelIdMatch = channelPath.match(/^channel\/(UC[A-Za-z0-9_-]{22})$/);
  const channelId = channelIdMatch?.[1] ?? null;

  while (key) {
    try {
      // If we have a direct channel ID, use videos list to get snippet with channelId
      const searchUrl = channelId
        ? `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet,statistics&key=${key}`
        : `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelPath)}&maxResults=1&key=${key}`;

      const res = await fetch(searchUrl, { cache: "no-store" });
      const data = await res.json();

      if (res.ok) {
        let finalChannelId = channelId;
        
        if (!channelId) {
          const channel = data.items?.[0];
          if (!channel) return null;
          finalChannelId = channel.id?.channelId ?? channel.snippet?.channelId ?? "";
          
          if (!finalChannelId) return null;
          
          // Make a secondary call to get statistics now that we have the ID
          const statsUrl = `https://www.googleapis.com/youtube/v3/channels?id=${finalChannelId}&part=snippet,statistics&key=${key}`;
          const statsRes = await fetch(statsUrl, { cache: "no-store" });
          const statsData = await statsRes.json();
          if (statsRes.ok && statsData.items?.[0]) {
             const item = statsData.items[0];
             return {
                channelId: finalChannelId,
                title: item.snippet?.title ?? "",
                description: item.snippet?.description ?? "",
                publishedAt: item.snippet?.publishedAt ?? "",
                thumbnail: item.snippet?.thumbnails?.default?.url ?? "",
                subscriberCount: item.statistics?.subscriberCount ?? "",
                videoCount: item.statistics?.videoCount ?? "",
                viewCount: item.statistics?.viewCount ?? "",
             };
          }
        }
        
        if (finalChannelId && channelId) { // Original direct ID path
          const item = data.items?.[0];
          if (!item) return null;
          return {
            channelId: finalChannelId,
            title: item.snippet?.title ?? "",
            description: item.snippet?.description ?? "",
            publishedAt: item.snippet?.publishedAt ?? "",
            thumbnail: item.snippet?.thumbnails?.default?.url ?? "",
            subscriberCount: item.statistics?.subscriberCount ?? "",
            videoCount: item.statistics?.videoCount ?? "",
            viewCount: item.statistics?.viewCount ?? "",
          };
        }
      }

      if (res.status === 403 && data.error?.errors?.[0]?.reason === "quotaExceeded") {
        reportQuotaExceeded(key);
        key = getNextApiKey();
        continue;
      }
      return null;
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchViaInnertube(channelPath: string) {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const resolved = await yt.resolveURL(`https://www.youtube.com/${channelPath}`);
    const browseId = resolved.payload?.browseId;
    if (!browseId) return null;

    const channel = await yt.getChannel(browseId);
    const metadata = channel.metadata;

    // Try to get creation date from header/about data
    const raw = JSON.stringify(channel);

    // Extract creation date from various locations
    let publishedAt = "";
    const dateMatch = raw.match(/"joinedDateText"[^}]*?"text"\s*:\s*"([^"]+)"/);
    if (dateMatch) {
      publishedAt = dateMatch[1];
    }

    return {
      channelId: browseId,
      title: metadata?.title ?? channel.title ?? "",
      description: metadata?.description ?? "",
      publishedAt,
      thumbnail: metadata?.thumbnail?.[0]?.url ?? "",
      subscriberCount: "",
      videoCount: "",
      viewCount: "",
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target")?.trim() ?? "";

  if (!target) {
    return NextResponse.json({ error: "Paste a YouTube channel URL or @handle." }, { status: 400 });
  }

  const channelPath = resolveChannelTarget(target);
  const cacheKey = `channel_age_${channelPath}`;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    let payload = await fetchViaOfficial(channelPath);
    if (!payload) {
      payload = await fetchViaInnertube(channelPath);
    }

    if (!payload) {
      return NextResponse.json({ error: "Could not fetch channel data. Try with a direct channel URL." }, { status: 422 });
    }

    await setCachedData(cacheKey, payload, 3600);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Unable to fetch channel age right now." }, { status: 502 });
  }
}
