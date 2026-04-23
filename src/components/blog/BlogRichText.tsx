import type { ReactNode } from "react";
import type {
  SerializedRichTextElementNode,
  SerializedRichTextNode,
  SerializedRichTextState,
  SerializedRichTextTextNode,
} from "@/lib/blog-rich-text";
import ArticleList from "@/components/blog/ArticleList";
import styles from "@/app/(frontend)/blog/blog.module.css";

type BlogRichTextProps = {
  data: SerializedRichTextState;
  headingIds?: string[];
};

function isTextNode(node: SerializedRichTextNode): node is SerializedRichTextTextNode {
  return node.type === "text";
}

function isElementNode(node: SerializedRichTextNode): node is SerializedRichTextElementNode {
  return !isTextNode(node);
}

function renderTextNode(node: SerializedRichTextTextNode, key: string) {
  let content: ReactNode = node.text;

  if (node.format & 1) {
    content = <strong>{content}</strong>;
  }

  if (node.format & 2) {
    content = <em>{content}</em>;
  }

  if (node.format & 8) {
    content = <u>{content}</u>;
  }

  if (node.format & 4) {
    content = <s>{content}</s>;
  }

  if (node.format & 16) {
    content = <code>{content}</code>;
  }

  return <span key={key}>{content}</span>;
}

function renderChildren(children: SerializedRichTextNode[] | undefined, headingIds: string[]) {
  return (children ?? []).map((child, index) => renderNode(child, `${child.type}-${index}`, headingIds));
}

function renderNode(
  node: SerializedRichTextNode,
  key: string,
  headingIds: string[]
): ReactNode {
  if (isTextNode(node)) {
    return renderTextNode(node, key);
  }

  if (!isElementNode(node)) {
    return null;
  }

  const children = renderChildren(node.children, headingIds);

  switch (node.type) {
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const title = node.children?.map((child) => ("text" in child ? child.text : "")).join("").trim();
      const id = title ? headingIds.shift() : undefined;
      const Tag = (node.tag ?? "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

      return (
        <Tag key={key} id={id} className={node.tag === "h3" ? styles.richTextSubheading : undefined}>
          {children}
        </Tag>
      );
    }
    case "list": {
      const ordered = (node.tag ?? "ul") === "ol";
      const items = (node.children ?? []).map((child, index) =>
        isElementNode(child) && child.type === "listitem" ? (
          <>{renderChildren(child.children, headingIds)}</>
        ) : (
          renderNode(child, `list-item-${index}`, headingIds)
        )
      );

      return <ArticleList key={key} ordered={ordered} items={items} />;
    }
    case "listitem":
      return <>{children}</>;
    case "quote":
      return (
        <blockquote key={key} className={styles.quoteBlock}>
          {children}
        </blockquote>
      );
    case "linebreak":
      return <br key={key} />;
    default:
      return <>{children}</>;
  }
}

export default function BlogRichText({ data, headingIds = [], customWidgets }: BlogRichTextProps & { customWidgets?: Record<string, ReactNode> }) {
  const headingQueue = [...headingIds];
  const renderedChildren = renderChildren(data.root.children, headingQueue);

  if (!customWidgets) {
    return <>{renderedChildren}</>;
  }

  // To inject widgets after headings, we iterate over the root children
  const result: ReactNode[] = [];
  data.root.children.forEach((child, index) => {
    const key = `${child.type}-${index}`;
    result.push(renderNode(child, key, headingQueue));

    // If it's a heading and we have a widget for its text, inject it
    if (child.type === "heading" && "children" in child && child.children) {
      const headingText = child.children.map((c) => ("text" in c ? c.text : "")).join("").trim();
      if (customWidgets[headingText]) {
        result.push(<div key={`widget-${key}`} className="rich-text-widget">{customWidgets[headingText]}</div>);
      }
    }
  });

  return <>{result}</>;
}
