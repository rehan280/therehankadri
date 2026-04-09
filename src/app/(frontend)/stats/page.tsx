import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { getAllBlogPosts } from "@/lib/blog-content";
import { getPostPath, isStatsPostSlug } from "@/lib/post-paths";
import { buildCanonicalUrl, createPageMetadata } from "@/lib/seo";
import styles from "./stats-hub.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Statistics Hub | Rehan Kadri",
  description:
    "Browse research-driven statistics pages on YouTube, platform trends, growth data, and digital benchmarks in one place.",
  path: "/stats",
  imagePath: "/stats/stats-clean.png",
  imageAlt: "Statistics hub hero artwork",
});

const hubIntro =
  "A focused library of platform statistics pages built to help you find reliable numbers, growth benchmarks, and trend snapshots faster.";

const hubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Statistics Hub",
  url: buildCanonicalUrl("/stats"),
  description: hubIntro,
};

function getStatsPosts(posts: BlogPost[]) {
  return posts.filter((post) => isStatsPostSlug(post.slug));
}

function groupStatsPosts(posts: BlogPost[]) {
  const groups = new Map<string, BlogPost[]>();

  posts.forEach((post) => {
    const key = post.subcategories[0] ?? "Statistics";
    const current = groups.get(key) ?? [];
    current.push(post);
    groups.set(key, current);
  });

  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    items,
  }));
}

function getHubPathForSubcategory(name: string) {
  if (name.toLowerCase() === "youtube") {
    return "/stats/youtube";
  }

  return "/stats";
}

function getGroupDescription(name: string) {
  if (name.toLowerCase() === "youtube") {
    return "Find YouTube audience numbers, channel growth stats, usage trends, Shorts signals, and the benchmark pages we update for marketers and creators.";
  }

  return `Find the latest ${name.toLowerCase()} statistics, benchmark pages, and trend snapshots curated for marketers, SEO teams, and growth operators.`;
}

export default async function StatsHubPage() {
  const posts = await getAllBlogPosts();
  const statsPosts = getStatsPosts(posts as BlogPost[]);
  const groupedPosts = groupStatsPosts(statsPosts);

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hubJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className={styles.hero}>
        <div className={styles.heroShell}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>Statistics Hub</span>
            <h1 className={styles.heroTitle}>Research-Driven Statistics Hub</h1>
            <p className={styles.heroCopy}>{hubIntro}</p>
            <a href="#statistics-directory" className={styles.heroButton}>
              <span>Explore Stats</span>
              <ArrowRight size={18} strokeWidth={2.1} />
            </a>
          </div>

          <div className={styles.heroArtwork}>
            <Image
              src="/stats/stats-clean.png"
              alt="Statistics hub hero artwork"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      <section id="statistics-directory" className={styles.topicSection}>
        <div className={styles.topicShell}>
          <div className={styles.topicBackdrop} aria-hidden="true" />
          <div className={styles.topicStack}>
            {groupedPosts.map((group) => {
              const visibleItems = group.items.slice(0, 5);
              const hubPath = getHubPathForSubcategory(group.name);

              return (
                <div key={group.name} className={styles.topicGrid}>
                  <div className={styles.topicCard}>
                    <span className={styles.topicCardLabel}>Statistics</span>
                    <strong className={styles.topicCardTitle}>{group.name} Statistics</strong>
                    <p className={styles.topicCardCopy}>
                      Curated statistics pages for {group.name.toLowerCase()} trends, growth
                      benchmarks, audience signals, and platform insights.
                    </p>
                  </div>

                  <div className={styles.topicLearn}>
                    <span className={styles.topicMiniHeading}>What you&apos;ll find</span>
                    <p className={styles.topicLearnCopy}>{getGroupDescription(group.name)}</p>
                  </div>

                  <div className={styles.topicResources}>
                    <span className={styles.topicMiniHeading}>
                      {visibleItems.length} {visibleItems.length === 1 ? "resource" : "resources"}
                    </span>
                    <ul className={styles.resourceList}>
                      {visibleItems.map((post) => (
                        <li key={post.slug} className={styles.resourceItem}>
                          <Link href={getPostPath(post.slug)} className={styles.resourceLink}>
                            {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={hubPath} className={styles.moreLink}>
                      <span>{group.name} Statistics</span>
                      <ArrowRight size={16} strokeWidth={2.1} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

