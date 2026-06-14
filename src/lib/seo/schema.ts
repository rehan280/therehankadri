import {
  SITE_NAME,
  SITE_URL,
  buildAbsoluteImageUrl,
} from "./config";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const HOME_PAGE_ID = `${SITE_URL}/#webpage`;
export const BLOG_ID = `${SITE_URL}/blog#webpage`;

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
      // Uses root-level manifest image (verified path in /public/)
      url: buildAbsoluteImageUrl("/web-app-manifest-512x512.png"),
      width: 512,
      height: 512,
    },
    image: buildAbsoluteImageUrl("/rehan.webp"),
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
    givenName: "Rehan",
    familyName: "Kadri",
    url: SITE_URL,
    image: {
      "@type": "ImageObject",
      url: buildAbsoluteImageUrl("/rehan.webp"),
      width: 500,
      height: 600,
    },
    description:
      "SEO specialist and growth strategist with 8+ years of hands-on experience. Grew a blog to 1M+ monthly organic visitors and a YouTube channel to 33K+ subscribers. Helps B2B brands build content systems, YouTube strategies, and pipeline-generating SEO programs.",
    jobTitle: "SEO & Growth Strategist",
    hasOccupation: {
      "@type": "Occupation",
      name: "SEO & Growth Marketing Strategist",
      occupationLocation: {
        "@type": "Country",
        name: "Pakistan",
      },
      skills: "SEO, YouTube growth, B2B lead generation, content systems, organic traffic growth",
    },
    knowsAbout: [
      "Search Engine Optimization",
      "YouTube SEO",
      "YouTube growth strategy",
      "Content marketing",
      "B2B lead generation",
      "Growth marketing",
      "Organic traffic growth",
      "Content systems",
      "Answer Engine Optimization",
    ],
    sameAs: SOCIAL_PROFILES,
    worksFor: {
      "@id": ORGANIZATION_ID,
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Self-taught digital marketer",
    },
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
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
        inLanguage: "en-US",
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        about: {
          "@id": PERSON_ID,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: buildAbsoluteImageUrl("/rehan.webp"),
          width: 500,
          height: 600,
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".hero-subtitle-desktop", ".hero-cta-note"],
        },
      },
    ],
  };
}

export function createBreadcrumbJsonLd(
  items: Array<{
    name: string;
    url: string;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
