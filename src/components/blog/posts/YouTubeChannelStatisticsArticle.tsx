import type { CSSProperties, ReactNode } from "react";
import styles from "@/app/(frontend)/blog/blog.module.css";

type MetricCard = {
  label: string;
  value: string;
  note: string;
  context?: string;
};

type ChartDatum = {
  label: string;
  value: number;
  valueLabel: string;
};

type ChartTone = {
  start: string;
  end: string;
  soft: string;
  track: string;
};

type ArticleBlock =
  | { type: "heading"; id: string; text: string; level?: 2 | 3 }
  | { type: "paragraph"; text: string; sectionId?: string }
  | { type: "list"; items: string[]; ordered?: boolean; sectionId?: string }
  | { type: "table"; headers: string[]; rows: string[][]; sectionId?: string }
  | { type: "insight-list"; items: { number: string; text: string }[]; sectionId?: string };

const chartTones = {
  ember: {
    start: "#ffbf92",
    end: "#f15a30",
    soft: "rgba(241, 90, 48, 0.16)",
    track: "rgba(241, 90, 48, 0.1)",
  },
  sunset: {
    start: "#ffd6ae",
    end: "#ff7a45",
    soft: "rgba(255, 122, 69, 0.14)",
    track: "rgba(255, 122, 69, 0.1)",
  },
  apricot: {
    start: "#ffe0bc",
    end: "#ff914d",
    soft: "rgba(255, 145, 77, 0.14)",
    track: "rgba(255, 145, 77, 0.1)",
  },
} satisfies Record<string, ChartTone>;

const openingMetricCards: MetricCard[] = [
  {
    label: "Active channels",
    value: "138M",
    note: "Estimated active YouTube channels in 2026.",
    context: "2026",
  },
  {
    label: "Monthly users",
    value: "2.85B",
    note: "Estimated monthly active YouTube users worldwide.",
    context: "2026",
  },
  {
    label: "Shorts views",
    value: "200B",
    note: "Average daily YouTube Shorts views.",
    context: "Per day",
  },
  {
    label: "Total revenue",
    value: "$60B",
    note: "Total platform revenue leading into 2026.",
    context: "TTM",
  },
];

const countryAudienceData: ChartDatum[] = [
  { label: "India", value: 535, valueLabel: "535M" },
  { label: "United States", value: 254, valueLabel: "254M" },
  { label: "Brazil", value: 144, valueLabel: "144M" },
  { label: "Indonesia", value: 143, valueLabel: "143M" },
  { label: "Mexico", value: 83.6, valueLabel: "83.6M" },
  { label: "Saudi Arabia", value: 27.2, valueLabel: "27.2M" },
  { label: "Australia", value: 20.9, valueLabel: "20.9M" },
];

const topChannelsData: ChartDatum[] = [
  { label: "MrBeast", value: 475, valueLabel: "450-475M" },
  { label: "T-Series", value: 311, valueLabel: "311M" },
  { label: "Cocomelon", value: 200, valueLabel: "200M" },
  { label: "SET India", value: 189, valueLabel: "189M" },
  { label: "Vlad and Niki", value: 149, valueLabel: "149M" },
  { label: "Kids Diana Show", value: 138, valueLabel: "138M" },
];

const creatorIncomeData: ChartDatum[] = [
  { label: "Under $10K/year", value: 48.7, valueLabel: "48.7%" },
  { label: "$10K-$100K/year", value: 45.6, valueLabel: "45.6%" },
  { label: "Over $100K/year", value: 5.7, valueLabel: "5.7%" },
];

const shortsEngagementData: ChartDatum[] = [
  { label: "YouTube Shorts", value: 5.91, valueLabel: "5.91%" },
  { label: "TikTok", value: 5.3, valueLabel: "5.3%" },
  { label: "Instagram Reels", value: 4.7, valueLabel: "Lower" },
];

const insightStatPattern = /(\$?\d[\d,.]*(?:\.\d+)?(?:\s?(?:billion|million|trillion|hours|views|minutes|creators|channels|users|subscribers|sessions|years?|B|M|K))?|\d[\d,.]*(?:\.\d+)?%|\d[\d,.]*(?:\.\d+)?x)/gi;


