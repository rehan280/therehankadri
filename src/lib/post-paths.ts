export const YOUTUBE_CHANNEL_STATISTICS_SLUG = "youtube-channel-statistics";
export const YOUTUBE_USERS_SLUG = "youtube-users";
export const B2B_SEO_STATISTICS_SLUG = "b2b-seo-statistics";

const statsPostPaths = {
  [YOUTUBE_CHANNEL_STATISTICS_SLUG]: "/stats/youtube-channels",
  [YOUTUBE_USERS_SLUG]: "/stats/youtube-users",
  [B2B_SEO_STATISTICS_SLUG]: "/stats/b2b-seo",
} as const;

export function isStatsPostSlug(slug: string) {
  return slug in statsPostPaths;
}

export function getPostPath(slug: string) {
  return statsPostPaths[slug as keyof typeof statsPostPaths] ?? `/blog/${slug}`;
}
