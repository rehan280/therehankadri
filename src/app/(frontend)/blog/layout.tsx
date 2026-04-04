import type { Metadata } from "next";
import {
  blogPlexFont,
  therehankadriCondensedFont,
  therehankadriDisplayFont,
  therehankadriFont,
} from "@/lib/fonts";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Blog | The Rehan Kadri",
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
      className={`${therehankadriFont.variable} ${therehankadriDisplayFont.variable} ${therehankadriCondensedFont.variable} ${blogPlexFont.variable}`}
    >
      {children}
    </div>
  );
}
