import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import baseStyles from "@/app/(frontend)/blog/blog.module.css";
import styles from "./youtube-stats-visuals.module.css";
import type { YouTubeUsersArticleData, YouTubeUsersBlock } from "@/lib/youtube-users-article";

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

type DonutDatum = {
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

const keyMetricCards: MetricCard[] = [
  {
    label: "Annual revenue",
    value: "$60B",
    note: "Total YouTube revenue, including subscriptions.",
    context: "2025 total",
  },
  {
    label: "Monthly users",
    value: "2.83B",
    note: "Estimated monthly active users worldwide.",
    context: "March 2026",
  },
  {
    label: "Shorts views",
    value: "200B",
    note: "Average Shorts views generated each day.",
    context: "Daily avg",
  },
  {
    label: "US TV share",
    value: "12.5%",
    note: "Share of all television viewing in the United States.",
    context: "May 2025",
  },
];

const userGrowthData: ChartDatum[] = [
  { label: "2019", value: 2.0, valueLabel: "2.0B" },
  { label: "2020", value: 2.3, valueLabel: "2.3B" },
  { label: "2021", value: 2.5, valueLabel: "2.5B" },
  { label: "2022", value: 2.68, valueLabel: "2.68B" },
  { label: "2024", value: 2.5, valueLabel: "2.5B" },
  { label: "2025", value: 2.7, valueLabel: "2.7B" },
  { label: "2026", value: 2.83, valueLabel: "2.83B" },
];

const topMarketData: ChartDatum[] = [
  { label: "India", value: 500, valueLabel: "500M" },
  { label: "United States", value: 254, valueLabel: "254M" },
  { label: "Indonesia", value: 151, valueLabel: "151M" },
  { label: "Brazil", value: 150, valueLabel: "150M" },
  { label: "Mexico", value: 85, valueLabel: "85M" },
  { label: "Japan", value: 78.5, valueLabel: "78.5M" },
];

const genderSplitData: DonutDatum[] = [
  { label: "Male", value: 54.3, valueLabel: "54.3%" },
  { label: "Female", value: 45.7, valueLabel: "45.7%" },
];

const watchTimeTrendData: ChartDatum[] = [
  { label: "2019", value: 39.7, valueLabel: "39.7m" },
  { label: "2021", value: 45.0, valueLabel: "45.0m" },
  { label: "2022", value: 46.2, valueLabel: "46.2m" },
  { label: "2023", value: 47.5, valueLabel: "47.5m" },
  { label: "2026", value: 49.0, valueLabel: "49m" },
];

const shortsGrowthData: ChartDatum[] = [
  { label: "2021", value: 30, valueLabel: "30B" },
  { label: "2022", value: 50, valueLabel: "50B" },
  { label: "2023-24", value: 70, valueLabel: "70B" },
  { label: "2025-26", value: 200, valueLabel: "200B" },
];

const platformRevenueData: ChartDatum[] = [
  { label: "2019", value: 15.1, valueLabel: "$15.1B" },
  { label: "2020", value: 19.7, valueLabel: "$19.7B" },
  { label: "2022", value: 29.24, valueLabel: "$29.24B" },
  { label: "2023", value: 31.5, valueLabel: "$31.5B" },
  { label: "2024", value: 36.1, valueLabel: "$36.1B" },
  { label: "2025", value: 40.37, valueLabel: "$40.37B" },
];

const countryCpmData: ChartDatum[] = [
  { label: "United States", value: 14.67, valueLabel: "$14.67" },
  { label: "Australia", value: 13.3, valueLabel: "$13.30" },
  { label: "Switzerland", value: 12.98, valueLabel: "$12.98" },
  { label: "Norway", value: 11.21, valueLabel: "$11.21" },
  { label: "United Kingdom", value: 8.91, valueLabel: "$8.91" },
  { label: "Brazil", value: 1.64, valueLabel: "$1.64" },
  { label: "Philippines", value: 1.12, valueLabel: "$1.12" },
  { label: "India", value: 0.74, valueLabel: "$0.74" },
];

const nicheEconomicsData: ChartDatum[] = [
  { label: "Finance", value: 2000, valueLabel: "$2,000" },
  { label: "Tech", value: 1200, valueLabel: "$1,200" },
  { label: "Education", value: 800, valueLabel: "$800" },
  { label: "Vlogs", value: 300, valueLabel: "$300" },
  { label: "Gaming", value: 300, valueLabel: "$300" },
];

const chartTones = {
  ember: {
    start: "#ff7f7f",
    end: "#d91919",
    soft: "rgba(217, 25, 25, 0.16)",
    track: "rgba(217, 25, 25, 0.1)",
  },
  sunset: {
    start: "#ff9a9a",
    end: "#ef3b3b",
    soft: "rgba(239, 59, 59, 0.14)",
    track: "rgba(239, 59, 59, 0.1)",
  },
  apricot: {
    start: "#ffb3b3",
    end: "#ff5454",
    soft: "rgba(255, 84, 84, 0.14)",
    track: "rgba(255, 84, 84, 0.1)",
  },
} satisfies Record<string, ChartTone>;

function renderInlineMarkdown(text: string): ReactNode[] {
  const fragments: ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      fragments.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      fragments.push(<strong key={`strong-${match.index}`}>{match[2]}</strong>);
    } else if (match[4] && match[5]) {
      fragments.push(
        <Link key={`link-${match.index}`} href={match[5]}>
          {match[4]}
        </Link>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    fragments.push(text.slice(lastIndex));
  }

  return fragments.length ? fragments : [text];
}

const insightStatPattern = /(\$?\d[\d,.]*(?:\.\d+)?(?:\s?(?:billion|million|trillion|hours|views|minutes|creators|channels|users|subscribers|sessions|years?|B|M|K))?|\d[\d,.]*(?:\.\d+)?%|\d[\d,.]*(?:\.\d+)?x)/gi;

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
    <section className={styles.youtubeStatDeck} aria-label="Key YouTube statistics">
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
}function formatVerticalScaleValue(value: number, sampleLabel: string) {
  const hasCurrency = sampleLabel.includes("$");
  const hasPercent = sampleLabel.includes("%");
  const suffixMatch = sampleLabel.match(/([A-Za-z]+)$/);
  const suffix = hasPercent ? "%" : suffixMatch?.[1] ?? "";
  const decimals = value >= 100 || Number.isInteger(value) ? 0 : value >= 10 ? 1 : 2;
  const rounded = Number(value.toFixed(decimals));
  const numberText = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "");

  return `${hasCurrency ? "$" : ""}${numberText}${suffix}`;
}

