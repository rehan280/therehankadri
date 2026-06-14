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
import styles from "./youtube-stats.module.css";

const featuredYouTubeStatsResources = [
  {
    title: "How Many YouTube Subscribers Needed to Make Money in 2026?",
    url: "/stats/youtube-subscribers-needed-to-make-money",
  },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "YouTube Statistics 2026 — Users, Channels, Revenue & Growth | Rehan Kadri",
  description:
    "Find the latest YouTube statistics for 2026: monthly active users, channel counts, Shorts views, revenue figures, creator income data, and platform growth benchmarks.",
  path: "/stats/youtube",
  imagePath: "/stats/youtube/youtube-stats-transparent.png",
  imageAlt: "YouTube statistics hub 2026 — users, channels, revenue, and growth data",
  keywords: [
    "YouTube statistics 2026",
    "how many YouTube users",
    "how many YouTube channels",
    "YouTube monthly active users",
    "YouTube revenue 2026",
    "YouTube Shorts statistics",
    "creator economy stats",
    "YouTube growth data",
  ],
});

const hubIntro =
  "Whether you're researching audience size, channel growth, or platform trends, this hub organizes our YouTube statistics pages in one place.";

const hubCanonicalUrl = buildCanonicalUrl("/stats/youtube");

const hubJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "YouTube Statistics Hub",
  url: hubCanonicalUrl,
  description: hubIntro,
  about: {
    "@id": ORGANIZATION_ID,
  },
};

function getYouTubeStatsPosts(posts: BlogPost[]) {
  return posts.filter(
    (post) => isStatsPostSlug(post.slug) && post.subcategories.includes("YouTube")
  );
}

export default async function YouTubeStatsHubPage() {
  const posts = await getAllBlogPosts();
  const youtubePosts = getYouTubeStatsPosts(posts as BlogPost[]);
  const featuredPost = youtubePosts[0];
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Statistics", url: buildCanonicalUrl("/stats") },
    { name: "YouTube Statistics", url: hubCanonicalUrl },
  ]);
  const hubStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...hubJsonLd,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: [
            ...featuredYouTubeStatsResources.map((resource, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: resource.title,
              url: buildCanonicalUrl(resource.url),
            })),
            ...youtubePosts.map((post, index) => ({
              "@type": "ListItem",
              position: featuredYouTubeStatsResources.length + index + 1,
              name: post.title,
              url: buildCanonicalUrl(getPostPath(post.slug)),
            })),
          ],
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".hero-copy", "h2"],
        },
      },
      breadcrumbJsonLd,
      {
        "@type": "Dataset",
        "@id": `${hubCanonicalUrl}#dataset`,
        name: "YouTube Statistics 2026",
        description: "Compiled YouTube platform statistics for 2026, including user counts, channel data, Shorts performance, revenue figures, and creator economy benchmarks.",
        url: hubCanonicalUrl,
        temporalCoverage: "2026",
        measurementTechnique: "Aggregated from YouTube official reports, Alphabet earnings, and industry research studies.",
        creator: {
          "@id": ORGANIZATION_ID,
        },
        keywords: "YouTube statistics, YouTube users, YouTube channels, YouTube revenue, YouTube Shorts, creator economy",
        about: {
          "@type": "Thing",
          name: "YouTube",
          sameAs: "https://www.youtube.com",
        },
      },
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
            <span className={styles.heroEyebrow}>YouTube Statistics</span>
            <h1 className={styles.heroTitle}>YouTube Statistics Hub</h1>
            <p className={styles.heroCopy}>{hubIntro}</p>
            <p className={styles.heroCopy}>
              This hub is built for marketers, creators, and researchers who need quick access to reliable numbers on audience scale, channel growth, and platform monetization.
            </p>
            {featuredPost ? (
              <Link href={getPostPath(featuredPost.slug)} className={styles.heroButton}>
                <span>Explore Hub</span>
                <ArrowRight size={18} strokeWidth={2.1} />
              </Link>
            ) : null}
          </div>

          <div className={styles.heroArtwork}>
            <Image
              src="/stats/youtube/youtube-stats-transparent.png"
              alt="YouTube statistics hub hero artwork"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      <section className={styles.topicSection}>
        <div className={styles.topicShell}>
          <div className={styles.topicBackdrop} aria-hidden="true" />
          <div className={styles.topicGrid}>
            <div className={styles.topicCard}>
              <span className={styles.topicCardLabel}>YouTube Statistics</span>
              <h2 className={styles.topicCardTitle}>YouTube Research Stack</h2>
              <p className={styles.topicCardCopy}>
                Updated statistics pages for YouTube channels, users, revenue, and platform
                growth.
              </p>
              <p className={styles.topicCardCopy}>
                It gives you one stable place to navigate the current library and find the next supporting data point quickly.
              </p>
            </div>

            <div className={styles.topicLearn}>
              <span className={styles.topicMiniHeading}>What you&apos;ll learn</span>
              <p className={styles.topicLearnCopy}>
                Explore the exact posts covering YouTube users, active channels, Shorts, and
                platform-level growth trends. New YouTube statistics posts tagged under this
                subcategory will automatically appear here.
              </p>
              <p className={styles.topicLearnCopy}>
                Use it when you need a clean starting point for deck research, benchmark comparisons, or creator-market sizing.
              </p>
            </div>

            <div className={styles.topicResources}>
              <span className={styles.topicMiniHeading}>
                {featuredYouTubeStatsResources.length + youtubePosts.length}{" "}
                {featuredYouTubeStatsResources.length + youtubePosts.length === 1 ? "resource" : "resources"}
              </span>
              <ul className={styles.resourceList}>
                {featuredYouTubeStatsResources.map((resource) => (
                  <li key={resource.url} className={styles.resourceItem}>
                    <Link href={resource.url} className={styles.resourceLink}>
                      {resource.title}
                    </Link>
                  </li>
                ))}
                {youtubePosts.map((post) => (
                  <li key={post.slug} className={styles.resourceItem}>
                    <Link href={getPostPath(post.slug)} className={styles.resourceLink}>
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

