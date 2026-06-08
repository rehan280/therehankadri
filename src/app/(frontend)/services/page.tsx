import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Growth Systems & Services | The Rehan Kadri",
  description:
    "Explore our core growth systems: SEO & Organic Growth, B2B Lead Generation, and Content & Video Authority.",
  path: "/services",
});

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

export default function ServicesPage() {
  return (
    <main className="site-shell">
      {/* ── HIGH CONVERSION HERO ── */}
      <section className="hero section-light" style={{ paddingBottom: "4rem", minHeight: "80vh", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", padding: "0 1rem" }}>
          
          <div className="hero-proofline" style={{ margin: "0 auto 2rem auto" }}>
            <span className="hero-proof-badge">Proven Results</span>
            <span>Over $10M+ in pipeline generated for B2B partners.</span>
          </div>

          <h1 className="hero-title hero-title-desktop" style={{ margin: "0 auto 1.5rem", lineHeight: "1.1" }}>
            <span className="hero-line-static">I Build Growth Systems That</span>
            <span className="hero-line-static">Turn Clicks Into <span className="text-orange">Customers.</span></span>
          </h1>
          <p className="hero-title hero-title-mobile" aria-hidden="true" style={{ margin: "0 auto 1.5rem", lineHeight: "1.1", fontSize: "clamp(1.8rem, 8vw, 2.5rem)", whiteSpace: "normal", wordWrap: "break-word" }}>
            <span className="hero-mobile-line">I Build Systems That</span>
            <span className="hero-mobile-line">Turn Clicks Into</span>
            <span className="hero-mobile-line"><span className="text-orange">Customers.</span></span>
          </p>
          
          <p className="hero-subtitle hero-subtitle-desktop" style={{ margin: "0 auto 3rem", fontSize: "1.2rem", maxWidth: "800px", width: "100%", padding: "0 1rem", boxSizing: "border-box" }}>
            Most agencies sell you traffic, views, and empty promises. I build integrated inbound infrastructure that captures attention, builds authority, and drives predictable, high-ticket revenue.
          </p>
          <p className="hero-subtitle hero-subtitle-mobile" style={{ margin: "0 auto 3rem", fontSize: "1.1rem", width: "100%", padding: "0 1rem", boxSizing: "border-box", textAlign: "center" }}>
            Most sell you traffic. I build inbound infrastructure that drives high-ticket revenue.
          </p>

          <div className="hero-cta" style={{ display: "flex", justifyContent: "center", gap: "1.5rem", padding: "0 1rem" }}>
            <Link href="/contact" prefetch={false} className="btn btn-orange" style={{ fontSize: "clamp(0.85rem, 3.5vw, 1.1rem)", padding: "1rem clamp(1.2rem, 4vw, 2.5rem)", whiteSpace: "nowrap", textAlign: "center", width: "fit-content" }}>
              Apply To Work With Me ↗
            </Link>
          </div>
          <p className="hero-cta-note" style={{ margin: "1.5rem auto 0", fontWeight: "600", fontSize: "clamp(0.85rem, 2.5vw, 1rem)", padding: "0 1rem" }}>
            Limited spots available. We only work with companies we can 10x.
          </p>

          <div className="hero-pill-row" style={{ marginTop: "4rem", justifyContent: "center", gap: "1rem" }}>
             <div className="hero-pill">
               <span className="pill-num">4.12M+</span>
               <span className="pill-label">Organic Visitors</span>
             </div>
             <div className="hero-pill">
               <span className="pill-num">33K+</span>
               <span className="pill-label">Audience Built</span>
             </div>
             <div className="hero-pill">
               <span className="pill-num">#1</span>
               <span className="pill-label">Google Rankings</span>
             </div>
          </div>
        </div>
      </section>

      {/* ── THE AGITATION (DARK SECTION) ── */}
      <section className="section-dark section-padding defer-section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1.5rem" }}>
          <span className="section-label" style={{ marginBottom: "1rem", color: "#ff5a36", letterSpacing: "0.1em", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>The Problem</span>
          <h2 className="section-title" style={{ fontSize: "clamp(1.8rem, 8vw, 3rem)", marginBottom: "1.5rem", lineHeight: "1.15" }}>
            You don't have a traffic problem.<br/><span className="text-orange">You have a conversion problem.</span>
          </h2>
          <p style={{ fontSize: "clamp(1.05rem, 4vw, 1.15rem)", lineHeight: "1.7", color: "rgba(255,255,255,0.7)", maxWidth: "700px", width: "100%", padding: "0 1rem", boxSizing: "border-box", textAlign: "center" }}>
            Getting eyeballs is easy. But if your traffic bounces, your YouTube views don't translate to booked calls, and your leads are completely unqualified—you are bleeding money. Stop paying for vanity metrics. It's time to build a machine.
          </p>
        </div>
      </section>

      {/* ── THE CORE SYSTEMS (THE SOLUTION) ── */}
      <section id="services-grid" className="section-gray section-padding services-section-compact defer-section">
        <div className="container">
          <div className="services-premium-header" style={{ marginBottom: "4rem" }}>
            <div className="services-premium-copy">
              <span className="section-label">The Solution</span>
              <h2 className="section-title">
                The Anatomy of <span className="text-orange">Scale</span>
              </h2>
              <p className="section-desc">
                Three highly integrated systems designed to work together to dominate your niche.
              </p>
            </div>
            <div className="services-premium-note" style={{ background: "rgba(255,90,54,0.05)", border: "1px solid rgba(255,90,54,0.2)" }}>
              <span className="services-note-label text-orange">Systems over hacks</span>
              <p>
                We don't do random acts of marketing. We build infrastructure that grows your business predictably.
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
                desc: "Capture high-intent traffic and turn it into consistent inbound leads by dominating Google search results.",
                resultLine: "Get discovered when buyers are ready to take action",
                outcomes: [
                  "Comprehensive technical SEO audits and rebuilds",
                  "Bottom-of-funnel keyword strategy that targets buyers",
                  "High-converting content that ranks #1",
                  "Authority building & strategic link acquisition",
                ],
                cta: "Discuss SEO Strategy",
              },
              {
                num: "02",
                label: "Pipeline Design",
                visual: "pipeline" as const,
                title: "B2B Lead Generation Systems",
                desc: "Build a predictable pipeline that brings qualified leads and booked calls directly to your sales team.",
                resultLine: "Turn cold outreach into warm conversations and sales",
                outcomes: [
                  "LinkedIn inbound & outbound growth strategies",
                  "High-converting funnel and landing page design",
                  "Automated qualification layers to filter out bad fits",
                  "Seamless CRM integration and lead handoff",
                ],
                cta: "Build My Lead Engine",
              },
              {
                num: "03",
                label: "Authority Engine",
                visual: "content" as const,
                title: "Content, Video & Social Systems",
                desc: "Use strategic video content to build unparalleled trust, attract attention, and drive inbound leads at scale.",
                resultLine: "Become the brand people trust before they even talk to you",
                outcomes: [
                  "YouTube channel strategy, scripting, and growth",
                  "Short-form video systems (Instagram & TikTok)",
                  "Omnichannel content repurposing workflows",
                  "Community building and audience retention",
                ],
                cta: "Explore Content Engine",
              },
            ].map(({ num, label, visual, title, desc, resultLine, outcomes, cta }) => (
              <article className="service-premium-card" key={num} style={{ display: "flex", flexDirection: "column", transform: "translateY(0)", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}>
                <div className="service-premium-top">
                  <div className="service-number-badge" style={{ background: "linear-gradient(135deg, #ff6a3d, #ff3d00)", color: "white", border: "none" }}>{num}</div>
                  <div className="service-premium-label" style={{ fontWeight: "800", color: "#ff5a36" }}>{label}</div>
                </div>

                <div className="service-content premium-service-content">
                  <h3 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "1rem" }}>{title}</h3>
                  <p style={{ fontSize: "1.05rem", color: "#555" }}>{desc}</p>
                </div>

                <div style={{ margin: "2rem 0" }}>
                  {renderServiceVisual(visual)}
                </div>

                <div style={{ flex: 1 }}>
                  <p className="service-result-line" style={{ marginTop: "1rem", fontWeight: "700", color: "#222" }}>{resultLine}</p>

                  <ul className="service-outcomes" aria-label={`${title} outcomes`}>
                    {outcomes.map((item) => (
                      <li className="service-outcome-chip" key={item} style={{ background: "white", border: "1px solid #eee", padding: "0.8rem 1rem", borderRadius: "8px", marginBottom: "0.5rem" }}>
                        <span className="service-check" style={{ color: "#ff5a36" }}>✓</span>
                        <span style={{ fontWeight: "500" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="service-premium-footer" style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1.5rem" }}>
                  <span className="service-footer-text">Built for qualified pipeline growth</span>
                  <Link href="/contact" prefetch={false} className="service-cta-button" style={{ background: "#111", color: "white", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                    <span>{cta}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE (THE OLD WAY VS MY WAY) ── */}
      <section className="section-light section-padding defer-section">
        <div className="container" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div className="section-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "4rem", padding: "0 1.5rem" }}>
            <span className="section-label" style={{ marginBottom: "1rem", color: "#ff5a36", letterSpacing: "0.1em", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>Why Choose Me</span>
            <h2 className="section-title" style={{ textAlign: "center", fontSize: "clamp(1.8rem, 8vw, 3rem)" }}>The Agency Model is <span className="text-orange">Broken.</span></h2>
            <p className="section-desc" style={{ textAlign: "center", fontSize: "clamp(1rem, 4vw, 1.15rem)", width: "100%", padding: "0 1rem", boxSizing: "border-box" }}>Why paying a massive retainer for an outdated agency will drain your budget.</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
            <div style={{ flex: "1 1 300px", background: "#f9f9f9", padding: "clamp(1.5rem, 5vw, 3rem)", borderRadius: "24px", border: "1px solid #eaeaea", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <h3 style={{ color: "#777", fontSize: "1.4rem", marginBottom: "2rem", textDecoration: "line-through", textDecorationColor: "#ff3333", textDecorationThickness: "2px", textAlign: "center", width: "100%" }}>
                The Typical Agency
              </h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ color: "#ff3333", fontWeight: "bold" }}>✕</span> <span style={{ color: "#555" }}>Focuses entirely on traffic and rankings, ignoring revenue.</span></li>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ color: "#ff3333", fontWeight: "bold" }}>✕</span> <span style={{ color: "#555" }}>Passes your account to a junior account manager.</span></li>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ color: "#ff3333", fontWeight: "bold" }}>✕</span> <span style={{ color: "#555" }}>Uses outdated, cookie-cutter templates for every client.</span></li>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ color: "#ff3333", fontWeight: "bold" }}>✕</span> <span style={{ color: "#555" }}>Takes 6 months to show any measurable ROI.</span></li>
              </ul>
            </div>
            <div style={{ flex: "1 1 300px", background: "rgba(11, 11, 13, 0.96)", padding: "clamp(1.5rem, 5vw, 3rem)", borderRadius: "24px", border: "1px solid rgba(255, 90, 54, 0.3)", boxShadow: "0 20px 40px rgba(255,90,54,0.1)", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <h3 style={{ color: "white", fontSize: "1.4rem", marginBottom: "2rem", textAlign: "center", width: "100%" }}>The Growth Partner <span className="text-orange">(Me)</span></h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ color: "#00cc66", fontWeight: "bold" }}>✓</span> <span style={{ color: "#ddd" }}>Focuses exclusively on metrics that matter: Qualified Leads.</span></li>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ color: "#00cc66", fontWeight: "bold" }}>✓</span> <span style={{ color: "#ddd" }}>You work directly with me. No juniors. No middlemen.</span></li>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ color: "#00cc66", fontWeight: "bold" }}>✓</span> <span style={{ color: "#ddd" }}>Bespoke, high-converting systems tailored to your exact offer.</span></li>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}><span style={{ color: "#00cc66", fontWeight: "bold" }}>✓</span> <span style={{ color: "#ddd" }}>Rapid implementation. We plug the leaks in week one.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROCESS ── */}
      <section className="section-dark section-padding problem-section defer-section">
        <div className="container">
          <div className="problem-panel">
            <div className="problem-intro">
              <span className="section-label">Execution</span>
              <h2 className="problem-title">
                The 3-Step <span className="text-orange">Revenue</span> Framework
              </h2>
              <p className="problem-lead">
                I act as an extension of your team to implement systems that win. Here is exactly how we scale.
              </p>
            </div>

            <div className="problem-cards">
              <article className="problem-mini-card">
                <div className="problem-card-top">
                  <div className="problem-mini-copy">
                    <span className="problem-mini-label" style={{ color: "#ff5a36" }}>Phase 1</span>
                    <h3 className="problem-card-title">Audit & Architect</h3>
                    <p>
                      We start by analyzing your current funnels, traffic, and content. We identify where attention is leaking and architect a system to capture it immediately.
                    </p>
                  </div>
                </div>
                <div className="problem-card-footer">
                  <span className="problem-card-chip">Deep Dive Analytics</span>
                </div>
              </article>

              <article className="problem-mini-card">
                <div className="problem-card-top">
                  <div className="problem-mini-copy">
                    <span className="problem-mini-label" style={{ color: "#ff5a36" }}>Phase 2</span>
                    <h3 className="problem-card-title">Build & Deploy</h3>
                    <p>
                      We build the infrastructure. From technical SEO overhauls to establishing high-converting landing pages and video content workflows.
                    </p>
                  </div>
                </div>
                <div className="problem-card-footer">
                  <span className="problem-card-chip">Technical Execution</span>
                </div>
              </article>

              <article className="problem-mini-card problem-mini-card-accent" style={{ background: "linear-gradient(135deg, rgba(255,90,54,0.1), rgba(0,0,0,0))" }}>
                <div className="problem-card-top">
                  <div className="problem-mini-copy">
                    <span className="problem-mini-label" style={{ color: "#ff5a36", fontWeight: "bold" }}>Phase 3</span>
                    <h3 className="problem-card-title">Scale & Optimize</h3>
                    <p>
                      Once the system is live, we scale traffic through continuous content deployment, link acquisition, and relentless conversion rate optimization.
                    </p>
                  </div>
                </div>
                <div className="problem-card-footer">
                  <span className="problem-card-chip problem-card-chip-accent">Predictable Leads</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA (MASSIVE CONVERSION FOCUS) ── */}
      <section className="section-light section-padding" style={{ padding: "clamp(4rem, 10vw, 8rem) 0", background: "linear-gradient(180deg, #ffffff 0%, #f4f4f5 100%)" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", padding: "0 1.5rem" }}>
          <h2 style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", fontWeight: "900", letterSpacing: "-0.05em", color: "#111", marginBottom: "1.5rem", lineHeight: "1.1" }}>
            Ready To Dominate<br/>Your Industry?
          </h2>
          <p style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)", color: "#555", marginBottom: "3rem", lineHeight: "1.6", width: "100%", padding: "0 1rem", boxSizing: "border-box" }}>
            Stop wasting time on tactics that don't move the needle. Let's architect a growth engine that runs 24/7 and fills your calendar with highly qualified buyers.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", width: "100%" }}>
            <Link href="/contact" prefetch={false} className="btn btn-orange" style={{ padding: "1rem clamp(1.2rem, 4vw, 3rem)", fontSize: "clamp(0.85rem, 3.5vw, 1.1rem)", boxShadow: "0 20px 40px rgba(255,90,54,0.3)", textAlign: "center", whiteSpace: "nowrap", width: "fit-content" }}>
              Apply For A Strategy Call ↗
            </Link>
          </div>
          <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#888", fontWeight: "600" }}>
            100% Free Audit. No commitments.
          </p>
        </div>
      </section>
    </main>
  );
}
