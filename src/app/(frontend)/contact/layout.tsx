import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Rehan Kadri | SEO & Growth Strategy",
  description:
    "Contact Rehan Kadri to discuss SEO, YouTube growth, content systems, and pipeline-focused marketing strategy for your business.",
  path: "/contact",
  imageAlt: "Contact The Rehan Kadri",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
