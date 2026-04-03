import "server-only";

import { cache } from "react";
import type { BlogCategory, BlogPost } from "@/lib/blog";
import { getVisibleManagedBlogPosts } from "@/lib/blog-cms";

const getCachedVisibleBlogPosts = cache(async (): Promise<BlogPost[]> => {
  return (await getVisibleManagedBlogPosts()) as BlogPost[];
});

export const getAllBlogPosts = getCachedVisibleBlogPosts;

export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | undefined> => {
    const posts = await getCachedVisibleBlogPosts();
    return posts.find((post) => post.slug === slug);
  }
);

export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  const posts = await getCachedVisibleBlogPosts();
  const categoryMap = new Map<string, BlogCategory>();

  posts.forEach((post) => {
    categoryMap.set(post.category.slug, post.category);
  });

  return Array.from(categoryMap.values());
});

export const getRelatedBlogPosts = cache(
  async (currentSlug: string): Promise<BlogPost[]> => {
    const posts = await getCachedVisibleBlogPosts();
    return posts.filter((post) => post.slug !== currentSlug).slice(0, 3);
  }
);
