import type { Metadata } from "next";
import BlogHeader from "@/components/blog/BlogHeader";
import { blogPlexFont } from "@/lib/blog-fonts";
import { copyFont, heroFont } from "@/lib/fonts";
import { monoFont } from "@/lib/mono-font";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Marketing Statistics Hub | YouTube, B2B & SEO Stats | Rehan Kadri",
  description:
    "Research-driven statistics pages on YouTube users, channel growth, B2B SEO trends, and digital marketing benchmarks. Updated data for marketers and creators in 2026.",
  path: "/stats",
  imageAlt: "Marketing statistics hub by Rehan Kadri",
  keywords: [
    "marketing statistics",
    "YouTube statistics 2026",
    "B2B SEO statistics",
    "digital marketing benchmarks",
    "YouTube growth data",
    "content marketing statistics",
    "creator economy stats",
    "SEO trends 2026",
  ],
});

export default function StatsLayout({
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
