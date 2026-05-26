export type ToolCategory =
  | "YouTube SEO & Optimization"
  | "YouTube Analytics & Monetization"
  | "YouTube Media Downloaders"
  | "Engagement & Interaction"
  | "YouTube Video & Channel Utilities"
  | "Podcast Tools";

export type GenericToolKind =
  | "idea-generator"
  | "tag-generator"
  | "metadata-copy"
  | "channel-keywords-copy"
  | "keyword-generator"
  | "title-generator"
  | "name-generator"
  | "money-calculator"
  | "top100-analyzer"
  | "channel-id-finder"
  | "subscribe-link"
  | "video-embedder"
  | "channel-search"
  | "timestamp"
  | "playlist-length"
  | "playlist-to-text"
  | "data-viewer"
  | "category-checker"
  | "thumbnail-downloader"
  | "banner-downloader"
  | "comment-picker"
  | "podcast-title-generator"
  | "podcast-title-checker";

export type ToolDefinition = {
  slug: string;
  title: string;
  keyword: string;
  category: ToolCategory;
  shortDescription: string;
  intro: string;
  kind: GenericToolKind | "existing";
  highlights: string[];
  sourceUrl?: string;
};

export const toolCategories: ToolCategory[] = [
  "YouTube SEO & Optimization",
  "YouTube Analytics & Monetization",
  "YouTube Media Downloaders",
  "Engagement & Interaction",
  "YouTube Video & Channel Utilities",
  "Podcast Tools",
];

