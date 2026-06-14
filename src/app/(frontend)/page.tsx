import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createHomePageStructuredData, createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Rehan Kadri | SEO & YouTube Growth Strategist",
  description:
    "SEO, YouTube growth, and content systems designed to turn visibility into qualified pipeline for B2B brands.",
  path: "/",
  imageAlt: "The Rehan Kadri growth marketing portfolio",
  keywords: [
    "Rehan Kadri",
    "SEO consultant",
    "YouTube growth strategist",
    "B2B SEO",
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createHomePageStructuredData, createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Rehan Kadri | SEO & YouTube Growth Strategist",
  description:
    "SEO, YouTube growth, and content systems designed to turn visibility into qualified pipeline for B2B brands.",
  path: "/",
  imageAlt: "The Rehan Kadri growth marketing portfolio",
  keywords: [
    "Rehan Kadri",
    "SEO consultant",
    "YouTube growth strategist",
    "B2B SEO",
    "content systems",
    "pipeline marketing",
    "growth marketing strategist",
  ],
});

const homePageStructuredData = createHomePageStructuredData({
  title: "Rehan Kadri | SEO & YouTube Growth Strategist",
  description:
    "SEO, YouTube growth, and content systems designed to turn visibility into qualified pipeline for B2B brands.",
});

const homeFaqEntries = [
  {
    question: "What does Rehan Kadri specialize in?",
    answer: "Rehan Kadri is an SEO specialist and YouTube growth strategist who helps B2B brands build content systems that generate qualified pipeline from organic search. He has 8+ years of experience, has grown a blog to 1M+ monthly organic visitors, and built a YouTube channel to 33K+ subscribers. His core services are B2B SEO, YouTube channel growth, and content repurposing systems."
  },
  {
    question: "How long does it take to see results from SEO?",
    answer: "For B2B SEO, most clients see measurable organic traffic improvements within 3-6 months for competitive keywords, and meaningful pipeline influence within 6-12 months. The timeline depends heavily on domain authority, content quality, and how competitive the target keyword cluster is. Quick wins (ranking for long-tail, low-competition queries) can appear within 4-8 weeks."
  },
  {
    question: "What makes Rehan Kadri different from other SEO consultants?",
    answer: "Most SEO consultants optimize for traffic metrics. Rehan builds systems that connect search rankings to actual pipeline — meaning every content decision is tied to a conversion path, not just a keyword. He also has rare cross-channel expertise: organic SEO, YouTube growth, LinkedIn content, and email — so the strategy works across every surface where B2B buyers research."
  },
  {
    question: "Does Rehan Kadri work with small businesses or only enterprise?",
    answer: "Rehan works with B2B brands at different stages — from funded startups and mid-market companies to established enterprises. The common denominator is a genuine product or service, a defined target audience, and a commitment to content as a long-term growth channel. He does not work with businesses that need short-term traffic hacks or link-buying schemes."
  },
  {
    question: "How can I hire Rehan Kadri for SEO or YouTube growth?",
    answer: "The best starting point is the contact form at therehankadri.com/contact. Describe your business, your current SEO situation, and your primary growth goal. Rehan reviews all inquiries personally and responds within 1-2 business days."
  }
];

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqEntries.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: entry.answer,
    },
  })),
};

type ProofShot = {
  img: string;
  alt: string;
};

type ProofFeature = {
  title: string;
  desc: string;
};

type ProofShowcase = {
  img: string;
  alt: string;
  tag: string;
  h3: string;
  p: string;
  features: ProofFeature[];
  proofShots?: ProofShot[];
};

type ServiceVisualKind = "seo" | "pipeline" | "content";
type ServiceDiagramIconKind =
  | "keyword"
  | "technical"
  | "content"
  | "outreach"
  | "capture"
  | "convert"
  | "youtube"
  | "instagram"
  | "linkedin";

const showcaseImageDimensions: Record<string, { width: number; height: number }> = {
  "/rehanous-website.webp": { width: 508, height: 461 },
  "/Rehanous%20channel.webp": { width: 1280, height: 720 },
  "/traffic shot 4million.webp": { width: 1280, height: 720 },
  "/ranked-website-proof.webp": { width: 3264, height: 2772 },
  "/youtube-proof.webp": { width: 3000, height: 2412 },
};

