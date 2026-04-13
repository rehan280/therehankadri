import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { getAllBlogPosts } from "@/lib/blog-content";
import { getPostPath, isStatsPostSlug } from "@/lib/post-paths";
import {
  ORGANIZATION_ID,
  SITE_URL,
  buildCanonicalUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/lib/seo";
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

const hubCanonicalUrl = buildCanonicalUrl("/stats");

const hubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Statistics Hub",
  url: hubCanonicalUrl,
  description: hubIntro,
  about: {
    "@id": ORGANIZATION_ID,
  },
};

const defaultStatsGroups = ["YouTube", "B2B"] as const;

function getStatsPosts(posts: BlogPost[]) {
  return posts.filter((post) => isStatsPostSlug(post.slug));
}

function groupStatsPosts(posts: BlogPost[]) {
  const groups = new Map<string, BlogPost[]>();

  defaultStatsGroups.forEach((groupName) => {
    groups.set(groupName, []);
  });

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
  const normalizedName = name.toLowerCase();

  if (normalizedName === "youtube") {
    return "/stats/youtube";
  }

  if (normalizedName === "b2b") {
    return "/stats/b2b";
  }

  return "/stats";
}

function getGroupDescription(name: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName === "youtube") {
    return "Find YouTube audience numbers, channel growth stats, usage trends, Shorts signals, and the benchmark pages we update for marketers and creators.";
  }

  if (normalizedName === "b2b") {
    return "Find B2B SEO statistics on AI discovery, buyer behavior, LinkedIn lead capture, content ROI, and the budget trends shaping 2026 demand generation.";
  }

  return `Find the latest ${name.toLowerCase()} statistics, benchmark pages, and trend snapshots curated for marketers, SEO teams, and growth operators.`;
}

export default async function StatsHubPage() {
  const posts = await getAllBlogPosts();
  const statsPosts = getStatsPosts(posts as BlogPost[]);
  const groupedPosts = groupStatsPosts(statsPosts);
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Statistics", url: hubCanonicalUrl },
  ]);
  const hubStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...hubJsonLd,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: statsPosts.slice(0, 8).map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: post.title,
            url: buildCanonicalUrl(getPostPath(post.slug)),
          })),
        },
      },
      breadcrumbJsonLd,
    ],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hubStructuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className={styles.hero}>
        <div className={styles.heroShell}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>Statistics Hub</span>
            <h1 className={styles.heroTitle}>Research-Driven Statistics Hub</h1>
            <p className={styles.heroCopy}>{hubIntro}</p>
            <p className={styles.heroCopy}>
              Use these pages to compare audience size, platform adoption, creator economics, and category-level shifts without bouncing between disconnected sources.
            </p>
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
                    <h2 className={styles.topicCardTitle}>{group.name} Statistics</h2>
                    <p className={styles.topicCardCopy}>
                      Curated statistics pages for {group.name.toLowerCase()} trends, growth
                      benchmarks, audience signals, and platform insights.
                    </p>
                    <p className={styles.topicCardCopy}>
                      Start with the hub overview, then jump into the specific pages that match the market or platform question you are trying to answer.
                    </p>
                  </div>

                  <div className={styles.topicLearn}>
                    <span className={styles.topicMiniHeading}>What you&apos;ll find</span>
                    <p className={styles.topicLearnCopy}>{getGroupDescription(group.name)}</p>
                    <p className={styles.topicLearnCopy}>
                      Each section is meant to make internal research faster, with direct paths into live stats pages instead of another full-site search.
                    </p>
                  </div>

                  <div className={styles.topicResources}>
                    <span className={styles.topicMiniHeading}>
                      {visibleItems.length} {visibleItems.length === 1 ? "resource" : "resources"}
                    </span>
                    {visibleItems.length ? (
                      <ul className={styles.resourceList}>
                        {visibleItems.map((post) => (
                          <li key={post.slug} className={styles.resourceItem}>
                            <Link href={getPostPath(post.slug)} className={styles.resourceLink}>
                              {post.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.topicLearnCopy}>
                        This hub page is live now, and new posts tagged under {group.name} will
                        show here automatically.
                      </p>
                    )}
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

