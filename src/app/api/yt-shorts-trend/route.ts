import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/lib/youtube-cache";
import { getNextApiKey, reportQuotaExceeded } from "@/lib/youtube-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "gaming";
  const lookbackHours = Number(searchParams.get("lookback") || "24");
  const maxResults = Math.min(Number(searchParams.get("max") || "50"), 50);
  const sortBy = searchParams.get("sort") || "trendScore";
  const cacheKey = "shorts_trend_" + q + "_" + lookbackHours + "_" + maxResults;

  try {
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      // Sort cached data based on current sortBy
      cached.videos.sort((a: any, b: any) => b[sortBy] - a[sortBy]);
      return NextResponse.json(cached);
    }

    let key = getNextApiKey();
    if (!key) {
      return NextResponse.json({ error: "YouTube API quota reached. Try again later." }, { status: 503 });
    }

    // Calculate publishedAfter date
    const publishedAfter = new Date(Date.now() - lookbackHours * 3600 * 1000).toISOString();

    // 1. Search for short videos
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=${encodeURIComponent(q)}&publishedAfter=${publishedAfter}&maxResults=${maxResults}&key=${key}`,
      { cache: "no-store" }
    );
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      if (searchRes.status === 403 && searchData.error?.errors?.[0]?.reason === "quotaExceeded") reportQuotaExceeded(key);
      return NextResponse.json({ error: "Failed to fetch shorts from YouTube." }, { status: 502 });
    }

    const videoIds = (searchData.items || []).map((i: any) => i.id?.videoId).filter(Boolean);
    
    if (videoIds.length === 0) {
      return NextResponse.json({ videos: [], tags: [] });
    }

    // 2. Fetch statistics for these videos
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${key}`,
      { cache: "no-store" }
    );
    const statsData = await statsRes.json();
    
    if (!statsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch video statistics." }, { status: 502 });
    }

    const now = Date.now();
    const tagCount: Record<string, number> = {};

    const videos = (statsData.items || []).map((item: any) => {
      const views = Number(item.statistics?.viewCount || 0);
      const likes = Number(item.statistics?.likeCount || 0);
      const comments = Number(item.statistics?.commentCount || 0);
      const publishedAt = new Date(item.snippet.publishedAt).getTime();
      
      const ageHours = Math.max((now - publishedAt) / (1000 * 3600), 0.1);
      const velocity = views / ageHours;
      const er = views > 0 ? ((likes + comments) / views) * 100 : 0;
      
      // Calculate a trend score (arbitrary blended metric: high velocity + good ER)
      const trendScore = (Math.log10(velocity + 1) * 20) + (er * 5);

      const tags = item.snippet.tags || [];
      tags.forEach((t: string) => {
        const cleanTag = t.toLowerCase();
        tagCount[cleanTag] = (tagCount[cleanTag] || 0) + 1;
      });

      // Parse duration
      const durationMatch = (item.contentDetails?.duration || "").match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
      const mins = parseInt(durationMatch?.[1] || "0");
      const secs = parseInt(durationMatch?.[2] || "0");
      const lenStr = `${mins > 0 ? mins + "m " : ""}${secs}s`;

      return {
        videoId: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        views,
        likes,
        comments,
        ageHours: parseFloat(ageHours.toFixed(1)),
        velocity: parseFloat(velocity.toFixed(1)),
        er: parseFloat(er.toFixed(2)),
        trendScore: parseFloat(trendScore.toFixed(3)),
        lenStr,
        tags: tags.slice(0, 5),
      };
    });

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(t => t[0]);

    const payload = { videos, tags: topTags };
    
    // Cache for 30 minutes
    await setCachedData(cacheKey, payload, 1800);

    // Sort response initially
    payload.videos.sort((a: any, b: any) => b[sortBy] - a[sortBy]);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: "Unable to process trend data right now." }, { status: 500 });
  }
}
