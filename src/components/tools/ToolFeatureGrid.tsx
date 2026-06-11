import type { ToolDefinition } from "@/lib/tool-catalog";
import styles from "@/app/(frontend)/(tools)/youtube-tags-generator/page.module.css";

/**
 * Auto-generates 6 feature cards based on a tool's category, highlights,
 * and short description. No manual per-tool configuration needed.
 */
function getFeatureCards(tool: ToolDefinition) {
  const highlights = tool.highlights ?? [];
  const toolName = tool.title;

  // Curated feature templates keyed by category
  const categoryFeatures: Record<string, Array<{ title: string; desc: string; icon: string }>> = {
    "YouTube SEO & Optimization": [
      { title: "SEO-Optimized Output", desc: "Results are structured for maximum YouTube search visibility and algorithm performance.", icon: "search" },
      { title: "Instant Results", desc: "Get actionable output in seconds — no waiting, no queues, no rate limits.", icon: "zap" },
      { title: "Copy-Ready Format", desc: "One-click copy to paste directly into YouTube Studio, spreadsheets, or content briefs.", icon: "clipboard" },
      { title: "No Account Required", desc: "Use the tool immediately without creating an account, signing in, or installing anything.", icon: "unlock" },
      { title: "AI-Powered Analysis", desc: "Leverages intelligent algorithms to generate results tailored to your niche and audience.", icon: "brain" },
      { title: "100% Free Forever", desc: "No hidden fees, no premium tiers, no credit card walls. Every feature is free.", icon: "gift" },
    ],
    "YouTube Analytics & Monetization": [
      { title: "Real-Time Data", desc: "Pulls live data from YouTube's public APIs for the most up-to-date analysis available.", icon: "activity" },
      { title: "Detailed Diagnostics", desc: "Get granular breakdowns instead of surface-level summaries. Know exactly what's happening.", icon: "scan" },
      { title: "Privacy First", desc: "We never store your data. All processing happens in real-time and nothing is logged.", icon: "shield" },
      { title: "No Account Required", desc: "Use the tool immediately without creating an account, signing in, or installing anything.", icon: "unlock" },
      { title: "Professional Reports", desc: "Results are structured clearly so you can share them with clients, teams, or use for audits.", icon: "file-text" },
      { title: "100% Free Forever", desc: "No hidden fees, no premium tiers, no credit card walls. Every feature is free.", icon: "gift" },
    ],
    "YouTube Media Downloaders": [
      { title: "HD Quality", desc: "Download in the highest available resolution — from standard definition up to full HD.", icon: "image" },
      { title: "Multiple Formats", desc: "Choose from different sizes and formats to match your workflow and platform requirements.", icon: "layers" },
      { title: "Instant Download", desc: "No waiting. Click, download, and use — all within seconds.", icon: "download" },
      { title: "No Account Required", desc: "Use the tool immediately without creating an account, signing in, or installing anything.", icon: "unlock" },
      { title: "Batch Support", desc: "Process multiple items efficiently without re-entering URLs or refreshing the page.", icon: "copy" },
      { title: "100% Free Forever", desc: "No hidden fees, no premium tiers, no credit card walls. Every feature is free.", icon: "gift" },
    ],
    "Engagement & Interaction": [
      { title: "Fair & Random", desc: "Uses cryptographically fair randomization to ensure every participant has an equal chance.", icon: "shuffle" },
      { title: "Duplicate Filtering", desc: "Automatically removes duplicate entries so results are clean and contest-ready.", icon: "filter" },
      { title: "Instant Results", desc: "Get actionable output in seconds — no waiting, no queues, no rate limits.", icon: "zap" },
      { title: "No Account Required", desc: "Use the tool immediately without creating an account, signing in, or installing anything.", icon: "unlock" },
      { title: "Transparent Process", desc: "Every step is visible. No black-box algorithms — see exactly how winners are selected.", icon: "eye" },
      { title: "100% Free Forever", desc: "No hidden fees, no premium tiers, no credit card walls. Every feature is free.", icon: "gift" },
    ],
    "YouTube Video & Channel Utilities": [
      { title: "Universal Compatibility", desc: "Works with any public YouTube URL — videos, channels, playlists, and shorts.", icon: "link" },
      { title: "Instant Results", desc: "Get actionable output in seconds — no waiting, no queues, no rate limits.", icon: "zap" },
      { title: "Copy-Ready Format", desc: "One-click copy to paste directly into YouTube Studio, spreadsheets, or content briefs.", icon: "clipboard" },
      { title: "No Account Required", desc: "Use the tool immediately without creating an account, signing in, or installing anything.", icon: "unlock" },
      { title: "Developer Friendly", desc: "Clean, structured output that's easy to integrate into your workflows and automations.", icon: "code" },
      { title: "100% Free Forever", desc: "No hidden fees, no premium tiers, no credit card walls. Every feature is free.", icon: "gift" },
    ],
    "Podcast Tools": [
      { title: "Podcast-Optimized", desc: "Built specifically for podcast creators — not repurposed from generic content tools.", icon: "mic" },
      { title: "AI-Powered Analysis", desc: "Leverages intelligent algorithms to generate results tailored to your niche and audience.", icon: "brain" },
      { title: "Instant Results", desc: "Get actionable output in seconds — no waiting, no queues, no rate limits.", icon: "zap" },
      { title: "No Account Required", desc: "Use the tool immediately without creating an account, signing in, or installing anything.", icon: "unlock" },
      { title: "Copy-Ready Format", desc: "One-click copy to paste directly into your podcast host, show notes, or content briefs.", icon: "clipboard" },
      { title: "100% Free Forever", desc: "No hidden fees, no premium tiers, no credit card walls. Every feature is free.", icon: "gift" },
    ],
  };

  const base = categoryFeatures[tool.category] ?? categoryFeatures["YouTube SEO & Optimization"]!;

  // Override first few cards with tool-specific highlights if available
  const cards = base.map((card, i) => {
    if (i < highlights.length) {
      return {
        ...card,
        title: highlights[i],
        desc: `${highlights[i]} — built into ${toolName} to streamline your workflow.`,
      };
    }
    return card;
  });

  return cards;
}

