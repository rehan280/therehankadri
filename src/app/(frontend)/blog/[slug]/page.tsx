import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import BlogRichText from "@/components/blog/BlogRichText";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import ArticleSocialShare from "@/components/blog/ArticleSocialShare";
import DefaultBlogPostArticle from "@/components/blog/DefaultBlogPostArticle";
import { getBlogPostModule } from "@/components/blog/post-pages";
import PremiumFaq from "@/components/content/PremiumFaq";
import {
  type BlogPost,
  defaultBlogAuthor,
  formatBlogDisplayDate,
  getBlogDisplayDateTimeValue,
  getBlogDisplayDateLabel,
  getBlogReadTime,
  toBlogIsoDateTime,
} from "@/lib/blog";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/lib/blog-content";
import {
  ORGANIZATION_ID,
  PERSON_ID,
  createOrganizationJsonLd,
  createPersonJsonLd,
  createWebsiteJsonLd,
  createArticleMetadata,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
} from "@/lib/seo";
import {
  getPostPath,
  isStatsPostSlug,
} from "@/lib/post-paths";
import {
  buildHeroTitleLines,
  getBlogPostWordCount,
  getDefaultBlogPostHeadingItems,
  getHeroLineClass,
} from "@/lib/blog-post-page";
import styles from "../blog.module.css";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const YOUTUBE_HERO_BACKGROUND = "linear-gradient(135deg, #ff4b43 0%, #ff3838 48%, #ff2923 100%)";

