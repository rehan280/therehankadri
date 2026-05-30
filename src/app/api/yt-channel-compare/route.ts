import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/youtube-cache";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveChannelId(input: string): { type: "id" | "handle"; value: string } {
  const t = input.trim();
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://www.youtube.com/${t}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel" && parts[1]) return { type: "id", value: parts[1] };
    if (parts[0]?.startsWith("@")) return { type: "handle", value: parts[0] };
    if (parts[0] === "c" || parts[0] === "user") return { type: "handle", value: parts[1] ?? "" };
  } catch { /* ignored */ }
  return { type: "handle", value: t.startsWith("@") ? t : `@${t.replace(/^@/, "")}` };
}

async function fetchChannelStats(target: { type: "id" | "handle"; value: string }, key: string) {
  let url: string;
  if (target.type === "id") {
    url = `https://www.googleapis.com/youtube/v3/channels?id=${target.value}&part=snippet,statistics&key=${key}`;
  } else {
    // Search by handle name
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(target.value)}&maxResults=1&key=${key}`;
    const searchRes = await fetch(searchUrl, { cache: "no-store" });
    const searchData = await searchRes.json();
    if (!searchRes.ok) return null;
    const channelId = searchData.items?.[0]?.id?.channelId;
    if (!channelId) return null;
    url = `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet,statistics&key=${key}`;
  }

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 403 && data.error?.errors?.[0]?.reason === "quotaExceeded") {
      reportQuotaExceeded(key);
    }
    return null;
  }

  const item = data.items?.[0];
  if (!item) return null;

  return {
    channelId: item.id,
    title: item.snippet?.title ?? "",
    description: item.snippet?.description ?? "",
    thumbnail: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
    publishedAt: item.snippet?.publishedAt ?? "",
    country: item.snippet?.country ?? "",
    subscriberCount: item.statistics?.subscriberCount ?? "0",
    videoCount: item.statistics?.videoCount ?? "0",
    viewCount: item.statistics?.viewCount ?? "0",
    hiddenSubscriberCount: item.statistics?.hiddenSubscriberCount ?? false,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel1 = searchParams.get("channel1")?.trim() ?? "";
  const channel2 = searchParams.get("channel2")?.trim() ?? "";

  if (!channel1 || !channel2) {
    return NextResponse.json({ error: "Provide two channel URLs to compare." }, { status: 400 });
  }

  const target1 = resolveChannelId(channel1);
  const target2 = resolveChannelId(channel2);
  const cacheKey = `channel_compare_${target1.value}_${target2.value}`;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const key = getNextApiKey();
    if (!key) {
      return NextResponse.json({ error: "YouTube API quota reached. Try again later." }, { status: 503 });
    }

    const [stats1, stats2] = await Promise.all([
      fetchChannelStats(target1, key),
      fetchChannelStats(target2, key),
    ]);

    if (!stats1 || !stats2) {
      return NextResponse.json({
        error: !stats1
          ? "Could not find Channel 1. Check the URL and try again."
          : "Could not find Channel 2. Check the URL and try again.",
      }, { status: 404 });
    }

    const payload = { channel1: stats1, channel2: stats2 };
    await setCachedData(cacheKey, payload, 3600);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Unable to compare channels right now." }, { status: 502 });
  }
}