const iconPaths: Record<string, string> = {
  search: "M21 21l-4.34-4.34M11 19a8 8 0 100-16 8 8 0 000 16z",
  zap: "M13 2L3 14h9l-1 10 10-12h-9l1-10z",
  clipboard: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6v4H9V2z",
  unlock: "M7 11V7a5 5 0 0110 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z",
  brain: "M12 5a3 3 0 10-5.997.125 4 4 0 00-2.526 5.77 4 4 0 00.556 6.588A4 4 0 1012 18zM12 5a3 3 0 115.997.125 4 4 0 012.526 5.77 4 4 0 01-.556 6.588A4 4 0 1112 18z",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  scan: "M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  "file-text": "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  image: "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  copy: "M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",
  shuffle: "M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
  link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  mic: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
};

function FeatureIcon({ icon }: { icon: string }) {
  const d = iconPaths[icon] ?? iconPaths.zap!;

  // Icons with multiple paths need splitting
  const paths = d.split(/(?=M)/);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((path, i) => (
        <path key={i} d={path.trim()} />
      ))}
    </svg>
  );
}

export default function ToolFeatureGrid({ tool }: { tool: ToolDefinition }) {
  const cards = getFeatureCards(tool);

  return (
    <section className={styles.featureGridSection} aria-label={`${tool.title} features`}>
      <div className={styles.wrap}>
        <div className={styles.featureGridHeader}>
          <div className={styles.featureGridEyebrow}>
            <span>Professional Features</span>
            <span className={styles.featureGridEyebrowDot} />
          </div>
          <h2 className={styles.featureGridTitle}>
            Why Creators Choose This Tool
          </h2>
          <p className={styles.featureGridSubtitle}>
            {tool.shortDescription} Built for speed, accuracy, and ease of use — no signup required.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {cards.map((card) => (
            <article key={card.title} className={styles.featureCard}>
              <div className={styles.featureCardIcon}>
                <FeatureIcon icon={card.icon} />
              </div>
              <h3 className={styles.featureCardTitle}>{card.title}</h3>
              <p className={styles.featureCardDesc}>{card.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
