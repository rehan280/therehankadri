import type { ReactNode } from "react";
import Image from "next/image";
import ArticleSocialShare from "@/components/blog/ArticleSocialShare";
import PremiumFaq from "@/components/content/PremiumFaq";
import { buildCanonicalUrl } from "@/lib/seo";
import blogStyles from "../../blog/blog.module.css";
import styles from "../youtube-tags-generator/page.module.css";
import type {
  ArticleBlock,
  ParsedExtractorArticle,
} from "./article-content";

type Props = {
  article: ParsedExtractorArticle;
  slug: string;
  shareTitle: string;
  stats: Array<{
    label: string;
    value: string;
    note: string;
  }>;
};

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
    const content = token.startsWith("**")
      ? token.slice(2, -2)
      : token.slice(1, -1);

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

function getRenderableBlocks(blocks: ArticleBlock[]) {
  return blocks.filter(
    (block, index) => !(block.type === "rule" && index === blocks.length - 1)
  );
}

function renderBlock(block: ArticleBlock) {
  switch (block.type) {
    case "paragraph":
      return <p>{renderInlineMarkdown(block.text)}</p>;
    case "quote":
      return (
        <blockquote className={blogStyles.quoteBlock}>
          <p>{renderInlineMarkdown(block.text)}</p>
        </blockquote>
      );
    case "rule":
      return <div className={styles.articleDivider} aria-hidden="true" />;
    case "list":
      return (
        <ul className={blogStyles.articleList}>
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
  }
}

function getStandaloneStrongText(text: string) {
  const match = text.trim().match(/^\*\*(.+?)\*\*$/);
  return match ? match[1] : null;
}

function getStepCards(blocks: ArticleBlock[]) {
  const introBlocks: ArticleBlock[] = [];
  const cards: Array<{
    body: ArticleBlock[];
    title: string;
  }> = [];
  let currentCard: Array<{
    body: ArticleBlock[];
    title: string;
  }>[number] | null = null;

  getRenderableBlocks(blocks).forEach((block) => {
    if (block.type === "paragraph") {
      const strongText = getStandaloneStrongText(block.text);
      const stepMatch = strongText?.match(/^Step\s*#?\d+:\s*(.+)$/i);

      if (stepMatch) {
        currentCard = {
          title: stepMatch[1],
          body: [],
        };
        cards.push(currentCard);
        return;
      }
    }

    if (currentCard) {
      currentCard.body.push(block);
      return;
    }

    introBlocks.push(block);
  });

  return {
    cards,
    introBlocks,
  };
}

function renderHowToSection(
  section: ParsedExtractorArticle["sections"][number],
  imagesByStep: Array<
    Array<{
      alt: string;
      src: string;
    }>
  >
) {
  const { cards, introBlocks } = getStepCards(section.blocks);

  return (
    <section
      key={section.id}
      id={section.id}
      className={`${blogStyles.articleSection} ${styles.articleSection}`}
    >
      <h2>{section.title}</h2>
      {introBlocks.length ? (
        <div className={styles.articleFlow}>
          {introBlocks.map((block, index) => (
            <div key={`${section.id}-intro-${block.type}-${index}`}>
              {renderBlock(block)}
            </div>
          ))}
        </div>
      ) : null}
      <div className={styles.extractorStepStack}>
        {cards.map((card, index) => (
          <article key={card.title} className={styles.extractorStepCard}>
            <div className={styles.extractorStepContent}>
              <span className={styles.extractorStepKicker}>
                Step {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{renderInlineMarkdown(card.title)}</h3>
              <div className={styles.extractorStepBody}>
                {card.body.map((block, bodyIndex) => (
                  <div key={`${card.title}-${block.type}-${bodyIndex}`}>
                    {renderBlock(block)}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.extractorStepMedia}>
              {imagesByStep[index]?.length ? (
                <div
                  className={`${styles.extractorStepImageGrid} ${
                    imagesByStep[index].length === 1 ? styles.extractorStepImageGridSingle : ""
                  }`}
                >
                  {imagesByStep[index].map((image) => (
                    <figure key={image.src} className={styles.extractorStepImageCard}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={1600}
                        height={900}
                        className={styles.extractorImage}
                        sizes="(max-width: 760px) 100vw, 42vw"
                      />
                    </figure>
                  ))}
                </div>
              ) : (
                <div className={styles.extractorStepMediaPlaceholder} aria-hidden="true" />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getStepImages(slug: string) {
  if (slug === "youtube-title-extractor") {
    return [
      [
        {
          alt: "How to copy a YouTube video URL using the Share button",
          src: "/tools/yt-title-extractor/images/youtube-meta-data-extractor.webp",
        },
        {
          alt: "How to copy the YouTube share link from the share modal",
          src: "/tools/yt-title-extractor/images/youtube-title-description-extractor.webp",
        },
      ],
      [
        {
          alt: "Paste the copied YouTube URL into the YouTube title extractor tool",
          src: "/tools/yt-title-extractor/images/youtube-title-extractor.webp",
        },
      ],
      [
        {
          alt: "Click the Extract title button to pull the YouTube title and metadata",
          src: "/tools/yt-title-extractor/images/youtube-title-generator.webp",
        },
      ],
      [
        {
          alt: "Copy or download the extracted title, description, and metadata results",
          src: "/tools/yt-title-extractor/images/youtube-title-description-metadata-extractor.webp",
        },
      ],
    ];
  }

  if (slug === "youtube-description-extractor") {
    return [
      [
        {
          alt: "How to copy a YouTube video URL using the Share button",
          src: "/tools/yt-title-extractor/images/youtube-meta-data-extractor.webp",
        },
        {
          alt: "How to copy the YouTube share link from the share modal",
          src: "/tools/yt-title-extractor/images/youtube-title-description-extractor.webp",
        },
      ],
      [
        {
          alt: "Paste the copied YouTube URL into the YouTube description extractor tool",
          src: "/tools/yt-title-extractor/images/youtube-description-extractor.webp",
        },
      ],
      [
        {
          alt: "Click the Extract description button to pull the YouTube description and metadata",
          src: "/tools/yt-title-extractor/images/youtube-description-generator.webp",
        },
      ],
      [
        {
          alt: "Copy or download the extracted YouTube description, title, and metadata results",
          src: "/tools/yt-title-extractor/images/youtube-description-title-extractor.webp",
        },
      ],
    ];
  }

  return [];
}

export default function YouTubeExtractorArticle({
  article,
  slug,
  shareTitle,
  stats,
}: Props) {
  const canonicalUrl = buildCanonicalUrl(`/${slug}`);
  const stepImages = getStepImages(slug);

  return (
    <div className={blogStyles.postPage}>
      <section className={blogStyles.postSection} aria-label={article.title}>
        <div className={blogStyles.postShell}>
          <div className={`${blogStyles.postGrid} ${blogStyles.postGridNoSidebar}`}>
            <article
              className={`${blogStyles.articleCopy} ${styles.centeredArticleCopy} authority-post-copy`}
            >
              <div className={`${blogStyles.articleProse} ${styles.articleProseShell}`}>
                <div className={styles.articleStatGrid}>
                  {stats.map((stat) => (
                    <article key={stat.label} className={styles.articleStatCard}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      <p>{stat.note}</p>
                    </article>
                  ))}
                </div>

                {article.sections.map((section) => {
                  if (section.id === "frequently-asked-questions") {
                    return (
                      <PremiumFaq
                        key={section.id}
                        id={section.id}
                        title={section.title}
                        eyebrow="Common Questions"
                        className={styles.articleFaqSection}
                        items={article.faqEntries.map((entry) => ({
                          question: entry.question,
                          answer: entry.answer,
                        }))}
                      />
                    );
                  }

                  if (section.id.startsWith("how-to-use-this-youtube")) {
                    return renderHowToSection(section, stepImages);
                  }

                  return (
                    <section
                      key={section.id}
                      id={section.id}
                      className={`${blogStyles.articleSection} ${styles.articleSection}`}
                    >
                      <h2>{section.title}</h2>
                      <div className={styles.articleFlow}>
                        {getRenderableBlocks(section.blocks).map((block, index) => (
                          <div key={`${section.id}-${block.type}-${index}`}>
                            {renderBlock(block)}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}

                {article.conclusionBlocks.length ? (
                  <section
                    id="conclusion"
                    className={`${blogStyles.articleSection} ${styles.articleSection} ${styles.articleConclusionSection}`}
                  >
                    <h2>Conclusion</h2>
                    <div className={styles.articleFlow}>
                      {article.conclusionBlocks.map((block, index) => (
                        <div key={`conclusion-${block.type}-${index}`}>
                          {renderBlock(block)}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <aside className={`${blogStyles.shareRail} ${blogStyles.shareRailMobile}`}>
                  <div className={blogStyles.shareRailInner}>
                    <ArticleSocialShare
                      slug={slug}
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
                  slug={slug}
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
