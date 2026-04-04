import type { ReactNode } from "react";
import blogStyles from "../../blog/blog.module.css";
import PremiumFaq from "@/components/content/PremiumFaq";
import {
  youtubeTagGeneratorArticle,
  youtubeTagGeneratorArticleStats,
} from "./article-content";
import styles from "./page.module.css";

type ArticleBlock =
  (typeof youtubeTagGeneratorArticle.sections)[number]["blocks"][number];
type ArticleSection = (typeof youtubeTagGeneratorArticle.sections)[number];

type HighlightCard = {
  title: string;
  blocks: ArticleBlock[];
};

type CardVariant = "steps" | "strategy" | "warning";

function getRenderableBlocks(blocks: ArticleBlock[]) {
  return blocks.filter(
    (block, index) => !(block.type === "rule" && index === blocks.length - 1)
  );
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

function getStandaloneStrongText(text: string) {
  const match = text.trim().match(/^\*\*(.+?)\*\*$/);
  return match ? match[1] : null;
}

function groupHighlightCards(blocks: ArticleBlock[]) {
  const introBlocks: ArticleBlock[] = [];
  const cards: HighlightCard[] = [];
  let currentCard: HighlightCard | null = null;

  blocks.forEach((block) => {
    if (block.type === "paragraph") {
      const strongText = getStandaloneStrongText(block.text);
      if (strongText) {
        currentCard = {
          title: strongText,
          blocks: [],
        };
        cards.push(currentCard);
        return;
      }
    }

    if (currentCard) {
      currentCard.blocks.push(block);
      return;
    }

    introBlocks.push(block);
  });

  return {
    introBlocks,
    cards,
  };
}

function parseFeatureCardTitle(title: string, variant: CardVariant) {
  if (variant === "steps") {
    const match = title.match(/^Step\s*#?(\d+):\s*(.+)$/i);
    if (match) {
      return {
        badgeText: match[1].padStart(2, "0"),
        title: match[2],
      };
    }
  }

  if (variant === "strategy") {
    const match = title.match(/^(?:\p{Extended_Pictographic}|\p{Symbol})?\s*(\d+)\.\s*(.+)$/u);
    if (match) {
      return {
        badgeText: match[1].padStart(2, "0"),
        title: match[2],
      };
    }
  }

  if (variant === "warning") {
    const match = title.match(/^(?:\p{Extended_Pictographic}|\p{Symbol})?\s*(.+)$/u);
    if (match) {
      return {
        badgeText: "!",
        title: match[1],
      };
    }
  }

  return {
    badgeText: variant === "warning" ? "!" : "01",
    title,
  };
}

function renderBlock(block: ArticleBlock, sectionId?: string) {
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
        <ul
          className={
            sectionId === "example-of-seo-optimized-youtube-tags"
              ? styles.articleTagList
              : blogStyles.articleList
          }
        >
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
  }
}

function renderStandardSection(section: ArticleSection) {
  const renderableBlocks = getRenderableBlocks(section.blocks);

  return (
    <section
      key={section.id}
      id={section.id}
      className={`${blogStyles.articleSection} ${styles.articleSection}`}
    >
      <h2>{section.title}</h2>
      <div className={styles.articleFlow}>
        {renderableBlocks.map((block, index) => (
          <div key={`${section.id}-${block.type}-${index}`}>
            {renderBlock(block, section.id)}
          </div>
        ))}
      </div>
    </section>
  );
}

function renderCardSection(
  section: ArticleSection,
  cardClassName: string,
  variant: CardVariant
) {
  const { introBlocks, cards } = groupHighlightCards(getRenderableBlocks(section.blocks));

  return (
    <section
      key={section.id}
      id={section.id}
      className={`${blogStyles.articleSection} ${styles.articleSection}`}
    >
      <h2>{section.title}</h2>
      <div className={styles.articleFlow}>
        {introBlocks.map((block, index) => (
          <div key={`${section.id}-intro-${block.type}-${index}`}>
            {renderBlock(block, section.id)}
          </div>
        ))}
      </div>

      <div className={cardClassName}>
        {cards.map((card) => (
          <article
            key={card.title}
            className={blogStyles.youtubeInsightCard}
          >
            {(() => {
              const parsed = parseFeatureCardTitle(card.title, variant);

              return (
                <>
                  <div className={styles.articleFeatureHeaderInline}>
                    <span className={blogStyles.youtubeInsightNumber}>{parsed.badgeText}</span>
                    <h3 className={styles.articleFeatureTitleInline}>
                      {renderInlineMarkdown(parsed.title)}
                    </h3>
                  </div>
                  <div className={styles.articleFeatureBody}>
                    {card.blocks.map((block, index) => (
                      <div key={`${card.title}-${block.type}-${index}`}>
                        {renderBlock(block, section.id)}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </article>
        ))}
      </div>
    </section>
  );
}

function renderExampleSection(section: ArticleSection) {
  const blocks = [...getRenderableBlocks(section.blocks)];
  const keywordBlockIndex = blocks.findIndex(
    (block) =>
      block.type === "paragraph" &&
      block.text.startsWith("**Keyword entered:**")
  );
  const tagsHeadingIndex = blocks.findIndex(
    (block) =>
      block.type === "paragraph" && block.text.trim() === "**Tags generated:**"
  );
  const tagListIndex = blocks.findIndex((block) => block.type === "list");
  const keyword =
    keywordBlockIndex >= 0 && blocks[keywordBlockIndex].type === "paragraph"
      ? blocks[keywordBlockIndex].text.replace("**Keyword entered:**", "").trim()
      : "";
  const tagItems =
    tagListIndex >= 0 && blocks[tagListIndex].type === "list"
      ? blocks[tagListIndex].items
      : [];

  const leadingBlocks = blocks.filter(
    (_, index) =>
      index !== keywordBlockIndex && index !== tagsHeadingIndex && index !== tagListIndex
  );

  return (
    <section
      key={section.id}
      id={section.id}
      className={`${blogStyles.articleSection} ${styles.articleSection}`}
    >
      <h2>{section.title}</h2>
      <div className={styles.articleFlow}>
        {leadingBlocks.slice(0, 2).map((block, index) => (
          <div key={`${section.id}-lead-${block.type}-${index}`}>
            {renderBlock(block, section.id)}
          </div>
        ))}
      </div>

      <div className={styles.articleExampleCard}>
        <div className={styles.articleExampleHeader}>
          <div>
            <span className={styles.articleExampleLabel}>Keyword entered</span>
            <strong>{keyword}</strong>
          </div>
          <span className={styles.articleExampleBadge}>12 optimized tags</span>
        </div>

        <div className={styles.articleExampleTags}>
          {tagItems.map((item) => (
            <span key={item} className={styles.articleExampleTag}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.articleFlow}>
        {leadingBlocks.slice(2).map((block, index) => (
          <div key={`${section.id}-tail-${block.type}-${index}`}>
            {renderBlock(block, section.id)}
          </div>
        ))}
      </div>
    </section>
  );
}

function renderSection(section: ArticleSection) {
  switch (section.id) {
    case "how-to-use-the-youtube-tag-generator":
      return renderCardSection(section, styles.articleStepGrid, "steps");
    case "the-perfect-youtube-tag-strategy-pro-tips":
      return renderCardSection(section, styles.articleStrategyGrid, "strategy");
    case "common-youtube-tag-mistakes-to-avoid":
      return renderCardSection(section, styles.articleWarningGrid, "warning");
    case "frequently-asked-questions":
      return (
        <PremiumFaq
          id={section.id}
          title={section.title}
          eyebrow="Common Questions"
          className={styles.articleFaqSection}
          items={youtubeTagGeneratorArticle.faqEntries.map((entry) => ({
            question: entry.question,
            answer: entry.answer,
          }))}
        />
      );
    case "example-of-seo-optimized-youtube-tags":
      return renderExampleSection(section);
    default:
      return renderStandardSection(section);
  }
}

export default function YouTubeTagsArticle() {
  return (
    <div className={blogStyles.postPage}>
      <section className={blogStyles.postSection} aria-label="YouTube tag generator article">
        <div className={blogStyles.postShell}>
          <article
            className={`${blogStyles.articleCopy} ${styles.centeredArticleCopy} authority-post-copy`}
          >
            <div className={`${blogStyles.articleProse} ${styles.articleProseShell}`}>
              <div className={styles.articleStatGrid}>
                {youtubeTagGeneratorArticleStats.map((stat) => (
                  <article key={stat.label} className={styles.articleStatCard}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                    <p>{stat.note}</p>
                  </article>
                ))}
              </div>

              {youtubeTagGeneratorArticle.sections.map((section) => renderSection(section))}

              {youtubeTagGeneratorArticle.conclusionBlocks.length ? (
                <section
                  id="conclusion"
                  className={`${blogStyles.articleSection} ${styles.articleSection} ${styles.articleConclusionSection}`}
                >
                  <h2>Conclusion</h2>
                  <div className={styles.articleFlow}>
                    {youtubeTagGeneratorArticle.conclusionBlocks.map((block, index) => (
                      <div key={`conclusion-${block.type}-${index}`}>
                        {renderBlock(block)}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
