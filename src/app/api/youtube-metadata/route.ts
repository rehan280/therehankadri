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

type YouTubeMetadata = {
  videoId: string;
  url: string;
  title: string;
  description: string;
  channelName: string;
  channelUrl: string;
  durationSeconds: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  uploadDate: string;
  tags: string[];
  hashtags: string[];
  timestamps: string[];
};

type OEmbedResponse = {
  author_name?: string;
  author_url?: string;
  title?: string;
};

type YouTubeVideoApiResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      description?: string;
      channelTitle?: string;
      channelId?: string;
      publishedAt?: string;
      tags?: string[];
    };
    contentDetails?: {
      duration?: string;
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
  }>;
};

function getVideoId(rawUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  if (!host.endsWith("youtube.com")) {
    return null;
  }

  if (parsedUrl.pathname === "/watch") {
    return parsedUrl.searchParams.get("v");
  }

  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
  if (["shorts", "embed", "live"].includes(pathParts[0] ?? "")) {
    return pathParts[1] ?? null;
  }

  return null;
}

function extractJsonObject(source: string, marker: string) {
  const markerIndex = source.indexOf(marker);

  if (markerIndex < 0) {
    return null;
  }

  const objectStart = source.indexOf("{", markerIndex + marker.length);
  if (objectStart < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = objectStart; index < source.length; index += 1) {
    const character = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (character === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(objectStart, index + 1);
      }
    }
  }

  return null;
}

function safeParseJson<T>(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCount(value: string) {
  const trimmedValue = value.trim().replace(/,/g, "");

  if (/[KMB]$/i.test(trimmedValue)) {
    return trimmedValue.toUpperCase();
  }

  return /^\d+$/.test(trimmedValue) ? trimmedValue : "";
}

function findFirstCount(source: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    const value = match?.[1] ? normalizeCount(match[1]) : "";

    if (value) {
      return value;
    }
  }

  return "";
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
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

function getMicroformatValue(playerResponse: Record<string, unknown>, key: string) {
  const microformat = playerResponse.microformat as
    | { playerMicroformatRenderer?: Record<string, unknown> }
    | undefined;
  const renderer = microformat?.playerMicroformatRenderer;

  return normalizeText(renderer?.[key]);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractMetaContent(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const content = match?.[1] ? decodeHtmlEntities(match[1]) : "";

    if (content) {
      return content;
    }
  }

  return "";
}

function parseIsoDurationToSeconds(value: string) {
  const match = value.match(/^P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)$/i);

  if (!match) {
    return "";
  }

  const hours = Number(match[1] ?? "0");
  const minutes = Number(match[2] ?? "0");
  const seconds = Number(match[3] ?? "0");
  const total = hours * 3600 + minutes * 60 + seconds;

  return total > 0 ? String(total) : "";
}

async function fetchYouTubeDataApiMetadata(videoId: string) {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const apiUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  apiUrl.searchParams.set("id", videoId);
  apiUrl.searchParams.set("part", "snippet,contentDetails,statistics");
  apiUrl.searchParams.set("key", apiKey);

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as YouTubeVideoApiResponse;
    const item = payload.items?.[0];
    const snippet = item?.snippet;

    if (!item || !snippet?.title) {
      return null;
    }

    const description = normalizeText(snippet.description);
    const tags = Array.isArray(snippet.tags)
      ? uniqueValues(snippet.tags.filter((tag): tag is string => typeof tag === "string"))
      : [];

    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: normalizeText(snippet.title),
      description,
      channelName: normalizeText(snippet.channelTitle),
      channelUrl: snippet.channelId
        ? `https://www.youtube.com/channel/${snippet.channelId}`
        : "",
      durationSeconds: parseIsoDurationToSeconds(
        normalizeText(item.contentDetails?.duration)
      ),
      viewCount: normalizeCount(normalizeText(item.statistics?.viewCount)),
      likeCount: normalizeCount(normalizeText(item.statistics?.likeCount)),
      commentCount: normalizeCount(normalizeText(item.statistics?.commentCount)),
      uploadDate: normalizeText(snippet.publishedAt),
      tags,
      hashtags: getHashtags(description, tags),
      timestamps: getTimestamps(description),
    } satisfies YouTubeMetadata;
  } catch {
    return null;
  }
}

