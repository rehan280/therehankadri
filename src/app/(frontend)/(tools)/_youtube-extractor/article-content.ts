import "server-only";

import { cache } from "react";
import path from "node:path";
import { readAndParseArticle } from "@/lib/tool-article-parser";

export type {
  ArticleBlock,
  ArticleSection,
  FaqEntry,
  ParsedArticle as ParsedExtractorArticle,
} from "@/lib/tool-article-parser";

const titleExtractorArticlePath = path.join(
  process.cwd(),
  "public",
  "tools",
  "yt-title-extractor",
  "youtube-title-extractor-article.md"
);
const descriptionExtractorArticlePath = path.join(
  process.cwd(),
  "public",
  "tools",
  "youtube-description-generator",
  "youtube-metadata-extractor-article.md"
);

export const getYouTubeTitleExtractorArticle = cache(async () => {
  const result = await readAndParseArticle(titleExtractorArticlePath);
  return result!; // We assert it exists since these are predefined
});

export const getYouTubeDescriptionExtractorArticle = cache(async () => {
  const result = await readAndParseArticle(descriptionExtractorArticlePath);
  return result!; // We assert it exists since these are predefined
});