const articleBlocks: ArticleBlock[] = [

  { type: "paragraph", text: "YouTube now has **138 million active channels**." },
  { type: "paragraph", text: "That's a 21% jump from last year. And it's not slowing down." },
  {
    type: "paragraph",
    text: "In this post, I've pulled together the latest YouTube stats for 2026. Users, revenue, Shorts, the creator economy, and what the platform looks like heading into 2030.",
  },
  { type: "paragraph", text: "Let's dive right in." },

  { type: "heading", id: "top-creator-channel-stats", text: "Top Creator / Channels Stats" },
  {
    type: "insight-list",
    sectionId: "top-creator-channel-stats",
    items: [
      { number: "01", text: "YouTube now has 138 million active channels in 2026." },
      { number: "02", text: "Only 32,300 channels have crossed 1 million subscribers." },
      { number: "03", text: "That means just 0.023% of active channels have reached 1 million subscribers." },
      { number: "04", text: "MrBeast is the #1 channel with 450-475 million subscribers." },
      { number: "05", text: "MrBeast adds around 133,000 new subscribers per day." },
      { number: "06", text: "MrBeast's wider network generates more than 12 billion views per month." },
      { number: "07", text: "The number of channels above 100 million subscribers grew from 11 at the end of 2024 to 17 in 2026." },
      { number: "08", text: "Sub-Saharan Africa saw a 64% jump in new channel registrations." },
      { number: "09", text: "Southeast Asia saw a 58% increase in new channel registrations." },
      { number: "10", text: "YouTube's AI-assisted channel setup tool cut average setup time from 45 minutes to under 8 minutes." },
      { number: "11", text: "Over 720 hours of video are uploaded to YouTube every minute." },
      { number: "12", text: "The platform now hosts more than 6.2 billion long-form videos and 1.8 billion Shorts." },
    ],
  },

  { type: "heading", id: "youtube-channel-stats", text: "YouTube Channel Stats" },
  {
    type: "paragraph",
    text: "There are 138 million active YouTube channels as of 2026.",
    sectionId: "youtube-channel-stats",
  },
  {
    type: "paragraph",
    text: "But here's the kicker: only **32,300 of those channels have crossed 1 million subscribers**.",
    sectionId: "youtube-channel-stats",
  },
  {
    type: "paragraph",
    text: "That's 0.023% of all active channels.",
    sectionId: "youtube-channel-stats",
  },
  {
    type: "paragraph",
    text: "So yes, the platform is massive. But actually breaking through? That's still very, very hard.",
    sectionId: "youtube-channel-stats",
  },
  {
    type: "paragraph",
    text: "The growth is coming from emerging markets. Sub-Saharan Africa saw a 64% jump in new channel registrations. Southeast Asia was up 58%.",
    sectionId: "youtube-channel-stats",
  },
  {
    type: "paragraph",
    text: "A big driver was Google's AI-assisted channel setup tool, launched in Q3 2025. It cut the average setup time from 45 minutes down to under 8 minutes. That removed a huge barrier for new creators in markets where digital literacy is still building.",
    sectionId: "youtube-channel-stats",
  },

  { type: "heading", id: "the-top-youtube-channels-in-2026", text: "The Top YouTube Channels in 2026" },
  {
    type: "table",
    sectionId: "the-top-youtube-channels-in-2026",
    headers: ["Rank", "Channel", "Subscribers", "Country"],
    rows: [
      ["#1", "MrBeast", "450-475M", "USA"],
      ["#2", "T-Series", "311M", "India"],
      ["#3", "Cocomelon", "200M", "USA"],
      ["#4", "SET India", "189M", "India"],
      ["#5", "Vlad and Niki", "149M", "US/Russia"],
      ["#6", "Kids Diana Show", "138M", "US/Ukraine"],
    ],
  },
  {
    type: "paragraph",
    text: "MrBeast became the first individual creator to cross 400 million subscribers in early 2026. He's now approaching 475 million.",
    sectionId: "the-top-youtube-channels-in-2026",
  },
  {
    type: "paragraph",
    text: "He gains an average of **133,000 new subscribers every single day**.",
    sectionId: "the-top-youtube-channels-in-2026",
  },
  {
    type: "paragraph",
    text: "His full network (Beast Philanthropy and MrBeast Gaming included) generates over **12 billion views per month**.",
    sectionId: "the-top-youtube-channels-in-2026",
  },
  {
    type: "paragraph",
    text: "Also worth noting: the number of channels above 100 million subscribers has grown from 11 (end of 2024) to 17 in 2026.",
    sectionId: "the-top-youtube-channels-in-2026",
  },

  { type: "heading", id: "the-big-purge-ai-channels-got-nuked", text: "The Big Purge: AI Channels Got Nuked" },
  {
    type: "paragraph",
    text: "In late 2025 and early 2026, YouTube ran a massive cleanup.",
    sectionId: "the-big-purge-ai-channels-got-nuked",
  },
  {
    type: "paragraph",
    text: "The target? \"AI slop.\" Channels pumping out low-quality, fully automated content with zero human involvement.",
    sectionId: "the-big-purge-ai-channels-got-nuked",
  },
  {
    type: "paragraph",
    text: "Millions of accounts got terminated.",
    sectionId: "the-big-purge-ai-channels-got-nuked",
  },
  {
    type: "paragraph",
    text: "The fallout hit legitimate creators too. Some reported up to a **50% drop in views in January 2026** as YouTube's algorithm recalibrated to prioritize what they're now calling \"Proof of Human\" content.",
    sectionId: "the-big-purge-ai-channels-got-nuked",
  },
  {
    type: "paragraph",
    text: "The message from YouTube was clear: automation is fine, but authenticity is the floor.",
    sectionId: "the-big-purge-ai-channels-got-nuked",
  },

  { type: "heading", id: "how-much-content-gets-uploaded-every-minute", text: "How Much Content Gets Uploaded Every Minute?" },
  {
    type: "paragraph",
    text: "720 hours of video.",
    sectionId: "how-much-content-gets-uploaded-every-minute",
  },
  {
    type: "paragraph",
    text: "Every. Single. Minute.",
    sectionId: "how-much-content-gets-uploaded-every-minute",
  },
  {
    type: "paragraph",
    text: "That's double the upload rate from 2025. The platform now hosts over 6.2 billion long-form videos and 1.8 billion YouTube Shorts.",
    sectionId: "how-much-content-gets-uploaded-every-minute",
  },

  { type: "heading", id: "creator-economy-stats", text: "Creator Economy Stats" },
  {
    type: "paragraph",
    text: "The global creator economy is projected to hit **$234.65 billion in 2026**.",
    sectionId: "creator-economy-stats",
  },
  {
    type: "paragraph",
    text: "That's up from $191.55 billion the year before. The CAGR is 22.5%.",
    sectionId: "creator-economy-stats",
  },
  {
    type: "paragraph",
    text: "US brands alone will spend $43.9 billion on creator advertising in 2026, an 18.3% increase from 2025. That spend is broken down across:",
    sectionId: "creator-economy-stats",
  },
  {
    type: "list",
    sectionId: "creator-economy-stats",
    items: [
      "Direct creator partnerships: $11.6 billion",
      "Paid amplification: $13.2 billion",
      "Retail creator spend: $12.3 billion",
    ],
  },
  {
    type: "paragraph",
    text: "Over 220 million people now identify as creators globally. More than half (50%) are working on their content full-time, up from 46.7% in 2025.",
    sectionId: "creator-economy-stats",
  },

  { type: "heading", id: "the-truth-about-creator-income", text: "The Truth About Creator Income" },
  {
    type: "paragraph",
    text: "Here's something the headlines don't tell you.",
    sectionId: "the-truth-about-creator-income",
  },
  {
    type: "paragraph",
    text: "The \"average\" creator earns about $44,000 a year. But that number is misleading.",
    sectionId: "the-truth-about-creator-income",
  },
  {
    type: "paragraph",
    text: "The top 1% of creators take home **21% of all brand advertising spend**. The top 10% capture 62% of ad payments.",
    sectionId: "the-truth-about-creator-income",
  },
  {
    type: "paragraph",
    text: "The real income distribution looks like this:",
    sectionId: "the-truth-about-creator-income",
  },
  {
    type: "list",
    sectionId: "the-truth-about-creator-income",
    items: [
      "**48.7%** of creators earn under $10,000/year. Half of those earn less than $5,000.",
      "**45.6%** earn between $10,000 and $100,000/year.",
      "**5.7%** earn over $100,000/year.",
    ],
  },
  {
    type: "paragraph",
    text: "Only **4% of the 220 million global creators** earn more than $100,000 annually.",
    sectionId: "the-truth-about-creator-income",
  },
  {
    type: "paragraph",
    text: "The creator economy is real. The money is real. But the distribution is brutal.",
    sectionId: "the-truth-about-creator-income",
  },

  { type: "heading", id: "youtube-revenue-stats", text: "YouTube Revenue Stats" },
  {
    type: "paragraph",
    text: "YouTube generated **$60 billion in total revenue** in the twelve months leading into 2026.",
    sectionId: "youtube-revenue-stats",
  },
  {
    type: "paragraph",
    text: "To put that in context: Netflix made $45.18 billion in the same period. YouTube's revenue is 33% higher.",
    sectionId: "youtube-revenue-stats",
  },
  {
    type: "paragraph",
    text: "Walt Disney Company did $95.7 billion. YouTube is right behind it.",
    sectionId: "youtube-revenue-stats",
  },
  {
    type: "paragraph",
    text: "Here's the breakdown:",
    sectionId: "youtube-revenue-stats",
  },
  {
    type: "paragraph",
    text: "Advertising brought in $40.37 billion, up 11.67% from 2024's $36.15 billion. Q4 2025 alone accounted for $11.38-11.4 billion.",
    sectionId: "youtube-revenue-stats",
  },
  {
    type: "paragraph",
    text: "YouTube Premium hit 125-127 million paid subscribers. It generates roughly $9.4-20 billion in annual recurring revenue (depending on which services you include).",
    sectionId: "youtube-revenue-stats",
  },
  {
    type: "paragraph",
    text: "YouTube TV crossed 9.4-10 million subscribers at $73/month. Forecasts put it at 12.4 million by year end, which would make it the largest pay-TV provider in the US.",
    sectionId: "youtube-revenue-stats",
  },

  { type: "heading", id: "youtube-shorts-stats", text: "YouTube Shorts Stats" },
  {
    type: "paragraph",
    text: "YouTube Shorts now gets **200 billion daily views**.",
    sectionId: "youtube-shorts-stats",
  },
  {
    type: "paragraph",
    text: "That's up from 70 billion in early 2024. And it's attracting 2 billion Monthly Active Users globally, including 175-184 million in the US alone.",
    sectionId: "youtube-shorts-stats",
  },
  {
    type: "paragraph",
    text: "The ideal Shorts length? Data says **50-60 seconds** gets the highest reach, averaging 1.7 million to 4.1 million views per video. The most commonly created length (25.48% of all Shorts) is 30-40 seconds, which averages 690,000 to 1.3 million views.",
    sectionId: "youtube-shorts-stats",
  },
  {
    type: "paragraph",
    text: "Shorts also beats every competitor on engagement:",
    sectionId: "youtube-shorts-stats",
  },
  {
    type: "list",
    sectionId: "youtube-shorts-stats",
    items: [
      "YouTube Shorts: 5.91% average engagement rate",
      "TikTok: 5.3%",
      "Instagram Reels: Lower",
    ],
  },
  {
    type: "paragraph",
    text: "Average viewer retention on a single Short? 73%.",
    sectionId: "youtube-shorts-stats",
  },

  { type: "heading", id: "the-shorts-monetization-reality", text: "The Shorts Monetization Reality" },
  {
    type: "paragraph",
    text: "Here's the thing about Shorts money: it's almost nonexistent.",
    sectionId: "the-shorts-monetization-reality",
  },
  {
    type: "paragraph",
    text: "The average RPM for Shorts is $0.01 to $0.06 per 1,000 views.",
    sectionId: "the-shorts-monetization-reality",
  },
  {
    type: "paragraph",
    text: "To earn $100, you need roughly 3.3 million views at a $0.03 average RPM.",
    sectionId: "the-shorts-monetization-reality",
  },
  {
    type: "paragraph",
    text: "That means Shorts work best as a top-of-funnel tool, not a revenue source.",
    sectionId: "the-shorts-monetization-reality",
  },
  {
    type: "paragraph",
    text: "The smartest creators use Shorts to get subscribers, then push them toward long-form videos where RPMs are significantly higher. Creators who diversify consistently earn 3-5x more than those relying purely on platform ad revenue.",
    sectionId: "the-shorts-monetization-reality",
  },
  {
    type: "paragraph",
    text: "Affiliate marketing now makes up 21.2% of total creator income. That's a big deal.",
    sectionId: "the-shorts-monetization-reality",
  },

  { type: "heading", id: "youtube-user-stats", text: "YouTube User Stats" },
  {
    type: "paragraph",
    text: "**YouTube has 2.85 billion Monthly Active Users in 2026.**",
    sectionId: "youtube-user-stats",
  },
  {
    type: "paragraph",
    text: "That makes it the second most-visited platform on the planet, just behind Facebook's 3.07 billion.",
    sectionId: "youtube-user-stats",
  },
  {
    type: "paragraph",
    text: "But here's what most people miss: it's not just about monthly visits anymore.",
    sectionId: "youtube-user-stats",
  },
  {
    type: "paragraph",
    text: "YouTube has 122 million Daily Active Users who open the app every single day. Those users spend an average of 49 minutes on the platform.",
    sectionId: "youtube-user-stats",
  },
  {
    type: "paragraph",
    text: "Heavy users? They're clocking 1 hour and 25 minutes per day.",
    sectionId: "youtube-user-stats",
  },
  {
    type: "paragraph",
    text: "Over 1 billion hours of video are watched on YouTube every day.",
    sectionId: "youtube-user-stats",
  },
  {
    type: "paragraph",
    text: "Not bad for a platform that started as a \"funny videos\" site.",
    sectionId: "youtube-user-stats",
  },

  { type: "heading", id: "youtube-users-by-country-2026", text: "YouTube Users by Country (2026)" },
  {
    type: "paragraph",
    text: "Here's where YouTube's biggest audiences live:",
    sectionId: "youtube-users-by-country-2026",
  },
  {
    type: "list",
    sectionId: "youtube-users-by-country-2026",
    items: [
      "**India:** 535 million users (~38% of the population). 61% of watch time is in regional languages like Tamil, Telugu, and Hindi.",
      "**United States:** 253-254 million users (85% of adults).",
      "**Brazil:** 144 million users (~67% penetration).",
      "**Indonesia:** 143 million users (~51% penetration).",
      "**Mexico:** 83.6 million users (~65% penetration).",
      "**Saudi Arabia:** 27.2 million users (79.4% penetration).",
      "**Australia:** 20.9 million users (80.2% penetration).",
    ],
  },
  {
    type: "paragraph",
    text: "The US and Australia are mature markets where people are cutting cable and switching to YouTube on their TVs.",
    sectionId: "youtube-users-by-country-2026",
  },
  {
    type: "paragraph",
    text: "India and Indonesia are mobile-first markets growing fast.",
    sectionId: "youtube-users-by-country-2026",
  },
  {
    type: "paragraph",
    text: "Two completely different platforms. One URL.",
    sectionId: "youtube-users-by-country-2026",
  },

  { type: "heading", id: "device-trends-the-tv-takeover", text: "Device Trends: The TV Takeover" },
  {
    type: "paragraph",
    text: "Mobile still dominates globally, accounting for 69-70% of all YouTube watch time.",
    sectionId: "device-trends-the-tv-takeover",
  },
  {
    type: "paragraph",
    text: "But something big is happening in the US.",
    sectionId: "device-trends-the-tv-takeover",
  },
  {
    type: "paragraph",
    text: "TV screens have officially passed mobile as the #1 way Americans watch YouTube. YouTube now captures **12.8% of all US TV viewing**, making it the biggest internet TV provider in the country.",
    sectionId: "device-trends-the-tv-takeover",
  },
  {
    type: "paragraph",
    text: "That's not just a stat. That's the death of cable playing out in real time.",
    sectionId: "device-trends-the-tv-takeover",
  },

  { type: "heading", id: "whos-actually-on-youtube", text: "Who's Actually on YouTube?" },
  {
    type: "paragraph",
    text: "Globally, the gender split is roughly 53% male and 47% female.",
    sectionId: "whos-actually-on-youtube",
  },
  {
    type: "paragraph",
    text: "The biggest age group? 25-to-34-year-olds, making up about 21-22% of all users.",
    sectionId: "whos-actually-on-youtube",
  },
  {
    type: "paragraph",
    text: "And here's a stat that would have seemed wild five years ago: **35% of US adults now get their news primarily from YouTube**. Back in 2020, that number was 23%.",
    sectionId: "whos-actually-on-youtube",
  },
  {
    type: "paragraph",
    text: "YouTube isn't just entertainment anymore. It's where people learn what's happening in the world.",
    sectionId: "whos-actually-on-youtube",
  },

  { type: "heading", id: "youtube-trends-and-seo-in-2026", text: "YouTube Trends and SEO in 2026" },
  {
    type: "paragraph",
    text: "YouTube is the second largest search engine on the planet. Billions of queries go through it every day.",
    sectionId: "youtube-trends-and-seo-in-2026",
  },
  {
    type: "paragraph",
    text: "In 2026, ranking on YouTube isn't just about traditional SEO anymore. It's about GEO (Generative Engine Optimization). That means formatting your content so AI systems can find and cite it.",
    sectionId: "youtube-trends-and-seo-in-2026",
  },
  {
    type: "paragraph",
    text: "The three things that matter most for GEO on YouTube:",
    sectionId: "youtube-trends-and-seo-in-2026",
  },
  {
    type: "list",
    ordered: true,
    sectionId: "youtube-trends-and-seo-in-2026",
    items: [
      "**Terminological consistency.** Don't use 5 different words for the same concept. Pick one term and stick with it throughout your transcript.",
      "**Chunked formatting.** Short, clean paragraphs in descriptions. Long blocks get ignored by retrieval systems.",
      "**Direct early answers.** Say the answer to your topic's most important question in the first 60 seconds of the video. AI systems scan for extractable data points.",
    ],
  },
  {
    type: "paragraph",
    text: "About 29% of all new videos uploaded in 2026 are entirely or heavily AI-generated. Creators using AI for scripting and editing report 2-3x higher content output.",
    sectionId: "youtube-trends-and-seo-in-2026",
  },
  {
    type: "paragraph",
    text: "But the audience is pushing back. IRL content, live streams, and unscripted storytelling are getting a premium valuation. People want humans.",
    sectionId: "youtube-trends-and-seo-in-2026",
  },

  { type: "heading", id: "high-cpm-niches-worth-knowing", text: "High-CPM Niches Worth Knowing" },
  {
    type: "paragraph",
    text: "Not all YouTube audiences are equal. Some niches attract advertisers willing to pay WAY more per 1,000 views.",
    sectionId: "high-cpm-niches-worth-knowing",
  },
  {
    type: "paragraph",
    text: "Here are some underserved niches worth paying attention to in 2026:",
    sectionId: "high-cpm-niches-worth-knowing",
  },
  {
    type: "table",
    sectionId: "high-cpm-niches-worth-knowing",
    headers: ["Niche", "Monthly Searches", "Saturation", "Monetization Timeline"],
    rows: [
      ["Trading App Tutorials", "450,000", "High", "1-2 months"],
      ["Geopolitical Travel Vlogs", "1.5M", "Medium", "3-6 months"],
      ["Korean Drone & Light Shows", "550,000", "Medium", "3-5 months"],
      ["Vintage Soul Music Albums", "450,000", "Medium", "4-8 months"],
      ["Streamer Lore Mockumentaries", "75,000", "Low", "Fast"],
    ],
  },
  {
    type: "paragraph",
    text: "The pattern here? Specific audience, high intent, big advertiser budgets. A trading tutorial channel with 10,000 views per video can easily out-earn a gaming channel with 500,000 views per video.",
    sectionId: "high-cpm-niches-worth-knowing",
  },

  { type: "heading", id: "youtube-predictions-2026-2030", text: "YouTube Predictions: 2026-2030" },
  {
    type: "paragraph",
    text: "The global TV and online video market is projected to cross **$1 trillion by 2030**.",
    sectionId: "youtube-predictions-2026-2030",
  },
  {
    type: "paragraph",
    text: "Online video advertising alone is forecast to grow from $309 billion in 2025 to **$540 billion in 2030**, going from 40% to 53% of total market revenues.",
    sectionId: "youtube-predictions-2026-2030",
  },
  {
    type: "paragraph",
    text: "YouTube is expected to approach **3 billion global users by 2027** (Omdia). That's nearly 3x Netflix's projected user base at the same time.",
    sectionId: "youtube-predictions-2026-2030",
  },
  {
    type: "paragraph",
    text: "The video streaming market as a whole is projected to hit **$416.8 billion by 2030**, growing at a CAGR of 21.5%.",
    sectionId: "youtube-predictions-2026-2030",
  },
  {
    type: "paragraph",
    text: "And linear TV keeps shrinking. Its ad revenue is expected to drop from $123 billion in 2025 to $113 billion by 2030. That money is heading somewhere, and most of it is heading to YouTube.",
    sectionId: "youtube-predictions-2026-2030",
  },

  { type: "heading", id: "closing-summary", text: "So there you have it" },
  {
    type: "paragraph",
    text: "YouTube in 2026 is bigger, richer, and more competitive than ever.",
    sectionId: "closing-summary",
  },
  {
    type: "paragraph",
    text: "The platform is still growing. The money is still real. But the gap between the top creators and everyone else is wider than it's ever been.",
    sectionId: "closing-summary",
  },
  {
    type: "paragraph",
    text: "The data is pretty clear on what works: long-form videos that hold attention, Shorts as a subscriber funnel, niches with high-value advertisers, and revenue that doesn't live or die by algorithm.",
    sectionId: "closing-summary",
  },
  { type: "paragraph", text: "That's the playbook.", sectionId: "closing-summary" },
];

