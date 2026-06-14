import type { MetadataRoute } from "next";
import { toBlogIsoDateTime } from "@/lib/blog";
import { getAllBlogPosts } from "@/lib/blog-content";
import { getPostPath, isStatsPostSlug } from "@/lib/post-paths";
import { SITE_URL } from "@/lib/seo";
import { toolCatalog } from "@/lib/tool-catalog";
import fs from "fs";
import path from "path";

const NOW = new Date("2026-06-14");

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${SITE_URL}/about`,
    lastModified: new Date("2026-06-01"),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/blog`,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/stats`,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/stats/youtube`,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 0.85,
  },
  // Individual stats content pages live at /stats/* (not /blog/*)
  {
    url: `${SITE_URL}/stats/youtube-users`,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    url: `${SITE_URL}/stats/youtube-channels`,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    url: `${SITE_URL}/stats/youtube-subscribers-needed-to-make-money`,
    lastModified: new Date("2026-04-25T12:53:41+05:30"),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/stats/b2b`,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    url: `${SITE_URL}/stats/b2b-seo`,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    url: `${SITE_URL}/contact`,
    lastModified: new Date("2026-06-01"),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/tools`,
    lastModified: NOW,
    changeFrequency: "weekly",
    priority: 0.9,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getAllBlogPosts();

  // Exclude stats posts — they live at /stats/* and are in staticRoutes above
  const blogRoutes: MetadataRoute.Sitemap = blogPosts
    .filter((post) => !isStatsPostSlug(post.slug))
    .map((post) => ({
      url: `${SITE_URL}${getPostPath(post.slug)}`,
      lastModified: new Date(toBlogIsoDateTime(post.modifiedAt ?? post.publishedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));

  const toolRoutes: MetadataRoute.Sitemap = toolCatalog.map((tool) => {
    let lastModified = new Date("2026-05-26T00:00:00+05:30");
    try {
      const toolPath = path.join(process.cwd(), "src/app/(frontend)/(tools)", tool.slug, "tool.ts");
      const stat = fs.statSync(toolPath);
      lastModified = stat.mtime;
    } catch (e) {
      // Fallback to default date
    }
    return {
      url: `${SITE_URL}/${tool.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}
