import type { Metadata } from "next";
import {
  blogPlexFont,
  therehankadriCondensedFont,
  therehankadriDisplayFont,
  therehankadriFont,
} from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Blog | The Rehan Kadri",
  description:
    "Practical writing on SEO, content systems, demand capture, and founder authority for teams building qualified pipeline.",
  openGraph: {
    title: "Blog | The Rehan Kadri",
    description:
      "Practical writing on SEO, content systems, demand capture, and founder authority for teams building qualified pipeline.",
    type: "website",
  },
};

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
