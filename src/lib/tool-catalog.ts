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
  | "podcast-title-checker"
  // ── New tools ──────────────────────────────────────────────────────────────
  | "ctr-calculator"
  | "title-length-checker"
  | "description-length-checker"
  | "playback-speed-calculator"
  | "views-ratio-calculator"
  | "timestamp-remover"
  | "url-cleaner"
  | "video-id-finder"
  | "shorts-embedder"
  | "playlist-embedder"
  | "thumbnail-previewer"
  | "channel-age-checker"
  | "region-checker"
  | "upload-schedule"
  | "channel-compare"
  | "video-seo-checker"
  | "channel-video-links"
  | "rss-generator"
  | "comment-downloader"
  | "video-category-finder"
  | "playlist-link-extractor"
  | "shorts-trend";

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



import { toolDefinition as youtubeVideoIdeasGeneratorTool } from "@/app/(frontend)/(tools)/youtube-video-ideas-generator/tool";
import { toolDefinition as youtubeTagsGeneratorTool } from "@/app/(frontend)/(tools)/youtube-tags-generator/tool";
import { toolDefinition as youtubeTagsInspectorTool } from "@/app/(frontend)/(tools)/youtube-tags-inspector/tool";
import { toolDefinition as youtubeHashtagsGeneratorTool } from "@/app/(frontend)/(tools)/youtube-hashtags-generator/tool";
import { toolDefinition as youtubeHashtagsExtractorTool } from "@/app/(frontend)/(tools)/youtube-hashtags-extractor/tool";
import { toolDefinition as youtubeKeywordsGeneratorTool } from "@/app/(frontend)/(tools)/youtube-keywords-generator/tool";
import { toolDefinition as youtubeTitleGeneratorTool } from "@/app/(frontend)/(tools)/youtube-title-generator/tool";
import { toolDefinition as youtubeVideoDescriptionCopyTool } from "@/app/(frontend)/(tools)/youtube-video-description-copy/tool";
import { toolDefinition as youtubeChannelKeywordsCopyTool } from "@/app/(frontend)/(tools)/youtube-channel-keywords-copy/tool";
import { toolDefinition as youtubeChannelNameGeneratorTool } from "@/app/(frontend)/(tools)/youtube-channel-name-generator/tool";
import { toolDefinition as youtubeTop100Tool } from "@/app/(frontend)/(tools)/youtube-top-100/tool";
import { toolDefinition as youtubeMoneyCalculatorTool } from "@/app/(frontend)/(tools)/youtube-money-calculator/tool";
import { toolDefinition as youtubeBannerDownloaderTool } from "@/app/(frontend)/(tools)/youtube-banner-downloader/tool";
import { toolDefinition as youtubeThumbnailDownloaderTool } from "@/app/(frontend)/(tools)/youtube-thumbnail-downloader/tool";
import { toolDefinition as youtubeCommentPickerTool } from "@/app/(frontend)/(tools)/youtube-comment-picker/tool";
import { toolDefinition as youtubeChannelIdFinderTool } from "@/app/(frontend)/(tools)/youtube-channel-id-finder/tool";
import { toolDefinition as youtubeSubscribeLinkGeneratorTool } from "@/app/(frontend)/(tools)/youtube-subscribe-link-generator/tool";
import { toolDefinition as youtubeEmbedderTool } from "@/app/(frontend)/(tools)/youtube-embedder/tool";
import { toolDefinition as youtubeChannelSearchTool } from "@/app/(frontend)/(tools)/youtube-channel-search/tool";
import { toolDefinition as youtubeTimestampTool } from "@/app/(frontend)/(tools)/youtube-timestamp/tool";
import { toolDefinition as youtubePlaylistLengthCalculatorTool } from "@/app/(frontend)/(tools)/youtube-playlist-length-calculator/tool";
import { toolDefinition as youtubePlaylistToTextConverterTool } from "@/app/(frontend)/(tools)/youtube-playlist-to-text-converter/tool";
import { toolDefinition as youtubeDataViewerTool } from "@/app/(frontend)/(tools)/youtube-data-viewer/tool";
import { toolDefinition as youtubeCategoryCheckerTool } from "@/app/(frontend)/(tools)/youtube-category-checker/tool";
import { toolDefinition as youtubeCtrCalculatorTool } from "@/app/(frontend)/(tools)/youtube-ctr-calculator/tool";
import { toolDefinition as youtubeTitleLengthCheckerTool } from "@/app/(frontend)/(tools)/youtube-title-length-checker/tool";
import { toolDefinition as youtubeDescriptionLengthCheckerTool } from "@/app/(frontend)/(tools)/youtube-description-length-checker/tool";
import { toolDefinition as youtubePlaybackSpeedCalculatorTool } from "@/app/(frontend)/(tools)/youtube-playback-speed-calculator/tool";
import { toolDefinition as youtubeViewsRatioCalculatorTool } from "@/app/(frontend)/(tools)/youtube-views-ratio-calculator/tool";
import { toolDefinition as youtubeTimestampRemoverTool } from "@/app/(frontend)/(tools)/youtube-timestamp-remover/tool";
import { toolDefinition as youtubeUrlCleanerTool } from "@/app/(frontend)/(tools)/youtube-url-cleaner/tool";
import { toolDefinition as youtubeVideoIdFinderTool } from "@/app/(frontend)/(tools)/youtube-video-id-finder/tool";
import { toolDefinition as youtubeShortsEmbedCodeGeneratorTool } from "@/app/(frontend)/(tools)/youtube-shorts-embed-code-generator/tool";
import { toolDefinition as youtubePlaylistEmbedCodeGeneratorTool } from "@/app/(frontend)/(tools)/youtube-playlist-embed-code-generator/tool";
import { toolDefinition as youtubeThumbnailPreviewerTool } from "@/app/(frontend)/(tools)/youtube-thumbnail-previewer/tool";
import { toolDefinition as youtubeChannelAgeCheckerTool } from "@/app/(frontend)/(tools)/youtube-channel-age-checker/tool";
import { toolDefinition as youtubeRegionRestrictionCheckerTool } from "@/app/(frontend)/(tools)/youtube-region-restriction-checker/tool";
import { toolDefinition as youtubeUploadScheduleAnalyzerTool } from "@/app/(frontend)/(tools)/youtube-upload-schedule-analyzer/tool";
import { toolDefinition as youtubeChannelComparisonTool } from "@/app/(frontend)/(tools)/youtube-channel-comparison/tool";
import { toolDefinition as youtubeVideoSeoCheckerTool } from "@/app/(frontend)/(tools)/youtube-video-seo-checker/tool";
import { toolDefinition as youtubeChannelVideoLinksExtractorTool } from "@/app/(frontend)/(tools)/youtube-channel-video-links-extractor/tool";
import { toolDefinition as youtubeRssFeedGeneratorTool } from "@/app/(frontend)/(tools)/youtube-rss-feed-generator/tool";
import { toolDefinition as youtubeCommentDownloaderTool } from "@/app/(frontend)/(tools)/youtube-comment-downloader/tool";
import { toolDefinition as youtubeVideoCategoryFinderTool } from "@/app/(frontend)/(tools)/youtube-video-category-finder/tool";
import { toolDefinition as youtubePlaylistLinkExtractorTool } from "@/app/(frontend)/(tools)/youtube-playlist-link-extractor/tool";
import { toolDefinition as youtubeShortsTrendAnalyzerTool } from "@/app/(frontend)/(tools)/youtube-shorts-trend-analyzer/tool";
import { toolDefinition as podcastTitleGeneratorTool } from "@/app/(frontend)/(tools)/podcast-title-generator/tool";
import { toolDefinition as podcastTitleCheckerTool } from "@/app/(frontend)/(tools)/podcast-title-checker/tool";
import { toolDefinition as youtubeStartTimeLinkGeneratorTool } from "@/app/(frontend)/(tools)/youtube-start-time-link-generator/tool";
import { toolDefinition as youtubeTitleExtractorTool } from "@/app/(frontend)/(tools)/youtube-title-extractor/tool";
import { toolDefinition as youtubeDescriptionExtractorTool } from "@/app/(frontend)/(tools)/youtube-description-extractor/tool";
import { toolDefinition as youtubeMonetizationCheckerTool } from "@/app/(frontend)/(tools)/youtube-monetization-checker/tool";
import { toolDefinition as youtubeShadowbanDetectorTool } from "@/app/(frontend)/(tools)/youtube-shadowban-detector/tool";