function buildVerticalScale(maxValue: number, sampleLabel: string) {
  return [1, 0.75, 0.5, 0.25, 0].map((ratio) => formatVerticalScaleValue(maxValue * ratio, sampleLabel));
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
  summary?: string;
  items: ChartDatum[];
  tone: ChartTone;
}) {
  const maxValue = Math.max(...items.map((item) => item.value));
  const scaleLabels = buildVerticalScale(maxValue, items.find((item) => item.value === maxValue)?.valueLabel ?? items[items.length - 1]?.valueLabel ?? "");
  const chartStyle = {
    "--chart-start": tone.start,
    "--chart-end": tone.end,
    "--chart-soft": tone.soft,
    "--chart-track": tone.track,
    gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
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
      <div className={styles.youtubeBarChartShell}>
        <div className={styles.youtubeBarAxis} aria-hidden="true">
          {scaleLabels.map((label) => (
            <span key={`${title}-${label}`}>{label}</span>
          ))}
        </div>
        <div className={styles.youtubeChartViewportCompact}>
          <div className={styles.youtubeChartViewport}>
            <div className={styles.youtubeBarChart} style={chartStyle}>
              {items.map((item) => (
                <div key={item.label} className={styles.youtubeBarColumn}>
                  <span className={styles.youtubeBarValue}>{item.valueLabel}</span>
                  <div
                    className={styles.youtubeBarTrack}
                    style={{ "--bar-size": `${(item.value / maxValue) * 100}%` } as CSSProperties}
                  >
                    <span className={styles.youtubeBarFill} />
                  </div>
                  <span className={styles.youtubeBarLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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

function DonutChart({
  title,
  eyebrow,
  summary,
  items,
}: {
  title: string;
  eyebrow: string;
  summary?: string;
  items: DonutDatum[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const colors = ["#f15a30", "#ffbf92"];
  const leadItem = [...items].sort((a, b) => b.value - a.value)[0];

  return (
    <section className={styles.youtubeVisualPanel} aria-label={title}>
      <div className={styles.youtubeVisualHeader}>
        <span className={styles.youtubeVisualEyebrow}>{eyebrow}</span>
        <div className={styles.youtubeVisualHeaderTop}>
          <h3>{title}</h3>
          {summary ? <p className={styles.youtubeVisualSummary}>{summary}</p> : null}
        </div>
      </div>
      <div className={styles.youtubeAudienceSplit}>
        <div className={styles.youtubeAudienceHighlight}>
          <span className={styles.youtubeAudienceHighlightLabel}>Largest segment</span>
          <strong>{leadItem?.valueLabel}</strong>
          <span>{leadItem?.label}</span>
        </div>
        <div className={styles.youtubeAudiencePanel}>
          <div className={styles.youtubeAudienceTrack} aria-hidden="true">
            {items.map((item, index) => (
              <span
                key={item.label}
                className={styles.youtubeAudienceFill}
                style={{
                  width: `${total ? (item.value / total) * 100 : 0}%`,
                  backgroundColor: colors[index] ?? colors[colors.length - 1],
                }}
              />
            ))}
          </div>
          <div className={styles.youtubeAudienceLegend}>
            {items.map((item, index) => (
              <article key={item.label} className={styles.youtubeAudienceCard}>
                <div className={styles.youtubeAudienceCardTop}>
                  <span
                    className={styles.youtubeLegendSwatch}
                    style={{ backgroundColor: colors[index] ?? colors[colors.length - 1] }}
                  />
                  <span>{item.label}</span>
                </div>
                <strong>{item.valueLabel}</strong>
                <p>{index === 0 ? "Slight majority worldwide" : "Close to an even split"}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function renderSectionVisual(sectionId?: string) {
  switch (sectionId) {
    case "the-15-numbers-that-tell-the-whole-story":
      return <StatDeck items={keyMetricCards} />;
    case "monthly-active-users":
      return (
        <VerticalBarChart
          eyebrow="Growth curve"
          title="YouTube monthly active users"
          summary="User growth rose from 2.0B in 2019 to 2.83B in March 2026."
          items={userGrowthData}
          tone={chartTones.ember}
        />
      );
    case "where-youtube-users-actually-live":
      return (
        <HorizontalBarChart
          eyebrow="Audience geography"
          title="Top YouTube markets by estimated users"
          summary="India leads by a huge margin, with the United States firmly in second place."
          items={topMarketData}
          tone={chartTones.sunset}
        />
      );
    case "gender-split":
      return <DonutChart eyebrow="Audience mix" title="Global YouTube gender split" summary="The audience is nearly balanced, with a slight male majority worldwide." items={genderSplitData} />;
    case "daily-watch-time":
      return (
        <VerticalBarChart
          eyebrow="Consumption trend"
          title="Average daily time spent on YouTube"
          summary="Daily viewing climbed from 39.7 minutes in 2019 to 49 minutes in 2026."
          items={watchTimeTrendData}
          tone={chartTones.apricot}
        />
      );
    case "the-numbers":
      return (
        <VerticalBarChart
          eyebrow="Short-form growth"
          title="Average daily YouTube Shorts views"
          summary="Shorts scaled from 30B to 200B daily views in just a few years."
          items={shortsGrowthData}
          tone={chartTones.sunset}
        />
      );
    case "platform-revenue":
      return (
        <VerticalBarChart
          eyebrow="Ad machine"
          title="YouTube advertising revenue growth"
          summary="Advertising revenue nearly tripled between 2019 and 2025."
          items={platformRevenueData}
          tone={chartTones.ember}
        />
      );
    case "cpm-by-country":
      return (
        <HorizontalBarChart
          eyebrow="Monetization gap"
          title="Average YouTube CPM by country"
          summary="Premium western markets pay dramatically more per thousand views."
          items={countryCpmData}
          tone={chartTones.apricot}
        />
      );
    case "cpm-and-rpm-by-niche":
      return (
        <HorizontalBarChart
          eyebrow="Revenue reality"
          title="Top earnings per 100K views by niche"
          summary="Finance and tech outperform entertainment-heavy niches by a wide margin."
          items={nicheEconomicsData}
          tone={chartTones.ember}
        />
      );
    default:
      return null;
  }
}

function renderBlock(block: YouTubeUsersBlock) {
  switch (block.type) {
    case "heading": {
      if (block.level === 3) {
        return (
          <h3 id={block.id} className={baseStyles.richTextSubheading}>
            {block.text}
          </h3>
        );
      }

      return <h2 id={block.id}>{block.text}</h2>;
    }
    case "paragraph":
      return <p>{renderInlineMarkdown(block.text)}</p>;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      const className = block.ordered ? styles.youtubeOrderedList : baseStyles.articleList;

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

type YouTubeUsersArticleProps = {
  data: YouTubeUsersArticleData;
  insertBeforeHeadingId?: string;
  insertNode?: ReactNode;
};

export default function YouTubeUsersArticle({
  data,
  insertBeforeHeadingId,
  insertNode,
}: YouTubeUsersArticleProps) {
  const insertionIndex =
    insertNode && insertBeforeHeadingId
      ? data.blocks.findIndex(
          (block) => block.type === "heading" && block.id === insertBeforeHeadingId
        )
      : -1;

  return (
    <>
      {data.blocks.map((block, index) => {
        const nextBlock = data.blocks[index + 1];
        const sectionId = block.type === "heading" ? undefined : block.sectionId;
        const shouldRenderVisual =
          block.type !== "heading" && (!nextBlock || nextBlock.type === "heading");
        const visual = shouldRenderVisual ? renderSectionVisual(sectionId) : null;
        const shouldInsertNodeBeforeBlock = Boolean(insertNode) && index === insertionIndex;

        return (
          <div key={`${block.type}-${index}`}>
            {shouldInsertNodeBeforeBlock ? insertNode : null}
            <div className={styles.youtubeArticleBlock}>
              {renderBlock(block)}
              {visual}
            </div>
          </div>
        );
      })}
      {insertionIndex === -1 && insertNode ? insertNode : null}
    </>
  );
}



