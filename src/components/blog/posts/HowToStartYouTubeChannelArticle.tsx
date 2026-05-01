import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import Link from "next/link";
import ArticleList from "@/components/blog/ArticleList";
import styles from "./youtube-ranking-factors.module.css";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "direct-answer"; text: string; sectionId?: string }
  | { type: "paragraph"; text: string; sectionId?: string }
  | { type: "label"; text: string; sectionId?: string }
  | { type: "list"; ordered: boolean; items: string[]; sectionId?: string }
  | { type: "table"; header: string[]; rows: string[][]; sectionId?: string }
  | { type: "image"; alt: string; src: string; title?: string; sectionId?: string };

type ParsedMarkdownArticle = {
  blocks: MarkdownBlock[];
  headings: Array<{ id: string; level: 2 | 3; title: string }>;
  faqEntries: Array<{ question: string; answer: string }>;
  wordCount: number;
};

type VisualStat = {
  label: string;
  value: string;
  note: string;
};

const ARTICLE_FILE_PATH = path.join(
  process.cwd(),
  "public",
  "blog",
  "how to start youtube channel",
  "how-to-start-a-youtube-channel.md"
);

const rawArticleMarkdown = readFileSync(ARTICLE_FILE_PATH, "utf8");
const FAQ_HEADING = "faq";
const TOC_HEADING = "table of contents";

/* ------------------------------------------------------------------ */
/*  Stat-strip data for key sections                                  */
/* ------------------------------------------------------------------ */

const sectionStats = {
  "is-it-too-late-to-start-a-youtube-channel-in-2026": [
    { label: "Monthly active users", value: "2.7B", note: "YouTube's global monthly audience as of 2026." },
    { label: "Daily Shorts views", value: "200B", note: "YouTube Shorts daily view count in 2025." },
    { label: "Creator economy value", value: "$500B+", note: "Total creator economy market value." },
    { label: "Shorts discovery share", value: "35%", note: "New subscribers coming from Shorts content." },
  ],
  "step-5-get-the-right-equipment-without-overspending": [
    { label: "Tier 1: Smartphone", value: "$0", note: "Start with what you already have." },
    { label: "Tier 2: Budget setup", value: "$150", note: "USB mic + ring light + tripod." },
    { label: "Tier 3: Serious setup", value: "$500", note: "Wireless audio + professional lighting." },
    { label: "Audio matters most", value: "#1", note: "Audio quality beats camera quality for YouTube." },
  ],
  "step-8-upload-and-optimize-for-youtube-seo": [
    { label: "Title length", value: "<60", note: "Characters before truncation on mobile." },
    { label: "Description average", value: "222", note: "Words in descriptions of top-ranking videos." },
    { label: "Videos with chapters", value: "63%", note: "Top-ranking videos that use timestamps." },
    { label: "Custom thumbnails", value: "90%", note: "Top performers using custom thumbnails." },
  ],
  "step-10-monetize-your-youtube-channel": [
    { label: "Creator payouts (2025)", value: "$20B+", note: "Paid directly to creators via YPP." },
    { label: "Average US CPM", value: "$7.50", note: "Cost per thousand ad views in 2026." },
    { label: "Finance niche CPM", value: "$15–25", note: "The highest-paying niche on YouTube." },
    { label: "Creator partnerships", value: "70%", note: "Creators earning from brand deals." },
  ],
} satisfies Record<string, VisualStat[]>;

/* ------------------------------------------------------------------ */
/*  Markdown helpers                                                  */
/* ------------------------------------------------------------------ */

