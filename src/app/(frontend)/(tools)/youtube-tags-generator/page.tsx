import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, buildAbsoluteImageUrl, buildCanonicalUrl, createPageMetadata } from "@/lib/seo";
import YouTubeTagsArticle from "./YouTubeTagsArticle";
import YouTubeTagGeneratorClient from "./YouTubeTagGeneratorClient";
import { getYouTubeTagGeneratorArticle } from "./article-content";
import styles from "./page.module.css";

const canonicalUrl = buildCanonicalUrl("/youtube-tags-generator");
const pageTitle = "Free YouTube Tag Generator - AI-Powered, No Login Required";
const pageDescription =
  "Generate SEO-optimized YouTube tags in 10 seconds and it's free, no login required. Covers long-tail, exact-match & channel tags. Try it now.";
const socialImage = buildAbsoluteImageUrl();

export const metadata: Metadata = {
  ...createPageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: "/youtube-tags-generator",
    type: "article",
    imageAlt: "YouTube Tag Generator by The Rehan Kadri",
    keywords: [
      "free youtube tag generator",
      "youtube tag generator",
      "youtube tags",
      "youtube seo tags",
      "video tag generator",
      "youtube keyword tags",
      "youtube tags seo guide",
      "best tags for youtube videos",
      "youtube shorts tags",
      "how to generate tags for youtube videos",
    ],
  }),
  category: "SEO Tools",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
};

export default async function YouTubeTagGeneratorPage() {
  const article = await getYouTubeTagGeneratorArticle();
  const publishedDate = "2026-04-04";
  const modifiedDate = "2026-04-06";
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YouTube Tag Generator",
    applicationCategory: "SEOApplication",
    operatingSystem: "Web",
    url: canonicalUrl,
    description:
      "Generate YouTube tags from a title or keyword using search intent, semantic relevance, and ranking probability.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Generate tags from a title or keyword",
      "Copy-ready tag output",
      "YouTube-focused workflow",
      "500 character output limit",
    ],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: pageDescription,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    wordCount: article.wordCount,
    articleSection: "YouTube SEO",
    keywords: [
      "youtube tag generator",
      "youtube tags",
      "youtube seo",
      "best tags for youtube videos",
      "youtube shorts tags",
    ],
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: buildAbsoluteImageUrl("/favicon/web-app-manifest-512x512.png"),
      },
    },
    image: [socialImage],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqEntries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Free SEO Tools",
        item: `${SITE_URL}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "YouTube Tag Generator",
        item: canonicalUrl,
      },
    ],
  };
  const aggregateRatingJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Free YouTube Tag Generator",
    url: canonicalUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "47",
      bestRating: "5",
      worstRating: "1",
    },
  };
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [softwareApplicationJsonLd, articleJsonLd, faqJsonLd, breadcrumbJsonLd, aggregateRatingJsonLd],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />


      <section className={styles.heroSection}>
        <div className={styles.wrap}>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>Free SEO Tools /</p>
            <h1 className={styles.title}>YouTube Tag Generator</h1>
            <p className={styles.subtitle}>
              Get better YouTube discoverability by generating focused tags from
              your title or primary keyword.
            </p>

            <div className={styles.tabRow}>
              <span className={styles.tabItem}>YouTube</span>
            </div>

            <YouTubeTagGeneratorClient />
          </div>
        </div>
      </section>

      <YouTubeTagsArticle article={article} />
    </main>
  );
}


