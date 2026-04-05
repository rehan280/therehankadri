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
      type: "list";
      items: string[];
    }
  | {
      type: "quote";
      text: string;
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
  introBlocks: ArticleBlock[];
  sections: ArticleSection[];
  conclusionBlocks: ArticleBlock[];
  faqEntries: FaqEntry[];
  wordCount: number;
  readTimeMinutes: number;
};

const DEFAULT_ARTICLE_TITLE =
  "YouTube Tag Generator: Find the Best Tags for YouTube Videos in 2026";
const sourcePath = path.join(process.cwd(), "youtube-tag-generator-article.md");

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

function isStructuralLine(value: string) {
  return (
    value === "---" ||
    value.startsWith("# ") ||
    value.startsWith("## ") ||
    value.startsWith("### ") ||
    value.startsWith("> ") ||
    value.startsWith("- ") ||
    isTableLine(value)
  );
}

function parseArticle(markdown: string): ParsedArticle {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const introBlocks: ArticleBlock[] = [];
  const sections: ArticleSection[] = [];
  const conclusionBlocks: ArticleBlock[] = [];
  let title = "";
  let currentSection: ArticleSection | null = null;
  let inConclusion = false;

  const getTargetBlocks = () => {
    if (inConclusion) {
      return conclusionBlocks;
    }

    return currentSection ? currentSection.blocks : introBlocks;
  };

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

    if (trimmedLine === "---") {
      if (currentSection?.id === "frequently-asked-questions") {
        inConclusion = true;
        currentSection = null;
        index += 1;
        continue;
      }

      getTargetBlocks().push({ type: "rule" });
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

    if (isTableLine(trimmedLine)) {
      const tableLines: string[] = [];

      while (index < lines.length && isTableLine(lines[index] ?? "")) {
        tableLines.push((lines[index] ?? "").trim());
        index += 1;
      }

      const rows = tableLines
        .filter((tableLine) => !isTableSeparatorLine(tableLine))
        .map((tableLine) => splitTableRow(tableLine))
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
    .replace(/^- /gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\|/g, " ")
    .replace(/---/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

  return {
    title: title || DEFAULT_ARTICLE_TITLE,
    introBlocks,
    sections,
    conclusionBlocks,
    faqEntries,
    wordCount,
    readTimeMinutes,
  };
}

export const getYouTubeTagGeneratorArticle = cache(async () => {
  const markdown = await fs.readFile(sourcePath, "utf8");
  return parseArticle(markdown);
});

export const youtubeTagGeneratorArticleStats = [
  {
    label: "Global users",
    value: "2.7B+",
    note: "YouTube has over 2.7 billion active users worldwide as of 2026.",
  },
  {
    label: "Uploaded per minute",
    value: "500+ hrs",
    note: "More than 500 hours of video are uploaded to YouTube every minute.",
  },
  {
    label: "Tag field limit",
    value: "500 chars",
    note: "YouTube allows up to 500 characters of tags total.",
  },
] as const;
