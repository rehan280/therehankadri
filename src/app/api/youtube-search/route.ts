import { NextResponse } from "next/server";
import { getCachedData, setCachedData, logApiMetric } from "@/lib/youtube-cache";
import { Innertube, UniversalCache } from "youtubei.js";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type VideoResult = {
  title: string;
  channel: string;
  views: string;
  published: string;
  videoId: string;
};

// 1. Google Suggest (No quota)
async function fetchAutocompleteSuggestions(keyword: string): Promise<string[]> {
  const normalized = keyword.trim().toLowerCase();
  const queries = [
    keyword,
    normalized.startsWith("how to ") ? keyword : `how to ${keyword}`,
    normalized.includes("best") ? keyword : `best ${keyword}`,
    normalized.includes("why") ? keyword : `why ${keyword}`,
    `${keyword} 2025`,
  ];

  const fetchSet = async (q: string) => {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    } catch {
      return [];
    }
  };

  const groups = await Promise.all(queries.map(fetchSet));
  const allSuggestions = groups.reduce((acc, curr) => acc.concat(curr), []);
  return [...new Set(allSuggestions)].slice(0, 30);
}

// 2. youtubei.js (Quota Free)
async function searchViaUnofficial(query: string): Promise<VideoResult[] | null> {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const search = await yt.search(query, { type: "video" });
    
    if (!search.videos || search.videos.length === 0) return null;

    const results: VideoResult[] = search.videos.map((v: any) => ({
      title: v.title?.text || "",
      channel: v.author?.name || "",
      views: v.view_count?.text || "",
      published: v.published?.text || "",
      videoId: v.id || "",
    })).filter((v: VideoResult) => v.title && v.videoId);

    return results.length ? results.slice(0, 20) : null;
  } catch (err) {
    console.error("youtubei.js Search Error:", err);
    return null;
  }
}

// 3. Official API (Fallback)
async function searchViaOfficial(query: string): Promise<VideoResult[] | null> {
  let key = getNextApiKey();
  if (!key) return null;

  while (key) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&relevanceLanguage=en&key=${key}`;
      const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
      const data = await res.json();

      if (res.ok) {
        const results: VideoResult[] = (data.items || []).map((item: any) => ({
          title: item.snippet?.title || "",
          channel: item.snippet?.channelTitle || "",
          views: "",
          published: item.snippet?.publishedAt?.slice(0, 10) || "",
          videoId: item.id?.videoId || "",
        })).filter((v: VideoResult) => v.title && v.videoId);
        return results.length ? results : null;
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
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ error: "Query is required." }, { status: 400 });
  }

  const cacheKey = `search_${crypto.createHash('md5').update(query).digest('hex')}`;
  let isCached = false;
  let statusCode = 200;

  try {
    // Check Cache
    const cached = await getCachedData<{ videos: VideoResult[], suggestions: string[], source: string }>(cacheKey);
    if (cached) {
      isCached = true;
      logApiMetric({ toolSlug: "youtube-search", endpoint: "/api/youtube-search", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    // Fetch concurrent
    const suggestionsPromise = fetchAutocompleteSuggestions(query);
    
    // Try Unofficial First
    let videos = await searchViaUnofficial(query);
    let source = "youtubei.js";

    // Fallback to Official
    if (!videos) {
      videos = await searchViaOfficial(query);
      source = "official_api";
    }

    if (!videos || videos.length === 0) {
      statusCode = 404;
      logApiMetric({ toolSlug: "youtube-search", endpoint: "/api/youtube-search", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json({ error: "YouTube returned no results for this query. Try a different keyword." }, { status: 404 });
    }

    const suggestions = await suggestionsPromise;
    const responsePayload = { videos, suggestions, source };

    // Set Cache for 7 days (604800 seconds)
    await setCachedData(cacheKey, responsePayload, 604800);

    logApiMetric({ toolSlug: "youtube-search", endpoint: "/api/youtube-search", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json(responsePayload);

  } catch (error) {
    statusCode = 500;
    logApiMetric({ toolSlug: "youtube-search", endpoint: "/api/youtube-search", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json({ error: "Unable to reach YouTube right now. Try again in a moment." }, { status: 500 });
  }
}
