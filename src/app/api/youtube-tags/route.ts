import type { NextRequest } from "next/server";
import { generateYouTubeTags, type YouTubeSerpVideo } from "@/lib/youtube-tags";

export const dynamic = "force-dynamic";

type SuggestResponse = [string, string[]] | [string, string[], ...unknown[]];

const YOUTUBE_HEADERS = {
  Accept: "text/html,application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

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

    if (!response.ok) {
      return [] as string[];
    }

    const payload = (await response.json()) as SuggestResponse | unknown;

    return Array.isArray(payload) && Array.isArray(payload[1])
      ? payload[1].filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [] as string[];
  }
}

function extractSearchVideoIds(html: string, limit: number) {
  const pattern = /videoId\\x22:\\x22([A-Za-z0-9_-]{11})\\x22/g;
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(pattern)) {
    const videoId = match[1];

    if (!videoId || seen.has(videoId)) {
      continue;
    }

    seen.add(videoId);
    ids.push(videoId);

    if (ids.length >= limit) {
      break;
    }
  }

  return ids;
}

function decodeJsonString(raw: string) {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return raw;
  }
}

function extractWatchSignals(html: string, videoId: string, rank: number): YouTubeSerpVideo | null {
  const titleMatch = html.match(
    /"videoId":"[A-Za-z0-9_-]{11}","title":"((?:[^"\\]|\\.)+)","lengthSeconds":"/
  );
  const keywordsMatch = html.match(/"keywords":(\[[^\]]*\])/);

  if (!keywordsMatch) {
    return null;
  }

  try {
    const keywords = JSON.parse(keywordsMatch[1]) as unknown;

    if (!Array.isArray(keywords)) {
      return null;
    }

    return {
      videoId,
      title: titleMatch ? decodeJsonString(titleMatch[1]) : "",
      keywords: keywords.filter((item): item is string => typeof item === "string"),
      rank,
    };
  } catch {
    return null;
  }
}

async function fetchSearchResultVideos(keyword: string) {
  const searchUrl = new URL("https://www.youtube.com/results");
  searchUrl.searchParams.set("search_query", keyword);
  searchUrl.searchParams.set("hl", "en");

  try {
    const searchResponse = await fetch(searchUrl, {
      cache: "no-store",
      headers: YOUTUBE_HEADERS,
    });

    if (!searchResponse.ok) {
      return [] as YouTubeSerpVideo[];
    }

    const searchHtml = await searchResponse.text();
    const videoIds = extractSearchVideoIds(searchHtml, 6);

    const watchResults = await Promise.all(
      videoIds.map(async (videoId, index) => {
        try {
          const watchUrl = new URL("https://www.youtube.com/watch");
          watchUrl.searchParams.set("v", videoId);
          watchUrl.searchParams.set("hl", "en");

          const watchResponse = await fetch(watchUrl, {
            cache: "no-store",
            headers: YOUTUBE_HEADERS,
          });

          if (!watchResponse.ok) {
            return null;
          }

          const watchHtml = await watchResponse.text();
          return extractWatchSignals(watchHtml, videoId, index);
        } catch {
          return null;
        }
      })
    );

    return watchResults.filter((item): item is YouTubeSerpVideo => item !== null);
  } catch {
    return [] as YouTubeSerpVideo[];
  }
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword")?.trim() ?? "";
  const seed = Number.parseInt(request.nextUrl.searchParams.get("seed") ?? "0", 10) || 0;

  if (!keyword) {
    return Response.json(
      { error: "Enter a main keyword to generate tags." },
      { status: 400 }
    );
  }

  const queries = buildAutocompleteQueries(keyword);
  const [suggestionGroups, serpVideos] = await Promise.all([
    Promise.all(queries.map((query) => fetchSuggestionSet(query))),
    fetchSearchResultVideos(keyword),
  ]);
  const autocompleteSuggestions = suggestionGroups.reduce<string[]>(
    (allSuggestions, group) => allSuggestions.concat(group),
    []
  );

  return Response.json(
    generateYouTubeTags(keyword, {
      seed,
      autocompleteSuggestions,
      serpVideos,
    })
  );
}

