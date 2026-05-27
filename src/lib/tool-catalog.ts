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
  | "tags-inspector"
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
    shortDescription: "Generate YouTube video ideas from any niche or keyword in seconds.",
    intro: "Get 10 video ideas in 30 seconds. Type your niche, hit generate, and your content calendar fills itself.",
    highlights: ["Topic ideas", "Shorts angles", "Copy-ready"],
  },
  {
    slug: "youtube-tags-generator",
    title: "YouTube Tags Generator",
    keyword: "youtube tags generator",
    category: "YouTube SEO & Optimization",
    kind: "existing",
    shortDescription: "Generate YouTube tags from a keyword and copy them in one click.",
    intro: "Type a topic, get a full tag set optimized for YouTube search. Copy and paste into YouTube Studio.",
    highlights: ["SEO tags", "No login", "500 character workflow"],
  },
  {
    slug: "youtube-tags-inspector",
    title: "YouTube Tags Extractor",
    keyword: "youtube tags extractor",
    category: "YouTube SEO & Optimization",
    kind: "tags-inspector",
    shortDescription: "Extract hidden YouTube video tags from any public URL instantly.",
    intro: "Paste any YouTube URL and see every tag the creator used. No guessing, no browser extensions.",
    highlights: ["Video metadata", "Copy tags", "Research friendly"],
  },
  {
    slug: "youtube-hashtags-generator",
    title: "YouTube Hashtags Generator",
    keyword: "youtube hashtags generator",
    category: "YouTube SEO & Optimization",
    kind: "tag-generator",
    shortDescription: "Generate YouTube hashtags from any topic or video title for free.",
    intro: "Type your topic and get a full hashtag set ready to paste into your description. Works for Shorts too.",
    highlights: ["Hashtag ideas", "Shorts ready", "One-click copy"],
  },
  {
    slug: "youtube-hashtags-extractor",
    title: "YouTube Hashtags Extractor",
    keyword: "youtube hashtags extractor",
    category: "YouTube SEO & Optimization",
    kind: "metadata-copy",
    shortDescription: "Extract all hashtags from any YouTube video description in one click.",
    intro: "Paste a YouTube URL and see every hashtag the creator used. No scrolling, no manual copying.",
    highlights: ["Extract hashtags", "Works with Shorts", "Copy output"],
  },
  {
    slug: "youtube-keywords-generator",
    title: "YouTube Keyword Generator",
    keyword: "youtube keyword generator",
    category: "YouTube SEO & Optimization",
    kind: "keyword-generator",
    shortDescription: "Generate YouTube keyword ideas from a seed topic to rank in search.",
    intro: "Type one topic and get a full keyword list. Use them in your titles, tags, and descriptions to get found.",
    highlights: ["Long-tail ideas", "Search intent", "Copy-ready"],
  },
  {
    slug: "youtube-title-generator",
    title: "YouTube Video Title Generator",
    keyword: "youtube title generator",
    category: "YouTube SEO & Optimization",
    kind: "title-generator",
    shortDescription: "Generate YouTube video title ideas that get clicks and rank in search.",
    intro: "Stop staring at a blank title field. Type your topic and get 10 title options with different hooks and formats.",
    highlights: ["Title ideas", "CTR angles", "Copy-ready"],
  },
  {
    slug: "youtube-video-description-copy",
    title: "Video Description Copy",
    keyword: "youtube video description copy",
    category: "YouTube SEO & Optimization",
    kind: "metadata-copy",
    shortDescription: "Copy any YouTube video description instantly for research and SEO audits.",
    intro: "Paste any YouTube URL and copy the full description in one click. No more manual copy-paste or Show More scrolling.",
    highlights: ["Description copy", "Metadata", "Download text"],
  },
  {
    slug: "youtube-channel-keywords-copy",
    title: "YouTube Channel Keywords Copy",
    keyword: "youtube channel keywords copy",
    category: "YouTube SEO & Optimization",
    kind: "channel-keywords-copy",
    shortDescription: "Extract hidden YouTube channel keywords from any public channel URL.",
    intro: "See the exact channel keywords any creator uses in their YouTube Studio settings. Paste their URL and copy the list.",
    highlights: ["Channel SEO", "Niche keywords", "Copy-ready"],
  },
  {
    slug: "youtube-channel-name-generator",
    title: "YouTube Channel Name Generator",
    keyword: "youtube channel name generator",
    category: "YouTube SEO & Optimization",
    kind: "name-generator",
    shortDescription: "Generate brandable YouTube channel name ideas from your niche in seconds.",
    intro: "Stuck on a channel name? Type your niche and get 20 ideas. Brandable, memorable, and niche-ready.",
    highlights: ["Name ideas", "Brandable", "Niche aware"],
  },
  {
    slug: "youtube-top-100",
    title: "YouTube Top 100 Channels",
    keyword: "youtube top 100 channels",
    category: "YouTube Analytics & Monetization",
    kind: "top100-analyzer",
    shortDescription: "Real-time leaderboard of the 100 most subscribed YouTube channels worldwide.",
    intro: "See who's winning YouTube right now. Live subscriber counts for the top 100 channels, updated automatically.",
    highlights: ["Live subscriber counts", "Global ranking", "Real-time stats"],
  },
  {
    slug: "youtube-money-calculator",
    title: "YouTube Ad Money Calculator",
    keyword: "youtube money calculator",
    category: "YouTube Analytics & Monetization",
    kind: "money-calculator",
    shortDescription: "Calculate YouTube ad revenue estimates from your views and RPM rate.",
    intro: "Enter your view count and niche RPM. See your estimated YouTube earnings in 10 seconds.",
    highlights: ["Revenue estimate", "RPM input", "Scenario planning"],
  },
  {
    slug: "youtube-banner-downloader",
    title: "YouTube Banner Downloader",
    keyword: "youtube banner downloader",
    category: "YouTube Media Downloaders",
    kind: "banner-downloader",
    shortDescription: "Download YouTube channel banners for design research and inspiration.",
    intro: "Paste a channel URL and get fast access to their banner image. Great for competitor research and design inspiration.",
    highlights: ["Channel lookup", "Banner research", "Fast links"],
  },
  {
    slug: "youtube-thumbnail-downloader",
    title: "YouTube Thumbnail Downloader",
    keyword: "youtube thumbnail downloader",
    category: "YouTube Media Downloaders",
    kind: "thumbnail-downloader",
    shortDescription: "Download any YouTube thumbnail in HD from a video URL for free.",
    intro: "Paste any YouTube video URL and download the full HD thumbnail in one click. All resolutions available.",
    highlights: ["HD thumbnails", "Video ID parser", "Copy URLs"],
  },
  {
    slug: "youtube-comment-picker",
    title: "YouTube Comment Picker",
    keyword: "youtube comment picker",
    category: "Engagement & Interaction",
    kind: "existing",
    shortDescription: "Pick a random YouTube comment winner for giveaways, fairly and instantly.",
    intro: "Run a fair comment giveaway in 60 seconds. Paste your comments, click pick, get your winner.",
    highlights: ["Random picker", "API powered", "Fair shuffle"],
  },
  {
    slug: "youtube-channel-id-finder",
    title: "YouTube Channel ID Finder",
    keyword: "youtube channel id finder",
    category: "YouTube Video & Channel Utilities",
    kind: "channel-id-finder",
    shortDescription: "Find any YouTube channel ID from a URL, handle, or custom channel link.",
    intro: "Paste any channel URL and get the permanent UC channel ID in one click. Works with all YouTube URL formats.",
    highlights: ["Channel URLs", "Handle parser", "Lookup links"],
  },
  {
    slug: "youtube-subscribe-link-generator",
    title: "YouTube Subscribe Link Generator",
    keyword: "youtube subscribe link generator",
    category: "YouTube Video & Channel Utilities",
    kind: "subscribe-link",
    shortDescription: "Create a YouTube subscribe link that opens the subscription dialog instantly.",
    intro: "Generate a one-click subscribe link for your bio, email, and descriptions. Fewer steps means more subscribers.",
    highlights: ["Subscribe CTA", "Channel links", "Copy-ready"],
  },
  {
    slug: "youtube-embedder",
    title: "YouTube Video Embedder",
    keyword: "youtube video embedder",
    category: "YouTube Video & Channel Utilities",
    kind: "video-embedder",
    shortDescription: "Generate YouTube video embed code for any website from a video URL.",
    intro: "Paste a YouTube URL, copy the iframe code, and embed it on any website or blog. Done in 10 seconds.",
    highlights: ["Iframe code", "Responsive option", "No login"],
  },
  {
    slug: "youtube-channel-search",
    title: "YouTube Channel Search",
    keyword: "youtube channel search",
    category: "YouTube Video & Channel Utilities",
    kind: "channel-search",
    shortDescription: "Search YouTube channels by topic, name, or niche with targeted search links.",
    intro: "Type a niche or creator name and get targeted YouTube channel search links. Find competitors in seconds.",
    highlights: ["Search links", "Channel discovery", "Fast research"],
  },
  {
    slug: "youtube-timestamp",
    title: "YouTube Timestamp Generator",
    keyword: "youtube timestamp generator",
    category: "YouTube Video & Channel Utilities",
    kind: "timestamp",
    shortDescription: "Generate YouTube timestamp links to share any video at a specific second.",
    intro: "Share any YouTube video from the exact moment you want. Paste a URL, enter seconds, copy your link.",
    highlights: ["Start links", "Timestamp text", "Embed URL"],
  },
  {
    slug: "youtube-playlist-length-calculator",
    title: "YouTube Playlist Length Calculator",
    keyword: "youtube playlist length calculator",
    category: "YouTube Video & Channel Utilities",
    kind: "playlist-length",
    shortDescription: "Calculate the total length of any YouTube playlist in seconds.",
    intro: "Paste a YouTube playlist URL and get the total watch time instantly. See how long it takes at 1.5x or 2x speed too.",
    highlights: ["Duration total", "Speed options", "Study planning"],
  },
  {
    slug: "youtube-playlist-to-text-converter",
    title: "YouTube Playlist to Text Converter",
    keyword: "youtube playlist to text converter",
    category: "YouTube Video & Channel Utilities",
    kind: "playlist-to-text",
    shortDescription: "Export any YouTube playlist to CSV, JSON, or text for analysis.",
    intro: "Turn any YouTube playlist into a spreadsheet, JSON file, or plain text list. Pick your format and download.",
    highlights: ["Clean lists", "CSV output", "Copy-ready"],
  },
  {
    slug: "youtube-data-viewer",
    title: "YouTube Data Viewer",
    keyword: "youtube data viewer",
    category: "YouTube Video & Channel Utilities",
    kind: "data-viewer",
    shortDescription: "View all public YouTube video metadata in one clean, structured layout.",
    intro: "Paste a video URL and see every metadata field in one place. Title, description, tags, views, dates, all of it.",
    highlights: ["Metadata viewer", "Public data", "Copy fields"],
  },
  {
    slug: "youtube-category-checker",
    title: "YouTube Category Checker",
    keyword: "youtube category checker",
    category: "YouTube Video & Channel Utilities",
    kind: "category-checker",
    shortDescription: "Find the right YouTube category for your video topic before you upload.",
    intro: "Not sure which YouTube category fits your video? Type your topic and get a recommendation with notes on why.",
    highlights: ["Category estimate", "Topic clues", "Creator notes"],
  },

  {
    slug: "podcast-title-generator",
    title: "Podcast Episode Title Generator",
    keyword: "podcast title generator",
    category: "Podcast Tools",
    kind: "podcast-title-generator",
    shortDescription: "Generate podcast episode title ideas that get clicks in podcast app feeds.",
    intro: "Type your episode topic and get 10 title ideas. Benefit-led, curiosity-driven, and search-optimized for Spotify and Apple.",
    highlights: ["Episode titles", "SEO angles", "Copy-ready"],
  },
  {
    slug: "podcast-title-checker",
    title: "Podcast Episode Title Checker / Analyzer",
    keyword: "podcast title checker",
    category: "Podcast Tools",
    kind: "podcast-title-checker",
    shortDescription: "Score your podcast episode title for clarity, curiosity, and searchability.",
    intro: "Paste your episode title and get a score out of 100 with specific feedback. Know if it's good before you publish.",
    highlights: ["Title score", "Clarity notes", "Podcast SEO"],
  },
  {
    slug: "youtube-start-time-link-generator",
    title: "YouTube Start Time Link Generator",
    keyword: "youtube start time link generator",
    category: "YouTube Video & Channel Utilities",
    kind: "existing",
    shortDescription: "Create YouTube links that start at a specific time for sharing and embedding.",
    intro: "Share any YouTube video from the exact second you want. Enter your start time, copy your link, done.",
    highlights: ["Start links", "Embed ready", "No login"],
  },
  {
    slug: "youtube-title-extractor",
    title: "YouTube Title Extractor",
    keyword: "youtube title extractor",
    category: "YouTube SEO & Optimization",
    kind: "existing",
    shortDescription: "Extract any YouTube video title from a URL for research and audits.",
    intro: "Paste a YouTube URL and copy the exact current title in one click. Build your swipe file faster.",
    highlights: ["Title research", "Metadata", "Copy-ready"],
  },
  {
    slug: "youtube-description-extractor",
    title: "YouTube Description Extractor",
    keyword: "youtube description extractor",
    category: "YouTube SEO & Optimization",
    kind: "existing",
    shortDescription: "Extract the full description, tags, and hashtags from any YouTube video.",
    intro: "Paste a YouTube URL and get the complete description, all tags, and all hashtags in one pull. Download as a text file.",
    highlights: ["Descriptions", "Tags", "Download .txt"],
  },
];

export function getToolBySlug(slug: string) {
  return toolCatalog.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory) {
  return toolCatalog.filter((tool) => tool.category === category);
}
