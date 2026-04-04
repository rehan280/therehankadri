"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import type { TagGenerationResult } from "@/lib/youtube-tags";
import styles from "./page.module.css";

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
    </div>
  );
}
