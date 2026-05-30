import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RelatedTools from "@/components/tools/RelatedTools";
import {
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
  createPageMetadata,
} from "@/lib/seo";
import {
  getToolBySlug,
  getToolSeoDescription,
  getToolSeoTitle,
} from "@/lib/tool-catalog";
import { getToolArticleContent } from "@/lib/tool-article-content";
import { getToolRating } from "@/lib/tool-ratings";
import { getToolTestimonials } from "@/lib/tool-testimonials";
import styles from "../youtube-tags-generator/page.module.css";
import GenericToolArticle, { getGenericToolFaq } from "./GenericToolArticle";
import GenericToolClient from "./GenericToolClient";

export async function generateGenericToolMetadata(toolSlug: string): Promise<Metadata> {
  const tool = getToolBySlug(toolSlug);

  if (!tool || tool.kind === "existing") {
    return {};
  }

  return {
    ...createPageMetadata({
      title: getToolSeoTitle(tool),
      description: getToolSeoDescription(tool),
      path: `/${tool.slug}`,
      type: "article",
      imageAlt: `${tool.title} by The Rehan Kadri`,
      keywords: [
        tool.keyword,
        `free ${tool.keyword}`,
        tool.title.toLowerCase(),
        tool.category.toLowerCase(),
      ],
    }),
    category: "Tools",
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
  };
}

export default async function GenericToolPage({ toolSlug }: { toolSlug: string }) {
  const tool = getToolBySlug(toolSlug);

  if (!tool || tool.kind === "existing") {
    notFound();
  }

  const canonicalUrl = buildCanonicalUrl(`/${tool.slug}`);
  const faqEntries = await getGenericToolFaq(tool);
  const article = await getToolArticleContent(tool.slug);
  const testimonials = getToolTestimonials(tool.slug, tool.title);
  const ratingData = await getToolRating(tool.slug);
  const pageId = `${canonicalUrl}#webpage`;
  const appId = `${canonicalUrl}#softwareapplication`;
  const articleId = `${canonicalUrl}#article`;
  const faqId = `${canonicalUrl}#faq`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageId,
        url: canonicalUrl,
        name: getToolSeoTitle(tool),
        description: tool.shortDescription,
        inLanguage: "en-US",
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        about: {
          "@id": appId,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: buildAbsoluteImageUrl(),
        },
        breadcrumb: {
          "@id": `${canonicalUrl}#breadcrumb`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": appId,
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
          tool.intro,
          ...tool.highlights,
          "No login required",
          "Copy-ready results",
          "Fast browser-based processing",
        ],
        mainEntityOfPage: {
          "@id": pageId,
        },
        publisher: {
          "@id": ORGANIZATION_ID,
        },
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        mainEntityOfPage: {
          "@id": pageId,
        },
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
        "@id": `${canonicalUrl}#breadcrumb`,
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
      {
        "@type": "Article",
        "@id": articleId,
        headline: article?.title || tool.title,
        description: tool.shortDescription,
        mainEntityOfPage: {
          "@id": pageId,
        },
        url: canonicalUrl,
        datePublished: "2026-05-26",
        dateModified: "2026-05-26",
        inLanguage: "en-US",
        articleSection: tool.category,
        keywords: [
          tool.keyword,
          `free ${tool.keyword}`,
          tool.title,
          ...tool.highlights,
        ],
        ...(article ? { wordCount: article.wordCount } : {}),
        author: {
          "@id": ORGANIZATION_ID,
        },
        publisher: {
          "@id": ORGANIZATION_ID,
        },
        image: [buildAbsoluteImageUrl()],
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
            <h1 className={`${styles.title} ${styles.singleLineToolTitle}`}>
              {tool.title}
            </h1>
            <p className={styles.subtitle}>{tool.shortDescription}</p>

            <div className={styles.tabRow}>
              <span className={styles.tabItem}>
                {tool.category.replace("YouTube ", "")}
              </span>
            </div>

            <GenericToolClient tool={tool} />
          </div>
        </div>
      </section>

      <GenericToolArticle tool={tool} />
      <RelatedTools currentToolSlug={tool.slug} category={tool.category} />
    </main>
  );
}
