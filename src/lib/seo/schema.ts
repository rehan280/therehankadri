import {
  SITE_NAME,
  SITE_URL,
  buildAbsoluteImageUrl,
} from "./config";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const HOME_PAGE_ID = `${SITE_URL}/#webpage`;

export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/in/therehankadri/",
  "https://www.instagram.com/therehankadri/",
  "https://youtube.com/@rehanous?si=FDWGeBZ6MtP6oUcK",
  "https://x.com/rehanous",
];

export function createOrganizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: "Rehan Kadri",
    url: SITE_URL,
    description:
      "SEO, YouTube growth, and content systems designed to turn visibility into qualified pipeline for B2B brands.",
    email: "youtech280@gmail.com",
    logo: {
      "@type": "ImageObject",
      url: buildAbsoluteImageUrl("/favicon/web-app-manifest-512x512.png"),
    },
    image: buildAbsoluteImageUrl("/rehan.png"),
    sameAs: SOCIAL_PROFILES,
    founder: {
      "@id": PERSON_ID,
    },
  };
}

export function createPublisherJsonLd() {
  return createOrganizationJsonLd();
}

export function createPersonJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Rehan Kadri",
    url: SITE_URL,
    image: buildAbsoluteImageUrl("/rehan.png"),
    description:
      "Growth marketer and SEO strategist building content, YouTube, and pipeline systems for compounding growth.",
    jobTitle: "SEO & Growth Strategist",
    sameAs: SOCIAL_PROFILES,
    worksFor: {
      "@id": ORGANIZATION_ID,
    },
    knowsAbout: [
      "SEO",
      "YouTube growth",
      "Content marketing",
      "B2B lead generation",
      "Growth strategy",
      "Organic traffic growth",
    ],
  };
}

export function createWebsiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: "Rehan Kadri",
    inLanguage: "en-US",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
  };
}

export function createHomePageStructuredData({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      createWebsiteJsonLd(),
      createOrganizationJsonLd(),
      createPersonJsonLd(),
      {
        "@type": "WebPage",
        "@id": HOME_PAGE_ID,
        url: SITE_URL,
        name: title,
        description,
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        about: {
          "@id": PERSON_ID,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: buildAbsoluteImageUrl(),
        },
      },
    ],
  };
}
