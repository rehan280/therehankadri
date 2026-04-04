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
import YouTubeUsersArticle from "@/components/blog/posts/YouTubeUsersArticle";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import { getRichTextHeadingItems } from "@/lib/blog-rich-text";
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
import styles from "../blog.module.css";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const siteUrl = "https://therehankadri.site";

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
  const canonicalUrl = `${siteUrl}/blog/${currentPost.slug}`;
  const socialImage = currentPost.coverImage
    ? `${siteUrl}${currentPost.coverImage.startsWith("/") ? currentPost.coverImage : `/${currentPost.coverImage}`}`
    : undefined;

  return {
    title: `${currentPost.metaTitle ?? currentPost.title} | The Rehan Kadri`,
    description: currentPost.seoDescription,
    keywords: currentPost.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: currentPost.metaTitle ?? currentPost.title,
      description: currentPost.seoDescription,
      type: "article",
      url: canonicalUrl,
      publishedTime: `${currentPost.publishedAt}T00:00:00Z`,
      authors: [postAuthor.name],
      images: socialImage
        ? [
            {
              url: socialImage,
              alt: currentPost.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title: currentPost.metaTitle ?? currentPost.title,
      description: currentPost.seoDescription,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
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
    const twoLinePreference =
      lineGroups.length === 2 && maxLength <= 30 ? -18 : 0;
    const threeLinePreference =
      lineGroups.length === 3 && maxLength <= 24 ? -8 : 0;
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

  const candidateGroups = [
    ...buildLineGroups(2, 28),
    ...buildLineGroups(3, 24),
  ];
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getAllBlogPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const currentPost = post as BlogPost;
  const normalizedPosts = allPosts as BlogPost[];
  const postAuthor = currentPost.author ?? defaultBlogAuthor;
  const relatedPosts = (await getRelatedBlogPosts(currentPost.slug)) as BlogPost[];
  const youtubeUsersArticleData =
    currentPost.slug === "youtube-users" ? await getYouTubeUsersArticleData() : null;
  const heroTitleLines = buildHeroTitleLines(currentPost.title);
  const authorArticleCount = normalizedPosts.filter(
    (entry) => (entry.author ?? defaultBlogAuthor).name === postAuthor.name
  ).length;
  const postReadTime = getBlogReadTime(currentPost);
  const canonicalUrl = `${siteUrl}/blog/${currentPost.slug}`;
  const socialImage = currentPost.coverImage
    ? `${siteUrl}${currentPost.coverImage.startsWith("/") ? currentPost.coverImage : `/${currentPost.coverImage}`}`
    : undefined;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: currentPost.metaTitle ?? currentPost.title,
    description: currentPost.seoDescription,
    mainEntityOfPage: canonicalUrl,
    datePublished: `${currentPost.publishedAt}T00:00:00Z`,
    dateModified: `${currentPost.publishedAt}T00:00:00Z`,
    articleSection: currentPost.category.name,
    keywords: currentPost.keywords?.join(", "),
    timeRequired: `PT${Number.parseInt(postReadTime, 10) || 1}M`,
    wordCount: currentPost.slug === "youtube-users" ? 4814 : undefined,
    image: socialImage ? [socialImage] : undefined,
    author: {
      "@type": "Person",
      name: postAuthor.name,
      url: postAuthor.socials?.linkedin,
    },
    publisher: {
      "@type": "Organization",
      name: "The Rehan Kadri",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon/web-app-manifest-512x512.png`,
      },
    },
  };
  const tableOfContentsItems = youtubeUsersArticleData
    ? youtubeUsersArticleData.headings
    : currentPost.body
      ? getRichTextHeadingItems(currentPost.body)
      : currentPost.sections.map((section) => ({
          id: section.id,
          title: section.title,
        }));

  return (
    <main className={`${styles.page} ${styles.postPage}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className={`${styles.hero} ${styles.postHero}`}>

        <div className={`${styles.heroInner} ${styles.postHeroInner}`}>
          <span className={styles.heroPill}>{currentPost.category.name}</span>
          <h1 className={styles.postHeroTitle}>
            {heroTitleLines.map((line, index) => (
              <span key={`${line}-${index}`} className={`${styles.postHeroLine} ${getHeroLineClass(index, heroTitleLines.length)}`}>
                {line}
              </span>
            ))}
          </h1>

          <div className={styles.authorRow}>
            <div className={styles.authorIdentity}>
              <div className={styles.authorAvatarWrap}>
                <Image
                  src={postAuthor.image}
                  alt={postAuthor.name}
                  width={80}
                  height={80}
                  className={styles.authorAvatar}
                />
              </div>
              <div className={styles.authorText}>
                <strong>By {postAuthor.name}</strong>
                <span>{postAuthor.role}</span>
              </div>
            </div>

            <div className={styles.postMetaRow}>
              <span className={styles.postMetaItem}>
                <CalendarDays size={16} strokeWidth={2.1} />
                <span>{formatBlogDate(currentPost.publishedAt)}</span>
              </span>
              <span className={styles.postMetaItem}>
                <Clock3 size={16} strokeWidth={2.1} />
                <span>{postReadTime}</span>
              </span>
            </div>
          </div>
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
                {youtubeUsersArticleData ? (
                  <YouTubeUsersArticle data={youtubeUsersArticleData} />
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
              </div>

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
                    <Link href={`/blog/${relatedPost.slug}`} prefetch>{relatedPost.title}</Link>
                  </h2>
                  <p className={styles.cardBlurb}>{relatedPost.cardBlurb}</p>
                  <div className={styles.cardMeta}>
                    <span>{formatBlogDate(relatedPost.publishedAt)}</span>
                    <span>{getBlogReadTime(relatedPost)}</span>
                  </div>
                  <Link href={`/blog/${relatedPost.slug}`} prefetch className={styles.cardLink}>
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

