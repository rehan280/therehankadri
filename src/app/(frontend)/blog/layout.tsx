import type { Metadata } from "next";
import BlogHeader from "@/components/blog/BlogHeader";
import { blogPlexFont } from "@/lib/blog-fonts";
import { copyFont, heroFont } from "@/lib/fonts";
import { monoFont } from "@/lib/mono-font";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "SEO Blog & Growth Insights | Rehan Kadri",
  description:
    "Practical SEO strategies, YouTube growth tactics, content systems, and demand capture frameworks. Written for B2B teams and creators building qualified pipeline from search.",
  path: "/blog",
  imageAlt: "Rehan Kadri SEO blog and growth insights",
  keywords: [
    "SEO blog",
    "SEO strategies",
    "YouTube growth",
    "content systems",
    "B2B SEO",
    "demand capture",
    "content marketing blog",
    "growth marketing insights",
    "organic traffic growth",
    "Rehan Kadri blog",
  ],
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`   ${blogPlexFont.variable} ${monoFont.variable} ${heroFont.variable} ${copyFont.variable}`}
    >
      <BlogHeader />
      {children}
    </div>
  );
}
