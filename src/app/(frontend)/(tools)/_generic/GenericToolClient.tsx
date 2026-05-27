"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ToolDefinition } from "@/lib/tool-catalog";
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
};

type VideoResult = {
  title: string; channel: string;
  views: string; published: string; videoId: string;
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
  | { kind: "yt-analysis"; videos: VideoResult[]; summary: string[] };

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


function runKeywordAlgorithm(topic: string, videos: VideoResult[]): string[] {
  const inputWords = new Set(getWords(topic));
  const topicTrimmed = topic.trim().toLowerCase();

  // Build unigram + bigram frequency from ALL real video titles
  const unigramFreq = new Map<string, number>();
  const bigramFreq  = new Map<string, number>();

  videos.forEach((v, idx) => {
    const weight = Math.max(1, videos.length - idx);
    const words = getWords(v.title).filter(w => w.length >= 3);

    for (let i = 0; i < words.length; i++) {
      if (!inputWords.has(words[i])) {
        unigramFreq.set(words[i], (unigramFreq.get(words[i]) ?? 0) + weight);
      }
      if (i < words.length - 1) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        const containsInput = getWords(topic).some(w => bigram.includes(w));
        bigramFreq.set(bigram, (bigramFreq.get(bigram) ?? 0) + weight * (containsInput ? 1.4 : 1));
      }
    }
  });

  const topUnigrams = [...unigramFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
  const topBigrams  = [...bigramFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);

  // Combine into keyword list — long-tail phrases first, then individual keywords
  const keywords = [
    // Long-tail phrase combos using the topic + real keywords
    ...topUnigrams.slice(0, 4).map(kw => `${topicTrimmed} ${kw}`),
    ...topBigrams.slice(0, 4),
    // Standalone high-frequency keywords from YouTube
    ...topUnigrams.slice(0, 6),
    // Intent-based suffixes applied to the topic
    `${topicTrimmed} for beginners`,
    `${topicTrimmed} tutorial`,
    `${topicTrimmed} tips`,
    `how to ${topicTrimmed}`,
    `${topicTrimmed} 2025`,
    `best ${topicTrimmed}`,
  ];

  return unique(keywords).slice(0, 20);
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
    : `Weak signal — fewer than 3 direct matches. YouTube's actual category is set inside Studio.`;

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
    `${uniqueChannels} different channels appear — ${uniqueChannels <= 5 ? "niche is concentrated around a few big players" : "space is spread across many creators, good entry opportunity"}.`,
  ];

  if (repeatedChannels.length) {
    insights.push(`"${repeatedChannels[0]}" appears multiple times — likely the dominant channel in this niche.`);
  }

  insights.push(
    `Most common title format on YouTube for this topic: ${dominant}.`,
    `Top keywords in high-ranking videos: ${dominantKw || topic}.`,
    howToCount >= 3
      ? "How-to content dominates — viewers want step-by-step, actionable videos."
      : "Informational/entertainment formats are performing well — consider story-driven or data-led angles.",
    numberCount >= 3
      ? "Numbered list videos (5 tips, 7 mistakes) get strong click-through in this niche."
      : "List formats are underused here — could be a differentiation angle.",
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
      return result.videos.map(v => `${v.title} — ${v.channel}`).join("\n");
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
        <p className={styles.metaFieldValue}>{meta.title || "—"}</p>
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
    { label: "Views",     value: meta.viewCount ? Number(meta.viewCount).toLocaleString("en-US") : "—" },
    { label: "Likes",     value: meta.likeCount || "—" },
    { label: "Comments",  value: meta.commentCount || "—" },
    { label: "Duration",  value: meta.durationSeconds ? formatDuration(Number(meta.durationSeconds)) : "—" },
    { label: "Published", value: meta.uploadDate?.slice(0, 10) || "—" },
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
  const verdict = score >= 80 ? "Strong" : score >= 60 ? "Decent" : "Needs work";
  return (
    <div className={styles.scoreResult}>
      <div className={styles.scoreHero}>
        <ScoreRingSvg score={score} />
        <div><p className={styles.scoreVerdictLabel}>Title Score</p><p className={styles.scoreVerdict}>{verdict}</p></div>
      </div>
      <div className={styles.scoreNotes}>{notes.map(note => (
        <div key={note} className={styles.scoreNote}>
          <span className={styles.scoreNoteDot} aria-hidden="true" />
          <span>{note}</span>
        </div>
      ))}</div>
    </div>
  );
}

function CategoryResult({ category, keyword, evidence }: { category: string; keyword: string; evidence: string }) {
  return (
    <div className={styles.categoryResult}>
      <span className={styles.categoryResultLabel}>Estimated YouTube Category</span>
      <span className={styles.categoryBadge}>{category}</span>
      {keyword ? <p className={styles.categoryKeyword}>Keyword analysed: <strong>{keyword}</strong></p> : null}
      <p className={styles.categoryNote}>{evidence}</p>
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
    <div style={{ marginTop: "1.5rem" }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.25)", animation: "pulse 2s infinite" }} />
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)" }}>LIVE — Real-Time YouTube Data</span>
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
          <div style={{ minWidth: 600 }}>
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
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.04)", borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "0.9rem 1rem", textAlign: "center", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase", width: 60 }}>#</th>
                <th style={{ padding: "0.9rem 1.2rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase" }}>Channel</th>
                <th style={{ padding: "0.9rem 1.2rem", textAlign: "right", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Subscribers</th>
                <th style={{ padding: "0.9rem 1.2rem", textAlign: "right", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Total Views</th>
                <th style={{ padding: "0.9rem 1.2rem", textAlign: "right", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase" }}>Videos</th>
                <th style={{ padding: "0.9rem 1rem", textAlign: "center", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-secondary)", textTransform: "uppercase" }}>Country</th>
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
                  <td style={{ padding: "0.85rem 1.2rem", textAlign: "right", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{c.views}</span>
                    <span style={{ color: "#10b981", fontSize: "0.75rem", marginLeft: "0.25rem" }}>▲</span>
                  </td>
                  <td style={{ padding: "0.85rem 1.2rem", textAlign: "right", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{c.videos}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
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

  const [input, setInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState("");
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

  const placeholder = useMemo(() => {
    if (isYouTubePowered) return "Enter a topic or keyword (e.g. guitar for beginners)";
    if (tool.kind.includes("metadata") || ["thumbnail-downloader","video-embedder","timestamp","data-viewer"].includes(tool.kind))
      return "Paste YouTube URL or video ID";
    if (tool.kind.includes("channel") || tool.kind === "subscribe-link" || tool.kind === "banner-downloader")
      return "Paste channel URL or @handle";
    if (tool.kind === "playlist-length" || tool.kind === "playlist-to-text")
      return "Paste YouTube playlist URL";
    if (tool.kind === "comment-picker") return "Paste one comment per line";
    if (tool.kind === "podcast-title-checker") return "Paste podcast episode title";
    return "Enter a topic or keyword";
  }, [tool.kind, isYouTubePowered]);

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
        if (!topic) throw new Error("Enter a topic or keyword first.");

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
          case "keyword-generator":
            setResult({ kind: "chips", items: runKeywordAlgorithm(topic, videos) });
            break;
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
            score >= 80 ? "Strong title — clear, benefit-led, and clickable." : "Good start. Make the promise clearer or add a sharper angle.",
            input.length > 90 ? `Long title (${input.length} chars). Consider shortening for podcast apps.` : `Comfortable length (${input.length} chars) for most podcast apps.`,
            /\bwith\b/i.test(input) ? "Guest-led angle detected — mention the guest name if possible." : "No guest marker. Add a result, stat, or listener benefit if relevant.",
            /[?!]/.test(input) ? "Good — question or emphasis makes the title feel conversational." : "No question or emphasis. A '?' can increase curiosity.",
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

  const usesSecondary = ["money-calculator","video-embedder","timestamp"].includes(tool.kind);
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
    }
  }

  const loadingMsg = isYouTubePowered ? "Searching YouTube…" : "Working…";

  return (
    <div className={styles.toolArea}>
      {isYouTubePowered && (
        <p className={styles.ytPoweredBadge}>
          <span>⚡</span> Powered by live YouTube data — results update from real search results
        </p>
      )}

      <form className={styles.generatorForm} onSubmit={e => { e.preventDefault(); void runTool(); }}>
        <div className={styles.searchRow}>
          {usesTextarea ? (
            <textarea className={styles.outputBox} value={input} onChange={e => setInput(e.target.value)}
              placeholder={placeholder} aria-label={placeholder} />
          ) : (
            <input className={styles.searchInput} type="text" value={input}
              onChange={e => setInput(e.target.value)} placeholder={placeholder}
              autoComplete="off" aria-label={placeholder} />
          )}
          <button className={styles.generateButton} type="submit" disabled={isLoading}>
            {isLoading ? loadingMsg : "Run tool"}
          </button>
        </div>
        {usesSecondary ? (
          <div className={styles.searchRow}>
            <input className={styles.searchInput} type="text" value={secondaryInput}
              onChange={e => setSecondaryInput(e.target.value)}
              placeholder={(tool.kind as string) === "money-calculator" ? "RPM (default: $3.00)" : "Start time in seconds (optional)"}
              aria-label="Optional second input" />
            <button className={styles.ghostButton} type="button" onClick={() => setSecondaryInput("")}>Clear</button>
          </div>
        ) : null}
      </form>

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
