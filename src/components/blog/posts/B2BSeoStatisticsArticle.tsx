import type { CSSProperties, ReactNode } from "react";
import { slugifyHeading } from "@/lib/blog-rich-text";
import baseStyles from "@/app/(frontend)/blog/blog.module.css";
import styles from "./b2b-stats-visuals.module.css";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

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

type DonutSlice = {
  label: string;
  value: number;
  valueLabel: string;
  color: string;
};

type ChartTone = {
  start: string;
  end: string;
  soft: string;
  track: string;
};

type InsightItem = {
  number: string;
  text: string;
};

const ARTICLE_MARKDOWN = `# B2B SEO Statistics 2026: The Data Every Marketer Needs to Know

I gone through dozens of research reports to find the most important B2B SEO stats for 2026.

Here's what I found: the rules have completely changed.

AI has taken over search. Buyers finish their research before they talk to a single salesperson. And the brands that win? They're already in the buyer's head before the buying process even starts.

Read on to find the best hand-picked stats about:

- AI and Answer Engine Optimization (AEO)
- Buyer behavior and the "Day One" shortlist
- Content strategy and ROI
- Lead generation and conversions
- Content formats (blogs, video, podcasts, LinkedIn)
- Budget and investment trends
- The biggest challenges marketers face right now

Let's dive right in.

---

## Top 10 B2B SEO Stats for 2026

These are the stats that matter most. They show exactly where the industry is heading.

**95% of the time, the winning vendor was already on the buyer's day-one shortlist** (6Sense, 2026)

**80% of users now rely on AI-generated summaries to distill complex information** (Bain & Company, 2026)

**[95% of B2B marketers now use AI](/stats/b2b)** (Commonplaces, 2026)

**61% of B2B buyers prefer an overall rep-free buying experience** (Gartner, 2026)

**80% of all B2B social media leads come from LinkedIn** (Brenton Way, 2026)

**83% of B2B marketing decision-makers expect marketing investments to grow in 2026** (Forrester, 2026)

**Global revenue tied to content marketing is projected to surpass $100 billion by 2026** (Heroic Rankings, 2026)

**Influencer marketing delivers $5.78 ROI for every dollar spent** (Archive, 2026)

**86% of B2B purchases stall during the buying process** (Forrester, 2026)

**74% of marketers who improved performance did so by refining their strategy** (Commonplaces, 2026)

---

## 1. AI and Answer Engine Optimization (AEO)

This is the BIGGEST shift in B2B SEO right now.

Buyers aren't searching Google the way they used to. They're asking ChatGPT, Perplexity, and Google's AI Overviews to summarize the market for them. If your brand doesn't show up in those AI answers, you're invisible.

Here's the kicker: 80% of users now rely on AI-generated summaries to distill complex information (Bain & Company, 2026)

That's not a trend. That's a permanent behavior change.

**95% of B2B marketers now use AI** (Commonplaces, 2026)

**98% of marketers are planning higher spend in AI SEO in 2026** (Typeface, 2026)

**80% of marketers use AI for content creation, and 75% use it for media production** (HubSpot, 2026)

**27% of AI-referred sessions converted into SQLs** (HubSpot, 2026)

Traffic from AI answers is pre-qualified. These visitors already know what they want. That's why they convert at nearly 3x the rate of cold organic traffic.

**28% of B2B marketers say they experiment with AI agents** (Content Marketing Institute, 2026)

**45% of sales professionals use AI at least once a week, most often within their CRM** (State of AI in CRM, 2026)

**Ungoverned AI in commercial apps will cost B2B companies more than $10 billion** (Forrester, 2026)

Here's why that last one matters: any company can now produce hundreds of articles a week with AI. Most of them are generic. Buyers can tell. And Google can tell too.

The brands winning in 2026 are the ones using AI as a production tool while leading with proprietary data and real human expertise.

**76% of B2B decision-makers have created new guidelines for AI content quality and brand consistency** (Forrester, 2026)

---

## 2. Buyer behavior and the "Day One" shortlist

Here's the uncomfortable truth about B2B SEO in 2026.

By the time a buyer contacts you, they've already made up their mind.

**83% of B2B buyers have already defined their purchase requirements before they engage with a sales representative** (Corporate Visions, 2026)

**92% of buyers start their research with at least one specific vendor already in mind** (Forrester, 2026)

Think about that. You need to be in the buyer's head before the buying process officially starts. That's what B2B SEO is really about now.

**95% of the time, the winning vendor was already on the buyer's day-one shortlist** (6Sense, 2026)

**Nearly 75% of business buyers complete their entire purchasing journey in 12 weeks or less** (Google Survey, 2026)

**Buyers average 16 unique interactions with a vendor before making a final purchase** (6Sense, 2026)

16 touchpoints. That's why you need to show up on Google, on LinkedIn, on podcasts, in email, and in peer communities simultaneously.

**61% of B2B buyers prefer an overall rep-free buying experience** (Gartner, 2026)

**Millennials and Gen Z now account for 71% of all B2B buying roles** (Forrester, 2026)

These buyers grew up googling everything. They don't want a cold call. They want to do their own research, form their own opinion, and then choose a vendor.

Your content has to do the selling for you.

**71% of buyers described their experience with supplier representatives as "frustrating"** (Corporate Visions, 2026)

---

## 3. B2B content strategy and ROI

The data is clear: content strategy is the highest-leverage activity in B2B marketing.

**74% of marketers who improved performance did so by refining their strategy** (Commonplaces, 2026)

Not by buying new tools. Not by hiring more people. By fixing their strategy.

**Companies with a documented content strategy see 33% higher ROI than those without one** (SQ Magazine, 2026)

**61% of marketers report their strategy effectiveness improved over the last year** (Content Marketing Institute, 2026)

**83% of marketers agree that content quality is significantly more important than quantity** (HubSpot, 2026)

Here's where most B2B companies go wrong.

**97% of B2B marketers have a content strategy** (Content Marketing Institute, 2026)

But:

**96% of B2B marketers produce thought leadership, but only 4% say their program is "leading"** (Content Marketing Institute, 2026)

That gap is HUGE. Everyone is publishing. Almost nobody is actually leading.

**54.5% misalignment between how sellers and buyers perceive the core problem** (Corporate Visions, 2026)

In other words: more than half of B2B content is answering the wrong question. Buyers and sellers aren't even talking about the same problem.

**3.2 times is the average number of times buyers change their problem statement during complex purchases** (Corporate Visions, 2026)

This is why static content fails. Buyers evolve. Your content needs to evolve with them.

### ROI numbers

**Content marketing generates $3 for every $1 invested** (Genesys Growth, 2026)

**Global revenue tied to content marketing is projected to surpass $100 billion by 2026** (Heroic Rankings, 2026)

**58% report that content marketing has directly helped boost sales and revenue** (Content Marketing Institute, 2026)

**Just over half of marketing teams actively track content marketing ROI internally** (Heroic Rankings, 2026)

That last stat is wild. Half of teams can't prove their content is working. No wonder budgets get cut at the first sign of trouble.

---

## 4. Lead generation and conversions

B2B SEO isn't just about traffic. It's about leads.

Here's what the data says about which channels actually convert.

**LinkedIn visitor-to-lead conversion is 2.74%** (Brenton Way, 2026)

That's nearly 3x higher than generic social platforms.

**Lead Gen Forms on LinkedIn achieve conversion rates of 10-15%** (Brenton Way, 2026)

**80% of all B2B social media leads come from LinkedIn** (Brenton Way, 2026)

**Clients who first engage with high-quality content require 20% fewer form interactions before signing a deal** (SEO Works, 2026)

Educate buyers early and the sales process gets shorter. Simple.

**The average cost per lead through content marketing dropped by 19% year-over-year** (SQ Magazine, 2026)

While paid ads keep getting more expensive, organic content is getting cheaper per lead.

**Email marketing drives a 2.4% conversion rate for B2B brands** (FirstPageSage, 2026)

**42% of salespeople say social media delivers the highest cold outreach response rate** (HubSpot, 2026)

Cold email is dying. Social selling is winning. Your content needs to fuel both.

---

## 5. Content formats: what actually works

Not all content is equal. Some formats are pulling way ahead of others.

### LinkedIn content

**87% of B2B marketers use LinkedIn** (Statista, 2026)

**93-96% of B2B marketers utilize LinkedIn for content distribution** (Brenton Way, 2026)

**Personal profiles generate 561% more reach than Company Pages on LinkedIn** (Brenton Way, 2026)

This is a massive insight. Your company page is almost irrelevant. Your executives and employees need to be posting.

**Carousel posts generate 278% more engagement than video and 596% more than text-only posts on LinkedIn** (Brenton Way, 2026)

596% more than plain text posts. That's not a marginal difference. That's a completely different ballgame.

### Video

**91% of businesses use video as a marketing tool in 2026** (Wyzowl, 2026)

Video is now table stakes. If you're not producing it, you're behind.

### Podcasting

**619.2 million global podcast listeners projected in 2026** (Whitehat SEO, 2026)

**Average guest-to-client conversion rate on B2B podcasts is 10%** (Whitehat SEO, 2026)

Here's the thing: inviting a prospect onto your podcast isn't just content creation. It's an ABM strategy. You get 45 minutes of uninterrupted time with a decision-maker. No cold call has ever done that.

**Strategic podcasts deliver 3-5x ROI within 12 months** (Whitehat SEO, 2026)

### Blog content

**The average word count for a blog post shrank to 1,333 words in 2025** (Orbit Media, 2026)

Shorter, more focused posts are winning. Long-form still works for SEO. But buyers want answers fast.

---

## 6. B2B SEO distribution channels

Creating great content is only half the battle. Distribution is where most companies fail.

**75% of enterprise B2B companies will increase budgets for influencer relations** (Forrester, 2026)

**58% of B2B teams now use always-on influencer engagement** (Archive, 2026)

**Influencer marketing delivers $5.78 ROI for every dollar spent** (Archive, 2026)

**Campaigns matching influencer niche to product category achieve 13.59% higher engagement and 81.39% more views** (Archive, 2026)

The keyword there is "matching." Spray-and-pray influencer deals don't work. Tight niche alignment is everything.

**The global social commerce market is projected to grow to $2.21 billion in 2026** (Fortune Business Insights, 2026)

**51% of social buyers in the US will use TikTok Shop in 2026** (eMarketer, 2026)

**19% of marketers use both ABM and ABX** (Content Marketing Institute, 2026)

ABX (Account-Based Experience) goes beyond ABM. It's about orchestrating the full buyer journey, not just targeting the right accounts.

---

## 7. Budget and investment trends

Where is the money going in 2026?

**83% of B2B marketing decision-makers expect marketing investments to grow in 2026** (Forrester, 2026)

**U.S. B2B advertising and marketing spend is estimated to reach $69 billion by 2026** (Statista, 2026)

**45% of B2B marketers plan to increase investment in AI-powered marketing tools in 2026** (Content Marketing Institute, 2026)

**33% plan to increase investment in events and experiential marketing in 2026** (Content Marketing Institute, 2026)

Here's the kicker: as digital gets more automated, in-person becomes MORE valuable. Not less.

**46% of companies plan to use a hybrid agency model (in-house + agency) in 2026** (Bruce Clay, 2026)

And the most alarming stat in this entire list:

**Only 9% plan to increase investment in human resources (salaries, training, development) in 2026** (Content Marketing Institute, 2026)

Companies are pouring money into AI tools and cutting investment in the people needed to use those tools well. That's a recipe for expensive, mediocre content at scale.

---

## 8. Challenges and pain points

Even the best B2B marketers are struggling with specific problems in 2026.

**77.6% of content marketers say "getting content to rank" is their top frustration** (Siege Media, 2026)

**86% of B2B purchases stall during the buying process** (Forrester, 2026)

86%. That means the overwhelming majority of deals die before they close. Content designed around risk reduction and consensus-building can fix this.

**40% of marketers struggle with creating content that prompts a desired action or conversion** (Content Marketing Institute, 2026)

Getting traffic is easy. Getting that traffic to do something? That's the real challenge.

**Only 38% of CEOs report having the right data and insights to achieve their commercial goals** (SBI, 2026)

**71% of buyers described their experience with supplier representatives as "frustrating"** (Corporate Visions, 2026)

**54.5% misalignment between how sellers and buyers perceive the core problem** (Corporate Visions, 2026)

That last one shows up again because it's so important. The biggest ROI gain in B2B content marketing isn't a new tool. It's actually understanding what your buyers are trying to solve.

---

## Wrapping up

Here's what the 2026 B2B SEO data tells us.

The brands winning today got into the buyer's head before the buying process started. They show up in AI answers. They distribute through trusted voices. And they create content that actually matches what buyers are trying to solve.

The brands losing? They're still producing generic content and waiting for inbound leads that never come.

The [stats](/stats) don't lie.

Now it's your turn to act on them.`;

