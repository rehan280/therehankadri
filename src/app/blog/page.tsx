import Link from "next/link";
import { Calendar } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogTopicSection from "@/components/blog/BlogTopicSection";
import { blogPosts, formatBlogDate, getBlogCategories } from "@/lib/blog";
import styles from "./blog.module.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const topicCopyByCategory = {
  seo: {
    eyebrow: "Revenue-first growth systems",
    description:
      "Applied SEO planning, content architecture, and conversion design for teams that want search to influence qualified pipeline.",
  },
  content: {
    eyebrow: "Distribution workflow",
    description:
      "Content operations for turning one strong idea into search, social, video, and sales-enablement assets without fragmentation.",
  },
  pipeline: {
    eyebrow: "Demand capture design",
    description:
      "Practical funnel and qualification systems that help serious buyers move forward while filtering weak-fit leads earlier.",
  },
  authority: {
    eyebrow: "Founder-led brand systems",
    description:
      "Trust-building content frameworks for operators who want stronger positioning across LinkedIn, YouTube, and search.",
  },
} as const;

export default function BlogIndexPage() {
  const categories = getBlogCategories();
  const latestPosts = blogPosts.slice(0, 4);
  const visibleCategories = categories.slice(0, 7);
  const overflowCategories = categories.slice(7);

  return (
    <main className={`${styles.page} ${jakarta.className}`}>
      <section className={`${styles.hero} ${styles.blogIndexHero}`}>
        <BlogHeader />

        <div className={styles.blogIndexHeroShell}>
          <div className={`${styles.heroInner} ${styles.blogIndexHeroInner}`}>
            <span className={`${styles.heroPill} ${styles.blogIndexPill}`}>The Rehan Kadri Blog</span>

            <h1 className={styles.blogIndexTitle}>
              <span className={styles.blogIndexLine}>Growth systems notes</span>
              <span className={styles.blogIndexLine}>for brands building</span>
              <span className={styles.blogIndexLine}>predictable pipeline.</span>
            </h1>

            <p className={styles.blogIndexCopy}>
              Practical writing on SEO, content distribution, authority, and conversion infrastructure for teams that want growth to compound.
            </p>

            <div className={styles.blogIndexCategoryRow} aria-label="Blog categories">
              {visibleCategories.map((category) => (
                <a key={category.slug} href={`#${category.slug}`} className={styles.blogIndexCategoryChip}>
                  {category.name}
                </a>
              ))}

              {overflowCategories.length ? (
                <details className={styles.blogIndexCategoryOverflow}>
                  <summary className={styles.blogIndexCategoryChip}>Other</summary>
                  <div className={styles.blogIndexCategoryOverflowMenu}>
                    {overflowCategories.map((category) => (
                      <a
                        key={category.slug}
                        href={`#${category.slug}`}
                        className={styles.blogIndexCategoryOverflowLink}
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>

            <div className={styles.blogIndexMeta}>
              <span>{blogPosts.length} articles published</span>
              <span>{categories.length} categories</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.latestSection}>
        <div className={styles.latestShell}>
          <div className={styles.latestGrid}>
            {latestPosts.map((post, index) => (
              <article
                key={post.slug}
                className={`${styles.latestCard}${index > 1 ? ` ${styles.latestCardBordered}` : ""}`}
              >
                <div className={styles.latestCardTop}>
                  <span className={styles.latestCardEyebrow}>{post.category.name}</span>
                </div>

                <h2 className={styles.latestCardTitle}>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className={styles.latestCardExcerpt}>{post.excerpt}</p>

                <div className={styles.latestCardMeta}>
                  <span className={styles.latestCardAuthor}>{post.author.name}</span>
                  <span className={styles.latestMetaDivider}>•</span>
                  <span className={styles.latestCardDate}>
                    <Calendar size={14} />
                    {formatBlogDate(post.publishedAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const topicCopy = topicCopyByCategory[category.slug as keyof typeof topicCopyByCategory] ?? {
          eyebrow: "Growth systems",
          description: category.description,
        };
        const posts = blogPosts.filter((post) => post.category.slug === category.slug);

        if (!posts.length) {
          return null;
        }

        return (
          <BlogTopicSection
            key={category.slug}
            category={category}
            eyebrow={topicCopy.eyebrow}
            description={topicCopy.description}
            posts={posts}
          />
        );
      })}
    </main>
  );
}
