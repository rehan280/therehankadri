import type { BlogPostModule } from "./types";
import YouTubeUsersArticle from "@/components/blog/posts/YouTubeUsersArticle";
import { getYouTubeUsersArticleData } from "@/lib/youtube-users-article";

const postModule: BlogPostModule = {
  slug: "youtube-users",
  getHeadingItems: async () => {
    const data = await getYouTubeUsersArticleData();
    return data.headings;
  },
  getWordCount: () => 4814,
  renderArticle: async ({ faqSection }) => {
    const data = await getYouTubeUsersArticleData();

    return (
      <YouTubeUsersArticle
        data={data}
        insertBeforeHeadingId="the-bottom-line"
        insertNode={faqSection}
      />
    );
  },
  rendersFaqInternally: true,
};

export default postModule;
