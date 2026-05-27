import { NextResponse } from "next/server";
import { getCachedData, setCachedData, logApiMetric } from "@/lib/youtube-cache";
import { generateYouTubeTags, type YouTubeSerpVideo } from "@/lib/youtube-tags";
import { Innertube, UniversalCache } from "youtubei.js";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildAutocompleteQueries(keyword: string) {
  const cleanedKeyword = keyword.trim();
  const normalized = cleanedKeyword.toLowerCase();
  const currentYear = new Date().getFullYear();
  const queries = [
    cleanedKeyword,
    normalized.startsWith("how to ") ? cleanedKeyword : `how to ${cleanedKeyword}`,
    normalized.includes("tutorial") ? cleanedKeyword : `${cleanedKeyword} tutorial`,
    normalized.includes("tips") ? cleanedKeyword : `${cleanedKeyword} tips`,
    normalized.startsWith("best ") ? cleanedKeyword : `best ${cleanedKeyword}`,
    normalized.startsWith("why ") ? cleanedKeyword : `why ${cleanedKeyword}`,
    `${cleanedKeyword} ${currentYear}`,
  ];
  return [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
}

async function fetchSuggestionSet(query: string) {
  const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(suggestUrl, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload) && Array.isArray(payload[1]) ? payload[1] : [];
  } catch {
    return [];
  }
}

// Unofficial Scraper for Tags
async function fetchSerpVideosUnofficial(keyword: string): Promise<YouTubeSerpVideo[] | null> {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const search = await yt.search(keyword, { type: "video" });
    if (!search.videos || search.videos.length === 0) return null;

    const topVideos = search.videos.slice(0, 6);
    const watchResults = await Promise.all(
      topVideos.map(async (v: any, index: number) => {
        try {
          const info = await yt.getBasicInfo(v.id);
          return {
            videoId: v.id,
            title: info.basic_info.title || "",
            keywords: info.basic_info.keywords || [],
            rank: index,
          };
        } catch {
          return null;
        }
      })
    );

    const valid = watchResults.filter((v): v is YouTubeSerpVideo => v !== null);
    return valid.length > 0 ? valid : null;
  } catch {
    return null;
  }
}

// Official API Fallback for Tags
async function fetchSerpVideosOfficial(keyword: string): Promise<YouTubeSerpVideo[] | null> {
  let key = getNextApiKey();
  if (!key) return null;

  while (key) {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(keyword)}&type=video&maxResults=6&key=${key}`;
      const searchRes = await fetch(searchUrl, { cache: "no-store" });
      const searchData = await searchRes.json();

      if (searchRes.status === 403 && searchData.error?.errors?.[0]?.reason === "quotaExceeded") {
        reportQuotaExceeded(key);
        key = getNextApiKey();
        continue;
      }

      if (!searchRes.ok || !searchData.items?.length) return null;

      const videoIds = searchData.items.map((i: any) => i.id.videoId).join(",");
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=snippet&key=${key}`;
      const videosRes = await fetch(videosUrl, { cache: "no-store" });
      const videosData = await videosRes.json();

      if (!videosRes.ok) return null;

      const results = (videosData.items || []).map((item: any, index: number) => ({
        videoId: item.id,
        title: item.snippet?.title || "",
        keywords: item.snippet?.tags || [],
        rank: index,
      }));

      return results.length ? results : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const seed = Number.parseInt(searchParams.get("seed") ?? "0", 10) || 0;

  if (!keyword) {
    return NextResponse.json({ error: "Enter a main keyword to generate tags." }, { status: 400 });
  }

  const cacheKey = `tags_${crypto.createHash('md5').update(keyword + seed).digest('hex')}`;
  let isCached = false;
  let statusCode = 200;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      isCached = true;
      logApiMetric({ toolSlug: "youtube-tags", endpoint: "/api/youtube-tags", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    const queries = buildAutocompleteQueries(keyword);
    
    // Concurrently fetch suggestions and SERP
    const [suggestionGroups, serpVideosUnofficial] = await Promise.all([
      Promise.all(queries.map((query) => fetchSuggestionSet(query))),
      fetchSerpVideosUnofficial(keyword),
    ]);

    let serpVideos = serpVideosUnofficial;
    if (!serpVideos) {
      serpVideos = await fetchSerpVideosOfficial(keyword);
    }

    const autocompleteSuggestions = suggestionGroups.reduce<string[]>(
      (allSuggestions, group) => allSuggestions.concat(group),
      []
    );

    const payload = generateYouTubeTags(keyword, {
      seed,
      autocompleteSuggestions,
      serpVideos: serpVideos || [],
    });

    // Cache tags for 7 days (604800s)
    await setCachedData(cacheKey, payload, 604800);

    logApiMetric({ toolSlug: "youtube-tags", endpoint: "/api/youtube-tags", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json(payload);

  } catch (error) {
    statusCode = 500;
    logApiMetric({ toolSlug: "youtube-tags", endpoint: "/api/youtube-tags", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json({ error: "Unable to generate tags right now. Try again later." }, { status: 500 });
  }
}
