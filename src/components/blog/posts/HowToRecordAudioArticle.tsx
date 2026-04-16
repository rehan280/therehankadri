import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./how-to-record-audio.module.css";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] };

type ParsedMarkdownArticle = {
  blocks: MarkdownBlock[];
  headings: Array<{ id: string; level: 2 | 3; title: string }>;
  wordCount: number;
};

const ARTICLE_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "content",
  "blog-jsx",
  "how-to-record-audio.md"
);

const rawArticleMarkdown = readFileSync(ARTICLE_FILE_PATH, "utf8");
const HOW_TO_EXCLUDED_HEADINGS = new Set(["Frequently asked questions", "The bottom line"]);

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
  const headingCounts = new Map<string, number>();

  for (let index = 0; index < lines.length; ) {
    const line = lines[index].trimEnd();
    const trimmed = line.trim();

    if (!trimmed || trimmed === "---") {
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(##|###)\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 2 | 3;
      const text = headingMatch[2].trim();
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
    wordCount: stripMarkdownForWordCount(bodyMarkdown).split(/\s+/).filter(Boolean).length,
  };
}

const parsedArticle = parseMarkdownArticle(rawArticleMarkdown);

export const howToRecordAudioHeadingItems = parsedArticle.headings
  .filter((heading) => heading.level === 2)
  .map(({ id, title }) => ({ id, title }));

export const howToRecordAudioWordCount = parsedArticle.wordCount;

export const howToRecordAudioHowToSteps = parsedArticle.blocks.flatMap((block, index, blocks) => {
  if (block.type !== "heading" || block.level !== 2 || HOW_TO_EXCLUDED_HEADINGS.has(block.text)) {
    return [];
  }

  const stepContent: string[] = [];

  for (let cursor = index + 1; cursor < blocks.length; cursor += 1) {
    const nextBlock = blocks[cursor];

    if (nextBlock.type === "heading" && nextBlock.level === 2) {
      break;
    }

    if (nextBlock.type === "paragraph") {
      stepContent.push(nextBlock.text);
    } else if (nextBlock.type === "list") {
      stepContent.push(nextBlock.items.join(" "));
    }

    if (stepContent.join(" ").length >= 280) {
      break;
    }
  }

  return [
    {
      name: block.text,
      text: stepContent.join(" ").trim() || block.text,
      url: block.id ? `#${block.id}` : undefined,
    },
  ];
});

function AudioStackVisual() {
  return (
    <section className={styles.visualPanel} aria-label="3-Layer Audio Stack visual">
      <div className={styles.visualHeader}>
        <span className={styles.visualEyebrow}>Named Framework</span>
        <h3 className={styles.visualTitle}>The 3-Layer Audio Stack at a glance</h3>
        <p className={styles.visualCopy}>
          Your recording only sounds as good as the weakest layer. Fix the room first, then the mic, then the cleanup workflow.
        </p>
      </div>

      <div className={styles.stackGrid}>
        <article className={styles.stackCard}>
          <span className={styles.stackNumber}>01</span>
          <h3>Environment</h3>
          <p>Reduce echo, seal noise leaks, and add soft materials before touching your gear budget.</p>
        </article>

        <article className={styles.stackCard}>
          <span className={styles.stackNumber}>02</span>
          <h3>Device</h3>
          <p>Choose the right mic type and keep placement tight so your voice wins over the room.</p>
        </article>

        <article className={styles.stackCard}>
          <span className={styles.stackNumber}>03</span>
          <h3>Software</h3>
          <p>Use the right app, clean the take properly, and export with settings that match the platform.</p>
        </article>
      </div>
    </section>
  );
}

function StudioSoundVisual() {
  return (
    <section className={styles.visualPanel} aria-label="Professional sound checklist">
      <div className={styles.visualHeader}>
        <span className={styles.visualEyebrow}>Quick Setup</span>
        <h3 className={styles.visualTitle}>Three fast wins for better audio at home</h3>
        <p className={styles.visualCopy}>
          These are the highest-leverage improvements when you want studio-like sound without buying a full studio.
        </p>
      </div>

      <div className={styles.checkGrid}>
        <article className={styles.checkCard}>
          <h3>Dead room</h3>
          <p>Blankets, curtains, rugs, and a tighter space reduce reflections more than most mic upgrades.</p>
        </article>

        <article className={styles.checkCard}>
          <h3>Closer mic</h3>
          <p>Stay roughly 6 to 12 inches away so your voice is louder than fan noise, traffic, and room tone.</p>
        </article>

        <article className={styles.checkCard}>
          <h3>Headroom</h3>
          <p>Keep peaks around -12 dB to -6 dB so you avoid clipping and still have room to process later.</p>
        </article>
      </div>
    </section>
  );
}

function CreatorStandardsVisual() {
  return (
    <section className={styles.visualPanel} aria-label="Universal creator settings">
      <div className={styles.visualHeader}>
        <span className={styles.visualEyebrow}>Universal Standards</span>
        <h3 className={styles.visualTitle}>Default creator settings worth memorizing</h3>
        <p className={styles.visualCopy}>
          These four settings cover most modern creator workflows and match the standards repeated throughout the guide.
        </p>
      </div>

      <div className={styles.metricGrid}>
        <article className={styles.metricCard}>
          <div className={styles.metricValue}>48 kHz</div>
          <h3>Video projects</h3>
          <p>Use 48,000 Hz for YouTube, Reels, Shorts, and any workflow tied to a video timeline.</p>
        </article>

        <article className={styles.metricCard}>
          <div className={styles.metricValue}>24-bit</div>
          <h3>Headroom</h3>
          <p>Higher bit depth gives you more margin before clipping and more flexibility in post-production.</p>
        </article>

        <article className={styles.metricCard}>
          <div className={styles.metricValue}>Mono</div>
          <h3>Solo voice</h3>
          <p>Single-speaker voice recordings do not need stereo, and mono keeps the file cleaner and lighter.</p>
        </article>

        <article className={styles.metricCard}>
          <div className={styles.metricValue}>WAV</div>
          <h3>Edit first</h3>
          <p>Record and edit in WAV, then convert only at the final delivery step if you need smaller files.</p>
        </article>
      </div>
    </section>
  );
}

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

function maybeRenderVisual(heading: string) {
  if (heading === "The 3-Layer Audio Stack") {
    return <AudioStackVisual />;
  }

  if (heading === "How to get professional sound without a studio") {
    return <StudioSoundVisual />;
  }

  if (heading === "Creator settings: the universal standards (2026)") {
    return <CreatorStandardsVisual />;
  }

  return null;
}

export default function HowToRecordAudioArticle() {
  return (
    <div className={styles.article}>
      {parsedArticle.blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          if (block.level === 2) {
            return (
              <section key={key} id={block.id} className={styles.sectionAnchor}>
                <h2>{block.text}</h2>
                {maybeRenderVisual(block.text)}
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

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={key} className={styles.markdownList}>
              {block.items.map((item) => (
                <li key={item}>{renderInlineMarkdown(item)}</li>
              ))}
            </ListTag>
          );
        }

        return renderTable(block, key);
      })}
    </div>
  );
}
