"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import type { TagGenerationResult } from "@/lib/youtube-tags";
import styles from "./page.module.css";
import Link from "next/link";

export default function YouTubeTagGeneratorClient() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<TagGenerationResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [seed, setSeed] = useState(0);
  const [copyTarget, setCopyTarget] = useState<string | null>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  async function generateTags(nextKeyword: string, nextSeed: number) {
    const trimmedKeyword = nextKeyword.trim();

    if (!trimmedKeyword) {
      setError("Enter a main keyword to generate tags.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/youtube-tags?keyword=${encodeURIComponent(trimmedKeyword)}&seed=${nextSeed}`,
        {
          cache: "no-store",
        }
      );
      const payload = (await response.json()) as
        | TagGenerationResult
        | { error?: string };

      if (!response.ok || !("tags" in payload)) {
        const message = "error" in payload ? payload.error : undefined;
        throw new Error(message ?? "Unable to generate tags right now.");
      }

      startTransition(() => {
        setResult(payload);
        setSeed(nextSeed);
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate tags right now."
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

  const outputLength = result?.commaSeparated.length ?? 0;

  return (
    <div className={styles.toolArea}>
      <form
        className={styles.generatorForm}
        onSubmit={(event) => {
          event.preventDefault();
          void generateTags(keyword, seed);
        }}
      >
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Enter keyword"
            autoComplete="off"
            inputMode="search"
            aria-label="Enter keyword"
          />
          <button
            className={styles.generateButton}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate tags"}
          </button>
        </div>
      </form>

      {error ? <p className={styles.errorText}>{error}</p> : null}

      {result ? (
        <div className={styles.results}>
          <div className={styles.resultsTop}>
            <span className={styles.characterCount}>{outputLength}/500 characters</span>
            <div className={styles.resultsActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => void copyText(result.commaSeparated, "all")}
              >
                {copyTarget === "all" ? "Copied" : "Copy tags"}
              </button>
              <button
                className={styles.ghostButton}
                type="button"
                disabled={isLoading}
                onClick={() => void generateTags(result.keyword, seed + 1)}
              >
                Regenerate
              </button>
            </div>
          </div>

          <div className={styles.tagsWrap}>
            {result.tags.map((tag) => (
              <button
                key={tag.value}
                className={styles.tagChip}
                type="button"
                onClick={() => void copyText(tag.value, tag.value)}
              >
                {tag.value}
              </button>
            ))}
          </div>

          <textarea
            className={styles.outputBox}
            readOnly
            value={result.commaSeparated}
            aria-label="Generated tags output"
          />
        </div>
      ) : null}

      {/* LEAD CAPTURE BOTTOM - PREMIUM BOX */}
      <div style={{ padding: "3rem 2rem", background: "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
        {/* Subtle orange glow at the top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, var(--brand-orange), transparent)", opacity: 0.5 }}></div>
        {/* Subtle orange ambient glow in background */}
        <div style={{ position: "absolute", top: "-50px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "100px", background: "var(--brand-orange)", filter: "blur(80px)", opacity: 0.1, pointerEvents: "none" }}></div>
        
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}>Need help growing your channel?</h3>
        <p style={{ margin: "0 0 2rem", color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: "450px", lineHeight: 1.6, position: "relative", zIndex: 1 }}>We help creators and brands scale with proven content strategy, SEO, and audience retention tactics.</p>
        
        <Link href="/contact" style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "1rem 2rem", background: "var(--brand-orange)", color: "#fff", fontWeight: 700, borderRadius: "8px", textDecoration: "none", fontSize: "1.05rem", transition: "all 0.2s ease-in-out", boxShadow: "0 4px 15px rgba(255,90,54,0.3)", width: "100%", maxWidth: "320px" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(255,90,54,0.4)"; e.currentTarget.style.background = "#ff6a45"; }} onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,90,54,0.3)"; e.currentTarget.style.background = "var(--brand-orange)"; }}>Book Free Strategy Call</Link>
      </div>
    </div>
  );
}
