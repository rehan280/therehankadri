"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Search, AlertCircle } from "lucide-react";
import styles from "../youtube-tags-generator/page.module.css";

type MonetizationResult = {
  isMonetized: boolean;
  type: "video" | "channel";
  markers: {
    yt_ad: boolean;
    is_monetization_enabled: boolean;
  };
};

export default function MonetizationClient() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<MonetizationResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function checkMonetization() {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Paste a valid YouTube video or channel URL.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `/api/youtube-monetization?url=${encodeURIComponent(trimmedUrl)}`,
        { cache: "no-store" }
      );
      
      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(payload.error || "Unable to check monetization right now.");
      }

      setResult(payload as MonetizationResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to check monetization right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.toolArea}>
      <form
        className={styles.generatorForm}
        onSubmit={(event) => {
          event.preventDefault();
          void checkMonetization();
        }}
      >
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste YouTube Video or Channel URL"
            autoComplete="off"
            inputMode="url"
            aria-label="Paste YouTube URL"
          />
          <button
            className={styles.generateButton}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Check Monetization"}
          </button>
        </div>
      </form>

      {error ? <p className={styles.errorText}>{error}</p> : null}

      {result ? (
        <div className={styles.results} style={{ marginTop: "2rem" }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "3rem 1rem",
            backgroundColor: result.isMonetized ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `2px solid ${result.isMonetized ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}`,
            borderRadius: "1rem",
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            {result.isMonetized ? (
              <CheckCircle2 size={64} color="rgb(34, 197, 94)" style={{ marginBottom: "1rem" }} />
            ) : (
              <XCircle size={64} color="rgb(239, 68, 68)" style={{ marginBottom: "1rem" }} />
            )}
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              {result.isMonetized 
                ? `This ${result.type} is Monetized!` 
                : `This ${result.type} is NOT Monetized`}
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              {result.isMonetized 
                ? "We found active markers indicating it's part of the YouTube Partner Program."
                : "No monetization flags were detected in the source code."}
            </p>
          </div>

          <div className={styles.metadataFieldStack}>
            <section className={styles.metadataFieldCard}>
              <div className={styles.metadataFieldHeader}>
                <span className={styles.metadataFieldIcon} aria-hidden="true">
                  <Search size={17} strokeWidth={2.2} />
                </span>
                <div>
                  <h2>Diagnostic Data</h2>
                  <p>Raw flags found in the source code</p>
                </div>
              </div>
              <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "0.5rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
                  <span>"is_monetization_enabled" flag</span>
                  <strong>{result.markers.is_monetization_enabled ? "Found" : "Not Found"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                  <span>"yt_ad" flag</span>
                  <strong>{result.markers.yt_ad ? "Found" : "Not Found"}</strong>
                </div>
              </div>
              
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "flex-start", padding: "1rem", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "0.5rem" }}>
                <AlertCircle size={20} color="rgb(59, 130, 246)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  <strong>Note:</strong> Seeing an ad on a video does not mean it is monetized. YouTube places ads on non-monetized videos and keeps 100% of the revenue. This tool checks the backend data to confirm actual YouTube Partner Program status.
                </p>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
