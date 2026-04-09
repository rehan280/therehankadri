import Link from "next/link";
import { Calendar } from "lucide-react";
import BlogTopicSection from "@/components/blog/BlogTopicSection";
import { formatBlogDate } from "@/lib/blog";
import { getAllBlogPosts, getBlogCategories } from "@/lib/blog-content";
import { getPostPath, isStatsPostSlug } from "@/lib/post-paths";
import { ORGANIZATION_ID, buildCanonicalUrl } from "@/lib/seo";
import styles from "./blog.module.css";

const canonicalUrl = buildCanonicalUrl("/blog");

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

export default async function BlogIndexPage() {
  const [allPosts, categories] = await Promise.all([
    getAllBlogPosts(),
    getBlogCategories(),
  ]);
  const blogPosts = allPosts.filter((post) => !isStatsPostSlug(post.slug));
  const latestPosts = blogPosts.slice(0, 4);
  const blogIndexJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SEO Blog | Rehan Kadri",
    url: canonicalUrl,
    description:
      "Practical writing on SEO, content systems, demand capture, and founder authority for teams building qualified pipeline.",
    about: {
      "@id": ORGANIZATION_ID,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: latestPosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: buildCanonicalUrl(getPostPath(post.slug)),
        name: post.title,
      })),
    },
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogIndexJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className={`${styles.hero} ${styles.blogIndexHero}`}>
        <div className={`${styles.heroInner} ${styles.blogIndexHeroInner}`}>
          <h1 className={styles.blogIndexTitle}>The Rehan Kadri Blog</h1>

          <p className={styles.blogIndexCopy}>
            Practical writing on SEO, content distribution, authority, and conversion infrastructure for teams that want growth to compound.
          </p>
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
                  <Link href={getPostPath(post.slug)} prefetch>{post.title}</Link>
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
