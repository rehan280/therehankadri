import type { Metadata } from "next";

export const SITE_NAME = "The Rehan Kadri";
export const SITE_URL = "https://www.therehankadri.com";
export const DEFAULT_SOCIAL_IMAGE_PATH = "/rehanous-website.webp";
export const GOOGLE_SITE_VERIFICATION = "-iqotlS2yoMry14iyOTphf1XHwjiHO4lOvjAU9o7Hpg";

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
  authors?: string[];
};

export function buildCanonicalUrl(path = "") {
  if (!path || path === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildAbsoluteImageUrl(imagePath = DEFAULT_SOCIAL_IMAGE_PATH) {
  if (/^https?:\/\//.test(imagePath)) {
    return imagePath;
  }

  return `${SITE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
}

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
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      publishedTime,
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

export function createPublisherJsonLd() {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: buildAbsoluteImageUrl("/favicon/web-app-manifest-512x512.png"),
    },
  };
}
