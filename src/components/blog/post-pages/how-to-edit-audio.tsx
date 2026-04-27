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
  getAdditionalJsonLd: ({ canonicalUrl }) => [
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Audacity audio editing tutorial",
      description:
        "Embedded Audacity tutorial video for the step-by-step audio editing workflow covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/yzJ2VyYkmaA/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/yzJ2VyYkmaA",
      contentUrl: "https://www.youtube.com/watch?v=yzJ2VyYkmaA",
      uploadDate: "2021-04-05T00:00:23-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "SoftwareApplication",
        name: "Audacity",
        url: "https://www.audacityteam.org/",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#how-to-edit-audio-in-audacity`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "GarageBand audio editing tutorial",
      description:
        "Embedded GarageBand tutorial video for the Mac audio editing workflow covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/AVC3lEQ0ymo/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/AVC3lEQ0ymo",
      contentUrl: "https://www.youtube.com/watch?v=AVC3lEQ0ymo",
      uploadDate: "2022-05-11T11:44:58-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "SoftwareApplication",
        name: "GarageBand",
        url: "https://www.apple.com/mac/garageband/",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#how-to-edit-audio-in-garageband`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Lexis Audio Editor tutorial",
      description:
        "Embedded Lexis Audio Editor tutorial video for the Android audio editing workflow covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/bq-OEoEB4Zc/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/bq-OEoEB4Zc",
      contentUrl: "https://www.youtube.com/watch?v=bq-OEoEB4Zc",
      uploadDate: "2019-08-07T20:03:59-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "SoftwareApplication",
        name: "Lexis Audio Editor",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#how-to-edit-audio-on-android-with-lexis-audio-editor`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Vocaroo audio editing tutorial",
      description:
        "Embedded Vocaroo tutorial video for the simple online audio workflow covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/IqXDqmfv46M/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/IqXDqmfv46M",
      contentUrl: "https://www.youtube.com/watch?v=IqXDqmfv46M",
      uploadDate: "2017-06-26T05:33:04-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "WebApplication",
        name: "Vocaroo",
        url: "https://vocaroo.com/",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#how-to-edit-audio-online-with-vocaroo`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Adobe Audition voice editing tutorial",
      description:
        "Embedded Adobe Audition tutorial video for the advanced voice editing workflow covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/gn0q7BuPML8/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/gn0q7BuPML8",
      contentUrl: "https://www.youtube.com/watch?v=gn0q7BuPML8",
      uploadDate: "2019-03-26T11:48:44-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "SoftwareApplication",
        name: "Adobe Audition",
        url: "https://www.adobe.com/products/audition.html",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#adobe-audition-audio-editing-workflow`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Adobe Podcast editing tutorial",
      description:
        "Embedded Adobe Podcast tutorial video for AI-powered audio cleanup and enhancement covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/y9pBvKh14G8/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/y9pBvKh14G8",
      contentUrl: "https://www.youtube.com/watch?v=y9pBvKh14G8",
      uploadDate: "2023-07-06T10:00:28-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "SoftwareApplication",
        name: "Adobe Podcast",
        url: "https://podcast.adobe.com/",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#adobe-podcast-enhance-for-audio-cleanup`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Descript voice tutorial",
      description:
        "Embedded Descript tutorial video for transcript-based voice editing and Studio Sound workflows covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/6_TynUbev7I/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/6_TynUbev7I",
      contentUrl: "https://www.youtube.com/watch?v=6_TynUbev7I",
      uploadDate: "2025-10-20T15:06:28-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "SoftwareApplication",
        name: "Descript",
        url: "https://www.descript.com/",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#descript-studio-sound-for-audio-editing`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Auphonic podcast audio editing tutorial",
      description:
        "Embedded Auphonic tutorial video for automatic podcast leveling and cleanup covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/TcXcFhJQRZU/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/TcXcFhJQRZU",
      contentUrl: "https://www.youtube.com/watch?v=TcXcFhJQRZU",
      uploadDate: "2019-07-26T10:50:39-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "SoftwareApplication",
        name: "Auphonic",
        url: "https://auphonic.com/",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#auphonic-for-podcast-audio-editing`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Audacity on Mac tutorial",
      description:
        "Embedded Audacity on Mac tutorial video for the Mac-specific audio editing workflow covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/Z2Q-C5kad54/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/Z2Q-C5kad54",
      contentUrl: "https://www.youtube.com/watch?v=Z2Q-C5kad54",
      uploadDate: "2025-10-12T02:50:15-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "SoftwareApplication",
        name: "Audacity",
        url: "https://www.audacityteam.org/",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#how-to-edit-audio-in-audacity-on-mac`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "How to capture system audio on Windows",
      description:
        "Embedded tutorial video for capturing system audio on Windows as part of the Audacity workflow covered in this guide.",
      thumbnailUrl: ["https://i.ytimg.com/vi/xhuwo-q0fEY/hqdefault.jpg"],
      embedUrl: "https://www.youtube.com/embed/xhuwo-q0fEY",
      contentUrl: "https://www.youtube.com/watch?v=xhuwo-q0fEY",
      uploadDate: "2021-09-27T00:00:18-07:00",
      isFamilyFriendly: true,
      learningResourceType: "Tutorial",
      educationalUse: "instruction",
      about: {
        "@type": "Thing",
        name: "Windows system audio capture",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#how-to-capture-system-audio-on-windows`,
      },
    },
  ],
  renderArticle: ({ faqSection }) => (
    <>
      <HowToEditAudioArticle />
      {faqSection}
    </>
  ),
  rendersFaqInternally: true,
};

export default postModule;
