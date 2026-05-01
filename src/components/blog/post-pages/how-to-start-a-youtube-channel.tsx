import type { BlogPostModule } from "./types";
import HowToStartYouTubeChannelArticle, {
  howToStartYouTubeChannelFaqEntries,
  howToStartYouTubeChannelHeadingItems,
  howToStartYouTubeChannelWordCount,
  howToStartYouTubeChannelHowToSteps,
  howToStartYouTubeChannelHowToTools,
  howToStartYouTubeChannelHowToSupplies,
} from "@/components/blog/posts/HowToStartYouTubeChannelArticle";

const postModule: BlogPostModule = {
  slug: "how-to-start-a-youtube-channel",
  getFaqEntries: () => howToStartYouTubeChannelFaqEntries,
  getHeadingItems: () => howToStartYouTubeChannelHeadingItems,
  getWordCount: () => howToStartYouTubeChannelWordCount,
  getArticleEntities: () => ({
    about: [
      { "@type": "Thing", name: "How to start a YouTube channel" },
      { "@type": "Thing", name: "YouTube channel setup" },
      { "@type": "Thing", name: "YouTube SEO" },
      { "@type": "Thing", name: "YouTube Shorts strategy" },
      { "@type": "Thing", name: "YouTube monetization" },
    ],
    mentions: [
      {
        "@type": "SoftwareApplication",
        name: "YouTube",
        url: "https://www.youtube.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "YouTube Studio",
        url: "https://studio.youtube.com/",
      },
      {
        "@type": "Organization",
        name: "Google",
        url: "https://www.google.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "vidIQ",
        url: "https://vidiq.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "TubeBuddy",
        url: "https://www.tubebuddy.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "Canva",
        url: "https://www.canva.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "CapCut",
        url: "https://www.capcut.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "DaVinci Resolve",
        url: "https://www.blackmagicdesign.com/products/davinciresolve",
      },
      {
        "@type": "Thing",
        name: "YouTube Partner Program",
      },
      {
        "@type": "Thing",
        name: "Google Trends",
      },
    ],
  }),
  getHowToJsonLd: ({ post, canonicalUrl, socialImage }) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to start a YouTube channel step by step",
    description: post.seoDescription,
    image: [socialImage],
    totalTime: "PT60M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    tool: howToStartYouTubeChannelHowToTools.map((toolName) => ({
      "@type": "HowToTool",
      name: toolName,
    })),
    supply: howToStartYouTubeChannelHowToSupplies.map((supplyName) => ({
      "@type": "HowToSupply",
      name: supplyName,
    })),
    step: howToStartYouTubeChannelHowToSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url ? `${canonicalUrl}${step.url}` : canonicalUrl,
    })),
  }),
  renderArticle: ({ faqSection }) => (
    <>
      <HowToStartYouTubeChannelArticle />
      {faqSection}
    </>
  ),
  rendersFaqInternally: true,
};

export default postModule;
