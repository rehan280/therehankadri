import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import ArticleSocialShare from "@/components/blog/ArticleSocialShare";
import PremiumFaq from "@/components/content/PremiumFaq";
import {
  defaultBlogAuthor,
} from "@/lib/blog";
import { getAllBlogPosts } from "@/lib/blog-content";
import {
  PERSON_ID,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
  createArticleMetadata,
  createPublisherJsonLd,
} from "@/lib/seo";
import blogStyles from "../../../blog/blog.module.css";
import themeStyles from "../youtube-stats-page.module.css";
import articleStyles from "./page.module.css";
import {
  type ArticleBlock,
  getSubscribersNeededToMakeMoneyArticle,
} from "./article-content";

const PAGE_PATH = "/stats/youtube/subscribers-needed-to-make-money";
const PAGE_SLUG = "youtube-subscribers-needed-to-make-money";
const PAGE_TITLE = "How Many YouTube Subscribers Needed to Make Money in 2026?";
const PAGE_IMAGE_PATH =
  "/stats/youtube/subscribers-needed-to-make-money/youtube-subscribers-needed-to-make-money.webp";
const HERO_IMAGE_PATH =
  "/stats/youtube/subscribers-needed-to-make-money/youtube-subscribers-needed-to-make-money.svg";
const PAGE_IMAGE_ALT = "YouTube subscribers needed to make money article graphic";
const PUBLISHED_AT = "2026-04-14";
const MODIFIED_AT = "2026-04-15";
const YOUTUBE_HERO_BACKGROUND =
  "linear-gradient(135deg, #ff4b43 0%, #ff3838 48%, #ff2923 100%)";
const SECTION_TITLE_OVERRIDES: Record<string, string> = {
  "youtube-partner-program-requirements-in-2026-both-tiers-explained":
    "YouTube Partner Program Requirements in 2026",
  "how-much-do-youtubers-actually-earn-realistic-2026-data-by-subscriber-count":
    "How Much YouTubers Actually Earn in 2026",
  "cpm-vs-rpm-the-number-that-actually-hits-your-bank-account":
    "CPM vs. RPM on YouTube",
  "how-geography-determines-your-youtube-income-ceiling":
    "How Geography Affects YouTube Earnings",
  "youtube-shorts-vs-long-form-the-income-reality-in-2026":
    "YouTube Shorts vs. Long-Form Earnings",
  "the-6-revenue-streams-that-actually-build-youtube-income":
    "6 Revenue Streams That Build YouTube Income",
  "ai-content-on-youtube-in-2026-the-exact-rules":
    "AI Content Rules on YouTube in 2026",
  "the-pre-1k-revenue-blueprint-start-earning-before-you-hit-1-000-subscribers":
    "How to Earn Before 1,000 Subscribers",
  "how-many-views-do-you-need-to-make-1-000-month-on-youtube":
    "How Many Views to Make $1,000 a Month on YouTube",
  "realistic-timeline-to-making-money-on-youtube-month-by-month":
    "Realistic Timeline to Make Money on YouTube",
  "5-youtube-money-myths-costing-new-creators-real-income":
    "5 YouTube Money Myths",
};

function formatPublishedDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function getReadTime(wordCount: number) {
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return {
    minutes,
    label: `${minutes} min read`,
  };
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const fragments: ReactNode[] = [];
  const pattern = /(\*\*.+?\*\*|\*.+?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      fragments.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const content = token.startsWith("**") ? token.slice(2, -2) : token.slice(1, -1);

    if (token.startsWith("**")) {
      fragments.push(<strong key={`${content}-${match.index}`}>{content}</strong>);
    } else {
      fragments.push(<em key={`${content}-${match.index}`}>{content}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    fragments.push(text.slice(lastIndex));
  }

  return fragments.length ? fragments : [text];
}

function getStandaloneStrongText(text: string) {
  const match = text.trim().match(/^\*\*(.+?)\*\*$/);
  return match ? match[1] : null;
}

function getSectionDisplayTitle(sectionId: string, fallbackTitle: string) {
  return SECTION_TITLE_OVERRIDES[sectionId] ?? fallbackTitle;
}

function renderBlock(block: ArticleBlock, key: string) {
  switch (block.type) {
    case "paragraph":
      return <p key={key}>{renderInlineMarkdown(block.text)}</p>;
    case "subheading":
      return (
        <h3 key={key} className={blogStyles.richTextSubheading}>
          {renderInlineMarkdown(block.text)}
        </h3>
      );
    case "rule":
      return <div key={key} className={articleStyles.articleRule} aria-hidden="true" />;
    case "list":
      return (
        <ul key={key} className={blogStyles.articleList}>
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    case "ordered-list":
      return (
        <ol key={key} className={articleStyles.articleOrderedList}>
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div key={key} className={articleStyles.articleTableWrap}>
          <table className={articleStyles.articleTable}>
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header} scope="col">
                    {renderInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${key}-${rowIndex}`}>
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th key={`${cell}-${cellIndex}`} scope="row">
                        {renderInlineMarkdown(cell)}
                      </th>
                    ) : (
                      <td key={`${cell}-${cellIndex}`}>{renderInlineMarkdown(cell)}</td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function renderSectionBlocks(blocks: ArticleBlock[], sectionId: string) {
  const nodes: ReactNode[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const nextBlock = blocks[index + 1];

    if (
      block?.type === "paragraph" &&
      nextBlock?.type === "paragraph"
    ) {
      const title = getStandaloneStrongText(block.text);

      if (title) {
        const labelMatch = title.match(/^(Myth #\d+):\s*(.+)$/i);
        nodes.push(
          <article
            key={`${sectionId}-highlight-${index}`}
            className={articleStyles.highlightCard}
          >
            <span className={articleStyles.highlightLabel}>
              {labelMatch?.[1] ?? "Key Point"}
            </span>
            <h3 className={articleStyles.highlightTitle}>
              {labelMatch?.[2] ?? title}
            </h3>
            <div className={articleStyles.highlightBody}>
              {renderBlock(nextBlock, `${sectionId}-highlight-body-${index + 1}`)}
            </div>
          </article>
        );
        index += 1;
        continue;
      }
    }

    nodes.push(renderBlock(block, `${sectionId}-${block.type}-${index}`));
  }

  return nodes;
}

export async function generateMetadata(): Promise<Metadata> {
  const article = await getSubscribersNeededToMakeMoneyArticle();

  return createArticleMetadata({
    title: PAGE_TITLE,
    description: article.description,
    path: PAGE_PATH,
    imagePath: PAGE_IMAGE_PATH,
    imageAlt: PAGE_IMAGE_ALT,
    publishedTime: `${PUBLISHED_AT}T00:00:00Z`,
    modifiedTime: `${MODIFIED_AT}T00:00:00Z`,
    authors: [defaultBlogAuthor.name],
    keywords: [
      "how many youtube subscribers to make money",
      "youtube monetization requirements 2026",
      "how many subscribers to get paid on youtube",
      "youtube partner program requirements",
      "youtube rpm 2026",
      "youtube adsense earnings",
    ],
  });
}

export default async function SubscribersNeededToMakeMoneyPage() {
  const [article, allPosts] = await Promise.all([
    getSubscribersNeededToMakeMoneyArticle(),
    getAllBlogPosts(),
  ]);

  const postAuthor = defaultBlogAuthor;
  const authorArticleCount = (allPosts ?? []).filter(
    (entry) => (entry.author ?? defaultBlogAuthor).name === postAuthor.name
  ).length;
  const canonicalUrl = buildCanonicalUrl(PAGE_PATH);
  const socialImage = buildAbsoluteImageUrl(PAGE_IMAGE_PATH);
  const readTime = getReadTime(article.wordCount);
  const heroSectionStyle = {
    "--post-hero-custom-background": YOUTUBE_HERO_BACKGROUND,
  } as CSSProperties;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: buildCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stats",
        item: buildCanonicalUrl("/stats"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "YouTube",
        item: buildCanonicalUrl("/stats/youtube"),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: PAGE_TITLE,
        item: canonicalUrl,
      },
    ],
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: PAGE_TITLE,
    description: article.description,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    datePublished: `${PUBLISHED_AT}T00:00:00Z`,
    dateModified: `${MODIFIED_AT}T00:00:00Z`,
    articleSection: "YouTube Statistics",
    wordCount: article.wordCount,
    timeRequired: `PT${readTime.minutes}M`,
    image: [socialImage],
    author: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: postAuthor.name,
      url: postAuthor.socials?.linkedin,
    },
    publisher: createPublisherJsonLd(),
  };
  const faqJsonLd = article.faqEntries.length
    ? {
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
      }
    : null;
  const faqSection = article.faqEntries.length ? (
    <PremiumFaq
      id="faq"
      title="Frequently Asked Questions"
      eyebrow={null}
      intro="Quick answers to the most common questions from this article."
      className={`${blogStyles.articleFaqSection} ${themeStyles.faqTheme}`}
      items={article.faqEntries.map((entry) => ({
        question: entry.question,
        answer: entry.answer,
      }))}
    />
  ) : null;
  const tableOfContentsItems = [
    ...article.sections
      .filter((section) => section.id !== "frequently-asked-questions-faq")
      .map((section) => ({
        id: section.id,
        title: getSectionDisplayTitle(section.id, section.title),
      })),
    ...(article.faqEntries.length
      ? [
          {
            id: "faq",
            title: "Frequently Asked Questions",
          },
        ]
      : []),
  ];

  return (
    <main className={`${blogStyles.page} ${blogStyles.postPage} ${themeStyles.pageTheme}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}

      <section
        className={`${blogStyles.hero} ${blogStyles.postHero} ${blogStyles.postHeroFeature} ${blogStyles.postHeroCustomBackground}`}
        style={heroSectionStyle}
      >
        <div className={`${blogStyles.heroInner} ${blogStyles.postHeroInner} ${blogStyles.postHeroGrid}`}>
          <div className={blogStyles.postHeroContent}>
            <h1 className={`${blogStyles.postHeroTitle} ${blogStyles.postHeroTitleSplit}`}>
              {PAGE_TITLE}
            </h1>

            <div className={blogStyles.authorRow}>
              <div className={blogStyles.authorIdentity}>
                <div className={blogStyles.authorText}>
                  <strong>By {postAuthor.name}</strong>
                </div>
              </div>

              <div className={blogStyles.postMetaRow}>
                <span className={`${blogStyles.postMetaItem} ${themeStyles.postMetaItem}`}>
                  <CalendarDays size={16} strokeWidth={2.1} />
                  <span>Published: {formatPublishedDate(PUBLISHED_AT)}</span>
                </span>
                <span className={`${blogStyles.postMetaItem} ${themeStyles.postMetaItem}`}>
                  <Clock3 size={16} strokeWidth={2.1} />
                  <span>{readTime.label}</span>
                </span>
              </div>
            </div>
          </div>

          <div className={blogStyles.postHeroArtworkWrap}>
            <div className={blogStyles.postHeroArtworkFrame}>
              <Image
                src={HERO_IMAGE_PATH}
                alt={PAGE_IMAGE_ALT}
                fill
                preload
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 44vw, 620px"
                className={blogStyles.postHeroArtwork}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={blogStyles.postSection}>
        <div className={blogStyles.postShell}>
          <div className={blogStyles.postGrid}>
            <aside className={blogStyles.sidebar}>
              <div className={`${blogStyles.sidebarStack} ${themeStyles.tocTheme}`}>
                <BlogTableOfContents items={tableOfContentsItems} />
              </div>
            </aside>

            <article className={`${blogStyles.articleCopy} authority-post-copy`}>
              <div className={`${blogStyles.articleProse} ${themeStyles.articleProse}`}>
                {article.introBlocks.map((block, index) =>
                  renderBlock(block, `intro-${block.type}-${index}`)
                )}

                {article.sections
                  .filter((section) => section.id !== "frequently-asked-questions-faq")
                  .map((section) => (
                    <section key={section.id} id={section.id} className={blogStyles.articleSection}>
                      <h2>{getSectionDisplayTitle(section.id, section.title)}</h2>
                      <div
                        className={`${articleStyles.articleFlow}${
                          section.id === "5-youtube-money-myths-costing-new-creators-real-income"
                            ? ` ${articleStyles.highlightStack}`
                            : ""
                        }`}
                      >
                        {renderSectionBlocks(section.blocks, section.id)}
                      </div>
                    </section>
                  ))}

                {faqSection}
              </div>

              <aside className={`${blogStyles.shareRail} ${blogStyles.shareRailMobile}`}>
                <div className={blogStyles.shareRailInner}>
                  <ArticleSocialShare
                    slug={PAGE_SLUG}
                    title={PAGE_TITLE}
                    url={canonicalUrl}
                  />
                </div>
              </aside>

              <aside className={`${blogStyles.articleAuthorCard} ${themeStyles.articleAuthorCard}`}>
                <div className={blogStyles.windowBar}>
                  <div className={blogStyles.windowDots} aria-hidden="true">
                    <span className={`${blogStyles.windowDot} ${blogStyles.windowDotOrange}`} />
                    <span className={`${blogStyles.windowDot} ${blogStyles.windowDotAmber}`} />
                    <span className={`${blogStyles.windowDot} ${blogStyles.windowDotGreen}`} />
                  </div>
                  <span className={blogStyles.windowFile}>whois --author rehan-kadri</span>
                </div>

                <div className={blogStyles.articleAuthorInner}>
                  <div className={blogStyles.articleAuthorIdentity}>
                    <Image
                      src={postAuthor.image}
                      alt={postAuthor.name}
                      width={150}
                      height={150}
                      sizes="(max-width: 640px) 112px, 150px"
                      className={blogStyles.articleAuthorImage}
                    />
                    <div className={blogStyles.articleAuthorIdentityText}>
                      <strong>{postAuthor.name}</strong>
                      <span>{postAuthor.role}</span>
                    </div>
                  </div>

                  <div className={blogStyles.articleAuthorInfo}>
                    <p>{postAuthor.bio}</p>
                    <div className={blogStyles.articleAuthorFooter}>
                      <div className={blogStyles.articleAuthorSocials}>
                        {postAuthor.socials?.twitter ? (
                          <Link
                            href={postAuthor.socials.twitter}
                            className={`${blogStyles.articleAuthorSocialLink} ${themeStyles.articleAuthorSocialLink}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Twitter size={14} strokeWidth={2} />
                            <span>Twitter</span>
                          </Link>
                        ) : null}
                        {postAuthor.socials?.linkedin ? (
                          <Link
                            href={postAuthor.socials.linkedin}
                            className={`${blogStyles.articleAuthorSocialLink} ${themeStyles.articleAuthorSocialLink}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Linkedin size={14} strokeWidth={2} />
                            <span>LinkedIn</span>
                          </Link>
                        ) : null}
                        {postAuthor.socials?.instagram ? (
                          <Link
                            href={postAuthor.socials.instagram}
                            className={`${blogStyles.articleAuthorSocialLink} ${themeStyles.articleAuthorSocialLink}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Instagram size={14} strokeWidth={2} />
                            <span>Instagram</span>
                          </Link>
                        ) : null}
                      </div>
                      <span className={blogStyles.articleAuthorCount}>
                        {authorArticleCount} articles
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </article>

            <aside className={`${blogStyles.sidebar} ${blogStyles.shareRail} ${blogStyles.shareRailDesktop}`}>
              <div className={`${blogStyles.sidebarStack} ${blogStyles.shareRailInner}`}>
                <ArticleSocialShare
                  slug={PAGE_SLUG}
                  title={PAGE_TITLE}
                  url={canonicalUrl}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={blogStyles.relatedSection}>
        <div className={blogStyles.relatedShell}>
          <div className={blogStyles.relatedHeader}>
            <span className={`${blogStyles.relatedLabel} ${themeStyles.relatedLabel}`}>
              More from the blog
            </span>
            <h2>Keep reading</h2>
          </div>

          <div className={blogStyles.articleGrid}>
            {[
              {
                href: "/stats/youtube/channel",
                eyebrow: "YouTube Statistics",
                title: "YouTube Channel Statistics 2026",
                blurb:
                  "Platform-wide channel growth, Shorts momentum, revenue, and creator economy benchmarks.",
              },
              {
                href: "/stats/youtube/users",
                eyebrow: "YouTube Statistics",
                title: "How Many People Use YouTube in 2026?",
                blurb:
                  "Monthly users, country breakdowns, watch-time trends, CPM data, and platform economics.",
              },
            ].map((item) => (
              <article key={item.href} className={blogStyles.listingCard}>
                <span className={`${blogStyles.cardEyebrow} ${themeStyles.cardEyebrow}`}>
                  {item.eyebrow}
                </span>
                <h2>
                  <Link href={item.href}>{item.title}</Link>
                </h2>
                <p className={blogStyles.cardBlurb}>{item.blurb}</p>
                <div className={blogStyles.cardMeta}>
                  <span>YouTube stats</span>
                  <span>Research article</span>
                </div>
                <Link href={item.href} className={blogStyles.cardLink}>
                  <span>Read article</span>
                  <ArrowUpRight size={17} strokeWidth={2.2} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
