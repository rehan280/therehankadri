"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import "./home.css";

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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Reveal on scroll
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("show"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

    // Active nav section tracking
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ["services", "works", "proofs", "process", "about", "contact"].forEach(id => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    // Navbar scroll shadow
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [formResult, setFormResult] = useState("");

  const onContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormResult("Sending message...");
    const formData = new FormData(event.currentTarget);
    formData.append("access_key", "c43eac91-aa20-47a0-97b3-2286e58da10f");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setFormResult("Form Submitted Successfully!");
        event.currentTarget.reset();
        setTimeout(() => setFormResult(""), 5000);
      } else {
        setFormResult(data.message || "Error submitting form. Please try again.");
      }
    } catch {
      setFormResult("Network error. Please try again later.");
    }
  };

  const closeMenu = () => setMenuOpen(false);
  const navLinks = [
    { href: "#services", label: "Expertise" },
    { href: "#works", label: "Results" },
    { href: "#process", label: "Systems" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  const caseStudies: ProofShowcase[] = [
    {
      img: "/rehanous-website.png", alt: "B2B Growth Infrastructure",
      tag: "B2B SEO & Content Ops",
      h3: "Scaling to 1M+ Monthly Organic Visitors",
      p: "Problem: Client had zero visibility in a highly competitive digital niche.\nAction: Designed an aggressive SEO architecture and programmatic content hubs optimizing for high-intent queries.\nResult: Scaled from zero to over 1M completely free, highly-targeted monthly visitors.",
      proofShots: [
        { img: "/traffic shot 4million.webp", alt: "4 million traffic proof screenshot" },
      ],
      features: [
        { title: "Technical Monopoly", desc: "Flawless technical core ensuring perfect search engine indexing." },
        { title: "Traffic Compounding", desc: "Continuous MoM growth completely independent of ad spend." },
      ],
    },
    {
      img: "/rehanous-channel.png", alt: "Brand Authority & Video",
      tag: "Brand Authority & Video",
      h3: "Building a 33K+ Subscriber Engine",
      p: "Problem: Stagnant social growth lacking viewer retention and conversion mechanisms.\nAction: Deployed rigorous A/B thumbnail mechanics and retention-focused editing workflows.\nResult: Exploded channel to 33,000+ highly engaged subscribers, driving massive inbound authority.",
      features: [
        { title: "Retention Optimization", desc: "Cut audience drop-off by 40% through timeline engineering." },
        { title: "12%+ Average CTR", desc: "Dominating impressions through high-contrast visual hooks." },
      ],
    },
  ];

  const visualProofItems: ProofShowcase[] = [
    {
      img: "/ranked-website-proof.jpeg", alt: "Ranked Website Proof",
      tag: "SEO Dominance • B2B Rankings",
      h3: "#1 Ranked Global Websites",
      p: "Secured the absolute top search spots globally for high-intent keywords connecting product value directly to enterprise search intent.",
      features: [{ title: "Search Monopoly", desc: "Consistently outranking massive enterprise competitors globally." }],
    },
    {
      img: "/youtube-proof.jpeg", alt: "YouTube Analytics",
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
    <main>
      {/* ── NAVBAR ── */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="nav-logo">REHAN<span>.</span></div>

        <div className="desktop-links">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={activeSection === href.slice(1) ? "active" : ""}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <a href="mailto:youtech280@gmail.com" className="btn btn-orange nav-btn">
            Hire Me
          </a>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div className={`mobile-drawer${menuOpen ? " open" : ""}`}>
        <div className="mobile-drawer-links">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={closeMenu}>{label}</Link>
          ))}
          <a href="mailto:youtech280@gmail.com" className="btn btn-orange drawer-hire" onClick={closeMenu}>
            Hire Me ↗
          </a>
        </div>
      </div>
      {menuOpen && <div className="drawer-overlay" onClick={closeMenu} />}

      {/* ── 1. HERO ── */}
      <section className="hero section-light">
        <div className="container hero-container">
          <div className="hero-text-col">
            <div className="hero-greeting reveal delay-1">Rehan Kadri | Pipeline Specialist</div>
            <h1 className="hero-title reveal delay-2">
              Scale Your B2B <span className="text-orange">Revenue</span><br />
              With Predictable <span className="text-orange">Pipelines</span>
            </h1>
            <p className="hero-subtitle reveal delay-3">
              I engineer organic systems that turn cold search traffic into booked calls and enterprise clients. Stop burning cash on ads and start building compounding, data-driven growth.
            </p>
            <div className="hero-cta reveal delay-3">
              <Link href="#contact" className="btn btn-orange">Book Strategy Call ↗</Link>
              <Link href="#proofs" className="btn btn-white">See Real Results</Link>
            </div>
            
          </div>

          <div className="hero-portrait-col reveal delay-2">
            <div className="premium-circle-wrapper">
              <Image src="/rehan.png" alt="Rehan Kadri" width={500} height={600} priority className="premium-portrait-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PROBLEM & SOLUTION ── */}
      <section className="section-dark section-padding problem-section">
        <div className="container">
          <div className="problem-panel reveal">
            <div className="problem-intro">
              <span className="section-label">The Gap</span>
              <h2 className="problem-title">
                Traffic without <span className="text-orange">conversion</span> wastes budget.
              </h2>
              <p className="problem-lead">
                More visibility means very little if it does not create qualified pipeline.
              </p>
            </div>

            <div className="problem-cards">
              <article className="problem-mini-card">
                <span className="problem-mini-label">What goes wrong</span>
                <p>
                  Teams buy traffic, publish content, and still end up with weak lead quality and no reliable system.
                </p>
              </article>

              <article className="problem-mini-card problem-mini-card-accent">
                <span className="problem-mini-label">What I build</span>
                <p>
                  A connected growth pipeline that attracts the right audience, builds trust through SEO, content, and social media, and turns intent into qualified leads and booked calls.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. WHAT I DO ── */}
      <section id="services" className="section-gray section-padding services-section-compact">
        <div className="container">
          <div className="services-premium-header reveal">
            <div className="services-premium-copy">
              <span className="section-label">Growth Systems</span>
              <h2 className="section-title">
                Revenue-First <span className="text-orange">Growth Systems</span>
              </h2>
              <p className="section-desc">
                Three systems to attract better leads, build authority, and turn traffic into pipeline.
              </p>
            </div>

            <div className="services-premium-note">
              <span className="services-note-label">Built for premium positioning</span>
              <p>
                Designed to make your business easier to find, trust, and buy from.
              </p>
            </div>
          </div>

          <div className="services-premium-grid">
            {[
              {
                num: "01",
                label: "Search Demand",
                title: "SEO & Organic Growth Systems",
                desc: "Get in front of buyers already searching for your solution.",
                outcomes: [
                  "Rank for buyer-intent keywords",
                  "Strong technical SEO foundation",
                  "Compounding inbound traffic",
                ],
              },
              {
                num: "02",
                label: "Pipeline Design",
                title: "B2B Lead Generation Systems",
                desc: "Connect outreach, funnels, and conversion into one lead engine.",
                outcomes: [
                  "LinkedIn plus inbound strategy",
                  "High-converting pages and funnels",
                  "Consistent pipeline for sales",
                ],
              },
              {
                num: "03",
                label: "Authority Engine",
                title: "Content, Video & Social Growth Systems",
                desc: "Use content to build trust and bring in inbound demand.",
                outcomes: [
                  "YouTube and retention-focused video",
                  "LinkedIn and content distribution",
                  "Shorter sales cycles through trust",
                ],
              },
            ].map(({ num, label, title, desc, outcomes }, i) => (
              <article className={`service-premium-card reveal delay-${i + 1}`} key={num}>
                <div className="service-premium-top">
                  <div className="service-number-badge">{num}</div>
                  <div className="service-premium-label">{label}</div>
                </div>

                <div className="service-content premium-service-content">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>

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
                  <div className="service-arrow-modern">↗</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4.5. GROWTH PATHS ── */}
      <section className="section-light section-padding growth-paths-section">
        <div className="container">
          <div className="growth-paths-header reveal">
            <span className="section-label">How Can I Help</span>
            <h2 className="section-title">
              Choose Your <span className="text-orange">Growth Path</span>
            </h2>
            <p className="section-desc">
              Pick the outcome you want first. Then build the system around it.
            </p>
          </div>

          <div className="growth-paths-grid">
            {[
              {
                eyebrow: "For Founders & B2B Teams",
                choice: "I need qualified B2B pipeline",
                title: "Build a Predictable Revenue Pipeline",
                image: "/business path card img 2.png",
                alt: "Business growth path illustration",
                summary: "Turn scattered growth into a system that brings in qualified buyers instead of random traffic.",
                outcome: "More qualified leads. More booked calls. Less guesswork.",
                points: [
                  "Rank for high-intent keywords that convert",
                  "Build inbound plus outbound lead systems",
                  "Generate consistent booked calls",
                ],
                fit: "SaaS, agencies, and high-ticket service businesses",
                cta: "Build My Growth System",
                frameLabel: "Business Track",
                theme: "business",
              },
              {
                eyebrow: "For Creators & Freelancers",
                choice: "I need better clients and positioning",
                title: "Turn Skills Into Consistent Clients",
                image: "/freelancer img.png",
                alt: "Freelancer growth path illustration",
                summary: "Build a stronger personal brand and inbound system so better clients come to you with less chasing.",
                outcome: "Better positioning. Better inbound leads. Better deal quality.",
                points: [
                  "Grow on LinkedIn and YouTube strategically",
                  "Position yourself as a niche authority",
                  "Close higher-value deals with positioning",
                ],
                fit: "Freelancers, creators, and personal brands",
                cta: "Grow My Personal Brand",
                frameLabel: "Creator Track",
                theme: "creator",
              },
            ].map(({ eyebrow, choice, title, image, alt, summary, outcome, points, fit, cta, frameLabel, theme }, index) => (
              <article className={`growth-path-card growth-path-card-${theme} reveal delay-${index + 1}`} key={title}>
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
                      <Image src={image} alt={alt} width={900} height={720} className="growth-path-image" />
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
                    <Link href="#contact" className="btn btn-orange growth-path-cta">
                      {cta} ↗
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CASE STUDIES ── */}
      <section id="works" className="section-light section-padding">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Case Studies</span>
            <h2 className="section-title">Predictable <span className="text-orange">Outcomes</span></h2>
            <p className="section-desc">Data-backed examples of how my systems transition stagnant metrics into exponential revenue growth.</p>
          </div>
          <div className="proof-showcase-list">
            {caseStudies.map(({ img, alt, tag, h3, p, proofShots, features }, i) => (
              <div className={`proof-showcase-row reveal delay-${(i % 3) + 1}`} key={i}>
                <div className="proof-showcase-img-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={alt} />
                  {proofShots ? (
                    <div className="proof-shot-grid">
                      {proofShots.map((shot) => (
                        <div className="proof-shot-card" key={shot.img}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={shot.img} alt={shot.alt} />
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
          <div className="section-header reveal">
            <span className="section-label">Undeniable Proof</span>
            <h2 className="section-title">The Data <span className="text-orange">Behind The Systems</span></h2>
            <p className="section-desc">Raw backend analytics verifying exponential growth trajectories.</p>
          </div>
          <div className="proof-showcase-list">
            {visualProofItems.map(({ img, alt, tag, h3, p, proofShots, features }, i) => (
              <div className={`proof-showcase-row reveal delay-${(i % 3) + 1}`} key={i}>
                <div className="proof-showcase-img-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={alt} />
                  {proofShots ? (
                    <div className="proof-shot-grid">
                      {proofShots.map((shot) => (
                        <div className="proof-shot-card" key={shot.img}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={shot.img} alt={shot.alt} />
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

      {/* ── 7. MY SYSTEM ── */}
      <section id="process" className="section-gray section-padding process-section">
        <div className="container">
          <div className="process-header reveal">
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
            ].map(({ step, tag, title, desc }, i) => (
              <article className={`process-stage-card reveal delay-${i + 1}`} key={step}>
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
          <div className="hire-image-wrapper reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rehan.png" alt="Rehan Kadri" className="hire-img" />
          </div>
          <div className="hire-content reveal delay-1">
            <span className="section-label">The Architect</span>
            <h2 className="section-title">Who Is <span className="text-orange">Rehan Kadri?</span></h2>
            <p className="section-desc" style={{ marginBottom: "1.5rem", color: "var(--text-dark)", fontWeight: 700 }}>
              I am Rehan Kadri, a growth marketer focused on building systems that turn traffic into real revenue.
            </p>
            <p className="section-desc" style={{ marginBottom: "2.5rem" }}>
              I started by experimenting with content and quickly realized that traffic alone does not matter. What matters is building a complete pipeline that attracts the right audience, builds trust, and converts them into qualified leads.
              <br /><br />
              I have scaled organic traffic to over 1M monthly visitors and built a YouTube audience of 33K subscribers using content and retention strategies. At Fuzen.io, I worked across the full growth funnel from SEO and content to LinkedIn and B2B lead generation.
              <br /><br />
              My approach is simple. Build systems, not hacks. Focus on intent, not vanity metrics. Create growth that compounds over time.
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
          <div className="section-header reveal" style={{ textAlign: "center", marginBottom: "3rem", margin: "0 auto 3rem auto" }}>
            <span className="section-label">Client Feedback</span>
            <h2 className="section-title">The <span className="text-orange">Consensus</span></h2>
          </div>
          <div className="reveal" style={{ maxWidth: "800px", margin: "0 auto 4rem", background: "white", padding: "3.5rem", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", textAlign: "center", border: "1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ color: "var(--brand-orange)", fontSize: "2rem", marginBottom: "1.5rem" }}>★★★★★</div>
            <p style={{ fontSize: "1.2rem", color: "var(--text-dark)", fontStyle: "italic", lineHeight: "1.8", marginBottom: "2rem", fontWeight: "500" }}>
              &quot;Rehan completely transformed our growth systems at Fuzen.io. He didn&apos;t just improve our SEO, he built a pipeline that actually brings in qualified leads.
              <br /><br />
              Our website traffic scaled significantly through his SEO strategy, and more importantly, it started converting. On top of that, his YouTube approach helped our videos rank higher and bring in consistent inbound interest.
              <br /><br />
              What stood out was his focus on systems. Everything was connected, from search to content to conversion. The results were clear in both traffic and lead quality.&quot;
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", maxWidth: "360px", margin: "0 auto" }}>
              <div style={{ textAlign: "left" }}>
                <strong style={{ display: "block", color: "var(--text-dark)", fontSize: "1.1rem" }}>Pushkar Gaikwad</strong>
                <span style={{ color: "var(--text-gray)", fontSize: "0.9rem", marginTop: "0.35rem", display: "block" }}>Founder, Fuzen.io</span>
              </div>
              <Image
                src="/pushkar.webp"
                alt="Pushkar Gaikwad"
                width={64}
                height={64}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,90,54,0.12)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                  flexShrink: 0,
                }}
              />
            </div>
          </div>
        </div>

        <div className="marquee-container reveal fade-in" style={{ padding: "2rem 0" }}>
          <div className="marquee-track">
            <div className="marquee-content">
              {["B2B Lead Generation", "Organic CRO", "SEO Architecture", "Video Marketing", "Data Analytics",
                "B2B Lead Generation", "Organic CRO", "SEO Architecture", "Video Marketing", "Data Analytics"].map((t, i) => (
                <div className="marquee-item" key={i}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CTA SECTION ── */}
      <section className="section-dark cta-section">
        <div className="container">
          <div className="cta-panel reveal">
            <div className="cta-copy">
              <span className="section-label">Final CTA</span>
              <h2 className="cta-title">
                Stop <span className="cta-muted">guessing.</span><br />
                Start <span className="text-orange">scaling.</span>
              </h2>
              <p className="cta-text">
                I will audit your growth system and map the fastest route to qualified pipeline.
              </p>
              <Link href="#contact" className="btn btn-orange cta-button">
                Build My System ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. CONTACT SECTION ── */}
      <section id="contact" className="contact-section section-padding">
        <div className="container contact-container reveal fade-in">
          <div className="contact-grid">
            
            {/* Left Column: Premium Copy */}
            <div className="contact-copy">
              <span className="section-label">Get In Touch</span>
              <h2 className="section-title">Ready to <span className="text-orange">Scale Your Revenue?</span></h2>
              <p className="contact-desc">
                Stop leaving money on the table. Let&apos;s architect a custom growth pipeline that consistently converts your cold traffic into enterprise clients.
              </p>
              
              <div className="contact-benefits">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: "28px", height: "28px", color: "var(--brand-orange)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <div>
                    <h4>Data-Driven Strategy</h4>
                    <p>No guesswork. Every campaign is backed by hard metrics and compounding SEO data.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "28px", height: "28px", color: "var(--brand-orange)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <div>
                    <h4>Rapid Execution</h4>
                    <p>Fluid timelines with aggressive A/B testing to ensure the fastest time to ROI.</p>
                  </div>
                </div>
              </div>

              <div className="contact-direct">
                <p>Prefer direct email?</p>
                <a href="mailto:youtech280@gmail.com" className="direct-email">youtech280@gmail.com</a>
                <p style={{ marginTop: "0.9rem" }}>GitHub</p>
                <a
                  href="https://github.com/rehan280/therehankadri.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="direct-email"
                >
                  github.com/rehan280/therehankadri
                </a>
              </div>
            </div>

            {/* Right Column: Glassmorphism Form */}
            <div className="contact-form-wrapper">
              <div className="form-glass-card">
                <form className="contact-form" onSubmit={onContactSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" className="form-input" placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Work Email</label>
                    <input type="email" id="email" name="email" className="form-input" placeholder="john@company.com" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" className="form-textarea" placeholder="Tell me about your project bounds..." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-orange form-submit-btn">Send Message ↗</button>
                  {formResult && <div className="form-status">{formResult}</div>}
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-wrapper reveal">
            <div className="footer-left">
              <div className="nav-logo footer-logo">REHAN<span>.</span></div>
              <p className="footer-tagline">Growth Marketer &amp; Pipeline Specialist</p>
            </div>
            <div className="footer-right">
              <p className="footer-cta-label">Ready to scale?</p>
              <a href="mailto:youtech280@gmail.com" className="btn btn-orange">Let&apos;s Discuss ↗</a>
            </div>
          </div>
          <div className="footer-bottom reveal">
            <p>© 2026 Rehan Firoz Kadri. All Rights Reserved.</p>
            <div className="footer-socials">
              <a href="mailto:youtech280@gmail.com">Email</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://github.com/rehan280/therehankadri.git" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
