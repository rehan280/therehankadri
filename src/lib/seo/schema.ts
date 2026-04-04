import { SITE_NAME, SITE_URL, buildAbsoluteImageUrl } from "./config";

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