const chartTones = {
  sky: {
    start: "#b8ceff",
    end: "#598bfa",
    soft: "rgba(89, 139, 250, 0.18)",
    track: "rgba(89, 139, 250, 0.12)",
  },
  cobalt: {
    start: "#9dc0ff",
    end: "#4274e6",
    soft: "rgba(66, 116, 230, 0.16)",
    track: "rgba(66, 116, 230, 0.1)",
  },
  slate: {
    start: "#d2e1ff",
    end: "#7aa4ff",
    soft: "rgba(122, 164, 255, 0.16)",
    track: "rgba(122, 164, 255, 0.1)",
  },
} satisfies Record<string, ChartTone>;

const openingMetricCards: MetricCard[] = [
  { label: "Shortlist wins", value: "95%", note: "Winning vendors were already on the day-one shortlist.", context: "6Sense" },
  { label: "AI summary use", value: "80%", note: "Users rely on AI-generated summaries to distill complex information.", context: "Bain" },
  { label: "AI adoption", value: "95%", note: "B2B marketers now using AI in their workflow.", context: "Commonplaces" },
  { label: "LinkedIn leads", value: "80%", note: "Share of B2B social media leads coming from LinkedIn.", context: "Brenton Way" },
];

const aiAeoData: ChartDatum[] = [
  { label: "B2B marketers using AI", value: 95, valueLabel: "95%" },
  { label: "Marketers raising AI SEO spend", value: 98, valueLabel: "98%" },
  { label: "Users relying on AI summaries", value: 80, valueLabel: "80%" },
  { label: "AI-referred sessions to SQL", value: 27, valueLabel: "27%" },
];

