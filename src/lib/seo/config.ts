export const SITE_NAME = "The Rehan Kadri";
export const SITE_URL = "https://www.therehankadri.com";
export const DEFAULT_SOCIAL_IMAGE_PATH = "/rehanous-website.webp";
export const GOOGLE_SITE_VERIFICATION = "-iqotlS2yoMry14iyOTphf1XHwjiHO4lOvjAU9o7Hpg";

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
