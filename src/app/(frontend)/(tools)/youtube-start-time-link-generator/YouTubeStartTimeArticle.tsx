import Link from "next/link";
import ArticleSocialShare from "@/components/blog/ArticleSocialShare";
import { buildCanonicalUrl } from "@/lib/seo";
import blogStyles from "../../blog/blog.module.css";
import baseStyles from "../youtube-tags-generator/page.module.css";
import styles from "./page.module.css";
import type { YouTubeStartTimeArticle } from "./article";

const statCards = [
  {
    label: "Primary keyword",
    value: "Start time links",
    note: "Built around tool intent, timestamp intent, and mobile-first sharing intent.",
  },
  {
    label: "Best default format",
    value: "youtu.be?t=",
    note: "A short timestamp link is the cleanest sharing format for most people.",
  },
  {
    label: "Embed support",
    value: "Start + end",
    note: "End time works best in embeds, which is why the tool outputs both URL types.",
  },
];

const relatedTools = [
  {
    href: "/youtube-title-extractor",
    title: "YouTube Title Extractor",
    description: "Pull the exact public title from any YouTube video for CTR research.",
  },
  {
    href: "/youtube-description-extractor",
    title: "YouTube Description Extractor",
    description: "Extract descriptions, tags, timestamps, and public metadata from a video URL.",
  },
  {
    href: "/youtube-tags-generator",
    title: "YouTube Tag Generator",
    description: "Generate focused YouTube tags around a keyword or title.",
  },
];

export default function YouTubeStartTimeArticle({
  article,
}: {
  article: YouTubeStartTimeArticle;
}) {
  const canonicalUrl = buildCanonicalUrl("/youtube-start-time-link-generator");
  const shareTitle = "YouTube Start Time Link Generator - Free [2026]";

  return (
    <div className={blogStyles.postPage}>
      <section className={blogStyles.postSection} aria-label="YouTube start time link generator article">
        <div className={blogStyles.postShell}>
          <div className={`${blogStyles.postGrid} ${blogStyles.postGridNoSidebar}`}>
            <article
              className={`${blogStyles.articleCopy} ${baseStyles.centeredArticleCopy} authority-post-copy`}
            >
              <div className={`${blogStyles.articleProse} ${baseStyles.articleProseShell}`}>
                <div className={`${baseStyles.articleStatGrid} ${styles.startTimeStatGrid}`}>
                  {statCards.map((stat) => (
                    <article
                      key={stat.label}
                      className={`${baseStyles.articleStatCard} ${styles.startTimeStatCard}`}
                    >
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      <p>{stat.note}</p>
                    </article>
                  ))}
                </div>

                <section
                  id="youtube-start-time-link-generator-guide"
                  className={`${blogStyles.articleSection} ${baseStyles.articleSection}`}
                >
                  <div
                    className={styles.articleMarkdown}
                    dangerouslySetInnerHTML={{ __html: article.html }}
                  />
                </section>

                <section
                  className={`${blogStyles.articleSection} ${baseStyles.articleSection}`}
                  aria-label="Related tools"
                >
                  <h2>Related Tools</h2>
                  <div className={styles.relatedToolGrid}>
                    {relatedTools.map((tool) => (
                      <Link key={tool.href} href={tool.href} className={styles.relatedToolCard}>
                        <strong>{tool.title}</strong>
                        <span>{tool.description}</span>
                      </Link>
                    ))}
                  </div>
                </section>

                <aside className={`${blogStyles.shareRail} ${blogStyles.shareRailMobile}`}>
                  <div className={blogStyles.shareRailInner}>
                    <ArticleSocialShare
                      slug="youtube-start-time-link-generator"
                      title={shareTitle}
                      url={canonicalUrl}
                    />
                  </div>
                </aside>
              </div>
            </article>

            <aside className={`${blogStyles.sidebar} ${blogStyles.shareRail} ${blogStyles.shareRailDesktop}`}>
              <div className={`${blogStyles.sidebarStack} ${blogStyles.shareRailInner}`}>
                <ArticleSocialShare
                  slug="youtube-start-time-link-generator"
                  title={shareTitle}
                  url={canonicalUrl}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
