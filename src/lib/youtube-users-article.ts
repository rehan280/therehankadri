import "server-only";

import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";
import { slugifyHeading } from "@/lib/blog-rich-text";

export type YouTubeUsersInsight = {
  number: string;
  text: string;
};

export type YouTubeUsersBlock =
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
      id: string;
    }
  | {
      type: "paragraph";
      text: string;
      sectionId?: string;
    }
  | {
      type: "list";
      items: string[];
      ordered: boolean;
      sectionId?: string;
    }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
      sectionId?: string;
    }
  | {
      type: "insight-list";
      items: YouTubeUsersInsight[];
      sectionId?: string;
    };

export type YouTubeUsersArticleData = {
  blocks: YouTubeUsersBlock[];
  headings: Array<{ id: string; title: string }>;
};

const sourcePath = path.join(process.cwd(), "src", "content", "blog-jsx", "youtube-users.md");
const orderedInsightPattern = /^\*\*(\d+\.)\*\*\s+(.*)$/;
const orderedListPattern = /^\d+\.\s+(.*)$/;
const bulletListPattern = /^-\s+(.*)$/;

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

function isHeadingLine(line: string) {
  return /^#{2,3}\s+/.test(line.trim());
}

function isTableLine(line: string) {
  return line.trim().startsWith("|");
}

function isOrderedInsightLine(line: string) {
  return orderedInsightPattern.test(line.trim());
}

function isBulletLine(line: string) {
  return bulletListPattern.test(line.trim());
}

function isOrderedListLine(line: string) {
  return orderedListPattern.test(line.trim()) && !isOrderedInsightLine(line);
}

function isBlockBoundary(line: string) {
  const trimmed = line.trim();

  if (!trimmed) {
    return true;
  }

  return (
    /^#\s+/.test(trimmed) ||
    isHeadingLine(trimmed) ||
    isTableLine(trimmed) ||
    isOrderedInsightLine(trimmed) ||
    isBulletLine(trimmed) ||
    isOrderedListLine(trimmed)
  );
}

function normalizeParagraph(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export const getYouTubeUsersArticleData = cache(async (): Promise<YouTubeUsersArticleData> => {
  const source = await fs.readFile(sourcePath, "utf8");
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: YouTubeUsersBlock[] = [];
  const headings: Array<{ id: string; title: string }> = [];
  let currentSectionId: string | undefined;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^#\s+/.test(trimmed)) {
      index += 1;
      continue;
    }

    if (isHeadingLine(trimmed)) {
      const level = trimmed.startsWith("### ") ? 3 : 2;
      const title = trimmed.replace(/^#{2,3}\s+/, "").trim();
      const id = slugifyHeading(title) || `section-${headings.length + 1}`;
      blocks.push({ type: "heading", level, text: title, id });
      headings.push({ id, title });
      currentSectionId = id;
      index += 1;
      continue;
    }

    if (isTableLine(trimmed)) {
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
        const [headersRow, ...bodyRows] = rows;
        blocks.push({
          type: "table",
          headers: headersRow,
          rows: bodyRows,
          sectionId: currentSectionId,
        });
      }

      continue;
    }

    if (isOrderedInsightLine(trimmed)) {
      const items: YouTubeUsersInsight[] = [];

      while (index < lines.length) {
        const currentLine = lines[index] ?? "";
        const currentTrimmed = currentLine.trim();

        if (!currentTrimmed) {
          let nextIndex = index + 1;
          while (nextIndex < lines.length && !(lines[nextIndex] ?? "").trim()) {
            nextIndex += 1;
          }

          if (nextIndex < lines.length && isOrderedInsightLine((lines[nextIndex] ?? "").trim())) {
            index = nextIndex;
            continue;
          }

          break;
        }

        const match = currentTrimmed.match(orderedInsightPattern);
        if (!match) {
          break;
        }

        items.push({ number: match[1], text: match[2].trim() });
        index += 1;
      }

      if (items.length) {
        blocks.push({ type: "insight-list", items, sectionId: currentSectionId });
      }

      continue;
    }

    if (isBulletLine(trimmed) || isOrderedListLine(trimmed)) {
      const ordered = isOrderedListLine(trimmed);
      const pattern = ordered ? orderedListPattern : bulletListPattern;
      const items: string[] = [];

      while (index < lines.length) {
        const itemMatch = (lines[index] ?? "").trim().match(pattern);
        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1].trim());
        index += 1;
      }

      if (items.length) {
        blocks.push({ type: "list", items, ordered, sectionId: currentSectionId });
      }

      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length && !isBlockBoundary(lines[index] ?? "")) {
      paragraphLines.push((lines[index] ?? "").trim());
      index += 1;
    }

    const text = normalizeParagraph(paragraphLines);
    if (text) {
      blocks.push({ type: "paragraph", text, sectionId: currentSectionId });
    }
  }

  return {
    blocks,
    headings,
  };
});

