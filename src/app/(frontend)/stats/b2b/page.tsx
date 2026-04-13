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
import styles from "./b2b-stats.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "B2B Statistics Hub | Rehan Kadri",
  description:
    "Browse B2B statistics posts on growth, marketing, pipeline, and digital benchmarks in one organized blue-themed hub.",
  path: "/stats/b2b",
  imagePath: "/stats/b2b/b2b stats.png",
  imageAlt: "B2B statistics hub hero artwork",
  keywords: [
    "b2b statistics",
    "b2b marketing statistics",
    "b2b growth statistics",
    "b2b sales statistics",
    "b2b seo statistics",
    "b2b benchmarks",
  ],
});

const hubIntro =
  "A focused B2B statistics hub built for operators, marketers, and founders who need benchmark posts, research snapshots, and pipeline-focused numbers in one place.";

const hubCanonicalUrl = buildCanonicalUrl("/stats/b2b");

const hubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "B2B Statistics Hub",
  url: hubCanonicalUrl,
  description: hubIntro,
  about: {
    "@id": ORGANIZATION_ID,
  },
};

function getB2BStatsPosts(posts: BlogPost[]) {
  return posts.filter(
    (post) =>
      isStatsPostSlug(post.slug) &&
      post.subcategories.some((subcategory) => subcategory.toLowerCase() === "b2b")
  );
}

export default async function B2BStatsHubPage() {
  const posts = await getAllBlogPosts();
  const b2bPosts = getB2BStatsPosts(posts as BlogPost[]);
  const featuredPost = b2bPosts[0];
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Statistics", url: buildCanonicalUrl("/stats") },
    { name: "B2B Statistics", url: hubCanonicalUrl },
  ]);
  const hubStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...hubJsonLd,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: b2bPosts.map((post, index) => ({
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
            <div className={styles.heroBreadcrumb}>
              <Link href="/stats" className={styles.heroBreadcrumbLink}>
                Stats
              </Link>
              <span className={styles.heroBreadcrumbDivider}>/</span>
              <span className={styles.heroEyebrow}>B2B Statistics</span>
            </div>
            <h1 className={styles.heroTitle}>B2B Statistics Hub</h1>
            <p className={styles.heroCopy}>{hubIntro}</p>
            <p className={styles.heroCopy}>
              The goal is simple: help you get from a broad B2B research question to the exact benchmark page you need without wasting time digging through mixed-intent content.
            </p>
            <div className={styles.heroActions}>
              <a href="#b2b-stats-directory" className={styles.heroButton}>
                <span>Explore B2B Stats</span>
                <ArrowRight size={18} strokeWidth={2.1} />
              </a>
              {featuredPost ? (
                <Link href={getPostPath(featuredPost.slug)} className={styles.heroGhostButton}>
                  <span>Read Featured Post</span>
                </Link>
              ) : null}
            </div>
          </div>

          <div className={styles.heroArtwork}>
            <Image
              src="/stats/b2b/b2b stats.png"
              alt="B2B statistics hub hero artwork"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      <section id="b2b-stats-directory" className={styles.topicSection}>
        <div className={styles.topicShell}>
          <div className={styles.topicBackdrop} aria-hidden="true" />
          <div className={styles.topicGrid}>
            <div className={styles.topicCard}>
              <span className={styles.topicCardLabel}>B2B Statistics</span>
              <h2 className={styles.topicCardTitle}>Pipeline Research Shelf</h2>
              <p className={styles.topicCardCopy}>
                B2B benchmark posts for growth, demand generation, content performance, and
                revenue-minded marketing decisions.
              </p>
              <p className={styles.topicCardCopy}>
                These pages are organized to support planning, positioning, and stakeholder reporting with faster access to source-backed numbers.
              </p>
            </div>

            <div className={styles.topicLearn}>
              <span className={styles.topicMiniHeading}>What you&apos;ll find</span>
              <p className={styles.topicLearnCopy}>
                This page automatically surfaces every visible statistics post tagged under the
                B2B subcategory, so the hub stays updated as new benchmark content is published.
              </p>
              <div className={styles.infoStrip}>
                <span className={styles.infoLabel}>SEO Focus</span>
                <p className={styles.infoCopy}>
                  Built as a dedicated collection page to strengthen internal linking around B2B
                  statistics, benchmarks, and research intent.
                </p>
              </div>
            </div>

            <div className={styles.topicResources}>
              <span className={styles.topicMiniHeading}>
                {b2bPosts.length} {b2bPosts.length === 1 ? "resource" : "resources"}
              </span>

              {b2bPosts.length ? (
                <ul className={styles.resourceList}>
                  {b2bPosts.map((post) => (
                    <li key={post.slug} className={styles.resourceItem}>
                      <Link href={getPostPath(post.slug)} className={styles.resourceLink}>
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyState}>
                  <strong className={styles.emptyTitle}>No B2B stats posts yet</strong>
                  <p className={styles.emptyCopy}>
                    As soon as a visible statistics post includes <code>B2B</code> in its
                    subcategories, it will appear here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
