import "server-only";

import type { BlogCategory, BlogPost } from "@/lib/blog";
import {
  getVisibleBlogCategories,
  getVisibleBlogPostBySlug,
  getVisibleManagedBlogPosts,
  getVisibleRelatedBlogPosts,
} from "@/lib/blog-cms";

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return (await getVisibleManagedBlogPosts()) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return (await getVisibleBlogPostBySlug(slug)) as BlogPost | undefined;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return (await getVisibleBlogCategories()) as BlogCategory[];
}

export async function getRelatedBlogPosts(currentSlug: string): Promise<BlogPost[]> {
  return (await getVisibleRelatedBlogPosts(currentSlug)) as BlogPost[];
}
