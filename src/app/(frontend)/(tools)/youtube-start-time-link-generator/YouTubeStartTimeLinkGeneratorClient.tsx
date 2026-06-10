"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clipboard, Code2, ExternalLink, Link2, PlayCircle } from "lucide-react";
import baseStyles from "../youtube-tags-generator/page.module.css";
import styles from "./page.module.css";
import Link from "next/link";

type TimeParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

type ParsedUrlResult = {
  videoId: string;
  sourceType: "watch" | "short" | "shorts" | "embed" | "live";
  existingStartSeconds: number | null;
};

type GeneratedLinks = {
  sourceType: ParsedUrlResult["sourceType"];
  videoId: string;
  startSeconds: number;
  endSeconds: number | null;
  existingStartSeconds: number | null;
  recommendedUrl: string;
  watchUrl: string;
  embedUrl: string;
  iframeCode: string;
};

const defaultTimeParts: TimeParts = {
  hours: "0",
  minutes: "0",
  seconds: "0",
};

const timeFields: Array<{
  key: keyof TimeParts;
  shortLabel: string;
  max: number;
}> = [
  { key: "hours", shortLabel: "hh", max: 99 },
  { key: "minutes", shortLabel: "mm", max: 59 },
  { key: "seconds", shortLabel: "ss", max: 59 },
];

function normalizeTimePart(value: string, max: number) {
  const digitsOnly = value.replace(/[^\d]/g, "");

  if (!digitsOnly) {
    return "0";
  }

  return String(Math.min(Number(digitsOnly), max));
}

function timePartsToSeconds(value: TimeParts) {
  return (
    Number(value.hours || 0) * 3600 +
    Number(value.minutes || 0) * 60 +
    Number(value.seconds || 0)
  );
}

function secondsToTimeParts(totalSeconds: number): TimeParts {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return {
    hours: String(hours),
    minutes: String(minutes),
    seconds: String(seconds),
  };
}

function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function parseYouTubeTime(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  if (/^\d+s$/.test(normalized)) {
    return Number(normalized.slice(0, -1));
  }

  const match = normalized.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function parseYouTubeUrl(input: string): ParsedUrlResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    throw new Error("Paste a YouTube URL first.");
  }

  const candidate = /^https?:\/\//i.test(trimmedInput) ? trimmedInput : `https://${trimmedInput}`;
  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new Error("Enter a valid YouTube URL.");
  }

  const hostname = url.hostname.replace(/^www\./i, "").toLowerCase();
  const pathSegments = url.pathname.split("/").filter(Boolean);
  let videoId = "";
  let sourceType: ParsedUrlResult["sourceType"] = "watch";

  if (hostname === "youtu.be") {
    videoId = pathSegments[0] || "";
    sourceType = "short";
  } else if (hostname.endsWith("youtube.com")) {
    if (pathSegments[0] === "watch") {
      videoId = url.searchParams.get("v") || "";
      sourceType = "watch";
    } else if (pathSegments[0] === "shorts") {
      videoId = pathSegments[1] || "";
      sourceType = "shorts";
    } else if (pathSegments[0] === "embed") {
      videoId = pathSegments[1] || "";
      sourceType = "embed";
    } else if (pathSegments[0] === "live") {
      videoId = pathSegments[1] || "";
      sourceType = "live";
    }
  }

  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    throw new Error("I couldn't find a valid YouTube video ID in that URL.");
  }

  const existingStartSeconds =
    parseYouTubeTime(url.searchParams.get("t")) ??
    parseYouTubeTime(url.searchParams.get("start")) ??
    parseYouTubeTime(url.searchParams.get("time_continue"));

  return {
    videoId,
    sourceType,
    existingStartSeconds,
  };
}

function createGeneratedLinks(
  parsed: ParsedUrlResult,
  startSeconds: number,
  endSeconds: number | null
): GeneratedLinks {
  const recommendedUrl = `https://youtu.be/${parsed.videoId}?t=${startSeconds}`;
  const watchUrl = `https://www.youtube.com/watch?v=${parsed.videoId}&t=${startSeconds}s`;
  const embedSearch = new URLSearchParams();

  if (startSeconds > 0) {
    embedSearch.set("start", String(startSeconds));
  }

  if (endSeconds !== null && endSeconds > startSeconds) {
    embedSearch.set("end", String(endSeconds));
  }

  const embedQuery = embedSearch.toString();
  const embedUrl = `https://www.youtube.com/embed/${parsed.videoId}${embedQuery ? `?${embedQuery}` : ""}`;
  const iframeCode = `<iframe src="${embedUrl}" width="560" height="315" allowfullscreen></iframe>`;

  return {
    sourceType: parsed.sourceType,
    videoId: parsed.videoId,
    startSeconds,
    endSeconds,
    existingStartSeconds: parsed.existingStartSeconds,
    recommendedUrl,
    watchUrl,
    embedUrl,
    iframeCode,
  };
}

