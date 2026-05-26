import PremiumFaq from "@/components/content/PremiumFaq";
import type { ToolDefinition } from "@/lib/tool-catalog";
import styles from "../youtube-tags-generator/page.module.css";
import blogStyles from "../../blog/blog.module.css";
import { getToolArticleContent } from "@/lib/tool-article-content";

type Props = {
  tool: ToolDefinition;
};

function getFaq(tool: ToolDefinition) {
  const content = getToolArticleContent(tool.slug);
  if (content && content.faq.length > 0) {
    return content.faq;
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

export default function GenericToolArticle({ tool }: Props) {
  const faqEntries = getFaq(tool);
  const content = getToolArticleContent(tool.slug);

  return (
    <div className={blogStyles.postPage}>
      <section className={blogStyles.postSection} aria-label={`${tool.title} article`}>
        <div className={blogStyles.postShell}>
          <div className={`${blogStyles.postGrid} ${blogStyles.postGridNoSidebar}`}>
            <article className={`${blogStyles.articleCopy} ${styles.centeredArticleCopy} authority-post-copy`}>
              <div className={`${blogStyles.articleProse} ${styles.articleProseShell}`}>
                
                {content ? (
                  <>
                    <section className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                      <h2>How to Use the {tool.title}</h2>
                      <div className={styles.articleFlow}>
                        <div className={styles.articleStepGrid}>
                          {content.howToUse.map((step, index) => (
                            <article key={index} className={blogStyles.youtubeInsightCard}>
                              <div className={styles.articleFeatureHeaderInline}>
                                <span className={blogStyles.youtubeInsightNumber}>
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <h3 className={styles.articleFeatureTitleInline}>
                                  {step.step}
                                </h3>
                              </div>
                              <div className={styles.articleFeatureBody}>
                                <p>{step.detail}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                      <h2>Who Should Use This Tool</h2>
                      <div className={styles.articleFlow}>
                        <ul className={blogStyles.articleList}>
                          {content.whoShouldUse.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </section>

                    <section className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                      <h2>What This Tool Is Best For</h2>
                      <div className={styles.articleFlow}>
                        <ul className={blogStyles.articleList}>
                          {content.bestFor.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  </>
                ) : (
                  <>
                    <section className={`${blogStyles.articleSection} ${styles.articleSection}`}>
                      <h2>About This Tool</h2>
                      <p>
                        The {tool.title} helps you handle one small creator workflow quickly:
                        start with a URL, title, topic, or list, then turn it into something
                        useful you can copy. It is intentionally simple, so you can get the
                        answer and keep working.
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
                    eyebrow="FAQ"
                    items={faqEntries}
                    title="Frequently Asked Questions"
                    className={styles.articleFaqSection}
                  />
                </section>
                
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export function getGenericToolFaq(tool: ToolDefinition) {
  return getFaq(tool);
}
