import ArticleList from "@/components/blog/ArticleList";
import type { BlogBlock, BlogPost } from "@/lib/blog";
import styles from "@/app/(frontend)/blog/blog.module.css";

function renderBlock(block: BlogBlock, key: string) {
  switch (block.type) {
    case "paragraph":
      return <p key={key}>{block.text}</p>;
    case "list":
      return <ArticleList key={key} items={block.items} />;
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

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

export function getDefaultBlogPostWordCount(post: BlogPost) {
  if (post.body) {
    return 0;
  }

  const introWords = post.intro.reduce((total, paragraph) => total + countWords(paragraph), 0);
  const sectionWords = post.sections.reduce((total, section) => {
    const headingWords = countWords(section.title);
    const blockWords = section.blocks.reduce((blockTotal, block) => {
      switch (block.type) {
        case "paragraph":
          return blockTotal + countWords(block.text);
        case "list":
          return blockTotal + block.items.reduce((listTotal, item) => listTotal + countWords(item), 0);
        case "callout":
          return blockTotal + countWords(block.title) + countWords(block.body);
        case "quote":
          return blockTotal + countWords(block.text) + countWords(block.author);
      }
    }, 0);

    return total + headingWords + blockWords;
  }, 0);

  return introWords + sectionWords;
}

export default function DefaultBlogPostArticle({ post }: { post: BlogPost }) {
  return (
    <>
      {post.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      {post.sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.articleSection}>
          <h2>{section.title}</h2>
          {section.blocks.map((block, index) => renderBlock(block, `${section.id}-${index}`))}
        </section>
      ))}
    </>
  );
}
