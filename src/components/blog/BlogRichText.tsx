import type { ReactNode } from "react";
import type {
  SerializedRichTextElementNode,
  SerializedRichTextNode,
  SerializedRichTextState,
  SerializedRichTextTextNode,
} from "@/lib/blog-rich-text";
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
      const Tag = (node.tag ?? "ul") as "ul" | "ol";
      return (
        <Tag key={key} className={styles.articleList}>
          {children}
        </Tag>
      );
    }
    case "listitem":
      return <li key={key}>{children}</li>;
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

export default function BlogRichText({ data, headingIds = [] }: BlogRichTextProps) {
  const headingQueue = [...headingIds];

  return <>{renderChildren(data.root.children, headingQueue)}</>;
}