const buyerBehaviorData: ChartDatum[] = [
  { label: "Winning vendor on shortlist", value: 95, valueLabel: "95%" },
  { label: "Buyers starting with a vendor in mind", value: 92, valueLabel: "92%" },
  { label: "Requirements defined before sales", value: 83, valueLabel: "83%" },
  { label: "Rep-free buying preference", value: 61, valueLabel: "61%" },
];

const conversionData: ChartDatum[] = [
  { label: "B2B social leads from LinkedIn", value: 80, valueLabel: "80%" },
  { label: "Cold outreach best via social", value: 42, valueLabel: "42%" },
  { label: "LinkedIn Lead Gen Forms", value: 15, valueLabel: "10-15%" },
  { label: "Visitor-to-lead on LinkedIn", value: 2.74, valueLabel: "2.74%" },
];

const formatData: ChartDatum[] = [
  { label: "Carousel vs text-only", value: 596, valueLabel: "+596%" },
  { label: "Profile reach vs company page", value: 561, valueLabel: "+561%" },
  { label: "Carousel vs video", value: 278, valueLabel: "+278%" },
  { label: "Businesses using video", value: 91, valueLabel: "91%" },
];

const challengeData: ChartDatum[] = [
  { label: "Top ranking frustration", value: 77.6, valueLabel: "77.6%" },
  { label: "Purchases that stall", value: 86, valueLabel: "86%" },
  { label: "Conversion-action struggle", value: 40, valueLabel: "40%" },
  { label: "CEOs with right insights", value: 38, valueLabel: "38%" },
];

