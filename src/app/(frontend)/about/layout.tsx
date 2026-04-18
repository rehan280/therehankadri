import {
  blogPlexFont,
  therehankadriDisplayFont,
  therehankadriFont,
} from "@/lib/blog-fonts";
import { copyFont, heroFont } from "@/lib/fonts";
import { monoFont } from "@/lib/mono-font";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${therehankadriFont.variable} ${therehankadriDisplayFont.variable} ${blogPlexFont.variable} ${monoFont.variable} ${heroFont.variable} ${copyFont.variable}`}
    >
      {children}
    </div>
  );
}
