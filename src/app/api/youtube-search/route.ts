import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const YOUTUBE_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Referer: "https://www.youtube.com/",
  "Sec-CH-UA": '"Google Chrome";v="135", "Chromium";v="135", "Not.A/Brand";v="24"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

export type VideoResult = {
  title: string;
  channel: string;
  views: string;
  published: string;
  videoId: string;
};

type YouTubeApiSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      channelTitle?: string;
      publishedAt?: string;
    };
  }>;
};

// ─── Official YouTube Data API v3 ───────────────────────────────────────────

async function callYouTubeApiWithKey(query: string, apiKey: string): Promise<VideoResult[] | null> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    // 403 = quota exceeded or key invalid → caller will try next key
    if (res.status === 403 || res.status === 400) return null;
    if (!res.ok) return null;

    const data = (await res.json()) as YouTubeApiSearchResponse;
    const results: VideoResult[] = [];

    for (const item of data.items ?? []) {
      const title = item.snippet?.title?.trim() ?? "";
      const videoId = item.id?.videoId?.trim() ?? "";
      if (!title || !videoId) continue;
      results.push({
        title,
        channel: item.snippet?.channelTitle?.trim() ?? "",
        views: "",
        published: item.snippet?.publishedAt?.slice(0, 10) ?? "",
        videoId,
      });
    }

    return results.length ? results : null;
  } catch {
    return null;
  }
}

import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

async function fetchViaApi(query: string): Promise<VideoResult[] | null> {
  const getUrl = (key: string) => {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "20");
    url.searchParams.set("relevanceLanguage", "en");
    url.searchParams.set("key", key);
    return url.toString();
  };

  let key = getNextApiKey();
  if (!key) return null;

  while (key) {
    try {
      const res = await fetch(getUrl(key), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const data = (await res.json()) as YouTubeApiSearchResponse;

      if (res.ok) {
        const results: VideoResult[] = [];
        for (const item of data.items ?? []) {
          const title = item.snippet?.title?.trim() ?? "";
          const videoId = item.id?.videoId?.trim() ?? "";
          if (!title || !videoId) continue;
          results.push({
            title,
            channel: item.snippet?.channelTitle?.trim() ?? "",
            views: "",
            published: item.snippet?.publishedAt?.slice(0, 10) ?? "",
            videoId,
          });
        }
        return results;
      }

      if (res.status === 403 && (data as any).error?.errors?.[0]?.reason === "quotaExceeded") {
        reportQuotaExceeded(key);
        key = getNextApiKey();
        if (key) continue;
      }
      
      return null;
    } catch {
      return null;
    }
  }
  return null;
}

// ─── HTML scraping fallback ──────────────────────────────────────────────────