function renderInlineMarkdown(text: string): ReactNode[] {
  const fragments: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      fragments.push(text.slice(lastIndex, match.index));
    }

    fragments.push(<strong key={`${match[1]}-${match.index}`}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    fragments.push(text.slice(lastIndex));
  }

  return fragments.length ? fragments : [text];
}

function renderInsightText(text: string): ReactNode[] {
  const fragments: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(insightStatPattern.source, "gi");

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      fragments.push(text.slice(lastIndex, match.index));
    }

    fragments.push(
      <span key={`${match[0]}-${match.index}`} className={styles.youtubeInsightEmphasis}>
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    fragments.push(text.slice(lastIndex));
  }

  return fragments.length ? fragments : [text];
}

function StatDeck({ items }: { items: MetricCard[] }) {
  return (
    <section className={styles.youtubeStatDeck} aria-label="Key YouTube channel statistics">
      {items.map((item) => (
        <article key={item.label} className={styles.youtubeStatCard}>
          <div className={styles.youtubeStatHeader}>
            <span className={styles.youtubeStatLabel}>{item.label}</span>
            {item.context ? <span className={styles.youtubeStatContext}>{item.context}</span> : null}
          </div>
          <strong className={styles.youtubeStatValue}>{item.value}</strong>
          <p className={styles.youtubeStatNote}>{item.note}</p>
        </article>
      ))}
    </section>
  );
}