export const toolCatalog: ToolDefinition[] = [
  {
    slug: "youtube-video-ideas-generator",
    title: "YouTube Video Ideas Generator",
    keyword: "youtube video ideas generator",
    category: "YouTube SEO & Optimization",
    kind: "idea-generator",
    shortDescription: "Generate practical video ideas from a channel topic or keyword.",
    intro: "Use this tool when you need fresh angles for a YouTube topic without staring at a blank page.",
    highlights: ["Topic ideas", "Shorts angles", "Copy-ready"],
    sourceUrl: "https://www.tunepocket.com/youtube-video-ideas-generator/",
  },
  {
    slug: "youtube-tags-generator",
    title: "YouTube Tags Generator",
    keyword: "youtube tags generator",
    category: "YouTube SEO & Optimization",
    kind: "existing",
    shortDescription: "Generate focused YouTube tags from a title or main keyword.",
    intro: "Turn one topic into a clean set of YouTube tags you can review, copy, and use.",
    highlights: ["SEO tags", "No login", "500 character workflow"],
    sourceUrl: "https://www.tunepocket.com/youtube-tags-generator/",
  },
  {
    slug: "youtube-tags-inspector",
    title: "YouTube Tags Extractor",
    keyword: "youtube tags extractor",
    category: "YouTube SEO & Optimization",
    kind: "metadata-copy",
    shortDescription: "Extract public YouTube tags and related metadata from a video URL.",
    intro: "Paste a public YouTube URL to inspect visible metadata and copy useful research fields.",
    highlights: ["Video metadata", "Copy tags", "Research friendly"],
    sourceUrl: "https://www.tunepocket.com/youtube-tags-inspector/",
  },
  {
    slug: "youtube-hashtags-generator",
    title: "YouTube Hashtags Generator",
    keyword: "youtube hashtags generator",
    category: "YouTube SEO & Optimization",
    kind: "tag-generator",
    shortDescription: "Create YouTube-friendly hashtags from a topic, title, or niche.",
    intro: "Generate a tidy hashtag set for descriptions, Shorts, and campaign drafts.",
    highlights: ["Hashtag ideas", "Shorts ready", "One-click copy"],
    sourceUrl: "https://www.tunepocket.com/youtube-hashtags-generator/",
  },
  {
    slug: "youtube-hashtags-extractor",
    title: "YouTube Hashtags Extractor",
    keyword: "youtube hashtags extractor",
    category: "YouTube SEO & Optimization",
    kind: "metadata-copy",
    shortDescription: "Pull hashtags from a public YouTube video description.",
    intro: "Use it to see how a video uses hashtags without manually scanning the description.",
    highlights: ["Extract hashtags", "Works with Shorts", "Copy output"],
    sourceUrl: "https://www.tunepocket.com/youtube-hashtags-extractor/",
  },
  {
    slug: "youtube-keywords-generator",
    title: "YouTube Keyword Generator",
    keyword: "youtube keyword generator",
    category: "YouTube SEO & Optimization",
    kind: "keyword-generator",
    shortDescription: "Generate YouTube keyword variations from a seed topic.",
    intro: "Build a quick keyword list for titles, tags, outlines, and content clusters.",
    highlights: ["Long-tail ideas", "Search intent", "Copy-ready"],
    sourceUrl: "https://www.tunepocket.com/youtube-keywords-generator/",
  },
  {
    slug: "youtube-title-generator",
    title: "YouTube Video Title Generator",
    keyword: "youtube title generator",
    category: "YouTube SEO & Optimization",
    kind: "title-generator",
    shortDescription: "Generate clickable YouTube title ideas from a video topic.",
    intro: "Draft title options with clear angles, benefits, and curiosity without going clickbait-heavy.",
    highlights: ["Title ideas", "CTR angles", "Copy-ready"],
    sourceUrl: "https://www.tunepocket.com/youtube-title-generator/",
  },
  {
    slug: "youtube-video-description-copy",
    title: "Video Description Copy",
    keyword: "youtube video description copy",
    category: "YouTube SEO & Optimization",
    kind: "metadata-copy",
    shortDescription: "Copy a public YouTube video's description and useful metadata.",
    intro: "Paste a YouTube URL to extract the description for research, audits, and swipe-file notes.",
    highlights: ["Description copy", "Metadata", "Download text"],
    sourceUrl: "https://www.tunepocket.com/youtube-video-description-copy/",
  },
  {
    slug: "youtube-channel-keywords-copy",
    title: "YouTube Channel Keywords Copy",
    keyword: "youtube channel keywords copy",
    category: "YouTube SEO & Optimization",
    kind: "channel-keywords-copy",
    shortDescription: "Extract and copy keyword tags directly from any YouTube channel.",
    intro: "Paste a YouTube channel URL to instantly reveal and copy their hidden channel keywords.",
    highlights: ["Channel SEO", "Niche keywords", "Copy-ready"],
    sourceUrl: "https://www.tunepocket.com/youtube-channel-keywords-copy/",
  },
  {
    slug: "youtube-channel-name-generator",
    title: "YouTube Channel Name Generator",
    keyword: "youtube channel name generator",
    category: "YouTube SEO & Optimization",
    kind: "name-generator",
    shortDescription: "Generate YouTube channel name ideas from your niche.",
    intro: "Brainstorm brandable names that still hint at what the channel is about.",
    highlights: ["Name ideas", "Brandable", "Niche aware"],
    sourceUrl: "https://www.tunepocket.com/youtube-channel-name-generator/",
  },
  {
    slug: "youtube-top-100",
    title: "YouTube Top 100 Channels",
    keyword: "youtube top 100 channels",
    category: "YouTube Analytics & Monetization",
    kind: "top100-analyzer",
    shortDescription: "Live tracker of the most subscribed YouTube channels globally.",
    intro: "A real-time leaderboard tracking the top YouTube channels updated automatically.",
    highlights: ["Live subscriber counts", "Global ranking", "Real-time stats"],
    sourceUrl: "https://www.tunepocket.com/youtube-top-100/",
  },
  {
    slug: "youtube-money-calculator",
    title: "YouTube Ad Money Calculator",
    keyword: "youtube money calculator",
    category: "YouTube Analytics & Monetization",
    kind: "money-calculator",
    shortDescription: "Estimate YouTube ad revenue from views, RPM, and monetized playback rate.",
    intro: "Use this calculator for rough planning, not as a guaranteed revenue forecast.",
    highlights: ["Revenue estimate", "RPM input", "Scenario planning"],
    sourceUrl: "https://www.tunepocket.com/youtube-money-calculator/",
  },
  {
    slug: "youtube-banner-downloader",
    title: "YouTube Banner Downloader",
    keyword: "youtube banner downloader",
    category: "YouTube Media Downloaders",
    kind: "banner-downloader",
    shortDescription: "Create quick channel banner search and save links from a channel handle or URL.",
    intro: "YouTube does not expose every banner reliably, so this helper gives you fast lookup links and clean notes.",
    highlights: ["Channel lookup", "Banner research", "Fast links"],
    sourceUrl: "https://www.tunepocket.com/youtube-banner-downloader/",
  },
  {
    slug: "youtube-thumbnail-downloader",
    title: "YouTube Thumbnail Downloader",
    keyword: "youtube thumbnail downloader",
    category: "YouTube Media Downloaders",
    kind: "thumbnail-downloader",
    shortDescription: "Get YouTube thumbnail image URLs in multiple resolutions.",
    intro: "Paste a video link and instantly open or copy the public thumbnail files YouTube serves.",
    highlights: ["HD thumbnails", "Video ID parser", "Copy URLs"],
    sourceUrl: "https://www.tunepocket.com/youtube-thumbnail-downloader/",
  },
  {
    slug: "youtube-comment-picker",
    title: "YouTube Comment Picker",
    keyword: "youtube comment picker",
    category: "Engagement & Interaction",
    kind: "comment-picker",
    shortDescription: "Paste comments and pick a random winner for giveaways or reviews.",
    intro: "A simple local picker for comment lists you already exported or copied.",
    highlights: ["Random picker", "Local only", "Fair shuffle"],
    sourceUrl: "https://www.tunepocket.com/youtube-comment-picker/",
  },
  {
    slug: "youtube-channel-id-finder",
    title: "YouTube Channel ID Finder",
    keyword: "youtube channel id finder",
    category: "YouTube Video & Channel Utilities",
    kind: "channel-id-finder",
    shortDescription: "Extract or build YouTube channel ID lookup links from a channel URL.",
    intro: "Paste a channel URL, handle, or custom slug to identify the useful channel path parts.",
    highlights: ["Channel URLs", "Handle parser", "Lookup links"],
    sourceUrl: "https://www.tunepocket.com/youtube-channel-id-finder/",
  },
  {
    slug: "youtube-subscribe-link-generator",
    title: "YouTube Subscribe Link Generator",
    keyword: "youtube subscribe link generator",
    category: "YouTube Video & Channel Utilities",
    kind: "subscribe-link",
    shortDescription: "Create a YouTube subscribe confirmation link from a channel URL.",
    intro: "Generate a cleaner subscription CTA link for bios, landing pages, and descriptions.",
    highlights: ["Subscribe CTA", "Channel links", "Copy-ready"],
    sourceUrl: "https://www.tunepocket.com/youtube-subscribe-link-generator/",
  },
  {
    slug: "youtube-embedder",
    title: "YouTube Video Embedder",
    keyword: "youtube video embedder",
    category: "YouTube Video & Channel Utilities",
    kind: "video-embedder",
    shortDescription: "Generate responsive YouTube iframe embed code from a video URL.",
    intro: "Paste a video URL and copy a website-ready embed snippet.",
    highlights: ["Iframe code", "Responsive option", "No login"],
    sourceUrl: "https://www.tunepocket.com/youtube-embedder/",
  },
  {
    slug: "youtube-channel-search",
    title: "YouTube Channel Search",
    keyword: "youtube channel search",
    category: "YouTube Video & Channel Utilities",
    kind: "channel-search",
    shortDescription: "Build quick YouTube channel and site-search links for a creator or topic.",
    intro: "Search YouTube faster by turning a topic, channel name, or handle into useful lookup links.",
    highlights: ["Search links", "Channel discovery", "Fast research"],
    sourceUrl: "https://www.tunepocket.com/youtube-channel-search/",
  },
  {
    slug: "youtube-timestamp",
    title: "YouTube Timestamp Generator",
    keyword: "youtube timestamp generator",
    category: "YouTube Video & Channel Utilities",
    kind: "timestamp",
    shortDescription: "Generate YouTube timestamp links and timestamp text from a video URL.",
    intro: "Share a video from the exact moment that matters.",
    highlights: ["Start links", "Timestamp text", "Embed URL"],
    sourceUrl: "https://www.tunepocket.com/youtube-timestamp/",
  },
  {
    slug: "youtube-playlist-length-calculator",
    title: "YouTube Playlist Length Calculator",
    keyword: "youtube playlist length calculator",
    category: "YouTube Video & Channel Utilities",
    kind: "playlist-length",
    shortDescription: "Add video durations and calculate total playlist watch time.",
    intro: "Paste durations like 12:34 or 1:02:10 on separate lines to total a playlist quickly.",
    highlights: ["Duration total", "Speed options", "Study planning"],
    sourceUrl: "https://www.tunepocket.com/youtube-playlist-length-calculator/",
  },
  {
    slug: "youtube-playlist-to-text-converter",
    title: "YouTube Playlist to Text Converter",
    keyword: "youtube playlist to text converter",
    category: "YouTube Video & Channel Utilities",
    kind: "playlist-to-text",
    shortDescription: "Format pasted playlist items into clean text, CSV, or numbered lists.",
    intro: "Use this after copying playlist titles or URLs into a plain text note.",
    highlights: ["Clean lists", "CSV output", "Copy-ready"],
    sourceUrl: "https://www.tunepocket.com/youtube-playlist-to-text-converter/",
  },
  {
    slug: "youtube-data-viewer",
    title: "YouTube Data Viewer",
    keyword: "youtube data viewer",
    category: "YouTube Video & Channel Utilities",
    kind: "data-viewer",
    shortDescription: "View public YouTube video metadata in a structured layout.",
    intro: "Paste a video URL to inspect title, description, tags, dates, and engagement metadata.",
    highlights: ["Metadata viewer", "Public data", "Copy fields"],
  },
  {
    slug: "youtube-category-checker",
    title: "YouTube Category Checker",
    keyword: "youtube category checker",
    category: "YouTube Video & Channel Utilities",
    kind: "category-checker",
    shortDescription: "Estimate the likely category and content angle for a YouTube video or topic.",
    intro: "Use it as a planning helper when categorizing video ideas or auditing competitors.",
    highlights: ["Category estimate", "Topic clues", "Creator notes"],
    sourceUrl: "https://www.tunepocket.com/youtube-category-checker/",
  },

  {
    slug: "podcast-title-generator",
    title: "Podcast Episode Title Generator",
    keyword: "podcast title generator",
    category: "Podcast Tools",
    kind: "podcast-title-generator",
    shortDescription: "Generate podcast episode title ideas from a topic or guest angle.",
    intro: "Turn a rough episode idea into clear, searchable, listener-friendly titles.",
    highlights: ["Episode titles", "SEO angles", "Copy-ready"],
    sourceUrl: "https://www.tunepocket.com/podcast-title-generator/",
  },
  {
    slug: "podcast-title-checker",
    title: "Podcast Episode Title Checker / Analyzer",
    keyword: "podcast title checker",
    category: "Podcast Tools",
    kind: "podcast-title-checker",
    shortDescription: "Score a podcast episode title for clarity, curiosity, and search intent.",
    intro: "Paste a title to get a quick editorial check before publishing.",
    highlights: ["Title score", "Clarity notes", "Podcast SEO"],
    sourceUrl: "https://www.tunepocket.com/podcast-title-checker/",
  },
  {
    slug: "youtube-start-time-link-generator",
    title: "YouTube Start Time Link Generator",
    keyword: "youtube start time link generator",
    category: "YouTube Video & Channel Utilities",
    kind: "existing",
    shortDescription: "Create clean YouTube links that start at a specific second.",
    intro: "Generate share links and embed links for a precise video moment.",
    highlights: ["Start links", "Embed ready", "No login"],
  },
  {
    slug: "youtube-title-extractor",
    title: "YouTube Title Extractor",
    keyword: "youtube title extractor",
    category: "YouTube SEO & Optimization",
    kind: "existing",
    shortDescription: "Extract the current title from a public YouTube video.",
    intro: "Useful for title research, competitor notes, and content audits.",
    highlights: ["Title research", "Metadata", "Copy-ready"],
  },
  {
    slug: "youtube-description-extractor",
    title: "YouTube Description Extractor",
    keyword: "youtube description extractor",
    category: "YouTube SEO & Optimization",
    kind: "existing",
    shortDescription: "Extract descriptions, tags, hashtags, and metadata from YouTube videos.",
    intro: "A quick way to review public video metadata for research.",
    highlights: ["Descriptions", "Tags", "Download .txt"],
  },
];

export function getToolBySlug(slug: string) {
  return toolCatalog.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory) {
  return toolCatalog.filter((tool) => tool.category === category);
}
