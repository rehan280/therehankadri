import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllBlogPosts } from "@/lib/blog-content";
import type { ToolDefinition } from "@/lib/tool-catalog";
import styles from "@/components/tools/RelatedTools.module.css";
import blogStyles from "@/app/(frontend)/blog/blog.module.css";

type Props = {
  tool: ToolDefinition;
};

export default async function RelatedBlogPostsForTool({ tool }: Props) {
  const allPosts = await getAllBlogPosts();
  
  if (!allPosts || allPosts.length === 0) return null;

  const toolKeywords = new Set([
    tool.keyword.toLowerCase(),
    ...(tool.aliases ?? []).map(a => a.toLowerCase()),
    tool.category.toLowerCase()
  ]);

  const scoredPosts = allPosts.map(post => {
    let score = 0;
    
    // Exact tool category match to blog category/subcategory
    if (post.category.slug.toLowerCase() === tool.category.toLowerCase()) {
      score += 5;
    }

    if (post.subcategories) {
      post.subcategories.forEach(sub => {
        if (sub.toLowerCase() === tool.category.toLowerCase()) score += 3;
        if (toolKeywords.has(sub.toLowerCase())) score += 2;
      });
    }

    // Keyword overlap
    if (post.keywords) {
      post.keywords.forEach(kw => {
        const lowerKw = kw.toLowerCase();
        if (toolKeywords.has(lowerKw)) score += 2;
        // Partial matches
        Array.from(toolKeywords).forEach(toolKw => {
          if (lowerKw.includes(toolKw) || toolKw.includes(lowerKw)) score += 1;
        });
      });
    }

    // Explicit manual links based on slug
    if (tool.slug.includes("youtube") && post.slug.includes("youtube")) {
      score += 2;
    }

    return { post, score };
  });

  // Sort by score desc, take top 3
  scoredPosts.sort((a, b) => b.score - a.score);
  const topPosts = scoredPosts.slice(0, 3).map(s => s.post);

  if (topPosts.length === 0) return null;

  return (
    <section className={styles.container} style={{ marginTop: "4rem" }}>
      <div className={styles.header}>
        <h2 className={styles.title}>Related Guides & Insights</h2>
        <p className={styles.subtitle}>Deep dives to help you master {tool.category}</p>
      </div>

      <div className={blogStyles.postGrid} style={{ gap: "2rem", marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {topPosts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className={blogStyles.postCard}>
            <div className={blogStyles.postCardImage}>
              <Image 
                src={post.coverImage} 
                alt={post.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={blogStyles.postCardContent}>
              <div className={blogStyles.postCardMeta}>
                <span className={blogStyles.postCardCategory}>{post.category.title}</span>
                <span className={blogStyles.postCardReadTime}>{post.readTime}</span>
              </div>
              <h3 className={blogStyles.postCardTitle}>{post.title}</h3>
              <p className={blogStyles.postCardExcerpt}>{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