export const toolCatalog: ToolDefinition[] = [
  youtubeVideoIdeasGeneratorTool,
  youtubeTagsGeneratorTool,
  youtubeTagsInspectorTool,
  youtubeHashtagsGeneratorTool,
  youtubeHashtagsExtractorTool,
  youtubeKeywordsGeneratorTool,
  youtubeTitleGeneratorTool,
  youtubeVideoDescriptionCopyTool,
  youtubeChannelKeywordsCopyTool,
  youtubeChannelNameGeneratorTool,
  youtubeTop100Tool,
  youtubeMoneyCalculatorTool,
  youtubeBannerDownloaderTool,
  youtubeThumbnailDownloaderTool,
  youtubeCommentPickerTool,
  youtubeChannelIdFinderTool,
  youtubeSubscribeLinkGeneratorTool,
  youtubeEmbedderTool,
  youtubeChannelSearchTool,
  youtubeTimestampTool,
  youtubePlaylistLengthCalculatorTool,
  youtubePlaylistToTextConverterTool,
  youtubeDataViewerTool,
  youtubeCategoryCheckerTool,
  youtubeCtrCalculatorTool,
  youtubeTitleLengthCheckerTool,
  youtubeDescriptionLengthCheckerTool,
  youtubePlaybackSpeedCalculatorTool,
  youtubeViewsRatioCalculatorTool,
  youtubeTimestampRemoverTool,
  youtubeUrlCleanerTool,
  youtubeVideoIdFinderTool,
  youtubeShortsEmbedCodeGeneratorTool,
  youtubePlaylistEmbedCodeGeneratorTool,
  youtubeThumbnailPreviewerTool,
  youtubeChannelAgeCheckerTool,
  youtubeRegionRestrictionCheckerTool,
  youtubeUploadScheduleAnalyzerTool,
  youtubeChannelComparisonTool,
  youtubeVideoSeoCheckerTool,
  youtubeChannelVideoLinksExtractorTool,
  youtubeRssFeedGeneratorTool,
  youtubeCommentDownloaderTool,
  youtubeVideoCategoryFinderTool,
  youtubePlaylistLinkExtractorTool,
  youtubeShortsTrendAnalyzerTool,
  podcastTitleGeneratorTool,
  podcastTitleCheckerTool,
  youtubeStartTimeLinkGeneratorTool,
  youtubeTitleExtractorTool,
  youtubeDescriptionExtractorTool,
  youtubeMonetizationCheckerTool,
  youtubeShadowbanDetectorTool,
];

