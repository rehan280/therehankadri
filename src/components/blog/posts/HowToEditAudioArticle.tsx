import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import ArticleList from "@/components/blog/ArticleList";
import YouTubeTutorialEmbed from "@/components/common/YouTubeTutorialEmbed";
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

type ArticleArtwork = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  sizes?: string;
  maxWidth?: string;
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
const ARTICLE_ARTWORK = {
  workflow: {
    src: "/blog/how%20to%20record%20audio/how-to-edit-audio-workflow.webp",
    alt: "Infographic showing the seven-step audio editing workflow from import to export",
    caption:
      "The full editing flow at a glance: import, trim, denoise, EQ, compress, normalize, and export.",
    width: 1536,
    height: 1024,
    sizes: "(max-width: 900px) 100vw, 720px",
  },
  software: {
    src: "/blog/how%20to%20record%20audio/best-audio-editing-software.webp",
    alt: "Comparison chart of the best audio editing software for different devices and use cases",
    caption:
      "A side-by-side software comparison covering platform support, best use cases, pricing, and takeaways.",
    width: 1536,
    height: 1024,
    sizes: "(max-width: 900px) 100vw, 720px",
  },
  subscribers: {
    src: "/blog/how%20to%20record%20audio/rehan-youtube-subscribers.webp",
    alt: "Screenshot of Rehanous YouTube channel showing about 33.3 thousand subscribers",
    caption:
      "The growth behind this workflow: years of creator work, enough testing, and 33K-plus YouTube subscribers.",
    width: 1229,
    height: 414,
    sizes: "(max-width: 900px) 100vw, 560px",
    maxWidth: "35rem",
  },
  mistakes: {
    src: "/blog/how%20to%20record%20audio/audio-editing-common-mistakes.webp",
    alt: "Infographic showing common audio editing mistakes, their causes, and the fixes",
    caption:
      "A practical troubleshooting sheet for robotic audio, muddy EQ, unstable volume, sync drift, and export issues.",
    width: 1536,
    height: 1024,
    sizes: "(max-width: 900px) 100vw, 720px",
  },
  glossary: {
    src: "/blog/how%20to%20record%20audio/audio-editing-terms-glossary.webp",
    alt: "Audio editing glossary infographic explaining key terms like clipping, LUFS, EQ, and compression",
    caption:
      "A visual glossary for the terms beginners usually have to piece together from five different tutorials.",
    width: 1024,
    height: 1536,
    sizes: "(max-width: 900px) 100vw, 720px",
  },
} satisfies Record<string, ArticleArtwork>;

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

