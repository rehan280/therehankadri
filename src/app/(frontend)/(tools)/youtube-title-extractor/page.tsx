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
  getYouTubeTitleExtractorArticle,
} from "../_youtube-extractor/article-content";
import YouTubeExtractorArticle from "../_youtube-extractor/YouTubeExtractorArticle";
import YouTubeMetadataExtractorClient from "../_youtube-extractor/YouTubeMetadataExtractorClient";
import styles from "../youtube-tags-generator/page.module.css";

const slug = "youtube-title-extractor";
const canonicalUrl = buildCanonicalUrl(`/${slug}`);
const pageTitle = "YouTube Title Extractor - Free Online Tool (2026)";
const pageDescription =
  "Extract any YouTube video title in one click. Free, no login, no limits. Works on desktop, mobile, and Shorts for YouTube SEO research.";
const socialImage = buildAbsoluteImageUrl();

export const metadata: Metadata = {
  ...createPageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: `/${slug}`,
    type: "article",
    imageAlt: "YouTube Title Extractor by The Rehan Kadri",
    keywords: [
      "youtube title extractor",
      "youtube video title extractor",
      "extract youtube title",
      "free youtube title extractor",
      "youtube title copy tool",
      "copy youtube video title online",
      "how to copy youtube title on mobile",
      "youtube shorts title extractor",
      "youtube title extractor for SEO",
    ],
  }),
  category: "SEO Tools",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
};

export default async function YouTubeTitleExtractorPage() {
  const article = await getYouTubeTitleExtractorArticle();
  const publishedDate = "2026-04-20";
  const modifiedDate = "2026-04-20";
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YouTube Title Extractor",
    applicationCategory: "SEOApplication",
    operatingSystem: "Web",
    url: canonicalUrl,
    description:
      "Extract the title and public metadata from any public YouTube video or Shorts URL.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Extract YouTube video titles",
      "Works with YouTube Shorts",
      "Copy title in one click",
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
      "youtube title extractor",
      "youtube title SEO",
      "youtube title character limit",
      "youtube title formulas",
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
    name: "How to use this YouTube title extractor",
    description: "Copy a YouTube URL, paste it into the tool, extract the title, and copy the result.",
    totalTime: "PT10S",
    step: [
      {
        "@type": "HowToStep",
        name: "Copy the YouTube video URL",
        text: "Copy the URL from the browser address bar or tap Share and Copy link in the YouTube app.",
      },
      {
        "@type": "HowToStep",
        name: "Paste the URL",
        text: "Paste the video or Shorts URL into the YouTube Title Extractor.",
      },
      {
        "@type": "HowToStep",
        name: "Extract the title",
        text: "Click Extract title to pull the current public title from YouTube.",
      },
      {
        "@type": "HowToStep",
        name: "Copy the title",
        text: "Copy the title or download the public metadata as a text file.",
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
        name: "YouTube Title Extractor",
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
      label: "Title limit",
      value: "100 chars",
      note: "YouTube allows up to 100 characters in a video title.",
    },
    {
      label: "Search preview",
      value: "60-70",
      note: "Most search and feed previews cut titles around this range.",
    },
    {
      label: "Best use",
      value: "CTR",
      note: "Titles are the metadata field most directly tied to clicks.",
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
              YouTube Title Extractor
            </h1>
            <p className={styles.subtitle}>
              Paste a YouTube video or Shorts link and copy the exact current title for SEO research, swipe files, and mobile workflows.
            </p>

            <div className={styles.tabRow}>
              <span className={styles.tabItem}>YouTube</span>
            </div>

            <YouTubeMetadataExtractorClient mode="title" />
          </div>
        </div>
      </section>

      <YouTubeExtractorArticle
        article={article}
        slug={slug}
        shareTitle={pageTitle}
        stats={stats}
      />
    </main>
  );
}
