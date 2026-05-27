import React from "react";
import Link from "next/link";
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
  PremiumMousePointerClick 
} from "@/components/icons/PremiumIcons";
import { toolCatalog, ToolCategory } from "@/lib/tool-catalog";
import styles from "./RelatedTools.module.css";

type Props = {
  currentToolSlug: string;
  category?: ToolCategory;
};

// Map tool slug/keyword/category to an icon
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

export default function RelatedTools({ currentToolSlug, category }: Props) {
  // Only show tools from the exact same category
  const related = toolCatalog.filter(
    (tool) => tool.category === category && tool.slug !== currentToolSlug
  ).slice(0, 6);

  if (related.length === 0) return null;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Related Tools</h2>
        <p className={styles.subtitle}>Click below for more details or downloads</p>
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