function HorizontalBarChart({
  title,
  eyebrow,
  summary,
  items,
  tone,
}: {
  title: string;
  eyebrow: string;
  summary?: string;
  items: ChartDatum[];
  tone: ChartTone;
}) {
  const maxValue = Math.max(...items.map((item) => item.value));
  const chartStyle = {
    "--chart-start": tone.start,
    "--chart-end": tone.end,
    "--chart-soft": tone.soft,
    "--chart-track": tone.track,
  } as CSSProperties;

  return (
    <section className={styles.youtubeVisualPanel} aria-label={title}>
      <div className={styles.youtubeVisualHeader}>
        <span className={styles.youtubeVisualEyebrow}>{eyebrow}</span>
        <div className={styles.youtubeVisualHeaderTop}>
          <h3>{title}</h3>
          {summary ? <p className={styles.youtubeVisualSummary}>{summary}</p> : null}
        </div>
      </div>
      <div className={styles.youtubeHorizontalChart} style={chartStyle}>
        {items.map((item) => (
          <div key={item.label} className={styles.youtubeHorizontalRow}>
            <div className={styles.youtubeHorizontalMeta}>
              <span className={styles.youtubeHorizontalLabel}>{item.label}</span>
              <span className={styles.youtubeHorizontalValue}>{item.valueLabel}</span>
            </div>
            <div
              className={styles.youtubeHorizontalTrack}
              style={{ "--bar-size": `${(item.value / maxValue) * 100}%` } as CSSProperties}
            >
              <span className={styles.youtubeHorizontalFill} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function renderSectionVisual(sectionId?: string) {
  switch (sectionId) {
    case "youtube-user-stats":
      return <StatDeck items={openingMetricCards} />;
    case "youtube-users-by-country-2026":
      return (
        <HorizontalBarChart
          eyebrow="Audience geography"
          title="Top YouTube audiences by country"
          summary="India leads by a wide margin, while the United States remains the largest mature market."
          items={countryAudienceData}
          tone={chartTones.sunset}
        />
      );
    case "the-top-youtube-channels-in-2026":
      return (
        <HorizontalBarChart
          eyebrow="Subscriber leaderboard"
          title="Largest YouTube channels in 2026"
          summary="MrBeast sits far ahead of every other creator-led or media-led channel."
          items={topChannelsData}
          tone={chartTones.ember}
        />
      );
    case "the-truth-about-creator-income":
      return (
        <HorizontalBarChart
          eyebrow="Income distribution"
          title="How creator earnings are actually distributed"
          summary="Most creators remain below $10,000 per year, while only a small minority cross six figures."
          items={creatorIncomeData}
          tone={chartTones.apricot}
        />
      );
    case "youtube-shorts-stats":
      return (
        <HorizontalBarChart
          eyebrow="Engagement race"
          title="Short-form platform engagement comparison"
          summary="YouTube Shorts edges ahead on average engagement in the article's cited comparison."
          items={shortsEngagementData}
          tone={chartTones.sunset}
        />
      );
    default:
      return null;
  }
}

function renderBlock(block: ArticleBlock) {
  switch (block.type) {
    case "heading":
      if (block.level === 3) {
        return (
          <h3 id={block.id} className={styles.richTextSubheading}>
            {block.text}
          </h3>
        );
      }

      return <h2 id={block.id}>{block.text}</h2>;
    case "paragraph":
      return <p>{renderInlineMarkdown(block.text)}</p>;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      const className = block.ordered ? styles.youtubeOrderedList : styles.articleList;

      return (
        <Tag className={className}>
          {block.items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </Tag>
      );
    }
    case "table":
      return (
        <div className={styles.youtubeDataTableWrap}>
          <table className={styles.youtubeDataTable}>
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${row.join("-")}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "insight-list":
      return (
        <section className={styles.youtubeInsightGrid}>
          {block.items.map((item) => (
            <article key={item.number} className={styles.youtubeInsightCard}>
              <div className={styles.youtubeInsightTop}>
                <span className={styles.youtubeInsightNumber}>{item.number}</span>
              </div>
              <p>{renderInsightText(item.text)}</p>
            </article>
          ))}
        </section>
      );
  }
}

export const youtubeChannelStatisticsHeadingItems = articleBlocks.flatMap((block) =>
  block.type === "heading"
    ? [
        {
          id: block.id,
          title: block.text,
        },
      ]
    : []
);

export const youtubeChannelStatisticsWordCount = 1725;

export default function YouTubeChannelStatisticsArticle() {
  return (
    <>
      {articleBlocks.map((block, index) => {
        const nextBlock = articleBlocks[index + 1];
        const sectionId = block.type === "heading" ? undefined : block.sectionId;
        const shouldRenderVisual =
          block.type !== "heading" && (!nextBlock || nextBlock.type === "heading");
        const visual = shouldRenderVisual ? renderSectionVisual(sectionId) : null;

        return (
          <div key={`${block.type}-${index}`}>
            <div className={styles.youtubeArticleBlock}>
              {renderBlock(block)}
              {visual}
            </div>
          </div>
        );
      })}
    </>
  );
}





