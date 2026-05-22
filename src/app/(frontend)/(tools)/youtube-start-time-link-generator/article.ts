import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { marked } from "marked";

export type FaqEntry = {
  question: string;
  answer: string;
};

export type YouTubeStartTimeArticle = {
  title: string;
  html: string;
  wordCount: number;
  faqEntries: FaqEntry[];
};

const articlePath = path.join(
  process.cwd(),
  "src",
  "app",
  "(frontend)",
  "(tools)",
  "youtube-start-time-link-generator",
  "article.md"
);

const faqEntries: FaqEntry[] = [
  {
    question: "How do I create a YouTube link that starts at a specific time?",
    answer:
      "Paste the YouTube URL into the generator, enter the start time in hours, minutes, and seconds, click generate, and copy the new link.",
  },
  {
    question: "What is the ?t= parameter in a YouTube URL?",
    answer:
      "?t= is YouTube's timestamp parameter for start time. A value like ?t=90 starts the video at 90 seconds.",
  },
  {
    question: "Why does a YouTube timestamp link fail on mobile?",
    answer:
      "The YouTube mobile app does not always expose the desktop-style Start at share option. A youtu.be link with a timestamp is usually the most reliable mobile-friendly format.",
  },
  {
    question: "Can I set both a start time and an end time on YouTube?",
    answer:
      "Start time works on normal YouTube links, but end time is reliable only on embed URLs using the start and end parameters together.",
  },
  {
    question: "Does this tool work with YouTube Shorts?",
    answer:
      "It can parse Shorts URLs and generate timestamped links, but Shorts players can ignore timestamp parameters more often than standard YouTube videos.",
  },
  {
    question: "What is the difference between ?t= and &t= in a YouTube URL?",
    answer:
      "Use ?t= when the URL has no existing query string and use &t= when the URL already contains parameters such as ?v= on a watch page.",
  },
  {
    question: "Will a YouTube timestamp link open in the YouTube app?",
    answer:
      "A youtu.be timestamp link often deep-links into the YouTube app on mobile devices, which is why it is a strong default sharing format.",
  },
  {
    question: "Why does the video sometimes start a second or two early?",
    answer:
      "YouTube players often jump to the nearest keyframe before the requested second, so playback can begin slightly earlier than the exact timestamp.",
  },
  {
    question: "How are comment timestamps different from URL timestamps?",
    answer:
      "Comment timestamps like 3:45 are clickable only inside YouTube. Timestamp URLs work anywhere you can share a normal link.",
  },
  {
    question: "Do timestamp links help YouTube SEO?",
    answer:
      "Timestamps and chapters can improve usability, create key moments in search, and expand the surface area a video can rank for in Google and YouTube.",
  },
];

export async function getYouTubeStartTimeArticle(): Promise<YouTubeStartTimeArticle> {
  const markdown = await fs.readFile(articlePath, "utf8");
  const html = await marked.parse(markdown);
  const headingMatch = markdown.match(/^#\s+(.+)$/m);
  const title = headingMatch?.[1]?.trim() || "YouTube Start Time Link Generator";
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;

  return {
    title,
    html,
    wordCount,
    faqEntries,
  };
}

export { faqEntries as youtubeStartTimeFaqEntries };
