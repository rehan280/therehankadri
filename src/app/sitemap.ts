import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog-content";
import { getPostPath } from "@/lib/post-paths";
import { SITE_URL } from "@/lib/seo";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${SITE_URL}/about`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/blog`,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/stats`,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/stats/youtube`,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/stats/b2b`,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/contact`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/tools`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/youtube-tags-generator`,
    changeFrequency: "weekly",
    priority: 0.8,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getAllBlogPosts();

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}${getPostPath(post.slug)}`,
    lastModified: new Date(`${(post.modifiedAt ?? post.publishedAt)}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}

