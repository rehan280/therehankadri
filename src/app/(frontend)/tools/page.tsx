import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tags } from "lucide-react";
import {
  ORGANIZATION_ID,
  SITE_URL,
  buildCanonicalUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/lib/seo";
import styles from "./page.module.css";

const canonicalUrl = buildCanonicalUrl("/tools");

const tools = [
  {
    name: "YouTube Tag Generator",
    href: "/youtube-tags-generator",
    eyebrow: "YouTube SEO Tool",
    description:
      "Generate focused YouTube tags from a title or keyword with a fast workflow built for creators and marketers.",
    highlights: ["No login required", "Free to use", "Built for YouTube SEO"],
    icon: Tags,
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "SEO Tools | Rehan Kadri",
  description:
    "Browse free SEO and growth tools from Rehan Kadri, starting with the YouTube Tag Generator for creators and marketers.",
  path: "/tools",
  imageAlt: "SEO tools by Rehan Kadri",
  keywords: [
    "SEO tools",
    "free SEO tools",
    "Rehan Kadri tools",
    "YouTube tag generator",
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
        name: tool.name,
        url: buildCanonicalUrl(tool.href),
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
            </div>

            <div className={styles.toolsGrid}>
              {tools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <article key={tool.href} className={styles.toolCard}>
                    <div className={styles.toolTop}>
                      <span className={styles.toolEyebrow}>{tool.eyebrow}</span>
                      <span className={styles.toolIconWrap}>
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                    </div>

                    <h3 className={styles.toolTitle}>{tool.name}</h3>
                    <p className={styles.toolDescription}>{tool.description}</p>

                    <div className={styles.toolHighlights}>
                      {tool.highlights.map((highlight) => (
                        <span key={highlight} className={styles.toolChip}>
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <Link href={tool.href} className={styles.toolLink}>
                      <span>Open Tool</span>
                      <ArrowRight size={17} strokeWidth={2.2} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
