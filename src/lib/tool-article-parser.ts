

import { promises as fs } from "node:fs";
import path from "node:path";

export type ArticleBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "quote";
      text: string;
    }
  | {
      type: "rule";
    };

export type ArticleSection = {
  id: string;
  title: string;
  blocks: ArticleBlock[];
};

export type FaqEntry = {
  question: string;
  answer: string;
};

export type ParsedArticle = {
  title: string;
  sections: ArticleSection[];
  conclusionBlocks: ArticleBlock[];
  faqEntries: FaqEntry[];
  wordCount: number;
  readTimeMinutes: number;
};

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripInlineMarkdown(value: string) {
  return value
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .trim();
}

function isListLine(value: string) {
  return value.startsWith("- ") || /^\d+\.\s+/.test(value);
}

function isStandaloneBoldLine(value: string) {
  return /^\*\*[^*].+?\*\*$/.test(value);
}

function isStructuralLine(value: string) {
  return (
    value === "---" ||
    value.startsWith("# ") ||
    value.startsWith("## ") ||
    value.startsWith("### ") ||
    value.startsWith("> ") ||
    isStandaloneBoldLine(value) ||
    isListLine(value)
  );
}

export function parseArticle(markdown: string): ParsedArticle {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections: ArticleSection[] = [];
  const conclusionBlocks: ArticleBlock[] = [];
  let title = "";
  let currentSection: ArticleSection | null = null;
  let inConclusion = false;

  const getTargetBlocks = () => {
    if (inConclusion) {
      return conclusionBlocks;
    }

    return currentSection ? currentSection.blocks : [];
  };

  let index = 0;
  while (index < lines.length) {
    const trimmedLine = (lines[index] ?? "").trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("# ")) {
      title = trimmedLine.slice(2).trim();
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("## ") || trimmedLine.startsWith("### ")) {
      const isH3 = trimmedLine.startsWith("### ");
      const sectionTitle = trimmedLine.slice(isH3 ? 4 : 3).trim();
      inConclusion = /^now go|^conclusion/i.test(sectionTitle);
      currentSection = inConclusion
        ? null
        : {
            id: slugify(sectionTitle),
            title: sectionTitle,
            blocks: [],
          };

      if (currentSection) {
        sections.push(currentSection);
      }

      index += 1;
      continue;
    }

    if (trimmedLine === "---") {
      getTargetBlocks().push({ type: "rule" });
      index += 1;
      continue;
    }

    if (isStandaloneBoldLine(trimmedLine)) {
      getTargetBlocks().push({
        type: "paragraph",
        text: trimmedLine,
      });
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("> ")) {
      const quoteLines: string[] = [];

      while (index < lines.length && (lines[index] ?? "").trim().startsWith("> ")) {
        quoteLines.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
        index += 1;
      }

      getTargetBlocks().push({
        type: "quote",
        text: quoteLines.join(" "),
      });
      continue;
    }

    if (isListLine(trimmedLine)) {
      const items: string[] = [];

      while (index < lines.length && isListLine((lines[index] ?? "").trim())) {
        items.push((lines[index] ?? "").trim().replace(/^(?:-|\d+\.)\s+/, ""));
        index += 1;
      }

      getTargetBlocks().push({
        type: "list",
        items,
      });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const currentLine = (lines[index] ?? "").trim();

      if (!currentLine) {
        break;
      }

      if (paragraphLines.length > 0 && isStructuralLine(currentLine)) {
        break;
      }

      paragraphLines.push(currentLine);
      index += 1;
    }

    if (paragraphLines.length) {
      getTargetBlocks().push({
        type: "paragraph",
        text: paragraphLines.join(" "),
      });
    }
  }

  const faqSection = sections.find(
    (section) => section.id === "frequently-asked-questions"
  );
  const faqEntries: FaqEntry[] = [];

  if (faqSection) {
    for (let faqIndex = 0; faqIndex < faqSection.blocks.length; faqIndex += 1) {
      const block = faqSection.blocks[faqIndex];
      if (block?.type !== "paragraph") {
        continue;
      }

      const questionMatch = block.text.trim().match(/^\*\*(.+?)\*\*$/);
      if (!questionMatch) {
        continue;
      }

      const answerBlock = faqSection.blocks[faqIndex + 1];
      if (answerBlock?.type !== "paragraph") {
        continue;
      }

      faqEntries.push({
        question: stripInlineMarkdown(questionMatch[1]),
        answer: stripInlineMarkdown(answerBlock.text),
      });
    }
  }

  const plainText = stripInlineMarkdown(markdown)
    .replace(/^#+\s+/gm, "")
    .replace(/^(?:-|\d+\.)\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/---/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

  return {
    title,
    sections,
    conclusionBlocks,
    faqEntries,
    wordCount,
    readTimeMinutes: Math.max(1, Math.ceil(wordCount / 220)),
  };
}

export async function readAndParseArticle(sourcePath: string) {
  try {
    const markdown = await fs.readFile(sourcePath, "utf8");
    return parseArticle(markdown);
  } catch (error) {
    return null;
  }
}
