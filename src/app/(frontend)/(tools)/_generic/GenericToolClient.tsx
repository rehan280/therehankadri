"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GenericToolKind, ToolDefinition } from "@/lib/tool-catalog";
import styles from "../youtube-tags-generator/page.module.css";
import { PlaylistExporter } from "@/components/PlaylistExporter";
import { PlaylistLengthCalculator } from "@/components/PlaylistLengthCalculator";
import { X, Copy, Check } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = { tool: ToolDefinition };

type YouTubeMetadata = {
  videoId: string; url: string; title: string; description: string;
  channelName: string; channelUrl: string; durationSeconds: string;
  viewCount: string; likeCount: string; commentCount: string;
  uploadDate: string; tags: string[]; hashtags: string[]; timestamps: string[];
  hasCaptions?: boolean; isHD?: boolean;
};

type VideoResult = {
  title: string; channel: string;
  views: string; published: string; videoId: string;
};

type KeywordMetrics = {
  tag: string;
  searchVolume: number;
  demandScore: number;
  volumeSource: "youtube_demand" | "youtube_autocomplete";
  uniqueSuggestions?: number;
  exactSuggestionMatches?: number;
  bestAutocompleteRank?: number | null;
  expansionMatches?: number;
  questionMatches?: number;
  topSuggestions?: string[];
  volumeError?: string;
  competition: "low" | "medium" | "high";
  competitionScore: number;
  kdPercent: number;
  trendScore: number;
  trendDirection: "rising" | "falling" | "stable";
  isTrending: boolean;
  seoScore: number;
  videoCount: number;
  confidence: number;
  dataSources: string[];
  diagnostics: {
    volumeMethod: string;
    kdMethod: string;
    trendMethod: string;
    gaps: string[];
    improvements: string[];
  };
};

type LabeledLink = { label: string; url: string; isText?: boolean };

export type PlaylistVideoFrontend = {
  videoId: string;
  url: string;
  title: string;
  description: string;
  channelName: string;
  thumbnailUrl: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  uploadedAt: string;
  duration: string;
  durationSeconds: number;
};

type ToolResult =
  | { kind: "thumbnails"; videoId: string; customUrl?: string }
  | { kind: "embed"; videoId: string; shareUrl: string; embedUrl: string; embedCode: string }
  | { kind: "metadata"; meta: YouTubeMetadata }
  | { kind: "tags-inspector"; meta: YouTubeMetadata }
  | { kind: "data"; meta: YouTubeMetadata }
  | { kind: "labeled-links"; items: LabeledLink[] }
  | { kind: "subscribe"; url: string }
  | { kind: "money"; revenue: number; views: number; rpm: number }
  | { kind: "playlist"; videos: PlaylistVideoFrontend[] }
  | { kind: "playlist-text"; videos: PlaylistVideoFrontend[] }
  | { kind: "picker"; winner: string; count: number; allComments: string[] }
  | { kind: "score"; score: number; notes: string[] }
  | { kind: "category"; category: string; keyword: string; evidence: string }
  | { kind: "chips"; items: string[] }
  | { kind: "list"; items: string[] }
  | { kind: "insights"; items: string[] }
  | { kind: "text-list"; items: string[] }
  | { kind: "yt-analysis"; videos: VideoResult[]; summary: string[] }
  // ── New tool result types ──────────────────────────────────────────────────
  | { kind: "ctr"; ctr: number; impressions: number; clicks: number }
  | { kind: "title-length"; text: string; chars: number; words: number }
  | { kind: "desc-length"; text: string; chars: number; words: number; aboveFold: string }
  | { kind: "playback-speed"; duration: number; speeds: { label: string; seconds: number }[] }
  | { kind: "views-ratio"; views: number; likes: number; comments: number; likeRate: number; commentRate: number }
  | { kind: "clean-url"; original: string; cleaned: string; videoId: string }
  | { kind: "embed-code"; code: string; previewUrl: string; isShorts: boolean; isPlaylist: boolean }
  | { kind: "thumbnail-preview"; videoId: string; title: string }
  | { kind: "channel-age"; channelId: string; title: string; publishedAt: string; ageDays: number; thumbnail: string; subscriberCount: string; videoCount: string; viewCount: string }
  | { kind: "region-check"; videoId: string; title: string; hasRestrictions: boolean; allowed: string[]; blocked: string[]; isGloballyAvailable: boolean }
  | { kind: "upload-schedule"; channelId: string; totalAnalyzed: number; bestDay: string; bestHour: string; avgUploadsPerMonth: number; dayDistribution: { day: string; count: number }[]; hourDistribution: { hour: number; label: string; count: number }[]; monthlyBreakdown: { month: string; count: number }[]; recentVideos: { publishedAt: string; title: string; videoId: string }[] }
  | { kind: "channel-compare"; channel1: ChannelStats; channel2: ChannelStats }
  | { kind: "video-seo"; meta: YouTubeMetadata; score: number; checks: SeoCheck[] }
  | { kind: "channel-videos"; channelId: string; channelTitle: string; totalFetched: number; videos: { videoId: string; title: string; url: string; publishedAt: string; thumbnail: string }[] }
  | { kind: "rss-url"; channelId: string; rssUrl: string; title: string; videos?: { videoId: string; title: string; url: string; publishedAt: string; thumbnail: string }[] }
  | { kind: "comments-export"; videoId: string; comments: { author: string; text: string; likes: string; publishedAt: string }[] }
  | { kind: "video-category"; videoId: string; title: string; categoryId: string; categoryName: string }
  | { kind: "playlist-links"; videos: PlaylistVideoFrontend[] }
  | { kind: "advanced-keywords"; keywords: KeywordMetrics[]; topic: string }
  | { kind: "shorts-trend"; liveTrends: string[]; angles: string[]; formatIdeas: { format: string; description: string; hook: string }[] };

type ChannelStats = {
  channelId: string; title: string; description: string;
  thumbnail: string; publishedAt: string; country: string;
  subscriberCount: string; videoCount: string; viewCount: string;
  hiddenSubscriberCount: boolean;
};

type SeoCheck = {
  label: string; passed: boolean; note: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Static helpers
// ─────────────────────────────────────────────────────────────────────────────

const stopWords = new Set([
  "a","an","and","are","as","at","be","been","by","do","for","from",
  "has","have","how","i","in","is","it","its","me","my","no","not",
  "of","on","or","so","that","the","this","to","up","us","was","we",
  "when","who","with","you","your",
]);

function titleCase(v: string) {
  return v.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function getWords(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .map(w => w.trim()).filter(w => w.length >= 3 && !stopWords.has(w));
}

function unique(arr: string[]) {
  return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)));
}

function getVideoId(input: string) {
  const t = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    const host = url.hostname.replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);
    if (host === "youtu.be") return parts[0] || "";
    if (host.endsWith("youtube.com")) {
      if (parts[0] === "watch") return url.searchParams.get("v") || "";
      if (["shorts","embed","live"].includes(parts[0])) return parts[1] || "";
    }
  } catch { return ""; }
  return "";
}

function getChannelTarget(input: string) {
  const t = input.trim();
  if (!t) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(t) ? t : `https://www.youtube.com/${t.replace(/^@/, "@")}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel" && parts[1]) return parts[1];
    if (parts[0]?.startsWith("@")) return parts[0];
    if (parts[0] === "c" || parts[0] === "user") return parts[1] || "";
  } catch {
    return t.startsWith("@") ? t : `@${t.replace(/^@/, "")}`;
  }
  return t.startsWith("@") ? t : `@${t.replace(/^@/, "")}`;
}

function formatDuration(secs: number) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const parts = h > 0 ? [h, m, sec] : [m, sec];
  return parts.map(p => String(p).padStart(2, "0")).join(":");
}

function parseDurationLine(line: string) {
  const match = line.trim().match(/(?:(\d+):)?(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function scoreTitle(value: string) {
  let score = 45;
  const length = value.trim().length;
  const words = getWords(value);
  if (length >= 45 && length <= 85) score += 18;
  if (length > 0 && length < 95) score += 8;
  if (/[?:]/.test(value)) score += 8;
  if (/\b(how|why|what|mistakes|guide|before|after|best|simple)\b/i.test(value)) score += 12;
  if (words.length >= 5 && words.length <= 13) score += 9;
  return Math.min(100, score);
}

// ─────────────────────────────────────────────────────────────────────────────
// YouTube Search API
// ─────────────────────────────────────────────────────────────────────────────

async function searchYouTube(query: string): Promise<{ videos: VideoResult[], suggestions: string[] }> {
  const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  const data = await res.json() as { videos?: VideoResult[]; suggestions?: string[]; error?: string };
  if (!res.ok || !data.videos?.length) {
    throw new Error(data.error ?? "Could not fetch results from YouTube. Try again.");
  }
  return { videos: data.videos, suggestions: data.suggestions ?? [] };
}

type KeywordVolumeApiResult = {
  keyword: string;
  source: "youtube_autocomplete";
  volumeScore: number;
  uniqueSuggestions: number;
  exactSuggestionMatches: number;
  bestAutocompleteRank: number | null;
  expansionMatches: number;
  questionMatches: number;
  topSuggestions: string[];
};

async function enrichWithFreeYouTubeVolume(metrics: KeywordMetrics[]): Promise<KeywordMetrics[]> {
  if (!metrics.length) return metrics;

  try {
    const res = await fetch("/api/keyword-volume", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: metrics.map(metric => metric.tag) }),
    });
    const data = await res.json() as { source?: "youtube_autocomplete"; results?: KeywordVolumeApiResult[]; error?: string };

    if (!res.ok || !data.results?.length) {
      return metrics.map(metric => ({
        ...metric,
        volumeError: data.error,
      }));
    }

    const volumes = new Map(data.results.map(item => [normalizeKeyword(item.keyword), item]));
    const enriched = metrics.map(metric => {
      const volume = volumes.get(normalizeKeyword(metric.tag));
      if (!volume) return metric;

      const seoScore = Math.round(volume.volumeScore * 0.42 + (100 - metric.kdPercent) * 0.36 + metric.trendScore * 0.22);

      return {
        ...metric,
        searchVolume: volume.volumeScore,
        demandScore: volume.volumeScore,
        volumeSource: "youtube_autocomplete" as const,
        uniqueSuggestions: volume.uniqueSuggestions,
        exactSuggestionMatches: volume.exactSuggestionMatches,
        bestAutocompleteRank: volume.bestAutocompleteRank,
        expansionMatches: volume.expansionMatches,
        questionMatches: volume.questionMatches,
        topSuggestions: volume.topSuggestions,
        seoScore,
        confidence: Math.max(metric.confidence, 0.9),
        dataSources: unique([...metric.dataSources, "free YouTube autocomplete expansion"]),
        diagnostics: {
          ...metric.diagnostics,
          volumeMethod: "Free YouTube autocomplete expansion score from coverage, exact matches, rank, and questions",
        },
      };
    });

    return enriched.sort((a, b) => b.seoScore - a.seoScore || b.searchVolume - a.searchVolume);
  } catch {
    return metrics;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyword extraction from real video data
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the most significant words from real YouTube video titles.
 * Words appearing in earlier (higher-ranked) results get more weight.
 */
function extractKeywords(videos: VideoResult[], inputTopic: string): string[] {
  const inputWords = new Set(getWords(inputTopic));
  const freq = new Map<string, number>();

  videos.forEach((v, idx) => {
    const positionWeight = Math.max(1, videos.length - idx); // rank 1 = highest weight
    for (const word of getWords(v.title)) {
      if (!inputWords.has(word) && word.length >= 4) {
        freq.set(word, (freq.get(word) ?? 0) + positionWeight);
      }
    }
  });

  return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w);
}

/**
 * Extract unique channel names from search results.
 */
function extractChannels(videos: VideoResult[]): string[] {
  return unique(videos.map(v => v.channel).filter(Boolean));
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-tool YouTube-powered algorithms (Powered by Suggest API)
// ─────────────────────────────────────────────────────────────────────────────

function runTitleAlgorithm(topic: string, videos: VideoResult[], suggestions?: string[]): string[] {
  // If we have real autocomplete suggestions, they make the BEST titles because 
  // they are exactly what people are typing into YouTube.
  if (suggestions && suggestions.length > 0) {
    const raw = suggestions
      .filter(s => s.length > 10)
      .map(s => {
        // Capitalize exactly like a title
        return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      });
    return unique(raw).slice(0, 10);
  }

  // Fallback to our existing title recombination logic if suggestions failed
  const parts: { prefix: string; suffix: string }[] = [];
  for (const v of videos) {
    const t = v.title;
    if (t.includes(": ")) { const p = t.split(": "); parts.push({ prefix: p[0].trim(), suffix: p[1].trim() }); }
    else if (t.includes(" - ")) { const p = t.split(" - "); parts.push({ prefix: p[0].trim(), suffix: p[1].trim() }); }
    else if (t.includes(" | ")) { const p = t.split(" | "); parts.push({ prefix: p[0].trim(), suffix: p[1].trim() }); }
    else if (t.includes(" (")) { const p = t.split(" ("); parts.push({ prefix: p[0].trim(), suffix: p[1].replace(")", "").trim() }); }
  }

  const out = new Set<string>();
  const realTitles = new Set(videos.map(v => v.title.toLowerCase()));

  if (parts.length >= 2) {
    for (let i = 0; i < parts.length; i++) {
      for (let j = 0; j < parts.length; j++) {
        if (i !== j && parts[i].prefix && parts[j].suffix) {
          const combo1 = `${parts[i].prefix}: ${parts[j].suffix}`;
          if (!realTitles.has(combo1.toLowerCase())) out.add(combo1);
        }
      }
    }
  }

  if (out.size === 0) {
    videos.slice(0, 10).forEach(v => out.add(v.title));
  }

  return unique(Array.from(out)).slice(0, 10);
}

function runIdeaAlgorithm(topic: string, videos: VideoResult[], suggestions?: string[]): string[] {
  const out = new Set<string>();

  // Suggest API is literally a list of what people are searching for.
  // We can frame them as highly validated ideas.
  if (suggestions && suggestions.length > 0) {
    const questions = suggestions.filter(s => s.startsWith("how") || s.startsWith("why") || s.startsWith("what"));
    const lists = suggestions.filter(s => s.startsWith("best") || s.startsWith("top"));
    const others = suggestions.filter(s => !questions.includes(s) && !lists.includes(s));

    const pool = [...questions, ...lists, ...others].filter(s => s.length > 8);
    for (const idea of pool) {
      out.add(idea.charAt(0).toUpperCase() + idea.slice(1));
    }
    if (out.size >= 10) return Array.from(out).slice(0, 10);
  }
  
  // Fallback to top video modelling
  const sorted = [...videos].sort((a, b) => {
    const parseViews = (str: string) => {
      const match = str.match(/([\d.,]+)\s*[KMB]?/i);
      if (!match) return 0;
      let num = parseFloat(match[1].replace(/,/g, ""));
      if (str.toLowerCase().includes("k")) num *= 1000;
      if (str.toLowerCase().includes("m")) num *= 1000000;
      if (str.toLowerCase().includes("b")) num *= 1000000000;
      return num;
    };
    return parseViews(b.views) - parseViews(a.views);
  });

  for (const v of sorted.slice(0, 10)) {
    const viewText = v.views ? ` (Validated by ${v.views})` : "";
    out.add(`${v.title}${viewText}`);
  }

  return unique(Array.from(out)).slice(0, 10);
}


function normalizeKeyword(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

function parseCompactNumber(value: string) {
  const normalized = value.toLowerCase().replace(/,/g, "");
  const match = normalized.match(/([\d.]+)\s*([kmb])?/);
  if (!match) return 0;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return 0;
  const suffix = match[2];
  if (suffix === "b") return Math.round(base * 1000000000);
  if (suffix === "m") return Math.round(base * 1000000);
  if (suffix === "k") return Math.round(base * 1000);
  return Math.round(base);
}

function getPublishedRecencyScore(value: string) {
  const text = value.toLowerCase();
  if (/(minute|hour|today|yesterday)/.test(text)) return 100;
  if (text.includes("day")) return 92;
  if (text.includes("week")) return 82;
  if (text.includes("month")) return 62;
  if (text.includes("year")) return 32;
  const year = value.match(/\b(20\d{2})\b/)?.[1];
  if (year) return Math.max(15, 100 - (new Date().getFullYear() - Number(year)) * 18);
  return 45;
}

function keywordMatchesTitle(keyword: string, title: string) {
  const keywordTokens = getWords(keyword);
  if (!keywordTokens.length) return false;
  const titleTokens = new Set(getWords(title));
  const matches = keywordTokens.filter(token => titleTokens.has(token)).length;
  return matches / keywordTokens.length >= 0.65;
}

function getCompetitionLabel(kd: number): "low" | "medium" | "high" {
  if (kd >= 67) return "high";
  if (kd >= 38) return "medium";
  return "low";
}

function addKeywordCandidate(pool: Map<string, { source: "suggest" | "title"; rank: number; titleWeight: number }>, keyword: string, source: "suggest" | "title", rank: number, titleWeight = 0) {
  const cleaned = normalizeKeyword(keyword);
  const words = cleaned.split(" ").filter(Boolean);
  if (cleaned.length < 3 || words.length > 8) return;
  if (words.every(word => stopWords.has(word))) return;

  const existing = pool.get(cleaned);
  if (!existing) {
    pool.set(cleaned, { source, rank, titleWeight });
    return;
  }

  existing.rank = Math.min(existing.rank, rank);
  existing.titleWeight += titleWeight;
  if (source === "suggest") existing.source = "suggest";
}

function runKeywordAlgorithm(topic: string, videos: VideoResult[], suggestions: string[] = []): KeywordMetrics[] {
  const topicClean = normalizeKeyword(topic);
  const topicTokens = new Set(getWords(topicClean));
  const candidates = new Map<string, { source: "suggest" | "title"; rank: number; titleWeight: number }>();

  addKeywordCandidate(candidates, topicClean, "suggest", 0, videos.length);

  suggestions.forEach((suggestion, idx) => {
    const cleaned = normalizeKeyword(suggestion);
    if (!cleaned.includes(topicClean) && !getWords(cleaned).some(token => topicTokens.has(token))) return;
    addKeywordCandidate(candidates, cleaned, "suggest", idx + 1, Math.max(0, 30 - idx));
  });

  videos.forEach((video, videoIdx) => {
    const words = getWords(video.title);
    const rankWeight = Math.max(1, videos.length - videoIdx);

    for (let size = 2; size <= 5; size++) {
      for (let i = 0; i <= words.length - size; i++) {
        const phrase = words.slice(i, i + size).join(" ");
        const phraseTokens = getWords(phrase);
        if (!phraseTokens.some(token => topicTokens.has(token))) continue;
        addKeywordCandidate(candidates, phrase, "title", videos.length + videoIdx, rankWeight);
      }
    }
  });

  const maxViews = Math.max(...videos.map(video => parseCompactNumber(video.views)), 1);
  const maxTitleWeight = Math.max(...[...candidates.values()].map(candidate => candidate.titleWeight), 1);

  return [...candidates.entries()]
    .map(([tag, candidate]) => {
      const matchingVideos = videos.filter(video => keywordMatchesTitle(tag, video.title));
      const exactTitleMatches = videos.filter(video => normalizeKeyword(video.title).includes(tag)).length;
      const matchedChannels = new Set(matchingVideos.map(video => video.channel).filter(Boolean)).size;
      const bestMatchedViews = Math.max(...matchingVideos.map(video => parseCompactNumber(video.views)), 0);
      const avgRecency = matchingVideos.length
        ? matchingVideos.reduce((sum, video) => sum + getPublishedRecencyScore(video.published), 0) / matchingVideos.length
        : 45;

      const suggestScore = candidate.source === "suggest" ? Math.max(35, 105 - candidate.rank * 4) : 0;
      const titleScore = Math.min(100, (candidate.titleWeight / maxTitleWeight) * 100);
      const viewScore = bestMatchedViews > 0 ? Math.min(100, (Math.log10(bestMatchedViews + 1) / Math.log10(maxViews + 1)) * 100) : 0;
      const demandScore = Math.round(Math.min(100, suggestScore * 0.55 + titleScore * 0.3 + viewScore * 0.15));

      const matchPressure = Math.min(100, (matchingVideos.length / Math.max(videos.length, 1)) * 100);
      const exactPressure = Math.min(100, exactTitleMatches * 12);
      const channelPressure = Math.min(100, matchedChannels * 7);
      const kdPercent = Math.round(matchPressure * 0.45 + exactPressure * 0.35 + channelPressure * 0.2);
      const competition = getCompetitionLabel(kdPercent);

      const trendScore = Math.round(Math.min(100, avgRecency * 0.55 + suggestScore * 0.3 + (tag.includes(String(new Date().getFullYear())) ? 100 : 50) * 0.15));
      const trendDirection: KeywordMetrics["trendDirection"] = trendScore >= 68 ? "rising" : trendScore <= 38 ? "falling" : "stable";
      const seoScore = Math.round(demandScore * 0.42 + (100 - kdPercent) * 0.36 + trendScore * 0.22);
      const confidence = Math.min(0.92, 0.55 + (candidate.source === "suggest" ? 0.2 : 0) + (matchingVideos.length ? 0.12 : 0) + (bestMatchedViews ? 0.05 : 0));

      return {
        tag,
        searchVolume: demandScore,
        demandScore,
        volumeSource: "youtube_demand" as const,
        competition,
        competitionScore: kdPercent,
        kdPercent,
        trendScore,
        trendDirection,
        isTrending: trendDirection === "rising",
        seoScore,
        videoCount: matchingVideos.length,
        confidence,
        dataSources: [
          candidate.source === "suggest" ? "YouTube autocomplete" : "YouTube result titles",
          matchingVideos.length ? "live YouTube SERP" : "",
          bestMatchedViews ? "visible view counts" : "",
        ].filter(Boolean),
        diagnostics: {
          volumeMethod: "0-100 demand score from autocomplete rank, title frequency, and top-result views",
          kdMethod: "competition from exact title matches, sampled result saturation, and channel diversity",
          trendMethod: "trend score from autocomplete presence and visible result recency",
          gaps: ["Exact monthly YouTube search volume is not exposed by YouTube public APIs."],
          improvements: ["Connect a licensed keyword-volume provider to show exact monthly volume."],
        },
      };
    })
    .filter(keyword => keyword.searchVolume >= 12 || keyword.videoCount > 0)
    .sort((a, b) => b.seoScore - a.seoScore || b.searchVolume - a.searchVolume)
    .slice(0, 25);
}

function runNameAlgorithm(topic: string, videos: VideoResult[]): string[] {
  const channels = extractChannels(videos);
  
  // Extract all words from actual competing channel names
  const words: string[] = [];
  for (const c of channels) {
    const parts = c.split(/[\s_-]+/);
    words.push(...parts.filter(p => p.length > 2));
  }
  const cleanWords = unique(words).map(titleCase);
  
  const out = new Set<string>();
  const topicWords = getWords(topic).map(titleCase);
  const base = topicWords[0] || "Channel";

  // Generate names by recombining actual words used by real channels in this niche
  for (let i = 0; i < Math.min(cleanWords.length, 15); i++) {
    const w = cleanWords[i];
    if (w.toLowerCase() !== base.toLowerCase()) {
      out.add(`${base} ${w}`);
      out.add(`${w} ${base}`);
      out.add(`${w} HQ`);
      out.add(`The ${w} Project`);
    }
  }
  
  // Fallbacks if we didn't get enough words
  if (out.size < 5) {
    out.add(`${base} Insider`);
    out.add(`${base} Daily`);
    channels.slice(0, 3).forEach(c => out.add(`${c} (Example competitor)`));
  }

  return unique(Array.from(out)).slice(0, 10);
}

function runPodcastTitleAlgorithm(topic: string, videos: VideoResult[]): string[] {
  // Extract structural parts from real podcast/interview titles
  const parts: { prefix: string; suffix: string }[] = [];
  for (const v of videos) {
    const t = v.title;
    if (t.includes(": ")) { const p = t.split(": "); parts.push({ prefix: p[0].trim(), suffix: p[1].trim() }); }
    else if (t.includes(" | ")) { const p = t.split(" | "); parts.push({ prefix: p[0].trim(), suffix: p[1].trim() }); }
    else if (t.includes(" with ")) { const p = t.split(/ with /i); parts.push({ prefix: p[0].trim(), suffix: `with ${p[1].trim()}` }); }
  }

  const out = new Set<string>();
  const realTitles = new Set(videos.map(v => v.title.toLowerCase()));

  // Recombine hooks (prefixes) and payoffs (suffixes) from real podcast results
  if (parts.length >= 2) {
    for (let i = 0; i < parts.length; i++) {
      for (let j = 0; j < parts.length; j++) {
        if (i !== j && parts[i].prefix && parts[j].suffix) {
          const combo = `${parts[i].prefix}: ${parts[j].suffix}`;
          if (!realTitles.has(combo.toLowerCase())) out.add(combo);
        }
      }
    }
  }

  // Fallback: showcase the exact top performing podcast titles as models
  if (out.size < 10) {
    for (const v of videos.slice(0, 5)) {
      out.add(v.title);
    }
  }

  return unique(Array.from(out)).slice(0, 10);
}

function runCategoryAlgorithm(topic: string, videos: VideoResult[]): { category: string; evidence: string } {
  const allTitles = videos.map(v => v.title.toLowerCase());

  const signals: Record<string, RegExp> = {
    "Education & How-To": /how to|tutorial|learn|guide|course|step|explain|understand/,
    "Gaming":             /game|minecraft|fortnite|roblox|gaming|play|stream/,
    "Music":              /music|song|beat|sound|track|album|artist|listen/,
    "News & Politics":    /news|update|politics|election|breaking|current/,
    "Entertainment":      /funny|comedy|prank|challenge|react|watch|shorts/,
    "Health & Fitness":   /workout|fitness|diet|health|exercise|gym|weight/,
    "Tech & Gadgets":     /tech|review|unbox|gadget|phone|app|software|coding/,
    "Business & Finance": /money|business|invest|income|earn|passive|profit|startup/,
    "People & Vlogs":     /vlog|day in|travel|food|lifestyle|family|daily/,
    "Howto & Style":      /style|fashion|beauty|makeup|hair|design|creative/,
  };

  const scores: Record<string, number> = {};
  for (const [cat, pattern] of Object.entries(signals)) {
    scores[cat] = allTitles.filter(t => pattern.test(t)).length;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const best = sorted[0];
  const category = best?.[0] ?? "Howto & Style";
  const count = best?.[1] ?? 0;

  const evidence = count >= 3
    ? `${count} of ${allTitles.length} top YouTube results for "${topic}" match this category.`
    : `Weak signal - fewer than 3 direct matches. YouTube's actual category is set inside Studio.`;

  return { category, evidence };
}