function renderArticleArtwork(artwork: ArticleArtwork, key: string) {
  const figureStyle = artwork.maxWidth
    ? ({ maxWidth: artwork.maxWidth } satisfies CSSProperties)
    : undefined;

  return (
    <figure key={key} className={styles.articleArtwork} style={figureStyle}>
      <div className={styles.articleArtworkFrame}>
        <Image
          src={artwork.src}
          alt={artwork.alt}
          width={artwork.width}
          height={artwork.height}
          className={styles.articleArtworkImage}
          sizes={artwork.sizes ?? "(max-width: 900px) 100vw, 720px"}
        />
      </div>
      <figcaption className={styles.articleArtworkCaption}>{artwork.caption}</figcaption>
    </figure>
  );
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
      elements.push(renderArticleArtwork(ARTICLE_ARTWORK.software, `software-${key}`));

      elements.push(
        <section key={`visual-${key}`} className={styles.visualPanel}>
          <div className={styles.visualHeader}>
            <span className={styles.visualEyebrow}>Editor&apos;s Picks</span>
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

        if (block.text === "How to Edit Audio (Quick Answer)") {
          elements.push(renderArticleArtwork(ARTICLE_ARTWORK.workflow, `workflow-${key}`));
        }

        if (block.text === "Common audio editing mistakes") {
          elements.push(renderArticleArtwork(ARTICLE_ARTWORK.mistakes, `mistakes-${key}`));
        }

        if (block.text === "Audio editing glossary") {
          elements.push(renderArticleArtwork(ARTICLE_ARTWORK.glossary, `glossary-${key}`));
        }
      } else {
        elements.push(
          <h3 key={key} id={block.id}>
            {block.text}
          </h3>
        );

        if (block.text === "How to edit audio in Audacity") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`audacity-video-${key}`}
              copy="Prefer watching the workflow first? This Audacity tutorial pairs with the step-by-step process below."
              videoId="yzJ2VyYkmaA"
              title="Audacity audio editing tutorial"
            />
          );
        }

        if (block.text === "How to edit audio in GarageBand") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`garageband-video-${key}`}
              copy="Want the Mac workflow in video form? This GarageBand walkthrough fits the editing steps covered in this section."
              videoId="AVC3lEQ0ymo"
              title="GarageBand audio editing tutorial"
            />
          );
        }

        if (block.text === "How to edit audio in Audacity on Mac") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`audacity-mac-video-${key}`}
              copy="If you want the Audacity-on-Mac version demonstrated visually, this tutorial pairs with the Mac-specific setup and editing workflow in this section."
              videoId="Z2Q-C5kad54"
              title="Audacity on Mac tutorial"
            />
          );
        }

        if (block.text === "How to edit audio on Android with Lexis Audio Editor") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`lexis-video-${key}`}
              copy="Need the Android version in action? This Lexis Audio Editor tutorial shows the mobile workflow alongside the written steps below."
              videoId="bq-OEoEB4Zc"
              title="Lexis Audio Editor tutorial"
            />
          );
        }

        if (block.text === "How to capture system audio on Windows") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`windows-capture-video-${key}`}
              copy="Need to see the loopback setup in action? This tutorial walks through capturing system audio on Windows before you edit it in Audacity."
              videoId="xhuwo-q0fEY"
              title="How to capture system audio on Windows"
            />
          );
        }

        if (block.text === "How to edit audio online with Vocaroo") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`vocaroo-video-${key}`}
              copy="If you want the browser-based version demonstrated, this Vocaroo tutorial pairs with the lightweight online workflow in this section."
              videoId="IqXDqmfv46M"
              title="Vocaroo audio editing tutorial"
            />
          );
        }

        if (block.text === "Adobe Audition audio editing workflow") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`audition-video-${key}`}
              copy="This Adobe Audition walkthrough covers the voice editing workflow for creators who want more surgical control than Audacity offers."
              videoId="gn0q7BuPML8"
              title="Adobe Audition voice editing tutorial"
              footerHref="https://www.youtube.com/watch?v=RudduIk77zk&list=PL6wGbZVVzENnt2F3EgdHeM0X5RTcN3yIA"
              footerLabel="Watch the full Adobe Audition masterclass playlist"
            />
          );
        }

        if (block.text === "Adobe Podcast Enhance for audio cleanup") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`adobe-podcast-video-${key}`}
              copy="If you want to see Adobe Podcast cleanup in action first, this tutorial shows the core enhancement workflow covered in this section."
              videoId="y9pBvKh14G8"
              title="Adobe Podcast editing tutorial"
            />
          );
        }

        if (block.text === "Descript Studio Sound for audio editing") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`descript-video-${key}`}
              copy="This Descript tutorial shows how the transcript-based editing flow works before you apply Studio Sound and cleanup tools."
              videoId="6_TynUbev7I"
              title="Descript voice tutorial"
            />
          );
        }

        if (block.text === "Auphonic for podcast audio editing") {
          elements.push(
            <YouTubeTutorialEmbed
              key={`auphonic-video-${key}`}
              copy="If you want to automate podcast leveling and cleanup, this Auphonic walkthrough matches the workflow described in this section."
              videoId="TcXcFhJQRZU"
              title="Auphonic podcast audio editing tutorial"
            />
          );
        }
      }

      continue;
    }

    if (block.type === "paragraph") {
      elements.push(<p key={key}>{renderInlineMarkdown(block.text)}</p>);

      if (block.text.includes("I've grown to 33,000 subscribers.")) {
        elements.push(renderArticleArtwork(ARTICLE_ARTWORK.subscribers, `subscribers-${key}`));
      }

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
