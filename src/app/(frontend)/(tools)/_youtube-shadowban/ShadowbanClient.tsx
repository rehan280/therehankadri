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
import Link from "next/link";

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
      <div className={styles.generatorForm}>
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void checkShadowban(); }}
            placeholder="Paste YouTube Video or Channel URL"
            autoComplete="off"
            inputMode="url"
            aria-label="Paste YouTube URL"
          />
          <button
            className={styles.generateButton}
            type="button"
            disabled={isLoading}
            onClick={() => void checkShadowban()}
          >
            {isLoading ? "Scanning..." : "Detect Shadowban"}
          </button>
        </div>
      </div>

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
