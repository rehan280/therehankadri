import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import BlogRichText from "@/components/blog/BlogRichText";
import YouTubeChannelStatisticsArticle, {
  youtubeChannelStatisticsHeadingItems,
  youtubeChannelStatisticsWordCount,
} from "@/components/blog/posts/YouTubeChannelStatisticsArticle";
import YouTubeUsersArticle from "@/components/blog/posts/YouTubeUsersArticle";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import ArticleSocialShare from "@/components/blog/ArticleSocialShare";
import PremiumFaq from "@/components/content/PremiumFaq";
import { countRichTextWords, getRichTextHeadingItems } from "@/lib/blog-rich-text";
import { getYouTubeUsersArticleData } from "@/lib/youtube-users-article";
import {
  type BlogBlock,
  type BlogPost,
  defaultBlogAuthor,
  formatBlogDate,
  getBlogReadTime,
} from "@/lib/blog";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/lib/blog-content";
import {
  createArticleMetadata,
  createPublisherJsonLd,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
} from "@/lib/seo";
import {
  getPostPath,
  YOUTUBE_USERS_SLUG,
} from "@/lib/post-paths";
import { YOUTUBE_CHANNEL_STATISTICS_SLUG } from "@/lib/post-paths";
import styles from "../../../blog/blog.module.css";
import themeStyles from "../youtube-stats-page.module.css";

const YOUTUBE_HERO_BACKGROUND = "linear-gradient(135deg, #ff4b43 0%, #ff3838 48%, #ff2923 100%)";

function isYouTubePost(slug: string) {
  return slug.startsWith("youtube");
}
export async function generateMetadata(): Promise<Metadata> {
  const post = await getBlogPostBySlug(YOUTUBE_USERS_SLUG);

  if (!post) {
    return {
      title: "Blog Post | The Rehan Kadri",
    };
  }

  const currentPost = post as BlogPost;
  const postAuthor = currentPost.author ?? defaultBlogAuthor;
  const socialImage = currentPost.coverImage ?? undefined;

  return createArticleMetadata({
    title: currentPost.metaTitle ?? currentPost.title,
    description: currentPost.seoDescription,
    path: getPostPath(currentPost.slug),
    keywords: currentPost.keywords,
    imagePath: socialImage,
    imageAlt: currentPost.title,
    publishedTime: `${currentPost.publishedAt}T00:00:00Z`,
    authors: [postAuthor.name],
  });
}



function buildHeroTitleLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const joinedLength = (items: string[]) => items.join(" ").length;
  const longestWordLength = Math.max(...words.map((word) => word.length));
  const buildLineGroups = (lineCount: number, maxLength: number) => {
    const groups: string[][][] = [];

    const visit = (startIndex: number, remainingLines: number, current: string[][]) => {
      if (remainingLines === 1) {
        const lastLine = words.slice(startIndex);
        if (lastLine.length === 0 || joinedLength(lastLine) > maxLength) return;
        groups.push([...current, lastLine]);
        return;
      }

      const maxEnd = words.length - remainingLines + 1;
      for (let endIndex = startIndex + 1; endIndex <= maxEnd; endIndex += 1) {
        const nextLine = words.slice(startIndex, endIndex);
        if (joinedLength(nextLine) > maxLength) break;
        visit(endIndex, remainingLines - 1, [...current, nextLine]);
      }
    };

    visit(0, lineCount, []);
    return groups;
  };

  if (words.length <= 3) return [title];
  if (longestWordLength > 18) return [title];

  const scoreLines = (lineGroups: string[][]) => {
    const lengths = lineGroups.map((line) => joinedLength(line));
    const wordsPerLine = lineGroups.map((line) => line.length);
    const maxLength = Math.max(...lengths);
    const minLength = Math.min(...lengths);
    const balancePenalty = maxLength - minLength;
    const orphanPenalty = lengths[lengths.length - 1] < 7 ? 18 : 0;
    const singleWordLastPenalty = wordsPerLine[wordsPerLine.length - 1] === 1 ? 8 : 0;
    const increasingPenalty = lengths.slice(1).reduce((total, length, index) => {
      const previous = lengths[index];
      return total + (length > previous ? (length - previous) * 2.5 : 0);
    }, 0);
    const squarePenalty =
      lineGroups.length >= 4 && maxLength - minLength < 8 ? 18 : 0;
    const bottomTooLongPenalty =
      lineGroups.length >= 3 && lengths[lengths.length - 1] > lengths[0] * 0.92 ? 12 : 0;
    const taperPenalty =
      lineGroups.length >= 3 && lengths[0] - lengths[lengths.length - 1] < 6 ? 10 : 0;
    const longLinePenalty = lengths.reduce((total, length) => {
      if (length > 30) return total + (length - 30) * 12;
      if (length > 28) return total + (length - 28) * 7;
      if (length > 26) return total + (length - 26) * 4;
      return total;
    }, 0);
    const twoLinePreference = lineGroups.length === 2 && maxLength <= 30 ? -18 : 0;
    const threeLinePreference = lineGroups.length === 3 && maxLength <= 24 ? -8 : 0;
    const lineCountPenalty =
      lineGroups.length === 2 ? 0 : lineGroups.length === 3 ? 10 : 36;

    return (
      balancePenalty +
      orphanPenalty +
      singleWordLastPenalty +
      increasingPenalty +
      squarePenalty +
      bottomTooLongPenalty +
      taperPenalty +
      longLinePenalty +
      twoLinePreference +
      threeLinePreference +
      lineCountPenalty
    );
  };

  const candidateGroups = [...buildLineGroups(2, 28), ...buildLineGroups(3, 24)];
  if (candidateGroups.length === 0) return [title];

  const best = candidateGroups.reduce<string[][] | null>((currentBest, candidate) => {
    if (!currentBest) return candidate;
    return scoreLines(candidate) < scoreLines(currentBest) ? candidate : currentBest;
  }, null);

  return best ? best.map((line) => line.join(" ")) : [title];
}

function getHeroLineClass(index: number, totalLines: number) {
  if (totalLines <= 1) return styles.postHeroLineSingle;
  if (totalLines === 2) {
    return index === 0 ? styles.postHeroLineTop : styles.postHeroLineMiddle;
  }
  if (index === 0) return styles.postHeroLineTop;
  if (index === 1) return styles.postHeroLineMiddle;
  return styles.postHeroLineBottom;
}

function renderBlock(block: BlogBlock, key: string) {
  switch (block.type) {
    case "paragraph":
      return <p key={key}>{block.text}</p>;
    case "list":
      return (
        <ul key={key} className={styles.articleList}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <aside key={key} className={styles.callout}>
          <strong>{block.title}</strong>
          <p>{block.body}</p>
        </aside>
      );
    case "quote":
      return (
        <blockquote key={key} className={styles.quoteBlock}>
          <p>{block.text}</p>
          <cite>{block.author}</cite>
        </blockquote>
      );
  }
}

function getWordCountForPost(post: BlogPost) {
  if (post.slug === "youtube-users") {
    return 4814;
  }

  if (post.slug === YOUTUBE_CHANNEL_STATISTICS_SLUG) {
    return youtubeChannelStatisticsWordCount;
  }

  if (post.body) {
    return countRichTextWords(post.body);
  }

  const introWords = post.intro
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const sectionWords = post.sections
    .flatMap((section) => [
      section.title,
      ...section.blocks.flatMap((block) => {
        switch (block.type) {
          case "paragraph":
            return [block.text];
          case "list":
            return block.items;
          case "callout":
            return [block.title, block.body];
          case "quote":
            return [block.text, block.author];
        }
      }),
    ])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return introWords + sectionWords;
}

