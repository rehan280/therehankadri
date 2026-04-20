import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

  const youtubeUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&hl=en&gl=US`;

  try {
    const response = await fetch(youtubeUrl, {
      cache: "no-store",
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "user-agent": "",
      },
    });

    if (!response.ok) {
      throw new Error("YouTube did not return a public video page.");
    }

    const html = await response.text();
    const playerResponse = safeParseJson<Record<string, unknown>>(
      extractJsonObject(html, "ytInitialPlayerResponse")
    );
    const readablePlayerResponse = playerResponse ?? {};

    const videoDetails = readablePlayerResponse.videoDetails as
      | Record<string, unknown>
      | undefined;

    if (!videoDetails) {
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
