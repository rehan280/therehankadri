import React from "react";
import Link from "next/link";
import { toolCatalog } from "@/lib/tool-catalog";
import type { BlogPost } from "@/lib/blog";
import {
  PremiumWrench,
  PremiumCalculator,
  PremiumLineChart,
  PremiumHash,
  PremiumType,
  PremiumDollarSign,
  PremiumImageIcon,
  PremiumMessageSquare,
  PremiumPlay,
  PremiumSearch,
  PremiumFileText,
  PremiumMousePointerClick,
} from "@/components/icons/PremiumIcons";
import styles from "@/components/tools/RelatedTools.module.css";

// Same icon map as RelatedTools
function getIconForTool(tool: typeof toolCatalog[0]) {
  const t = tool.title.toLowerCase();
  if (t.includes("money") || t.includes("earnings") || t.includes("monetization")) return <PremiumDollarSign width={28} height={28} />;
  if (t.includes("tag") || t.includes("hashtag")) return <PremiumHash width={28} height={28} />;
  if (t.includes("title") || t.includes("name") || t.includes("text")) return <PremiumType width={28} height={28} />;
  if (t.includes("calculator") || t.includes("length")) return <PremiumCalculator width={28} height={28} />;
  if (t.includes("analytics") || t.includes("100") || t.includes("data") || t.includes("inspector")) return <PremiumLineChart width={28} height={28} />;
  if (t.includes("thumbnail") || t.includes("banner")) return <PremiumImageIcon width={28} height={28} />;
  if (t.includes("comment")) return <PremiumMessageSquare width={28} height={28} />;
  if (t.includes("video") || t.includes("youtube")) return <PremiumPlay width={28} height={28} />;
  if (t.includes("search") || t.includes("finder") || t.includes("keyword")) return <PremiumSearch width={28} height={28} />;
  if (t.includes("link")) return <PremiumMousePointerClick width={28} height={28} />;
  if (t.includes("description") || t.includes("copy")) return <PremiumFileText width={28} height={28} />;
  return <PremiumWrench width={28} height={28} />;
}

type Props = {
  post: BlogPost;
};

export default function RelatedToolsForBlog({ post }: Props) {
  const postCategory = post.category.slug.toLowerCase();
  const postSubcategories = new Set(post.subcategories?.map(s => s.toLowerCase()) ?? []);
  const postKeywords = new Set(post.keywords?.map(k => k.toLowerCase()) ?? []);
  
  const scoredTools = toolCatalog.map((tool) => {
    let score = 0;
    const toolCat = tool.category.toLowerCase();
    
    if (toolCat === postCategory) score += 5;
    if (postSubcategories.has(toolCat)) score += 3;
    if (postKeywords.has(toolCat)) score += 2;
    
    // Keyword match
    const toolKw = tool.keyword.toLowerCase();
    if (postKeywords.has(toolKw)) score += 3;
    postKeywords.forEach(kw => {
      if (kw.includes(toolKw) || toolKw.includes(kw)) score += 1;
    });

    // YouTube specific boost
    if (post.slug.includes("youtube") && tool.slug.includes("youtube")) score += 2;
    
    return { tool, score };
  });
  
  // Sort and filter out zero score (if possible), or just take top 6
  scoredTools.sort((a, b) => b.score - a.score);
  const related = scoredTools.slice(0, 6).map(s => s.tool);

  if (related.length === 0) return null;

  return (
    <section className={styles.container} style={{ marginTop: "4rem", marginBottom: "2rem" }}>
      <div className={styles.header}>
        <h2 className={styles.title}>Free Resources & Tools</h2>
        <p className={styles.subtitle}>Speed up your workflow with these free tools</p>
      </div>

      <div className={styles.grid}>
        {related.map((tool) => (
          <Link key={tool.slug} href={`/${tool.slug}`} className={styles.card}>
            <div className={styles.iconWrapper}>
              {getIconForTool(tool)}
            </div>
            <span className={styles.cardTitle}>{tool.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
