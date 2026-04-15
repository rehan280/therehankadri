import "server-only";

import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

export type ArticleBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "subheading";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "ordered-list";
      items: string[];
    }
  | {
      type: "rule";
    }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
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
  description: string;
  introBlocks: ArticleBlock[];
  sections: ArticleSection[];
  faqEntries: FaqEntry[];
  wordCount: number;
  readTimeMinutes: number;
};

const sourcePath = path.join(
  process.cwd(),
  "public",
  "stats",
  "youtube",
  "how many susbcribers needed to earn m oney",
  "how-many-youtube-subscribers-to-make-money-2026.md"
);

function slugify(value: string) {
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

function extractFaqEntriesFromBlocks(blocks: ArticleBlock[]) {
  const entries: FaqEntry[] = [];
  let currentQuestion: string | null = null;
  let currentAnswerParts: string[] = [];

  const flushEntry = () => {
    if (!currentQuestion || currentAnswerParts.length === 0) {
      currentQuestion = null;
      currentAnswerParts = [];
      return;
    }

    entries.push({
      question: stripInlineMarkdown(currentQuestion),
      answer: stripInlineMarkdown(currentAnswerParts.join(" ")),
    });

    currentQuestion = null;
    currentAnswerParts = [];
  };

  for (const block of blocks) {
    if (block.type !== "paragraph") {
      flushEntry();
      continue;
    }

    const text = block.text.trim();
    const inlineQuestionMatch = text.match(/^\*\*(.+?)\*\*\s*(.+)$/);
    if (inlineQuestionMatch) {
      flushEntry();
      entries.push({
        question: stripInlineMarkdown(inlineQuestionMatch[1] ?? ""),
        answer: stripInlineMarkdown(inlineQuestionMatch[2] ?? ""),
      });
      continue;
    }

    const standaloneQuestionMatch = text.match(/^\*\*(.+?)\*\*$/);
    if (standaloneQuestionMatch) {
      flushEntry();
      currentQuestion = standaloneQuestionMatch[1] ?? null;
      continue;
    }

    if (currentQuestion) {
      currentAnswerParts.push(text);
    }
  }

  flushEntry();

  return entries;
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparatorLine(line: string) {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isTableLine(value: string) {
  return value.trim().startsWith("|");
}

function isOrderedListLine(value: string) {
  return /^\d+\.\s+/.test(value.trim());
}

function isStructuralLine(value: string) {
  return (
    value === "---" ||
    value.startsWith("# ") ||
    value.startsWith("## ") ||
    value.startsWith("### ") ||
    value.startsWith("- ") ||
    isOrderedListLine(value) ||
    isTableLine(value)
  );
}

function parseArticle(markdown: string): ParsedArticle {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const introBlocks: ArticleBlock[] = [];
  const sections: ArticleSection[] = [];
  let title = "";
  let description = "";
  let currentSection: ArticleSection | null = null;

  const getTargetBlocks = () => (currentSection ? currentSection.blocks : introBlocks);

  let index = 0;
  while (index < lines.length) {
    const rawLine = lines[index] ?? "";
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("# ")) {
      title = trimmedLine.slice(2).trim();
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      currentSection = {
        id: slugify(trimmedLine.slice(3)),
        title: trimmedLine.slice(3).trim(),
        blocks: [],
      };
      sections.push(currentSection);
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("### ")) {
      getTargetBlocks().push({
        type: "subheading",
        text: trimmedLine.slice(4).trim(),
      });
      index += 1;
      continue;
    }

    if (trimmedLine === "---") {
      getTargetBlocks().push({ type: "rule" });
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("- ")) {
      const items: string[] = [];

      while (index < lines.length && (lines[index] ?? "").trim().startsWith("- ")) {
        items.push((lines[index] ?? "").trim().replace(/^- /, ""));
        index += 1;
      }

      getTargetBlocks().push({
        type: "list",
        items,
      });
      continue;
    }

    if (isOrderedListLine(trimmedLine)) {
      const items: string[] = [];

      while (index < lines.length && isOrderedListLine(lines[index] ?? "")) {
        items.push((lines[index] ?? "").trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      getTargetBlocks().push({
        type: "ordered-list",
        items,
      });
      continue;
    }

    if (isTableLine(trimmedLine)) {
      const tableLines: string[] = [];

      while (index < lines.length && isTableLine(lines[index] ?? "")) {
        tableLines.push((lines[index] ?? "").trim());
        index += 1;
      }

      const rows = tableLines
        .filter((line) => !isTableSeparatorLine(line))
        .map((line) => splitTableRow(line))
        .filter((cells) => cells.length > 0 && cells.some(Boolean));

      if (rows.length > 1) {
        const [headers, ...bodyRows] = rows;
        getTargetBlocks().push({
          type: "table",
          headers,
          rows: bodyRows,
        });
      }

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
      const text = paragraphLines.join(" ");

      if (!description && !currentSection) {
        description = stripInlineMarkdown(text);
      }

      getTargetBlocks().push({
        type: "paragraph",
        text,
      });
    }
  }

  const faqSection = sections.find(
    (section) => section.id === "frequently-asked-questions-faq"
  );
  const faqEntries = faqSection ? extractFaqEntriesFromBlocks(faqSection.blocks) : [];

  const plainText = stripInlineMarkdown(markdown)
    .replace(/^#+\s+/gm, "")
    .replace(/^- /gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/---/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

  return {
    title,
    description,
    introBlocks,
    sections,
    faqEntries,
    wordCount,
    readTimeMinutes,
  };
}

export const getSubscribersNeededToMakeMoneyArticle = cache(async () => {
  const markdown = await fs.readFile(sourcePath, "utf8");
  return parseArticle(markdown);
});
