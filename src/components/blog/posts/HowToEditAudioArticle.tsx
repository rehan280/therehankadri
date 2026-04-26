import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import Link from "next/link";
import ArticleList from "@/components/blog/ArticleList";
import styles from "./how-to-record-audio.module.css";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "callout"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] };

type ParsedMarkdownArticle = {
  blocks: MarkdownBlock[];
  headings: Array<{ id: string; level: 2 | 3; title: string }>;
  faqEntries: Array<{ question: string; answer: string }>;
  wordCount: number;
};

const ARTICLE_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "content",
  "blog-jsx",
  "how-to-edit-audio.md"
);

const rawArticleMarkdown = readFileSync(ARTICLE_FILE_PATH, "utf8");
const FAQ_HEADINGS = new Set(["frequently asked questions", "audio editing faq"]);

function stripArticleFrontMatter(markdown: string) {
  return markdown.replace(/^# [^\n]+\n+[\s\S]*?\n---\n/, "").trim();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripMarkdownForWordCount(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\|/g, " ")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*---\s*$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const tokens = text
    .split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
    .filter(Boolean);

  return tokens.map((token, index) => {
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isExternal = /^https?:\/\//i.test(href);

      return isExternal ? (
        <a key={`${token}-${index}`} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      ) : (
        <Link key={`${token}-${index}`} href={href}>
          {label}
        </Link>
      );
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={`${token}-${index}`}>{token.slice(1, -1)}</em>;
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={`${token}-${index}`}>{token.slice(1, -1)}</code>;
    }

    return <span key={`${token}-${index}`}>{token}</span>;
  });
}

