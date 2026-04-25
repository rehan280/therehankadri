import type { BlogPostModule } from "./types";
import HowToEditAudioArticle, {
  howToEditAudioFaqEntries,
  howToEditAudioHowToSupplies,
  howToEditAudioHowToSteps,
  howToEditAudioHowToTools,
  howToEditAudioHeadingItems,
  howToEditAudioWordCount,
} from "@/components/blog/posts/HowToEditAudioArticle";

const postModule: BlogPostModule = {
  slug: "how-to-edit-audio",
  getFaqEntries: () => howToEditAudioFaqEntries,
  getHeadingItems: () => howToEditAudioHeadingItems,
  getWordCount: () => howToEditAudioWordCount,
  getArticleEntities: () => ({
    about: [
      { "@type": "Thing", name: "Audio editing" },
      { "@type": "Thing", name: "Podcast editing" },
      { "@type": "Thing", name: "YouTube audio editing" },
      { "@type": "Thing", name: "Audio editing for beginners" },
      { "@type": "Thing", name: "LUFS loudness standards" },
    ],
    mentions: [
      {
        "@type": "SoftwareApplication",
        name: "Audacity",
        url: "https://www.audacityteam.org/",
      },
      {
        "@type": "SoftwareApplication",
        name: "GarageBand",
        url: "https://www.apple.com/mac/garageband/",
      },
      {
        "@type": "SoftwareApplication",
        name: "Adobe Audition",
        url: "https://www.adobe.com/products/audition.html",
      },
      {
        "@type": "SoftwareApplication",
        name: "Adobe Podcast",
        url: "https://podcast.adobe.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "Descript",
        url: "https://www.descript.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "Auphonic",
        url: "https://auphonic.com/",
      },
      {
        "@type": "SoftwareApplication",
        name: "BandLab",
        url: "https://www.bandlab.com/",
      },
    ],
  }),
  getHowToJsonLd: ({ post, canonicalUrl, socialImage }) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to edit audio step by step",
    description: post.seoDescription,
    image: [socialImage],
    totalTime: "PT15M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    tool: howToEditAudioHowToTools.map((toolName) => ({
      "@type": "HowToTool",
      name: toolName,
    })),
    supply: howToEditAudioHowToSupplies.map((supplyName) => ({
      "@type": "HowToSupply",
      name: supplyName,
    })),
    step: howToEditAudioHowToSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url ? `${canonicalUrl}${step.url}` : canonicalUrl,
    })),
  }),
  renderArticle: ({ faqSection }) => (
    <>
      <HowToEditAudioArticle />
      {faqSection}
    </>
  ),
  rendersFaqInternally: true,
};

export default postModule;