const roiTrackingData: DonutSlice[] = [
  { label: "Track ROI internally", value: 51, valueLabel: "51%", color: "#598bfa" },
  { label: "Do not actively track", value: 49, valueLabel: "49%", color: "#a9c5ff" },
];

const distributionMomentumData: ChartDatum[] = [
  { label: "Influencer budget growth", value: 75, valueLabel: "75%" },
  { label: "Always-on influencer use", value: 58, valueLabel: "58%" },
  { label: "US social buyers on TikTok Shop", value: 51, valueLabel: "51%" },
  { label: "ABM + ABX usage", value: 19, valueLabel: "19%" },
];

const budgetTrendData: ChartDatum[] = [
  { label: "Marketing investment growth", value: 83, valueLabel: "83%" },
  { label: "AI tool investment growth", value: 45, valueLabel: "45%" },
  { label: "Events investment growth", value: 33, valueLabel: "33%" },
  { label: "HR investment growth", value: 9, valueLabel: "9%" },
];

const insightStatPattern =
  /(\$?\d[\d,.]*(?:\.\d+)?(?:\s?(?:billion|million|trillion|buyers|marketers|leaders|spend|leads|ROI|M|B|x))?|\d[\d,.]*(?:\.\d+)?%|\d[\d,.]*(?:\.\d+)?x)/gi;

