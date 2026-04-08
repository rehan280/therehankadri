export const YOUTUBE_CHANNEL_STATISTICS_SLUG = "youtube-channel-statistics";
export const YOUTUBE_USERS_SLUG = "youtube-users";

const statsPostPaths = {
  [YOUTUBE_CHANNEL_STATISTICS_SLUG]: "/stats/youtube/channel",
  [YOUTUBE_USERS_SLUG]: "/stats/youtube/users",
} as const;

export function isStatsPostSlug(slug: string) {
  return slug in statsPostPaths;
}

export function getPostPath(slug: string) {
  return statsPostPaths[slug as keyof typeof statsPostPaths] ?? `/blog/${slug}`;
}
