import type { BlogCategory } from "@/lib/blog";

export const blogCategoryMap = {
  authority: {
    slug: "authority",
    name: "Authority",
    description: "Trust-building content for founders and category leaders.",
  },
  content: {
    slug: "content",
    name: "Content",
    description: "Editorial systems that compound across channels.",
  },
  pipeline: {
    slug: "pipeline",
    name: "Pipeline",
    description: "Funnel design that qualifies intent before sales gets involved.",
  },
  seo: {
    slug: "seo",
    name: "SEO",
    description: "Search systems designed for revenue, not vanity traffic.",
  },
  statistics: {
    slug: "statistics",
    name: "Statistics",
    description: "Research-backed platform and market statistics pages.",
  },
} satisfies Record<string, BlogCategory>;

export const blogCategoryOptions = Object.values(blogCategoryMap).map((category) => ({
  label: category.name,
  value: category.slug,
}));

export type BlogCategorySlug = keyof typeof blogCategoryMap;

export function getBlogCategory(slug: string): BlogCategory {
  return blogCategoryMap[slug as BlogCategorySlug] ?? {
    slug,
    name: slug,
    description: "",
  };
}
