"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { type BlogCategory, type BlogPost, formatBlogDate } from "@/lib/blog";
import styles from "./BlogTopicSection.module.css";

type BlogTopicSectionProps = {
  category: BlogCategory;
  eyebrow: string;
  description: string;
  posts: BlogPost[];
};

export default function BlogTopicSection({
  category,
  eyebrow,
  description,
  posts,
}: BlogTopicSectionProps) {
  const tags = useMemo(() => {
    const values = new Set<string>();
    posts.forEach((post) => {
      const primaryTag = post.subcategories[0];
      if (primaryTag) {
        values.add(primaryTag);
      }
    });
    return ["All", ...Array.from(values)];
  }, [posts]);

  const [activeTag, setActiveTag] = useState("All");

  const filteredPosts = useMemo(() => {
    if (activeTag === "All") return posts;
    return posts.filter((post) => post.subcategories[0] === activeTag);
  }, [activeTag, posts]);

  return (
    <section id={category.slug} className={styles.topicSection}>
      <div className={styles.topicShell}>
        <div className={styles.topicHeader}>
          <p className={styles.topicEyebrow}>{eyebrow}</p>
          <h2 className={styles.topicTitle}>{category.name}</h2>
          <p className={styles.topicDescription}>{description}</p>

          <div className={styles.topicFilters}>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`${styles.topicFilterButton}${activeTag === tag ? ` ${styles.topicFilterButtonActive}` : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.topicDivider} />

        <div className={styles.topicGrid}>
          {filteredPosts.map((post) => {
            const primaryTag = post.subcategories[0];

            return (
              <article key={post.slug} className={styles.topicCard}>
                {primaryTag ? (
                  <div className={styles.topicCardTags}>
                    <span className={styles.topicCardTag}>{primaryTag}</span>
                  </div>
                ) : null}

                {post.coverImage ? (
                  <Link href={`/blog/${post.slug}`} className={styles.topicCardImageLink}>
                    <div className={styles.topicCardImageWrap}>
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 360px"
                        className={styles.topicCardImage}
                      />
                    </div>
                  </Link>
                ) : null}

                <div className={styles.topicCardBody}>
                  <h3 className={styles.topicCardTitle}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className={styles.topicCardExcerpt}>{post.excerpt}</p>

                  <div className={styles.topicCardMeta}>
                    <span>{post.author.name}</span>
                    <span>{formatBlogDate(post.publishedAt)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