export default function YouTubeStartTimeLinkGeneratorClient() {
  const [videoUrl, setVideoUrl] = useState("");
  const [startTime, setStartTime] = useState<TimeParts>(defaultTimeParts);
  const [endTime, setEndTime] = useState<TimeParts>(defaultTimeParts);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedLinks | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const parsedPreview = useMemo(() => {
    try {
      return parseYouTubeUrl(videoUrl);
    } catch {
      return null;
    }
  }, [videoUrl]);

  async function copyText(value: string, target: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedTarget(target);

      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }

      copyResetTimeoutRef.current = window.setTimeout(() => {
        setCopiedTarget(null);
      }, 1800);
    } catch {
      setError("Copy failed. Your browser may be blocking clipboard access.");
    }
  }

  function syncDetectedTimestamp() {
    if (!parsedPreview || parsedPreview.existingStartSeconds === null) {
      return;
    }

    setStartTime(secondsToTimeParts(parsedPreview.existingStartSeconds));
  }

  function handleTimeChange(
    target: "start" | "end",
    key: keyof TimeParts,
    rawValue: string
  ) {
    const field = timeFields.find((item) => item.key === key);

    if (!field) {
      return;
    }

    const nextValue = normalizeTimePart(rawValue, field.max);

    if (target === "start") {
      setStartTime((current) => ({
        ...current,
        [key]: nextValue,
      }));
      return;
    }

    setEndTime((current) => ({
      ...current,
      [key]: nextValue,
    }));
  }

  function handleGenerate() {
    try {
      const parsed = parseYouTubeUrl(videoUrl);
      const startSeconds = timePartsToSeconds(startTime);
      const rawEndSeconds = timePartsToSeconds(endTime);
      const requestedEndSeconds = rawEndSeconds > 0 ? rawEndSeconds : null;

      if (requestedEndSeconds !== null && requestedEndSeconds <= startSeconds) {
        throw new Error("End time must be later than the start time.");
      }

      setError("");
      setResult(createGeneratedLinks(parsed, startSeconds, requestedEndSeconds));
    } catch (toolError) {
      setResult(null);
      setError(
        toolError instanceof Error
          ? toolError.message
          : "Unable to generate the start time link right now."
      );
    }
  }

  return (
    <div className={baseStyles.toolArea}>
      <form
        className={baseStyles.generatorForm}
        onSubmit={(event) => {
          event.preventDefault();
          handleGenerate();
        }}
      >
        <div className={styles.toolStack}>
          <div className={baseStyles.searchRow}>
            <input
              className={baseStyles.searchInput}
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="Paste YouTube URL"
              autoComplete="off"
              inputMode="url"
              aria-label="Paste YouTube URL"
            />
            <button className={baseStyles.generateButton} type="submit">
              Generate link
            </button>
          </div>

          <p className={styles.microcopy}>
            Works with standard links, `youtu.be`, YouTube Shorts, and embed URLs.
          </p>

          {parsedPreview && parsedPreview.existingStartSeconds !== null ? (
            <div className={styles.infoStrip}>
              <span>
                Existing timestamp detected: <strong>{formatClock(parsedPreview.existingStartSeconds)}</strong>
              </span>
              <button
                className={styles.inlineButton}
                type="button"
                onClick={syncDetectedTimestamp}
              >
                Use detected time
              </button>
            </div>
          ) : null}

          <section className={`${baseStyles.metadataFieldCard} ${styles.timeSettingsCard}`}>
            <div className={styles.fieldHeading}>
              <h2>Time Settings</h2>
              <p>Enter a start time. Add an end time only if you want an embed clip range.</p>
            </div>

            <div className={styles.slimRows}>
              <div className={`${styles.slimRow} ${styles.slimRowMerged}`}>
                <div className={styles.timeGroupInline}>
                  <div className={styles.slimLabelBlock}>
                    <span className={styles.groupKicker}>Required</span>
                    <span className={styles.groupLabel}>Start time</span>
                  </div>
                  <div className={styles.inlineTimeRow}>
                    {timeFields.map((field) => (
                      <label key={`start-${field.key}`} className={styles.timeField}>
                        <span>{field.shortLabel}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={startTime[field.key]}
                          onChange={(event) =>
                            handleTimeChange("start", field.key, event.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className={`${styles.timeGroupInline} ${styles.timeGroupOptional}`}>
                  <div className={styles.slimLabelBlock}>
                    <span className={styles.groupKicker}>Optional</span>
                    <span className={styles.groupLabel}>End time</span>
                  </div>
                  <div className={styles.inlineTimeRow}>
                    {timeFields.map((field) => (
                      <label key={`end-${field.key}`} className={styles.timeField}>
                        <span>{field.shortLabel}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={endTime[field.key]}
                          onChange={(event) =>
                            handleTimeChange("end", field.key, event.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className={styles.panelHint}>
              Leave end time at `00:00:00` for a normal start link. Any later value automatically creates an embed clip range.
            </p>
          </section>

        </div>
      </form>

      {error ? <p className={baseStyles.errorText}>{error}</p> : null}

      {result ? (
        <div className={baseStyles.results}>
          <div className={baseStyles.metadataResultGrid}>
            <article className={baseStyles.metadataResultCard}>
              <div>
                <span>Video ID</span>
                <strong>{result.videoId}</strong>
              </div>
            </article>
            <article className={baseStyles.metadataResultCard}>
              <div>
                <span>Start time</span>
                <strong>{formatClock(result.startSeconds)}</strong>
              </div>
            </article>
            <article className={baseStyles.metadataResultCard}>
              <div>
                <span>Total seconds</span>
                <strong>{result.startSeconds}</strong>
              </div>
            </article>
          </div>

          <section className={baseStyles.metadataFieldCard}>
            <div className={baseStyles.metadataFieldHeader}>
              <span className={baseStyles.metadataFieldIcon} aria-hidden="true">
                <Link2 size={17} strokeWidth={2.2} />
              </span>
              <div>
                <h2>Recommended Share URL</h2>
                <p>Best for mobile, desktop, and direct sharing.</p>
              </div>
              <button
                className={baseStyles.metadataMiniButton}
                type="button"
                onClick={() => void copyText(result.recommendedUrl, "recommended")}
              >
                {copiedTarget === "recommended" ? "Copied" : "Copy"}
              </button>
            </div>

            <textarea
              className={baseStyles.outputBox}
              readOnly
              value={result.recommendedUrl}
              aria-label="Recommended YouTube start time link"
            />

            <p className={styles.panelHint}>
              This format is the safest default because `youtu.be` links usually deep-link into the YouTube app on mobile.
            </p>
          </section>

          <div className={baseStyles.metadataFieldStack}>
            <section className={baseStyles.metadataFieldCard}>
              <div className={baseStyles.metadataFieldHeader}>
                <span className={baseStyles.metadataFieldIcon} aria-hidden="true">
                  <PlayCircle size={18} strokeWidth={2.1} />
                </span>
                <div>
                  <h2>Watch URL</h2>
                  <p>Standard YouTube watch link with a timestamp.</p>
                </div>
                <button
                  className={baseStyles.metadataMiniButton}
                  type="button"
                  onClick={() => void copyText(result.watchUrl, "watch")}
                >
                  {copiedTarget === "watch" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                className={baseStyles.outputBox}
                readOnly
                value={result.watchUrl}
                aria-label="Watch URL output"
              />
            </section>

            <section className={baseStyles.metadataFieldCard}>
              <div className={baseStyles.metadataFieldHeader}>
                <span className={baseStyles.metadataFieldIcon} aria-hidden="true">
                  <Code2 size={18} strokeWidth={2.1} />
                </span>
                <div>
                  <h2>Embed URL</h2>
                  <p>Use on websites and landing pages.</p>
                </div>
                <button
                  className={baseStyles.metadataMiniButton}
                  type="button"
                  onClick={() => void copyText(result.embedUrl, "embed")}
                >
                  {copiedTarget === "embed" ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                className={baseStyles.outputBox}
                readOnly
                value={result.embedUrl}
                aria-label="Embed URL output"
              />
            </section>
          </div>

          <section className={baseStyles.metadataFieldCard}>
            <div className={baseStyles.metadataFieldHeader}>
              <span className={baseStyles.metadataFieldIcon} aria-hidden="true">
                <Clipboard size={17} strokeWidth={2.2} />
              </span>
              <div>
                <h2>Embed Code</h2>
                <p>Copy-paste iframe code for blog posts and embedded clips.</p>
              </div>
              <button
                className={baseStyles.metadataMiniButton}
                type="button"
                onClick={() => void copyText(result.iframeCode, "iframe")}
              >
                {copiedTarget === "iframe" ? "Copied" : "Copy"}
              </button>
            </div>

            <textarea
              className={`${baseStyles.outputBox} ${styles.codeOutput}`}
              readOnly
              value={result.iframeCode}
              aria-label="Embed iframe code"
            />
          </section>

          <div className={baseStyles.metadataResultGrid}>
            <article className={baseStyles.metadataResultCard}>
              <span className={baseStyles.metadataResultIcon} aria-hidden="true">
                <Link2 size={17} strokeWidth={2.1} />
              </span>
              <div>
                <span>Old timestamp cleanup</span>
                <strong>Replaces old values</strong>
                <p className={styles.resultNote}>
                  If the URL you pasted already had a `t`, `start`, or `time_continue` value, the generated link replaces it with your new start time.
                </p>
              </div>
            </article>

            <article className={baseStyles.metadataResultCard}>
              <span className={baseStyles.metadataResultIcon} aria-hidden="true">
                <ExternalLink size={17} strokeWidth={2.1} />
              </span>
              <div>
                <span>Shorts note</span>
                <strong>Can be inconsistent</strong>
                <p className={styles.resultNote}>
                  Shorts URLs can ignore timestamp parameters. The recommended output above uses a cleaner share format for better compatibility.
                </p>
              </div>
            </article>
          </div>
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
