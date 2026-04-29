import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import ArticleList from "@/components/blog/ArticleList";
import styles from "./youtube-ranking-factors.module.css";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "direct-answer"; text: string; sectionId?: string }
  | { type: "paragraph"; text: string; sectionId?: string }
  | { type: "image"; alt: string; src: string; title?: string; sectionId?: string }
  | { type: "label"; text: string; sectionId?: string }
  | { type: "list"; ordered: boolean; checklist: boolean; items: string[]; sectionId?: string }
  | { type: "table"; header: string[]; rows: string[][]; sectionId?: string }
  | {
    type: "factor";
    number: number;
    title: string;
    body: Array<
      | { type: "paragraph"; text: string }
      | { type: "image"; alt: string; src: string; title?: string }
    >;
    sectionId?: string;
  };

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

type ShortsSignal = {
  title: string;
  body: string;
};

const ARTICLE_FILE_PATH = path.join(
  process.cwd(),
  "public",
  "blog",
  "youtube ranking factors",
  "200-youtube-ranking-factors-2026.md"
);

const rawArticleMarkdown = readFileSync(ARTICLE_FILE_PATH, "utf8");
const FAQ_HEADING = "frequently asked questions";

const overviewStats: VisualStat[] = [
  {
    label: "Signals mapped",
    value: "200",
    note: "Search, browse, Shorts, authority, off-platform, AI, and virality.",
  },
  {
    label: "Videos analyzed",
    value: "1.6M",
    note: "The data hook anchoring the article's ranking-factor framework.",
  },
  {
    label: "Top videos with transcripts",
    value: "94%",
    note: "One of the clearest metadata advantages in the dataset.",
  },
  {
    label: "Top videos with custom thumbnails",
    value: "89%",
    note: "Proof that CTR engineering still starts with the visual package.",
  },
];

const categoryStats = {
  "category-1-video-performance-metrics-factors-1-35": [
    { label: "Primary dense signals", value: "AVD + CTR", note: "The strongest ranking pair in the article." },
    { label: "Early hook window", value: "15-30s", note: "Where promise-confirmation matters most." },
    { label: "Healthy CTR band", value: "5-10%", note: "The benchmark range cited for strong videos." },
    { label: "Launch velocity window", value: "48h", note: "The period that often determines impression expansion." },
  ],
  "category-2-seo-and-metadata-factors-factors-36-70": [
    { label: "Ideal title span", value: "50-65", note: "Characters before truncation and clarity issues show up." },
    { label: "Strong description range", value: "200-350", note: "Words that preserve semantic depth without bloat." },
    { label: "Top videos with SRT", value: "94%", note: "Custom captions remain one of the best underused levers." },
    { label: "Top videos with timestamps", value: "63%", note: "Chapterable structure creates more searchable entry points." },
  ],
  "category-3-thumbnail-and-visual-signals-factors-71-90": [
    { label: "Custom thumbnail usage", value: "89%", note: "Auto-generated options remain a major CTR handicap." },
    { label: "Text cap", value: "5 words", note: "Shorter overlay text survives mobile scaling far better." },
    { label: "Minimum size", value: "1280x720", note: "The baseline format for clean presentation in search." },
    { label: "CTR trigger", value: "Synergy", note: "Title and thumbnail should tell adjacent parts of the story." },
  ],
  "category-5-channel-authority-factors-factors-121-150": [
    { label: "Median channel age", value: "111 mo", note: "Top-ranked channels usually give the system years of history." },
    { label: "Median subs", value: "520K", note: "But channel size is still not a hard gate to ranking." },
    { label: "Small-channel winners", value: "18%", note: "Top-ranked videos from channels below 1,000 subscribers." },
    { label: "Top engagement rate", value: "4.46%", note: "A strong benchmark for channel-level health." },
  ],
  "youtube-shorts-ranking-factors": [
    { label: "Shorts feed trigger", value: "Stop the swipe", note: "Viewed-vs-swiped-away is the new first gate." },
    { label: "Core satisfaction metric", value: "Completion", note: "Completion rate dominates distribution for Shorts." },
    { label: "Replay amplifier", value: "Loop rate", note: "Replays are among the strongest signs of short-form pull." },
    { label: "Front-load window", value: "1 second", note: "The hook now lives in the first frame, not the first minute." },
  ],
} satisfies Record<string, VisualStat[]>;

