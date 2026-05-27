import { NextResponse } from "next/server";
import { getCachedData, setCachedData, logApiMetric } from "@/lib/youtube-cache";
import { Innertube, UniversalCache } from "youtubei.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function determineUrlType(rawUrl: string): { type: "video" | "channel" | "invalid", id: string | null } {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return { type: "invalid", id: null };
  }
  
  const host = parsedUrl.hostname.replace(/^www\./, "").toLowerCase();
  
  // Check for video (youtu.be or /watch)
  if (host === "youtu.be") {
    const id = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    if (id) return { type: "video", id };
  }
  
  if (host.endsWith("youtube.com")) {
    if (parsedUrl.pathname === "/watch") {
      const id = parsedUrl.searchParams.get("v");
      if (id) return { type: "video", id };
    }
    
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    if (["shorts", "embed", "live"].includes(pathParts[0] ?? "")) {
      const id = pathParts[1] ?? null;
      if (id) return { type: "video", id };
    }

    // Check for channel
    if (["channel", "c", "user"].includes(pathParts[0] ?? "") || (pathParts[0] && pathParts[0].startsWith("@"))) {
      // Return the full pathname to construct the channel URL later
      return { type: "channel", id: parsedUrl.pathname };
    }
  }

  return { type: "invalid", id: null };
}

async function checkMonetization(url: string, type: "video" | "channel") {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    const markers = {
      yt_ad: html.includes('"yt_ad"'),
      is_monetization_enabled: html.includes('"is_monetization_enabled":true'),
    };

    const isMonetized = markers.yt_ad || markers.is_monetization_enabled;

    return {
      isMonetized,
      markers,
      type
    };
  } catch (err) {
    console.error("Monetization Check Error:", err);
    return null;
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const inputUrl = searchParams.get("url")?.trim() ?? "";
  
  const { type, id } = determineUrlType(inputUrl);

  if (type === "invalid" || !id) {
    return NextResponse.json({ error: "Paste a valid YouTube video or channel URL." }, { status: 400 });
  }

  const normalizedUrl = type === "video" 
    ? `https://www.youtube.com/watch?v=${id}`
    : `https://www.youtube.com${id}`;

  const cacheKey = `monetization_${type}_${id}`;
  let isCached = false;
  let statusCode = 200;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      isCached = true;
      logApiMetric({ toolSlug: "youtube-monetization-checker", endpoint: "/api/youtube-monetization", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    const payload = await checkMonetization(normalizedUrl, type);

    if (!payload) {
      statusCode = 422;
      logApiMetric({ toolSlug: "youtube-monetization-checker", endpoint: "/api/youtube-monetization", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json({ error: "Could not fetch data for this YouTube URL." }, { status: 422 });
    }

    // Cache for 24h
    await setCachedData(cacheKey, payload, 86400);

    logApiMetric({ toolSlug: "youtube-monetization-checker", endpoint: "/api/youtube-monetization", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json(payload);

  } catch (error) {
    statusCode = 502;
    logApiMetric({ toolSlug: "youtube-monetization-checker", endpoint: "/api/youtube-monetization", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json({ error: "Unable to check monetization right now." }, { status: 502 });
  }
}
