import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/youtube-cache";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveChannelTarget(input: string): { type: "id" | "handle" | "path"; value: string } {
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

interface VideoItem {
  publishedAt: string;
  title: string;
  videoId: string;
}

async function fetchChannelVideos(channelId: string, key: string, maxResults: number = 50): Promise<VideoItem[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}&part=snippet&order=date&maxResults=${maxResults}&type=video&key=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 403 && data.error?.errors?.[0]?.reason === "quotaExceeded") {
      reportQuotaExceeded(key);
    }
    return [];
  }
  return (data.items ?? []).map((item: any) => ({
    publishedAt: item.snippet?.publishedAt ?? "",
    title: item.snippet?.title ?? "",
    videoId: item.id?.videoId ?? "",
  }));
}

async function resolveChannelId(target: { type: "id" | "handle" | "path"; value: string }, key: string): Promise<string | null> {
  if (target.type === "id") return target.value;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(target.value)}&maxResults=1&key=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) return null;
  return data.items?.[0]?.id?.channelId ?? null;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("target")?.trim() ?? "";
  const maxParam = parseInt(searchParams.get("max") ?? "50", 10);
  const maxResults = isNaN(maxParam) ? 50 : Math.min(Math.max(maxParam, 5), 50);

  if (!input) {
    return NextResponse.json({ error: "Paste a YouTube channel URL or @handle." }, { status: 400 });
  }

  const target = resolveChannelTarget(input);
  const cacheKey = `upload_schedule_${target.value}_${maxResults}`;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    let key = getNextApiKey();
    if (!key) {
      return NextResponse.json({ error: "YouTube API quota reached. Try again later." }, { status: 503 });
    }

    const channelId = await resolveChannelId(target, key);
    if (!channelId) {
      return NextResponse.json({ error: "Channel not found. Try with a direct channel URL." }, { status: 404 });
    }

    const videos = await fetchChannelVideos(channelId, key, maxResults);
    if (!videos.length) {
      return NextResponse.json({ error: "No recent videos found for this channel." }, { status: 404 });
    }

    // Analyze upload patterns
    const dayCounts: Record<number, number> = {};
    const hourCounts: Record<number, number> = {};
    const monthCounts: Record<string, number> = {};
    const publishedDates: Date[] = [];

    for (const v of videos) {
      if (!v.publishedAt) continue;
      const d = new Date(v.publishedAt);
      publishedDates.push(d);
      dayCounts[d.getUTCDay()] = (dayCounts[d.getUTCDay()] ?? 0) + 1;
      hourCounts[d.getUTCHours()] = (hourCounts[d.getUTCHours()] ?? 0) + 1;
      const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      monthCounts[month] = (monthCounts[month] ?? 0) + 1;
    }

    // Find best day and hour
    const bestDayIdx = Object.entries(dayCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] ?? "0";
    const bestHour = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] ?? "0";

    // Calculate average frequency
    if (publishedDates.length >= 2) {
      publishedDates.sort((a, b) => b.getTime() - a.getTime());
    }

    const dayDistribution = DAYS.map((name, i) => ({
      day: name,
      count: dayCounts[i] ?? 0,
    }));

    const hourDistribution = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h.toString().padStart(2, "0")}:00 UTC`,
      count: hourCounts[h] ?? 0,
    }));

    const totalVideos = videos.length;
    const monthsSpanned = Object.keys(monthCounts).length || 1;
    const avgPerMonth = +(totalVideos / monthsSpanned).toFixed(1);

    const payload = {
      channelId,
      totalAnalyzed: totalVideos,
      bestDay: DAYS[Number(bestDayIdx)] ?? "Unknown",
      bestHour: `${String(bestHour).padStart(2, "0")}:00 UTC`,
      avgUploadsPerMonth: avgPerMonth,
      dayDistribution,
      hourDistribution,
      monthlyBreakdown: Object.entries(monthCounts)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 12)
        .map(([month, count]) => ({ month, count })),
      recentVideos: videos.slice(0, 10),
    };

    await setCachedData(cacheKey, payload, 3600);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Unable to analyze upload schedule right now." }, { status: 502 });
  }
}