function parseMarkdownArticle(markdown: string): ParsedMarkdownArticle {
  const bodyMarkdown = stripArticleFrontMatter(markdown);
  const lines = bodyMarkdown.replace(/\r/g, "").split("\n");
  const blocks: MarkdownBlock[] = [];
  const headings: ParsedMarkdownArticle["headings"] = [];
  const faqEntries: ParsedMarkdownArticle["faqEntries"] = [];
  const headingCounts = new Map<string, number>();
  let inFaqSection = false;

  for (let index = 0; index < lines.length; ) {
    const line = lines[index].trimEnd();
    const trimmed = line.trim();

    if (!trimmed || trimmed === "---") {
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(##|###)\s+(.+)$/);
    if (inFaqSection) {
      if (headingMatch && headingMatch[1].length === 2) {
        inFaqSection = false;
        continue;
      }

      const questionMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
      if (questionMatch) {
        const question = questionMatch[1].trim();
        index += 1;

        const answerLines: string[] = [];
        while (index < lines.length) {
          const answerLine = lines[index].trim();

          if (!answerLine || answerLine === "---") {
            index += 1;
            if (answerLines.length > 0) {
              break;
            }
            continue;
          }

          if (/^(##|###)\s+/.test(answerLine) || /^\*\*(.+?)\*\*$/.test(answerLine)) {
            break;
          }

          answerLines.push(answerLine);
          index += 1;
        }

        if (question && answerLines.length) {
          faqEntries.push({
            question,
            answer: answerLines.join(" "),
          });
        }

        continue;
      }

      index += 1;
      continue;
    }

    if (headingMatch) {
      const level = headingMatch[1].length as 2 | 3;
      const text = headingMatch[2].trim();

      if (level === 2 && FAQ_HEADINGS.has(text.toLowerCase())) {
        inFaqSection = true;
        index += 1;
        continue;
      }

      const baseId = slugify(text) || "section";
      const nextCount = (headingCounts.get(baseId) ?? 0) + 1;
      headingCounts.set(baseId, nextCount);
      const id = nextCount === 1 ? baseId : `${baseId}-${nextCount}`;

      blocks.push({ type: "heading", level, text, id });
      headings.push({ id, level, title: text });
      index += 1;
      continue;
    }

    const isTable =
      trimmed.startsWith("|") &&
      index + 1 < lines.length &&
      /^\|(?:\s*:?-+:?\s*\|)+\s*$/.test(lines[index + 1].trim());

    if (isTable) {
      const header = parseTableRow(trimmed);
      index += 2;
      const rows: string[][] = [];

      while (index < lines.length) {
        const rowLine = lines[index].trim();
        if (!rowLine.startsWith("|")) {
          break;
        }

        rows.push(parseTableRow(rowLine));
        index += 1;
      }

      blocks.push({ type: "table", header, rows });
      continue;
    }

    if (trimmed.startsWith(">")) {
      const calloutLines: string[] = [];

      while (index < lines.length) {
        const current = lines[index].trim();
        if (!current.startsWith(">")) {
          break;
        }

        calloutLines.push(current.replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({
        type: "callout",
        text: calloutLines.join(" ").trim(),
      });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (unorderedMatch || orderedMatch) {
      const ordered = Boolean(orderedMatch);
      const items: string[] = [];

      while (index < lines.length) {
        const current = lines[index].trim();
        const match = ordered
          ? current.match(/^\d+\.\s+(.+)$/)
          : current.match(/^[-*+]\s+(.+)$/);

        if (!match) {
          break;
        }

        items.push(match[1].trim());
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        current === "---" ||
        /^(##|###)\s+/.test(current) ||
        current.startsWith("|") ||
        /^[-*+]\s+/.test(current) ||
        /^\d+\.\s+/.test(current)
      ) {
        break;
      }

      paragraphLines.push(current);
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push({
        type: "paragraph",
        text: paragraphLines.join(" "),
      });
      continue;
    }

    index += 1;
  }

  return {
    blocks,
    headings,
    faqEntries,
    wordCount: stripMarkdownForWordCount(bodyMarkdown).split(/\s+/).filter(Boolean).length,
  };
}

const parsedArticle = parseMarkdownArticle(rawArticleMarkdown);

export const howToEditAudioHeadingItems = parsedArticle.headings
  .filter((heading) => heading.level === 2)
  .map(({ id, title }) => ({ id, title }));

export const howToEditAudioFaqEntries = parsedArticle.faqEntries;

export const howToEditAudioWordCount = parsedArticle.wordCount;

export const howToEditAudioHowToSteps = [
  {
    name: "Import your audio file",
    text: "Open your editor, import the raw recording, and work from the original file before applying any effects.",
    url: "#how-to-edit-audio-step-by-step",
  },
  {
    name: "Trim mistakes and dead air",
    text: "Cut long pauses, filler, heavy breaths, and unwanted sections so the final audio feels tight and intentional.",
    url: "#audio-editing-workflow-in-audacity",
  },
  {
    name: "Remove background noise",
    text: "Use noise reduction carefully to reduce hiss, hum, and room noise without making the voice sound metallic.",
    url: "#audio-editing-effects-chain",
  },
  {
    name: "Adjust EQ for clarity",
    text: "Cut low-end rumble, reduce muddy frequencies, and add a small presence boost so the voice sounds clearer.",
    url: "#best-eq-settings-for-voice-audio",
  },
  {
    name: "Compress and normalize levels",
    text: "Apply moderate compression to even out the volume, then normalize so the track plays back at a consistent level.",
    url: "#best-compression-settings-for-voice-audio",
  },
  {
    name: "Export in the right format",
    text: "Export WAV for editing and high-quality delivery, or MP3 when a platform needs smaller files for publishing.",
    url: "#audacity-export-settings-for-creators",
  },
] as const;

export const howToEditAudioHowToTools = [
  "Audacity",
  "Adobe Audition",
  "GarageBand",
  "WavePad",
  "Lexis Audio Editor",
  "BandLab",
] as const;

export const howToEditAudioHowToSupplies = ["Raw audio file", "Headphones"] as const;

function renderTable(block: Extract<MarkdownBlock, { type: "table" }>, key: string) {
  return (
    <div key={key} className={styles.markdownTableWrap}>
      <table className={styles.markdownTable}>
        <thead>
          <tr>
            {block.header.map((cell) => (
              <th key={cell}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`${key}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${key}-${rowIndex}-${cellIndex}`}>{renderInlineMarkdown(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HowToEditAudioArticle() {
  return (
    <div className={styles.article}>
      {parsedArticle.blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          if (block.level === 2) {
            return (
              <section key={key} id={block.id} className={styles.sectionAnchor}>
                <h2>{block.text}</h2>
              </section>
            );
          }

          return (
            <h3 key={key} id={block.id}>
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return <p key={key}>{renderInlineMarkdown(block.text)}</p>;
        }

        if (block.type === "callout") {
          return (
            <aside key={key} className={styles.snippetBox}>
              <p>{renderInlineMarkdown(block.text)}</p>
            </aside>
          );
        }

        if (block.type === "list") {
          return (
            <ArticleList
              key={key}
              ordered={block.ordered}
              items={block.items.map((item) => renderInlineMarkdown(item))}
            />
          );
        }

        return renderTable(block, key);
      })}
    </div>
  );
}
