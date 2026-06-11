import type { ReactNode } from "react";
import PremiumFaq from "@/components/content/PremiumFaq";
import type { ToolDefinition } from "@/lib/tool-catalog";
import styles from "../youtube-tags-generator/page.module.css";
import blogStyles from "../../blog/blog.module.css";
import { getToolArticleContent } from "@/lib/tool-article-content";
import ArticleSocialShare from "@/components/blog/ArticleSocialShare";
import { buildCanonicalUrl } from "@/lib/seo";
import { getToolTestimonials } from "@/lib/tool-testimonials";
import RateMyTool from "@/components/tools/RateMyTool";
import { getToolRating } from "@/lib/tool-ratings";
import type { ArticleBlock } from "@/lib/tool-article-parser";

type Props = {
  tool: ToolDefinition;
};

export async function getGenericToolFaq(tool: ToolDefinition) {
  const content = await getToolArticleContent(tool.slug);
  if (content && content.faqEntries && content.faqEntries.length > 0) {
    return content.faqEntries;
  }

  return [
    {
      question: `What is the ${tool.title}?`,
      answer: `${tool.title} is a free browser-based tool for ${tool.shortDescription.charAt(0).toLowerCase()}${tool.shortDescription.slice(1)}`,
    },
    {
      question: "Do I need to sign in?",
      answer: "No. You can use the tool directly in your browser without creating an account.",
    },
    {
      question: "Can I copy the output?",
      answer: "Yes. The tool includes copy-ready results so you can move the output into YouTube, a content brief, a spreadsheet, or your notes.",
    },
    {
      question: "Is the result perfect every time?",
      answer: "No tool can replace your judgment. Use the result as a fast first draft, then edit it for your audience, niche, and publishing goal.",
    },
  ];
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

export function getStepCards(blocks: ArticleBlock[]) {
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
      const stepMatch = strongText?.match(/^Step\s*#?\d+:\s*(.+)$/i) || strongText?.match(/^(.+)$/i);

      if (stepMatch && currentCard === null && strongText && !strongText.includes(' ')) {
        // Not a clear step
      }

      // To handle loose format, we treat any standalone bold paragraph in "How to Use" as a step if it feels like one
      if (strongText && strongText.length > 5) {
        currentCard = {
          title: strongText,
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

  return { cards, introBlocks };
}

export default async function GenericToolArticle({ tool }: Props) {
  const faqEntries = await getGenericToolFaq(tool);
  const content = await getToolArticleContent(tool.slug);
  const canonicalUrl = buildCanonicalUrl(`/${tool.slug}`);
  const testimonials = getToolTestimonials(tool.slug, tool.title);
  const shareTitle = `Free ${tool.title} - AI-Powered, No Login Required`;
  const ratingData = await getToolRating(tool.slug);

  return (
    <div className={blogStyles.postPage}>
      <section className={blogStyles.postSection} aria-label={`${tool.title} article`}>
        <div className={blogStyles.postShell}>
          <div className={`${blogStyles.postGrid} ${blogStyles.postGridNoSidebar}`}>
            <article className={`${blogStyles.articleCopy} ${styles.centeredArticleCopy} authority-post-copy`}>
              <div className={`${blogStyles.articleProse} ${styles.articleProseShell}`}>

                <section className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                  <h2>Quick Facts (TL;DR)</h2>
                  <ul className={blogStyles.articleList}>
                    <li><strong>Purpose:</strong> {tool.shortDescription}</li>
                    <li><strong>Cost:</strong> 100% Free</li>
                    <li><strong>Sign up:</strong> Not Required</li>
                    {tool.highlights && tool.highlights.length > 0 && (
                      <li><strong>Key Features:</strong> {tool.highlights.join(", ")}</li>
                    )}
                  </ul>
                </section>

                {content ? (
                  <>
                    {content.sections.map((section) => {
                      if (section.id === "frequently-asked-questions") {
                        return null; // Rendered below
                      }

                      if (section.id.includes("how-to-use")) {
                        const { cards, introBlocks } = getStepCards(section.blocks);
                        return (
                          <section key={section.id} className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                            <h2>{section.title}</h2>
                            <div className={styles.articleFlow}>
                              {introBlocks.length > 0 && (
                                <div className={styles.articleFlow}>
                                  {introBlocks.map((block, index) => (
                                    <div key={`intro-${index}`}>{renderBlock(block)}</div>
                                  ))}
                                </div>
                              )}
                              <ol className={styles.articleStrategyGrid} style={{ listStyle: "none", padding: 0 }}>
                                {cards.map((card, index) => (
                                  <li key={index} className={blogStyles.youtubeInsightCard}>
                                    <div className={styles.articleFeatureHeaderInline}>
                                      <span className={blogStyles.youtubeInsightNumber}>
                                        {String(index + 1).padStart(2, "0")}
                                      </span>
                                      <h3 className={styles.articleFeatureTitleInline}>
                                        {renderInlineMarkdown(card.title)}
                                      </h3>
                                    </div>
                                    <div className={styles.articleFeatureBody}>
                                      {card.body.map((block, bodyIndex) => (
                                        <div key={`body-${bodyIndex}`}>{renderBlock(block)}</div>
                                      ))}
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </section>
                        );
                      }

                      return (
                        <section key={section.id} className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                          <h2>{section.title}</h2>
                          <div className={styles.articleFlow}>
                            {getRenderableBlocks(section.blocks).map((block, index) => (
                              <div key={`${section.id}-${index}`}>
                                {renderBlock(block)}
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <section className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                      <h2>What is the {tool.title}?</h2>
                      <p>
                        The <strong>{tool.title}</strong> is a free online tool that helps you handle one small creator workflow quickly:
                        start with a URL, title, topic, or list, then turn it into something
                        useful you can copy. It is intentionally simple, so you can get the
                        answer and keep working without creating an account.
                      </p>
                    </section>

                    <section className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                      <h2>Good Uses</h2>
                      <ul className={blogStyles.articleList}>
                        <li>Draft ideas before recording or publishing.</li>
                        <li>Research public YouTube metadata and competitor patterns.</li>
                        <li>Clean up small repetitive tasks without opening a heavy app.</li>
                        <li>Copy output into your content calendar, notes, or YouTube Studio.</li>
                      </ul>
                    </section>
                  </>
                )}

                <section className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                  <PremiumFaq
                    defaultOpenFirst={false}
                    eyebrow={null}
                    items={faqEntries}
                    title="Frequently Asked Questions"
                    className={styles.articleFaqSection}
                  />
                </section>

                <RateMyTool
                  slug={tool.slug}
                  initialAverage={ratingData.average}
                  initialCount={ratingData.count}
                />

                <aside className={`${blogStyles.shareRail} ${blogStyles.shareRailMobile}`}>
                  <div className={blogStyles.shareRailInner}>
                    <ArticleSocialShare
                      slug={tool.slug}
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
                  slug={tool.slug}
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
