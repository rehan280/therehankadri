"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  MessageCircle,
  ThumbsUp,
  Type,
  UserRound,
} from "lucide-react";
import styles from "../youtube-tags-generator/page.module.css";
import Link from "next/link";

type ExtractorMode = "title" | "description";

type YouTubeMetadata = {
  videoId: string;
  url: string;
  title: string;
  description: string;
  channelName: string;
  channelUrl: string;
  durationSeconds: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  uploadDate: string;
  tags: string[];
  hashtags: string[];
  timestamps: string[];
};

type Props = {
  mode: ExtractorMode;
};

function formatNumber(value: string) {
  if (/^\d+(?:\.\d+)?[KMB]$/i.test(value.trim())) {
    return value.trim().toUpperCase();
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "Not shown";
  }

  return new Intl.NumberFormat("en-US").format(numericValue);
}

function formatDuration(value: string) {
  const seconds = Number(value);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "Not shown";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts = hours > 0 ? [hours, minutes, remainingSeconds] : [minutes, remainingSeconds];

  return parts.map((part) => String(part).padStart(2, "0")).join(":");
}

function formatDate(value: string) {
  if (!value) {
    return "Not shown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildDownloadText(result: YouTubeMetadata) {
  const tagsWithTitle = getTagsWithTitle(result);

  return [
    `Title: ${result.title}`,
    "",
    `URL: ${result.url}`,
    `Channel: ${result.channelName || "Not shown"}`,
    `Views: ${formatNumber(result.viewCount)}`,
    `Likes: ${formatNumber(result.likeCount)}`,
    `Comments: ${formatNumber(result.commentCount)}`,
    `Upload date: ${formatDate(result.uploadDate)}`,
    "",
    "Description:",
    result.description || "No public description found.",
    "",
    "Tags:",
    tagsWithTitle.length ? tagsWithTitle.join(", ") : "No public tags found.",
  ].join("\n");
}

function getTagsWithTitle(result: YouTubeMetadata) {
  return Array.from(new Set([result.title, ...result.tags].map((value) => value.trim()).filter(Boolean)));
}

export default function YouTubeMetadataExtractorClient({ mode }: Props) {
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState<YouTubeMetadata | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copyTarget, setCopyTarget] = useState<string | null>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  async function extractMetadata() {
    const trimmedUrl = videoUrl.trim();

    if (!trimmedUrl) {
      setError("Paste a YouTube video or Shorts URL.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/youtube-metadata?url=${encodeURIComponent(trimmedUrl)}`,
        { cache: "no-store" }
      );
      const payload = (await response.json()) as YouTubeMetadata | { error?: string };

      if (!response.ok || !("title" in payload)) {
        const message = "error" in payload ? payload.error : undefined;
        throw new Error(message ?? "Unable to extract metadata right now.");
      }

      setResult(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to extract metadata right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function copyText(value: string, target: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyTarget(target);

      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }

      copyResetTimeoutRef.current = window.setTimeout(() => {
        setCopyTarget(null);
      }, 1800);
    } catch {
      setError("Copy failed. Your browser may be blocking clipboard access.");
    }
  }

  function downloadResult() {
    if (!result) {
      return;
    }

    const blob = new Blob([buildDownloadText(result)], {
      type: "text/plain;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `youtube-${mode}-extract-${result.videoId}.txt`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  }

  const mainOutput = mode === "title" ? result?.title ?? "" : result?.description ?? "";
  const primaryAction = mode === "title" ? "Extract title" : "Extract description";
  const copyAction = mode === "title" ? "Copy title" : "Copy description";
  const characterCount = mainOutput.length;
  const titleCount = result?.title.length ?? 0;
  const descriptionCount = result?.description.length ?? 0;
  const tagsWithTitle = result ? getTagsWithTitle(result) : [];

  return (
    <div className={styles.toolArea}>
      <form
        className={styles.generatorForm}
        onSubmit={(e) => {
          e.preventDefault();
          void extractMetadata();
        }}
      >
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="url"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="Paste YouTube URL"
            autoComplete="off"
            inputMode="url"
            aria-label="Paste YouTube URL"
          />
          <button
            className={styles.generateButton}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Extracting..." : primaryAction}
          </button>
        </div>
      </form>

      {error ? <p className={styles.errorText}>{error}</p> : null}

      {result ? (
        <div className={styles.results}>
          <div className={styles.resultsTop}>
            <span className={styles.characterCount}>
              {characterCount} characters
            </span>
            <div className={styles.resultsActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => void copyText(mainOutput, "main")}
              >
                {copyTarget === "main" ? "Copied" : copyAction}
              </button>
              <button
                className={styles.ghostButton}
                type="button"
                onClick={() => void copyText(buildDownloadText(result), "all")}
              >
                {copyTarget === "all" ? "Copied" : "Copy all metadata"}
              </button>
              <button
                className={styles.ghostButton}
                type="button"
                onClick={downloadResult}
              >
                Download .txt
              </button>
            </div>
          </div>

          <div className={styles.metadataFieldStack}>
            <section className={styles.metadataFieldCard} aria-label="Video title result">
              <div className={styles.metadataFieldHeader}>
                <span className={styles.metadataFieldIcon} aria-hidden="true">
                  <Type size={17} strokeWidth={2.2} />
                </span>
                <div>
                  <h2>Video Title</h2>
                  <p>{titleCount} characters</p>
                </div>
                <button
                  className={styles.metadataMiniButton}
                  type="button"
                  onClick={() => void copyText(result.title, "title")}
                >
                  {copyTarget === "title" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                className={styles.outputBox}
                readOnly
                value={result.title}
                aria-label="Extracted video title"
              />
            </section>

            <section className={styles.metadataFieldCard} aria-label="Video description result">
              <div className={styles.metadataFieldHeader}>
                <span className={styles.metadataFieldIcon} aria-hidden="true">
                  <FileText size={17} strokeWidth={2.2} />
                </span>
                <div>
                  <h2>Video Description</h2>
                  <p>{descriptionCount} characters</p>
                </div>
                <button
                  className={styles.metadataMiniButton}
                  type="button"
                  onClick={() => void copyText(result.description, "description")}
                  disabled={!result.description}
                >
                  {copyTarget === "description" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                className={`${styles.outputBox} ${styles.metadataOutputBoxLarge}`}
                readOnly
                value={result.description || "No public description found."}
                aria-label="Extracted video description"
              />
            </section>
          </div>

          <div className={styles.metadataResultGrid}>
            <article className={styles.metadataResultCard}>
              <span className={styles.metadataResultIcon} aria-hidden="true">
                <Eye size={18} strokeWidth={2.1} />
              </span>
              <div>
                <span>Views</span>
                <strong>{formatNumber(result.viewCount)}</strong>
              </div>
            </article>
            <article className={styles.metadataResultCard}>
              <span className={styles.metadataResultIcon} aria-hidden="true">
                <ThumbsUp size={18} strokeWidth={2.1} />
              </span>
              <div>
                <span>Likes</span>
                <strong>{formatNumber(result.likeCount)}</strong>
              </div>
            </article>
            <article className={styles.metadataResultCard}>
              <span className={styles.metadataResultIcon} aria-hidden="true">
                <MessageCircle size={18} strokeWidth={2.1} />
              </span>
              <div>
                <span>Comments</span>
                <strong>{formatNumber(result.commentCount)}</strong>
              </div>
            </article>
            <article className={styles.metadataResultCard}>
              <span className={styles.metadataResultIcon} aria-hidden="true">
                <UserRound size={18} strokeWidth={2.1} />
              </span>
              <div>
                <span>Channel</span>
                <strong>{result.channelName || "Not shown"}</strong>
              </div>
            </article>
            <article className={styles.metadataResultCard}>
              <span className={styles.metadataResultIcon} aria-hidden="true">
                <Clock3 size={18} strokeWidth={2.1} />
              </span>
              <div>
                <span>Duration</span>
                <strong>{formatDuration(result.durationSeconds)}</strong>
              </div>
            </article>
            <article className={styles.metadataResultCard}>
              <span className={styles.metadataResultIcon} aria-hidden="true">
                <CalendarDays size={18} strokeWidth={2.1} />
              </span>
              <div>
                <span>Upload date</span>
                <strong>{formatDate(result.uploadDate)}</strong>
              </div>
            </article>
          </div>

          {result.hashtags.length ? (
            <div className={styles.tagsWrap} aria-label="Extracted hashtags">
              {result.hashtags.map((hashtag) => (
                <button
                  key={hashtag}
                  className={styles.tagChip}
                  type="button"
                  onClick={() => void copyText(hashtag, hashtag)}
                >
                  {hashtag}
                </button>
              ))}
            </div>
          ) : null}

          {tagsWithTitle.length ? (
            <textarea
              className={styles.outputBox}
              readOnly
              value={tagsWithTitle.join(", ")}
              aria-label="Extracted YouTube tags with title"
            />
          ) : null}
        </div>
      ) : null}
      {/* LEAD CAPTURE BOTTOM - PREMIUM BOX */}
      <div style={{ padding: "3rem 2rem", background: "linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,1))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
        {/* Subtle orange glow at the top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, var(--brand-orange), transparent)", opacity: 0.6 }}></div>
        {/* Subtle orange ambient glow in background */}
        <div style={{ position: "absolute", top: "-50px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "100px", background: "var(--brand-orange)", filter: "blur(80px)", opacity: 0.15, pointerEvents: "none" }}></div>
        
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}>Need help growing your channel?</h3>
        <p style={{ margin: "0 0 2rem", color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: "450px", lineHeight: 1.6, position: "relative", zIndex: 1 }}>We help creators and brands scale with proven content strategy, SEO, and audience retention tactics.</p>
        
        <Link href="/contact" style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "1rem 2rem", background: "var(--brand-orange)", color: "#fff", fontWeight: 700, borderRadius: "8px", textDecoration: "none", fontSize: "1.05rem", transition: "all 0.2s ease-in-out", boxShadow: "0 4px 15px rgba(255,90,54,0.4)", width: "100%", maxWidth: "320px" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(255,90,54,0.5)"; e.currentTarget.style.background = "#ff6a45"; }} onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,90,54,0.4)"; e.currentTarget.style.background = "var(--brand-orange)"; }}>Book Free Strategy Call</Link>
      </div>
    </div>
  );
}