function runTop100Algorithm(topic: string, videos: VideoResult[]): string[] {
  const channels = extractChannels(videos);
  const topKw = extractKeywords(videos, topic);
  const allTitles = videos.map(v => v.title.toLowerCase());

  // Analyse unique channels (measures competition density)
  const uniqueChannels = new Set(channels).size;
  const repeatedChannels = channels.filter((c, i) => channels.indexOf(c) !== i);

  // Format distribution from real data
  const howToCount    = allTitles.filter(t => /^how\s+to/.test(t)).length;
  const numberCount   = allTitles.filter(t => /\b\d+\b/.test(t)).length;
  const questionCount = allTitles.filter(t => /\?/.test(t)).length;

  const dominantKw = topKw.slice(0, 3).map(w => titleCase(w)).join(", ");
  const dominant = [
    howToCount > numberCount && howToCount > questionCount ? "How-To tutorials" :
    numberCount > questionCount ? "list/number-based videos" : "curiosity-gap questions"
  ][0];

  const insights: string[] = [
    `Analysed ${videos.length} real YouTube results for "${topic}".`,
    `${uniqueChannels} different channels appear - ${uniqueChannels <= 5 ? "niche is concentrated around a few big players" : "space is spread across many creators, good entry opportunity"}.`,
  ];

  if (repeatedChannels.length) {
    insights.push(`"${repeatedChannels[0]}" appears multiple times - likely the dominant channel in this niche.`);
  }

  insights.push(
    `Most common title format on YouTube for this topic: ${dominant}.`,
    `Top keywords in high-ranking videos: ${dominantKw || topic}.`,
    howToCount >= 3
      ? "How-to content dominates - viewers want step-by-step, actionable videos."
      : "Informational/entertainment formats are performing well - consider story-driven or data-led angles.",
    numberCount >= 3
      ? "Numbered list videos (5 tips, 7 mistakes) get strong click-through in this niche."
      : "List formats are underused here - could be a differentiation angle.",
    `To break into this space: consistent publish schedule + strong thumbnail + specific ${dominantKw || topic} angle in every title.`,
  );

  return insights;
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy text helper
// ─────────────────────────────────────────────────────────────────────────────

function resultToCopyText(result: ToolResult): string {
  switch (result.kind) {
    case "thumbnails":
      return ["maxresdefault","hqdefault","mqdefault","default"]
        .map(k => `https://img.youtube.com/vi/${result.videoId}/${k}.jpg`).join("\n");
    case "embed":
      return `Share URL: ${result.shareUrl}\n\nEmbed code:\n${result.embedCode}`;
    case "metadata":
      return [
        `Title: ${result.meta.title}`, `Channel: ${result.meta.channelName || "Not shown"}`, "",
        "Description:", result.meta.description || "No public description found.", "",
        "Tags:", result.meta.tags.join(", ") || "No public tags found.", "",
        "Hashtags:", result.meta.hashtags.join(" ") || "No hashtags found.",
      ].join("\n");
    case "tags-inspector":
      return result.meta.tags.join(", ");
    case "data":        return JSON.stringify(result.meta, null, 2);
    case "labeled-links": return result.items.map(i => `${i.label}: ${i.url}`).join("\n");
    case "subscribe":   return result.url;
    case "money":
      return `Estimated revenue: $${result.revenue.toFixed(2)}\nViews: ${result.views.toLocaleString()}\nRPM: $${result.rpm.toFixed(2)}`;
    case "playlist": {
      const total = result.videos.reduce((acc, v) => acc + v.durationSeconds, 0);
      return [`Total: ${formatDuration(total)}`,
        `1.25×: ${formatDuration(total/1.25)}`,
        `1.5×: ${formatDuration(total/1.5)}`,
        `2×: ${formatDuration(total/2)}`].join("\n");
    }
    case "playlist-text":
      return result.videos.map((v, i) => `${i + 1}. ${v.title} (${formatDuration(v.durationSeconds)})`).join("\n");
    case "picker":      return `Winner: ${result.winner}\nEntries: ${result.count}`;
    case "score":       return [`Score: ${result.score}/100`, ...result.notes].join("\n");
    case "category":    return `Category: ${result.category}\nKeyword: ${result.keyword}\n${result.evidence}`;
    case "chips": case "list": case "insights": case "text-list":
      return result.items.join("\n");
    case "yt-analysis":
      return result.videos.map(v => `${v.title} - ${v.channel}`).join("\n");
    // New result types
    case "clean-url":       return result.cleaned;
    case "embed-code":      return result.code;
    case "thumbnail-preview": return `https://img.youtube.com/vi/${result.videoId}/maxresdefault.jpg`;
    case "channel-age":    return `Channel: ${result.title}\nCreated: ${result.publishedAt}\nAge: ${Math.floor(result.ageDays/365)}y ${Math.floor((result.ageDays%365)/30)}m`;
    case "region-check":   return result.isGloballyAvailable ? "Available worldwide" : `Allowed: ${result.allowed.join(", ")}\nBlocked: ${result.blocked.join(", ")}`;
    case "upload-schedule": return `Best day: ${result.bestDay}\nBest hour: ${result.bestHour}\nAvg/month: ${result.avgUploadsPerMonth}`;
    case "channel-compare": return `${result.channel1.title}: ${result.channel1.subscriberCount} subs\n${result.channel2.title}: ${result.channel2.subscriberCount} subs`;
    case "video-seo":      return `SEO Score: ${result.score}/100\n${result.checks.map(c => `${c.passed ? '✓' : '✗'} ${c.label}: ${c.note}`).join("\n")}`;
    case "channel-videos": return result.videos.map(v => v.url).join("\n");
    case "rss-url":        return result.rssUrl;
    case "comments-export": return result.comments.map(c => `${c.author}: ${c.text}`).join("\n");
    case "video-category": return `Category: ${result.categoryName} (ID: ${result.categoryId})`;
    case "playlist-links": return result.videos.map((v, i) => `${i+1}. ${v.url}`).join("\n");
    case "advanced-keywords": return result.keywords.map(k => `${k.tag} (Free YouTube volume score: ${k.demandScore}/100, suggestions: ${k.uniqueSuggestions ?? 0}, KD: ${k.kdPercent}%, SEO: ${k.seoScore})`).join("\n");
    case "ctr": case "title-length": case "desc-length": case "playback-speed": case "views-ratio": case "shorts-trend":
      return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-render components
// ─────────────────────────────────────────────────────────────────────────────

function ThumbnailResult({ videoId, customUrl, onCopy, copyTarget }: { videoId: string; customUrl?: string; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  const resolutions = [
    { key: "maxresdefault", label: "Max Res", size: "1280 × 720" },
    { key: "hqdefault",     label: "HQ",       size: "480 × 360"  },
    { key: "mqdefault",     label: "MQ",       size: "320 × 180"  },
    { key: "default",       label: "Default",  size: "120 × 90"   },
  ];
  if (customUrl) {
    return (
      <div className={styles.thumbnailGrid}>
        <div className={styles.thumbnailCard} style={{ gridColumn: "1 / -1", maxWidth: "800px", margin: "0 auto" }}>
          <div className={styles.thumbnailImgWrap}>
            <img src={customUrl} alt="YouTube Banner" className={styles.thumbnailImg} style={{ objectFit: "contain" }} referrerPolicy="no-referrer" />
          </div>
          <div className={styles.thumbnailFoot}>
            <div>
              <span className={styles.thumbnailRes}>Banner Image</span>
            </div>
            <div className={styles.thumbnailBtns}>
              <a href={customUrl} target="_blank" rel="noopener noreferrer" className={`${styles.smButton} ${styles.smButtonPrimary}`}>Open ↗</a>
              <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(customUrl, customUrl)}>
                {copyTarget === customUrl ? "Copied" : "Copy URL"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.thumbnailGrid}>
      {resolutions.map(({ key, label, size }) => {
        const url = `https://img.youtube.com/vi/${videoId}/${key}.jpg`;
        return (
          <div key={key} className={styles.thumbnailCard}>
            <div className={styles.thumbnailImgWrap}>
              <img src={url} alt={`${label} thumbnail`} className={styles.thumbnailImg}
                referrerPolicy="no-referrer"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  e.currentTarget.parentElement?.classList.add(styles.thumbnailImgMissing);
                }}
              />
            </div>
            <div className={styles.thumbnailFoot}>
              <div>
                <span className={styles.thumbnailRes}>{label}</span>
                <span className={styles.thumbnailSize}>{size}</span>
              </div>
              <div className={styles.thumbnailBtns}>
                <a href={url} target="_blank" rel="noopener noreferrer" className={`${styles.smButton} ${styles.smButtonPrimary}`}>Open ↗</a>
                <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(url, url)}>
                  {copyTarget === url ? "Copied" : "Copy URL"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmbedResult({ result, onCopy, copyTarget }: { result: Extract<ToolResult, { kind: "embed" }>; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.embedResultStack}>
      <div className={styles.embedPreviewWrap}>
        <iframe src={result.embedUrl} title="YouTube video preview" className={styles.embedIframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
      <div className={styles.embedCards}>
        <div className={styles.embedCard}>
          <span className={styles.embedCardLabel}>Share URL</span>
          <div className={styles.embedCardRow}>
            <span className={styles.embedCardValue}>{result.shareUrl}</span>
            <div className={styles.embedCardBtns}>
              <a href={result.shareUrl} target="_blank" rel="noopener noreferrer" className={`${styles.smButton} ${styles.smButtonPrimary}`}>Open ↗</a>
              <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(result.shareUrl, "share")}>
                {copyTarget === "share" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
        <div className={styles.embedCard}>
          <span className={styles.embedCardLabel}>Embed Code</span>
          <textarea className={styles.embedCodeBox} readOnly value={result.embedCode} aria-label="Embed code" />
          <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(result.embedCode, "embed")}>
            {copyTarget === "embed" ? "Copied ✓" : "Copy embed code"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetadataResult({ meta, onCopy, copyTarget }: { meta: YouTubeMetadata; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.metaFieldStack}>
      <div className={styles.metaField}>
        <div className={styles.metaFieldTop}><span className={styles.metaFieldLabel}>Title</span>
          <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(meta.title, "title")}>{copyTarget === "title" ? "Copied" : "Copy"}</button>
        </div>
        <p className={styles.metaFieldValue}>{meta.title || " - "}</p>
      </div>
      {meta.channelName ? (
        <div className={styles.metaField}>
          <div className={styles.metaFieldTop}><span className={styles.metaFieldLabel}>Channel</span>
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(meta.channelName, "channel")}>{copyTarget === "channel" ? "Copied" : "Copy"}</button>
          </div>
          <p className={styles.metaFieldValue}>{meta.channelName}</p>
        </div>
      ) : null}
      {meta.description ? (
        <div className={styles.metaField}>
          <div className={styles.metaFieldTop}><span className={styles.metaFieldLabel}>Description</span>
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(meta.description, "desc")}>{copyTarget === "desc" ? "Copied" : "Copy"}</button>
          </div>
          <textarea className={styles.metaDescBox} readOnly value={meta.description} aria-label="Video description" />
        </div>
      ) : null}
      {meta.tags.length > 0 ? (
        <div className={styles.metaField}>
          <div className={styles.metaFieldTop}><span className={styles.metaFieldLabel}>Tags ({meta.tags.length})</span>
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(meta.tags.join(", "), "tags")}>{copyTarget === "tags" ? "Copied" : "Copy all"}</button>
          </div>
          <div className={styles.metaChips}>
            {meta.tags.map(tag => (
              <button key={tag} type="button" className={styles.metaChip} onClick={() => onCopy(tag, tag)}>{copyTarget === tag ? "✓" : tag}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.metaField}><span className={styles.metaFieldLabel}>Tags</span><p className={styles.metaFieldMuted}>No public tags found for this video.</p></div>
      )}
      {meta.hashtags.length > 0 ? (
        <div className={styles.metaField}>
          <div className={styles.metaFieldTop}><span className={styles.metaFieldLabel}>Hashtags ({meta.hashtags.length})</span>
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(meta.hashtags.join(" "), "hashtags")}>{copyTarget === "hashtags" ? "Copied" : "Copy all"}</button>
          </div>
          <div className={styles.metaChips}>
            {meta.hashtags.map(tag => (
              <button key={tag} type="button" className={styles.metaChipHashtag} onClick={() => onCopy(tag, tag)}>{copyTarget === tag ? "✓" : tag}</button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function calculateTagRelevance(tag: string, title: string, description: string): number {
  const t = tag.toLowerCase().trim();
  const titleLow = title.toLowerCase();
  const descLow = description.toLowerCase();

  if (!t) return 0;

  let score = 0;
  if (titleLow.includes(t)) {
    score += 60;
  } else {
    const words = t.split(/\s+/);
    let titleMatches = 0;
    words.forEach(w => {
      if (w.length > 2 && titleLow.includes(w)) titleMatches++;
    });
    if (words.length > 0) {
      score += (titleMatches / words.length) * 30;
    }
  }

  if (descLow.includes(t)) {
    score += 30;
  } else {
    const words = t.split(/\s+/);
    let descMatches = 0;
    words.forEach(w => {
      if (w.length > 2 && descLow.includes(w)) descMatches++;
    });
    if (words.length > 0) {
      score += (descMatches / words.length) * 15;
    }
  }

  const wordsCount = t.split(/\s+/).length;
  if (wordsCount === 1) score -= 10;
  if (wordsCount > 5) score -= 15;
  
  if (score < 10) score = Math.floor(Math.random() * 20) + 10;

  score = Math.min(100, Math.max(1, Math.round(score + 10))); 

  if (titleLow.includes(t)) {
    score = Math.max(90, score);
  }

  return score;
}

function TagsInspectorResult({ meta, onCopy, copyTarget }: { meta: YouTubeMetadata; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  const [removedTags, setRemovedTags] = useState<Set<string>>(new Set());

  const scoredTags = useMemo(() => {
    return meta.tags.map(tag => ({
      tag,
      score: calculateTagRelevance(tag, meta.title, meta.description || "")
    })).sort((a, b) => b.score - a.score);
  }, [meta.tags, meta.title, meta.description]);

  const activeTags = scoredTags.filter(t => !removedTags.has(t.tag));

  const handleCopyAll = () => {
    const textToCopy = activeTags.map(t => t.tag).join(", ");
    onCopy(textToCopy, "all-tags");
  };

  if (meta.tags.length === 0) {
    return (
      <div className={styles.metaFieldStack}>
        <div className={styles.metaField}>
          <span className={styles.metaFieldLabel}>Tags</span>
          <p className={styles.metaFieldMuted}>No public tags found for this video.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.metaFieldStack}>
      <div className={styles.metaField}>
        <div className={styles.metaFieldTop}>
          <span className={styles.metaFieldLabel} style={{textTransform: 'none'}}>
            Extracted "{meta.title}" tags :
          </span>
          <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={handleCopyAll}>
            {copyTarget === "all-tags" ? "Copied ✓" : "Copy to Clipboard"}
          </button>
        </div>
        
        <div className={styles.metaChips} style={{ gap: '0.8rem', marginTop: '0.5rem' }}>
          {activeTags.map(({ tag, score }) => {
            const isHigh = score >= 80;
            const isMed = score >= 50 && score < 80;
            
            const theme = isHigh 
              ? { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)' }
              : isMed
                ? { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.15)' }
                : { bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8', badgeBg: 'rgba(148, 163, 184, 0.15)' };

            return (
              <div 
                key={tag} 
                style={{ 
                  display: 'inline-flex', alignItems: 'stretch', 
                  background: theme.bg, 
                  borderRadius: '6px', 
                  border: `1px solid ${theme.border}`, 
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${theme.badgeBg}`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.5rem', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => setRemovedTags(prev => new Set(prev).add(tag))}
                    style={{ 
                      background: 'transparent', border: 'none', borderRadius: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    title="Remove tag"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  background: theme.badgeBg, color: theme.text, 
                  fontWeight: 600, fontSize: '0.75rem', padding: '0 0.6rem', 
                  borderLeft: `1px solid ${theme.border}` 
                }}>
                  {score}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DataResult({ meta, onCopy, copyTarget }: { meta: YouTubeMetadata; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  const stats = [
    { label: "Views",     value: meta.viewCount ? Number(meta.viewCount).toLocaleString("en-US") : " - " },
    { label: "Likes",     value: meta.likeCount || " - " },
    { label: "Comments",  value: meta.commentCount || " - " },
    { label: "Duration",  value: meta.durationSeconds ? formatDuration(Number(meta.durationSeconds)) : " - " },
    { label: "Published", value: meta.uploadDate?.slice(0, 10) || " - " },
    { label: "Video ID",  value: meta.videoId },
  ];
  return (
    <div className={styles.dataResultStack}>
      <div className={styles.metaField}><span className={styles.metaFieldLabel}>Title</span><p className={styles.metaFieldValue}>{meta.title}</p></div>
      {meta.channelName ? <div className={styles.metaField}><span className={styles.metaFieldLabel}>Channel</span><p className={styles.metaFieldValue}>{meta.channelName}</p></div> : null}
      <div className={styles.dataStatGrid}>{stats.map(({ label, value }) => (
        <div key={label} className={styles.dataStat}>
          <span className={styles.dataStatLabel}>{label}</span>
          <span className={styles.dataStatValue}>{value}</span>
        </div>
      ))}</div>
      {meta.tags.length > 0 ? (
        <div className={styles.metaField}>
          <div className={styles.metaFieldTop}><span className={styles.metaFieldLabel}>Tags ({meta.tags.length})</span>
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(meta.tags.join(", "), "tags")}>{copyTarget === "tags" ? "Copied" : "Copy all"}</button>
          </div>
          <div className={styles.metaChips}>{meta.tags.map(tag => (
            <button key={tag} type="button" className={styles.metaChip} onClick={() => onCopy(tag, tag)}>{copyTarget === tag ? "✓" : tag}</button>
          ))}</div>
        </div>
      ) : null}
    </div>
  );
}

function LabeledLinksResult({ items, onCopy, copyTarget }: { items: LabeledLink[]; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.linkCards}>
      {items.map(item => (
        <div key={item.label} className={styles.linkCard}>
          <div className={styles.linkCardInfo}>
            <span className={styles.linkCardLabel}>{item.label}</span>
            <span className={styles.linkCardUrl}>{item.url}</span>
          </div>
          <div className={styles.linkCardBtns}>
            {!item.isText ? <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${styles.smButton} ${styles.smButtonPrimary}`}>Open ↗</a> : null}
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(item.url, item.label)}>
              {copyTarget === item.label ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubscribeResult({ url, onCopy, copyTarget }: { url: string; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.subscribeCard}>
      <span className={styles.subscribeLabel}>✓ Subscribe confirmation link ready</span>
      <p className={styles.subscribeUrl}>{url}</p>
      <div className={styles.subscribeBtns}>
        <a href={url} target="_blank" rel="noopener noreferrer" className={`${styles.smButton} ${styles.smButtonPrimary}`}>Open link ↗</a>
        <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(url, "sub")}>{copyTarget === "sub" ? "Copied ✓" : "Copy URL"}</button>
      </div>
    </div>
  );
}

function MoneyResult({ revenue, views, rpm }: { revenue: number; views: number; rpm: number }) {
  return (
    <div className={styles.moneyStack}>
      <div className={styles.moneyHero}>
        <span className={styles.moneyHeroLabel}>Estimated Ad Revenue</span>
        <span className={styles.moneyHeroValue}>${revenue.toFixed(2)}</span>
      </div>
      <div className={styles.moneyStats}>
        <div className={styles.dataStat}><span className={styles.dataStatLabel}>Views</span><span className={styles.dataStatValue}>{new Intl.NumberFormat("en-US").format(views)}</span></div>
        <div className={styles.dataStat}><span className={styles.dataStatLabel}>RPM (est.)</span><span className={styles.dataStatValue}>${rpm.toFixed(2)}</span></div>
      </div>
      <p className={styles.moneyNote}>Actual earnings vary by niche, audience location, season, and monetized playback rate.</p>
    </div>
  );
}

function PlaylistResult({ videos }: { videos: PlaylistVideoFrontend[] }) {
  const [startRange, setStartRange] = useState(1);
  const [endRange, setEndRange] = useState(videos.length);
  const [customSpeed, setCustomSpeed] = useState<number | "">("");

  // Constrain range
  const validStart = Math.max(1, Math.min(startRange, videos.length));
  const validEnd = Math.max(validStart, Math.min(endRange, videos.length));

  // Calculate total seconds for the selected range
  const totalSeconds = useMemo(() => {
    return videos.slice(validStart - 1, validEnd).reduce((acc, vid) => acc + vid.durationSeconds, 0);
  }, [videos, validStart, validEnd]);

  const customSpeedValue = typeof customSpeed === "number" && customSpeed > 0 ? customSpeed : 1;
  const speeds = [
    { label: "1.25×", value: formatDuration(totalSeconds / 1.25) },
    { label: "1.5×",  value: formatDuration(totalSeconds / 1.5)  },
    { label: "1.75×", value: formatDuration(totalSeconds / 1.75) },
    { label: "2×",    value: formatDuration(totalSeconds / 2)    },
  ];
  if (customSpeedValue !== 1 && ![1.25, 1.5, 1.75, 2].includes(customSpeedValue)) {
     speeds.push({ label: `${customSpeedValue}×`, value: formatDuration(totalSeconds / customSpeedValue) });
  }

  return (
    <div className={styles.calcCard} style={{ marginTop: "2rem" }}>
      <div className={styles.calcContainer}>
        
        <div className={styles.calcTop} style={{ flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.calcControl}>
            <div className={styles.calcHeader}>
              <span className={styles.calcLabel}>Video Range</span>
              <span className={styles.calcVal}>{startRange} - {endRange}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
               <input
                  type="number"
                  min="1"
                  max={videos.length}
                  value={startRange}
                  onChange={(e) => setStartRange(Number(e.target.value))}
                  className={styles.calcInput}
                  placeholder="Start video (e.g. 1)"
               />
               <input
                  type="number"
                  min="1"
                  max={videos.length}
                  value={endRange}
                  onChange={(e) => setEndRange(Number(e.target.value))}
                  className={styles.calcInput}
                  placeholder={`End video (e.g. ${videos.length})`}
               />
            </div>
            <p className={styles.calcLimits} style={{ marginTop: "0.5rem", justifyContent: "center" }}>Total Videos Available: {videos.length}</p>
          </div>

          <div className={styles.calcControl}>
            <div className={styles.calcHeader}>
              <span className={styles.calcLabel}>Custom Playback Speed</span>
              <span className={styles.calcVal}>{customSpeed ? `${customSpeed}×` : "1×"}</span>
            </div>
            <input
               type="number"
               min="0.1"
               step="0.05"
               value={customSpeed}
               onChange={(e) => setCustomSpeed(e.target.value ? Number(e.target.value) : "")}
               className={styles.calcInput}
               placeholder="Custom speed (e.g., 2.25)"
               style={{ marginTop: "0.5rem", maxWidth: "200px" }}
            />
          </div>
        </div>

        <div className={styles.playlistStack} style={{ marginTop: "2rem" }}>
          <div className={styles.playlistHero}>
            <span className={styles.playlistHeroLabel}>Total Watch Time ({validStart} - {validEnd})</span>
            <span className={styles.playlistHeroValue}>{formatDuration(totalSeconds)}</span>
          </div>
          <div className={styles.playlistSpeedGrid}>
            {speeds.map(({ label, value }) => (
              <div key={label} className={styles.playlistSpeedCard}>
                <span className={styles.playlistSpeedLabel}>{label}</span>
                <span className={styles.playlistSpeedValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PickerResult({ winner, count, allComments, onReroll }: { winner: string; count: number; allComments: string[]; onReroll: () => void }) {
  return (
    <div className={styles.pickerResult}>
      <span className={styles.pickerLabel}>🏆 Winner</span>
      <p className={styles.pickerWinner}>{winner}</p>
      <p className={styles.pickerCount}>{count} entries counted</p>
      <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} style={{ margin: "0 auto" }} onClick={onReroll}>Pick again</button>
    </div>
  );
}

function ScoreRingSvg({ score }: { score: number }) {
  const r = 34, circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  const color = score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : "#f87171";
  return (
    <div className={styles.scoreRing}>
      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${progress} ${circ}`} strokeLinecap="round" transform="rotate(-90 40 40)" />
      </svg>
      <div className={styles.scoreRingText}>
        <span className={styles.scoreNum}>{score}</span>
        <span className={styles.scoreOf}>/100</span>
      </div>
    </div>
  );
}

function ScoreResult({ score, notes }: { score: number; notes: string[] }) {
  const verdict = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs work" : "Poor";
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#facc15" : score >= 40 ? "#fb923c" : "#f87171";
  const bg = score >= 80 ? "rgba(16,185,129,0.1)" : score >= 60 ? "rgba(250,204,21,0.1)" : score >= 40 ? "rgba(251,146,60,0.1)" : "rgba(248,113,113,0.1)";

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={styles.dataResultStack}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem", background: bg, border: `1px solid ${color}40`, borderRadius: "12px" }}>
        <div style={{ position: "relative", width: "90px", height: "90px", flexShrink: 0 }}>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r={radius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle cx="45" cy="45" r={radius} fill="transparent" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
          </svg>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          </div>
        </div>
        <div>
          <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" }}>{verdict}</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>Based on proven title frameworks and platform best practices.</p>
        </div>
      </div>
      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>Analysis Notes</span>
        <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
          {notes.map((note, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", alignItems: "flex-start" }}>
              <span style={{ color: "var(--brand-orange)", marginTop: "2px", flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryResult({ category, keyword, evidence }: { category: string; keyword: string; evidence: string }) {
  return (
    <div className={styles.dataResultStack}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem", background: "rgba(255,90,54,0.08)", border: "1px solid rgba(255,90,54,0.2)", borderRadius: "12px" }}>
        <span style={{ fontSize: "2.5rem" }}>📌</span>
        <div>
          <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--brand-orange)", fontWeight: 700 }}>Estimated YouTube Category</p>
          <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--foreground)" }}>{category}</h3>
        </div>
      </div>
      
      {keyword && (
        <div className={styles.metaField}>
          <span className={styles.metaFieldLabel}>Keyword Analyzed</span>
          <p className={styles.metaFieldValue} style={{ fontWeight: 600 }}>{keyword}</p>
        </div>
      )}

      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>Algorithm Signal</span>
        <div style={{ display: "flex", gap: "0.75rem", padding: "0.85rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", alignItems: "flex-start", marginTop: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>🤖</span>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
            {evidence}
          </p>
        </div>
        <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
          Tip: YouTube relies heavily on title/description semantics to auto-categorize videos. Ensure your core topic keyword appears in the first 50 characters of your title to strongly signal this category to the algorithm.
        </p>
      </div>
    </div>
  );
}

function ListResult({ items, onCopy, copyTarget }: { items: string[]; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.listCards}>
      {items.map((item, i) => (
        <button key={item} type="button" className={styles.listCard} onClick={() => onCopy(item, item)} title="Click to copy">
          <span className={styles.listCardNum}>{i + 1}</span>
          <span className={styles.listCardText}>{item}</span>
          <span className={styles.listCardCopy}>{copyTarget === item ? "Copied ✓" : "Click to copy"}</span>
        </button>
      ))}
    </div>
  );
}

function ChipsResult({ items, onCopy, copyTarget }: { items: string[]; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.tagsWrap}>
      {items.slice(0, 32).map(item => (
        <button key={item} className={styles.tagChip} type="button" onClick={() => onCopy(item, item)}>
          {copyTarget === item ? "Copied ✓" : item}
        </button>
      ))}
    </div>
  );
}

function InsightsResult({ items }: { items: string[] }) {
  return (
    <div className={styles.insightCards}>
      {items.map(item => (
        <div key={item} className={styles.insightCard}>
          <span className={styles.insightDot} aria-hidden="true" />
          <span className={styles.insightText}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TextListResult({ items, onCopy, copyTarget }: { items: string[]; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.textListWrap}>
      {items.map((item, i) => (
        <div key={i} className={styles.textListRow}>
          <span className={styles.textListText}>{item}</span>
          {item.startsWith("http") ? (
            <a href={item} target="_blank" rel="noopener noreferrer" className={`${styles.smButton} ${styles.smButtonPrimary}`}>Open ↗</a>
          ) : (
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(item, item)}>{copyTarget === item ? "Copied" : "Copy"}</button>
          )}
        </div>
      ))}
    </div>
  );
}

// Renders YouTube search results that backed the analysis
function YtSourceVideos({ videos }: { videos: VideoResult[] }) {
  return (
    <details className={styles.ytSourceDetails}>
      <summary className={styles.ytSourceSummary}>
        Based on {videos.length} real YouTube results ↓
      </summary>
      <div className={styles.ytSourceList}>
        {videos.map(v => (
          <a
            key={v.videoId}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ytSourceItem}
          >
            <span className={styles.ytSourceTitle}>{v.title}</span>
            {v.channel ? <span className={styles.ytSourceChannel}>{v.channel}</span> : null}
          </a>
        ))}
      </div>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// New tool sub-components
// ─────────────────────────────────────────────────────────────────────────────

function CtrCalculator() {
  const [impressions, setImpressions] = useState(10000);
  const [clicks, setClicks] = useState(400);
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const rating = ctr >= 10 ? "Excellent" : ctr >= 5 ? "Good" : ctr >= 2 ? "Average" : "Below Average";
  const ratingColor = ctr >= 10 ? "#4ade80" : ctr >= 5 ? "#facc15" : ctr >= 2 ? "#fb923c" : "#f87171";
  const fmt = (n: number) => n.toLocaleString("en-US");
  return (
    <div className={styles.calcContainer}>
      <div className={styles.calcTop}>
        <div className={styles.calcControl}>
          <div className={styles.calcHeader}>
            <span className={styles.calcLabel}>Impressions</span>
            <span className={styles.calcVal}>{fmt(impressions)}</span>
          </div>
          <div className={styles.calcSliderWrap}>
            <input type="range" min="0" max="1000000" step="1000" value={Math.min(impressions, 1000000)}
              onChange={e => setImpressions(Number(e.target.value))} className={styles.calcSlider}
              style={{ background: `linear-gradient(to right, #ff5a36 ${Math.min(100, impressions/10000)}%, rgba(255,90,54,0.2) ${Math.min(100, impressions/10000)}%)` }} />
            <div className={styles.calcLimits}><span>0</span><span>1,000,000</span></div>
          </div>
          <input type="text" value={fmt(impressions)} onChange={e => setImpressions(Number(e.target.value.replace(/,/g,"")) || 0)} className={styles.calcInput} />
        </div>
        <div className={styles.calcControl}>
          <div className={styles.calcHeader}>
            <span className={styles.calcLabel}>Clicks</span>
            <span className={styles.calcVal}>{fmt(clicks)}</span>
          </div>
          <div className={styles.calcSliderWrap}>
            <input type="range" min="0" max={Math.max(impressions, 1000)} step="10" value={Math.min(clicks, Math.max(impressions, 1000))}
              onChange={e => setClicks(Number(e.target.value))} className={styles.calcSlider}
              style={{ background: `linear-gradient(to right, #ff5a36 ${Math.min(100, (clicks/Math.max(impressions,1))*100)}%, rgba(255,90,54,0.2) ${Math.min(100, (clicks/Math.max(impressions,1))*100)}%)` }} />
            <div className={styles.calcLimits}><span>0</span><span>{fmt(Math.max(impressions, 1000))}</span></div>
          </div>
          <input type="text" value={fmt(clicks)} onChange={e => setClicks(Number(e.target.value.replace(/,/g,"")) || 0)} className={styles.calcInput} />
        </div>
      </div>
      <div className={styles.calcBottom}>
        <div className={styles.calcCard} style={{ gridColumn: "1 / -1", textAlign: "center" }}>
          <span className={styles.calcCardLabel}>Click-Through Rate</span>
          <span className={styles.calcCardValue} style={{ fontSize: "2.5rem", color: ratingColor }}>{ctr.toFixed(2)}%</span>
          <span style={{ fontSize: "0.85rem", color: ratingColor, fontWeight: 700, marginTop: "0.25rem", display: "block" }}>{rating}</span>
        </div>
        <div className={styles.calcCard}>
          <span className={styles.calcCardLabel}>Industry Avg</span>
          <span className={styles.calcCardValue}>2–10%</span>
        </div>
        <div className={styles.calcCard}>
          <span className={styles.calcCardLabel}>Top Creators</span>
          <span className={styles.calcCardValue}>10–20%</span>
        </div>
      </div>
      <p className={styles.moneyNote}>CTR = (Clicks ÷ Impressions) × 100. YouTube&apos;s average CTR is 2–10% - above 10% is excellent thumbnail+title performance.</p>
    </div>
  );
}

function TitleLengthChecker() {
  const [text, setText] = useState("");
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const displayLimit = 60;
  const maxLimit = 100;
  const truncated = text.length > displayLimit ? text.slice(0, displayLimit) + "..." : text;
  
  let score = 100;
  let status = "Optimal length";
  if (chars === 0) { score = 0; status = ""; }
  else if (chars > maxLimit) { score = 20; status = "Too long - YouTube will truncate"; }
  else if (chars > 70) { score = 60; status = "A bit long - might truncate on mobile"; }
  else if (chars < 30) { score = 50; status = "Too short - missing keyword opportunities"; }

  const barColor = score >= 80 ? "#10b981" : score >= 60 ? "#facc15" : "#f87171";
  const pct = Math.min(100, (chars / maxLimit) * 100);
  
  return (
    <div className={styles.calcContainer}>
      <textarea
        className={styles.outputBox}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type or paste your YouTube video title here..."
        style={{ minHeight: "80px", resize: "vertical", borderColor: chars > 0 ? barColor : undefined }}
        maxLength={200}
      />
      <div style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <span style={{ color: chars > 0 ? barColor : "var(--text-secondary)", fontWeight: 700 }}>{chars} / {maxLimit} chars{status ? ` - ${status}` : ""}</span>
          <span>{words} words</span>
        </div>
        <div style={{ height: "8px", borderRadius: "4px", background: "var(--border)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "4px", transition: "width 0.3s ease, background 0.3s ease" }} />
        </div>
      </div>

      {text && (
        <div style={{ marginTop: "2rem", display: "grid", gap: "1.25rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1rem", background: `rgba(${score >= 80 ? '16,185,129' : score >= 60 ? '250,204,21' : '248,113,113'}, 0.08)`, border: `1px solid ${barColor}40`, borderRadius: "10px" }}>
             <div style={{ fontSize: "2rem", fontWeight: 800, color: barColor }}>{score}/100</div>
             <div>
               <p style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)" }}>Title SEO Score</p>
               <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>Titles between 40-60 characters generally perform best for CTR on mobile devices.</p>
             </div>
          </div>
          
          <div className={styles.metaField}>
            <span className={styles.metaFieldLabel}>Mobile Search Preview (approx {displayLimit} chars)</span>
            <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.2rem" }}>📱</span>
              <p className={styles.metaFieldValue} style={{ fontWeight: 600, margin: 0 }}>{truncated}</p>
            </div>
          </div>
          
          <div className={styles.dataStatGrid}>
            {[
              { label: "Characters", value: String(chars) },
              { label: "Words", value: String(words) },
              { label: "Limit", value: `${maxLimit} chars` },
              { label: "Remaining", value: chars <= maxLimit ? `${maxLimit - chars} left` : `${chars - maxLimit} over` },
            ].map(({ label, value }) => (
              <div key={label} className={styles.dataStat}>
                <span className={styles.dataStatLabel}>{label}</span>
                <span className={styles.dataStatValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DescriptionLengthChecker() {
  const [text, setText] = useState("");
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split("\n").length;
  const aboveFold = text.slice(0, 157);
  const aboveFoldFull = text.length <= 157;
  
  const hashtags = (text.match(/#[a-z0-9_]+/gi) || []);
  const uniqueHashtags = new Set(hashtags.map(h => h.toLowerCase())).size;

  let score = 100;
  if (chars === 0) score = 0;
  else {
    if (chars < 200) score -= 30;
    if (chars > 5000) score -= 50;
    if (uniqueHashtags === 0) score -= 20;
    if (uniqueHashtags > 15) score -= 40; // Over-optimization penalty
  }
  score = Math.max(0, score);
  
  const pct = Math.min(100, (chars / 5000) * 100);
  const barColor = chars > 5000 ? "#f87171" : chars > 3000 ? "#facc15" : "#10b981";
  const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#facc15" : "#f87171";

  return (
    <div className={styles.calcContainer}>
      <textarea
        className={styles.outputBox}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste your YouTube video description here..."
        style={{ minHeight: "140px", resize: "vertical", borderColor: chars > 0 ? barColor : undefined }}
      />
      <div style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <span style={{ color: chars > 0 ? barColor : "var(--text-secondary)", fontWeight: 700 }}>{chars.toLocaleString()} / 5,000 chars</span>
          <span>{words.toLocaleString()} words · {lines} lines</span>
        </div>
        <div style={{ height: "8px", borderRadius: "4px", background: "var(--border)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "4px", transition: "width 0.3s ease" }} />
        </div>
      </div>

      {text && (
        <div style={{ marginTop: "2rem", display: "grid", gap: "1.25rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1rem", background: `rgba(${score >= 80 ? '16,185,129' : score >= 60 ? '250,204,21' : '248,113,113'}, 0.08)`, border: `1px solid ${scoreColor}40`, borderRadius: "10px" }}>
             <div style={{ fontSize: "2rem", fontWeight: 800, color: scoreColor }}>{score}/100</div>
             <div>
               <p style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)" }}>Description SEO Score</p>
               <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>Aim for 250+ characters with 1-3 targeted hashtags for best search indexability.</p>
             </div>
          </div>

          <div className={styles.metaField}>
            <span className={styles.metaFieldLabel}>Above-the-Fold Preview (visible before &apos;Show more&apos;)</span>
            <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px" }}>
              <p className={styles.metaFieldValue} style={{ whiteSpace: "pre-wrap", margin: 0 }}>{aboveFold}{!aboveFoldFull ? <span style={{ color: "var(--brand-orange)", fontWeight: 700 }}>... [Show more]</span> : null}</p>
            </div>
          </div>

          <div className={styles.dataStatGrid}>
            {[
              { label: "Total Chars", value: chars.toLocaleString() },
              { label: "Hashtags", value: String(uniqueHashtags) },
              { label: "Lines", value: String(lines) },
              { label: "Links (approx)", value: String((text.match(/https?:\/\//g) || []).length) },
            ].map(({ label, value }) => (
              <div key={label} className={styles.dataStat}>
                <span className={styles.dataStatLabel}>{label}</span>
                <span className={styles.dataStatValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlaybackSpeedCalculator() {
  const [hours, setHours] = useState(1);
  const [mins, setMins] = useState(30);
  const [secs, setSecs] = useState(0);
  const totalSec = hours * 3600 + mins * 60 + secs;
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
  };
  const speeds = [
    { label: "1.25×", value: totalSec / 1.25 },
    { label: "1.5×",  value: totalSec / 1.5  },
    { label: "1.75×", value: totalSec / 1.75 },
    { label: "2×",    value: totalSec / 2    },
    { label: "2.5×", value: totalSec / 2.5  },
    { label: "3×",    value: totalSec / 3    },
  ];
  return (
    <div className={styles.calcContainer}>
      <div className={styles.calcTop}>
        <div className={styles.calcControl}>
          <span className={styles.calcLabel}>Video Duration</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Hours</label>
              <input type="number" min="0" max="23" value={hours} onChange={e => setHours(Number(e.target.value))} className={styles.calcInput} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Minutes</label>
              <input type="number" min="0" max="59" value={mins} onChange={e => setMins(Number(e.target.value))} className={styles.calcInput} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Seconds</label>
              <input type="number" min="0" max="59" value={secs} onChange={e => setSecs(Number(e.target.value))} className={styles.calcInput} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <div className={styles.calcBottom} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
          {speeds.map(({ label, value }) => (
            <div key={label} className={styles.calcCard}>
              <span className={styles.calcCardLabel}>At {label}</span>
              <span className={styles.calcCardValue} style={{ fontSize: "1.15rem" }}>{fmt(value)}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>saves {fmt(totalSec - value)}</span>
            </div>
          ))}
        </div>
      </div>
      <p className={styles.moneyNote}>Original: {fmt(totalSec)} total. Watching at 2× saves you {fmt(totalSec / 2)} of your time.</p>
    </div>
  );
}

function ViewsRatioCalculator() {
  const [views, setViews] = useState(100000);
  const [likes, setLikes] = useState(5000);
  const [comments, setComments] = useState(300);
  const likeRate = views > 0 ? (likes / views) * 100 : 0;
  const commentRate = views > 0 ? (comments / views) * 100 : 0;
  const engagementRate = likeRate + commentRate;
  const likeRating = likeRate >= 5 ? "Excellent" : likeRate >= 2 ? "Good" : likeRate >= 0.5 ? "Average" : "Low";
  const commentRating = commentRate >= 0.5 ? "High" : commentRate >= 0.1 ? "Normal" : "Low";
  const engagementRating = engagementRate >= 5 ? "Excellent" : engagementRate >= 2 ? "Good" : engagementRate >= 0.5 ? "Average" : "Low";
  const fmt = (n: number) => n.toLocaleString("en-US");
  const color = (pct: number) => pct >= 5 ? "#4ade80" : pct >= 2 ? "#facc15" : pct >= 0.5 ? "#fb923c" : "#f87171";
  return (
    <div className={styles.calcContainer}>
      <div className={styles.calcTop}>
        {([
          { label: "Views", value: views, set: setViews, max: 10000000 },
          { label: "Likes", value: likes, set: setLikes, max: 1000000 },
          { label: "Comments", value: comments, set: setComments, max: 100000 },
        ] as const).map(({ label, value, set, max }) => (
          <div key={label} className={styles.calcControl}>
            <div className={styles.calcHeader}>
              <span className={styles.calcLabel}>{label}</span>
              <span className={styles.calcVal}>{fmt(value)}</span>
            </div>
            <div className={styles.calcSliderWrap}>
              <input type="range" min="0" max={max} step={max / 1000} value={Math.min(value, max)}
                onChange={e => set(Number(e.target.value))} className={styles.calcSlider}
                style={{ background: `linear-gradient(to right, #ff5a36 ${Math.min(100, (value/max)*100)}%, rgba(255,90,54,0.2) ${Math.min(100, (value/max)*100)}%)` }} />
              <div className={styles.calcLimits}><span>0</span><span>{fmt(max)}</span></div>
            </div>
            <input type="text" value={fmt(value)}
              onChange={e => set(Number(e.target.value.replace(/,/g,"")) || 0)} className={styles.calcInput} />
          </div>
        ))}
      </div>
      <div className={styles.calcBottom}>
        {[
          { label: "Like Rate", value: likeRate, rating: likeRating },
          { label: "Comment Rate", value: commentRate, rating: commentRating },
          { label: "Engagement Rate", value: engagementRate, rating: engagementRating },
        ].map(({ label, value, rating }) => (
          <div key={label} className={styles.calcCard}>
            <span className={styles.calcCardLabel}>{label}</span>
            <span className={styles.calcCardValue} style={{ color: color(value), fontSize: "1.4rem" }}>{value.toFixed(2)}%</span>
            <span style={{ fontSize: "0.78rem", color: color(value), fontWeight: 700, marginTop: "0.2rem" }}>{rating}</span>
          </div>
        ))}
      </div>
      <p className={styles.moneyNote}>Industry avg: 1–5% like rate, 0.05–0.5% comment rate. Above 5% like rate is exceptional.</p>
    </div>
  );
}

function CleanUrlResult({ result, onCopy, copyTarget }: { result: Extract<ToolResult, { kind: "clean-url" }>; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.metaFieldStack}>
      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>Original URL</span>
        <p className={styles.metaFieldValue} style={{ opacity: 0.7, wordBreak: "break-all" }}>{result.original}</p>
      </div>
      <div className={styles.metaField}>
        <div className={styles.metaFieldTop}>
          <span className={styles.metaFieldLabel}>Clean URL</span>
          <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(result.cleaned, "cleaned")}>{copyTarget === "cleaned" ? "Copied ✓" : "Copy"}</button>
        </div>
        <p className={styles.metaFieldValue} style={{ wordBreak: "break-all", color: "var(--primary)" }}>{result.cleaned}</p>
      </div>
      {result.videoId && (
        <div className={styles.metaField}>
          <div className={styles.metaFieldTop}>
            <span className={styles.metaFieldLabel}>Video ID</span>
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(result.videoId, "vid")}>{copyTarget === "vid" ? "Copied ✓" : "Copy"}</button>
          </div>
          <p className={styles.metaFieldValue}>{result.videoId}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <a href={result.cleaned} target="_blank" rel="noopener noreferrer" className={`${styles.smButton} ${styles.smButtonPrimary}`}>Open ↗</a>
      </div>
    </div>
  );
}

function EmbedCodeResult({ result, onCopy, copyTarget }: { result: Extract<ToolResult, { kind: "embed-code" }>; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.embedResultStack}>
      <div className={styles.embedPreviewWrap} style={result.isShorts ? { maxWidth: "320px", aspectRatio: "9/16", margin: "0 auto" } : {}}>
        <iframe src={result.previewUrl} title="Preview" className={styles.embedIframe}
          style={result.isShorts ? { aspectRatio: "9/16", width: "100%", height: "auto" } : {}}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
      <div className={styles.embedCards}>
        <div className={styles.embedCard}>
          <span className={styles.embedCardLabel}>Embed Code</span>
          <textarea className={styles.embedCodeBox} readOnly value={result.code} aria-label="Embed code" />
          <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(result.code, "code")}>
            {copyTarget === "code" ? "Copied ✓" : "Copy embed code"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThumbnailPreviewResult({ videoId, title }: { videoId: string; title: string }) {
  const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const hq = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return (
    <div style={{ display: "grid", gap: "1.5rem", marginTop: "0.5rem" }}>
      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>YouTube Search Card Preview</span>
        <div style={{ background: "#0f0f0f", borderRadius: "12px", padding: "1rem", maxWidth: "360px", marginTop: "0.5rem" }}>
          <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", aspectRatio: "16/9", background: "#1a1a1a" }}>
            <img src={hq} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer"
              onError={e => { (e.currentTarget as HTMLImageElement).src = thumb; }} />
            <div style={{ position: "absolute", bottom: "6px", right: "6px", background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 5px", borderRadius: "3px" }}>HD</div>
          </div>
          <div style={{ marginTop: "0.6rem" }}>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.3, margin: 0 }}>{title || "Your Video Title Here"}</p>
            <p style={{ color: "#aaa", fontSize: "0.75rem", marginTop: "0.25rem" }}>Channel Name • 1.2M views • 2 weeks ago</p>
          </div>
        </div>
      </div>
      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>Mobile Feed Preview</span>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "1rem", maxWidth: "320px", marginTop: "0.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <div style={{ position: "relative", borderRadius: "6px", overflow: "hidden", width: "120px", flexShrink: 0, aspectRatio: "16/9", background: "#e5e7eb" }}>
              <img src={hq} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer"
                onError={e => { (e.currentTarget as HTMLImageElement).src = thumb; }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#0f0f0f", fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.3, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title || "Your Video Title Here"}</p>
              <p style={{ color: "#606060", fontSize: "0.7rem", marginTop: "0.3rem" }}>Channel Name<br/>234K views · 5 days ago</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>Full Resolution Thumbnail</span>
        <img src={thumb} alt="Full res thumbnail" style={{ borderRadius: "8px", maxWidth: "100%", marginTop: "0.5rem" }} referrerPolicy="no-referrer"
          onError={e => { (e.currentTarget as HTMLImageElement).src = hq; }} />
      </div>
    </div>
  );
}

function ChannelAgeResult({ result }: { result: Extract<ToolResult, { kind: "channel-age" }> }) {
  const created = result.publishedAt
    ? new Date(result.publishedAt.includes("Joined") ? Date.now() : result.publishedAt)
    : null;
  const now = new Date();
  const ageDays = created ? Math.floor((now.getTime() - created.getTime()) / 86400000) : result.ageDays;
  const ageYears = Math.floor(ageDays / 365);
  const ageMonths = Math.floor((ageDays % 365) / 30);
  const ageDaysRem = ageDays % 30;
  const fmt = (n: string) => Number(n).toLocaleString("en-US");
  return (
    <div className={styles.dataResultStack}>
      {result.thumbnail && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <img src={result.thumbnail} alt={result.title} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} referrerPolicy="no-referrer" />
          <div>
            <p style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>{result.title}</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>{result.channelId}</p>
          </div>
        </div>
      )}
      <div className={styles.dataStatGrid}>
        {[
          { label: "Age", value: `${ageYears}y ${ageMonths}m ${ageDaysRem}d` },
          { label: "Created", value: created ? created.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : result.publishedAt || "Unknown" },
          ...(result.subscriberCount ? [{ label: "Subscribers", value: fmt(result.subscriberCount) }] : []),
          ...(result.videoCount ? [{ label: "Videos", value: fmt(result.videoCount) }] : []),
          ...(result.viewCount ? [{ label: "Total Views", value: fmt(result.viewCount) }] : []),
          { label: "Days Active", value: ageDays.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className={styles.dataStat}>
            <span className={styles.dataStatLabel}>{label}</span>
            <span className={styles.dataStatValue}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegionCheckResult({ result, onCopy, copyTarget }: { result: Extract<ToolResult, { kind: "region-check" }>; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.dataResultStack}>
      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>Video</span>
        <p className={styles.metaFieldValue}>{result.title}</p>
      </div>
      {result.isGloballyAvailable ? (
        <div style={{ padding: "1rem 1.5rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🌍</span>
          <div>
            <p style={{ fontWeight: 700, color: "#10b981", margin: 0 }}>Available Worldwide</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>No region restrictions. This video can be watched in all countries.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {result.allowed.length > 0 && (
            <div className={styles.metaField}>
              <div className={styles.metaFieldTop}>
                <span className={styles.metaFieldLabel} style={{ color: "#10b981" }}>✓ Allowed Countries ({result.allowed.length})</span>
                <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(result.allowed.join(", "), "allowed")}>{copyTarget === "allowed" ? "Copied" : "Copy list"}</button>
              </div>
              <div className={styles.metaChips}>{result.allowed.map(c => <span key={c} className={styles.metaChip} style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.3)" }}>{c}</span>)}</div>
            </div>
          )}
          {result.blocked.length > 0 && (
            <div className={styles.metaField}>
              <div className={styles.metaFieldTop}>
                <span className={styles.metaFieldLabel} style={{ color: "#f87171" }}>✗ Blocked Countries ({result.blocked.length})</span>
                <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(result.blocked.join(", "), "blocked")}>{copyTarget === "blocked" ? "Copied" : "Copy list"}</button>
              </div>
              <div className={styles.metaChips}>{result.blocked.map(c => <span key={c} className={styles.metaChip} style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.3)" }}>{c}</span>)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UploadScheduleResult({ result }: { result: Extract<ToolResult, { kind: "upload-schedule" }> }) {
  const maxDayCount = Math.max(...result.dayDistribution.map(d => d.count), 1);
  const maxHourCount = Math.max(...(result.hourDistribution ?? []).map(h => h.count), 1);
  const maxMonthCount = Math.max(...(result.monthlyBreakdown ?? []).map(m => m.count), 1);

  // Generate smart insights from data
  const topDay = result.dayDistribution.reduce((a, b) => a.count >= b.count ? a : b);
  const topHour = (result.hourDistribution ?? []).reduce((a, b) => a.count >= b.count ? a : b, { hour: 0, label: result.bestHour, count: 0 });
  const weekendCount = result.dayDistribution.filter(d => d.day === "Saturday" || d.day === "Sunday").reduce((s, d) => s + d.count, 0);
  const weekdayCount = result.dayDistribution.filter(d => d.day !== "Saturday" && d.day !== "Sunday").reduce((s, d) => s + d.count, 0);
  const isWeekendHeavy = weekendCount > weekdayCount;
  const consistency = result.avgUploadsPerMonth >= 8 ? "High" : result.avgUploadsPerMonth >= 4 ? "Moderate" : "Low";
  const consistencyColor = consistency === "High" ? "#10b981" : consistency === "Moderate" ? "#f59e0b" : "#f87171";

  const insights = [
    `Best day to publish is <strong>${topDay.day}</strong> with ${topDay.count} uploads - align your schedule here for maximum algorithmic momentum.`,
    isWeekendHeavy
      ? `This channel favors <strong>weekend uploads</strong> - Saturday/Sunday audiences tend to have longer session times.`
      : `This channel is <strong>weekday-dominant</strong> - workday uploads compete better for homepage placement.`,
    result.avgUploadsPerMonth >= 8
      ? `Publishing ${result.avgUploadsPerMonth} videos/month puts this channel in the <strong>top 15% for consistency</strong> - the algorithm rewards this heavily.`
      : result.avgUploadsPerMonth >= 4
      ? `At ${result.avgUploadsPerMonth} videos/month, consistency is <strong>moderate</strong>. Pushing to 8+ per month could unlock a significant reach increase.`
      : `Only ${result.avgUploadsPerMonth} videos/month - <strong>low posting frequency</strong> limits algorithmic amplification. A fixed weekly upload slot would help.`,
    `Best upload hour is <strong>${result.bestHour}</strong> - this likely targets the channel's core audience timezone.`,
  ];

  let lastUploadStr = "Unknown";
  if (result.recentVideos.length > 0 && result.recentVideos[0].publishedAt) {
    const lastDate = new Date(result.recentVideos[0].publishedAt);
    const daysAgo = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
    lastUploadStr = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
  }

  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <div className={styles.dataResultStack}>
      {/* ── Stat grid ── */}
      <div className={styles.dataStatGrid}>
        {[
          { label: "Best Upload Day", value: result.bestDay, icon: "📅" },
          { label: "Best Upload Hour", value: result.bestHour, icon: "⏰" },
          { label: "Avg / Month", value: `${result.avgUploadsPerMonth} videos`, icon: "📈" },
          { label: "Last Upload", value: lastUploadStr, icon: "⏱️" },
        ].map(({ label, value, icon }) => (
          <div key={label} className={styles.dataStat}>
            <span className={styles.dataStatLabel}>{label}</span>
            <span className={styles.dataStatValue}>{icon} {value}</span>
          </div>
        ))}
      </div>

      {/* ── Consistency badge ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.9rem 1.2rem", borderRadius: "10px", background: `rgba(${consistency === "High" ? "16,185,129" : consistency === "Moderate" ? "245,158,11" : "248,113,113"},0.08)`, border: `1px solid rgba(${consistency === "High" ? "16,185,129" : consistency === "Moderate" ? "245,158,11" : "248,113,113"},0.2)` }}>
        <span style={{ fontSize: "1.5rem" }}>{consistency === "High" ? "🔥" : consistency === "Moderate" ? "⚡" : "💤"}</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: consistencyColor, fontFamily: "var(--font-sans)", fontSize: "0.95rem" }}>Posting Consistency: {consistency}</p>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", fontFamily: "var(--font-sans)" }}>
            {consistency === "High" ? "Strong cadence - the algorithm is actively recommending this channel." : consistency === "Moderate" ? "Decent rhythm - adding 1–2 more uploads/month could unlock a step change in reach." : "Low frequency - irregular uploads suppress algorithmic distribution significantly."}
          </p>
        </div>
      </div>

      {/* ── Day distribution ── */}
      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>Upload Day Distribution</span>
        <div style={{ display: "grid", gap: "0.55rem", marginTop: "0.9rem" }}>
          {result.dayDistribution.map(({ day, count }) => {
            const pct = maxDayCount > 0 ? (count / maxDayCount) * 100 : 0;
            const isBest = count === maxDayCount && count > 0;
            return (
              <div key={day} style={{ display: "grid", gridTemplateColumns: "100px 1fr 36px", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "0.83rem", color: isBest ? "var(--brand-orange)" : "rgba(255,255,255,0.55)", fontWeight: isBest ? 700 : 400, fontFamily: "var(--font-sans)" }}>{day}{isBest ? " ★" : ""}</span>
                <div style={{ height: "10px", borderRadius: "5px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: isBest ? "linear-gradient(90deg,#ff6b47,#ff5a36)" : "rgba(255,90,54,0.35)", borderRadius: "5px", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
                <span style={{ fontSize: "0.83rem", color: "#ffffff", fontWeight: 700, textAlign: "right", fontFamily: "var(--font-sans)" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hour heatmap ── */}
      {(result.hourDistribution ?? []).length > 0 && (
        <div className={styles.metaField}>
          <span className={styles.metaFieldLabel}>Upload Hour Heatmap (UTC)</span>
          <p style={{ margin: "6px 0 12px", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans)" }}>All times in UTC - darker = more uploads at that hour</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(0, 1fr))", gap: "3px" }}>
            {result.hourDistribution.map(({ hour, count }) => {
              const intensity = maxHourCount > 0 ? count / maxHourCount : 0;
              const isBestH = count === maxHourCount && count > 0;
              return (
                <div key={hour} title={`${String(hour).padStart(2,"0")}:00 - ${count} upload${count !== 1 ? "s" : ""}`}
                  style={{ height: "32px", borderRadius: "4px", background: isBestH ? `rgba(255,90,54,${0.3 + intensity * 0.7})` : `rgba(255,90,54,${0.08 + intensity * 0.5})`, border: isBestH ? "1px solid rgba(255,90,54,0.6)" : "1px solid transparent", cursor: "default", transition: "background 0.3s" }} />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
            {["0","6","12","18","23"].map(h => (
              <span key={h} style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans)" }}>{h.padStart(2,"0")}:00</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Monthly breakdown ── */}
      {(result.monthlyBreakdown ?? []).length > 0 && (
        <div className={styles.metaField}>
          <span className={styles.metaFieldLabel}>Monthly Upload Volume</span>
          <div style={{ display: "grid", gap: "0.4rem", marginTop: "0.9rem" }}>
            {[...result.monthlyBreakdown].reverse().map(({ month, count }) => {
              const pct = maxMonthCount > 0 ? (count / maxMonthCount) * 100 : 0;
              return (
                <div key={month} style={{ display: "grid", gridTemplateColumns: "72px 1fr 28px", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }}>{formatMonth(month)}</span>
                  <div style={{ height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "rgba(255,90,54,0.55)", borderRadius: "4px", transition: "width 0.5s ease" }} />
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", fontWeight: 600, textAlign: "right", fontFamily: "var(--font-sans)" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Smart insights ── */}
      <div className={styles.metaField}>
        <span className={styles.metaFieldLabel}>AI Insights</span>
        <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
          {insights.map((insight, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem 0.9rem", background: "rgba(255,90,54,0.06)", border: "1px solid rgba(255,90,54,0.12)", borderRadius: "8px", alignItems: "flex-start" }}>
              <span style={{ color: "var(--brand-orange)", fontWeight: 800, fontSize: "0.75rem", marginTop: "1px", flexShrink: 0, fontFamily: "var(--font-sans)" }}>{String(i + 1).padStart(2, "0")}</span>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.55, fontFamily: "var(--font-sans)" }} dangerouslySetInnerHTML={{ __html: insight }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent videos ── */}
      {result.recentVideos.length > 0 && (
        <div className={styles.metaField}>
          <span className={styles.metaFieldLabel}>Recent Uploads ({result.recentVideos.length})</span>
          <div style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
            {result.recentVideos.map((v, idx) => {
              const date = v.publishedAt ? new Date(v.publishedAt) : null;
              const dayName = date ? date.toLocaleDateString("en-US", { weekday: "short" }) : "";
              const dateStr = date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
              return (
                <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "0.6rem 0.9rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", gap: "0.75rem", textDecoration: "none", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,90,54,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>#{idx + 1}</span>
                    <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.88)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>{v.title}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: "1px" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--brand-orange)", fontWeight: 700, fontFamily: "var(--font-sans)" }}>{dayName}</span>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-sans)" }}>{dateStr}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelCompareResult({ result }: { result: Extract<ToolResult, { kind: "channel-compare" }> }) {
  const { channel1: c1, channel2: c2 } = result;

  const fmtNum = (n: string | number) => {
    const num = Number(n);
    if (isNaN(num)) return "0";
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const fmtMoney = (num: number) => {
    if (isNaN(num)) return "$0";
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${Math.round(num).toLocaleString()}`;
  };

  const c1Views = Number(c1.viewCount) || 0;
  const c1Videos = Number(c1.videoCount) || 1;
  const c1Subs = Number(c1.subscriberCount) || 0;
  const c1AgeDays = c1.publishedAt ? Math.max(1, Math.floor((Date.now() - new Date(c1.publishedAt).getTime()) / 86400000)) : 1;
  const c1AgeMonths = Math.max(1, c1AgeDays / 30.44);
  const c1AvgViews = Math.round(c1Views / c1Videos);
  const c1MonthlyViews = c1Views / c1AgeMonths;
  const c1EstRevenue = (c1MonthlyViews / 1000) * 2.50;
  const c1EstSponsorship = (c1AvgViews / 1000) * 15.00;

  const c2Views = Number(c2.viewCount) || 0;
  const c2Videos = Number(c2.videoCount) || 1;
  const c2Subs = Number(c2.subscriberCount) || 0;
  const c2AgeDays = c2.publishedAt ? Math.max(1, Math.floor((Date.now() - new Date(c2.publishedAt).getTime()) / 86400000)) : 1;
  const c2AgeMonths = Math.max(1, c2AgeDays / 30.44);
  const c2AvgViews = Math.round(c2Views / c2Videos);
  const c2MonthlyViews = c2Views / c2AgeMonths;
  const c2EstRevenue = (c2MonthlyViews / 1000) * 2.50;
  const c2EstSponsorship = (c2AvgViews / 1000) * 15.00;

  const renderChannelHeader = (c: ChannelStats, isWinner: boolean) => (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", zIndex: 1, position: "relative" }}>
      <div style={{ position: "relative" }}>
        <img src={c.thumbnail} alt={c.title} style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: isWinner ? "4px solid #10b981" : "4px solid var(--border)", boxShadow: isWinner ? "0 0 30px rgba(16,185,129,0.4)" : "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.3s ease", background: "var(--bg-alt)" }} referrerPolicy="no-referrer" />
        {isWinner && <div style={{ position: "absolute", bottom: "-5px", right: "-5px", background: "#10b981", color: "white", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", border: "4px solid var(--bg)" }}>🏆</div>}
      </div>
      <div>
        <h3 style={{ fontWeight: 800, fontSize: "1.3rem", margin: 0, color: "var(--foreground)" }}>{c.title}</h3>
        <a href={`https://www.youtube.com/channel/${c.channelId}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.2rem", marginTop: "0.4rem", fontWeight: 600 }}>Visit Channel ↗</a>
      </div>
    </div>
  );

  const renderStatRow = (label: string, v1: string | number, v2: string | number, w1: boolean, w2: boolean) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1.5rem", alignItems: "center", padding: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div style={{ textAlign: "right", fontWeight: w1 ? 800 : 500, fontSize: "1.1rem", color: w1 ? "#10b981" : "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.6rem" }}>
        {v1} {w1 && <Check size={18} color="#10b981" strokeWidth={3} />}
      </div>
      <div style={{ width: "130px", textAlign: "center", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div style={{ textAlign: "left", fontWeight: w2 ? 800 : 500, fontSize: "1.1rem", color: w2 ? "#10b981" : "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "0.6rem" }}>
        {w2 && <Check size={18} color="#10b981" strokeWidth={3} />} {v2}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1rem" }}>
      
      {/* Hero Section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3rem", padding: "3rem 2rem", background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 100%)", borderRadius: "16px", border: "1px solid var(--border)", position: "relative", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "18rem", opacity: 0.02, fontWeight: 900, pointerEvents: "none", zIndex: 0 }}>VS</div>
        {renderChannelHeader(c1, c1Subs > c2Subs)}
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.2rem", zIndex: 10, boxShadow: "0 0 30px rgba(255,90,54,0.5)", border: "4px solid var(--bg)" }}>
          VS
        </div>
        {renderChannelHeader(c2, c2Subs > c1Subs)}
      </div>

      {/* Core Metrics */}
      <div style={{ background: "var(--bg-alt)", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--foreground)" }}>📊 Core Performance Matchup</h4>
        </div>
        <div>
          {renderStatRow("Subscribers", c1.hiddenSubscriberCount ? "Hidden" : fmtNum(c1Subs), c2.hiddenSubscriberCount ? "Hidden" : fmtNum(c2Subs), c1Subs > c2Subs, c2Subs > c1Subs)}
          {renderStatRow("Total Views", fmtNum(c1Views), fmtNum(c2Views), c1Views > c2Views, c2Views > c1Views)}
          {renderStatRow("Total Videos", fmtNum(c1Videos), fmtNum(c2Videos), c1Videos > c2Videos, c2Videos > c1Videos)}
          {renderStatRow("Avg. Views", fmtNum(c1AvgViews), fmtNum(c2AvgViews), c1AvgViews > c2AvgViews, c2AvgViews > c1AvgViews)}
          {renderStatRow("Channel Age", `${Math.floor(c1AgeDays / 365.25)} yrs`, `${Math.floor(c2AgeDays / 365.25)} yrs`, c1AgeDays > c2AgeDays, c2AgeDays > c1AgeDays)}
        </div>
      </div>

      {/* Monetization Estimates */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Monthly Revenue */}
        <div style={{ background: "linear-gradient(145deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.12) 100%)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "16px", padding: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: "6rem", opacity: 0.1, pointerEvents: "none" }}>💰</div>
          <h4 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", fontWeight: 800, color: "#10b981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            💰 Est. Monthly Revenue
          </h4>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: c1EstRevenue > c2EstRevenue ? "#10b981" : "var(--foreground)" }}>{fmtMoney(c1EstRevenue)}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c1.title.length > 15 ? c1.title.substring(0, 15) + '...' : c1.title}</div>
            </div>
            <div style={{ width: "1px", height: "50px", background: "rgba(16,185,129,0.3)" }} />
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: c2EstRevenue > c1EstRevenue ? "#10b981" : "var(--foreground)" }}>{fmtMoney(c2EstRevenue)}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c2.title.length > 15 ? c2.title.substring(0, 15) + '...' : c2.title}</div>
            </div>
          </div>
          <p style={{ margin: "1.5rem 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", fontWeight: 500 }}>*Based on estimated average $2.50 RPM</p>
        </div>

        {/* Sponsorship Pricing */}
        <div style={{ background: "linear-gradient(145deg, rgba(139,92,246,0.05) 0%, rgba(139,92,246,0.12) 100%)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "16px", padding: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: "6rem", opacity: 0.1, pointerEvents: "none" }}>🤝</div>
          <h4 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", fontWeight: 800, color: "#8b5cf6", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            🤝 Est. Sponsorship Rate
          </h4>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: c1EstSponsorship > c2EstSponsorship ? "#8b5cf6" : "var(--foreground)" }}>{fmtMoney(c1EstSponsorship)}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c1.title.length > 15 ? c1.title.substring(0, 15) + '...' : c1.title}</div>
            </div>
            <div style={{ width: "1px", height: "50px", background: "rgba(139,92,246,0.3)" }} />
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: c2EstSponsorship > c1EstSponsorship ? "#8b5cf6" : "var(--foreground)" }}>{fmtMoney(c2EstSponsorship)}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.3rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c2.title.length > 15 ? c2.title.substring(0, 15) + '...' : c2.title}</div>
            </div>
          </div>
          <p style={{ margin: "1.5rem 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", fontWeight: 500 }}>*Based on $15.00 CPM & Average Views</p>
        </div>

      </div>
    </div>
  );
}

function VideoSeoResult({ meta, score, checks }: { meta: YouTubeMetadata; score: number; checks: SeoCheck[] }) {
  const passed = checks.filter(c => c.passed).length;
  const failed = checks.filter(c => !c.passed && !c.label.includes("keyword")).length;
  
  const scoreColor = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const fmtDuration = (secStr: string) => {
    const s = Number(secStr);
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, "0")}`;
  };

  const suggestions = checks.filter(c => !c.passed).map(c => {
    if (c.label.includes("Title")) return { text: "Title length is suboptimal. To maximize CTR, compress the core value proposition into the first 50 characters before YouTube truncates it on mobile displays.", type: "High Priority" };
    if (c.label.includes("Tags Added")) return { text: "Tag stuffing detected. The YouTube algorithm relies primarily on title/description semantics now. Restrict tags to 5-10 highly relevant misspellings and broad category terms.", type: "Medium Priority" };
    if (c.label.includes("Timestamps")) return { text: "Missing Video Chapters. Adding 00:00 timestamps not only improves viewer retention (UX) but also secures 'Key Moments' rich snippets in Google Search results.", type: "Enhancement" };
    if (c.label.includes("Captions")) return { text: "Relying on auto-captions limits your reach. Uploading manual SRT files signals high production value to the algorithm and directly indexes your spoken keywords.", type: "High Priority" };
    return { text: `Unoptimized parameter detected: ${c.label.toLowerCase()}. Rectify this to strengthen your semantic indexing signals.`, type: "Improvement" };
  });

  const expertVerdict = score >= 80 
    ? "High Authority Asset. You've executed all core metadata best practices perfectly. The algorithm has strong semantic signals to rank this. Focus your remaining efforts entirely on CTR (Thumbnail psychology) and AVD (Audience Retention) to push this video viral."
    : score >= 50
    ? "Missed Potential. You have a solid foundation, but you are leaving organic search traffic on the table. Implement the High Priority action items below to improve your ranking velocity and secure better suggested-video placements."
    : "Unoptimized Asset. The algorithm currently lacks the necessary semantic signals to categorize and push this video to a broader audience. A complete metadata overhaul is required to gain organic traction in the YouTube ecosystem.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem", color: "var(--foreground)" }}>
      
      {/* Video Context Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <a href={meta.url} target="_blank" rel="noopener noreferrer" style={{ width: "180px", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", flexShrink: 0, position: "relative", display: "block", border: "1px solid rgba(255,255,255,0.1)" }}>
          <img src={`https://i.ytimg.com/vi/${meta.videoId}/hqdefault.jpg`} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: "6px", right: "6px", background: "rgba(0,0,0,0.85)", padding: "3px 6px", borderRadius: "4px", fontSize: "0.7rem", color: "#fff", fontWeight: 700, letterSpacing: "0.5px" }}>{fmtDuration(meta.durationSeconds)}</div>
        </a>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.4rem" }}>Analyzed Target</div>
          <h4 style={{ margin: "0 0 0.3rem 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3 }}>{meta.title}</h4>
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>{meta.channelName}</span>
        </div>
      </div>

      {/* Main Score Board */}
      <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "12px", padding: "2rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem", flex: "1 1 300px" }}>
          <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r={radius} fill="none" stroke={scoreColor} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
            </svg>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</span>
              <span style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: 700, marginTop: "0.2rem" }}>/ 100</span>
            </div>
          </div>
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)" }}>Video SEO Score</h2>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", maxWidth: "340px", lineHeight: 1.5 }}>
              This score indicates how well the metadata is optimized for YouTube's search and discovery algorithms.
            </p>
          </div>
        </div>
        
        <div style={{ flex: "1 1 250px", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#10b981", marginBottom: "0.25rem", lineHeight: 1 }}>{passed}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Passed Checks</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ef4444", marginBottom: "0.25rem", lineHeight: 1 }}>{failed}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Action Items</div>
          </div>
        </div>
      </div>

      {/* Expert Verdict Box */}
      <div style={{ background: `linear-gradient(90deg, ${scoreColor}15 0%, rgba(0,0,0,0.2) 100%)`, border: `1px solid ${scoreColor}40`, borderLeft: `4px solid ${scoreColor}`, borderRadius: "8px", padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <div style={{ color: scoreColor, marginTop: "0.2rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div>
          <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1rem", fontWeight: 800, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Expert Verdict</h3>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 500 }}>
            {expertVerdict}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", alignSelf: "start" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Check size={18} color="var(--primary)" /> SEO Action Plan
            </h3>
          </div>
          <div style={{ padding: "0.5rem 0" }}>
            {checks.map(c => {
              const isPassed = c.passed;
              const isNa = c.label.includes("keyword");
              const iconColor = isPassed ? "#10b981" : isNa ? "var(--text-secondary)" : "#ef4444";
              return (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: `${iconColor}15`, color: iconColor, flexShrink: 0 }}>
                    {isPassed ? <Check size={14} strokeWidth={3} /> : isNa ? <span style={{ fontSize: "10px", fontWeight: 800 }}>-</span> : <X size={14} strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, fontSize: "0.9rem", color: isPassed ? "var(--foreground)" : "var(--text-secondary)", fontWeight: isPassed ? 600 : 500 }}>
                    {c.label} {c.label.includes("Tags") ? `(${meta.tags.length})` : c.label.includes("Title") ? `(${meta.title.length})` : c.label.includes("Description") && !isNa ? `(${meta.description.length})` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.1)" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Video Insights
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)" }}>
              {[
                { l: "Views", v: Number(meta.viewCount).toLocaleString() },
                { l: "Duration", v: fmtDuration(meta.durationSeconds) },
                { l: "Tags Used", v: meta.tags.length },
                { l: "Hashtags", v: meta.hashtags.length },
                { l: "Captions", v: meta.hasCaptions ? "Yes" : "None" },
                { l: "Quality", v: meta.isHD ? "HD" : "SD" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "var(--bg-alt)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>{stat.l}</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground)" }}>{stat.v}</span>
                </div>
              ))}
            </div>
          </div>

          {suggestions.length > 0 && (
            <div style={{ background: "rgba(249, 115, 22, 0.05)", border: "1px solid rgba(249, 115, 22, 0.2)", borderRadius: "12px", padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Strategic Advice
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "rgba(0,0,0,0.2)", padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--border)" }}>
                    <span style={{ color: s.type === "High Priority" ? "#ef4444" : "var(--primary)", fontSize: "1.2rem", lineHeight: 1 }}>•</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 800, marginBottom: "0.3rem" }}>{s.type}</span>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--foreground)", lineHeight: 1.5 }}>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelVideoLinksResult({ result, onCopy, copyTarget }: { result: Extract<ToolResult, { kind: "channel-videos" }>; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  const allUrls = result.videos.map(v => v.url).join("\n");
  const downloadCsv = () => {
    const csv = ["Title,URL,Published", ...result.videos.map(v => `"${v.title.replace(/"/g, '""')}",${v.url},${v.publishedAt}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${result.channelTitle}-videos.csv`; a.click();
  };
  return (
    <div className={styles.dataResultStack}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
        <p style={{ fontWeight: 700, margin: 0 }}>{result.totalFetched} videos from {result.channelTitle}</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(allUrls, "all")}>{copyTarget === "all" ? "Copied ✓" : "Copy All URLs"}</button>
          <button type="button" className={`${styles.smButton} ${styles.smButtonPrimary}`} onClick={downloadCsv}>Download CSV</button>
        </div>
      </div>
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
        {result.videos.map((v, i) => (
          <div key={v.videoId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1rem", borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", width: 28, flexShrink: 0, textAlign: "right" }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</p>
              <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.72rem", color: "var(--primary)" }}>{v.url}</a>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", flexShrink: 0 }}>{v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RssResult({ result, onCopy, copyTarget }: { result: Extract<ToolResult, { kind: "rss-url" }>; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  return (
    <div className={styles.subscribeCard}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", justifyContent: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", background: "rgba(249, 115, 22, 0.15)", color: "#f97316", borderRadius: "6px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
        </span>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" }}>RSS Feed Ready</h3>
      </div>
      {result.title && <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.9rem", color: "var(--text-secondary)", textAlign: "center" }}><strong style={{ color: "var(--foreground)" }}>{result.title}</strong></p>}
      
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.35rem", gap: "0.5rem" }}>
        <div style={{ flex: "1 1 200px", padding: "0.5rem 0.75rem", overflow: "hidden", minWidth: 0 }}>
          <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: "0.85rem", color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>
            {result.rssUrl}
          </div>
        </div>
        <button 
          onClick={() => onCopy(result.rssUrl, "rss")}
          style={{ flex: "0 0 auto", background: copyTarget === "rss" ? "#10b981" : "var(--primary)", color: "white", border: "none", borderRadius: "6px", padding: "0.6rem 1rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", minWidth: "120px", whiteSpace: "nowrap" }}
        >
          {copyTarget === "rss" ? (
            <><Check size={14} /> Copied!</>
          ) : (
            <><Copy size={14} /> Copy URL</>
          )}
        </button>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
        <a href={result.rssUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "var(--primary)", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
          Open feed in browser <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>

      <div style={{ marginTop: "1.25rem", padding: "0.8rem", background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", gap: "0.6rem", alignItems: "flex-start", textAlign: "left" }}>
        <span style={{ fontSize: "1rem", lineHeight: 1 }}>💡</span>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: "var(--foreground)" }}>Note on Browser Errors:</strong> If you open this link directly in Chrome/Edge, you may see an "XML Parse Error". This is a well-known bug on YouTube's servers where they occasionally forget to encode special characters. The link is 100% correct and will work perfectly when pasted into any actual RSS Reader app.
        </p>
      </div>

      {result.videos && result.videos.length > 0 && (
        <div style={{ marginTop: "2.5rem", textAlign: "left" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem 0", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "8px", height: "8px", background: "var(--primary)", borderRadius: "50%", display: "inline-block" }}></span>
            Feed Preview
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {result.videos.slice(0, 6).map((v) => (
              <div key={v.videoId} style={{ background: "var(--bg-alt)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", display: "flex", flexDirection: "column", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", aspectRatio: "16/9", position: "relative" }}>
                  <img src={v.thumbnail} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                  <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.85)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", color: "#fff", fontWeight: 600 }}>Watch ↗</div>
                </a>
                <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h5 style={{ fontSize: "0.85rem", margin: "0 0 0.5rem 0", color: "var(--foreground)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                    <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{v.title}</a>
                  </h5>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "auto" }}>{v.publishedAt ? new Date(v.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentsExportResult({ result }: { result: Extract<ToolResult, { kind: "comments-export" }> }) {
  const [format, setFormat] = useState<"csv" | "json" | "txt">("csv");
  const download = () => {
    let content = "", type = "text/plain", ext = "txt";
    if (format === "csv") {
      content = ["Author,Comment,Likes,Published", ...result.comments.map(c => `"${c.author.replace(/"/g,'""')}","${c.text.replace(/"/g,'""')}",${c.likes},${c.publishedAt}`)].join("\n");
      type = "text/csv"; ext = "csv";
    } else if (format === "json") {
      content = JSON.stringify(result.comments, null, 2);
      type = "application/json"; ext = "json";
    } else {
      content = result.comments.map((c, i) => `${i+1}. @${c.author}: ${c.text}`).join("\n\n");
    }
    const blob = new Blob([content], { type });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `comments-${result.videoId}.${ext}`; a.click();
  };
  return (
    <div className={styles.dataResultStack}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
        <p style={{ fontWeight: 700, margin: 0 }}>{result.comments.length} comments fetched</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select value={format} onChange={e => setFormat(e.target.value as typeof format)}
            style={{ padding: "0.4rem 0.7rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-alt)", color: "var(--foreground)", fontSize: "0.82rem" }}>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="txt">Plain Text</option>
          </select>
          <button type="button" className={`${styles.smButton} ${styles.smButtonPrimary}`} onClick={download}>⬇ Download</button>
        </div>
      </div>
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
        {result.comments.slice(0, 50).map((c, i) => (
          <div key={i} style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.82rem" }}>{c.author}</span>
              {c.likes !== "0" && <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>👍 {c.likes}</span>}
            </div>
            <p style={{ fontSize: "0.82rem", margin: 0, color: "var(--foreground)", lineHeight: 1.5 }}>{c.text}</p>
          </div>
        ))}
        {result.comments.length > 50 && <p style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)", fontSize: "0.82rem" }}>+{result.comments.length - 50} more in download</p>}
      </div>
    </div>
  );
}

function VideoCategoryResult({ result }: { result: Extract<ToolResult, { kind: "video-category" }> }) {
  return (
    <div className={styles.categoryResult}>
      <span className={styles.categoryResultLabel}>YouTube Category</span>
      <span className={styles.categoryBadge}>{result.categoryName}</span>
      <p className={styles.categoryKeyword}>Video: <strong>{result.title}</strong></p>
      <p className={styles.categoryNote}>Category ID: {result.categoryId} - This is the official category assigned by the uploader in YouTube Studio.</p>
    </div>
  );
}

function PlaylistLinksResult({ videos, onCopy, copyTarget }: { videos: PlaylistVideoFrontend[]; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  const allUrls = videos.map(v => v.url).join("\n");
  const downloadTxt = () => {
    const txt = videos.map((v, i) => `${i+1}. ${v.title}\n   ${v.url}`).join("\n\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "playlist-links.txt"; a.click();
  };
  return (
    <div className={styles.dataResultStack}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
        <p style={{ fontWeight: 700, margin: 0 }}>{videos.length} video links extracted</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`} onClick={() => onCopy(allUrls, "links")}>{copyTarget === "links" ? "Copied ✓" : "Copy All"}</button>
          <button type="button" className={`${styles.smButton} ${styles.smButtonPrimary}`} onClick={downloadTxt}>Download .txt</button>
        </div>
      </div>
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
        {videos.map((v, i) => (
          <div key={v.videoId} style={{ padding: "0.6rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", width: 24, flexShrink: 0, marginTop: "0.1rem" }}>{i+1}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, margin: 0 }}>{v.title}</p>
              <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.72rem", color: "var(--primary)" }}>{v.url}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvancedKeywordsResult({ result, onCopy, copyTarget }: { result: Extract<ToolResult, { kind: "advanced-keywords" }>; onCopy: (v: string, t: string) => void; copyTarget: string | null }) {
  const formatVolume = (kw: KeywordMetrics) => `${kw.demandScore}/100`;
  const volumeLabel = () => "YT Volume";
  const volumeBarWidth = (kw: KeywordMetrics) => `${kw.demandScore}%`;

  const getKDColor = (kd: number) => {
    if (kd <= 35) return "#10b981";
    if (kd <= 65) return "#f59e0b";
    return "#ef4444";
  };

  const getTrendColor = (score: number) => {
    if (score >= 65) return "#10b981";
    if (score >= 45) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
      <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>💎</span> Top Opportunities for "{result.topic}"
        </h3>
        <p style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
          Free YouTube volume is a 0-100 score from live autocomplete coverage, exact suggestion matches, rank position, expansion matches, ranked result titles, visible views, and recency.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          {result.keywords.slice(0, 3).map((kw, i) => (
            <div key={kw.tag} style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${getKDColor(kw.kdPercent)}40`, borderRadius: "8px", padding: "1.25rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: getKDColor(kw.kdPercent) }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)", display: "block", textTransform: "capitalize" }}>{kw.tag}</span>
                <span style={{ background: `${getKDColor(kw.kdPercent)}15`, color: getKDColor(kw.kdPercent), padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800 }}>SEO: {kw.seoScore}/100</span>
              </div>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>{volumeLabel()}</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>{formatVolume(kw)}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Competition</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: getKDColor(kw.kdPercent), textTransform: "capitalize" }}>{kw.competition}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "750px" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px" }}>Keyword</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px", width: "24%" }}>Volume / Demand</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px" }}>Difficulty (KD)</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px" }}>Trend Score</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 700, letterSpacing: "0.5px", textAlign: "right" }}>SEO Score</th>
              </tr>
            </thead>
            <tbody>
              {result.keywords.map((kw, idx) => (
                <tr key={kw.tag} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--foreground)", textTransform: "capitalize", fontSize: "0.95rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {kw.tag}
                      <button type="button" onClick={() => onCopy(kw.tag, `kw-${idx}`)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "2px" }} title="Copy keyword">
                        {copyTarget === `kw-${idx}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, width: "80px" }}>{formatVolume(kw)}</span>
                      <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: volumeBarWidth(kw), background: "var(--primary)", borderRadius: "3px" }} />
                      </div>
                    </div>
                    <div style={{ marginTop: "0.35rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                      {kw.uniqueSuggestions ?? 0} suggestions | {kw.exactSuggestionMatches ?? 0} exact | rank {kw.bestAutocompleteRank ?? "N/A"}
                    </div>
                    {kw.topSuggestions?.length ? (
                      <div style={{ marginTop: "0.25rem", fontSize: "0.7rem", color: "var(--text-secondary)", maxWidth: "320px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Top: {kw.topSuggestions.slice(0, 3).join(", ")}
                      </div>
                    ) : null}
                    {kw.volumeError ? (
                      <div style={{ marginTop: "0.35rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        Free volume check unavailable
                      </div>
                    ) : null}
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.6rem", background: `${getKDColor(kw.kdPercent)}15`, border: `1px solid ${getKDColor(kw.kdPercent)}40`, borderRadius: "20px", color: getKDColor(kw.kdPercent), fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.3px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: getKDColor(kw.kdPercent) }} />
                      {kw.kdPercent}% {kw.competition}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: getTrendColor(kw.trendScore), fontSize: "0.85rem", fontWeight: 700 }}>
                      <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{kw.trendDirection === 'rising' ? '↗' : kw.trendDirection === 'falling' ? '↘' : '→'}</span> {kw.trendScore}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                    <span style={{ display: "inline-block", background: "var(--primary)", color: "white", padding: "0.35rem 0.75rem", borderRadius: "8px", fontWeight: 800, fontSize: "0.95rem", boxShadow: "0 2px 8px rgba(255,90,54,0.3)" }}>
                      {kw.seoScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ShortsTrendAnalyzerDashboard() {
  const [q, setQ] = useState("");
  const [lookback, setLookback] = useState("24");
  const [max, setMax] = useState("50");
  const [sort, setSort] = useState("trendScore");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tab, setTab] = useState<"shorts" | "tags">("shorts");
  const [lastQuery, setLastQuery] = useState("");

  const analyze = async () => {
    if (!q.trim()) {
      setError("Please enter a keyword or niche.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/yt-shorts-trend?q=${encodeURIComponent(q)}&lookback=${lookback}&max=${max}&sort=${sort}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze.");
      setVideos(data.videos || []);
      setTags(data.tags || []);
      setLastQuery(q);
      setTab("shorts");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = (type: "videos" | "tags") => {
    let csv = "";
    let name = "";
    if (type === "videos") {
      csv = "Title,URL,Views,Score,Velocity,ER%,Age(h)\n" + videos.map(v => `"${v.title.replace(/"/g, '""')}","https://youtu.be/${v.videoId}",${v.views},${v.trendScore},${v.velocity},${v.er},${v.ageHours}`).join("\n");
      name = `shorts-trend-${lastQuery || "export"}.csv`;
    } else {
      csv = "Hashtag\n" + tags.map(t => `"${t}"`).join("\n");
      name = `shorts-tags-${lastQuery || "export"}.csv`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  const copyTags = () => {
    navigator.clipboard.writeText(tags.join(", ")).catch(() => {});
  };

  const cStyle = { background: "var(--bg-alt)", color: "var(--foreground)", fontFamily: "system-ui", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", marginTop: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" };
  const inputStyle = { background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "0.6rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", width: "100%", outline: "none" };
  const labelStyle = { display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 600 };
  const btnPrimary = { background: "var(--primary)", color: "white", border: "none", padding: "0.7rem 1.2rem", borderRadius: "6px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" };
  const btnGhost = { background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)", padding: "0.7rem 1.2rem", borderRadius: "6px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" };
  const tabBtn = (isActive: boolean) => ({ background: isActive ? "transparent" : "transparent", color: isActive ? "var(--foreground)" : "var(--text-secondary)", border: "1px solid", borderColor: isActive ? "var(--border)" : "transparent", padding: "0.5rem 1rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" });

  return (
    <div style={cStyle}>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 1.5rem 0" }}>Spot rising Shorts in any niche. Compare velocity, engagement, and hashtag leaders. Built with the official YouTube Data API.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <span style={labelStyle}>Keyword or Niche</span>
          <input style={inputStyle} value={q} onChange={e => setQ(e.target.value)} placeholder="gaming" onKeyDown={e => e.key === "Enter" && analyze()} />
        </div>
        <div>
          <span style={labelStyle}>Lookback (hours)</span>
          <select style={inputStyle} value={lookback} onChange={e => setLookback(e.target.value)}>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
            <option value="72">72</option>
          </select>
        </div>
        <div>
          <span style={labelStyle}>Max results</span>
          <select style={inputStyle} value={max} onChange={e => setMax(e.target.value)}>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div>
          <span style={labelStyle}>Sort by</span>
          <select style={inputStyle} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="trendScore">Trend Score</option>
            <option value="velocity">Velocity (views/h)</option>
            <option value="er">Engagement (ER%)</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "2rem" }}>
        <button style={btnPrimary} onClick={analyze} disabled={loading}>{loading ? "ANALYZING..." : "ANALYZE SHORTS"}</button>
        <button style={btnGhost} onClick={() => exportCsv("videos")} disabled={videos.length === 0}>Export Videos CSV</button>
        <button style={btnGhost} onClick={() => exportCsv("tags")} disabled={tags.length === 0}>Export Hashtags CSV</button>
        <button style={btnGhost} onClick={copyTags} disabled={tags.length === 0}>Copy Top Hashtags</button>
      </div>

      {error && <div style={{ color: "#f87171", padding: "1rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

      {(videos.length > 0 || tags.length > 0) && (
        <>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <button style={tabBtn(tab === "shorts")} onClick={() => setTab("shorts")}>Top Rising Shorts</button>
            <button style={tabBtn(tab === "tags")} onClick={() => setTab("tags")}>Top Hashtags</button>
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Query: "{lastQuery}" • {videos.length} videos • Updated: {new Date().toLocaleString()}
          </div>

          {tab === "shorts" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {videos.map(v => (
                <div key={v.videoId} style={{ background: "rgba(0,0,0,0.1)", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
                  <img src={v.thumbnail} alt={v.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                  <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h4 style={{ fontSize: "0.9rem", margin: "0 0 0.5rem 0", lineHeight: 1.4, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {v.title}
                    </h4>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                      <span style={{ background: "rgba(255,255,255,0.1)", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700 }}>Score {v.trendScore}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", alignSelf: "center" }}>Velocity: {v.velocity}/h</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", alignSelf: "center" }}>ER: {v.er}%</span>
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <span>Views: {v.views >= 1000 ? (v.views/1000).toFixed(1) + "K" : v.views}</span>
                      <span>Age: {v.ageHours}h</span>
                      <span>Len: {v.lenStr}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--foreground)", marginBottom: "1rem", flex: 1 }}>{v.channelTitle}</div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                      <a href={`https://youtu.be/${v.videoId}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, padding: "0.4rem 0.8rem", fontSize: "0.7rem", textDecoration: "none" }}>Watch</a>
                      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.channelTitle)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, padding: "0.4rem 0.8rem", fontSize: "0.7rem", textDecoration: "none" }}>Channel</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "tags" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {tags.map(t => (
                <span key={t} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "0.85rem", color: "var(--foreground)" }}>
                  #{t.replace(/^#/, "")}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Which tool kinds use the YouTube search API
// ─────────────────────────────────────────────────────────────────────────────

const YOUTUBE_POWERED = new Set([
  "idea-generator",
  "title-generator",
  "keyword-generator",
  "name-generator",
  "podcast-title-generator",
  "top100-analyzer",
  "category-checker",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

function Top100Leaderboard() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [filter, setFilter] = useState("");

  async function fetchTop() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/top100");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch live data");
      setChannels(data.channels || []);
      setMeta(data.meta || null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTop(); }, []);

  const filtered = filter.trim()
    ? channels.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()))
    : channels;

  const rankBadge = (rank: number) => {
    if (rank === 1) return <span style={{ fontSize: "1.4rem" }}>🥇</span>;
    if (rank === 2) return <span style={{ fontSize: "1.4rem" }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: "1.4rem" }}>🥉</span>;
    return <span style={{ color: "var(--text-secondary)", fontWeight: 700, fontSize: "0.95rem" }}>{rank}</span>;
  };

  return (
    <div style={{ marginTop: "1.5rem", width: "100%", minWidth: 0 }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.25)", animation: "pulse 2s infinite" }} />
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)" }}>LIVE - Real-Time YouTube Data</span>
          </div>
          {meta && (
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
              {lastUpdated ? `📡 Updated ${lastUpdated}` : '📡 Loading...'}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Filter channels..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "0.45rem 0.9rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-alt)", color: "var(--foreground)", fontSize: "0.85rem", outline: "none", width: 180 }}
          />
          <button
            onClick={fetchTop}
            disabled={loading}
            style={{ padding: "0.45rem 1rem", borderRadius: 8, border: "none", background: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "⏳ Loading..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444", background: "rgba(239,68,68,0.08)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</div>
          <strong>Error:</strong> {error}<br /><br />
          <button onClick={fetchTop} style={{ padding: "0.5rem 1.2rem", borderRadius: 8, background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>Try Again</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto", overflowY: "hidden" }}>
          <div style={{ width: "100%" }}>
            {[...Array(15)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", opacity: 1 - i * 0.05 }}>
              <div style={{ width: 32, height: 18, borderRadius: 4, background: "var(--border)" }} />
              <div style={{ width: 48, height: 48, borderRadius: 8, background: "var(--border)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: `${40 + (i % 5) * 8}%`, height: 14, borderRadius: 4, background: "var(--border)", marginBottom: 6 }} />
                <div style={{ width: "25%", height: 11, borderRadius: 4, background: "var(--border)" }} />
              </div>
              <div style={{ width: 60, height: 14, borderRadius: 4, background: "var(--border)" }} />
              <div style={{ width: 60, height: 14, borderRadius: 4, background: "var(--border)" }} />
              <div style={{ width: 50, height: 14, borderRadius: 4, background: "var(--border)" }} />
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      {!loading && !error && channels.length > 0 && (
        <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto", overflowY: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.04)", borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "0.9rem 1rem", textAlign: "center", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase", width: 60 }}>#</th>
                <th style={{ padding: "0.9rem 1.2rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase" }}>Channel</th>
                <th style={{ padding: "0.9rem 1.2rem", textAlign: "right", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Subscribers</th>
                <th className={styles.hideOnMobile} style={{ padding: "0.9rem 1.2rem", textAlign: "right", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Total Views</th>
                <th className={styles.hideOnMobile} style={{ padding: "0.9rem 1.2rem", textAlign: "right", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase" }}>Videos</th>
                <th className={styles.hideOnMobile} style={{ padding: "0.9rem 1rem", textAlign: "center", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase" }}>Country</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.035)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => window.open(`https://www.youtube.com/channel/${c.id}`, "_blank")}
                >
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center", width: 60 }}>{rankBadge(c.rank)}</td>
                  <td style={{ padding: "0.85rem 1.2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                        background: "var(--border)",
                        border: c.rank === 1 ? "2px solid #FFD700" : c.rank === 2 ? "2px solid #C0C0C0" : c.rank === 3 ? "2px solid #CD7F32" : "2px solid transparent"
                      }}>
                        {c.img
                          ? <img src={c.img} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, color: "white", background: "var(--primary)" }}>{c.name.charAt(0)}</div>
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.93rem", color: "var(--foreground)" }}>{c.name}</div>
                        {c.description && (
                          <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)", marginTop: "0.15rem", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1.2rem", textAlign: "right", whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.93rem", color: "var(--foreground)" }}>{c.subs}</span>
                    <span style={{ color: "#10b981", fontSize: "0.75rem", marginLeft: "0.25rem" }}>▲</span>
                  </td>
                  <td className={styles.hideOnMobile} style={{ padding: "0.85rem 1.2rem", textAlign: "right", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{c.views}</span>
                    <span style={{ color: "#10b981", fontSize: "0.75rem", marginLeft: "0.25rem" }}>▲</span>
                  </td>
                  <td className={styles.hideOnMobile} style={{ padding: "0.85rem 1.2rem", textAlign: "right", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{c.videos}</span>
                  </td>
                  <td className={styles.hideOnMobile} style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                    <span style={{ fontSize: "0.73rem", padding: "0.2rem 0.55rem", background: "rgba(0,0,0,0.07)", borderRadius: 20, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.05em" }}>{c.country}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.78rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.02)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            Showing {filtered.length} of {channels.length} channels · All stats are live from YouTube API · Click any row to visit channel
          </div>
        </div>
      )}

      {!loading && !error && channels.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>No channels found. Click Refresh.</div>
      )}
    </div>
  );
}
function InteractiveMoneyCalculator() {
  const [views, setViews] = useState(10000);
  const [rpm, setRpm] = useState(4.00);

  const dailyEarnings = (views / 1000) * rpm;
  const monthlyEarnings = dailyEarnings * 30;
  const yearlyEarnings = dailyEarnings * 365;

  const handleViewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/,/g, ""));
    setViews(isNaN(val) ? 0 : Math.min(val, 1000000000));
  };
  const handleRpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRpm(isNaN(val) ? 0 : Math.min(val, 1000));
  };

  const formatMoney = (val: number) => "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatNumber = (val: number) => val.toLocaleString("en-US");

  const viewsPercent = (views / 500000) * 100;
  const rpmPercent = (rpm / 40) * 100;

  return (
    <div className={styles.calcContainer}>
      <div className={styles.calcTop}>
        <div className={styles.calcControl}>
          <div className={styles.calcHeader}>
            <span className={styles.calcLabel}>Daily Views</span>
            <span className={styles.calcVal}>{formatNumber(views)}</span>
          </div>
          <div className={styles.calcSliderWrap}>
            <input type="range" min="0" max="500000" step="1000" value={Math.min(views, 500000)} onChange={e => setViews(Number(e.target.value))} className={styles.calcSlider} style={{ background: `linear-gradient(to right, #ff5a36 ${Math.min(100, Math.max(0, viewsPercent))}%, rgba(255, 90, 54, 0.2) ${Math.min(100, Math.max(0, viewsPercent))}%)` }} />
            <div className={styles.calcLimits}><span>0</span><span>500,000</span></div>
          </div>
          <input type="text" value={views ? formatNumber(views) : ""} onChange={handleViewsChange} className={styles.calcInput} />
        </div>

        <div className={styles.calcControl}>
          <div className={styles.calcHeader}>
            <span className={styles.calcLabel}>RPM (USD)</span>
            <span className={styles.calcVal}>{formatMoney(rpm)}</span>
          </div>
          <div className={styles.calcSliderWrap}>
            <input type="range" min="0" max="40" step="0.1" value={Math.min(rpm, 40)} onChange={e => setRpm(Number(e.target.value))} className={styles.calcSlider} style={{ background: `linear-gradient(to right, #ff5a36 ${Math.min(100, Math.max(0, rpmPercent))}%, rgba(255, 90, 54, 0.2) ${Math.min(100, Math.max(0, rpmPercent))}%)` }} />
            <div className={styles.calcLimits}><span>$0</span><span>$40</span></div>
          </div>
          <input type="text" value={rpm ? rpm.toString() : ""} onChange={handleRpmChange} className={styles.calcInput} />
        </div>
      </div>

      <div className={styles.calcBottom}>
        <div className={styles.calcCard}>
          <span className={styles.calcCardLabel}>Daily Earnings</span>
          <span className={styles.calcCardValue}>{formatMoney(dailyEarnings)}</span>
        </div>
        <div className={styles.calcCard}>
          <span className={styles.calcCardLabel}>Monthly Earnings</span>
          <span className={styles.calcCardValue}>{formatMoney(monthlyEarnings)}</span>
        </div>
        <div className={styles.calcCard}>
          <span className={styles.calcCardLabel}>Yearly Earnings</span>
          <span className={styles.calcCardValue}>{formatMoney(yearlyEarnings)}</span>
        </div>
      </div>
    </div>
  );
}

function getToolFormCopy(tool: ToolDefinition, isYouTubePowered: boolean) {
  const bySlug: Record<string, { placeholder: string; button: string; loading: string; secondaryPlaceholder?: string; emptyError?: string }> = {
    "youtube-tags-inspector": {
      placeholder: "Paste a YouTube video URL to extract tags",
      button: "Extract tags",
      loading: "Extracting tags...",
      emptyError: "Paste a YouTube video URL to extract tags.",
    },
    "youtube-hashtags-extractor": {
      placeholder: "Paste a YouTube video URL to extract hashtags",
      button: "Extract hashtags",
      loading: "Extracting hashtags...",
      emptyError: "Paste a YouTube video URL to extract hashtags.",
    },
    "youtube-video-description-copy": {
      placeholder: "Paste a YouTube video URL to copy its description",
      button: "Copy description",
      loading: "Fetching description...",
      emptyError: "Paste a YouTube video URL to copy its description.",
    },
    "youtube-channel-keywords-copy": {
      placeholder: "Paste a channel URL or @handle to extract keywords",
      button: "Extract keywords",
      loading: "Extracting keywords...",
      emptyError: "Paste a channel URL or @handle to extract keywords.",
    },
  };

  if (bySlug[tool.slug]) {
    return bySlug[tool.slug];
  }

  const byKind: Partial<Record<GenericToolKind | "existing", { placeholder: string; button: string; loading: string; secondaryPlaceholder?: string; emptyError?: string }>> = {
    "idea-generator": {
      placeholder: "Enter a niche or topic for video ideas",
      button: "Generate ideas",
      loading: "Generating ideas...",
      emptyError: "Enter a niche or topic to generate ideas.",
    },
    "tag-generator": {
      placeholder: "Enter a topic to generate hashtags",
      button: "Generate hashtags",
      loading: "Generating hashtags...",
      emptyError: "Enter a topic to generate hashtags.",
    },
    "keyword-generator": {
      placeholder: "Enter a seed topic for YouTube keywords",
      button: "Find keywords",
      loading: "Finding keywords...",
      emptyError: "Enter a seed topic to find keywords.",
    },
    "title-generator": {
      placeholder: "Enter your video topic for title ideas",
      button: "Generate titles",
      loading: "Generating titles...",
      emptyError: "Enter a video topic to generate titles.",
    },
    "name-generator": {
      placeholder: "Enter your niche for channel name ideas",
      button: "Generate names",
      loading: "Generating names...",
      emptyError: "Enter your niche to generate channel names.",
    },
    "podcast-title-generator": {
      placeholder: "Enter your podcast episode topic",
      button: "Generate titles",
      loading: "Generating titles...",
      emptyError: "Enter an episode topic to generate podcast titles.",
    },
    "podcast-title-checker": {
      placeholder: "Paste your podcast episode title",
      button: "Analyze title",
      loading: "Analyzing title...",
      emptyError: "Paste a podcast episode title to analyze.",
    },
    "thumbnail-downloader": {
      placeholder: "Paste a YouTube video URL to get thumbnails",
      button: "Get thumbnails",
      loading: "Getting thumbnails...",
      emptyError: "Paste a YouTube video URL to get thumbnails.",
    },
    "banner-downloader": {
      placeholder: "Paste a channel URL or @handle to get its banner",
      button: "Get banner",
      loading: "Getting banner...",
      emptyError: "Paste a channel URL or @handle to get its banner.",
    },
    "video-embedder": {
      placeholder: "Paste a YouTube video URL to generate embed code",
      button: "Generate embed",
      loading: "Generating embed...",
      secondaryPlaceholder: "Start time in seconds (optional)",
      emptyError: "Paste a YouTube video URL to generate embed code.",
    },
    "timestamp": {
      placeholder: "Paste a YouTube video URL for a timestamp link",
      button: "Create link",
      loading: "Creating link...",
      secondaryPlaceholder: "Start time in seconds (optional)",
      emptyError: "Paste a YouTube video URL to create a timestamp link.",
    },
    "data-viewer": {
      placeholder: "Paste a YouTube video URL to view metadata",
      button: "View data",
      loading: "Fetching data...",
      emptyError: "Paste a YouTube video URL to view metadata.",
    },
    "subscribe-link": {
      placeholder: "Paste a channel URL or @handle",
      button: "Create subscribe link",
      loading: "Creating link...",
      emptyError: "Paste a channel URL or @handle to create a subscribe link.",
    },
    "channel-id-finder": {
      placeholder: "Paste a channel URL or @handle",
      button: "Find channel ID",
      loading: "Finding channel ID...",
      emptyError: "Paste a channel URL or @handle to find the channel ID.",
    },
    "channel-search": {
      placeholder: "Enter a channel name, handle, or niche",
      button: "Search channels",
      loading: "Preparing searches...",
      emptyError: "Enter a channel name, handle, or niche.",
    },
    "category-checker": {
      placeholder: "Enter a video topic or keyword",
      button: "Check category",
      loading: "Checking category...",
      emptyError: "Enter a topic or keyword to check category fit.",
    },
    "comment-picker": {
      placeholder: "Paste one YouTube comment per line",
      button: "Pick winner",
      loading: "Picking winner...",
      emptyError: "Paste one comment per line to pick a winner.",
    },
    "timestamp-remover": {
      placeholder: "Paste a YouTube URL with a timestamp",
      button: "Remove timestamp",
      loading: "Removing timestamp...",
      emptyError: "Paste a YouTube URL with a timestamp.",
    },
    "url-cleaner": {
      placeholder: "Paste a messy YouTube URL",
      button: "Clean URL",
      loading: "Cleaning URL...",
      emptyError: "Paste a YouTube URL to clean.",
    },
    "video-id-finder": {
      placeholder: "Paste a YouTube video URL",
      button: "Find video ID",
      loading: "Finding video ID...",
      emptyError: "Paste a YouTube video URL to find the video ID.",
    },
    "shorts-embedder": {
      placeholder: "Paste a YouTube Shorts URL",
      button: "Generate embed",
      loading: "Generating embed...",
      emptyError: "Paste a YouTube Shorts URL to generate embed code.",
    },
    "playlist-embedder": {
      placeholder: "Paste a YouTube playlist URL",
      button: "Generate embed",
      loading: "Generating embed...",
      emptyError: "Paste a YouTube playlist URL to generate embed code.",
    },
    "thumbnail-previewer": {
      placeholder: "Paste a YouTube video URL to preview thumbnails",
      button: "Preview thumbnail",
      loading: "Loading preview...",
      emptyError: "Paste a YouTube video URL to preview its thumbnail.",
    },
    "channel-age-checker": {
      placeholder: "Paste a channel URL or @handle",
      button: "Check age",
      loading: "Checking age...",
      emptyError: "Paste a channel URL or @handle to check channel age.",
    },
    "region-checker": {
      placeholder: "Paste a YouTube video URL",
      button: "Check restrictions",
      loading: "Checking restrictions...",
      emptyError: "Paste a YouTube video URL to check region restrictions.",
    },
    "upload-schedule": {
      placeholder: "Paste a channel URL or @handle",
      button: "Analyze schedule",
      loading: "Analyzing schedule...",
      emptyError: "Paste a channel URL or @handle to analyze upload schedule.",
    },
    "channel-compare": {
      placeholder: "Paste Channel 1 URL or @handle",
      button: "Compare channels",
      loading: "Comparing channels...",
      secondaryPlaceholder: "Paste Channel 2 URL or @handle",
      emptyError: "Paste two channel URLs or handles to compare.",
    },
    "video-seo-checker": {
      placeholder: "Paste a YouTube video URL to audit SEO",
      button: "Check SEO",
      loading: "Checking SEO...",
      emptyError: "Paste a YouTube video URL to audit SEO.",
    },
    "channel-video-links": {
      placeholder: "Paste a channel URL or @handle",
      button: "Extract video links",
      loading: "Extracting links...",
      emptyError: "Paste a channel URL or @handle to extract video links.",
    },
    "rss-generator": {
      placeholder: "Paste a channel URL, ID, or @handle",
      button: "Generate RSS feed",
      loading: "Generating RSS feed...",
      emptyError: "Paste a channel URL, ID, or @handle to generate an RSS feed.",
    },
    "comment-downloader": {
      placeholder: "Paste a YouTube video URL",
      button: "Export comments",
      loading: "Fetching comments...",
      emptyError: "Paste a YouTube video URL to export comments.",
    },
    "video-category-finder": {
      placeholder: "Paste a YouTube video URL",
      button: "Find category",
      loading: "Finding category...",
      emptyError: "Paste a YouTube video URL to find its category.",
    },
    "playlist-link-extractor": {
      placeholder: "Paste a YouTube playlist URL",
      button: "Extract links",
      loading: "Extracting links...",
      emptyError: "Paste a YouTube playlist URL to extract links.",
    },
  };

  return byKind[tool.kind] ?? {
    placeholder: isYouTubePowered ? "Enter a topic or keyword" : "Paste or type your input",
    button: isYouTubePowered ? "Generate results" : "Run tool",
    loading: isYouTubePowered ? "Generating results..." : "Working...",
    emptyError: isYouTubePowered ? "Enter a topic or keyword first." : "Add an input first.",
  };
}

export default function GenericToolClient({ tool }: Props) {
  if (tool.kind === "playlist-to-text") {
    return (
      <div className={styles.toolArea}>
        <PlaylistExporter />
      </div>
    );
  }

  if (tool.kind === "playlist-length") {
    return <PlaylistLengthCalculator />;
  }

  // Pure client-side interactive tools that don't need the generic form
  if ((tool.kind as string) === "ctr-calculator") {
    return <div className={styles.toolArea}><CtrCalculator /></div>;
  }
  if ((tool.kind as string) === "title-length-checker") {
    return <div className={styles.toolArea}><TitleLengthChecker /></div>;
  }
  if ((tool.kind as string) === "description-length-checker") {
    return <div className={styles.toolArea}><DescriptionLengthChecker /></div>;
  }
  if ((tool.kind as string) === "playback-speed-calculator") {
    return <div className={styles.toolArea}><PlaybackSpeedCalculator /></div>;
  }
  if ((tool.kind as string) === "views-ratio-calculator") {
    return <div className={styles.toolArea}><ViewsRatioCalculator /></div>;
  }
  if ((tool.kind as string) === "shorts-trend") {
    return <ShortsTrendAnalyzerDashboard />;
  }

  const [input, setInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState("");
  const [uploadMax, setUploadMax] = useState("25");
  const [result, setResult] = useState<ToolResult | null>(null);
  const [sourceVideos, setSourceVideos] = useState<VideoResult[] | null>(null);
  const [error, setError] = useState("");
  const [copyTarget, setCopyTarget] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const copyResetRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (copyResetRef.current) window.clearTimeout(copyResetRef.current); };
  }, []);

  const isYouTubePowered = YOUTUBE_POWERED.has(tool.kind);

  if (tool.kind === "top100-analyzer") {
    return <Top100Leaderboard />;
  }

  if ((tool.kind as string) === "money-calculator") {
    return (
      <div className={styles.toolArea}>
        <InteractiveMoneyCalculator />
      </div>
    );
  }

  const formCopy = useMemo(
    () => getToolFormCopy(tool, isYouTubePowered),
    [tool, isYouTubePowered]
  );

  async function copyText(value: string, target: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyTarget(target);
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
      copyResetRef.current = window.setTimeout(() => setCopyTarget(null), 1800);
    } catch {
      setError("Copy failed. Your browser may be blocking clipboard access.");
    }
  }

  async function fetchMetadata(): Promise<YouTubeMetadata> {
    const trimmed = input.trim();
    if (!trimmed) throw new Error("Paste a YouTube video URL first.");
    const res = await fetch(`/api/youtube-metadata?url=${encodeURIComponent(trimmed)}`, { cache: "no-store" });
    const payload = await res.json() as YouTubeMetadata | { error?: string };
    if (!res.ok || !("title" in payload)) {
      throw new Error("error" in payload ? payload.error ?? "Unable to fetch metadata." : "Unable to fetch metadata.");
    }
    return payload as YouTubeMetadata;
  }

  async function runTool() {
    setError("");
    setResult(null);
    setSourceVideos(null);
    setIsLoading(true);

    try {
      // ── YouTube-powered tools ────────────────────────────────────────────
      if (YOUTUBE_POWERED.has(tool.kind)) {
        const topic = input.trim();
        if (!topic) throw new Error(formCopy.emptyError ?? "Enter a topic or keyword first.");

        // For name-generator, search for "[topic] channel" to get niche channel data
        const searchQuery = tool.kind === "name-generator"
          ? `${topic} youtube channel`
          : tool.kind === "podcast-title-generator"
            ? `${topic} podcast`
            : topic;

        const { videos, suggestions } = await searchYouTube(searchQuery);
        setSourceVideos(videos);

        switch (tool.kind) {
          case "title-generator": {
            const res = await fetch("/api/ai-titles", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic, videos })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate titles");
            setResult({ kind: "list", items: data.titles });
            break;
          }
          case "idea-generator": {
            const res = await fetch("/api/ai-ideas", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic, videos, suggestions })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate ideas");
            
            // Format ideas for display (title + description + score)
            const formattedIdeas = data.ideas.map((idea: any) => 
              `${idea.title}\n\n${idea.description}\n[Score: ${idea.trend_score}/100 | ${idea.category}]`
            );
            setResult({ kind: "text-list", items: formattedIdeas });
            break;
          }
          case "keyword-generator": {
            const metrics = await enrichWithFreeYouTubeVolume(runKeywordAlgorithm(topic, videos, suggestions));
            setResult({ kind: "advanced-keywords", keywords: metrics, topic });
            break;
          }
          case "name-generator":
            setResult({ kind: "list", items: runNameAlgorithm(topic, videos) });
            break;
          case "podcast-title-generator":
            setResult({ kind: "list", items: runPodcastTitleAlgorithm(topic, videos) });
            break;
          case "top100-analyzer":
            setResult({ kind: "insights", items: runTop100Algorithm(topic, videos) });
            break;
          case "category-checker": {
            const { category, evidence } = runCategoryAlgorithm(topic, videos);
            setResult({ kind: "category", category, keyword: topic, evidence });
            break;
          }
        }
        return;
      }

      // ── Non-YouTube-powered tools ────────────────────────────────────────
      switch (tool.kind) {
        case "tag-generator": {
          const topic = input.trim() || "youtube growth";
          const res = await fetch("/api/ai-hashtags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to generate hashtags");
          setResult({ kind: "chips", items: data.hashtags });
          break;
        }
        case "podcast-title-checker": {
          const score = scoreTitle(input);
          const notes = [
            score >= 80 ? "Strong title - clear, benefit-led, and clickable." : "Good start. Make the promise clearer or add a sharper angle.",
            input.length > 90 ? `Long title (${input.length} chars). Consider shortening for podcast apps.` : `Comfortable length (${input.length} chars) for most podcast apps.`,
            /\bwith\b/i.test(input) ? "Guest-led angle detected - mention the guest name if possible." : "No guest marker. Add a result, stat, or listener benefit if relevant.",
            /[?!]/.test(input) ? "Good - question or emphasis makes the title feel conversational." : "No question or emphasis. A '?' can increase curiosity.",
          ];
          setResult({ kind: "score", score, notes });
          break;
        }
        case "metadata-copy": {
          const meta = await fetchMetadata();
          setResult({ kind: "metadata", meta });
          break;
        }
        case "tags-inspector": {
          const meta = await fetchMetadata();
          setResult({ kind: "tags-inspector", meta });
          break;
        }
        case "channel-keywords-copy": {
          const target = input.trim();
          if (!target) throw new Error("Paste a channel URL or handle first.");
          const res = await fetch(`/api/yt-channel-keywords?target=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch channel keywords");
          
          if (!data.keywords || data.keywords.length === 0) {
            throw new Error("No hidden keywords found for this channel.");
          }
          setResult({ kind: "chips", items: data.keywords });
          break;
        }
        case "data-viewer": {
          const meta = await fetchMetadata();
          setResult({ kind: "data", meta });
          break;
        }
        case "thumbnail-downloader": {
          const videoId = getVideoId(input);
          if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error("Paste a valid YouTube video URL or video ID.");
          setResult({ kind: "thumbnails", videoId });
          break;
        }
        case "video-embedder":
        case "timestamp": {
          const videoId = getVideoId(input);
          if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error("Paste a valid YouTube video URL or video ID.");
          const seconds = Math.max(0, Number(secondaryInput || 0));
          const startQuery = seconds ? `?start=${Math.floor(seconds)}` : "";
          const embedUrl = `https://www.youtube.com/embed/${videoId}${startQuery}`;
          const shareUrl = `https://youtu.be/${videoId}${seconds ? `?t=${Math.floor(seconds)}` : ""}`;
          const embedCode = `<iframe src="${embedUrl}" width="560" height="315" title="YouTube video player" allowfullscreen></iframe>`;
          setResult({ kind: "embed", videoId, shareUrl, embedUrl, embedCode });
          break;
        }
        case "subscribe-link": {
          const target = getChannelTarget(input);
          if (!target) throw new Error("Paste a YouTube channel URL, channel ID, or @handle.");
          const path = target.startsWith("@") ? target : `channel/${target}`;
          setResult({ kind: "subscribe", url: `https://www.youtube.com/${path}?sub_confirmation=1` });
          break;
        }
        case "channel-id-finder": {
          const target = getChannelTarget(input);
          if (!target) throw new Error("Paste a YouTube channel URL, channel ID, or @handle.");
          const path = target.startsWith("@") ? target : `channel/${target}`;
          setResult({ kind: "labeled-links", items: [
            { label: "Channel Handle / ID", url: target, isText: true },
            { label: "Channel Page", url: `https://www.youtube.com/${path}` },
            { label: "About Page", url: `https://www.youtube.com/${path}/about` },
          ]});
          break;
        }
        case "banner-downloader": {
          const target = getChannelTarget(input);
          if (!target) throw new Error("Paste a YouTube channel URL, channel ID, or @handle.");
          
          const res = await fetch(`/api/yt-banner-url?target=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch banner");
          
          setResult({ kind: "thumbnails", videoId: "BANNER", customUrl: data.bannerUrl });
          break;
        }
        case "channel-search": {
          const query = input.trim();
          if (!query) throw new Error("Enter a channel name, handle, or topic.");
          setResult({ kind: "labeled-links", items: [
            { label: "YouTube Search", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` },
            { label: "YouTube Channel Search", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} channel`)}` },
            { label: "Google Site Search", url: `https://www.google.com/search?q=${encodeURIComponent(`site:youtube.com ${query}`)}` },
          ]});
          break;
        }
        case "playlist-length": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube playlist URL or ID.");
          const res = await fetch(`/api/youtube-playlist?url=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch playlist data.");
          
          setResult({ kind: "playlist", videos: data.items });
          break;
        }
        case "playlist-to-text": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube playlist URL or ID.");
          const res = await fetch(`/api/youtube-playlist?url=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch playlist data.");
          
          setResult({ kind: "playlist-text", videos: data.items });
          break;
        }
        case "money-calculator": {
          const views = Number(input.replace(/[^\d.]/g, ""));
          const rpm = Number(secondaryInput.replace(/[^\d.]/g, "")) || 3;
          if (!views) throw new Error("Enter a view count.");
          setResult({ kind: "money", revenue: (views / 1000) * rpm, views, rpm });
          break;
        }
        case "comment-picker": {
          const comments = unique(input.split(/\r?\n/));
          if (!comments.length) throw new Error("Paste one comment per line.");
          const winner = comments[Math.floor(Math.random() * comments.length)];
          setResult({ kind: "picker", winner, count: comments.length, allComments: comments });
          break;
        }

        // ── New tool cases ──────────────────────────────────────────────────
        case "timestamp-remover":
        case "url-cleaner": {
          const raw = input.trim();
          if (!raw) throw new Error("Paste a YouTube URL first.");
          let cleaned = raw;
          try {
            const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
            const host = url.hostname.replace(/^www\./, "");
            if (!host.includes("youtube") && host !== "youtu.be") throw new Error("Paste a YouTube URL.");
            // For timestamp-remover: strip t param only; for url-cleaner: strip all extras
            if (tool.kind === "timestamp-remover") {
              url.searchParams.delete("t");
              url.searchParams.delete("si");
            } else {
              // Keep only essential params
              const v = url.searchParams.get("v");
              const list = url.searchParams.get("list");
              url.search = "";
              if (v) url.searchParams.set("v", v);
              if (list && !v) url.searchParams.set("list", list);
            }
            cleaned = url.toString();
          } catch (e) {
            if (e instanceof Error && e.message !== "Paste a YouTube URL.") cleaned = raw;
            else throw e;
          }
          const videoId = getVideoId(cleaned) ?? "";
          setResult({ kind: "clean-url", original: raw, cleaned, videoId });
          break;
        }
        case "video-id-finder": {
          const raw = input.trim();
          if (!raw) throw new Error("Paste a YouTube video URL first.");
          const videoId = getVideoId(raw) ?? "";
          if (!videoId) throw new Error("Could not extract a video ID from this URL.");
          const cleaned = `https://www.youtube.com/watch?v=${videoId}`;
          setResult({ kind: "clean-url", original: raw, cleaned, videoId });
          break;
        }
        case "shorts-embedder": {
          const raw = input.trim();
          if (!raw) throw new Error("Paste a YouTube Shorts URL first.");
          const videoId = getVideoId(raw);
          if (!videoId) throw new Error("Could not extract a Shorts video ID.");
          const previewUrl = `https://www.youtube.com/embed/${videoId}?mute=1`;
          const code = `<iframe width="315" height="560" src="https://www.youtube.com/embed/${videoId}" title="YouTube Shorts" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          setResult({ kind: "embed-code", code, previewUrl, isShorts: true, isPlaylist: false });
          break;
        }
        case "playlist-embedder": {
          const raw = input.trim();
          if (!raw) throw new Error("Paste a YouTube playlist URL first.");
          let listId = "";
          try {
            const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
            listId = url.searchParams.get("list") ?? "";
          } catch { /* ignored */ }
          if (!listId) throw new Error("Could not extract a playlist ID from this URL.");
          const previewUrl = `https://www.youtube.com/embed/?listType=playlist&list=${listId}&mute=1`;
          const code = `<iframe width="560" height="315" src="https://www.youtube.com/embed/?listType=playlist&list=${listId}" title="YouTube Playlist" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          setResult({ kind: "embed-code", code, previewUrl, isShorts: false, isPlaylist: true });
          break;
        }
        case "thumbnail-previewer": {
          const raw = input.trim();
          const videoId = getVideoId(raw) ?? (raw.length === 11 ? raw : "");
          if (!videoId) throw new Error("Paste a valid YouTube video URL.");
          const meta = await fetchMetadata();
          setResult({ kind: "thumbnail-preview", videoId, title: meta.title });
          break;
        }
        case "channel-age-checker": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube channel URL or @handle.");
          const res = await fetch(`/api/yt-channel-age?target=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch channel age.");
          const created = data.publishedAt ? new Date(data.publishedAt) : null;
          const ageDays = created ? Math.floor((Date.now() - created.getTime()) / 86400000) : 0;
          setResult({
            kind: "channel-age",
            channelId: data.channelId,
            title: data.title,
            publishedAt: data.publishedAt ?? "",
            ageDays,
            thumbnail: data.thumbnail ?? "",
            subscriberCount: data.subscriberCount ?? "",
            videoCount: data.videoCount ?? "",
            viewCount: data.viewCount ?? "",
          });
          break;
        }
        case "region-checker": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube video URL.");
          const res = await fetch(`/api/yt-region-check?url=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to check region restrictions.");
          setResult({ kind: "region-check", videoId: data.videoId, title: data.title, hasRestrictions: data.hasRestrictions, allowed: data.allowed ?? [], blocked: data.blocked ?? [], isGloballyAvailable: data.isGloballyAvailable });
          break;
        }
        case "upload-schedule": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube channel URL or @handle.");
          const res = await fetch(`/api/yt-upload-schedule?target=${encodeURIComponent(target)}&max=${uploadMax}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to analyze upload schedule.");
          setResult({ kind: "upload-schedule", channelId: data.channelId, totalAnalyzed: data.totalAnalyzed, bestDay: data.bestDay, bestHour: data.bestHour, avgUploadsPerMonth: data.avgUploadsPerMonth, dayDistribution: data.dayDistribution, hourDistribution: data.hourDistribution ?? [], monthlyBreakdown: data.monthlyBreakdown ?? [], recentVideos: data.recentVideos });
          break;
        }
        case "channel-compare": {
          const ch1 = input.trim();
          const ch2 = secondaryInput.trim();
          if (!ch1 || !ch2) throw new Error("Paste two channel URLs to compare.");
          const res = await fetch(`/api/yt-channel-compare?channel1=${encodeURIComponent(ch1)}&channel2=${encodeURIComponent(ch2)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to compare channels.");
          setResult({ kind: "channel-compare", channel1: data.channel1, channel2: data.channel2 });
          break;
        }
        case "video-seo-checker": {
          const meta = await fetchMetadata();
          // Run SEO checks
          const titleLen = meta.title?.length ?? 0;
          const descLen = meta.description?.length ?? 0;
          const tagCount = meta.tags?.length ?? 0;
          const hashtagCount = meta.hashtags?.length ?? 0;
          const hasTimestamps = (meta.timestamps?.length ?? 0) > 0;
          const checks: SeoCheck[] = [
            { label: "Title Length (40–70 chars)", passed: titleLen >= 40 && titleLen <= 70, note: titleLen < 40 ? `Too short (${titleLen} chars). Add more keywords.` : titleLen > 70 ? `Too long (${titleLen} chars). May truncate in search.` : `Good - ${titleLen} characters.` },
            { label: "Description (250+ chars)", passed: descLen >= 250, note: descLen === 0 ? "No description found." : descLen < 250 ? `Only ${descLen} chars. Aim for 250+.` : `Good - ${descLen} characters.` },
            { label: "Tags Added (5+ tags)", passed: tagCount >= 5, note: tagCount === 0 ? "No tags found." : tagCount < 5 ? `Only ${tagCount} tags. Add more for better discovery.` : `${tagCount} tags - well optimized.` },
            { label: "Hashtags (1–3 hashtags)", passed: hashtagCount >= 1 && hashtagCount <= 3, note: hashtagCount === 0 ? "No hashtags in description." : hashtagCount > 3 ? `${hashtagCount} hashtags - keep to 1–3 for best results.` : `${hashtagCount} hashtag(s) - good.` },
            { label: "Timestamps in Description", passed: hasTimestamps, note: hasTimestamps ? "Timestamps found - great for chapter navigation." : "No timestamps. Adding them improves watch time." },
            { label: "Description Has Keywords", passed: descLen > 0 && meta.description?.toLowerCase().includes(meta.title?.split(" ")[0]?.toLowerCase() ?? ""), note: "First word of title found in description - good for relevance."},
          ];
          const score = Math.round((checks.filter(c => c.passed).length / checks.length) * 100);
          setResult({ kind: "video-seo", meta, score, checks });
          break;
        }
        case "channel-video-links": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube channel URL or @handle.");
          const res = await fetch(`/api/yt-channel-videos?target=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch channel videos.");
          setResult({ kind: "channel-videos", channelId: data.channelId, channelTitle: data.channelTitle, totalFetched: data.totalFetched ?? (data.videos?.length ?? 0), videos: data.videos });
          break;
        }
        case "rss-generator": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube channel URL, handle, or channel ID.");
          
          // Try to get channel info via yt-channel-videos API to get latest videos for preview
          const res = await fetch(`/api/yt-channel-videos?target=${encodeURIComponent(target)}&max=6`);
          const data = await res.json();
          
          if (res.ok && data.channelId) {
            setResult({ 
              kind: "rss-url", 
              channelId: data.channelId, 
              rssUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${data.channelId}`, 
              title: data.channelTitle ?? "",
              videos: data.videos ?? []
            });
          } else {
            // Fallback for simple ID extraction
            let fallbackId = "";
            const idMatch = target.match(/UC[A-Za-z0-9_-]{22}/);
            if (idMatch) fallbackId = idMatch[0];
            if (!fallbackId) throw new Error("Could not resolve channel. Paste a direct channel URL or ensure channel has public videos.");
            setResult({ kind: "rss-url", channelId: fallbackId, rssUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${fallbackId}`, title: "" });
          }
          break;
        }
        case "comment-downloader": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube video URL.");
          const res = await fetch(`/api/yt-comments-export?url=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch comments.");
          setResult({ kind: "comments-export", videoId: data.videoId, comments: data.comments });
          break;
        }
        case "video-category-finder": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube video URL.");
          const res = await fetch(`/api/yt-video-category?url=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch video category.");
          setResult({ kind: "video-category", videoId: data.videoId, title: data.title, categoryId: data.categoryId, categoryName: data.categoryName });
          break;
        }
        case "playlist-link-extractor": {
          const target = input.trim();
          if (!target) throw new Error("Paste a YouTube playlist URL or ID.");
          const res = await fetch(`/api/youtube-playlist?url=${encodeURIComponent(target)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch playlist data.");
          setResult({ kind: "playlist-links", videos: data.items });
          break;
        }
        default:
          setError("This tool is not yet supported.");
      }
    } catch (toolError) {
      setResult(null);
      setSourceVideos(null);
      setError(toolError instanceof Error ? toolError.message : "Unable to run this tool right now.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReroll() {
    if (result?.kind !== "picker") return;
    const next = result.allComments[Math.floor(Math.random() * result.allComments.length)];
    setResult({ ...result, winner: next });
  }

  const usesSecondary = ["money-calculator","video-embedder","timestamp","channel-compare"].includes(tool.kind);
  const usesTextarea  = ["playlist-length","playlist-to-text","comment-picker"].includes(tool.kind);

  function renderResult() {
    if (!result) return null;
    switch (result.kind) {
      case "thumbnails":    return <ThumbnailResult videoId={result.videoId} customUrl={result.customUrl} onCopy={copyText} copyTarget={copyTarget} />;
      case "embed":         return <EmbedResult result={result} onCopy={copyText} copyTarget={copyTarget} />;
      case "metadata":      return <MetadataResult meta={result.meta} onCopy={copyText} copyTarget={copyTarget} />;
      case "tags-inspector":return <TagsInspectorResult meta={result.meta} onCopy={copyText} copyTarget={copyTarget} />;
      case "data":          return <DataResult meta={result.meta} onCopy={copyText} copyTarget={copyTarget} />;
      case "labeled-links": return <LabeledLinksResult items={result.items} onCopy={copyText} copyTarget={copyTarget} />;
      case "subscribe":     return <SubscribeResult url={result.url} onCopy={copyText} copyTarget={copyTarget} />;
      case "money":         return <InteractiveMoneyCalculator />;
      case "playlist":      return <PlaylistResult videos={result.videos} />;
      case "playlist-text": return <PlaylistExporter />;
      case "picker":        return <PickerResult winner={result.winner} count={result.count} allComments={result.allComments} onReroll={handleReroll} />;
      case "score":         return <ScoreResult score={result.score} notes={result.notes} />;
      case "category":      return <CategoryResult category={result.category} keyword={result.keyword} evidence={result.evidence} />;
      case "chips":         return <ChipsResult items={result.items} onCopy={copyText} copyTarget={copyTarget} />;
      case "list":          return <ListResult items={result.items} onCopy={copyText} copyTarget={copyTarget} />;
      case "insights":      return <InsightsResult items={result.items} />;
      case "text-list":     return <TextListResult items={result.items} onCopy={copyText} copyTarget={copyTarget} />;
      case "yt-analysis":   return <InsightsResult items={result.summary} />;
      // ── New tool results ──────────────────────────────────────────────────
      case "clean-url":         return <CleanUrlResult result={result} onCopy={copyText} copyTarget={copyTarget} />;
      case "embed-code":        return <EmbedCodeResult result={result} onCopy={copyText} copyTarget={copyTarget} />;
      case "thumbnail-preview": return <ThumbnailPreviewResult videoId={result.videoId} title={result.title} />;
      case "channel-age":       return <ChannelAgeResult result={result} />;
      case "region-check":      return <RegionCheckResult result={result} onCopy={copyText} copyTarget={copyTarget} />;
      case "upload-schedule":   return <UploadScheduleResult result={result} />;
      case "channel-compare":   return <ChannelCompareResult result={result} />;
      case "video-seo":         return <VideoSeoResult meta={result.meta} score={result.score} checks={result.checks} />;
      case "channel-videos":    return <ChannelVideoLinksResult result={result} onCopy={copyText} copyTarget={copyTarget} />;
      case "rss-url":           return <RssResult result={result} onCopy={copyText} copyTarget={copyTarget} />;
      case "comments-export":   return <CommentsExportResult result={result} />;
      case "video-category":    return <VideoCategoryResult result={result} />;
      case "playlist-links":    return <PlaylistLinksResult videos={result.videos} onCopy={copyText} copyTarget={copyTarget} />;
      case "advanced-keywords": return <AdvancedKeywordsResult result={result} onCopy={copyText} copyTarget={copyTarget} />;
      // Single-value results for new tools
      case "ctr":               return <CtrCalculator />;
      case "title-length":      return <TitleLengthChecker />;
      case "desc-length":       return <DescriptionLengthChecker />;
      case "playback-speed":    return <PlaybackSpeedCalculator />;
      case "views-ratio":       return <ViewsRatioCalculator />;
    }
  }

  const loadingMsg = formCopy.loading;

  return (
    <div className={styles.toolArea}>
      {isYouTubePowered && (
        <p className={styles.ytPoweredBadge}>
          <span>⚡</span> Powered by live YouTube data - results update from real search results
        </p>
      )}

      <div className={styles.generatorForm}>
        <div className={styles.searchRow}>
          {usesTextarea ? (
            <textarea className={styles.outputBox} value={input} onChange={e => setInput(e.target.value)}
              placeholder={formCopy.placeholder} aria-label={formCopy.placeholder} />
          ) : (
            <input className={styles.searchInput} type="text" value={input}
              onChange={e => setInput(e.target.value)} placeholder={formCopy.placeholder}
              onKeyDown={e => { if (e.key === 'Enter') void runTool(); }}
              autoComplete="off" aria-label={formCopy.placeholder} />
          )}
          <button className={styles.generateButton} type="button" disabled={isLoading} onClick={() => void runTool()}>
            {isLoading ? loadingMsg : formCopy.button}
          </button>
        </div>
        {usesSecondary ? (
          <div className={styles.searchRow}>
            <input className={styles.searchInput} type="text" value={secondaryInput}
              onChange={e => setSecondaryInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void runTool(); }}
              placeholder={formCopy.secondaryPlaceholder ?? "Optional second input"}
              aria-label={formCopy.secondaryPlaceholder ?? "Optional second input"} />
            <button className={styles.ghostButton} type="button" onClick={() => setSecondaryInput("")}>Clear</button>
          </div>
        ) : null}
        
        {tool.kind === "upload-schedule" ? (
          <div className={styles.searchRow} style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>Videos to analyze (lookback):</label>
            <select value={uploadMax} onChange={e => setUploadMax(e.target.value)} style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "6px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: "0.85rem", cursor: "pointer", outline: "none" }}>
              <option value="10">Last 10 videos (Fast)</option>
              <option value="25">Last 25 videos (Recommended)</option>
              <option value="50">Last 50 videos (Deep analysis)</option>
            </select>
          </div>
        ) : null}
      </div>

      {error ? <p className={styles.errorText}>{error}</p> : null}

      {result ? (
        <div className={styles.richResults}>
          <div className={styles.richResultsHeader}>
            <button type="button" className={`${styles.smButton} ${styles.smButtonGhost}`}
              onClick={() => { setResult(null); setSourceVideos(null); setError(""); }}>
              Clear
            </button>
            <button type="button" className={`${styles.smButton} ${styles.smButtonPrimary}`}
              onClick={() => void copyText(resultToCopyText(result), "all")}>
              {copyTarget === "all" ? "Copied all ✓" : "Copy all"}
            </button>
          </div>

          {renderResult()}

          {/* Show the real YouTube videos that drove the results */}
          {sourceVideos?.length ? <YtSourceVideos videos={sourceVideos} /> : null}
        </div>
      ) : null}
    </div>
  );
}
