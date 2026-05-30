import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/youtube-cache";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getVideoId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (!host.endsWith("youtube.com")) return null;
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    if (["shorts", "embed", "live"].includes(parts[0] ?? "")) return parts[1] ?? null;
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url")?.trim() ?? "";
  const maxResults = Math.min(Number(searchParams.get("max") ?? "100"), 100);
  const videoId = getVideoId(videoUrl) ?? (/^[A-Za-z0-9_-]{11}$/.test(videoUrl) ? videoUrl : null);

  if (!videoId) {
    return NextResponse.json({ error: "Paste a valid YouTube video URL." }, { status: 400 });
  }

  const cacheKey = `comments_export_${videoId}_${maxResults}`;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    let key = getNextApiKey();
    if (!key) {
      return NextResponse.json({ error: "YouTube API quota reached. Try again later." }, { status: 503 });
    }

    const comments: { author: string; text: string; likes: string; publishedAt: string }[] = [];
    let pageToken = "";

    while (comments.length < maxResults && key) {
      const url = `https://www.googleapis.com/youtube/v3/commentThreads?videoId=${videoId}&part=snippet&maxResults=100&order=relevance${pageToken ? `&pageToken=${pageToken}` : ""}&key=${key}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          if (data.error?.errors?.[0]?.reason === "quotaExceeded") {
            reportQuotaExceeded(key);
            key = getNextApiKey();
            continue;
          }
          // Comments may be disabled
          if (data.error?.errors?.[0]?.reason === "commentsDisabled") {
            return NextResponse.json({ error: "Comments are disabled for this video." }, { status: 403 });
          }
        }
        break;
      }

      for (const item of data.items ?? []) {
        const snippet = item.snippet?.topLevelComment?.snippet;
        if (!snippet) continue;
        comments.push({
          author: snippet.authorDisplayName ?? "",
          text: snippet.textDisplay ?? "",
          likes: String(snippet.likeCount ?? 0),
          publishedAt: snippet.publishedAt ?? "",
        });
        if (comments.length >= maxResults) break;
      }

      pageToken = data.nextPageToken ?? "";
      if (!pageToken) break;
    }

    if (!comments.length) {
      return NextResponse.json({ error: "No comments found for this video." }, { status: 404 });
    }

    const payload = { videoId, totalFetched: comments.length, comments };
    await setCachedData(cacheKey, payload, 1800);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Unable to fetch comments right now." }, { status: 502 });
  }
}
