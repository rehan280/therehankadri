import "server-only";

import { cache } from "react";
import type { BlogCategory, BlogPost } from "@/lib/blog";
import { getVisibleManagedBlogPosts } from "@/lib/blog-cms";
import { isStatsPostSlug } from "@/lib/post-paths";

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
    const currentPost = posts.find((post) => post.slug === currentSlug);

    if (!currentPost) {
      return posts.filter((post) => post.slug !== currentSlug).slice(0, 3);
    }

    const currentSubcategories = new Set(
      currentPost.subcategories.map((subcategory) => subcategory.toLowerCase())
    );
    const currentIsStatsPost = isStatsPostSlug(currentPost.slug);

    return posts
      .filter((post) => post.slug !== currentSlug)
      .map((post) => {
        let score = 0;

        if (post.category.slug === currentPost.category.slug) {
          score += 4;
        }

        if (isStatsPostSlug(post.slug) === currentIsStatsPost) {
          score += 3;
        }

        const sharedSubcategoryCount = post.subcategories.reduce((count, subcategory) => {
          return count + (currentSubcategories.has(subcategory.toLowerCase()) ? 1 : 0);
        }, 0);

        score += sharedSubcategoryCount * 3;

        if (post.author.name === currentPost.author.name) {
          score += 1;
        }

        return {
          post,
          score,
        };
      })
      .sort((firstEntry, secondEntry) => {
        if (secondEntry.score !== firstEntry.score) {
          return secondEntry.score - firstEntry.score;
        }

        return secondEntry.post.publishedAt.localeCompare(firstEntry.post.publishedAt);
      })
      .slice(0, 3)
      .map(({ post }) => post);
  }
);
