import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Default rule for all bots
        userAgent: "*",
        allow: [
          "/",
          "/blog/",
          "/stats/",
          "/tools/",
          "/about",
          "/contact",
          "/glossary/",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/actions/",
        ],
      },
      {
        // Let Google Image bot crawl freely for image search
        userAgent: "Googlebot-Image",
        allow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
