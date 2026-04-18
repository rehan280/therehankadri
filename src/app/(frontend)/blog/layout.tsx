import type { Metadata } from "next";
import BlogHeader from "@/components/blog/BlogHeader";
import {
  blogPlexFont,
  therehankadriCondensedFont,
  therehankadriDisplayFont,
  therehankadriFont,
} from "@/lib/blog-fonts";
import { copyFont, heroFont } from "@/lib/fonts";
import { monoFont } from "@/lib/mono-font";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "SEO Blog & Insights | Rehan Kadri",
  description:
    "Practical writing on SEO, content systems, demand capture, and founder authority for teams building qualified pipeline.",
  path: "/blog",
  imageAlt: "The Rehan Kadri blog",
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${therehankadriFont.variable} ${therehankadriDisplayFont.variable} ${therehankadriCondensedFont.variable} ${blogPlexFont.variable} ${monoFont.variable} ${heroFont.variable} ${copyFont.variable}`}
    >
      <BlogHeader />
      {children}
    </div>
  );
}

