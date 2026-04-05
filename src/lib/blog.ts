import { countRichTextWords } from "@/lib/blog-rich-text";
import type { SerializedRichTextState } from "@/lib/blog-rich-text";

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; title: string; body: string }
  | { type: "quote"; text: string; author: string };

export type BlogSection = {
  id: string;
  title: string;
  blocks: BlogBlock[];
};

export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
};

export type BlogAuthorSocials = {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
};

export type BlogAuthor = {
  name: string;
  role: string;
  image: string;
  bio: string;
  socials?: BlogAuthorSocials;
};

export type BlogFaqEntry = {
  question: string;
  answer: string;
};

export type BlogPostHero = {
  image?: string;
  imageAlt?: string;
  background?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle?: string;
  category: BlogCategory;
  subcategories: string[];
  keywords?: string[];
  coverImage?: string;
  hero?: BlogPostHero;
  excerpt: string;
  cardBlurb: string;
  heroDescription: string;
  seoDescription: string;
  publishedAt: string;
  modifiedAt?: string;
  readTime: string;
  author: BlogAuthor;
  body?: SerializedRichTextState | null;
  faqEntries?: BlogFaqEntry[];
  summaryPoints: string[];
  intro: string[];
  sections: BlogSection[];
};

export const defaultBlogAuthor: BlogAuthor = {
  name: "Rehan Kadri",
  role: "Growth Marketing Strategist",
  image: "/rehan.png",
  bio: "Rehan Kadri is an SEO specialist, content strategist, and growth marketer with 8+ years of hands-on experience. He started his journey at the age of 14 and has since grown a blog to 1M+ traffic and built an audience of 33K+ subscribers. He helps brands and creators scale through SEO, social media marketing, and data-driven strategies, with deep expertise in YouTube growth.",
  socials: {
    twitter: "https://x.com/rehanous",
    linkedin: "https://www.linkedin.com/in/rehan-kadri/",
    instagram: "https://www.instagram.com/therehankadri/",
  },
};

const blogPostSource: BlogPost[] = [];

export const blogPosts = [...blogPostSource].sort((firstPost, secondPost) =>
  secondPost.publishedAt.localeCompare(firstPost.publishedAt)
);

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogCategories() {
  const categoryMap = new Map<string, BlogCategory>();

  blogPosts.forEach((post) => {
    categoryMap.set(post.category.slug, post.category);
  });

  return Array.from(categoryMap.values());
}

export function getRelatedBlogPosts(currentSlug: string) {
  return blogPosts.filter((post) => post.slug !== currentSlug).slice(0, 3);
}

function countWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function countBlockWords(block: BlogBlock) {
  switch (block.type) {
    case "paragraph":
      return countWords(block.text);
    case "list":
      return block.items.reduce((total, item) => total + countWords(item), 0);
    case "callout":
      return countWords(block.title) + countWords(block.body);
    case "quote":
      return countWords(block.text) + countWords(block.author);
  }
}

export function getBlogReadTime(post: BlogPost) {
  if (post.readTime.trim()) {
    return post.readTime;
  }

  if (post.body) {
    const totalWords = countRichTextWords(post.body);
    const minutes = Math.max(1, Math.ceil(totalWords / 220));

    return `${minutes} min read`;
  }

  const introWords = post.intro.reduce((total, paragraph) => total + countWords(paragraph), 0);
  const sectionWords = post.sections.reduce(
    (total, section) =>
      total +
      countWords(section.title) +
      section.blocks.reduce((blockTotal, block) => blockTotal + countBlockWords(block), 0),
    0
  );

  const totalWords = introWords + sectionWords;
  const minutes = Math.max(1, Math.ceil(totalWords / 220));

  return `${minutes} min read`;
}

export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}



