import type { SerializedRichTextState } from "@/lib/blog-rich-text";

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; title: string; body: string }
  | { type: "quote"; text: string; author: string };

export type BlogSection = {
  id: string;
  title: string;
  blocks: BlogBlock[];
};

export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
};

export type BlogAuthorSocials = {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
};

export type BlogAuthor = {
  name: string;
  role: string;
  image: string;
  bio: string;
  socials?: BlogAuthorSocials;
};

export type BlogFaqEntry = {
  question: string;
  answer: string;
};

export type BlogHero = {
  image?: string;
  imageAlt?: string;
  background?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  category: BlogCategory;
  subcategories: string[];
  metaTitle?: string;
  keywords?: string[];
  coverImage?: string;
  hero?: BlogHero;
  excerpt: string;
  cardBlurb: string;
  heroDescription: string;
  seoDescription: string;
  publishedAt: string;
  modifiedAt?: string;
  readTime: string;
  author: BlogAuthor;
  body?: SerializedRichTextState | null;
  faqEntries?: BlogFaqEntry[];
  summaryPoints: string[];
  intro: string[];
  sections: BlogSection[];
};

const BLOG_DISPLAY_TIME_ZONE = "Asia/Kolkata";

const author: BlogAuthor = {
  name: "Rehan Kadri",
  role: "Growth Marketing Strategist",
  image: "/rehan.webp",
  bio: "Rehan Kadri is an SEO specialist, content strategist, and growth marketer with 8+ years of hands-on experience. He started his journey at the age of 14 and has since grown a blog to 1M+ traffic and built an audience of 33K+ subscribers. He helps brands and creators scale through SEO, social media marketing, and data-driven strategies, with deep expertise in YouTube growth.",
  socials: {
    twitter: "https://x.com/rehanous",
    linkedin: "https://www.linkedin.com/in/therehankadri/",
    website: "https://therehankadri.com",
  },
};

export const defaultBlogAuthor = author;

const categories = {
  seo: {
    slug: "seo",
    name: "SEO",
    description: "Search systems designed for revenue, not vanity traffic.",
  },
  content: {
    slug: "content",
    name: "Content",
    description: "Editorial systems that compound across channels.",
  },
  pipeline: {
    slug: "pipeline",
    name: "Pipeline",
    description: "Funnel design that qualifies intent before sales gets involved.",
  },
  authority: {
    slug: "authority",
    name: "Authority",
    description: "Trust-building content for founders and category leaders.",
  },
} satisfies Record<string, BlogCategory>;