function isYouTubePost(slug: string) {
  return slug.startsWith("youtube");
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

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
    publishedTime: toBlogIsoDateTime(currentPost.publishedAt),
    modifiedTime: toBlogIsoDateTime(currentPost.modifiedAt ?? currentPost.publishedAt),
    authors: [postAuthor.name],
  });
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();

  return posts
    .filter((post) => !isStatsPostSlug(post.slug))
    .map((post) => ({
      slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  if (isStatsPostSlug(slug)) {
    permanentRedirect(getPostPath(slug));
  }

  const [post, allPosts] = await Promise.all([getBlogPostBySlug(slug), getAllBlogPosts()]);

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
  const postModule = await getBlogPostModule(currentPost.slug);
  const effectiveFaqEntries = postModule?.getFaqEntries?.(currentPost) ?? (currentPost.faqEntries ?? []);
  const heroTitleLines = buildHeroTitleLines(currentPost.title);
  const authorArticleCount = normalizedPosts.filter(
    (entry) => (entry.author ?? defaultBlogAuthor).name === postAuthor.name
  ).length;
  const postReadTime = getBlogReadTime(currentPost);
  const canonicalUrl = buildCanonicalUrl(getPostPath(currentPost.slug));
  const socialImage = buildAbsoluteImageUrl(currentPost.coverImage ?? undefined);
  const wordCount = postModule?.getWordCount?.(currentPost) ?? getBlogPostWordCount(currentPost);
  const datePublished = toBlogIsoDateTime(currentPost.publishedAt);
  const dateModified = toBlogIsoDateTime(currentPost.modifiedAt ?? currentPost.publishedAt);
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const articleEntities = postModule?.getArticleEntities?.(currentPost);
  const articleJsonLd = {
    "@type": "BlogPosting",
    headline: currentPost.metaTitle ?? currentPost.title,
    description: currentPost.seoDescription,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
      url: canonicalUrl,
    },
    url: canonicalUrl,
    datePublished,
    dateModified,
    articleSection: currentPost.category.name,
    keywords: currentPost.keywords?.join(", "),
    timeRequired: `PT${Number.parseInt(postReadTime, 10) || 1}M`,
    wordCount,
    image: [socialImage],
    author: {
      "@id": PERSON_ID,
    },
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    isPartOf: {
      "@id": canonicalUrl,
    },
    breadcrumb: {
      "@id": breadcrumbId,
    },
    about: articleEntities?.about,
    mentions: articleEntities?.mentions,
  };
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createWebsiteJsonLd(),
      createOrganizationJsonLd(),
      createPersonJsonLd(),
      articleJsonLd,
    ],
  };
  const faqJsonLd = effectiveFaqEntries.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: effectiveFaqEntries.map((entry) => ({
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
    "@id": breadcrumbId,
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
        name: "Blog",
        item: buildCanonicalUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: currentPost.title,
        item: canonicalUrl,
      },
    ],
  };
  const faqSection = effectiveFaqEntries.length ? (
    <PremiumFaq
      id="faq"
      title="Frequently Asked Questions"
      eyebrow={null}
      intro="Quick answers to the most common questions from this article."
      className={styles.articleFaqSection}
      items={effectiveFaqEntries.map((entry) => ({
        question: entry.question,
        answer: entry.answer,
      }))}
    />
  ) : null;
  const tableOfContentsItems = postModule?.getHeadingItems
    ? await postModule.getHeadingItems(currentPost)
    : getDefaultBlogPostHeadingItems(currentPost);
  const resolvedHowToJsonLd = postModule?.getHowToJsonLd?.({
    post: currentPost,
    canonicalUrl,
    socialImage,
    readTime: postReadTime,
  }) ?? null;
  const articleContent = postModule
    ? await postModule.renderArticle({
        post: currentPost,
        faqSection,
      })
    : currentPost.body
      ? (
          <BlogRichText
            data={currentPost.body}
            headingIds={tableOfContentsItems.map((item) => item.id)}
          />
        )
      : (
          <DefaultBlogPostArticle post={currentPost} />
        );

  return (
    <main className={`${styles.page} ${styles.postPage}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c"),
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
      {resolvedHowToJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(resolvedHowToJsonLd).replace(/</g, "\\u003c"),
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
              <span className={styles.heroPill}>{currentPost.category.name}</span>
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
                    className={`${styles.postHeroLine} ${getHeroLineClass(index, heroTitleLines.length, styles)}`}
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
                      sizes="45px"
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
                <span className={styles.postMetaItem}>
                  <CalendarDays size={16} strokeWidth={2.1} />
                  <time dateTime={getBlogDisplayDateTimeValue(currentPost)}>
                    {getBlogDisplayDateLabel(currentPost)}: {formatBlogDisplayDate(currentPost)}
                  </time>
                </span>
                <span className={styles.postMetaItem}>
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
                <div className={styles.sidebarStack}>
                  <BlogTableOfContents items={tableOfContentsItems} />
                </div>
              </aside>
            ) : null}

            <article className={`${styles.articleCopy} authority-post-copy`}>
              <div className={styles.articleProse}>
                {articleContent}
                {!postModule?.rendersFaqInternally ? faqSection : null}
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

              <aside className={styles.articleAuthorCard}>
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
                      src="/the-rehan-kadri.webp"
                      alt={postAuthor.name}
                      width={150}
                      height={150}
                      sizes="(max-width: 640px) 112px, 150px"
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
                          <Link href={postAuthor.socials.twitter} className={styles.articleAuthorSocialLink} target="_blank" rel="noreferrer">
                            <Twitter size={14} strokeWidth={2} />
                            <span>Twitter</span>
                          </Link>
                        ) : null}
                        {postAuthor.socials?.linkedin ? (
                          <Link href={postAuthor.socials.linkedin} className={styles.articleAuthorSocialLink} target="_blank" rel="noreferrer">
                            <Linkedin size={14} strokeWidth={2} />
                            <span>LinkedIn</span>
                          </Link>
                        ) : null}
                        {postAuthor.socials?.instagram ? (
                          <Link href={postAuthor.socials.instagram} className={styles.articleAuthorSocialLink} target="_blank" rel="noreferrer">
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
              <span className={styles.relatedLabel}>More from the blog</span>
              <h2>Keep reading</h2>
            </div>

            <div className={styles.articleGrid}>
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className={styles.listingCard}>
                  <span className={styles.cardEyebrow}>
                    {relatedPost.category?.name ?? "Blog"}
                  </span>
                  <h2>
                    <Link href={getPostPath(relatedPost.slug)} prefetch>{relatedPost.title}</Link>
                  </h2>
                  <p className={styles.cardBlurb}>{relatedPost.cardBlurb}</p>
                  <div className={styles.cardMeta}>
                    <span>{formatBlogDisplayDate(relatedPost)}</span>
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

