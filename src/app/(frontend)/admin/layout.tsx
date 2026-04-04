import type { Metadata } from "next";
import { createNoIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Admin | The Rehan Kadri",
  description: "Internal admin tools for publishing and managing site content.",
  robots: createNoIndexRobots(),
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