const blogPostSource: BlogPost[] = [
  {
    slug: "b2b-seo-roadmap-for-qualified-pipeline",
    title: "The B2B SEO Roadmap That Turns Rankings Into Qualified Pipeline",
    category: categories.seo,
    subcategories: ["Revenue SEO"],
    excerpt:
      "A practical framework for aligning search intent, commercial pages, and conversion paths before the first article goes live.",
    cardBlurb:
      "Most teams publish content first and hope revenue follows. This roadmap starts with offer architecture, revenue pages, and the handoff between search and sales.",
    heroDescription:
      "A planning system for B2B teams that want SEO to influence pipeline, not just traffic graphs.",
    seoDescription:
      "Learn how to structure B2B SEO around revenue pages, supporting content, and conversion pathways that create qualified pipeline.",
    publishedAt: "2026-03-28",
    readTime: "12 min read",
    author,
    summaryPoints: [
      "Start with bottom-funnel pages before scaling editorial output.",
      "Map every supporting article to a specific conversion path.",
      "Track pipeline signals before obsessing over traffic volume.",
    ],
    intro: [
      "SEO only becomes a growth channel when it is connected to the offer, the buying journey, and the way your sales team closes deals.",
      "When teams chase topics without first deciding which pages should convert, they usually end up with traffic that looks healthy in dashboards but creates almost no commercial movement.",
    ],
    sections: [
      {
        id: "search-volume-is-not-strategy",
        title: "Search volume is not strategy",
        blocks: [
          {
            type: "paragraph",
            text: "A keyword list can tell you what people search for, but it cannot tell you which searches deserve your best resources. That decision comes from the business model, not the tool.",
          },
          {
            type: "paragraph",
            text: "For B2B brands, the strongest SEO programs begin by identifying the offers, pain points, and proof assets that move buyers closer to a sales conversation. Only then do you decide which terms deserve revenue-page treatment and which belong in the supporting editorial layer.",
          },
          {
            type: "list",
            items: [
              "Separate educational demand from commercial demand.",
              "Prioritize pages where the reader can understand the offer and take the next step.",
              "Only scale topics that reinforce positioning instead of distracting from it.",
            ],
          },
        ],
      },
      {
        id: "build-the-revenue-layer-first",
        title: "Build the revenue layer first",
        blocks: [
          {
            type: "paragraph",
            text: "Your most important SEO pages are usually not blog posts. They are solution pages, comparison pages, service pages, and use-case pages that sit close to buyer intent.",
          },
          {
            type: "callout",
            title: "A useful rule of thumb",
            body: "If a page cannot logically support a demo request, consultation, audit, or inquiry, it probably belongs in the supporting layer rather than the revenue layer.",
          },
          {
            type: "paragraph",
            text: "Once those pages are strong, editorial content becomes easier to prioritize because each article has a clear destination. You are no longer publishing to fill a calendar. You are publishing to reinforce a commercial path.",
          },
        ],
      },
      {
        id: "connect-editorial-to-conversion",
        title: "Connect editorial content to conversion paths",
        blocks: [
          {
            type: "paragraph",
            text: "Supporting articles should create trust, explain decision criteria, and remove friction. They should not live in isolation.",
          },
          {
            type: "quote",
            text: "The goal is not to make the article rank. The goal is to make the ranking useful for the business.",
            author: "Rehan Kadri",
          },
          {
            type: "list",
            items: [
              "Link each article to one primary conversion page.",
              "Use examples, proof, and contrasts that naturally introduce your offer.",
              "Make the next step obvious without turning the article into a sales pitch.",
            ],
          },
        ],
      },
      {
        id: "measure-the-right-signals",
        title: "Measure the right signals",
        blocks: [
          {
            type: "paragraph",
            text: "Traffic and rankings matter, but they should sit underneath stronger leading indicators: sales-qualified pageviews, assisted conversions, demo-start rate, scroll depth on commercial pages, and the percentage of inbound conversations that mention content.",
          },
          {
            type: "paragraph",
            text: "When these metrics improve, you know SEO is creating buying momentum instead of just accumulating impressions.",
          },
        ],
      },
      {
        id: "a-90-day-rollout",
        title: "A 90-day rollout that stays focused",
        blocks: [
          {
            type: "list",
            items: [
              "Month 1: tighten positioning, audit conversion pages, and decide which buying-intent pages must exist first.",
              "Month 2: launch or rebuild revenue pages and create the first supporting article clusters.",
              "Month 3: improve internal links, distribute insights, and review which topics are actually influencing deals.",
            ],
          },
          {
            type: "paragraph",
            text: "This sequencing keeps SEO tied to revenue from the beginning. It also makes it much easier to explain the channel internally because every page has a business reason to exist.",
          },
        ],
      },
    ],
  },
  {
    slug: "content-repurposing-engine-for-youtube-linkedin-and-seo",
    title: "A Content Repurposing Engine for YouTube, LinkedIn, and SEO",
    category: categories.content,
    subcategories: ["Repurposing"],
    excerpt:
      "One strong insight can become a full distribution system when the workflow is designed before production starts.",
    cardBlurb:
      "This is a repeatable operating model for turning one core idea into video, social, and search assets without making the team feel like it is running three separate content programs.",
    heroDescription:
      "A practical content engine for brands that want more reach without tripling production effort.",
    seoDescription:
      "Build a repeatable content repurposing engine across YouTube, LinkedIn, and SEO with one workflow and stronger editorial consistency.",
    publishedAt: "2026-03-25",
    readTime: "10 min read",
    author,
    summaryPoints: [
      "Anchor every content cycle around one core idea with depth.",
      "Write transformation rules for each channel before production starts.",
      "Measure resonance, not just output volume.",
    ],
    intro: [
      "Most repurposing systems fail because they start after the content is already made. At that point, the team is trying to force one asset into formats it was never built to support.",
      "A better approach is to choose the core idea first, define how it changes across channels, and then create once with distribution in mind.",
    ],
    sections: [
      {
        id: "start-with-a-core-asset",
        title: "Start with a core asset that carries real depth",
        blocks: [
          {
            type: "paragraph",
            text: "A repurposing engine needs a source asset that can survive transformation. Long-form video, a workshop, a detailed internal memo, or a founder interview usually works well because the thinking has enough texture to split into multiple angles.",
          },
          {
            type: "paragraph",
            text: "If the source is shallow, every downstream asset becomes repetitive. If the source contains proof, tension, and opinion, the whole engine gets stronger.",
          },
        ],
      },
      {
        id: "define-transformation-rules",
        title: "Define transformation rules before production",
        blocks: [
          {
            type: "list",
            items: [
              "YouTube keeps the full reasoning, examples, and pacing.",
              "LinkedIn extracts one sharp argument, one proof point, and one takeaway.",
              "SEO expands the idea into decision-stage structure, search intent, and supporting subtopics.",
            ],
          },
          {
            type: "callout",
            title: "Why this matters",
            body: "Repurposing works when each format has a job. It breaks when every channel receives the same message in a slightly different wrapper.",
          },
        ],
      },
      {
        id: "build-an-editorial-assembly-line",
        title: "Build an editorial assembly line",
        blocks: [
          {
            type: "paragraph",
            text: "Once your rules are clear, the process becomes operational instead of creative chaos. One recording session creates the transcript, the talking points, the supporting examples, and the raw material for every channel.",
          },
          {
            type: "list",
            items: [
              "Pull clips, hooks, and quotes from the same transcript.",
              "Store approved phrasing, proof points, and examples in a simple content library.",
              "Publish on a cadence that lets each asset reinforce the next one.",
            ],
          },
        ],
      },
      {
        id: "keep-the-message-consistent",
        title: "Keep the message consistent while the format changes",
        blocks: [
          {
            type: "paragraph",
            text: "The tone can adapt, but the strategic message should stay recognizable. That means the same belief system, the same positioning, and the same commercial direction should show up whether someone finds you through a post, a search result, or a long-form video.",
          },
          {
            type: "quote",
            text: "Consistency is what turns content into authority. Variety only matters after the audience understands what you stand for.",
            author: "Rehan Kadri",
          },
          {
            type: "paragraph",
            text: "When every derivative asset carries the same market belief, the audience experiences repetition as clarity instead of redundancy.",
          },
        ],
      },
      {
        id: "measure-resonance-over-volume",
        title: "Measure resonance over volume",
        blocks: [
          {
            type: "paragraph",
            text: "Publishing more assets is not the same as building more demand. The signals that matter are watch time, saves, comments that echo the message back to you, branded search lift, direct replies, and inbound conversations shaped by the content.",
          },
          {
            type: "paragraph",
            text: "When you measure resonance, you stop rewarding busywork and start improving the ideas that actually move buyers.",
          },
        ],
      },
    ],
  },
  {
    slug: "lead-qualification-funnel-for-high-ticket-b2b-offers",
    title: "How to Build a Lead Qualification Funnel for High-Ticket B2B Offers",
    category: categories.pipeline,
    subcategories: ["Lead Qualification"],
    excerpt:
      "The fastest way to improve lead quality is to shape the journey before someone ever speaks to sales.",
    cardBlurb:
      "A strong funnel does not just capture more demand. It pre-qualifies the right people, reduces friction for serious buyers, and filters weak-fit leads before they drain attention.",
    heroDescription:
      "A practical framework for shaping high-intent demand before it reaches your calendar.",
    seoDescription:
      "Learn how to build a lead qualification funnel for high-ticket B2B offers with better pre-qualification, stronger offers, and cleaner handoffs to sales.",
    publishedAt: "2026-03-20",
    readTime: "11 min read",
    author,
    summaryPoints: [
      "Clarify the offer and the fit before optimizing conversion rates.",
      "Use content and landing pages to pre-sell the next step.",
      "Design forms and booking flows to filter for intent, not just volume.",
    ],
    intro: [
      "If your funnel sends low-context leads into sales calls, the problem usually starts before the form. Buyers are not seeing enough relevance, enough proof, or enough expectation-setting before they convert.",
      "High-ticket funnels work best when they educate and qualify at the same time. The right prospects feel more confident. The wrong prospects feel less urgency to book.",
    ],
    sections: [
      {
        id: "clarify-the-offer-first",
        title: "Clarify the offer before optimizing conversion rate",
        blocks: [
          {
            type: "paragraph",
            text: "Improving conversion on a confusing offer usually creates more bad leads, not more revenue. Before changing forms or booking pages, tighten the promise, the audience fit, and the expected outcome.",
          },
          {
            type: "list",
            items: [
              "State who the offer is for.",
              "Explain the problem it solves and how it works.",
              "Set expectations around timeline, effort, and fit.",
            ],
          },
        ],
      },
      {
        id: "pre-sell-with-content",
        title: "Use content to pre-sell the next step",
        blocks: [
          {
            type: "paragraph",
            text: "The best funnel content does not just attract attention. It helps the buyer understand the process, the trade-offs, and the result they should expect. This makes the conversion step feel like a continuation of the journey, not a leap.",
          },
          {
            type: "callout",
            title: "A simple test",
            body: "If someone books a call without understanding your process or pricing logic, your funnel is collecting curiosity instead of commitment.",
          },
        ],
      },
      {
        id: "design-for-intent",
        title: "Design forms and pages for intent",
        blocks: [
          {
            type: "paragraph",
            text: "Short forms can increase submissions, but high-ticket services often benefit from better context. Ask for the information that helps both sides determine fit quickly.",
          },
          {
            type: "list",
            items: [
              "Company size or stage",
              "Main bottleneck or business goal",
              "Urgency and timeline",
              "Budget range or level of investment readiness",
            ],
          },
          {
            type: "paragraph",
            text: "The goal is not to make the form longer for its own sake. The goal is to protect time and create sharper conversations.",
          },
        ],
      },
      {
        id: "improve-the-booking-handoff",
        title: "Improve the handoff after the form",
        blocks: [
          {
            type: "paragraph",
            text: "Once someone submits, reinforce the buying motion. Confirmation pages, booking pages, and pre-call emails should reduce doubt and keep context strong.",
          },
          {
            type: "quote",
            text: "Better lead quality often comes from better expectation-setting, not stricter filtering alone.",
            author: "Rehan Kadri",
          },
          {
            type: "paragraph",
            text: "Use this stage to preview the conversation, show proof, and remind the lead why the next step is worth their time.",
          },
        ],
      },
      {
        id: "review-quality-weekly",
        title: "Review lead quality every week",
        blocks: [
          {
            type: "paragraph",
            text: "Lead quality changes fast when offers, channels, or audiences shift. Weekly review loops help you connect conversion data with sales outcomes before waste compounds.",
          },
          {
            type: "list",
            items: [
              "Which channels produce the best-fit conversations?",
              "Which pages assist high-quality leads most often?",
              "Where do weak-fit leads misunderstand the offer?",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "founder-authority-playbook-for-linkedin-youtube-and-google",
    title: "The Founder Authority Playbook for LinkedIn, YouTube, and Google",
    category: categories.authority,
    subcategories: ["Founder Brand"],
    excerpt:
      "Founder-led content works when it creates recognizable trust across every discovery surface buyers use.",
    cardBlurb:
      "Authority is not built by posting everywhere. It grows when the founder's viewpoint, proof, and operating style stay consistent across search, social, and long-form content.",
    heroDescription:
      "A practical publishing model for founders who want stronger trust, better positioning, and more inbound demand.",
    seoDescription:
      "Build founder authority across LinkedIn, YouTube, and Google with a consistent message, stronger proof, and a practical publishing cadence.",
    publishedAt: "2026-03-15",
    readTime: "9 min read",
    author,
    summaryPoints: [
      "Choose a clear market belief before creating more content.",
      "Use platform-specific formats while keeping one strategic message.",
      "Document proof so authority compounds instead of resetting each week.",
    ],
    intro: [
      "Founders often underestimate how fragmented buyer trust has become. A prospect might see a search result, then a LinkedIn post, then a video clip, and only after that decide whether you are worth paying attention to.",
      "That means authority is less about one viral moment and more about repetition with clarity across the places buyers already spend time.",
    ],
    sections: [
      {
        id: "start-with-a-market-belief",
        title: "Start with a market belief buyers can recognize",
        blocks: [
          {
            type: "paragraph",
            text: "Founders become memorable when they articulate a clear point of view. This could be how they think about growth, product strategy, sales, hiring, or the problem their market keeps solving the wrong way.",
          },
          {
            type: "paragraph",
            text: "Without that belief, content becomes disconnected updates. With it, every asset reinforces the same strategic signal.",
          },
        ],
      },
      {
        id: "adapt-the-format-not-the-message",
        title: "Adapt the format, not the message",
        blocks: [
          {
            type: "list",
            items: [
              "LinkedIn should feel immediate, opinionated, and conversational.",
              "YouTube should provide depth, examples, and visible expertise.",
              "Google-facing content should structure the same thinking for search intent and decision-stage discovery.",
            ],
          },
          {
            type: "paragraph",
            text: "Each channel can have its own cadence and mechanics, but the audience should still feel the same operator behind all of it.",
          },
        ],
      },
      {
        id: "turn-proof-into-a-library",
        title: "Turn proof into a reusable library",
        blocks: [
          {
            type: "paragraph",
            text: "Screenshots, customer stories, process notes, before-and-after examples, and internal frameworks should be stored in one place. That gives the founder and the team fast access to substance every time a new asset is created.",
          },
          {
            type: "callout",
            title: "What compounds authority",
            body: "Proof beats novelty. The more often your market sees the same quality of evidence attached to the same core message, the faster trust forms.",
          },
        ],
      },
      {
        id: "publish-on-a-manageable-cadence",
        title: "Publish on a cadence you can maintain",
        blocks: [
          {
            type: "paragraph",
            text: "Authority breaks when the system depends on motivation. A sustainable cadence is usually better than an ambitious one because consistency is what teaches the market who you are.",
          },
          {
            type: "quote",
            text: "The best founder content systems feel calm behind the scenes and obvious to the audience.",
            author: "Rehan Kadri",
          },
        ],
      },
      {
        id: "connect-authority-to-demand",
        title: "Connect authority to demand capture",
        blocks: [
          {
            type: "paragraph",
            text: "Authority matters most when the next step is already waiting. That might be a newsletter, a diagnostic offer, a case study, or a strategy call page. If people trust you but cannot easily move forward, you have built attention without leverage.",
          },
          {
            type: "paragraph",
            text: "A good authority system therefore ends where demand capture begins. Trust opens the door. Conversion design moves people through it.",
          },
        ],
      },
    ],
  },
];

export const blogPosts = [...blogPostSource].sort((firstPost, secondPost) =>
  secondPost.publishedAt.localeCompare(firstPost.publishedAt)
);

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogCategories() {
  const categoryMap = new Map<string, BlogCategory>();

  blogPosts.forEach((post) => {
    categoryMap.set(post.category.slug, post.category);
  });

  return Array.from(categoryMap.values());
}

export function getRelatedBlogPosts(currentSlug: string) {
  return blogPosts.filter((post) => post.slug !== currentSlug).slice(0, 3);
}

export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: BLOG_DISPLAY_TIME_ZONE,
  }).format(new Date(toBlogIsoDateTime(value)));
}

export function hasBlogTime(value: string) {
  return /T\d{2}:\d{2}/.test(value);
}

export function toBlogIsoDateTime(value: string) {
  const normalizedValue = value.trim();

  if (!hasBlogTime(normalizedValue)) {
    return `${normalizedValue}T00:00:00Z`;
  }

  return /(?:Z|[+-]\d{2}:\d{2})$/.test(normalizedValue)
    ? normalizedValue
    : `${normalizedValue}Z`;
}

export function formatBlogDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: BLOG_DISPLAY_TIME_ZONE,
  }).format(new Date(toBlogIsoDateTime(value)));
}

