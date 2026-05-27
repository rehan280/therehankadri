"use client";

import { useState } from "react";
import { Search, ShieldAlert, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import styles from "../youtube-tags-generator/page.module.css";

type ShadowbanResult = {
  score: number;
  isShadowbanned: boolean;
  flags: string[];
  type: "video" | "channel";
  targetName: string;
};

export default function ShadowbanClient() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ShadowbanResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function checkShadowban() {
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
        `/api/youtube-shadowban?url=${encodeURIComponent(trimmedUrl)}`,
        { cache: "no-store" }
      );
      
      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(payload.error || "Unable to analyze shadowban status right now.");
      }

      setResult(payload as ShadowbanResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze shadowban status right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "rgb(34, 197, 94)"; // Green
    if (score >= 50) return "rgb(234, 179, 8)"; // Yellow
    return "rgb(239, 68, 68)"; // Red
  };

  return (
    <div className={styles.toolArea}>
      <form
        className={styles.generatorForm}
        action={checkShadowban}
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
            {isLoading ? "Scanning..." : "Detect Shadowban"}
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
            backgroundColor: `rgba(${getScoreColor(result.score).match(/\d+/g)?.join(", ")}, 0.1)`,
            border: `2px solid ${getScoreColor(result.score)}`,
            borderRadius: "1rem",
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Health Score for {result.targetName || "Target"}
            </h2>
            <div style={{ 
              fontSize: "4rem", 
              fontWeight: "900", 
              color: getScoreColor(result.score),
              lineHeight: 1,
              marginBottom: "1rem"
            }}>
              {result.score}/100
            </div>
            
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              {result.isShadowbanned 
                ? "High Risk of Shadowban/Restriction" 
                : result.score < 100 
                  ? "Moderate Restrictions Detected" 
                  : "No Shadowban Detected"}
            </h3>
            <p style={{ color: "var(--text-secondary)", maxWidth: "500px" }}>
              {result.isShadowbanned 
                ? "We found critical markers indicating algorithmic restriction. Your content is likely not being recommended."
                : result.score < 100
                  ? "Some minor flags were detected that could limit your maximum reach."
                  : "Your content appears fully indexed and free of algorithmic restrictions."}
            </p>
          </div>

          <div className={styles.metadataFieldStack}>
            <section className={styles.metadataFieldCard}>
              <div className={styles.metadataFieldHeader}>
                <span className={styles.metadataFieldIcon} aria-hidden="true">
                  <ShieldAlert size={17} strokeWidth={2.2} />
                </span>
                <div>
                  <h2>Diagnostic Report</h2>
                  <p>Heuristic flags detected</p>
                </div>
              </div>
              
              <ul style={{ listStyle: "none", padding: 0, marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {result.flags.map((flag, i) => (
                  <li key={i} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.75rem",
                    padding: "1rem",
                    backgroundColor: "var(--bg-subtle)",
                    borderRadius: "0.5rem",
                    color: flag.toLowerCase().includes("no obvious") ? "rgb(34, 197, 94)" : "var(--text-primary)"
                  }}>
                    {flag.toLowerCase().includes("no obvious") ? (
                      <CheckCircle size={20} color="rgb(34, 197, 94)" />
                    ) : (
                      <XCircle size={20} color="rgb(239, 68, 68)" />
                    )}
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "flex-start", padding: "1rem", backgroundColor: "rgba(234, 179, 8, 0.1)", borderRadius: "0.5rem" }}>
                <AlertTriangle size={20} color="rgb(234, 179, 8)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  <strong>Disclaimer:</strong> YouTube does not publicly admit to "shadowbanning". This tool uses heuristics (search indexing, family-safe flags, etc.) to estimate the algorithmic health of the content.
                </p>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
