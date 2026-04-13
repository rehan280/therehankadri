import type { Metadata } from "next";
import BlogHeader from "@/components/blog/BlogHeader";
import {
  blogPlexFont,
  therehankadriCondensedFont,
  therehankadriDisplayFont,
  therehankadriFont,
} from "@/lib/blog-fonts";
import { monoFont } from "@/lib/mono-font";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Marketing Statistics Hub | Rehan Kadri",
  description:
    "Statistics-focused content on YouTube, SEO, and digital growth trends.",
  path: "/stats",
  imageAlt: "The Rehan Kadri stats section",
});

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${therehankadriFont.variable} ${therehankadriDisplayFont.variable} ${therehankadriCondensedFont.variable} ${blogPlexFont.variable} ${monoFont.variable}`}
    >
      <BlogHeader />
      {children}
    </div>
  );
}

