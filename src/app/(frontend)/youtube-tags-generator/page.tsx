import type { Metadata } from "next";
import YouTubeTagsArticle from "./YouTubeTagsArticle";
import YouTubeTagGeneratorClient from "./YouTubeTagGeneratorClient";
import { youtubeTagGeneratorArticle } from "./article-content";
import styles from "./page.module.css";

const siteUrl = "https://therehankadri.com";
const canonicalUrl = `${siteUrl}/youtube-tags-generator`;
const pageTitle = "YouTube Tag Generator + 2026 SEO Guide | The Rehan Kadri";
const pageDescription =
  "Generate YouTube tags from a title or keyword, then read the full 2026 guide on YouTube SEO tags, strategy, mistakes, and FAQs.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: canonicalUrl,
  },
  category: "SEO Tools",
  authors: [{ name: "The Rehan Kadri", url: siteUrl }],
  creator: "The Rehan Kadri",
  publisher: "The Rehan Kadri",
  keywords: [
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
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "article",
    url: canonicalUrl,
    siteName: "The Rehan Kadri",
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: pageDescription,
  },
};

export default function YouTubeTagGeneratorPage() {
  const publishedDate = "2026-04-04";
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
      name: "The Rehan Kadri",
      url: siteUrl,
    },
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: youtubeTagGeneratorArticle.title,
    description: pageDescription,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    datePublished: publishedDate,
    dateModified: publishedDate,
    wordCount: youtubeTagGeneratorArticle.wordCount,
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
      name: "The Rehan Kadri",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "The Rehan Kadri",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon/web-app-manifest-512x512.png`,
      },
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: youtubeTagGeneratorArticle.faqEntries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [softwareApplicationJsonLd, articleJsonLd, faqJsonLd],
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

      <YouTubeTagsArticle />
    </main>
  );
}

