import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "The Rehan Kadri | SEO, YouTube Growth, and Revenue-Focused Marketing",
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

  const visualProofItems: ProofShowcase[] = [
    {
      img: "/ranked-website-proof.webp", alt: "Ranked Website Proof",
      tag: "SEO Dominance • B2B Rankings",
      h3: "#1 Ranked Global Websites",
      p: "Secured the absolute top search spots globally for high-intent keywords connecting product value directly to enterprise search intent.",
      features: [{ title: "Search Monopoly", desc: "Consistently outranking massive enterprise competitors globally." }],
    },
    {
      img: "/youtube-proof.webp", alt: "YouTube Analytics",
      tag: "Growth Scaling • Backend",
      h3: "Massive Impression Scaling",
      p: "The backend dashboard proving exponential growth patterns. Millions of targeted impressions scaling dramatically week over week through systemic editorial ops.",
      features: [{ title: "Consistent Predictability", desc: "Undeniable backend data proving the exact scalability of my systems." }],
    },
    {
      img: "/traffic shot 4million.webp", alt: "Traffic proof analytics",
      tag: "Traffic Proof • Search Console",
      h3: "Traffic proof that backs up the growth claim",
      p: "Search Console screenshots showing multi-million click and impression volume, added as direct evidence behind the 1M+ traffic case study.",
      features: [{ title: "Search Console Evidence", desc: "Direct click and impression screenshots reinforcing the 1M+ traffic performance claim." }],
    },
  ];

  return (
    <main className="site-shell">

      {/* ── 1. HERO ── */}
      <section className="hero section-light">
        <div className="container hero-container">
          <div className="hero-text-col">
            <h1 className="hero-title hero-title-desktop">
              <span className="hero-line-static">I help B2B brands rank <span className="text-orange">#1 on Google</span></span>
              <span className="hero-line-static">and scale <span className="text-orange">YouTube</span> into real leads.</span>
            </h1>
            <h1 className="hero-title hero-title-mobile">
              <span className="hero-mobile-line">I help B2B brands</span>
              <span className="hero-mobile-line">
                rank <span className="text-orange">#1 on Google</span>
              </span>
              <span className="hero-mobile-line">
                and scale <span className="text-orange">YouTube</span>
              </span>
              <span className="hero-mobile-line">into real leads.</span>
            </h1>
            <p className="hero-subtitle hero-subtitle-desktop">
              Growth systems built to turn search visibility and content reach into qualified pipeline, not vanity metrics.
            </p>
            <p className="hero-subtitle hero-subtitle-mobile">
              Turn search visibility into qualified pipeline,
              <br />
              not vanity metrics.
            </p>
            <div className="hero-cta">
              <Link href="/contact" className="btn btn-orange">Book a strategy call ↗</Link>
              <Link href="#proofs" className="btn btn-white">See Real Results</Link>
            </div>
            <p className="hero-cta-note">
              45-minute call. We&apos;ll uncover what&apos;s slowing growth and how to fix it.
            </p>
          </div>

          <div className="hero-portrait-col">
            <div className="premium-circle-wrapper">
              <Image src="/rehan.png" alt="Rehan Kadri" width={500} height={600} priority className="premium-portrait-img" />
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
      <section className="section-dark section-padding problem-section">
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/arrow%20funnel.png"
                      alt="Traffic leaking away illustration"
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/what%20i%20build%20funnel).png"
                      alt="Qualified pipeline funnel illustration"
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
      <section id="services" className="section-gray section-padding services-section-compact">
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
                  <Link href="/contact" className="service-cta-button">
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
            <Link href="/contact" className="services-audit-button">
              <span>Get Free Growth Audit</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. CASE STUDIES ── */}
      <section id="works" className="section-light section-padding">
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

      {/* ── 6. VISUAL PROOF ── */}
      <section id="proofs" className="section-dark section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Undeniable Proof</span>
            <h2 className="section-title">The Data <span className="text-orange">Behind The Systems</span></h2>
            <p className="section-desc">Raw backend analytics verifying exponential growth trajectories.</p>
          </div>
          <div className="proof-showcase-list">
            {visualProofItems.map(({ img, alt, tag, h3, p, proofShots, features }, i) => (
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
                  <p>{p}</p>
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

      {/* ── 6.5. GROWTH PATHS ── */}
      <section id="growth" className="section-light section-padding growth-paths-section">
        <div className="container">
          <div className="growth-paths-header">
            <span className="section-label">How Can I Help</span>
            <h2 className="section-title">
              Choose Your <span className="text-orange">Growth Path</span>
            </h2>
            <p className="section-desc">
              Pick the outcome first. Then build the system around it.
            </p>
          </div>

          <div className="growth-paths-grid">
            {[
              {
                eyebrow: "For Founders & B2B Teams",
                choice: "I need qualified B2B pipeline",
                title: "Build a Predictable Revenue Pipeline",
                image: "/business path card img 2.webp",
                alt: "Business growth path illustration",
                summary: "Turn scattered growth into a system that brings in qualified buyers.",
                outcome: "More qualified leads. More booked calls.",
                points: [
                  "Rank for high-intent keywords that convert",
                  "Build inbound plus outbound lead systems",
                ],
                fit: "SaaS, agencies, and high-ticket services",
                cta: "Build My Growth System",
                frameLabel: "Business Track",
                theme: "business",
              },
              {
                eyebrow: "For Creators & Freelancers",
                choice: "I need better clients and positioning",
                title: "Turn Skills Into Consistent Clients",
                image: "/freelancer img.webp",
                alt: "Freelancer growth path illustration",
                summary: "Build a stronger personal brand and inbound system for better clients.",
                outcome: "Better positioning. Better inbound leads.",
                points: [
                  "Grow on LinkedIn and YouTube strategically",
                  "Position yourself as a niche authority",
                ],
                fit: "Freelancers, creators, and personal brands",
                cta: "Grow My Personal Brand",
                frameLabel: "Creator Track",
                theme: "creator",
              },
            ].map(({ eyebrow, choice, title, image, alt, summary, outcome, points, fit, cta, frameLabel, theme }) => (
              <article className={`growth-path-card growth-path-card-${theme}`} key={title}>
                <div className="growth-path-card-top">
                  <div className="growth-path-copy">
                    <span className="growth-path-eyebrow">{eyebrow}</span>
                    <div className="growth-path-choice">{choice}</div>
                    <h3>{title}</h3>
                    <p className="growth-path-summary">{summary}</p>
                    <p className="growth-path-outcome">{outcome}</p>
                  </div>

                  <div className="growth-path-media">
                    <div className="growth-path-media-frame">
                      <span className="growth-path-frame-label">{frameLabel}</span>
                      <Image
                        src={image}
                        alt={alt}
                        width={798}
                        height={724}
                        sizes="(max-width: 760px) 260px, 320px"
                        className="growth-path-image"
                      />
                    </div>
                  </div>
                </div>

                <div className="growth-path-content">
                  <ul className="growth-path-points" aria-label={`${title} benefits`}>
                    {points.map((point) => (
                      <li className="growth-path-point" key={point}>
                        <span className="growth-path-check">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="growth-path-footer">
                    <p className="growth-path-fit">
                      <strong>Best for:</strong> {fit}
                    </p>
                    <Link href="/contact" className="btn btn-orange growth-path-cta">
                      {cta} ↗
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. MY SYSTEM ── */}
      <section id="process" className="section-gray section-padding process-section">
        <div className="container">
          <div className="process-header">
            <div>
              <span className="section-label">The Process</span>
              <h2 className="section-title">
                The Pipeline <span className="text-orange">Architecture</span>
              </h2>
              <p className="section-desc">
                A cleaner four-step system built to move from market clarity to qualified revenue.
              </p>
            </div>

            <div className="process-note">
              <span className="process-note-label">System logic</span>
              <p>
                Each phase builds on the one before it, so traffic, authority, and conversion work as one
                connected engine.
              </p>
            </div>
          </div>

          <div className="process-grid">
            {[
              {
                step: "01",
                tag: "Audit",
                title: "Deep Audit & Architecture",
                desc: "Map the market, identify funnel leaks, and define the highest-leverage growth opportunities before execution begins.",
              },
              {
                step: "02",
                tag: "Assets",
                title: "Asset Engineering",
                desc: "Build the pages, SEO structure, content foundations, and positioning assets that make the pipeline conversion-ready.",
              },
              {
                step: "03",
                tag: "Distribution",
                title: "Traffic Generation",
                desc: "Drive the right audience through search, outbound, and content systems designed to bring in relevant decision-makers.",
              },
              {
                step: "04",
                tag: "Revenue",
                title: "Conversion & Revenue",
                desc: "Tighten the handoff from attention to booked calls by improving every touchpoint that influences trust and action.",
              },
            ].map(({ step, tag, title, desc }) => (
              <article className="process-stage-card" key={step}>
                <div className="process-stage-top">
                  <span className="process-step-badge">Step {step}</span>
                  <span className="process-stage-tag">{tag}</span>
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. ABOUT ME ── */}
      <section id="about" className="section-light section-padding">
        <div className="container why-hire-grid">
          <div className="hire-image-wrapper">
            <Image
              src="/rehan.png"
              alt="Rehan Kadri"
              width={1237}
              height={2199}
              sizes="(max-width: 640px) 80vw, 320px"
              className="hire-img"
            />
          </div>
          <div className="hire-content">
            <span className="section-label">About Me</span>
            <h2 className="section-title">Who Is <span className="text-orange">Rehan Kadri</span>?</h2>
            <p className="section-desc" style={{ marginBottom: "1.5rem", color: "var(--text-dark)", fontWeight: 700 }}>
              I build simple growth systems that help the right people find you, trust you, and turn into real leads.
            </p>
            <p className="section-desc" style={{ marginBottom: "2.5rem" }}>
              I got into this by testing content, SEO, and distribution for myself. Pretty quickly, I learned that traffic can look impressive and still do very little for a business.
              <br /><br />
              That is why I care more about the system behind growth than the vanity of growth itself. I like building a clear path from discovery to trust to conversion, so the right people do not just find you, they actually move.
              <br /><br />
              Over time, that approach has helped me scale organic traffic past 1M monthly visitors and build a YouTube audience of 33K+ subscribers. I focus on growth that compounds, feels practical, and keeps working long after the first spike.
            </p>
            <div className="hire-stats">
              <div className="hire-stat">
                <h4>1M+</h4>
                <p>Traffic Scaled</p>
              </div>
              <div className="hire-stat">
                <h4>33k+</h4>
                <p>Audience Built</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. TESTIMONIALS & PROOF ── */}
      <section className="section-gray section-padding" style={{ paddingBottom: "2rem" }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "3rem", margin: "0 auto 3rem auto" }}>
            <span className="section-label">Client Feedback</span>
            <h2 className="section-title">The <span className="text-orange">Consensus</span></h2>
          </div>
          <div className="testimonials-grid">
            {[
              {
                quote:
                  "Rehan built a real growth pipeline for Fuzen.io, not just better SEO. He connected search, content, and conversion into one system that improved both traffic quality and qualified leads.",
                name: "Pushkar Gaikwad",
                role: "Founder, Fuzen.io",
                image: "/pushkar.webp",
              },
              {
                quote:
                  "Rehan helped us fix what was actually holding our growth back. Our traffic increased, but more importantly we started getting qualified leads consistently. The biggest difference was how everything was connected, from SEO to conversion. It finally feels like we have a system that works.",
                name: "Adil Shaikh",
                role: "Founder, BinaryLabs",
                image: "/adill.webp",
              },
            ].map(({ quote, name, role, image }) => (
              <article className="testimonial-card" key={name}>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">&quot;{quote}&quot;</p>
                <div className="testimonial-person">
                  <div className="testimonial-person-copy">
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </div>
                  <Image
                    src={image}
                    alt={name}
                    width={64}
                    height={64}
                    className="testimonial-avatar"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="marquee-container" style={{ padding: "2rem 0" }}>
          <div className="marquee-track">
            <div className="marquee-content">
              {["Organic SEO Pipelines", "B2B Lead Generation Systems", "Content & Video Ops", "LinkedIn Outreach Systems", "YouTube Growth Systems",
                "Organic SEO Pipelines", "B2B Lead Generation Systems", "Content & Video Ops", "LinkedIn Outreach Systems", "YouTube Growth Systems"].map((t, i) => (
                <div className="marquee-item" key={i}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CTA SECTION ── */}
      <section className="section-dark cta-section">
        <div className="container">
          <div className="cta-panel">
            <div className="cta-copy">
              <span className="section-label">Final CTA</span>
              <h2 className="cta-title">
                Stop <span className="cta-muted">guessing.</span><br />
                Start <span className="text-orange">scaling.</span>
              </h2>
              <p className="cta-text">
                I will audit your growth system and map the fastest route to qualified pipeline.
              </p>
              <Link href="/contact" className="btn btn-orange cta-button">
                Build My System ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
