function renderInlineMarkdown(text: string): ReactNode[] {
  const renderLinks = (value: string, keyPrefix: string): ReactNode[] => {
    const linkFragments: ReactNode[] = [];
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkLastIndex = 0;
    let linkMatch: RegExpExecArray | null;

    while ((linkMatch = linkPattern.exec(value))) {
      if (linkMatch.index > linkLastIndex) {
        linkFragments.push(value.slice(linkLastIndex, linkMatch.index));
      }

      linkFragments.push(
        <a key={`${keyPrefix}-link-${linkMatch.index}`} href={linkMatch[2]}>
          {linkMatch[1]}
        </a>
      );

      linkLastIndex = linkMatch.index + linkMatch[0].length;
    }

    if (linkLastIndex < value.length) {
      linkFragments.push(value.slice(linkLastIndex));
    }

    return linkFragments.length ? linkFragments : [value];
  };

  const fragments: ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      fragments.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      fragments.push(
        <strong key={`strong-${match.index}`}>
          {renderLinks(match[2], `strong-${match.index}`)}
        </strong>
      );
    } else if (match[4] && match[5]) {
      fragments.push(
        <a key={`link-${match.index}`} href={match[5]}>
          {match[4]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    fragments.push(text.slice(lastIndex));
  }

  return fragments.length ? fragments : [text];
}

function renderInsightText(text: string): ReactNode[] {
  const fragments: ReactNode[] = [];
  const pattern = new RegExp(insightStatPattern.source, "gi");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

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

function parseMarkdown(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({
      type: "list",
      items: [...listItems],
    });
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed === "---") {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      const text = trimmed.slice(3);
      blocks.push({
        type: "heading",
        level: 2,
        text,
        id: slugifyHeading(text),
      });
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      const text = trimmed.slice(4);
      blocks.push({
        type: "heading",
        level: 3,
        text,
        id: slugifyHeading(text),
      });
      return;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();
    paragraphLines.push(trimmed);
  });

  flushParagraph();
  flushList();

  return blocks;
}

const articleBlocks = parseMarkdown(ARTICLE_MARKDOWN);

function cleanHeadingText(text: string) {
  return text.replace(/^\d+\.\s*/, "").trim();
}

