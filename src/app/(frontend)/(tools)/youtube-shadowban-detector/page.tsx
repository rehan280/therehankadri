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
import ShadowbanClient from "../_youtube-shadowban/ShadowbanClient";
import styles from "../youtube-tags-generator/page.module.css";
import { getToolTestimonials } from "@/lib/tool-testimonials";
import { getToolRating } from "@/lib/tool-ratings";
import RelatedTools from "@/components/tools/RelatedTools";
import { toolCatalog } from "@/lib/tool-catalog";

const slug = "youtube-shadowban-detector";
const canonicalUrl = buildCanonicalUrl(`/${slug}`);
const pageTitle = "YouTube Shadowban Detector - Check Channel Visibility";
const pageDescription =
  "Check your YouTube channel health score and detect search, family-safe, or algorithmic restriction signals. Free tool, no login required.";
const socialImage = buildAbsoluteImageUrl();

export const metadata: Metadata = {
  ...createPageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: `/${slug}`,
    type: "article",
    imageAlt: "YouTube Shadowban Detector by The Rehan Kadri",
    keywords: [
      "youtube shadowban detector",
      "is my channel shadowbanned",
      "youtube search restriction check",
      "youtube algorithm check",
      "why are my youtube views dropping",
      "youtube family safe checker",
    ],
  }),
  category: "SEO Tools",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
};

export default async function YouTubeShadowbanDetectorPage() {
  const article = await getToolArticleContent(slug) || { title: "", wordCount: 0, readTimeMinutes: 1, sections: [], conclusionBlocks: [], faqEntries: [] };
  const publishedDate = "2026-05-27";
  const modifiedDate = "2026-05-27";
  const testimonials = getToolTestimonials(slug, "YouTube Shadowban Detector");
  const ratingData = await getToolRating(slug);

  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YouTube Shadowban Detector",
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
      "Check YouTube channel search indexing",
      "Detect 'Family Safe' restriction flags",
      "Analyze shadowban risk score",
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
        name: "YouTube Shadowban Detector",
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
      label: "Heuristics",
      value: "Search & Metadata",
      note: "Checks if you are indexed in YouTube search results.",
    },
    {
      label: "Safety Flags",
      value: "Checked",
      note: "Identifies if YouTube marked you as not family-safe.",
    },
    {
      label: "Cost",
      value: "Free",
      note: "Check as many channels or videos as you want.",
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
              YouTube Shadowban Detector
            </h1>
            <p className={styles.subtitle}>
              Paste a YouTube video or channel link to check its health score and diagnose algorithmic restrictions.
            </p>

            <div className={styles.tabRow}>
              <span className={styles.tabItem}>YouTube</span>
            </div>

            <ShadowbanClient />
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