async function fetchOEmbedMetadata(videoUrl: string) {
  const oEmbedUrl = new URL("https://www.youtube.com/oembed");
  oEmbedUrl.searchParams.set("url", videoUrl);
  oEmbedUrl.searchParams.set("format", "json");

  try {
    const response = await fetch(oEmbedUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": YOUTUBE_HEADERS["User-Agent"],
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as OEmbedResponse;
  } catch {
    return null;
  }
}

function buildMetadataFromFallback(
  html: string,
  videoId: string,
  oEmbed: OEmbedResponse | null
): YouTubeMetadata | null {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const title =
    extractMetaContent(html, [
      /<meta\s+property="og:title"\s+content="([^"]*)"/i,
      /<meta\s+name="title"\s+content="([^"]*)"/i,
      /<meta\s+itemprop="name"\s+content="([^"]*)"/i,
      /<title>([^<]+)<\/title>/i,
    ]) ||
    normalizeText(oEmbed?.title).replace(/\s*-\s*YouTube\s*$/i, "");

  if (!title || /consent|before you continue/i.test(title)) {
    return null;
  }

  const description =
    extractMetaContent(html, [
      /<meta\s+property="og:description"\s+content="([^"]*)"/i,
      /<meta\s+name="description"\s+content="([^"]*)"/i,
      /<meta\s+itemprop="description"\s+content="([^"]*)"/i,
    ]) || "";

  const channelName =
    extractMetaContent(html, [
      /<link\s+itemprop="name"\s+content="([^"]*)"/i,
      /<meta\s+itemprop="author"\s+content="([^"]*)"/i,
    ]) || normalizeText(oEmbed?.author_name);

  const channelUrl =
    extractMetaContent(html, [
      /<link\s+itemprop="url"\s+href="([^"]*\/channel\/[^"]*)"/i,
      /<link\s+itemprop="url"\s+href="([^"]*\/@[^"]*)"/i,
    ]) || normalizeText(oEmbed?.author_url);

  const durationSeconds = parseIsoDurationToSeconds(
    extractMetaContent(html, [/<meta\s+itemprop="duration"\s+content="([^"]*)"/i])
  );

  const viewCount =
    normalizeCount(
      extractMetaContent(html, [
        /<meta\s+itemprop="interactionCount"\s+content="([^"]*)"/i,
        /<meta\s+property="og:video:view_count"\s+content="([^"]*)"/i,
      ])
    ) || findFirstCount(html, [/"viewCount"\s*:\s*"([\d,\.]+)"/i]);

  const uploadDate = extractMetaContent(html, [
    /<meta\s+itemprop="datePublished"\s+content="([^"]*)"/i,
    /<meta\s+itemprop="uploadDate"\s+content="([^"]*)"/i,
    /<meta\s+property="og:video:release_date"\s+content="([^"]*)"/i,
  ]);

  return {
    videoId,
    url,
    title,
    description,
    channelName,
    channelUrl,
    durationSeconds,
    viewCount,
    likeCount: "",
    commentCount: "",
    uploadDate,
    tags: [],
    hashtags: getHashtags(description, []),
    timestamps: getTimestamps(description),
  };
}

function extractPlayerResponse(html: string) {
  return (
    safeParseJson<Record<string, unknown>>(extractJsonObject(html, "ytInitialPlayerResponse")) ??
    safeParseJson<Record<string, unknown>>(
      extractJsonObject(html, "var ytInitialPlayerResponse =")
    ) ??
    safeParseJson<Record<string, unknown>>(
      extractJsonObject(html, "window[\"ytInitialPlayerResponse\"] =")
    )
  );
}

