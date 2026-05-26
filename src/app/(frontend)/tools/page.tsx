import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Download,
  FileText,
  MessageCircle,
  Tags,
  Tv,
} from "lucide-react";
import {
  ORGANIZATION_ID,
  SITE_URL,
  buildCanonicalUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/lib/seo";
import { toolCatalog, toolCategories, type ToolCategory } from "@/lib/tool-catalog";
import styles from "./page.module.css";

const canonicalUrl = buildCanonicalUrl("/tools");
const tools = toolCatalog;

const categoryIcons: Record<ToolCategory, typeof Tags> = {
  "YouTube SEO & Optimization": Tags,
  "YouTube Analytics & Monetization": BarChart3,
  "YouTube Media Downloaders": Download,
  "Engagement & Interaction": MessageCircle,
  "YouTube Video & Channel Utilities": Tv,
  "Podcast Tools": FileText,
};

export const metadata: Metadata = createPageMetadata({
  title: "Free SEO Tools | Rehan Kadri",
  description:
    "Browse free creator tools from Rehan Kadri, including YouTube SEO, metadata, downloader, and podcast tools.",
  path: "/tools",
  imageAlt: "SEO tools by Rehan Kadri",
  keywords: [
    "SEO tools",
    "free SEO tools",
    "Rehan Kadri tools",
    "YouTube start time link generator",
    "YouTube tag generator",
    "YouTube tools",
    "creator tools",
    "podcast tools",
    "YouTube title extractor",
    "YouTube description extractor",
    "YouTube SEO tool",
  ],
});

export default function ToolsPage() {
  const toolsPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SEO Tools | Rehan Kadri",
    url: canonicalUrl,
    description:
      "A growing collection of free SEO and growth tools from Rehan Kadri.",
    about: {
      "@id": ORGANIZATION_ID,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.title,
        url: buildCanonicalUrl(`/${tool.slug}`),
      })),
    },
  };
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Tools", url: canonicalUrl },
  ]);
  const toolsStructuredData = {
    "@context": "https://schema.org",
    "@graph": [toolsPageJsonLd, breadcrumbJsonLd],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolsStructuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className={styles.heroSection}>
        <div className={styles.shell}>
          <div className={styles.heroShell}>
            <div className={styles.heroContent}>
              <span className={styles.kicker}>Tools Hub</span>
              <h1 className={styles.title}>Free SEO Tools</h1>
              <p className={styles.subtitle}>
                Explore practical SEO tools built to help creators and marketers move faster on keyword research, content execution, and YouTube growth.
              </p>
              <p className={styles.subtitle}>
                Each tool is built around one clear job, so you can test an idea, get useful output, and move on without a long setup flow.
              </p>

              <a href="#tools-directory" className={styles.heroButton}>
                <span>Explore Tools</span>
                <ArrowRight size={18} strokeWidth={2.1} />
              </a>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroArtwork}>
                <Image
                  src="/tools/therehankadri%20tools.png"
                  alt="Tools hub preview from The Rehan Kadri"
                  width={900}
                  height={700}
                  priority
                  sizes="(max-width: 960px) 100vw, 40vw"
                  className={styles.heroArtworkImage}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tools-directory" className={styles.toolsSection}>
        <div className={styles.toolsShell}>
          <div className={styles.toolsBackdrop} aria-hidden="true" />
          <div className={styles.toolsInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionLabel}>Available Now</span>
              <h2 className={styles.sectionTitle}>Start with the tool that already does real work.</h2>
              <p className={styles.subtitle}>
                The goal here is practical utility: focused helpers that shorten YouTube research, creator planning, and podcast publishing work.
              </p>
            </div>

            <div className={styles.categoryStack}>
              {toolCategories.map((category) => {
                const categoryTools = toolCatalog.filter((tool) => tool.category === category);
                const Icon = categoryIcons[category];

                return (
                  <section key={category} className={styles.categorySection}>
                    <div className={styles.categoryHeader}>
                      <span className={styles.toolIconWrap}>
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <h3>{category}</h3>
                    </div>

                    <div className={styles.toolsGrid}>
                      {categoryTools.map((tool) => (
                        <article key={tool.slug} className={styles.toolCard}>
                          <div className={styles.toolTop}>
                            <span className={styles.toolEyebrow}>{tool.keyword}</span>
                            <span className={styles.toolIconWrap}>
                              <Icon size={20} strokeWidth={2.2} />
                            </span>
                          </div>

                          <h4 className={styles.toolTitle}>{tool.title}</h4>
                          <p className={styles.toolDescription}>{tool.shortDescription}</p>

                          <div className={styles.toolHighlights}>
                            {tool.highlights.map((highlight) => (
                              <span key={highlight} className={styles.toolChip}>
                                {highlight}
                              </span>
                            ))}
                          </div>

                          <Link href={`/${tool.slug}`} className={styles.toolLink}>
                            <span>Open Tool</span>
                            <ArrowRight size={17} strokeWidth={2.2} />
                          </Link>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
