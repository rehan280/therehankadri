import type { BlogPostModule } from "./types";
import YouTubeRankingFactorsArticle, {
  youtubeRankingFactorsFaqEntries,
  youtubeRankingFactorsHeadingItems,
  youtubeRankingFactorsWordCount,
} from "@/components/blog/posts/YouTubeRankingFactorsArticle";

const postModule: BlogPostModule = {
  slug: "youtube-ranking-factors",
  getFaqEntries: () => youtubeRankingFactorsFaqEntries,
  getHeadingItems: () => youtubeRankingFactorsHeadingItems,
  getWordCount: () => youtubeRankingFactorsWordCount,
  getArticleEntities: () => ({
    about: [
      { "@type": "Thing", name: "YouTube ranking factors" },
      { "@type": "Thing", name: "YouTube SEO" },
      { "@type": "Thing", name: "YouTube algorithm" },
      { "@type": "Thing", name: "YouTube Shorts ranking factors" },
      { "@type": "Thing", name: "Viral video psychology" },
    ],
    mentions: [
      {
        "@type": "SoftwareApplication",
        name: "YouTube",
        url: "https://www.youtube.com/",
      },
      {
        "@type": "Organization",
        name: "Google",
        url: "https://www.google.com/",
      },
      {
        "@type": "Organization",
        name: "Adilo",
        url: "https://adilo.com/",
      },
      {
        "@type": "Thing",
        name: "Gemini",
      },
    ],
  }),
  renderArticle: () => <YouTubeRankingFactorsArticle />,
};

export default postModule;