function getShowcaseImageDimensions(src: string) {
  return showcaseImageDimensions[src] ?? { width: 1200, height: 900 };
}

const renderServiceDiagramIcon = (kind: ServiceDiagramIconKind) => {
  switch (kind) {
    case "keyword":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <circle cx="10" cy="10" r="5.1" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path d="M14 14 18.4 18.4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M10 7.1v5.8M7.1 10h5.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "technical":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <path d="M6.5 7.4h11M6.5 12h11M6.5 16.6h11" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" />
          <circle cx="8.4" cy="7.4" r="1.8" fill="#fff" />
          <circle cx="14.5" cy="12" r="1.8" fill="#fff" />
          <circle cx="11.6" cy="16.6" r="1.8" fill="#fff" />
        </svg>
      );
    case "content":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <path d="M8 4.6h7.3l2.7 2.8v12H8z" fill="rgba(255,255,255,0.24)" stroke="currentColor" strokeWidth="2.15" strokeLinejoin="round" />
          <path d="M15.3 4.6v3.2h2.7" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 11h6M10 14.4h6M10 17.8h4.4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      );
    case "outreach":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <path d="M5.2 12h8.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="m12.8 8.2 4 3.8-4 3.8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5.4" cy="12" r="1.7" fill="#fff" />
        </svg>
      );
    case "capture":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <path d="M5 7.2h14l-5.6 6.2v4.3L10.6 16v-2.6Z" fill="rgba(255,255,255,0.22)" stroke="currentColor" strokeWidth="2.15" strokeLinejoin="round" />
          <path d="M8.7 10.2h6.6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="15.3" r="1.1" fill="#fff" />
        </svg>
      );
    case "convert":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <rect x="5" y="5" width="14" height="14" rx="3.4" fill="rgba(255,255,255,0.14)" stroke="currentColor" strokeWidth="2.15" />
          <path d="m9.2 12.2 1.9 1.9 3.9-4.2" fill="none" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <path
            d="M20.5 12c0 2.45-.26 3.96-.52 4.72a2.3 2.3 0 0 1-1.45 1.45c-.76.26-2.27.52-6.53.52s-5.77-.26-6.53-.52a2.3 2.3 0 0 1-1.45-1.45C3.76 15.96 3.5 14.45 3.5 12s.26-3.96.52-4.72a2.3 2.3 0 0 1 1.45-1.45c.76-.26 2.27-.52 6.53-.52s5.77.26 6.53.52a2.3 2.3 0 0 1 1.45 1.45c.26.76.52 2.27.52 4.72Z"
            fill="rgba(255,255,255,0.92)"
          />
          <path d="m10.3 8.85 5.3 3.15-5.3 3.15z" fill="#ff5a36" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <rect x="5" y="5" width="14" height="14" rx="4.1" fill="rgba(255,255,255,0.1)" stroke="currentColor" strokeWidth="2.15" />
          <circle cx="12" cy="12" r="3.35" fill="none" stroke="currentColor" strokeWidth="2.15" />
          <circle cx="16.55" cy="7.65" r="1.25" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="service-diagram-glyph">
          <circle cx="7.9" cy="7.5" r="1.45" fill="currentColor" />
          <path d="M7.9 10.3V17M11.7 17v-4.4c0-1.35.92-2.3 2.2-2.3 1.36 0 2.16.9 2.16 2.6V17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

