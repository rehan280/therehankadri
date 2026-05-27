import type { Metadata } from "next";
import Link from "next/link";
import {
  SITE_NAME,
  SITE_URL,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
  createPageMetadata,
} from "@/lib/seo";
import { getToolTestimonials } from "@/lib/tool-testimonials";
import { getToolRating } from "@/lib/tool-ratings";
import baseStyles from "../youtube-tags-generator/page.module.css";
import styles from "./page.module.css";
import { getYouTubeStartTimeArticle, youtubeStartTimeFaqEntries } from "./article";
import YouTubeStartTimeArticle from "./YouTubeStartTimeArticle";
import YouTubeStartTimeLinkGeneratorClient from "./YouTubeStartTimeLinkGeneratorClient";

const slug = "youtube-start-time-link-generator";
const canonicalUrl = buildCanonicalUrl(`/${slug}`);
const pageTitle = "YouTube Start Time Link Generator - Free [2026]";
const pageDescription =
  "Free YouTube start time link generator. Create a URL that jumps to any second in a YouTube video. Works on desktop, mobile, Shorts, and embeds.";
const socialImage = buildAbsoluteImageUrl();

export const metadata: Metadata = {
  ...createPageMetadata({
    title: pageTitle,
    description: pageDescription,
    path: `/${slug}`,
    type: "article",
    imageAlt: "YouTube Start Time Link Generator by The Rehan Kadri",
    keywords: [
      "youtube start time link generator",
      "youtube timestamp link generator",
      "youtube link with timestamp",
      "how to share youtube video at specific time",
      "youtube timestamp link mobile",
      "youtube embed start time",
      "add timestamp to youtube url",
      "share youtube video starting at specific time",
      "youtube start time url",
      "youtube link start at specific time",
    ],
  }),
  category: "SEO Tools",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
};

export default async function YouTubeStartTimeLinkGeneratorPage() {
  const article = await getYouTubeStartTimeArticle();
  const publishedDate = "2026-05-22";
  const modifiedDate = "2026-05-22";
  const testimonials = getToolTestimonials("youtube-start-time-link-generator", "YouTube Start Time Link Generator");
  const ratingData = await getToolRating("youtube-start-time-link-generator");
  
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YouTube Start Time Link Generator",
    applicationCategory: "SEOApplication",
    applicationSubCategory: "YouTube SEO Tool",
    operatingSystem: "Web",
    url: canonicalUrl,
    description:
      "Generate YouTube links that start at a specific timestamp. Works for standard videos and YouTube Shorts.",
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
      "Generate timestamped youtu.be links",
      "Generate standard watch URLs with timestamps",
      "Generate embed URLs with optional end time",
      "Remove old timestamps from pasted URLs",
      "Works with standard links, Shorts, and embeds",
      "Copy ready-made iframe embed code",
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
      "youtube start time link generator",
      "youtube timestamp link generator",
      "youtube link with timestamp",
      "youtube timestamp link mobile",
      "youtube embed start time",
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
    mainEntity: youtubeStartTimeFaqEntries.map((entry) => ({
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
    name: "How to create a YouTube link that starts at a specific time",
    description:
      "Paste a YouTube URL, set the timestamp, generate the link, and copy the output.",
    totalTime: "PT15S",
    step: [
      {
        "@type": "HowToStep",
        name: "Copy the YouTube video URL",
        text: "Copy the video URL from the address bar or use Share and Copy link in the YouTube app.",
      },
      {
        "@type": "HowToStep",
        name: "Paste the URL into the tool",
        text: "Paste the URL into the generator and enter the start time in hours, minutes, and seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Generate the timestamped link",
        text: "Click Generate link to create a clean timestamp URL and optional embed output.",
      },
      {
        "@type": "HowToStep",
        name: "Copy and share",
        text: "Copy the recommended share URL or the embed code and use it anywhere you want to send viewers to that exact moment.",
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
        name: "YouTube Start Time Link Generator",
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

  return (
    <main className={baseStyles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className={`${baseStyles.heroSection} ${styles.intentHero}`}>
        <div className={baseStyles.wrap}>
          <div className={baseStyles.heroInner}>
            <nav className={baseStyles.breadcrumbNav} aria-label="Breadcrumb">
              <Link href="/tools">Tools</Link>
              <span>/</span>
            </nav>
            <h1 className={`${baseStyles.title} ${styles.intentTitle}`}>
              <span>YouTube Start Time</span>
              <span>Link Generator</span>
            </h1>
            <p className={`${baseStyles.subtitle} ${styles.intentSubtitle}`}>
              Create a YouTube link that starts at the exact second you want.
            </p>

            <div className={`${baseStyles.tabRow} ${styles.intentTabRow}`}>
              <span className={baseStyles.tabItem}>YouTube</span>
            </div>

            <YouTubeStartTimeLinkGeneratorClient />
          </div>
        </div>
      </section>

      <YouTubeStartTimeArticle article={article} />
    </main>
  );
}
