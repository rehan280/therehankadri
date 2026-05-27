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

    if (["channel", "c", "user"].includes(pathParts[0] ?? "") || (pathParts[0] && pathParts[0].startsWith("@"))) {
      return { type: "channel", id: pathParts.join("/") };
    }
  }

  return { type: "invalid", id: null };
}

async function checkShadowban(id: string, type: "video" | "channel") {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    
    let isIndexed = false;
    let isFamilySafe = true;
    let titleOrName = "";
    let ageRestricted = false;

    if (type === "video") {
      const info = await yt.getBasicInfo(id);
      titleOrName = info.basic_info.title || "";
      isFamilySafe = info.basic_info.is_family_safe ?? true;
      
      // Perform search for the exact title
      if (titleOrName) {
        const searchResults = await yt.search(`"${titleOrName}"`);
        // Check if the video is in the first page of results
        const videos = searchResults.videos;
        isIndexed = videos.some(v => 'id' in v && v.id === id);
      }
    } else if (type === "channel") {
      // It's harder to get channel by generic string with youtubei.js without resolveURL
      const resolve = await yt.resolveURL(`https://www.youtube.com/${id}`);
      if (resolve.payload?.browseId) {
        const channel = await yt.getChannel(resolve.payload.browseId);
        titleOrName = channel.title || "";
        isFamilySafe = channel.metadata?.is_family_safe ?? true;
        
        if (titleOrName) {
          const searchResults = await yt.search(`"${titleOrName}"`);
          const channels = searchResults.channels || searchResults.results?.filter(r => r.type === "Channel") || [];
          isIndexed = channels.some((c: any) => c.id === resolve.payload.browseId);
        }
      }
    }

    // Heuristics Score (100 is perfectly healthy)
    let score = 100;
    const flags: string[] = [];

    if (!isIndexed && titleOrName) {
      score -= 50;
      flags.push("Does not appear in exact-match search results");
    }
    
    if (!isFamilySafe) {
      score -= 30;
      flags.push("Marked as not family-safe (restricted reach)");
    }

    if (ageRestricted) {
      score -= 40;
      flags.push("Age restricted content");
    }
    
    if (score === 100 && titleOrName) {
      flags.push("No obvious shadowban markers detected");
    }

    return {
      score: Math.max(0, score),
      isShadowbanned: score <= 50,
      flags,
      type,
      targetName: titleOrName
    };
  } catch (err) {
    console.error("Shadowban Check Error:", err);
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

  const cacheKey = `shadowban_${type}_${id.replace(/\//g, "_")}`;
  let isCached = false;
  let statusCode = 200;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      isCached = true;
      logApiMetric({ toolSlug: "youtube-shadowban-detector", endpoint: "/api/youtube-shadowban", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    const payload = await checkShadowban(id, type);

    if (!payload) {
      statusCode = 422;
      logApiMetric({ toolSlug: "youtube-shadowban-detector", endpoint: "/api/youtube-shadowban", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json({ error: "Could not fetch data or analyze this YouTube URL." }, { status: 422 });
    }

    await setCachedData(cacheKey, payload, 86400);

    logApiMetric({ toolSlug: "youtube-shadowban-detector", endpoint: "/api/youtube-shadowban", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json(payload);

  } catch (error) {
    statusCode = 502;
    logApiMetric({ toolSlug: "youtube-shadowban-detector", endpoint: "/api/youtube-shadowban", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json({ error: "Unable to check shadowban status right now." }, { status: 502 });
  }
}
