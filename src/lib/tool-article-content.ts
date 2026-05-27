import "server-only";

import path from "node:path";
import { readAndParseArticle, type ParsedArticle } from "./tool-article-parser";

export async function getToolArticleContent(slug: string): Promise<ParsedArticle | null> {
  const articlePath = path.join(process.cwd(), "public", "tools", "articles", `${slug}.md`);
  return await readAndParseArticle(articlePath);
}

// Ensure backwards compatibility types if any are strictly imported
// We just export the ParsedArticle from the parser as ToolArticleContent for ease
export type ToolArticleContent = ParsedArticle;
