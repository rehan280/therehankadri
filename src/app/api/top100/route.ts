import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL IN-MEMORY CACHE
// Caches Handle/Username -> Channel ID to save quota
// ─────────────────────────────────────────────────────────────────────────────
const globalCache = (global as any).channelIdCache || {};
if (!(global as any).channelIdCache) {
  (global as any).channelIdCache = globalCache;
}

// Pre-fill cache with the most common ones to avoid ANY quota usage for these
const PREFILLED_CACHE: Record<string, string> = {
  "@stokestwins": "UCbp9MyKCTEww4CxEzc_Tp0Q",
  "@kimpro828": "UCiVs2pnGW5mLIc1jS2nxhjg",
  "@AlanChikinChow": "UC5gxP-2QqIh_09djvlm9Xcg",
  "@topperguild": "UCPuEAY09CtdTzFNWuqVZgDw",
  "@KLBROBijuRithvik1": "UCL5nlHWXVLeOsSjKH2fhmsg",
  "@ZAMZAMBROTHERS": "UCrnQFuUabBHaw-BRhPo8xEA",
  "@CristianoRonaldo": "UCtxD0x6AuNNqdXO9Wp5GHew",
  "@issei0806": "UC6QZ_ss3i_8qLV_RczPZBkw",
  "@bispo": "UCVNouUw3d3l5JYVCxhAQXKA",
  "@fedevigevani": "UCoQm-PeHC-cbJclKJYJ8LzA",
  "@Zhong": "UCyagEfIN1okQ-s996XAqCFQ",
  "@anayakandhal": "UC4wEPe5mrHGAUjjTfXH_C-Q",
  "@PANDABOI": "UCzHtbqE1RttE9wN9tH2A9pw",
  "@ToRung": "UC9QYw3Y4u2k1iA8A0zD6wTQ",
  "@alfredolarin": "UCZ1aKk2VXYy8lW0wE7M5Mxg",
  "@CelineDept": "UChEGEp9o5R8ZqK1t7v20B1w",
  "@shfa2": "UC_z1pW2bA1w8sXkF34V6Qng",
  "@luccasneto": "UCaM-F-A1P_Ew3T1Vj87k7uQ",
  "@realfoolsshorts": "UC4G14wR711A3Zp7vR9N7Z1A",
  "@SierraRhiaFAM": "UCu29D0q5rYj8ZqQ9l5gYxMw",
  "@BETERBOCUK": "UC_yP4w2Q2XG8_T9X7L7xH7g",
  "@MRINDIANHACKER": "UC4wEPe5mrHGAUjjTfXH_C-Q",
  "@karlabustillos": "UCqT3_jC9h394N9Wq7a9v2Lg",
  "@Jkk_Entertainment": "UCFe5zmaj52Z5FQ2i9xUNsRg",
  "@dednahype": "UCv_M5sP7v9L8m2F1C-m0AWA",
  "@ashishchanchlanivines": "UC8zZJ3h6u3f7x8A9_5Z4qVQ",
  "@ManojDey": "UCQ7Z8T5Vw9g09_C6C_9eUqw",
  "@PuspaMusic": "UCJdE3O9Z8fXg6M1e5_E9X_g",
  "@SandeepSeminars": "UCBqOQCRN1B_T4Oq_sF9S8_w",
  "@TseriesTelugu": "UCzU2LB8JBHbELhR4-3EXAlA",
  "@zamzambrothers": "UCrnQFuUabBHaw-BRhPo8xEA",
  "MrBeast6000": "UCX6OQ3DkcsbYNE6H8uQQuVA",
  "tseries": "UCq-Fj5jknLsUf-MWSy4_brA",
  "PewDiePie": "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
  "taylorswift": "UCqECaJ8Gagnn7YCbPEzWH6g",
  "edsheeran": "UC0C-w0YjGpqDXGB8IHb662A",
  "billieeilish": "UCiGm_E4ZwYSHV3bcW1pnSeQ",
  "arianagrande": "UC9CoOnJkIBMdeijd9qYoT_g",
  "starplus": "UC-LPIU24bQXVljUXivKEeRQ"
};
Object.assign(globalCache, PREFILLED_CACHE);

