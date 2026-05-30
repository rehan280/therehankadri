"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Search, AlertCircle, Users, ShoppingBag, Zap, Tv } from "lucide-react";
import styles from "../youtube-tags-generator/page.module.css";

type MonetizationSignals = {
  hasJoinButton: boolean;
  hasMerchShelf: boolean;
  hasSuperFeatures: boolean;
  hasAdPlacements: boolean;
  isFamilySafe: boolean;
};

type MonetizationResult = {
  isMonetized: boolean;
  type: "video" | "channel";
  targetName?: string;
  signals: MonetizationSignals;
};

const SIGNAL_ITEMS = [
  {
    key: "hasJoinButton" as const,
    icon: Users,
    label: "Channel Memberships (Join Button)",
    hint: "Requires YouTube Partner Program",
  },
  {
    key: "hasAdPlacements" as const,
    icon: Tv,
    label: "Ad Placement Data",
    hint: "Active ad slots found in player response",
  },
  {
    key: "hasMerchShelf" as const,
    icon: ShoppingBag,
    label: "Merch Shelf",
    hint: "Merchandise integration requires YPP",
  },
  {
    key: "hasSuperFeatures" as const,
    icon: Zap,
    label: "Super Thanks / SuperChat",
    hint: "Fan funding features require YPP",
  },
];

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
        onSubmit={(e) => { e.preventDefault(); checkMonetization(); }}
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
          {/* Main verdict */}
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
            {result.targetName ? (
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: 500 }}>
                {result.targetName}
              </p>
            ) : null}
            <p style={{ color: "var(--text-secondary)" }}>
              {result.isMonetized
                ? "Active YouTube Partner Program signals were detected."
                : "No YouTube Partner Program signals were detected."}
            </p>
          </div>

          {/* Signal breakdown */}
          <div className={styles.metadataFieldStack}>
            <section className={styles.metadataFieldCard}>
              <div className={styles.metadataFieldHeader}>
                <span className={styles.metadataFieldIcon} aria-hidden="true">
                  <Search size={17} strokeWidth={2.2} />
                </span>
                <div>
                  <h2>Monetization Signals</h2>
                  <p>YouTube Partner Program indicators checked</p>
                </div>
              </div>

              <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "0.5rem", marginTop: "1rem" }}>
                {SIGNAL_ITEMS.map(({ key, icon: Icon, label, hint }) => {
                  const detected = result.signals[key];
                  return (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.625rem 0",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ flexShrink: 0, color: detected ? "rgb(34, 197, 94)" : "var(--text-secondary)" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{label}</div>
                        <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)" }}>{hint}</div>
                      </div>
                      <strong style={{ color: detected ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)", flexShrink: 0, fontSize: "0.85rem" }}>
                        {detected ? "Detected" : "Not Found"}
                      </strong>
                    </div>
                  );
                })}
                {/* Family safe */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0" }}>
                  <CheckCircle2
                    size={18}
                    style={{ flexShrink: 0, color: result.signals.isFamilySafe ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>Family Safe Content</div>
                    <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)" }}>Non-family-safe content is ineligible for ads</div>
                  </div>
                  <strong style={{ color: result.signals.isFamilySafe ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)", flexShrink: 0, fontSize: "0.85rem" }}>
                    {result.signals.isFamilySafe ? "Yes" : "No"}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "flex-start", padding: "1rem", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "0.5rem" }}>
                <AlertCircle size={20} color="rgb(59, 130, 246)" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  <strong>Note:</strong> We check real YouTube Partner Program signals - memberships, merch, Super features, and ad data - rather than the outdated <code>yt_ad</code> flag, which YouTube removed in 2024. Results are estimates; only the channel owner can see their exact YPP status.
                </p>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
