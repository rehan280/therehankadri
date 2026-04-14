import type { Metadata } from "next";
import {
  DEFAULT_SOCIAL_IMAGE_PATH,
  SITE_NAME,
  buildAbsoluteImageUrl,
  buildCanonicalUrl,
} from "./config";

type PageType = "website" | "article" | "profile";
type TwitterCard = "summary" | "summary_large_image";

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  imagePath?: string;
  imageAlt?: string;
  type?: PageType;
  twitterCard?: TwitterCard;
};

type CreateArticleMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function createIndexRobots(): NonNullable<Metadata["robots"]> {
  return {
    index: true,
    follow: true,
  };
}

export function createNoIndexRobots(): NonNullable<Metadata["robots"]> {
  return {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  };
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  keywords,
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
  imageAlt = `${SITE_NAME} preview image`,
  type = "website",
  twitterCard = "summary_large_image",
}: CreatePageMetadataOptions): Metadata {
  const canonicalUrl = buildCanonicalUrl(path);
  const socialImage = buildAbsoluteImageUrl(imagePath);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: createIndexRobots(),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: socialImage,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [socialImage],
    },
  };
}

export function createArticleMetadata({
  title,
  description,
  path,
  keywords,
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
  imageAlt = title,
  publishedTime,
  modifiedTime,
  authors,
}: CreateArticleMetadataOptions): Metadata {
  const canonicalUrl = buildCanonicalUrl(path);
  const socialImage = buildAbsoluteImageUrl(imagePath);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: createIndexRobots(),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      publishedTime,
      modifiedTime,
      authors,
      images: [
        {
          url: socialImage,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

