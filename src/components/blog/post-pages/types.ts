import type { ReactNode } from "react";
import type { BlogFaqEntry, BlogPost } from "@/lib/blog";

export type BlogPostHeadingItem = {
  id: string;
  title: string;
};

export type BlogPostStructuredDataContext = {
  post: BlogPost;
  canonicalUrl: string;
  socialImage: string;
  readTime: string;
};

export type BlogPostArticleEntities = {
  about?: Array<Record<string, unknown>>;
  mentions?: Array<Record<string, unknown>>;
};

export type BlogPostModule = {
  slug: string;
  getFaqEntries?: (post: BlogPost) => BlogFaqEntry[];
  getHeadingItems?: (post: BlogPost) => Promise<BlogPostHeadingItem[]> | BlogPostHeadingItem[];
  getWordCount?: (post: BlogPost) => number;
  getArticleEntities?: (post: BlogPost) => BlogPostArticleEntities | undefined;
  getHowToJsonLd?: (
    context: BlogPostStructuredDataContext
  ) => Record<string, unknown> | null;
  getAdditionalJsonLd?: (
    context: BlogPostStructuredDataContext
  ) => Array<Record<string, unknown>> | null;
  renderArticle: (input: {
    post: BlogPost;
    faqSection: ReactNode | null;
  }) => Promise<ReactNode> | ReactNode;
  rendersFaqInternally?: boolean;
};