const checklistSummaryStats: VisualStat[] = [
  { label: "Title", value: "4", note: "Core title checks before upload." },
  { label: "Thumbnail", value: "5", note: "Visual checks that protect CTR." },
  { label: "Description", value: "7", note: "Search and semantic hygiene points." },
  { label: "Launch", value: "5", note: "First-48-hour distribution accelerators." },
];

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
    .replace(/^\s*-\s+\[ \]\s+/gm, "")
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

function isHeading(line: string) {
  return /^(##|###)\s+/.test(line);
}

function isFactor(line: string) {
  return /^\*\*#\d+\s+.+\*\*$/.test(line);
}

function isDirectAnswer(line: string) {
  return /^\*\*Direct answer:\*\*/.test(line);
}

function isStandaloneLabel(line: string) {
  return /^\*\*.+\*\*$/.test(line);
}

function isTableDivider(line: string) {
  return /^\|(?:\s*:?-+:?\s*\|)+\s*$/.test(line);
}

function parseMarkdownImage(line: string) {
  const match = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
  if (!match) {
    return null;
  }

  const [, alt, src, title] = match;
  return {
    alt: alt.trim(),
    src: src.trim(),
    title: title?.trim() || undefined,
  };
}

function normalizeHeadingText(text: string) {
  return text.replace(/^Category\s+\d+:\s*/i, "").trim();
}

function parseMarkdownArticle(markdown: string): ParsedMarkdownArticle {
  const bodyMarkdown = stripArticleHeading(markdown);
  const lines = bodyMarkdown.split("\n");
  const blocks: MarkdownBlock[] = [];
  const headings: ParsedMarkdownArticle["headings"] = [];
  const faqEntries: ParsedMarkdownArticle["faqEntries"] = [];
  const headingCounts = new Map<string, number>();
  let currentSectionId: string | undefined;
  let inFaqSection = false;

  for (let index = 0; index < lines.length;) {
    const rawLine = lines[index].trimEnd();
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed === "---") {
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(##|###)\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 2 | 3;
      const text = headingMatch[2].trim();

      if (level === 2 && text.toLowerCase() === FAQ_HEADING) {
        inFaqSection = true;
        index += 1;
        continue;
      }

      inFaqSection = false;
      const baseId = slugify(text) || "section";
      const count = (headingCounts.get(baseId) ?? 0) + 1;
      headingCounts.set(baseId, count);
      const id = count === 1 ? baseId : `${baseId}-${count}`;

      if (level === 2) {
        currentSectionId = id;
      }

      blocks.push({ type: "heading", level, text, id });
      headings.push({ id, level, title: text });
      index += 1;
      continue;
    }

    if (inFaqSection) {
      const questionMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
      if (questionMatch) {
        const question = questionMatch[1].trim();
        index += 1;
        const answerLines: string[] = [];

        while (index < lines.length) {
          const next = lines[index].trim();
          if (!next || next === "---") {
            index += 1;
            if (answerLines.length) {
              break;
            }
            continue;
          }

          if (isHeading(next) || /^\*\*.+\*\*$/.test(next)) {
            break;
          }

          answerLines.push(next);
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

    const factorMatch = trimmed.match(/^\*\*#(\d+)\s+(.+)\*\*$/);
    if (factorMatch) {
      const number = Number.parseInt(factorMatch[1], 10);
      const title = factorMatch[2].trim();
      index += 1;
      const body: Array<
        | { type: "paragraph"; text: string }
        | { type: "image"; alt: string; src: string; title?: string }
      > = [];

      while (index < lines.length) {
        const next = lines[index].trim();

        if (!next || next === "---") {
          index += 1;
          if (body.length) {
            break;
          }
          continue;
        }

        if (
          isHeading(next) ||
          isFactor(next) ||
          isDirectAnswer(next) ||
          next.startsWith("|") ||
          /^[-*+]\s+/.test(next) ||
          /^\d+\.\s+/.test(next)
        ) {
          break;
        }

        const factorImage = parseMarkdownImage(next);
        if (factorImage) {
          body.push({
            type: "image",
            alt: factorImage.alt,
            src: factorImage.src,
            title: factorImage.title,
          });
          index += 1;
          continue;
        }

        const paragraphLines: string[] = [];
        while (index < lines.length) {
          const current = lines[index].trim();
          if (
            !current ||
            current === "---" ||
            isHeading(current) ||
            isFactor(current) ||
            isDirectAnswer(current) ||
            parseMarkdownImage(current) ||
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
          body.push({
            type: "paragraph",
            text: paragraphLines.join(" "),
          });
        }
      }

      blocks.push({
        type: "factor",
        number,
        title,
        body,
        sectionId: currentSectionId,
      });
      continue;
    }

    const directAnswerMatch = trimmed.match(/^\*\*Direct answer:\*\*\s*(.+)$/);
    if (directAnswerMatch) {
      blocks.push({
        type: "direct-answer",
        text: directAnswerMatch[1].trim(),
        sectionId: currentSectionId,
      });
      index += 1;
      continue;
    }

    const standaloneImage = parseMarkdownImage(trimmed);
    if (standaloneImage) {
      blocks.push({
        type: "image",
        alt: standaloneImage.alt,
        src: standaloneImage.src,
        title: standaloneImage.title,
        sectionId: currentSectionId,
      });
      index += 1;
      continue;
    }

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
        if (!current.startsWith("|")) {
          break;
        }

        rows.push(parseTableRow(current));
        index += 1;
      }

      blocks.push({
        type: "table",
        header,
        rows,
        sectionId: currentSectionId,
      });
      continue;
    }

    const checklistMatch = trimmed.match(/^- \[ \]\s+(.+)$/);
    if (checklistMatch) {
      const items: string[] = [];

      while (index < lines.length) {
        const current = lines[index].trim();
        const match = current.match(/^- \[ \]\s+(.+)$/);
        if (!match) {
          break;
        }

        items.push(match[1].trim());
        index += 1;
      }

      blocks.push({
        type: "list",
        ordered: false,
        checklist: true,
        items,
        sectionId: currentSectionId,
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

      blocks.push({
        type: "list",
        ordered,
        checklist: false,
        items,
        sectionId: currentSectionId,
      });
      continue;
    }

    const standaloneLabelMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
    if (standaloneLabelMatch) {
      blocks.push({
        type: "label",
        text: standaloneLabelMatch[1].trim(),
        sectionId: currentSectionId,
      });
      index += 1;
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        current === "---" ||
        isHeading(current) ||
        isFactor(current) ||
        isDirectAnswer(current) ||
        current.startsWith("|") ||
        /^- \[ \]\s+/.test(current) ||
        /^[-*+]\s+/.test(current) ||
        /^\d+\.\s+/.test(current) ||
        (isStandaloneLabel(current) && !current.startsWith("**Direct answer:**"))
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
        sectionId: currentSectionId,
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

export const youtubeRankingFactorsHeadingItems = parsedArticle.headings
  .filter((heading) => heading.level === 2 && heading.title !== "Table of contents")
  .map(({ id, title }) => ({ id, title: normalizeHeadingText(title) }));

export const youtubeRankingFactorsFaqEntries = parsedArticle.faqEntries;

export const youtubeRankingFactorsWordCount = parsedArticle.wordCount;

function getFactorTone(number: number) {
  if (number <= 35) {
    return {
      style: {
        "--factor-accent": "#ff4a3d",
        "--factor-soft": "rgba(255, 74, 61, 0.16)",
      } as CSSProperties,
    };
  }

  if (number <= 70) {
    return {
      style: {
        "--factor-accent": "#f07a24",
        "--factor-soft": "rgba(240, 122, 36, 0.16)",
      } as CSSProperties,
    };
  }

  if (number <= 90) {
    return {
      style: {
        "--factor-accent": "#8f5cff",
        "--factor-soft": "rgba(143, 92, 255, 0.16)",
      } as CSSProperties,
    };
  }

  if (number <= 120) {
    return {
      style: {
        "--factor-accent": "#2f8fdd",
        "--factor-soft": "rgba(47, 143, 221, 0.16)",
      } as CSSProperties,
    };
  }

  if (number <= 150) {
    return {
      style: {
        "--factor-accent": "#1ea672",
        "--factor-soft": "rgba(30, 166, 114, 0.16)",
      } as CSSProperties,
    };
  }

  if (number <= 170) {
    return {
      style: {
        "--factor-accent": "#0f766e",
        "--factor-soft": "rgba(15, 118, 110, 0.16)",
      } as CSSProperties,
    };
  }

  if (number <= 185) {
    return {
      style: {
        "--factor-accent": "#5b54f1",
        "--factor-soft": "rgba(91, 84, 241, 0.16)",
      } as CSSProperties,
    };
  }

  return {
    style: {
      "--factor-accent": "#d33f6a",
      "--factor-soft": "rgba(211, 63, 106, 0.16)",
    } as CSSProperties,
  };
}

function renderStatStrip(items: VisualStat[]) {
  return (
    <section className={styles.statStrip} aria-label="Article highlights">
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

function renderAlgorithmPanel() {
  return (
    <section className={styles.algorithmPanel} aria-label="How the YouTube ranking system works">
      <div className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>System model</span>
        <h3 className={styles.panelTitle}>YouTube first chooses possible videos, then decides which ones to show first</h3>
        <p className={styles.panelCopy}>
          Step one is getting your video into the shortlist. Step two is beating the other shortlisted videos.
        </p>
      </div>

      <div className={styles.stageGrid}>
        <article className={styles.stageCard}>
          <span className={styles.stageBadge}>Stage 1</span>
          <h4>Candidate Generation</h4>
          <p>YouTube looks through a huge number of videos and picks a small group that might fit that viewer.</p>
          <ul className={styles.stageList}>
            <li>Is this video about the right topic?</li>
            <li>Does this channel stay in one niche?</li>
            <li>Do the title, description, and transcript match the topic?</li>
          </ul>
        </article>

        <article className={styles.stageCard}>
          <span className={styles.stageBadge}>Stage 2</span>
          <h4>Ranking</h4>
          <p>After that, YouTube compares those options and pushes the ones people are most likely to enjoy.</p>
          <ul className={styles.stageList}>
            <li>Do people click? (CTR)</li>
            <li>Do they keep watching?</li>
            <li>Does the video leave them satisfied and keep them on YouTube?</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

function parseShortsSignal(text: string): ShortsSignal | null {
  const match = text.match(/^([^:]+):\s+(.+)$/);
  if (!match) {
    return null;
  }

  return {
    title: match[1].trim(),
    body: match[2].trim(),
  };
}

function renderShortsSignals(signals: ShortsSignal[]) {
  return (
    <section className={styles.shortsPanel} aria-label="YouTube Shorts ranking signals">
      <div className={styles.shortsPanelHeader}>
        <span className={styles.panelEyebrow}>Shorts breakdown</span>
        <h3 className={styles.panelTitle}>What the Shorts algorithm cares about most</h3>
        <p className={styles.panelCopy}>
          Shorts do not behave like regular YouTube videos. These are the signals that matter most once someone sees your Short in the feed.
        </p>
      </div>

      <div className={styles.shortsSignalGrid}>
        {signals.map((signal, index) => (
          <article
            key={`${signal.title}-${index}`}
            className={`${styles.shortsSignalCard}${index === signals.length - 1 ? ` ${styles.shortsSignalCardWide}` : ""}`}
          >
            <div className={styles.shortsSignalTop}>
              <span className={styles.shortsSignalNumber}>{String(index + 1).padStart(2, "0")}</span>
              <h4>{signal.title}</h4>
            </div>
            <p>{renderInlineMarkdown(signal.body)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function renderSectionVisual(sectionId: string) {
  if (sectionId === "the-9-most-important-youtube-ranking-factors") {
    return renderStatStrip(overviewStats);
  }

  if (sectionId === "how-does-the-youtube-algorithm-actually-work") {
    return renderAlgorithmPanel();
  }

  if (sectionId === "the-pre-publish-youtube-seo-checklist") {
    return renderStatStrip(checklistSummaryStats);
  }

  const stats = categoryStats[sectionId as keyof typeof categoryStats];
  if (stats) {
    return renderStatStrip(stats);
  }

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

function renderArticleImage(
  image: { alt: string; src: string; title?: string },
  key: string,
  className?: string
) {
  return (
    <figure key={key} className={className ?? styles.inlineFigure}>
      <img src={image.src} alt={image.alt} className={styles.inlineImage} loading="lazy" />
      {image.title ? <figcaption className={styles.inlineCaption}>{image.title}</figcaption> : null}
    </figure>
  );
}

function renderChecklist(items: string[]) {
  return (
    <div className={styles.checklistGrid}>
      {items.map((item, index) => (
        <label key={`${item}-${index}`} className={styles.checklistItem}>
          <input type="checkbox" className={styles.checklistInput} />
          <span className={styles.checklistMark} aria-hidden="true" />
          <span className={styles.checklistCopy}>{renderInlineMarkdown(item)}</span>
        </label>
      ))}
    </div>
  );
}

function renderTocList(items: string[]) {
  const headingMap = new Map(
    parsedArticle.headings.map((heading) => [heading.title.toLowerCase(), heading.id])
  );

  return (
    <nav className={styles.tocPanel} aria-label="Table of contents">
      <ol className={styles.tocGrid}>
        {items.map((item, index) => {
          const id = headingMap.get(item.toLowerCase());

          return (
            <li key={`${item}-${index}`} className={styles.tocItem}>
              {id ? (
                <Link href={`#${id}`} className={styles.tocLink}>
                  <span className={styles.tocIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span>{normalizeHeadingText(item)}</span>
                </Link>
              ) : (
                <span className={styles.tocLink}>
                  <span className={styles.tocIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span>{normalizeHeadingText(item)}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function renderFactorGrid(factors: Extract<MarkdownBlock, { type: "factor" }>[], key: string) {
  return (
    <section key={key} className={styles.factorGrid} aria-label="YouTube ranking factors">
      {factors.map((factor) => {
        const tone = getFactorTone(factor.number);

        return (
          <article
            key={`factor-${factor.number}`}
            className={styles.factorCard}
            style={tone.style}
          >
            <div className={styles.factorTop}>
              <span className={styles.factorNumber}>{String(factor.number).padStart(3, "0")}</span>
            </div>
            <h3 className={styles.factorTitle}>{factor.title}</h3>
            <div className={styles.factorBody}>
              {factor.body.map((item, index) =>
                item.type === "paragraph" ? (
                  <p key={`factor-${factor.number}-${index}`}>{renderInlineMarkdown(item.text)}</p>
                ) : (
                  renderArticleImage(item, `factor-${factor.number}-image-${index}`, styles.factorFigure)
                )
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default function YouTubeRankingFactorsArticle() {
  const elements: ReactNode[] = [];

  for (let index = 0; index < parsedArticle.blocks.length; index += 1) {
    const block = parsedArticle.blocks[index];
    const key = `${block.type}-${index}`;

    if (block.type === "heading" && block.level === 2 && block.id === "table-of-contents") {
      let cursor = index + 1;
      while (cursor < parsedArticle.blocks.length) {
        const candidate = parsedArticle.blocks[cursor];
        if (candidate.type === "heading" && candidate.level === 2) {
          break;
        }
        cursor += 1;
      }

      index = cursor - 1;
      continue;
    }

    if (block.type === "factor") {
      const factors: Extract<MarkdownBlock, { type: "factor" }>[] = [];

      let cursor = index;
      while (cursor < parsedArticle.blocks.length) {
        const candidate = parsedArticle.blocks[cursor];
        if (candidate.type !== "factor") {
          break;
        }

        factors.push(candidate);
        cursor += 1;
      }

      elements.push(renderFactorGrid(factors, key));
      index = cursor - 1;
      continue;
    }

    if (block.type === "heading") {
      if (block.level === 2) {
        elements.push(
          <section key={key} id={block.id} className={styles.sectionAnchor}>
            <h2>{normalizeHeadingText(block.text)}</h2>
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

    if (block.type === "direct-answer") {
      elements.push(
        <aside key={key} className={styles.answerCard}>
          <span className={styles.answerLabel}>Direct answer</span>
          <p>{renderInlineMarkdown(block.text)}</p>
        </aside>
      );
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

    if (block.type === "paragraph") {
      if (block.sectionId === "youtube-shorts-ranking-factors") {
        const signal = parseShortsSignal(block.text);

        if (signal) {
          const signals: ShortsSignal[] = [];
          let cursor = index;

          while (cursor < parsedArticle.blocks.length) {
            const candidate = parsedArticle.blocks[cursor];
            if (candidate.type !== "paragraph" || candidate.sectionId !== "youtube-shorts-ranking-factors") {
              break;
            }

            const parsedSignal = parseShortsSignal(candidate.text);
            if (!parsedSignal) {
              break;
            }

            signals.push(parsedSignal);
            cursor += 1;
          }

          elements.push(<div key={key}>{renderShortsSignals(signals)}</div>);
          index = cursor - 1;
          continue;
        }
      }

      elements.push(<p key={key}>{renderInlineMarkdown(block.text)}</p>);
      continue;
    }

    if (block.type === "image") {
      elements.push(renderArticleImage(block, key));
      continue;
    }

    if (block.type === "list") {
      if (block.sectionId === "table-of-contents" && block.ordered) {
        elements.push(<div key={key}>{renderTocList(block.items)}</div>);
        continue;
      }

      if (block.checklist) {
        elements.push(<div key={key}>{renderChecklist(block.items)}</div>);
        continue;
      }

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

  return <div className={styles.article}>{elements}</div>;
}
