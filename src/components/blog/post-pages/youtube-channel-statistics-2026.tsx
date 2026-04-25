import type { BlogPostModule } from "./types";
import YouTubeChannelStatisticsArticle, {
  youtubeChannelStatisticsHeadingItems,
  youtubeChannelStatisticsWordCount,
} from "@/components/blog/posts/YouTubeChannelStatisticsArticle";

const postModule: BlogPostModule = {
  slug: "youtube-channel-statistics-2026",
  getHeadingItems: () => youtubeChannelStatisticsHeadingItems,
  getWordCount: () => youtubeChannelStatisticsWordCount,
  renderArticle: ({ faqSection }) => (
    <>
      <YouTubeChannelStatisticsArticle />
      {faqSection}
    </>
  ),
  rendersFaqInternally: true,
};

export default postModule;
