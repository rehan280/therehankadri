import Image from "next/image";
import Link from "next/link";
import { type BlogCategory, type BlogPost, formatBlogDate } from "@/lib/blog";
import styles from "./BlogTopicSection.module.css";

type BlogTopicSectionContentProps = {
  category: BlogCategory;
  eyebrow: string;
  description: string;
  posts: BlogPost[];
  tags: string[];
  activeTag: string;
  onSelectTag?: (tag: string) => void;
  showFilters: boolean;
};

export default function BlogTopicSectionContent({
  category,
  eyebrow,
  description,
  posts,
  tags,
  activeTag,
  onSelectTag,
  showFilters,
}: BlogTopicSectionContentProps) {
  return (
    <section id={category.slug} className={styles.topicSection}>
      <div className={styles.topicShell}>
        <div className={styles.topicHeader}>
          <p className={styles.topicEyebrow}>{eyebrow}</p>
          <h2 className={styles.topicTitle}>{category.name}</h2>
          <p className={styles.topicDescription}>{description}</p>

          {showFilters ? (
            <div className={styles.topicFilters}>
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={onSelectTag ? () => onSelectTag(tag) : undefined}
                  className={`${styles.topicFilterButton}${activeTag === tag ? ` ${styles.topicFilterButtonActive}` : ""}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.topicDivider} />

        <div className={styles.topicGrid}>
          {posts.map((post) => {
            const primaryTag = post.subcategories[0];

            return (
              <article key={post.slug} className={styles.topicCard}>
                {primaryTag ? (
                  <div className={styles.topicCardTags}>
                    <span className={styles.topicCardTag}>{primaryTag}</span>
                  </div>
                ) : null}

                {post.coverImage ? (
                  <Link href={`/blog/${post.slug}`} prefetch className={styles.topicCardImageLink}>
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
                    <Link href={`/blog/${post.slug}`} prefetch>{post.title}</Link>
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
