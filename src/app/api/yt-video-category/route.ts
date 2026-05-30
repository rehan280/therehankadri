import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/youtube-cache";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getVideoId(urlOrId: string): string | null {
  const t = urlOrId.trim();
  if (!t) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return t;
  try {
    const url = new URL(t);
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v");
    if (url.hostname === "youtu.be") return url.pathname.slice(1);
    if (url.hostname.includes("youtube.com") && url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/")[2];
    }
  } catch {
    // If it's just a raw ID that somehow didn't match the regex but is valid
    return t.length >= 11 ? t.slice(0, 11) : null;
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("url")?.trim() ?? "";

  if (!input) {
    return NextResponse.json({ error: "Paste a YouTube video URL." }, { status: 400 });
  }

  const videoId = getVideoId(input);
  if (!videoId) {
    return NextResponse.json({ error: "Could not extract a valid YouTube video ID." }, { status: 400 });
  }

  const cacheKey = `video_category_${videoId}`;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    let key = getNextApiKey();
    if (!key) {
      return NextResponse.json({ error: "YouTube API quota reached. Try again later." }, { status: 503 });
    }

    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${key}`,
      { cache: "no-store" }
    );
    const videoData = await videoRes.json();

    if (!videoRes.ok) {
      if (videoRes.status === 403 && videoData.error?.errors?.[0]?.reason === "quotaExceeded") {
        reportQuotaExceeded(key);
      }
      return NextResponse.json({ error: "Unable to fetch video data." }, { status: 502 });
    }

    const item = videoData.items?.[0];
    if (!item) {
      return NextResponse.json({ error: "Video not found or is private." }, { status: 404 });
    }

    const title = item.snippet?.title ?? "";
    const categoryId = item.snippet?.categoryId ?? "";

    if (!categoryId) {
       return NextResponse.json({ error: "Video has no category." }, { status: 404 });
    }

    // Fetch the category name
    const categoryRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videoCategories?id=${categoryId}&part=snippet&key=${key}`,
      { cache: "no-store" }
    );
    const categoryData = await categoryRes.json();
    
    const categoryName = categoryData.items?.[0]?.snippet?.title ?? "Unknown Category";

    const payload = {
      videoId,
      title,
      categoryId,
      categoryName,
    };

    await setCachedData(cacheKey, payload, 86400 * 7); // Cache for a week
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Unable to fetch video category right now." }, { status: 502 });
  }
}
