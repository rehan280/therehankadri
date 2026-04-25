import type { BlogPost } from "@/lib/blog";
import { countRichTextWords, getRichTextHeadingItems } from "@/lib/blog-rich-text";
import type { BlogPostHeadingItem } from "@/components/blog/post-pages";
import { getDefaultBlogPostWordCount } from "@/components/blog/DefaultBlogPostArticle";

export function buildHeroTitleLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const joinedLength = (items: string[]) => items.join(" ").length;
  const longestWordLength = Math.max(...words.map((word) => word.length));
  const buildLineGroups = (lineCount: number, maxLength: number) => {
    const groups: string[][][] = [];

    const visit = (startIndex: number, remainingLines: number, current: string[][]) => {
      if (remainingLines === 1) {
        const lastLine = words.slice(startIndex);
        if (lastLine.length === 0 || joinedLength(lastLine) > maxLength) return;
        groups.push([...current, lastLine]);
        return;
      }

      const maxEnd = words.length - remainingLines + 1;
      for (let endIndex = startIndex + 1; endIndex <= maxEnd; endIndex += 1) {
        const nextLine = words.slice(startIndex, endIndex);
        if (joinedLength(nextLine) > maxLength) break;
        visit(endIndex, remainingLines - 1, [...current, nextLine]);
      }
    };

    visit(0, lineCount, []);
    return groups;
  };

  if (words.length <= 3) return [title];
  if (longestWordLength > 18) return [title];

  const scoreLines = (lineGroups: string[][]) => {
    const lengths = lineGroups.map((line) => joinedLength(line));
    const wordsPerLine = lineGroups.map((line) => line.length);
    const maxLength = Math.max(...lengths);
    const minLength = Math.min(...lengths);
    const balancePenalty = maxLength - minLength;
    const orphanPenalty = lengths[lengths.length - 1] < 7 ? 18 : 0;
    const singleWordLastPenalty = wordsPerLine[wordsPerLine.length - 1] === 1 ? 8 : 0;
    const increasingPenalty = lengths.slice(1).reduce((total, length, index) => {
      const previous = lengths[index];
      return total + (length > previous ? (length - previous) * 2.5 : 0);
    }, 0);
    const squarePenalty =
      lineGroups.length >= 4 && maxLength - minLength < 8 ? 18 : 0;
    const bottomTooLongPenalty =
      lineGroups.length >= 3 && lengths[lengths.length - 1] > lengths[0] * 0.92 ? 12 : 0;
    const taperPenalty =
      lineGroups.length >= 3 && lengths[0] - lengths[lengths.length - 1] < 6 ? 10 : 0;
    const longLinePenalty = lengths.reduce((total, length) => {
      if (length > 30) return total + (length - 30) * 12;
      if (length > 28) return total + (length - 28) * 7;
      if (length > 26) return total + (length - 26) * 4;
      return total;
    }, 0);
    const twoLinePreference = lineGroups.length === 2 && maxLength <= 30 ? -18 : 0;
    const threeLinePreference = lineGroups.length === 3 && maxLength <= 24 ? -8 : 0;
    const lineCountPenalty =
      lineGroups.length === 2 ? 0 : lineGroups.length === 3 ? 10 : 36;

    return (
      balancePenalty +
      orphanPenalty +
      singleWordLastPenalty +
      increasingPenalty +
      squarePenalty +
      bottomTooLongPenalty +
      taperPenalty +
      longLinePenalty +
      twoLinePreference +
      threeLinePreference +
      lineCountPenalty
    );
  };

  const candidateGroups = [...buildLineGroups(2, 28), ...buildLineGroups(3, 24)];
  if (candidateGroups.length === 0) return [title];

  const best = candidateGroups.reduce<string[][] | null>((currentBest, candidate) => {
    if (!currentBest) return candidate;
    return scoreLines(candidate) < scoreLines(currentBest) ? candidate : currentBest;
  }, null);

  return best ? best.map((line) => line.join(" ")) : [title];
}

export function getHeroLineClass(index: number, totalLines: number, styles: Record<string, string>) {
  if (totalLines <= 1) return styles.postHeroLineSingle;
  if (totalLines === 2) {
    return index === 0 ? styles.postHeroLineTop : styles.postHeroLineMiddle;
  }
  if (index === 0) return styles.postHeroLineTop;
  if (index === 1) return styles.postHeroLineMiddle;
  return styles.postHeroLineBottom;
}

export function getDefaultBlogPostHeadingItems(post: BlogPost): BlogPostHeadingItem[] {
  if (post.body) {
    return getRichTextHeadingItems(post.body);
  }

  return post.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));
}

export function getBlogPostWordCount(post: BlogPost) {
  if (post.body) {
    return countRichTextWords(post.body);
  }

  return getDefaultBlogPostWordCount(post);
}
