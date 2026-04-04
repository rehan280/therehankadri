import {
  blogPlexFont,
  therehankadriCondensedFont,
  therehankadriDisplayFont,
  therehankadriFont,
} from "@/lib/fonts";

export default function AboutLayout({
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
