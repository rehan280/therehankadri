import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Globe,
  Linkedin,
  Twitter,
} from "lucide-react";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import {
  blogPosts,
  type BlogBlock,
  formatBlogDate,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/lib/blog";
import styles from "../blog.module.css";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post | The Rehan Kadri",
    };
  }

  return {
    title: `${post.title} | The Rehan Kadri`,
    description: post.seoDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.seoDescription,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: `${post.publishedAt}T00:00:00Z`,
      authors: [post.author.name],
    },
  };
}

function buildHeroTitleLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const joinedLength = (items: string[]) => items.join(" ").length;

  if (words.length <= 3) return [title];

  const twoLineOptions: string[][][] = [];
  for (let i = 1; i < words.length; i += 1) {
    const lines = [words.slice(0, i), words.slice(i)];
    if (lines.some((line) => line.length === 0)) continue;
    if (lines.some((line) => joinedLength(line) > 28)) continue;
    twoLineOptions.push(lines);
  }

  const threeLineOptions: string[][][] = [];
  for (let i = 1; i < words.length - 1; i += 1) {
    for (let j = i + 1; j < words.length; j += 1) {
      const lines = [words.slice(0, i), words.slice(i, j), words.slice(j)];
      if (lines.some((line) => line.length === 0)) continue;
      if (lines.some((line) => joinedLength(line) > 24)) continue;
      threeLineOptions.push(lines);
    }
  }

  const scoreLines = (lineGroups: string[][]) => {
    const lengths = lineGroups.map((line) => joinedLength(line));
    const wordsPerLine = lineGroups.map((line) => line.length);
    const maxLength = Math.max(...lengths);
    const minLength = Math.min(...lengths);
    const balancePenalty = maxLength - minLength;
    const orphanPenalty = lengths[lengths.length - 1] < 8 ? 18 : 0;
    const singleWordLastPenalty = wordsPerLine[wordsPerLine.length - 1] === 1 ? 16 : 0;
    const staircasePenalty =
      lineGroups.length === 3 && !(lengths[0] >= lengths[1] && lengths[1] >= lengths[2]) ? 10 : 0;
    const overPyramidPenalty =
      lineGroups.length === 3 && lengths[2] < lengths[1] * 0.45 ? 14 : 0;
    const lineCountPenalty = lineGroups.length === 3 ? 6 : 0;

    return (
      balancePenalty +
      orphanPenalty +
      singleWordLastPenalty +
      staircasePenalty +
      overPyramidPenalty +
      lineCountPenalty
    );
  };

  const candidateGroups = [...twoLineOptions, ...threeLineOptions];
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
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post.slug);
  const heroTitleLines = buildHeroTitleLines(post.title);
  const authorArticleCount = blogPosts.filter(
    (entry) => entry.author.name === post.author.name
  ).length;

  return (
    <main className={styles.page}>
      <section className={`${styles.hero} ${styles.postHero}`}>
        <BlogHeader />

        <div className={`${styles.heroInner} ${styles.postHeroInner}`}>
          <span className={styles.heroPill}>{post.category.name}</span>
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
                  src={post.author.image}
                  alt={post.author.name}
                  width={80}
                  height={80}
                  className={styles.authorAvatar}
                />
              </div>
              <div className={styles.authorText}>
                <strong>By {post.author.name}</strong>
                <span>{post.author.role}</span>
              </div>
            </div>

            <div className={styles.postMetaRow}>
              <span className={styles.postMetaItem}>
                <CalendarDays size={16} strokeWidth={2.1} />
                <span>{formatBlogDate(post.publishedAt)}</span>
              </span>
              <span className={styles.postMetaItem}>
                <Clock3 size={16} strokeWidth={2.1} />
                <span>{post.readTime}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.postSection}>
        <div className={styles.postShell}>
          <div className={styles.postGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarStack}>
                <BlogTableOfContents
                  items={post.sections.map((section) => ({
                    id: section.id,
                    title: section.title,
                  }))}
                />
              </div>
            </aside>

            <article className={`${styles.articleCopy} authority-post-copy`}>
              <div className={styles.articleProse}>
                {post.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {post.sections.map((section) => (
                  <section key={section.id} id={section.id} className={styles.articleSection}>
                    <h2>{section.title}</h2>
                    {section.blocks.map((block, index) =>
                      renderBlock(block, `${section.id}-${index}`)
                    )}
                  </section>
                ))}
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
                      src={post.author.image}
                      alt={post.author.name}
                      width={150}
                      height={150}
                      className={styles.articleAuthorImage}
                    />
                    <div className={styles.articleAuthorIdentityText}>
                      <strong>{post.author.name}</strong>
                      <span>{post.author.role}</span>
                    </div>
                  </div>

                  <div className={styles.articleAuthorInfo}>
                    <p>{post.author.bio}</p>
                    <div className={styles.articleAuthorFooter}>
                      <div className={styles.articleAuthorSocials}>
                        {post.author.socials?.twitter ? (
                          <Link href={post.author.socials.twitter} className={styles.articleAuthorSocialLink} target="_blank" rel="noreferrer">
                            <Twitter size={14} strokeWidth={2} />
                            <span>Twitter</span>
                          </Link>
                        ) : null}
                        {post.author.socials?.linkedin ? (
                          <Link href={post.author.socials.linkedin} className={styles.articleAuthorSocialLink} target="_blank" rel="noreferrer">
                            <Linkedin size={14} strokeWidth={2} />
                            <span>LinkedIn</span>
                          </Link>
                        ) : null}
                        {post.author.socials?.website ? (
                          <Link href={post.author.socials.website} className={styles.articleAuthorSocialLink} target="_blank" rel="noreferrer">
                            <Globe size={14} strokeWidth={2} />
                            <span>Web</span>
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
                  <span className={styles.cardEyebrow}>{relatedPost.category.name}</span>
                  <h2>
                    <Link href={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                  </h2>
                  <p className={styles.cardBlurb}>{relatedPost.cardBlurb}</p>
                  <div className={styles.cardMeta}>
                    <span>{formatBlogDate(relatedPost.publishedAt)}</span>
                    <span>{relatedPost.readTime}</span>
                  </div>
                  <Link href={`/blog/${relatedPost.slug}`} className={styles.cardLink}>
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