export function getToolBySlug(slug: string) {
  return toolCatalog.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory) {
  return toolCatalog.filter((tool) => tool.category === category);
}

const seoActionByKind: Partial<Record<GenericToolKind | "existing", string>> = {
  "idea-generator": "Generate Video Ideas Online",
  "tag-generator": "Generate Tags and Hashtags",
  "metadata-copy": "Copy Video Metadata Online",
  "channel-keywords-copy": "Extract Channel Keywords",
  "keyword-generator": "Find YouTube Keywords",
  "title-generator": "Generate Clickable Titles",
  "name-generator": "Find Channel Name Ideas",
  "money-calculator": "Estimate YouTube Earnings",
  "top100-analyzer": "Live Channel Rankings",
  "channel-id-finder": "Find Channel IDs Online",
  "subscribe-link": "Create Subscribe Links",
  "video-embedder": "Generate Embed Code",
  "channel-search": "Search Channels Online",
  "timestamp": "Create Timestamp Links",
  "playlist-length": "Calculate Playlist Length",
  "playlist-to-text": "Export Playlist Videos",
  "data-viewer": "View Video Data Online",
  "tags-inspector": "Extract Video Tags Online",
  "category-checker": "Check Video Categories",
  "thumbnail-downloader": "Download HD Thumbnails",
  "banner-downloader": "Download Channel Banners",
  "comment-picker": "Pick Giveaway Winners",
  "podcast-title-generator": "Generate Episode Titles",
  "podcast-title-checker": "Analyze Episode Titles",
  "ctr-calculator": "Calculate Video CTR",
  "title-length-checker": "Check Title Length",
  "description-length-checker": "Check Description Length",
  "playback-speed-calculator": "Calculate Watch Time",
  "views-ratio-calculator": "Calculate Views Ratio",
  "timestamp-remover": "Remove Video Timestamps",
  "url-cleaner": "Clean YouTube URLs",
  "video-id-finder": "Find Video IDs Online",
  "shorts-embedder": "Generate Shorts Embed Code",
  "playlist-embedder": "Generate Playlist Embed Code",
  "thumbnail-previewer": "Preview Thumbnails Online",
  "channel-age-checker": "Check Channel Age",
  "region-checker": "Check Region Restrictions",
  "upload-schedule": "Analyze Upload Schedules",
  "channel-compare": "Compare YouTube Channels",
  "video-seo-checker": "Audit Video SEO",
  "channel-video-links": "Extract Channel Video Links",
  "rss-generator": "Create Channel RSS Feeds",
  "comment-downloader": "Export Video Comments",
  "video-category-finder": "Find Video Categories",
  "playlist-link-extractor": "Extract Playlist Links",
  "shorts-trend": "Find Shorts Trends",
};

function clampMetaDescription(value: string) {
  if (value.length <= 158) {
    return value;
  }

  return value;
}

function getToolWorkflowLabel(category: ToolCategory) {
  switch (category) {
    case "YouTube SEO & Optimization":
      return "YouTube SEO research";
    case "YouTube Analytics & Monetization":
      return "YouTube analytics";
    case "YouTube Media Downloaders":
      return "YouTube media research";
    case "Engagement & Interaction":
      return "creator engagement";
    case "YouTube Video & Channel Utilities":
      return "YouTube channel workflows";
    case "Podcast Tools":
      return "podcast publishing";
  }
}

export function getToolSeoTitle(tool: ToolDefinition) {
  const action = seoActionByKind[tool.kind] ?? tool.highlights[0] ?? "Use Online";
  const title = `${tool.title} - ${action}`;

  if (title.length <= 60) {
    return title;
  }

  return tool.title.length <= 58 ? tool.title : `${tool.keyword.replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
}

export function getToolSeoDescription(tool: ToolDefinition) {
  const workflow = getToolWorkflowLabel(tool.category);
  const description = `${tool.shortDescription} No signup required. Get fast, copy-ready results for ${workflow}.`;

  if (description.length <= 158) {
    return description;
  }

  return clampMetaDescription(`${tool.shortDescription} No signup required. Copy results instantly.`);
}
