import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SITE_NAME,
  SITE_URL,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
  createPageMetadata,
} from "@/lib/seo";
import { getToolBySlug, toolCatalog } from "@/lib/tool-catalog";
import GenericToolArticle, { getGenericToolFaq } from "../_generic/GenericToolArticle";
import GenericToolClient from "../_generic/GenericToolClient";
import styles from "../youtube-tags-generator/page.module.css";

type Props = {
  params: Promise<{
    toolSlug: string;
  }>;
};

export function generateStaticParams() {
  return toolCatalog
    .filter((tool) => tool.kind !== "existing")
    .map((tool) => ({ toolSlug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);

  if (!tool || tool.kind === "existing") {
    return {};
  }

  return {
    ...createPageMetadata({
      title: `${tool.title} - Free Tool`,
      description: `${tool.shortDescription} Free ${tool.keyword} from The Rehan Kadri tools hub.`,
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

export default async function GenericToolPage({ params }: Props) {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);

  if (!tool || tool.kind === "existing") {
    notFound();
  }

  const canonicalUrl = buildCanonicalUrl(`/${tool.slug}`);
  const faqEntries = getGenericToolFaq(tool);
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
      {
        "@type": "Article",
        headline: tool.title,
        description: tool.shortDescription,
        mainEntityOfPage: canonicalUrl,
        url: canonicalUrl,
        datePublished: "2026-05-26",
        dateModified: "2026-05-26",
        author: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
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
            <h1 className={`${styles.title} ${styles.singleLineToolTitle}`}>{tool.title}</h1>
            <p className={styles.subtitle}>{tool.shortDescription}</p>

            <div className={styles.tabRow}>
              <span className={styles.tabItem}>{tool.category.replace("YouTube ", "")}</span>
            </div>

            <GenericToolClient tool={tool} />
          </div>
        </div>
      </section>

      <GenericToolArticle tool={tool} />
    </main>
  );
}
