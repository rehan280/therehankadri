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
      return { type: "channel", id: parsedUrl.pathname };
    }
  }

  return { type: "invalid", id: null };
}

/**
 * Checks monetization signals using the youtubei.js InnerTube client.
 *
 * For videos: checks ad placement data from the player response and whether
 * the channel has a Join (membership) button.
 *
 * For channels: checks for a Join button (memberships), merch shelf, and
 * SuperThanks/SuperChat features — all of which require YPP membership.
 *
 * Note: YouTube removed `is_monetization_enabled` and `yt_ad` from page
 * source in 2024/2025 so we now use structural InnerTube signals instead.
 */
async function checkMonetization(id: string, type: "video" | "channel") {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });

  const signals = {
    hasJoinButton: false,
    hasMerchShelf: false,
    hasSuperFeatures: false,
    hasAdPlacements: false,
    isFamilySafe: true,
  };

  let targetName = "";

  if (type === "video") {
    // getInfo gives us the full player response including ad-related data
    const info = await yt.getInfo(id);
    targetName = info.basic_info.title ?? "";

    // Check for ad placements in the player response (indicates monetized content)
    const playerResponse = (info as any).page?.[0] ?? {};
    const adPlacements = playerResponse?.adPlacements ?? playerResponse?.playerAds;
    if (Array.isArray(adPlacements) && adPlacements.length > 0) {
      signals.hasAdPlacements = true;
    }
    // Also check raw player_config and streaming_data for ad markers
    const rawJson = JSON.stringify(info);
    if (
      rawJson.includes('"adPlacements"') ||
      rawJson.includes('"playerAds"') ||
      rawJson.includes('"adSlots"') ||
      rawJson.includes('"linearAd"')
    ) {
      signals.hasAdPlacements = true;
    }

    signals.isFamilySafe = info.basic_info.is_family_safe ?? true;

    // For videos, also check the channel that uploaded it for Join/merch signals
    const channelId = info.basic_info.channel_id;
    if (channelId) {
      try {
        const channel = await yt.getChannel(channelId);
        const headerJson = JSON.stringify(channel.header ?? {});
        const rawChannel = JSON.stringify(channel);

        if (headerJson.includes("Join") || rawChannel.includes('"joinButton"') || rawChannel.includes('"subscribeButton"')) {
          // "Join" specifically (not "Subscribe") means memberships are enabled = YPP
          if (headerJson.includes('"Join"') || rawChannel.includes('"Join"')) {
            signals.hasJoinButton = true;
          }
        }
        if (rawChannel.includes("merchandiseShelf") || rawChannel.includes("MerchShelf")) {
          signals.hasMerchShelf = true;
        }
      } catch {
        // Channel lookup is best-effort; don't fail overall check
      }
    }
  } else {
    // Channel — resolve handle/URL to a browse ID first
    const resolved = await yt.resolveURL(`https://www.youtube.com${id}`);
    const browseId = resolved.payload?.browseId;
    if (!browseId) return null;

    const channel = await yt.getChannel(browseId);
    targetName = channel.title ?? "";
    signals.isFamilySafe = channel.metadata?.is_family_safe ?? true;

    const headerJson = JSON.stringify(channel.header ?? {});
    const rawChannel = JSON.stringify(channel);

    // Join button = channel memberships = requires YPP
    if (headerJson.includes('"Join"') || rawChannel.includes('"Join"')) {
      signals.hasJoinButton = true;
    }

    // Merch shelf = requires YPP
    if (rawChannel.includes("merchandiseShelf") || rawChannel.includes("MerchShelf") || rawChannel.includes("merch")) {
      signals.hasMerchShelf = true;
    }

    // Super Thanks / SuperChat = requires YPP
    if (rawChannel.includes("superThanks") || rawChannel.includes("SuperThanks") || rawChannel.includes("tipping")) {
      signals.hasSuperFeatures = true;
    }
  }

  // Aggregate: monetized if ANY positive YPP signal is present
  const isMonetized =
    signals.hasJoinButton ||
    signals.hasMerchShelf ||
    signals.hasSuperFeatures ||
    signals.hasAdPlacements;

  return {
    isMonetized,
    type,
    targetName,
    signals,
  };
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const inputUrl = searchParams.get("url")?.trim() ?? "";
  
  const { type, id } = determineUrlType(inputUrl);

  if (type === "invalid" || !id) {
    return NextResponse.json({ error: "Paste a valid YouTube video or channel URL." }, { status: 400 });
  }

  const cacheKey = `monetization_v2_${type}_${id.replace(/\//g, "_")}`;
  let isCached = false;
  let statusCode = 200;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      isCached = true;
      logApiMetric({ toolSlug: "youtube-monetization-checker", endpoint: "/api/youtube-monetization", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    const payload = await checkMonetization(id, type);

    if (!payload) {
      statusCode = 422;
      logApiMetric({ toolSlug: "youtube-monetization-checker", endpoint: "/api/youtube-monetization", statusCode, isCached, latencyMs: Date.now() - startTime });
      return NextResponse.json({ error: "Could not fetch data for this YouTube URL." }, { status: 422 });
    }

    // Cache for 6h (monetization status can change)
    await setCachedData(cacheKey, payload, 21600);

    logApiMetric({ toolSlug: "youtube-monetization-checker", endpoint: "/api/youtube-monetization", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json(payload);

  } catch (error) {
    statusCode = 502;
    logApiMetric({ toolSlug: "youtube-monetization-checker", endpoint: "/api/youtube-monetization", statusCode, isCached, latencyMs: Date.now() - startTime });
    return NextResponse.json({ error: "Unable to check monetization right now." }, { status: 502 });
  }
}
