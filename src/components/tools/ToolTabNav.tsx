import React from "react";
import Link from "next/link";
import { ToolDefinition, getToolBySlug } from "@/lib/tool-catalog";
import styles from "./ToolTabNav.module.css";

// We define highly specific, semantic groups so tools are never randomly matched.
const smartClusters = [
  // SEO Generators
  ["youtube-tags-generator", "youtube-hashtags-generator", "youtube-keywords-generator", "youtube-title-generator"],
  
  // Metadata Extractors
  ["youtube-title-extractor", "youtube-description-extractor", "youtube-tags-inspector", "youtube-hashtags-extractor"],
  
  // Length Checkers
  ["youtube-title-length-checker", "youtube-description-length-checker"],
  
  // Description / Copy
  ["youtube-video-description-copy", "youtube-channel-keywords-copy"],
  
  // Ideas & Naming
  ["youtube-channel-name-generator", "youtube-video-ideas-generator"],
  
  // Monetization
  ["youtube-monetization-checker", "youtube-money-calculator"],
  
  // Metrics & Calculators
  ["youtube-ctr-calculator", "youtube-views-ratio-calculator", "youtube-playback-speed-calculator"],
  
  // Thumbnails & Imagery
  ["youtube-thumbnail-downloader", "youtube-banner-downloader", "youtube-thumbnail-previewer"],
  
  // IDs & Finders
  ["youtube-channel-id-finder", "youtube-video-id-finder", "youtube-channel-search"],
  
  // Links & URLs
  ["youtube-subscribe-link-generator", "youtube-start-time-link-generator", "youtube-url-cleaner"],
  
  // Timestamps
  ["youtube-timestamp", "youtube-timestamp-remover"],
  
  // Embed Codes
  ["youtube-embedder", "youtube-shorts-embed-code-generator", "youtube-playlist-embed-code-generator"],
  
  // Playlists
  ["youtube-playlist-length-calculator", "youtube-playlist-to-text-converter", "youtube-playlist-link-extractor"],
  
  // Audits & Health
  ["youtube-video-seo-checker", "youtube-shadowban-detector", "youtube-channel-age-checker"],
  
  // Comments
  ["youtube-comment-picker", "youtube-comment-downloader"],
  
  // Categories
  ["youtube-category-checker", "youtube-video-category-finder"],
  
  // Podcasts
  ["podcast-title-generator", "podcast-title-checker"],
  
  // Channel Comparison
  ["youtube-channel-comparison", "youtube-top-100"],
  
  // Trends & Analytics
  ["youtube-upload-schedule-analyzer", "youtube-shorts-trend-analyzer"]
];

function getClusterForTool(tool: ToolDefinition): ToolDefinition[] {
  const clusterIds = smartClusters.find(c => c.includes(tool.slug));
  if (clusterIds) {
    return clusterIds.map(slug => getToolBySlug(slug)).filter(Boolean) as ToolDefinition[];
  }
  // If a tool has no strong matches, keep it single.
  return [tool];
}

export default function ToolTabNav({ currentTool }: { currentTool: ToolDefinition }) {
  const cluster = getClusterForTool(currentTool);
  
  // If the tool is standalone (no highly related matches), do not show the tab bar.
  if (cluster.length <= 1) {
    return null;
  }
  
  return (
    <div className={styles.tabContainer}>
      {cluster.map((tool, index) => {
        const isActive = tool.slug === currentTool.slug;
        const shortTitle = tool.title.replace("YouTube ", "");
        
        return (
          <React.Fragment key={tool.slug}>
            <Link 
              href={`/${tool.slug}`} 
              className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
              prefetch={false}
            >
              {shortTitle}
            </Link>
            {index < cluster.length - 1 && <span className={styles.separator}>/</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
