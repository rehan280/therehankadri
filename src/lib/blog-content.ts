import "server-only";

import { cache } from "react";
import { blogPosts as legacyBlogPosts } from "@/lib/blog";

export const getAllBlogPosts = cache(async () => legacyBlogPosts);

export const getBlogPostBySlug = cache(async (slug: string) =>
  legacyBlogPosts.find((post) => post.slug === slug)
);

export const getBlogCategories = cache(async () => {
  const categoryMap = new Map<string, (typeof legacyBlogPosts)[number]["category"]>();

  legacyBlogPosts.forEach((post) => {
    categoryMap.set(post.category.slug, post.category);
  });

  return Array.from(categoryMap.values());
});

export const getRelatedBlogPosts = cache(async (currentSlug: string) =>
  legacyBlogPosts.filter((post) => post.slug !== currentSlug).slice(0, 3)
);
