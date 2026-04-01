import type { BlogPost } from "@/lib/blog";

export type SerializedRichTextTextNode = {
  detail?: number;
  format: number;
  mode?: "normal";
  style?: string;
  text: string;
  type: "text";
  version: number;
};

export type SerializedRichTextElementNode = {
  children?: SerializedRichTextNode[];
  direction?: "ltr";
  format?: string;
  indent?: number;
  tag?: string;
  textFormat?: number;
  textStyle?: string;
  type: string;
  version: number;
  [key: string]: unknown;
};

export type SerializedRichTextNode =
  | SerializedRichTextTextNode
  | SerializedRichTextElementNode;

export type SerializedRichTextState = {
  root: SerializedRichTextElementNode & {
    children: SerializedRichTextNode[];
    type: "root";
  };
};

type HeadingItem = {
  id: string;
  title: string;
};

type RichTextElementNode = SerializedRichTextElementNode;

function createTextNode(text: string): SerializedRichTextTextNode {
  return {
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}

function createParagraphNode(text: string): RichTextElementNode {
  return {
    children: [createTextNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    textFormat: 0,
    textStyle: "",
    type: "paragraph",
    version: 1,
  };
}

function createHeadingNode(text: string, tag: "h2" | "h3" = "h2"): RichTextElementNode {
  return {
    children: [createTextNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    tag,
    type: "heading",
    version: 1,
  };
}

function createListNode(items: string[]): RichTextElementNode {
  return {
    children: items.map((item, index) => ({
      checked: undefined,
      children: [createParagraphNode(item)],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "listitem",
      value: index + 1,
      version: 1,
    })),
    direction: "ltr",
    format: "",
    indent: 0,
    listType: "bullet",
    start: 1,
    tag: "ul",
    type: "list",
    version: 1,
  };
}

function createQuoteNode(text: string): RichTextElementNode {
  return {
    children: [createParagraphNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "quote",
    version: 1,
  };
}

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function slugifyHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLexicalNodeText(node?: SerializedRichTextNode | null): string {
  if (!node) {
    return "";
  }

  if ("text" in node) {
    return typeof node.text === "string" ? node.text : "";
  }

  return (node.children ?? []).map((child) => getLexicalNodeText(child)).join("");
}

export function getRichTextHeadingItems(
  body?: SerializedRichTextState | null
): HeadingItem[] {
  if (!body?.root?.children?.length) {
    return [];
  }

  const counts = new Map<string, number>();

  return body.root.children.flatMap((node) => {
    const richTextNode = node as RichTextElementNode;
    if (richTextNode.type !== "heading") {
      return [];
    }

    const title = getLexicalNodeText(richTextNode).trim();
    if (!title) {
      return [];
    }

    const baseId = slugifyHeading(title) || "section";
    const nextCount = (counts.get(baseId) ?? 0) + 1;
    counts.set(baseId, nextCount);

    return [
      {
        id: nextCount === 1 ? baseId : `${baseId}-${nextCount}`,
        title,
      },
    ];
  });
}

export function countRichTextWords(body?: SerializedRichTextState | null) {
  const text = (body?.root?.children ?? [])
    .map((node) => getLexicalNodeText(node))
    .join(" ")
    .trim();

  if (!text) {
    return 0;
  }

  return text.split(/\s+/).filter(Boolean).length;
}

export function buildRichTextBodyFromLegacyPost(post: BlogPost): SerializedRichTextState {
  const nodes: RichTextElementNode[] = [];

  post.intro.forEach((paragraph) => {
    splitParagraphs(paragraph).forEach((part) => {
      nodes.push(createParagraphNode(part));
    });
  });

  post.sections.forEach((section) => {
    nodes.push(createHeadingNode(section.title, "h2"));

    section.blocks.forEach((block) => {
      switch (block.type) {
        case "paragraph":
          splitParagraphs(block.text).forEach((part) => {
            nodes.push(createParagraphNode(part));
          });
          break;
        case "list":
          if (block.items.length) {
            nodes.push(createListNode(block.items));
          }
          break;
        case "callout":
          nodes.push(createHeadingNode(block.title, "h3"));
          splitParagraphs(block.body).forEach((part) => {
            nodes.push(createParagraphNode(part));
          });
          break;
        case "quote":
          nodes.push(createQuoteNode(block.text));
          if (block.author.trim()) {
            nodes.push(createParagraphNode(`- ${block.author}`));
          }
          break;
      }
    });
  });

  return {
    root: {
      children: nodes,
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

