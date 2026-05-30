import type { ToolDefinition } from "@/lib/tool-catalog";

export const toolDefinition: ToolDefinition = {
    slug: "youtube-timestamp-remover",
    title: "YouTube Timestamp Remover",
    keyword: "youtube timestamp remover",
    category: "YouTube Video & Channel Utilities",
    kind: "timestamp-remover",
    shortDescription: "Remove the timestamp from any YouTube link to share from the beginning.",
    intro: "Paste a YouTube URL with a timestamp and get a clean link that starts from the beginning. Works with all YouTube URL formats.",
    highlights: ["Clean URLs", "Remove ?t=", "Instant"],
  };