export function getBlogDisplayDateValue(post: BlogPost) {
  return post.modifiedAt ?? post.publishedAt;
}

export function formatBlogDisplayDate(post: BlogPost) {
  return formatBlogDate(getBlogDisplayDateValue(post));
}

export function getBlogDisplayDateTimeValue(post: BlogPost) {
  return toBlogIsoDateTime(getBlogDisplayDateValue(post));
}

export function getBlogDisplayDateLabel(post: BlogPost) {
  return post.modifiedAt ? "Last updated" : "Published";
}

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function estimateLegacyReadTime(post: BlogPost) {
  const introWords = post.intro.reduce((total, paragraph) => total + countWords(paragraph), 0);
  const sectionWords = post.sections.reduce((total, section) => {
    const headingWords = countWords(section.title);
    const blockWords = section.blocks.reduce((blockTotal, block) => {
      switch (block.type) {
        case "paragraph":
          return blockTotal + countWords(block.text);
        case "list":
          return blockTotal + block.items.reduce((listTotal, item) => listTotal + countWords(item), 0);
        case "callout":
          return blockTotal + countWords(block.title) + countWords(block.body);
        case "quote":
          return blockTotal + countWords(block.text) + countWords(block.author);
      }
    }, 0);

    return total + headingWords + blockWords;
  }, 0);

  const totalWords = introWords + sectionWords;
  const minutes = Math.max(1, Math.ceil(totalWords / 200));
  return `${minutes} min read`;
}

export function getBlogReadTime(post: BlogPost) {
  if (post.readTime?.trim()) {
    return post.readTime;
  }

  return estimateLegacyReadTime(post);
}
