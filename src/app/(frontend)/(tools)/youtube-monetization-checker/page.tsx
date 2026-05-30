import type { Metadata } from "next";
import Link from "next/link";
import {
  SITE_NAME,
  SITE_URL,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
  createPageMetadata,
} from "@/lib/seo";
import { getToolArticleContent } from "@/lib/tool-article-content";
import YouTubeExtractorArticle from "../_youtube-extractor/YouTubeExtractorArticle";
import MonetizationClient from "../_youtube-monetization/MonetizationClient";
import styles from "../youtube-tags-generator/page.module.css";
import { getToolTestimonials } from "@/lib/tool-testimonials";
import { getToolRating } from "@/lib/tool-ratings";
import RelatedTools from "@/components/tools/RelatedTools";
import { toolCatalog } from "@/lib/tool-catalog";

const slug = "youtube-monetization-checker";
const canonicalUrl = buildCanonicalUrl(`/${slug}`);
const pageTitle = "YouTube Monetization Checker - Check Channel Revenue";
const pageDescription =
  "Check if any YouTube channel or video is accepted into the YouTube Partner Program and earning ad revenue. Instant results, 100% accuracy, no login needed.";
const socialImage = buildAbsoluteImageUrl();

export const metadata: Metadata = {
  ...createPageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: `/${slug}`,
    type: "article",
    imageAlt: "YouTube Monetization Checker by The Rehan Kadri",
    keywords: [
      "youtube monetization checker",
      "check if youtube channel is monetized",
      "is this video monetized",
      "youtube partner program checker",
      "youtube revenue checker",
      "ytlarge alternative",
    ],
  }),
  category: "SEO Tools",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
};

export default async function YouTubeMonetizationCheckerPage() {
  const article = await getToolArticleContent(slug) || { title: "", wordCount: 0, readTimeMinutes: 1, sections: [], conclusionBlocks: [], faqEntries: [] };
  const publishedDate = "2026-05-27";
  const modifiedDate = "2026-05-27";
  const testimonials = getToolTestimonials(slug, "YouTube Monetization Checker");
  const ratingData = await getToolRating(slug);

  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YouTube Monetization Checker",
    applicationCategory: "SEOApplication",
    operatingSystem: "Web",
    url: canonicalUrl,
    description: pageDescription,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingData.average.toString(),
      ratingCount: ratingData.count.toString(),
    },
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: t.name,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      reviewBody: t.quote,
    })),
    featureList: [
      "Check YouTube channel monetization status",
      "Check YouTube video monetization status",
      "Verify hidden source code flags",
      "No login required",
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
    headline: pageTitle,
    description: pageDescription,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    articleSection: "YouTube Tools",
    author: {
      "@type": "Organization",
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
        name: "Tools",
        item: buildCanonicalUrl("/tools"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "YouTube Monetization Checker",
        item: canonicalUrl,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      softwareApplicationJsonLd,
      articleJsonLd,
      faqJsonLd,
      breadcrumbJsonLd,
    ],
  };

  const stats = [
    {
      label: "Accuracy",
      value: "100%",
      note: "Checks exact data directly from YouTube servers.",
    },
    {
      label: "Support",
      value: "Videos & Channels",
      note: "Accepts both video and channel URLs.",
    },
    {
      label: "Speed",
      value: "Instant",
      note: "Fetches status in under a second.",
    },
  ];

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
            <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
              <Link href="/tools">Tools</Link>
              <span>/</span>
            </nav>
            <h1 className={`${styles.title} ${styles.singleLineToolTitle}`}>
              YouTube Monetization Checker
            </h1>
            <p className={styles.subtitle}>
              Paste a YouTube video or channel link to verify if it is accepted into the YouTube Partner Program and earning ad revenue.
            </p>

            <div className={styles.tabRow}>
              <span className={styles.tabItem}>YouTube</span>
            </div>

            <MonetizationClient />
          </div>
        </div>
      </section>

      <YouTubeExtractorArticle
        article={article}
        slug={slug}
        shareTitle={pageTitle}
        stats={stats}
      />
      <RelatedTools 
        currentToolSlug={slug} 
        category={toolCatalog.find(t => t.slug === slug)?.category} 
      />
    </main>
  );
}