function extractJsonObject(source: string, marker: string): string | null {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;

  const objectStart = source.indexOf("{", markerIndex + marker.length);
  if (objectStart < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = objectStart; i < source.length; i++) {
    const ch = source[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(objectStart, i + 1);
    }
  }

  return null;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function extractText(obj: unknown): string {
  if (typeof obj === "string") return obj.trim();
  if (Array.isArray(obj)) return (obj[0] as { text?: string })?.text?.trim() ?? "";
  return "";
}

function parseYtInitialData(html: string): VideoResult[] {
  const raw =
    extractJsonObject(html, "var ytInitialData =") ??
    extractJsonObject(html, "ytInitialData =") ??
    extractJsonObject(html, 'window["ytInitialData"] =');

  const data = safeParseJson<Record<string, unknown>>(raw);
  if (!data) return [];

  const results: VideoResult[] = [];

  try {
    // Primary path: twoColumnSearchResultsRenderer
    const primary = (
      data as {
        contents?: {
          twoColumnSearchResultsRenderer?: {
            primaryContents?: {
              sectionListRenderer?: {
                contents?: unknown[];
              };
            };
          };
        };
      }
    )?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;

    if (!Array.isArray(primary)) return results;

    for (const section of primary) {
      const sectionObj = section as Record<string, unknown>;

      // Standard: itemSectionRenderer
      const items = (
        sectionObj?.itemSectionRenderer as { contents?: unknown[] }
      )?.contents;
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        const itemObj = item as Record<string, unknown>;

        // Try direct videoRenderer, then richItemRenderer > videoRenderer
        const vr =
          (itemObj?.videoRenderer as Record<string, unknown>) ??
          (
            (itemObj?.richItemRenderer as { content?: { videoRenderer?: unknown } })
              ?.content?.videoRenderer as Record<string, unknown>
          );

        if (!vr?.videoId || typeof vr.videoId !== "string") continue;

        const title = extractText((vr.title as { runs?: unknown[] })?.runs);
        if (!title) continue;

        const channel = extractText((vr.ownerText as { runs?: unknown[] })?.runs);
        const views =
          (vr.viewCountText as { simpleText?: string })?.simpleText?.trim() ??
          (vr.shortViewCountText as { simpleText?: string })?.simpleText?.trim() ??
          "";
        const published =
          (vr.publishedTimeText as { simpleText?: string })?.simpleText?.trim() ?? "";

        results.push({ title, channel, views, published, videoId: vr.videoId });

        if (results.length >= 20) return results;
      }
    }
  } catch {
    // parsing failed
  }

  return results;
}

async function fetchViaScrape(query: string): Promise<VideoResult[]> {
  const candidates = [
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en&gl=US&has_verified=1`,
    `https://m.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en&gl=US`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store", headers: YOUTUBE_HEADERS });
      if (!res.ok) continue;
      const html = await res.text();
      const results = parseYtInitialData(html);
      if (results.length) return results;
    } catch {
      continue;
    }
  }

  return [];
}

// ─── Autocomplete Suggestions (Google Suggest API) ───────────────────────────

type SuggestResponse = [string, string[]] | [string, string[], ...unknown[]];

async function fetchSuggestionSet(query: string) {
  const suggestUrl = new URL("https://suggestqueries.google.com/complete/search");
  suggestUrl.searchParams.set("client", "firefox");
  suggestUrl.searchParams.set("ds", "yt");
  suggestUrl.searchParams.set("q", query);

  try {
    const response = await fetch(suggestUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) return [] as string[];

    const payload = (await response.json()) as SuggestResponse | unknown;

    return Array.isArray(payload) && Array.isArray(payload[1])
      ? payload[1].filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [] as string[];
  }
}

async function fetchAutocompleteSuggestions(keyword: string): Promise<string[]> {
  const normalized = keyword.trim().toLowerCase();
  const queries = [
    keyword,
    normalized.startsWith("how to ") ? keyword : `how to ${keyword}`,
    normalized.includes("best") ? keyword : `best ${keyword}`,
    normalized.includes("why") ? keyword : `why ${keyword}`,
    `${keyword} 2025`,
  ];

  const suggestionGroups = await Promise.all(
    queries.map((query) => fetchSuggestionSet(query))
  );
  
  const allSuggestions = suggestionGroups.reduce<string[]>(
    (acc, group) => acc.concat(group),
    []
  );

  return [...new Set(allSuggestions)].slice(0, 30);
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ error: "Query is required." }, { status: 400 });
  }

  try {
    const suggestionsPromise = fetchAutocompleteSuggestions(query);

    // 1. Try official API (if key is configured)
    let apiResults = await fetchViaApi(query);
    if (apiResults?.length) {
      const suggestions = await suggestionsPromise;
      return NextResponse.json(
        { videos: apiResults, suggestions, source: "api" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // 2. Fall back to scraping YouTube HTML
    const scraped = await fetchViaScrape(query);
    if (scraped.length) {
      const suggestions = await suggestionsPromise;
      return NextResponse.json(
        { videos: scraped, suggestions, source: "scrape" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { error: "YouTube returned no results for this query. Try a different keyword." },
      { status: 422 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to reach YouTube right now. Try again in a moment." },
      { status: 502 }
    );
  }
}