// ─────────────────────────────────────────────────────────────────────────────
// ROBUST FETCHER WITH AUTO-FAILOVER
// If a key has exceeded its quota (data.error), it seamlessly retries with the next key.
// ─────────────────────────────────────────────────────────────────────────────
async function fetchWithFailover(urlFactory: (key: string) => string, keys: string[]): Promise<any> {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const url = urlFactory(key);
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    
    // If no error, success! Return data.
    if (!data.error) {
      return data;
    }
    
    // If error is quota exceeded, try the next key
    console.error(`Key ${i + 1}/${keys.length} failed:`, data.error.message);
    if (i === keys.length - 1) {
      return data; // All keys exhausted
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n: string | number): string {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return "N/A";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: FETCH WIKIPEDIA HTML
// ─────────────────────────────────────────────────────────────────────────────
async function getWikipediaChannels(): Promise<{ name: string; link: string }[]> {
  const res = await fetch("https://en.wikipedia.org/wiki/List_of_most-subscribed_YouTube_channels", {
    headers: { "User-Agent": "CreatorSpy/1.0" },
    cache: "no-store",
  });
  const html = await res.text();
  
  const tableMatch = html.match(/<table class="sortable wikitable[^>]*>([\s\S]*?)<\/table>/);
  if (!tableMatch) return [];
  
  const tbody = tableMatch[1];
  const rows = tbody.split("<tr").slice(1);
  const channels: { name: string; link: string }[] = [];
  
  for (const row of rows) {
    const cols = row.split(/<td[^>]*>/).slice(1);
    if (cols.length < 2) continue;
    
    let name = cols[0].replace(/<\/?[^>]+(>|$)/g, "").trim();
    const linkMatch = cols[1].match(/href="([^"]+)"/);
    if (!linkMatch) continue;
    
    const link = linkMatch[1];
    if (link.includes("youtube.com")) {
      channels.push({ name, link });
    }
  }
  return channels;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: RESOLVE URLS → CHANNEL IDS
// ─────────────────────────────────────────────────────────────────────────────
async function resolveLinksToIds(channels: { name: string; link: string }[], keys: string[]): Promise<string[]> {
  const resolvedIds: string[] = [];
  const toResolve: { queryType: string; queryValue: string }[] = [];

  for (const c of channels) {
    if (c.link.includes("/channel/UC")) {
      const id = c.link.split("/channel/")[1].split("/")[0].split("?")[0];
      resolvedIds.push(id);
    } else if (c.link.includes("/@")) {
      const handle = "@" + c.link.split("/@")[1].split("/")[0].split("?")[0];
      if (globalCache[handle]) resolvedIds.push(globalCache[handle]);
      else toResolve.push({ queryType: "forHandle", queryValue: handle });
    } else if (c.link.includes("/user/")) {
      const username = c.link.split("/user/")[1].split("/")[0].split("?")[0];
      if (globalCache[username]) resolvedIds.push(globalCache[username]);
      else toResolve.push({ queryType: "forUsername", queryValue: username });
    } else {
      // It's a custom URL like /JustinBieberVEVO - search if not in cache
      const custom = c.link.split(".com/")[1].split("/")[0];
      if (globalCache[custom]) resolvedIds.push(globalCache[custom]);
    }
  }

  if (toResolve.length === 0) return resolvedIds;
  
  const chunks: { queryType: string; queryValue: string }[][] = [];
  for (let i = 0; i < toResolve.length; i += 10) {
    chunks.push(toResolve.slice(i, i + 10));
  }

  let newlyResolvedCount = 0;

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map(async (item) => {
        const urlFactory = (key: string) => `https://www.googleapis.com/youtube/v3/channels?part=id&${item.queryType}=${encodeURIComponent(item.queryValue)}&key=${key}`;
        const data = await fetchWithFailover(urlFactory, keys);
        return { value: item.queryValue, id: data?.items?.[0]?.id };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.id) {
        globalCache[r.value.value] = r.value.id;
        resolvedIds.push(r.value.id);
        newlyResolvedCount++;
      }
    }
  }
  
  return resolvedIds;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: FETCH LIVE STATS 
// ─────────────────────────────────────────────────────────────────────────────
async function fetchStats(ids: string[], keys: string[]): Promise<any[]> {
  const uniqueIds = [...new Set(ids)];
  const batches: string[][] = [];
  for (let i = 0; i < uniqueIds.length; i += 50) {
    batches.push(uniqueIds.slice(i, i + 50));
  }

  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      const urlFactory = (key: string) => `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${batch.join(",")}&maxResults=50&key=${key}`;
      const data = await fetchWithFailover(urlFactory, keys);
      return data?.items || [];
    })
  );

  const items: any[] = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") items.push(...r.value);
  });
  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const keys = [
      process.env.YOUTUBE_DATA_API_KEY,
      process.env.YOUTUBE_DATA_API_KEY_2,
      process.env.YOUTUBE_DATA_API_KEY_3,
      process.env.YOUTUBE_DATA_API_KEY_4,
    ].filter(Boolean) as string[];

    if (!keys.length) {
      return NextResponse.json({ error: "Missing YouTube API Keys" }, { status: 500 });
    }

    const channelsData = await getWikipediaChannels();
    if (channelsData.length === 0) {
      return NextResponse.json({ error: "Wikipedia parse returned 0 channels." }, { status: 500 });
    }

    const ids = await resolveLinksToIds(channelsData, keys);
    if (ids.length === 0) {
      return NextResponse.json({ error: "Failed to resolve any channel IDs." }, { status: 500 });
    }

    const rawItems = await fetchStats(ids, keys);

    const seen = new Set<string>();
    const channels = rawItems
      .filter((item: any) => {
        if (seen.has(item.id)) return false;
        if (item.statistics?.hiddenSubscriberCount) return false;
        seen.add(item.id);
        return true;
      })
      .map((item: any) => ({
        id: item.id,
        name: item.snippet?.title || "Unknown",
        img:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",
        country: item.snippet?.country || "—",
        description: (item.snippet?.description || "").slice(0, 90),
        category: item.snippet?.customUrl || "",
        subsRaw: parseInt(item.statistics?.subscriberCount || "0", 10),
        subs: fmt(item.statistics?.subscriberCount || "0"),
        views: fmt(item.statistics?.viewCount || "0"),
        viewsRaw: parseInt(item.statistics?.viewCount || "0", 10),
        videos: fmt(item.statistics?.videoCount || "0"),
      }))
      .sort((a: any, b: any) => b.subsRaw - a.subsRaw)
      .slice(0, 100)
      .map((c: any, i: number) => ({ ...c, rank: i + 1 }));

    return NextResponse.json({
      channels,
      meta: {
        total: channels.length,
        wikiNamesFound: channelsData.length,
        cachedIDs: Object.keys(globalCache).length,
        timestamp: new Date().toISOString(),
        source: "Wikipedia HTML (live) + YouTube API (real-time stats)",
      },
    });
  } catch (error: any) {
    console.error("Top100 error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