async function fetchYouTubeHtml(videoId: string) {
  const candidates = [
    `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&hl=en&gl=US&has_verified=1&bpctr=9999999999`,
    `https://m.youtube.com/watch?v=${encodeURIComponent(videoId)}&hl=en&gl=US&has_verified=1&bpctr=9999999999`,
    `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?hl=en&gl=US`,
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: YOUTUBE_HEADERS,
      });

      if (!response.ok) {
        continue;
      }

      const html = await response.text();

      if (
        html.includes("ytInitialPlayerResponse") ||
        html.includes("var ytInitialPlayerResponse =") ||
        html.includes('window["ytInitialPlayerResponse"] =')
      ) {
        return html;
      }
    } catch {
      continue;
    }
  }

  return "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputUrl = searchParams.get("url")?.trim() ?? "";
  const videoId = getVideoId(inputUrl);

  if (!videoId) {
    return NextResponse.json(
      { error: "Paste a valid YouTube video or Shorts URL." },
      { status: 400 }
    );
  }

  try {
    const canonicalVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const apiPayload = await fetchYouTubeDataApiMetadata(videoId);

    if (apiPayload) {
      return NextResponse.json(apiPayload, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    const html = await fetchYouTubeHtml(videoId);
    const oEmbed = await fetchOEmbedMetadata(canonicalVideoUrl);

    if (!html) {
      const fallbackPayload = buildMetadataFromFallback("", videoId, oEmbed);

      if (fallbackPayload) {
        return NextResponse.json(fallbackPayload, {
          headers: {
            "Cache-Control": "no-store",
          },
        });
      }

      throw new Error("YouTube did not return a readable public video page.");
    }

    const playerResponse = extractPlayerResponse(html);
    const readablePlayerResponse = playerResponse ?? {};

    const videoDetails = readablePlayerResponse.videoDetails as
      | Record<string, unknown>
      | undefined;

    if (!videoDetails) {
      const fallbackPayload = buildMetadataFromFallback(html, videoId, oEmbed);

      if (fallbackPayload) {
        return NextResponse.json(fallbackPayload, {
          headers: {
            "Cache-Control": "no-store",
          },
        });
      }

      return NextResponse.json(
        { error: "Could not read metadata from this YouTube page." },
        { status: 422 }
      );
    }

    const title = normalizeText(videoDetails.title);
    const description = normalizeText(videoDetails.shortDescription);
    const tags = Array.isArray(videoDetails.keywords)
      ? uniqueValues(videoDetails.keywords.filter((tag): tag is string => typeof tag === "string"))
      : [];

    if (!title) {
      return NextResponse.json(
        { error: "This video does not expose metadata publicly." },
        { status: 422 }
      );
    }

    const payload: YouTubeMetadata = {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title,
      description,
      channelName: normalizeText(videoDetails.author),
      channelUrl: getMicroformatValue(readablePlayerResponse, "ownerProfileUrl"),
      durationSeconds: normalizeText(videoDetails.lengthSeconds),
      viewCount: normalizeText(videoDetails.viewCount),
      likeCount: findFirstCount(html, [
        /"likeCount"\s*:\s*"([\d,\.]+)"/,
        /"defaultText"\s*:\s*\{"accessibility"\s*:\s*\{"accessibilityData"\s*:\s*\{"label"\s*:\s*"([\d,\.]+)\s+likes?"/i,
        /"accessibilityData"\s*:\s*\{"label"\s*:\s*"([\d,\.]+)\s+likes?"/i,
      ]),
      commentCount: findFirstCount(html, [
        /"commentCount"\s*:\s*"([\d,\.]+)"/,
        /"commentsCount"\s*:\s*"([\d,\.]+)"/,
        /"contextualInfo"\s*:\s*\{"runs"\s*:\s*\[\{"text"\s*:\s*"([\d,\.]+)\s+Comments?"/i,
        /"text"\s*:\s*"([\d,\.]+)\s+Comments?"/i,
        /"panelIdentifier"\s*:\s*"engagement-panel-comments-section"[\s\S]{0,700}?"contextualInfo"\s*:\s*\{"runs"\s*:\s*\[\{"text"\s*:\s*"([\d,.]+[KMB]?)/i,
        /Comments\\x22,\\x22subtitle\\x22:\\x22([\d,.]+[KMB]?)/i,
      ]),
      uploadDate: getMicroformatValue(readablePlayerResponse, "uploadDate"),
      tags,
      hashtags: getHashtags(description, tags),
      timestamps: getTimestamps(description),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to extract this video right now. Try another public YouTube URL." },
      { status: 502 }
    );
  }
}
