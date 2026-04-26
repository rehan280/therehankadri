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
  const normalizedMarkdown = markdown.replace(/\r/g, "");
  return normalizedMarkdown.replace(/^# [^\n]+\n+[\s\S]*?\n---\n/, "").trim();
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

function parseQuickPickItem(item: string) {
  const match = item.match(/^\*\*(.+?)\*\*:\s*(.+)$/);

  if (!match) {
    return {
      name: item,
      description: "",
    };
  }

  return {
    name: match[1].trim(),
    description: match[2].trim(),
  };
}

function getQuickPickBadge(name: string, index: number) {
  if (index === 0) {
    return "Best Overall";
  }

  switch (name) {
    case "Adobe Audition":
      return "Pro Workflows";
    case "GarageBand":
      return "Apple Users";
    case "WavePad":
      return "iPhone";
    case "Lexis Audio Editor":
      return "Android";
    case "BandLab":
      return "Chromebook";
    default:
      return "Top Pick";
  }
}

function getQuickPickHref(name: string) {
  switch (name) {
    case "Audacity":
      return "#how-to-edit-audio-in-audacity";
    case "Adobe Audition":
      return "#adobe-audition-audio-editing-workflow";
    case "GarageBand":
      return "#how-to-edit-audio-in-garageband";
    case "WavePad":
      return "#how-to-edit-audio-on-iphone-with-wavepad";
    case "Lexis Audio Editor":
      return "#how-to-edit-audio-on-android-with-lexis-audio-editor";
    case "BandLab":
      return "#how-to-edit-audio-on-chromebook-with-bandlab";
    default:
      return "#best-audio-editing-software-in-2026";
  }
}

export default function HowToEditAudioArticle() {
  const elements: ReactNode[] = [];

  for (let index = 0; index < parsedArticle.blocks.length; index += 1) {
    const block = parsedArticle.blocks[index];
    const key = `${block.type}-${index}`;
    const nextBlock = parsedArticle.blocks[index + 1];

    if (
      block.type === "heading" &&
      block.level === 2 &&
      block.text === "Best Audio Editing Software (Quick Picks)" &&
      nextBlock?.type === "list" &&
      !nextBlock.ordered
    ) {
      const quickPicks = nextBlock.items.map(parseQuickPickItem);

      elements.push(
        <section key={key} id={block.id} className={styles.sectionAnchor}>
          <h2>{block.text}</h2>
        </section>
      );

      elements.push(
        <section key={`visual-${key}`} className={styles.visualPanel}>
          <div className={styles.visualHeader}>
            <span className={styles.visualEyebrow}>Editor's Picks</span>
            <p className={styles.visualCopy}>
              Choose the editor that matches your device, budget, and workflow.
            </p>
          </div>

          <ol className={styles.premiumList}>
            {quickPicks.map((item, cardIndex) => (
              <li key={`${item.name}-${cardIndex}`} className={styles.premiumItem}>
                <Link href={getQuickPickHref(item.name)} className={styles.premiumLink}>
                  <div className={styles.premiumRank}>
                    <span>{(cardIndex + 1).toString().padStart(2, "0")}</span>
                  </div>

                  <div className={styles.premiumBody}>
                    <div className={styles.premiumNameRow}>
                      <h3>{item.name}</h3>
                      <span className={styles.premiumBadge}>
                        {getQuickPickBadge(item.name, cardIndex)}
                      </span>
                    </div>
                    <p className={styles.premiumDescription}>{item.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      );

      index += 1;
      continue;
    }

    if (block.type === "heading") {
      if (block.level === 2) {
        elements.push(
          <section key={key} id={block.id} className={styles.sectionAnchor}>
            <h2>{block.text}</h2>
          </section>
        );
      } else {
        elements.push(
          <h3 key={key} id={block.id}>
            {block.text}
          </h3>
        );
      }

      continue;
    }

    if (block.type === "paragraph") {
      elements.push(<p key={key}>{renderInlineMarkdown(block.text)}</p>);
      continue;
    }

    if (block.type === "callout") {
      elements.push(
        <aside key={key} className={styles.snippetBox}>
          <p>{renderInlineMarkdown(block.text)}</p>
        </aside>
      );
      continue;
    }

    if (block.type === "list") {
      elements.push(
        <ArticleList
          key={key}
          ordered={block.ordered}
          items={block.items.map((item) => renderInlineMarkdown(item))}
        />
      );
      continue;
    }

    elements.push(renderTable(block, key));
  }

  return (
    <div className={styles.article}>{elements}</div>
  );
}