const renderServiceVisual = (kind: ServiceVisualKind) => {
  switch (kind) {
    case "seo":
      return (
        <div className="service-visual service-visual-seo" aria-hidden="true">
          <div className="service-diagram service-diagram-seo">
            <div className="service-diagram-nodes">
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-keyword">
                  {renderServiceDiagramIcon("keyword")}
                </span>
                <span className="service-diagram-label">Intent</span>
              </div>
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-technical">
                  {renderServiceDiagramIcon("technical")}
                </span>
                <span className="service-diagram-label">Technical</span>
              </div>
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-content">
                  {renderServiceDiagramIcon("content")}
                </span>
                <span className="service-diagram-label">Content</span>
              </div>
            </div>

            <div className="service-diagram-engine-wrap">
              <div className="service-diagram-lines" />
              <div className="service-diagram-engine">
                <span className="service-diagram-kicker">Search engine</span>
                <span className="service-diagram-title">#1 Visibility</span>
              </div>
            </div>

            <div className="service-diagram-results">
              <span className="service-diagram-result">Rankings</span>
              <span className="service-diagram-result">Traffic</span>
              <span className="service-diagram-result service-diagram-result-accent">1M+ proof</span>
            </div>
          </div>
        </div>
      );
    case "pipeline":
      return (
        <div className="service-visual service-visual-pipeline" aria-hidden="true">
          <div className="service-diagram service-diagram-pipeline">
            <div className="service-diagram-nodes">
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-outreach">
                  {renderServiceDiagramIcon("outreach")}
                </span>
                <span className="service-diagram-label">Outreach</span>
              </div>
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-capture">
                  {renderServiceDiagramIcon("capture")}
                </span>
                <span className="service-diagram-label">Capture</span>
              </div>
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-convert">
                  {renderServiceDiagramIcon("convert")}
                </span>
                <span className="service-diagram-label">Convert</span>
              </div>
            </div>

            <div className="service-diagram-engine-wrap">
              <div className="service-diagram-lines" />
              <div className="service-diagram-engine">
                <span className="service-diagram-kicker">Qualification layer</span>
                <span className="service-diagram-title">Lead Engine</span>
              </div>
            </div>

            <div className="service-diagram-results">
              <span className="service-diagram-result">Qualified leads</span>
              <span className="service-diagram-result service-diagram-result-accent">Booked calls</span>
              <span className="service-diagram-result">Pipeline</span>
            </div>
          </div>
        </div>
      );
    case "content":
      return (
        <div className="service-visual service-visual-content" aria-hidden="true">
          <div className="service-diagram service-diagram-content">
            <div className="service-diagram-nodes">
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-youtube">
                  {renderServiceDiagramIcon("youtube")}
                </span>
                <span className="service-diagram-label">YouTube</span>
              </div>
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-instagram">
                  {renderServiceDiagramIcon("instagram")}
                </span>
                <span className="service-diagram-label">Instagram</span>
              </div>
              <div className="service-diagram-node">
                <span className="service-diagram-icon service-diagram-badge service-diagram-badge-linkedin">
                  {renderServiceDiagramIcon("linkedin")}
                </span>
                <span className="service-diagram-label">LinkedIn</span>
              </div>
            </div>

            <div className="service-diagram-engine-wrap">
              <div className="service-diagram-lines" />
              <div className="service-diagram-engine">
                <span className="service-diagram-kicker">Content system</span>
                <span className="service-diagram-title">Authority Engine</span>
              </div>
            </div>

            <div className="service-diagram-results">
              <span className="service-diagram-result">Audience</span>
              <span className="service-diagram-result">Trust</span>
              <span className="service-diagram-result service-diagram-result-accent">Inbound leads</span>
            </div>
          </div>
        </div>
      );
  }
};