function stripArticleHeading(markdown: string) {
  return markdown.replace(/\r/g, "").replace(/^# [^\n]+\n+/, "").trim();
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
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\|/g, " ")
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

function isTableDivider(line: string) {
  return /^\|(?:\s*:?-+:?\s*\|)+\s*$/.test(line);
}

function isHeading(line: string) {
  return /^(##|###)\s+/.test(line);
}

function isStandaloneLabel(line: string) {
  return /^\*\*[^*]+\*\*$/.test(line);
}

function parseMarkdownImage(line: string) {
  const match = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
  if (!match) return null;
  const [, alt, src, title] = match;
  return { alt: alt.trim(), src: src.trim(), title: title?.trim() || undefined };
}

/* ------------------------------------------------------------------ */
/*  Inline markdown renderer                                          */
/* ------------------------------------------------------------------ */

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
        <a key={`${token}-${index}`} href={href} target="_blank" rel="noreferrer">{label}</a>
      ) : (
        <Link key={`${token}-${index}`} href={href}>{label}</Link>
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

/* ------------------------------------------------------------------ */
/*  Markdown parser                                                   */
/* ------------------------------------------------------------------ */

function parseMarkdownArticle(markdown: string): ParsedMarkdownArticle {
  const bodyMarkdown = stripArticleHeading(markdown);
  const lines = bodyMarkdown.split("\n");
  const blocks: MarkdownBlock[] = [];
  const headings: ParsedMarkdownArticle["headings"] = [];
  const faqEntries: ParsedMarkdownArticle["faqEntries"] = [];
  const headingCounts = new Map<string, number>();
  let currentSectionId: string | undefined;
  let inFaqSection = false;
  let inTocSection = false;

  for (let index = 0; index < lines.length;) {
    const rawLine = lines[index].trimEnd();
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed === "---") {
      index += 1;
      continue;
    }

    /* -- fenced code blocks ---------------------------------------- */
    if (trimmed.startsWith("```")) {
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length) {
        const current = lines[index];
        if (current.trim().startsWith("```")) {
          index += 1;
          break;
        }
        codeLines.push(current);
        index += 1;
      }
      if (codeLines.length) {
        blocks.push({ type: "paragraph", text: codeLines.join("\n"), sectionId: currentSectionId });
      }
      continue;
    }

    /* -- blockquotes / direct answers ------------------------------- */
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (!current.startsWith(">")) break;
        quoteLines.push(current.replace(/^>\s?/, ""));
        index += 1;
      }
      const joined = quoteLines.join(" ");
      const directMatch = joined.match(/^\*\*Direct answer:\*\*\s*(.+)$/);
      if (directMatch) {
        blocks.push({ type: "direct-answer", text: directMatch[1].trim(), sectionId: currentSectionId });
      } else {
        blocks.push({ type: "paragraph", text: joined, sectionId: currentSectionId });
      }
      continue;
    }

    /* -- headings -------------------------------------------------- */
    const headingMatch = trimmed.match(/^(##|###)\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 2 | 3;
      const text = headingMatch[2].trim();
      const lowerText = text.toLowerCase();

      if (level === 2 && lowerText === FAQ_HEADING) {
        inFaqSection = true;
        inTocSection = false;
        index += 1;
        continue;
      }

      if (level === 2 && lowerText === TOC_HEADING) {
        inTocSection = true;
        inFaqSection = false;
        index += 1;
        continue;
      }

      /* H3 inside FAQ — skip heading handler, fall through to FAQ parser */
      if (inFaqSection && level === 3) {
        /* don't increment index; let FAQ handler below process this line */
      } else {
        if (level === 2) {
          inFaqSection = false;
          inTocSection = false;
        }

        const baseId = slugify(text) || "section";
        const count = (headingCounts.get(baseId) ?? 0) + 1;
        headingCounts.set(baseId, count);
        const id = count === 1 ? baseId : `${baseId}-${count}`;

        if (level === 2) {
          currentSectionId = id;
        }

        if (!inTocSection) {
          blocks.push({ type: "heading", level, text, id });
          headings.push({ id, level, title: text });
        }

        index += 1;
        continue;
      }
    }

    /* -- skip TOC body --------------------------------------------- */
    if (inTocSection) {
      index += 1;
      continue;
    }

    /* -- FAQ section ------------------------------------------------ */
    if (inFaqSection) {
      const questionMatch = trimmed.match(/^###\s+(.+)$/);
      if (questionMatch) {
        const question = questionMatch[1].trim();
        index += 1;
        const answerLines: string[] = [];
        while (index < lines.length) {
          const next = lines[index].trim();
          if (!next) { index += 1; if (answerLines.length) break; continue; }
          if (isHeading(next)) break;
          answerLines.push(next);
          index += 1;
        }
        if (question && answerLines.length) {
          faqEntries.push({ question, answer: answerLines.join(" ") });
        }
        continue;
      }
      index += 1;
      continue;
    }

    /* -- images ---------------------------------------------------- */
    const standaloneImage = parseMarkdownImage(trimmed);
    if (standaloneImage) {
      blocks.push({ type: "image", ...standaloneImage, sectionId: currentSectionId });
      index += 1;
      continue;
    }

    /* -- tables ---------------------------------------------------- */
    if (
      trimmed.startsWith("|") &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1].trim())
    ) {
      const header = parseTableRow(trimmed);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (!current.startsWith("|")) break;
        rows.push(parseTableRow(current));
        index += 1;
      }
      blocks.push({ type: "table", header, rows, sectionId: currentSectionId });
      continue;
    }

    /* -- lists ----------------------------------------------------- */
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
        if (!match) break;
        items.push(match[1].trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered, items, sectionId: currentSectionId });
      continue;
    }

    /* -- standalone labels ----------------------------------------- */
    const standaloneLabelMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
    if (standaloneLabelMatch) {
      blocks.push({ type: "label", text: standaloneLabelMatch[1].trim(), sectionId: currentSectionId });
      index += 1;
      continue;
    }

    /* -- paragraphs ------------------------------------------------ */
    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        current === "---" ||
        isHeading(current) ||
        current.startsWith("|") ||
        /^[-*+]\s+/.test(current) ||
        /^\d+\.\s+/.test(current) ||
        parseMarkdownImage(current) ||
        (isStandaloneLabel(current) && paragraphLines.length > 0)
      ) break;
      paragraphLines.push(current);
      index += 1;
    }
    if (paragraphLines.length) {
      blocks.push({ type: "paragraph", text: paragraphLines.join(" "), sectionId: currentSectionId });
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

/* ------------------------------------------------------------------ */
/*  Parsed article data                                               */
/* ------------------------------------------------------------------ */

const parsedArticle = parseMarkdownArticle(rawArticleMarkdown);

export const howToStartYouTubeChannelHeadingItems = parsedArticle.headings
  .filter((heading) => heading.level === 2)
  .map(({ id, title }) => ({ id, title }));

export const howToStartYouTubeChannelFaqEntries = parsedArticle.faqEntries;

export const howToStartYouTubeChannelWordCount = parsedArticle.wordCount;

/* ------------------------------------------------------------------ */
/*  HowTo schema data                                                 */
/* ------------------------------------------------------------------ */

export const howToStartYouTubeChannelHowToSteps = [
  { name: "Pick your niche", text: "Find a topic you care about that has real search demand on YouTube. Use YouTube autocomplete and Google Trends to validate demand before committing.", url: "#step-1-pick-your-niche-the-right-way" },
  { name: "Create your YouTube channel", text: "Sign in to YouTube with a Google account, click Create a channel, set your name and handle. Choose between a personal or brand account.", url: "#step-2-create-your-youtube-channel" },
  { name: "Set up YouTube Studio", text: "Configure upload defaults, channel keywords, country, and language in YouTube Studio settings. Explore the Ask Studio AI tool and A/B testing features.", url: "#step-3-set-up-youtube-studio" },
  { name: "Brand your channel", text: "Create a professional profile picture (800x800px), banner (2560x1440px), channel description, and channel trailer.", url: "#step-4-brand-your-channel-to-stand-out" },
  { name: "Get the right equipment", text: "Start with your smartphone ($0). Upgrade to a USB mic and ring light ($50-$150) or a full lighting setup ($300-$500) as you grow.", url: "#step-5-get-the-right-equipment-without-overspending" },
  { name: "Plan your first 10 videos", text: "Use YouTube keyword research to find search-targeted topics. Create a content calendar with weekly uploads mixing tutorials, listicles, and comparisons.", url: "#step-6-plan-your-first-10-videos" },
  { name: "Film and edit your first video", text: "Film in 1080p minimum with good lighting and audio. Edit with free software (CapCut, DaVinci Resolve, iMovie). Create YouTube Shorts for discovery.", url: "#step-7-film-and-edit-your-first-video" },
  { name: "Upload and optimize for YouTube SEO", text: "Write keyword-rich titles under 60 characters, 222-word descriptions with timestamps, custom thumbnails, and optimize for AI search engines.", url: "#step-8-upload-and-optimize-for-youtube-seo" },
  { name: "Grow to your first 1,000 subscribers", text: "Share videos in relevant communities, respond to every comment, optimize for search, and promote across social platforms.", url: "#step-9-grow-to-your-first-1000-subscribers" },
  { name: "Monetize your YouTube channel", text: "Join the YouTube Partner Program (1,000 subscribers + 4,000 watch hours). Supplement with affiliate marketing, sponsorships, and digital products.", url: "#step-10-monetize-your-youtube-channel" },
];

export const howToStartYouTubeChannelHowToTools = [
  "YouTube Studio",
  "Canva",
  "Google Trends",
  "vidIQ",
  "CapCut or DaVinci Resolve",
];

export const howToStartYouTubeChannelHowToSupplies = [
  "Google account",
  "Smartphone or camera",
  "Microphone (optional, recommended)",
  "Lighting (optional)",
];

/* ------------------------------------------------------------------ */
/*  Render helpers                                                    */
/* ------------------------------------------------------------------ */

function renderStatStrip(items: VisualStat[]) {
  return (
    <section className={styles.statStrip} aria-label="Section highlights">
      {items.map((item) => (
        <article key={item.label} className={styles.statCard}>
          <span className={styles.statLabel}>{item.label}</span>
          <strong className={styles.statValue}>{item.value}</strong>
          <p className={styles.statNote}>{item.note}</p>
        </article>
      ))}
    </section>
  );
}

function renderSectionVisual(sectionId: string) {
  const stats = sectionStats[sectionId as keyof typeof sectionStats];
  if (stats) return renderStatStrip(stats);
  return null;
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

/* ------------------------------------------------------------------ */
/*  Main article component                                            */
/* ------------------------------------------------------------------ */

export default function HowToStartYouTubeChannelArticle() {
  const elements: ReactNode[] = [];

  for (let index = 0; index < parsedArticle.blocks.length; index += 1) {
    const block = parsedArticle.blocks[index];
    const key = `${block.type}-${index}`;

    if (block.type === "heading") {
      if (block.level === 2) {
        elements.push(
          <section key={key} id={block.id} className={styles.sectionAnchor}>
            <h2>{block.text}</h2>
          </section>
        );
        const visual = renderSectionVisual(block.id);
        if (visual) {
          elements.push(<div key={`visual-${key}`}>{visual}</div>);
        }
      } else {
        elements.push(
          <h3 key={key} id={block.id} className={styles.subheading}>
            {block.text}
          </h3>
        );
      }
      continue;
    }

    if (block.type === "label") {
      elements.push(
        <div key={key} className={styles.labelRow}>
          <span className={styles.labelPill}>{block.text}</span>
        </div>
      );
      continue;
    }

    if (block.type === "direct-answer") {
      elements.push(
        <aside key={key} className={styles.answerCard}>
          <span className={styles.answerLabel}>Direct answer</span>
          <p>{renderInlineMarkdown(block.text)}</p>
        </aside>
      );
      continue;
    }

    if (block.type === "paragraph") {
      elements.push(<p key={key}>{renderInlineMarkdown(block.text)}</p>);
      continue;
    }

    if (block.type === "image") {
      elements.push(
        <figure key={key} className={styles.inlineFigure}>
          <img src={block.src} alt={block.alt} className={styles.inlineImage} loading="lazy" />
          {block.title ? <figcaption className={styles.inlineCaption}>{block.title}</figcaption> : null}
        </figure>
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

    if (block.type === "table") {
      elements.push(renderTable(block, key));
      continue;
    }
  }

  return <div className={styles.article}>{elements}</div>;
}
