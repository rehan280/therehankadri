import { NextResponse } from "next/server";
import { getCachedData, setCachedData, logApiMetric } from "@/lib/youtube-cache";
import { Innertube, UniversalCache } from "youtubei.js";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getVideoId(rawUrl: string) {
  let parsedUrl: URL;
  try { parsedUrl = new URL(rawUrl); } catch { return null; }
  const host = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtu.be") return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
  if (!host.endsWith("youtube.com")) return null;
  if (parsedUrl.pathname === "/watch") return parsedUrl.searchParams.get("v");
  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
  if (["shorts", "embed", "live"].includes(pathParts[0] ?? "")) return pathParts[1] ?? null;
  return null;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function getHashtags(description: string, tags: string[]) {
  const matches = description.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
  return uniqueValues([...matches, ...tags.filter((tag) => tag.startsWith("#"))]);
}

function getTimestamps(description: string) {
  const timestampPattern = /(?:^|\n)\s*((?:(?:\d{1,2}:)?\d{1,2}:\d{2})\s+[^\n]+)/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = timestampPattern.exec(description))) {
    matches.push(match[1].trim());
  }
  return uniqueValues(matches);
}

// 1. Unofficial youtubei.js
async function fetchViaUnofficial(videoId: string) {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const info = await yt.getBasicInfo(videoId);
    
    const details = info.basic_info;
    if (!details.title) return null;

    const description = details.short_description || "";
    const tags = details.keywords || [];

    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: details.title,
      description,
      channelName: details.author || "",
      channelUrl: details.channel_id ? `https://www.youtube.com/channel/${details.channel_id}` : "",
      durationSeconds: details.duration ? String(details.duration) : "",
      viewCount: details.view_count ? String(details.view_count) : "",
      likeCount: details.like_count ? String(details.like_count) : "",
      commentCount: "", // Basic info doesn't always have comments
      uploadDate: "", // Date not cleanly available in all basic_info
      tags,
      hashtags: getHashtags(description, tags),
      timestamps: getTimestamps(description),
      hasCaptions: false,
      isHD: false,
    };
  } catch (err) {
    console.error("Unofficial Metadata Error:", err);
    return null;
  }
}

// 2. Official Fallback
async function fetchViaOfficial(videoId: string) {
  let key = getNextApiKey();
  if (!key) return null;

  while (key) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${key}`;
      const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
      const data = await res.json();

      if (res.ok) {
        const item = data.items?.[0];
        if (!item || !item.snippet) return null;

        const description = item.snippet.description || "";
        const tags = item.snippet.tags || [];

        const parseIsoDurationToSeconds = (val: string) => {
          const match = val.match(/^P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)$/i);
          if (!match) return "";
          return String((Number(match[1]||0)*3600) + (Number(match[2]||0)*60) + Number(match[3]||0));
        };

        return {
          videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title: item.snippet.title,
          description,
          channelName: item.snippet.channelTitle,
          channelUrl: item.snippet.channelId ? `https://www.youtube.com/channel/${item.snippet.channelId}` : "",
          durationSeconds: parseIsoDurationToSeconds(item.contentDetails?.duration || ""),
          viewCount: item.statistics?.viewCount || "",
          likeCount: item.statistics?.likeCount || "",
          commentCount: item.statistics?.commentCount || "",
          uploadDate: item.snippet.publishedAt || "",
          tags,
          hashtags: getHashtags(description, tags),
          timestamps: getTimestamps(description),
          hasCaptions: item.contentDetails?.caption === "true",
          isHD: item.contentDetails?.definition === "hd",
        };
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

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const inputUrl = searchParams.get("url")?.trim() ?? "";
  const videoId = getVideoId(inputUrl);

  if (!videoId) {
    return NextResponse.json({ error: "Paste a valid YouTube video or Shorts URL." }, { status: 400 });
  }

  const cacheKey = `metadata_${videoId}`;
  let isCached = false;
  let statusCode = 200;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      isCached = true;
      logApiMetric({ toolSlug: "youtube-metadata", endpoint: "/api/youtube-metadata", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    // Unofficial
    let payload = await fetchViaUnofficial(videoId);
    
    // Official Fallback
    if (!payload) {
      payload = await fetchViaOfficial(videoId);
    }

    if (!payload) {
      statusCode = 422;
      logApiMetric({ toolSlug: "youtube-metadata", endpoint: "/api/youtube-metadata", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json({ error: "Could not read metadata from this YouTube video. It might be private or removed." }, { status: 422 });
    }

    // Cache for 24h (86400s)
    await setCachedData(cacheKey, payload, 86400);

    logApiMetric({ toolSlug: "youtube-metadata", endpoint: "/api/youtube-metadata", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json(payload);

  } catch (error) {
    statusCode = 502;
    logApiMetric({ toolSlug: "youtube-metadata", endpoint: "/api/youtube-metadata", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json({ error: "Unable to extract this video right now. Try another public YouTube URL." }, { status: 502 });
  }
}
