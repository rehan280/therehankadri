import { copyFont, heroFont } from "@/lib/fonts";

export default function ToolsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${heroFont.variable} ${copyFont.variable}`}>{children}</div>;
}