export default function Home() {
  const caseStudies: ProofShowcase[] = [
    {
      img: "/rehanous-website.webp", alt: "B2B Growth Infrastructure",
      tag: "B2B SEO & Content Ops",
      h3: "Scaling to 1M+ Monthly Organic Visitors",
      p: "Built an SEO system that took the site from near-zero visibility to 1M+ monthly organic visitors.",
      proofShots: [
        { img: "/traffic shot 4million.webp", alt: "4 million traffic proof screenshot" },
      ],
      features: [
        { title: "Technical SEO", desc: "A clean structure built for rankings and scale." },
        { title: "Compounding Growth", desc: "Traffic kept growing without paid acquisition." },
      ],
    },
    {
      img: "/Rehanous%20channel.webp", alt: "Brand Authority & Video",
      tag: "Brand Authority & Video",
      h3: "Building a 33K+ Subscriber Engine",
      p: "Reworked the content system to improve retention, sharpen positioning, and scale the channel to 33K+ subscribers.",
      features: [
        { title: "Stronger Retention", desc: "Videos held attention longer and performed better." },
        { title: "Higher CTR", desc: "Better packaging turned more impressions into views." },
      ],
    },
  ];
  return (
    <main className="site-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageStructuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── 1. HERO ── */}
      <section className="hero section-light">
        <div className="container hero-container">
          <div className="hero-text-col">
            <h1 className="hero-title hero-title-desktop">
              <span className="hero-line-static">I help B2B brands rank <span className="text-orange">#1 on Google</span></span>
              <span className="hero-line-static">and scale <span className="text-orange">YouTube</span> into real leads.</span>
            </h1>
            <p className="hero-title hero-title-mobile" aria-hidden="true">
              <span className="hero-mobile-line">I help B2B brands</span>
              <span className="hero-mobile-line">
                rank <span className="text-orange">#1 on Google</span>
              </span>
              <span className="hero-mobile-line">
                and scale <span className="text-orange">YouTube</span>
              </span>
              <span className="hero-mobile-line">into real leads.</span>
            </p>
            <p className="hero-subtitle hero-subtitle-desktop">
              Growth systems built to turn search visibility and content reach into qualified pipeline, not vanity metrics.
            </p>
            <p className="hero-subtitle hero-subtitle-mobile">
              Turn search visibility into qualified pipeline,
              <br />
              not vanity metrics.
            </p>
            <div className="hero-cta">
              <Link href="/contact" prefetch={false} className="btn btn-orange">Book a strategy call ↗</Link>
              <Link href="#proofs" className="btn btn-white">See Real Results</Link>
            </div>
            <p className="hero-cta-note">
              45-minute call. We&apos;ll uncover what&apos;s slowing growth and how to fix it.
            </p>
          </div>

          <div className="hero-portrait-col">
            <div className="premium-circle-wrapper">
              <Image
                src="/rehan.webp"
                alt="Rehan Kadri"
                width={500}
                height={600}
                preload
                fetchPriority="high"
                sizes="(max-width: 640px) 252px, (max-width: 960px) 285px, 370px"
                quality={75}
                className="premium-portrait-img"
              />
            </div>
            <div className="hero-social-card" aria-label="Social proof">
              <div className="hero-social-top">
                <div className="hero-social-icons">
                  <span className="hero-social-icon hero-social-icon-youtube">
                    {renderServiceDiagramIcon("youtube")}
                  </span>
                  <span className="hero-social-icon hero-social-icon-instagram">
                    {renderServiceDiagramIcon("instagram")}
                  </span>
                  <span className="hero-social-icon hero-social-icon-linkedin">
                    {renderServiceDiagramIcon("linkedin")}
                  </span>
                </div>
                <span className="hero-social-kicker">Social growth</span>
              </div>
              <div className="hero-social-value">33K+</div>
              <p className="hero-social-copy">
                Audience built across YouTube, Instagram, and LinkedIn to turn attention into inbound trust.
              </p>
            </div>
            <div className="hero-analytics-card" aria-label="Traffic proof">
              <div className="hero-analytics-panel hero-analytics-panel-blue">
                <div className="hero-analytics-label">
                  <span className="hero-analytics-check">✓</span>
                  <span>Total clicks</span>
                </div>
                <div className="hero-analytics-value">4.12M</div>
                <span className="hero-analytics-help">?</span>
              </div>
              <div className="hero-analytics-panel hero-analytics-panel-purple">
                <div className="hero-analytics-label">
                  <span className="hero-analytics-check">✓</span>
                  <span>Total impressions</span>
                </div>
                <div className="hero-analytics-value">56.9M</div>
                <span className="hero-analytics-help">?</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PROBLEM & SOLUTION ── */}
      <section className="section-dark section-padding problem-section defer-section">
        <div className="container">
          <div className="problem-panel">
            <div className="problem-intro">
              <span className="section-label">The Gap</span>
              <h2 className="problem-title">
                Traffic without <span className="text-orange">conversion</span> is just noise.
              </h2>
              <p className="problem-lead">
                Getting more traffic is easy. Turning it into qualified leads is where most businesses fail.
              </p>
              <div className="problem-intro-note">
                Most businesses focus on traffic first. That is why they struggle to convert.
                <br />
                I build systems that turn attention into predictable revenue.
              </div>
            </div>

            <div className="problem-cards">
              <article className="problem-mini-card">
                <div className="problem-card-top">
                  <div className="problem-mini-copy">
                    <span className="problem-mini-label">What goes wrong</span>
                    <h3 className="problem-card-title">More traffic. No conversions.</h3>
                    <p>
                      Traffic comes in but leads stay unqualified. Follow-ups break. Sales teams waste time chasing the wrong people.
                      <br /><br />
                      This is not a traffic problem. It is a broken system.
                    </p>
                  </div>

                  <div className="problem-image-frame problem-image-frame-loss">
                    <Image
                      src="/arrow%20funnel.svg"
                      alt="Traffic leaking away illustration"
                      width={388}
                      height={636}
                      sizes="(max-width: 640px) 76px, (max-width: 900px) 84px, 84px"
                      unoptimized
                      className="problem-image"
                    />
                  </div>
                </div>
                <div className="problem-card-footer">
                  <span className="problem-card-chip">Unqualified traffic</span>
                  <span className="problem-card-chip">No conversion system</span>
                </div>
              </article>

              <article className="problem-mini-card problem-mini-card-accent">
                <div className="problem-card-top">
                  <div className="problem-mini-copy">
                    <span className="problem-mini-label">What I build</span>
                    <h3 className="problem-card-title">A system built to convert and scale</h3>
                    <p>
                      Every click, visit, and interaction is designed to move one step closer to a booked call.
                      <br /><br />
                      No gaps. No wasted attention. Just a clear path to revenue.
                    </p>
                    <div className="problem-build-flow" aria-label="Traffic to revenue flow">
                      <div className="problem-build-step problem-build-step-1">
                        <span className="problem-build-stage">Traffic</span>
                        <span className="problem-build-arrow" aria-hidden="true">→</span>
                      </div>
                      <div className="problem-build-step problem-build-step-2">
                        <span className="problem-build-stage">Qualified leads</span>
                        <span className="problem-build-arrow" aria-hidden="true">→</span>
                      </div>
                      <div className="problem-build-step problem-build-step-3">
                        <span className="problem-build-stage">Booked calls</span>
                        <span className="problem-build-arrow" aria-hidden="true">→</span>
                      </div>
                      <div className="problem-build-step problem-build-step-4">
                        <span className="problem-build-stage problem-build-stage-accent">Revenue</span>
                      </div>
                    </div>
                    <div className="problem-build-note">Every step is built to convert.</div>
                  </div>

                  <div className="problem-image-frame problem-image-frame-build">
                    <Image
                      src="/what%20i%20build%20funnel).svg"
                      alt="Qualified pipeline funnel illustration"
                      width={475}
                      height={815}
                      sizes="(max-width: 640px) 82px, (max-width: 900px) 90px, 106px"
                      unoptimized
                      className="problem-image"
                    />
                  </div>
                </div>
                <div className="problem-card-footer">
                  <span className="problem-card-chip problem-card-chip-accent">SEO</span>
                  <span className="problem-card-chip problem-card-chip-accent">Content</span>
                  <span className="problem-card-chip problem-card-chip-accent">Conversion</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. WHAT I DO ── */}
      <section id="services" className="section-gray section-padding services-section-compact defer-section">
        <div className="container">
          <div className="services-premium-header">
            <div className="services-premium-copy">
              <span className="section-label">Growth Systems</span>
              <h2 className="section-title">
                Turn Traffic Into <span className="text-orange">Revenue</span>, Not Just Views
              </h2>
              <p className="section-desc">
                Systems built to attract the right audience, convert them into leads, and close faster.
              </p>
            </div>

            <div className="services-premium-note">
              <span className="services-note-label">Built to generate pipeline</span>
              <p>
                This is not vanity-metric marketing. Each system is designed to create qualified demand,
                stronger sales conversations, and clearer paths to revenue.
              </p>
            </div>
          </div>

          <div className="services-premium-grid">
            {[
              {
                num: "01",
                label: "Search Demand",
                visual: "seo" as const,
                title: "SEO & Organic Growth Systems",
                desc: "Capture high-intent traffic and turn it into consistent inbound leads.",
                resultLine: "Get discovered when buyers are ready to take action",
                outcomes: [
                  "Rank for keywords that bring real customers",
                  "Build long-term traffic that compounds every month",
                  "Turn search visibility into inbound leads",
                ],
                cta: "View SEO Strategy",
              },
              {
                num: "02",
                label: "Pipeline Design",
                visual: "pipeline" as const,
                title: "B2B Lead Generation Systems",
                desc: "Build a predictable pipeline that brings qualified leads and booked calls.",
                resultLine: "Turn cold outreach into warm conversations and sales",
                outcomes: [
                  "Combine LinkedIn, funnels, and automation",
                  "Convert traffic into booked calls",
                  "Build a consistent pipeline you can rely on",
                ],
                cta: "See Lead System",
              },
              {
                num: "03",
                label: "Authority Engine",
                visual: "content" as const,
                title: "Content, Video & Social Growth Systems",
                desc: "Use content to build authority, attract attention, and drive inbound leads.",
                resultLine: "Become the brand people trust before they even talk to you",
                outcomes: [
                  "Create content that builds authority and trust",
                  "Distribute across YouTube, Instagram, and LinkedIn",
                  "Shorten your sales cycle with inbound demand",
                ],
                cta: "Explore Content Engine",
              },
            ].map(({ num, label, visual, title, desc, resultLine, outcomes, cta }) => (
              <article className="service-premium-card" key={num}>
                <div className="service-premium-top">
                  <div className="service-number-badge">{num}</div>
                  <div className="service-premium-label">{label}</div>
                </div>

                <div className="service-content premium-service-content">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>

                {renderServiceVisual(visual)}

                <p className="service-result-line">{resultLine}</p>

                <ul className="service-outcomes" aria-label={`${title} outcomes`}>
                  {outcomes.map((item) => (
                    <li className="service-outcome-chip" key={item}>
                      <span className="service-check">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="service-premium-footer">
                  <span className="service-footer-text">Built for qualified pipeline growth</span>
                  <Link href="/contact" prefetch={false} className="service-cta-button">
                    <span>{cta}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="services-conversion-close">
            <div className="services-conversion-copy">
              <h3>Not sure which system fits your business?</h3>
              <p>I will break down what is holding your growth back and what to fix first.</p>
            </div>
            <Link href="/contact" prefetch={false} className="services-audit-button">
              <span>Get Free Growth Audit</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. CASE STUDIES ── */}
      <section id="works" className="section-light section-padding defer-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Case Studies</span>
            <h2 className="section-title">Predictable <span className="text-orange">Outcomes</span></h2>
            <p className="section-desc">Data-backed examples of how my systems transition stagnant metrics into exponential revenue growth.</p>
          </div>
          <div className="proof-showcase-list">
            {caseStudies.map(({ img, alt, tag, h3, p, proofShots, features }, i) => (
              <div
                className="proof-showcase-row"
                key={i}
              >
                <div className="proof-showcase-img-container">
                  <Image
                    src={img}
                    alt={alt}
                    width={getShowcaseImageDimensions(img).width}
                    height={getShowcaseImageDimensions(img).height}
                    sizes="(max-width: 640px) 100vw, 520px"
                    quality={60}
                    className="proof-showcase-image"
                  />
                  {proofShots ? (
                    <div className="proof-shot-grid">
                      {proofShots.map((shot) => (
                        <div className="proof-shot-card" key={shot.img}>
                          <Image
                            src={shot.img}
                            alt={shot.alt}
                            width={getShowcaseImageDimensions(shot.img).width}
                            height={getShowcaseImageDimensions(shot.img).height}
                            sizes="(max-width: 640px) 100vw, 300px"
                            quality={60}
                            className="proof-shot-image"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="proof-showcase-content">
                  <span className="proof-showcase-tag">{tag}</span>
                  <h3>{h3}</h3>
                  <p style={{ whiteSpace: "pre-line" }}>{p}</p>
                  <div className="proof-features">
                    {features.map(({ title, desc }) => (
                      <div className="proof-feature" key={title}>
                        <div className="pf-icon">✦</div>
                        <div><h4>{title}</h4><p>{desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION (AEO) ── */}
      <section className="section-dark defer-section" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(homeFaqSchema).replace(/</g, "\\u003c"),
          }}
        />
        <div className="container" style={{ maxWidth: 860, margin: "0 auto", padding: "5rem 1.5rem" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#fff", marginBottom: "0.5rem", fontWeight: 700 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "3rem", fontSize: "1rem" }}>
            Everything you need to know about working with Rehan Kadri on SEO and YouTube growth.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {homeFaqEntries.map((entry, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.5rem" }}>
                <h3 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.6rem" }}>
                  {entry.question}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.7, fontSize: "0.95rem", margin: 0 }}>
                  {entry.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CTA SECTION ── */}
      <section className="section-dark cta-section defer-section">
                Stop <span className="cta-muted">guessing.</span><br />
                Start <span className="text-orange">scaling.</span>
              </h2>
              <p className="cta-text">
                I will audit your growth system and map the fastest route to qualified pipeline.
              </p>
              <Link href="/contact" prefetch={false} className="btn btn-orange cta-button">
                Build My System ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

