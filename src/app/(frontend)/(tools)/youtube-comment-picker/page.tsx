import type { Metadata } from "next";
import Link from "next/link";
import {
  SITE_NAME,
  SITE_URL,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
  createPageMetadata,
} from "@/lib/seo";
import { getToolBySlug } from "@/lib/tool-catalog";
import GenericToolArticle, { getGenericToolFaq } from "../_generic/GenericToolArticle";
import YouTubeCommentPickerClient from "./YouTubeCommentPickerClient";
import styles from "./page.module.css";
import { getToolTestimonials } from "@/lib/tool-testimonials";
import { getToolRating } from "@/lib/tool-ratings";

const canonicalUrl = buildCanonicalUrl("/youtube-comment-picker");

export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolBySlug("youtube-comment-picker")!;

  return {
    ...createPageMetadata({
      title: `${tool.title} - Free API Tool`,
      description: tool.shortDescription,
      path: `/${tool.slug}`,
      type: "article",
      imageAlt: `${tool.title} by The Rehan Kadri`,
      keywords: [
        tool.keyword,
        `free ${tool.keyword}`,
        "youtube giveaway picker",
        "youtube random comment picker",
        tool.title.toLowerCase(),
      ],
    }),
    category: "Tools",
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
  };
}

export default async function YouTubeCommentPickerPage() {
  const tool = getToolBySlug("youtube-comment-picker")!;
  const faqEntries = getGenericToolFaq(tool);
  const testimonials = getToolTestimonials(tool.slug, tool.title);
  const ratingData = await getToolRating(tool.slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.title,
        applicationCategory: "WebApplication",
        applicationSubCategory: tool.category,
        operatingSystem: "Web",
        url: canonicalUrl,
        description: tool.shortDescription,
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
          `Free ${tool.title}`,
          "No login required",
          "Automated API fetching",
          "Random fairness",
        ],
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqEntries.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.answer,
          },
        })),
      },
      {
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
            name: tool.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
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
            <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
              <Link href="/tools">Tools</Link>
              <span>/</span>
            </nav>
            <h1 className={`${styles.title} ${styles.singleLineToolTitle}`}>{tool.title}</h1>
            <p className={styles.subtitle}>{tool.shortDescription}</p>

            <div className={styles.tabRow}>
              <span className={styles.tabItem}>{tool.category.replace("YouTube ", "")}</span>
            </div>

            {/* The Custom Client Component */}
            <YouTubeCommentPickerClient />
          </div>
        </div>
      </section>

      <section className={styles.contentArea}>
        <div className={styles.articleProseShell}>
          <GenericToolArticle tool={tool} />
        </div>
      </section>
    </main>
  );
}