export default async function YouTubeStatsPage() {
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(YOUTUBE_USERS_SLUG),
    getAllBlogPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const currentPost = post as BlogPost;
  const customHero = isYouTubePost(currentPost.slug)
    ? currentPost.hero
      ? {
          ...currentPost.hero,
          background: YOUTUBE_HERO_BACKGROUND,
        }
      : {
          background: YOUTUBE_HERO_BACKGROUND,
        }
    : currentPost.hero;
  const hasFeatureHeroLayout = Boolean(customHero?.image);
  const heroSectionStyle = customHero?.background
    ? ({ "--post-hero-custom-background": customHero.background } as CSSProperties)
    : undefined;
  const normalizedPosts = allPosts as BlogPost[];
  const postAuthor = currentPost.author ?? defaultBlogAuthor;
  const relatedPosts = (await getRelatedBlogPosts(currentPost.slug)) as BlogPost[];
  const youtubeUsersArticleData =
    currentPost.slug === "youtube-users" ? await getYouTubeUsersArticleData() : null;
  const isYouTubeChannelStatisticsPost = currentPost.slug === YOUTUBE_CHANNEL_STATISTICS_SLUG;
  const heroTitleLines = buildHeroTitleLines(currentPost.title);
  const authorArticleCount = normalizedPosts.filter(
    (entry) => (entry.author ?? defaultBlogAuthor).name === postAuthor.name
  ).length;
  const postReadTime = getBlogReadTime(currentPost);
  const canonicalUrl = buildCanonicalUrl(getPostPath(currentPost.slug));
  const socialImage = buildAbsoluteImageUrl(currentPost.coverImage ?? undefined);
  const wordCount = getWordCountForPost(currentPost);
  const datePublished = `${currentPost.publishedAt}T00:00:00Z`;
  const dateModified = `${currentPost.modifiedAt ?? currentPost.publishedAt}T00:00:00Z`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: currentPost.metaTitle ?? currentPost.title,
    description: currentPost.seoDescription,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    datePublished,
    dateModified,
    articleSection: currentPost.category.name,
    keywords: currentPost.keywords?.join(", "),
    timeRequired: `PT${Number.parseInt(postReadTime, 10) || 1}M`,
    wordCount,
    image: [socialImage],
    author: {
      "@type": "Person",
      name: postAuthor.name,
      url: postAuthor.socials?.linkedin,
    },
    publisher: createPublisherJsonLd(),
  };
  const faqJsonLd = currentPost.faqEntries?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: currentPost.faqEntries.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.answer,
          },
        })),
      }
    : null;
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
        name: currentPost.title,
        item: canonicalUrl,
      },
    ],
  };
  const faqSection = currentPost.faqEntries?.length ? (
    <PremiumFaq
      id="faq"
      title="Frequently Asked Questions"
      eyebrow={null}
      intro="Quick answers to the most common questions from this article."
      className={`${styles.articleFaqSection} ${themeStyles.faqTheme}`}
      items={currentPost.faqEntries.map((entry) => ({
        question: entry.question,
        answer: entry.answer,
      }))}
    />
  ) : null;
  const tableOfContentsItems = youtubeUsersArticleData
    ? youtubeUsersArticleData.headings
    : isYouTubeChannelStatisticsPost
      ? youtubeChannelStatisticsHeadingItems
      : currentPost.body
        ? getRichTextHeadingItems(currentPost.body)
        : currentPost.sections.map((section) => ({
            id: section.id,
            title: section.title,
          }));

  return (
    <main className={`${styles.page} ${styles.postPage} ${themeStyles.pageTheme}`}>
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
        className={`${styles.hero} ${styles.postHero}${hasFeatureHeroLayout ? ` ${styles.postHeroFeature}` : ""}${customHero?.background ? ` ${styles.postHeroCustomBackground}` : ""}`}
        style={heroSectionStyle}
      >
        <div
          className={`${styles.heroInner} ${styles.postHeroInner}${hasFeatureHeroLayout ? ` ${styles.postHeroGrid}` : ""}`}
        >
          <div className={styles.postHeroContent}>
            {hasFeatureHeroLayout ? null : (
              <span className={`${styles.heroPill} ${themeStyles.heroPill}`}>{currentPost.category.name}</span>
            )}
            <h1
              className={`${styles.postHeroTitle}${hasFeatureHeroLayout ? ` ${styles.postHeroTitleSplit}` : ""}`}
            >
              {hasFeatureHeroLayout ? (
                currentPost.title
              ) : (
                heroTitleLines.map((line, index) => (
                  <span
                    key={`${line}-${index}`}
                    className={`${styles.postHeroLine} ${getHeroLineClass(index, heroTitleLines.length)}`}
                  >
                    {line}
                  </span>
                ))
              )}
            </h1>

            <div className={styles.authorRow}>
              <div className={styles.authorIdentity}>
                {hasFeatureHeroLayout ? null : (
                  <div className={styles.authorAvatarWrap}>
                    <Image
                      src={postAuthor.image}
                      alt={postAuthor.name}
                      width={80}
                      height={80}
                      className={styles.authorAvatar}
                    />
                  </div>
                )}
                <div className={styles.authorText}>
                  <strong>By {postAuthor.name}</strong>
                  {hasFeatureHeroLayout ? null : <span>{postAuthor.role}</span>}
                </div>
              </div>

              <div className={styles.postMetaRow}>
                <span className={`${styles.postMetaItem} ${themeStyles.postMetaItem}`}>
                  <CalendarDays size={16} strokeWidth={2.1} />
                  <span>{formatBlogDate(currentPost.publishedAt)}</span>
                </span>
                <span className={`${styles.postMetaItem} ${themeStyles.postMetaItem}`}>
                  <Clock3 size={16} strokeWidth={2.1} />
                  <span>{postReadTime}</span>
                </span>
              </div>
            </div>
          </div>

          {customHero?.image ? (
            <div className={styles.postHeroArtworkWrap}>
              <div className={styles.postHeroArtworkFrame}>
                <Image
                  src={customHero.image}
                  alt={customHero.imageAlt ?? currentPost.title}
                  fill
                  preload
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 44vw, 620px"
                  className={styles.postHeroArtwork}
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.postSection}>
        <div className={styles.postShell}>
          <div
            className={`${styles.postGrid} ${tableOfContentsItems.length ? "" : styles.postGridNoSidebar}`}
          >
            {tableOfContentsItems.length ? (
              <aside className={styles.sidebar}>
                <div className={`${styles.sidebarStack} ${themeStyles.tocTheme}`}>
                  <BlogTableOfContents items={tableOfContentsItems} />
                </div>
              </aside>
            ) : null}

            <article className={`${styles.articleCopy} authority-post-copy`}>
              <div className={`${styles.articleProse} ${themeStyles.articleProse}`}>
                {youtubeUsersArticleData ? (
                  <YouTubeUsersArticle
                    data={youtubeUsersArticleData}
                    insertBeforeHeadingId="the-bottom-line"
                    insertNode={faqSection}
                  />
                ) : isYouTubeChannelStatisticsPost ? (
                  <>
                    <YouTubeChannelStatisticsArticle />
                    {faqSection}
                  </>
                ) : currentPost.body ? (
                  <BlogRichText
                    data={currentPost.body}
                    headingIds={tableOfContentsItems.map((item) => item.id)}
                  />
                ) : (
                  <>
                    {currentPost.intro.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}

                    {currentPost.sections.map((section) => (
                      <section key={section.id} id={section.id} className={styles.articleSection}>
                        <h2>{section.title}</h2>
                        {section.blocks.map((block, index) =>
                          renderBlock(block, `${section.id}-${index}`)
                        )}
                      </section>
                    ))}
                  </>
                )}

                {!youtubeUsersArticleData && !isYouTubeChannelStatisticsPost ? faqSection : null}
              </div>

              <aside className={`${styles.shareRail} ${styles.shareRailMobile}`}>
                <div className={styles.shareRailInner}>
                  <ArticleSocialShare
                    slug={currentPost.slug}
                    title={currentPost.metaTitle ?? currentPost.title}
                    url={canonicalUrl}
                  />
                </div>
              </aside>

              <aside className={`${styles.articleAuthorCard} ${themeStyles.articleAuthorCard}`}>
                <div className={styles.windowBar}>
                  <div className={styles.windowDots} aria-hidden="true">
                    <span className={`${styles.windowDot} ${styles.windowDotOrange}`} />
                    <span className={`${styles.windowDot} ${styles.windowDotAmber}`} />
                    <span className={`${styles.windowDot} ${styles.windowDotGreen}`} />
                  </div>
                  <span className={styles.windowFile}>whois --author rehan-kadri</span>
                </div>

                <div className={styles.articleAuthorInner}>
                  <div className={styles.articleAuthorIdentity}>
                    <Image
                      src={postAuthor.image}
                      alt={postAuthor.name}
                      width={150}
                      height={150}
                      className={styles.articleAuthorImage}
                    />
                    <div className={styles.articleAuthorIdentityText}>
                      <strong>{postAuthor.name}</strong>
                      <span>{postAuthor.role}</span>
                    </div>
                  </div>

                  <div className={styles.articleAuthorInfo}>
                    <p>{postAuthor.bio}</p>
                    <div className={styles.articleAuthorFooter}>
                      <div className={styles.articleAuthorSocials}>
                        {postAuthor.socials?.twitter ? (
                          <Link href={postAuthor.socials.twitter} className={`${styles.articleAuthorSocialLink} ${themeStyles.articleAuthorSocialLink}`} target="_blank" rel="noreferrer">
                            <Twitter size={14} strokeWidth={2} />
                            <span>Twitter</span>
                          </Link>
                        ) : null}
                        {postAuthor.socials?.linkedin ? (
                          <Link href={postAuthor.socials.linkedin} className={`${styles.articleAuthorSocialLink} ${themeStyles.articleAuthorSocialLink}`} target="_blank" rel="noreferrer">
                            <Linkedin size={14} strokeWidth={2} />
                            <span>LinkedIn</span>
                          </Link>
                        ) : null}
                        {postAuthor.socials?.instagram ? (
                          <Link href={postAuthor.socials.instagram} className={`${styles.articleAuthorSocialLink} ${themeStyles.articleAuthorSocialLink}`} target="_blank" rel="noreferrer">
                            <Instagram size={14} strokeWidth={2} />
                            <span>Instagram</span>
                          </Link>
                        ) : null}
                      </div>
                      <span className={styles.articleAuthorCount}>{authorArticleCount} articles</span>
                    </div>
                  </div>
                </div>
              </aside>
            </article>

            <aside className={`${styles.sidebar} ${styles.shareRail} ${styles.shareRailDesktop}`}>
              <div className={`${styles.sidebarStack} ${styles.shareRailInner}`}>
                <ArticleSocialShare
                  slug={currentPost.slug}
                  title={currentPost.metaTitle ?? currentPost.title}
                  url={canonicalUrl}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {relatedPosts.length ? (
        <section className={styles.relatedSection}>
          <div className={styles.relatedShell}>
            <div className={styles.relatedHeader}>
              <span className={`${styles.relatedLabel} ${themeStyles.relatedLabel}`}>More from the blog</span>
              <h2>Keep reading</h2>
            </div>

            <div className={styles.articleGrid}>
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className={styles.listingCard}>
                  <span className={`${styles.cardEyebrow} ${themeStyles.cardEyebrow}`}>
                    {relatedPost.category?.name ?? "Blog"}
                  </span>
                  <h2>
                    <Link href={getPostPath(relatedPost.slug)} prefetch>{relatedPost.title}</Link>
                  </h2>
                  <p className={styles.cardBlurb}>{relatedPost.cardBlurb}</p>
                  <div className={styles.cardMeta}>
                    <span>{formatBlogDate(relatedPost.publishedAt)}</span>
                    <span>{getBlogReadTime(relatedPost)}</span>
                  </div>
                  <Link href={getPostPath(relatedPost.slug)} prefetch className={styles.cardLink}>
                    <span>Read article</span>
                    <ArrowUpRight size={17} strokeWidth={2.2} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

