function StatDeck({ items }: { items: MetricCard[] }) {
  return (
    <section className={styles.youtubeStatDeck} aria-label="Key B2B SEO statistics">
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
  summary: string;
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
          <p className={styles.youtubeVisualSummary}>{summary}</p>
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

function DonutShareChart({
  title,
  eyebrow,
  summary,
  centerLabel,
  centerValue,
  items,
}: {
  title: string;
  eyebrow: string;
  summary: string;
  centerLabel: string;
  centerValue: string;
  items: DonutSlice[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let runningTotal = 0;
  const donutStops = items
    .map((item) => {
      const start = (runningTotal / total) * 100;
      runningTotal += item.value;
      const end = (runningTotal / total) * 100;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <section className={styles.youtubeVisualPanel} aria-label={title}>
      <div className={styles.youtubeVisualHeader}>
        <span className={styles.youtubeVisualEyebrow}>{eyebrow}</span>
        <div className={styles.youtubeVisualHeaderTop}>
          <h3>{title}</h3>
          <p className={styles.youtubeVisualSummary}>{summary}</p>
        </div>
      </div>
      <div className={styles.statsDonutShell}>
        <div className={styles.statsDonutFigure}>
          <div
            className={styles.statsDonutRing}
            style={{ "--donut-stops": donutStops } as CSSProperties}
            aria-hidden="true"
          >
            <div className={styles.statsDonutCenter}>
              <strong>{centerValue}</strong>
              <span>{centerLabel}</span>
            </div>
          </div>
        </div>
        <div className={styles.statsDonutLegend}>
          {items.map((item) => (
            <article key={item.label} className={styles.statsDonutCard}>
              <span
                className={styles.statsDonutSwatch}
                style={{ "--swatch": item.color } as CSSProperties}
                aria-hidden="true"
              />
              <span className={styles.statsDonutLabel}>{item.label}</span>
              <span className={styles.statsDonutValue}>{item.valueLabel}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function VerticalBarChart({
  title,
  eyebrow,
  summary,
  items,
  tone,
}: {
  title: string;
  eyebrow: string;
  summary: string;
  items: ChartDatum[];
  tone: ChartTone;
}) {
  const maxValue = Math.max(...items.map((item) => item.value));
  const chartStyle = {
    "--chart-start": tone.start,
    "--chart-end": tone.end,
    "--chart-soft": tone.soft,
    "--bar-count": items.length,
  } as CSSProperties;

  return (
    <section className={styles.youtubeVisualPanel} aria-label={title}>
      <div className={styles.youtubeVisualHeader}>
        <span className={styles.youtubeVisualEyebrow}>{eyebrow}</span>
        <div className={styles.youtubeVisualHeaderTop}>
          <h3>{title}</h3>
          <p className={styles.youtubeVisualSummary}>{summary}</p>
        </div>
      </div>
      <div className={styles.statsVerticalChart} style={chartStyle}>
        <div className={styles.statsVerticalGrid}>
          {items.map((item) => (
            <div key={item.label} className={styles.statsVerticalColumn}>
              <span className={styles.statsVerticalValue}>{item.valueLabel}</span>
              <div className={styles.statsVerticalTrack}>
                <span
                  className={styles.statsVerticalFill}
                  style={{ "--bar-size": `${(item.value / maxValue) * 100}%` } as CSSProperties}
                />
              </div>
              <span className={styles.statsVerticalLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderVisual(sectionId?: string) {
  switch (sectionId) {
    case "top-10-b2b-seo-stats-for-2026":
      return <StatDeck items={openingMetricCards} />;
    case "1-ai-and-answer-engine-optimization-aeo":
      return (
        <HorizontalBarChart
          eyebrow="AI and AEO"
          title="AI is already driving B2B search behavior"
          summary="Usage, spend, and SQL conversion all point to AI becoming a core discovery layer."
          items={aiAeoData}
          tone={chartTones.sky}
        />
      );
    case "2-buyer-behavior-and-the-day-one-shortlist":
      return (
        <HorizontalBarChart
          eyebrow="Buyer behavior"
          title="The shortlist is formed before sales gets involved"
          summary="Most buyers define vendors and requirements long before they ever request a demo."
          items={buyerBehaviorData}
          tone={chartTones.cobalt}
        />
      );
    case "3-b2b-content-strategy-and-roi":
      return (
        <DonutShareChart
          eyebrow="ROI discipline"
          title="Only about half of teams are tracking content ROI"
          summary="The article shows a near-even split between teams that measure content returns and teams still flying blind."
          centerLabel="tracking ROI"
          centerValue="51%"
          items={roiTrackingData}
        />
      );
    case "4-lead-generation-and-conversions":
      return (
        <HorizontalBarChart
          eyebrow="Lead generation"
          title="LinkedIn still dominates B2B social conversion"
          summary="The article's cited data shows LinkedIn is still the strongest social lead source for B2B."
          items={conversionData}
          tone={chartTones.sky}
        />
      );
    case "5-content-formats-what-actually-works":
      return (
        <HorizontalBarChart
          eyebrow="Content formats"
          title="A few formats are pulling way ahead"
          summary="LinkedIn carousels, personal profiles, and video are doing most of the heavy lifting."
          items={formatData}
          tone={chartTones.slate}
        />
      );
    case "6-b2b-seo-distribution-channels":
      return (
        <VerticalBarChart
          eyebrow="Distribution"
          title="Influencer-led distribution is gaining momentum"
          summary="Influencer relations, always-on programs, and social commerce are all pulling more budget and attention."
          items={distributionMomentumData}
          tone={chartTones.slate}
        />
      );
    case "7-budget-and-investment-trends":
      return (
        <VerticalBarChart
          eyebrow="Budget trends"
          title="B2B budgets are rising, but talent investment lags badly"
          summary="The sharpest growth is in marketing and AI tools, while human-resource investment remains dramatically lower."
          items={budgetTrendData}
          tone={chartTones.sky}
        />
      );
    case "8-challenges-and-pain-points":
      return (
        <HorizontalBarChart
          eyebrow="Challenges"
          title="Where B2B marketers are struggling most"
          summary="Ranking content, stalled deals, and weak conversion performance remain the biggest execution problems."
          items={challengeData}
          tone={chartTones.cobalt}
        />
      );
    default:
      return null;
  }
}

function renderInsightGrid(items: InsightItem[]) {
  return (
    <section className={styles.youtubeInsightGrid}>
      {items.map((item) => (
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

export const b2bSeoStatisticsHeadingItems = articleBlocks.flatMap((block) =>
  block.type === "heading" && block.level === 2
    ? [{ id: block.id, title: cleanHeadingText(block.text) }]
    : []
);

export const b2bSeoStatisticsWordCount = ARTICLE_MARKDOWN.replace(/[#*`>-]/g, " ")
  .split(/\s+/)
  .filter(Boolean).length;

export default function B2BSeoStatisticsArticle() {
  let currentSectionId: string | undefined;
  const content: ReactNode[] = [];

  for (let index = 0; index < articleBlocks.length; index += 1) {
    const block = articleBlocks[index];

    if (block.type === "heading" && block.level === 2) {
      currentSectionId = block.id;
    }

    const nextBlock = articleBlocks[index + 1];
    const activeSectionId = block.type === "heading" ? undefined : currentSectionId;
    const shouldRenderVisual =
      block.type !== "heading" &&
      (!nextBlock || (nextBlock.type === "heading" && nextBlock.level === 2));
    const visual = shouldRenderVisual ? renderVisual(activeSectionId) : null;

    if (
      activeSectionId === "top-10-b2b-seo-stats-for-2026" &&
      block.type === "paragraph" &&
      block.text.startsWith("**")
    ) {
      const items: InsightItem[] = [];
      let insightIndex = index;

      while (insightIndex < articleBlocks.length) {
        const insightBlock = articleBlocks[insightIndex];
        if (insightBlock.type !== "paragraph" || !insightBlock.text.startsWith("**")) {
          break;
        }

        items.push({
          number: `${items.length + 1}`.padStart(2, "0"),
          text: insightBlock.text.replace(/\*\*/g, ""),
        });
        insightIndex += 1;
      }

      content.push(
        <div key={`insight-grid-${index}`} className={styles.youtubeArticleBlock}>
          {renderInsightGrid(items)}
          {renderVisual("top-10-b2b-seo-stats-for-2026")}
        </div>
      );
      index = insightIndex - 1;
      continue;
    }

    if (block.type === "heading") {
      if (block.level === 3) {
        content.push(
          <div key={`${block.id}-${index}`} className={styles.youtubeArticleBlock}>
                <h3 id={block.id} className={baseStyles.richTextSubheading}>
                  {block.text}
                </h3>
          </div>
        );
        continue;
      }

      content.push(
        <div key={`${block.id}-${index}`} className={styles.youtubeArticleBlock}>
          <h2 id={block.id}>{cleanHeadingText(block.text)}</h2>
        </div>
      );
      continue;
    }

    if (block.type === "list") {
      content.push(
        <div key={`list-${index}`} className={styles.youtubeArticleBlock}>
          <ul className={baseStyles.articleList}>
            {block.items.map((item) => (
              <li key={item}>{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
          {visual}
        </div>
      );
      continue;
    }

    content.push(
      <div key={`paragraph-${index}`} className={styles.youtubeArticleBlock}>
        <p>{renderInlineMarkdown(block.text)}</p>
        {visual}
      </div>
    );
  }

  return <>{content}</>;
}
