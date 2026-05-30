import type { ToolDefinition } from "@/lib/tool-catalog";

export const toolDefinition: ToolDefinition = {
    slug: "youtube-url-cleaner",
    title: "YouTube URL Cleaner",
    keyword: "youtube url cleaner",
    category: "YouTube Video & Channel Utilities",
    kind: "url-cleaner",
    shortDescription: "Clean YouTube URLs by removing tracking parameters and extra query strings.",
    intro: "Paste any messy YouTube link and get a short, clean version with all tracking parameters stripped out.",
    highlights: ["Strip tracking", "Minimal URL", "Copy-ready"],
  };
