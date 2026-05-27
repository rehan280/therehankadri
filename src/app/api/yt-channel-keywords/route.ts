import { NextResponse } from "next/server";
import { getCachedData, setCachedData, logApiMetric } from "@/lib/youtube-cache";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  let target = searchParams.get("target")?.trim() ?? "";

  if (!target) {
    return NextResponse.json({ error: "Missing target URL or handle" }, { status: 400 });
  }

  // Handle formats like: MonkeyxMagic, @MonkeyxMagic, https://youtube.com/@MonkeyxMagic
  if (!target.includes("youtube.com")) {
    target = target.startsWith("@") ? target : `@${target}`;
    target = `https://www.youtube.com/${target}`;
  }

  const cacheKey = `channel_kw_${crypto.createHash('md5').update(target).digest('hex')}`;
  let isCached = false;
  let statusCode = 200;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      isCached = true;
      logApiMetric({ toolSlug: "yt-channel-keywords", endpoint: "/api/yt-channel-keywords", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    const res = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      statusCode = 500;
      logApiMetric({ toolSlug: "yt-channel-keywords", endpoint: "/api/yt-channel-keywords", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json({ error: "Failed to fetch channel page" }, { status: 500 });
    }

    const html = await res.text();
    const match = html.match(/<meta name="keywords" content="([^"]+)">/i);

    if (!match || !match[1]) {
      const payload = { keywords: [] };
      await setCachedData(cacheKey, payload, 86400); // cache empty for 1 day
      logApiMetric({ toolSlug: "yt-channel-keywords", endpoint: "/api/yt-channel-keywords", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(payload);
    }

    const rawContent = match[1];
    const unescaped = rawContent.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    let keywords: string[] = [];
    
    if (unescaped.includes(',')) {
      keywords = unescaped.split(',').map(k => k.replace(/^"/, '').replace(/"$/, '').trim());
    } else {
      const regex = /"([^"]+)"|(\S+)/g;
      let m;
      while ((m = regex.exec(unescaped)) !== null) {
        if (m[1]) keywords.push(m[1].trim());
        else if (m[2]) keywords.push(m[2].trim());
      }
    }
    
    keywords = keywords.filter(k => k && k.length > 0);
    const payload = { keywords };

    // Cache for 7 days
    await setCachedData(cacheKey, payload, 604800);

    logApiMetric({ toolSlug: "yt-channel-keywords", endpoint: "/api/yt-channel-keywords", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json(payload);

  } catch (error: any) {
    statusCode = 500;
    logApiMetric({ toolSlug: "yt-channel-keywords", endpoint: "/api/yt-channel-keywords", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
