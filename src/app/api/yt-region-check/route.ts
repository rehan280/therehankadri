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

const YOUTUBE_CATEGORY_NAMES: Record<string, string> = {
  "1":  "Film & Animation",
  "2":  "Autos & Vehicles",
  "10": "Music",
  "15": "Pets & Animals",
  "17": "Sports",
  "18": "Short Movies",
  "19": "Travel & Events",
  "20": "Gaming",
  "21": "Videoblogging",
  "22": "People & Blogs",
  "23": "Comedy",
  "24": "Entertainment",
  "25": "News & Politics",
  "26": "Howto & Style",
  "27": "Education",
  "28": "Science & Technology",
  "29": "Nonprofits & Activism",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url")?.trim() ?? "";
  const videoId = getVideoId(videoUrl) ?? videoUrl.trim();

  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Paste a valid YouTube video URL." }, { status: 400 });
  }

  const cacheKey = `region_check_${videoId}`;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    let key = getNextApiKey();
    if (!key) {
      return NextResponse.json({ error: "YouTube API quota reached. Try again later." }, { status: 503 });
    }

    while (key) {
      const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,snippet&key=${key}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (res.ok) {
        const item = data.items?.[0];
        if (!item) {
          return NextResponse.json({ error: "Video not found. It may be private or deleted." }, { status: 404 });
        }

        const regionRestriction = item.contentDetails?.regionRestriction ?? {};
        const allowedList: string[] = regionRestriction.allowed ?? [];
        const blockedList: string[] = regionRestriction.blocked ?? [];
        const categoryId = item.snippet?.categoryId ?? "";

        const payload = {
          videoId,
          title: item.snippet?.title ?? "",
          categoryId,
          categoryName: YOUTUBE_CATEGORY_NAMES[categoryId] ?? "Unknown",
          hasRestrictions: allowedList.length > 0 || blockedList.length > 0,
          allowed: allowedList,
          blocked: blockedList,
          isGloballyAvailable: allowedList.length === 0 && blockedList.length === 0,
        };

        await setCachedData(cacheKey, payload, 86400);
        return NextResponse.json(payload);
      }

      if (res.status === 403 && data.error?.errors?.[0]?.reason === "quotaExceeded") {
        reportQuotaExceeded(key);
        key = getNextApiKey();
        continue;
      }
      break;
    }

    return NextResponse.json({ error: "Unable to fetch video data." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Unable to check region restrictions right now." }, { status: 502 });
  }
}
