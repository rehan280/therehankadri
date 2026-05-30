import type { Metadata } from "next";
import Link from "next/link";
import {
  SITE_NAME,
  SITE_URL,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
  createPageMetadata,
} from "@/lib/seo";
import {
  getYouTubeDescriptionExtractorArticle,
} from "../_youtube-extractor/article-content";
import YouTubeExtractorArticle from "../_youtube-extractor/YouTubeExtractorArticle";
import YouTubeMetadataExtractorClient from "../_youtube-extractor/YouTubeMetadataExtractorClient";
import styles from "../youtube-tags-generator/page.module.css";
import { getToolTestimonials } from "@/lib/tool-testimonials";
import { getToolRating } from "@/lib/tool-ratings";
import RelatedTools from "@/components/tools/RelatedTools";
import { toolCatalog } from "@/lib/tool-catalog";

const slug = "youtube-description-extractor";
const canonicalUrl = buildCanonicalUrl(`/${slug}`);
const pageTitle = "YouTube Description Extractor - Copy Video Metadata";
const pageDescription =
  "Extract any public YouTube video description, title, tags, hashtags, timestamps, and metadata in one click. Free, no login, works with Shorts.";
const socialImage = buildAbsoluteImageUrl();

export const metadata: Metadata = {
  ...createPageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: `/${slug}`,
    type: "article",
    imageAlt: "YouTube Description Extractor by The Rehan Kadri",
    keywords: [
      "youtube description extractor",
      "youtube metadata extractor",
      "youtube title and description extractor",
      "extract youtube description",
      "free youtube description extractor",
      "copy youtube description",
      "youtube shorts description extractor",
      "youtube video metadata",
      "youtube tags extractor",
    ],
  }),
  category: "SEO Tools",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
};

export default async function YouTubeDescriptionExtractorPage() {
  const article = await getYouTubeDescriptionExtractorArticle();
  const publishedDate = "2026-04-20";
  const modifiedDate = "2026-04-20";
  const testimonials = getToolTestimonials("youtube-description-extractor", "YouTube Description Extractor");
  const ratingData = await getToolRating("youtube-description-extractor");

  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YouTube Description Extractor",
    applicationCategory: "SEOApplication",
    operatingSystem: "Web",
    url: canonicalUrl,
    description:
      "Extract the description and public metadata from any public YouTube video or Shorts URL.",
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
      "Extract YouTube video descriptions",
      "Works with YouTube Shorts",
      "Copy description in one click",
      "Download public metadata as a text file",
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
    headline: article.title || pageTitle,
    description: pageDescription,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    wordCount: article.wordCount,
    articleSection: "YouTube SEO",
    keywords: [
      "youtube description extractor",
      "youtube metadata extractor",
      "youtube descriptions",
      "youtube AI search",
    ],
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
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to extract a YouTube description",
    description: "Copy a YouTube URL, paste it into the tool, extract the description, and copy or download the result.",
    totalTime: "PT10S",
    step: [
      {
        "@type": "HowToStep",
        name: "Copy the YouTube video URL",
        text: "Copy the URL from desktop or tap Share and Copy link in the YouTube mobile app.",
      },
      {
        "@type": "HowToStep",
        name: "Paste the URL",
        text: "Paste the video or Shorts URL into the YouTube Description Extractor.",
      },
      {
        "@type": "HowToStep",
        name: "Extract the description",
        text: "Click Extract description to pull the public description and metadata.",
      },
      {
        "@type": "HowToStep",
        name: "Copy or download",
        text: "Copy the description, copy all metadata, or download the output as a text file.",
      },
    ],
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
        name: "YouTube Description Extractor",
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
      howToJsonLd,
      breadcrumbJsonLd,
    ],
  };
  const stats = [
    {
      label: "Description limit",
      value: "5,000",
      note: "YouTube descriptions can use up to 5,000 characters.",
    },
    {
      label: "Critical preview",
      value: "200",
      note: "The first 200 characters carry the most visible SEO context.",
    },
    {
      label: "Best use",
      value: "SEO",
      note: "Descriptions help YouTube and Google understand the video topic.",
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
              YouTube Description Extractor
            </h1>
            <p className={styles.subtitle}>
              Paste a YouTube video or Shorts link and pull the public description, title, tags, hashtags, timestamps, and key metadata.
            </p>

            <div className={styles.tabRow}>
              <span className={styles.tabItem}>YouTube</span>
            </div>

            <YouTubeMetadataExtractorClient mode="description" />
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
