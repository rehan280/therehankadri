import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
} from "lucide-react";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import { SITE_URL, buildAbsoluteImageUrl, buildCanonicalUrl, createPageMetadata } from "@/lib/seo";
import blogStyles from "../blog/blog.module.css";
import aboutStyles from "./about.module.css";

const canonicalUrl = buildCanonicalUrl("/about");

const tableOfContentsItems = [
  { id: "who-am-i", title: "So, who am I?" },
  { id: "what-youll-find-here", title: "What you'll find here" },
  { id: "why-trust-me", title: "Why trust me?" },
  { id: "ready-to-grow", title: "Ready to grow?" },
];

const socialLinks = {
  linkedin: "https://www.linkedin.com/in/therehankadri/",
  instagram: "https://www.instagram.com/therehankadri/",
  youtube: "https://youtube.com/@rehanous?si=FDWGeBZ6MtP6oUcK",
  x: "https://x.com/rehanous",
};

function buildAboutHeroLines() {
  return [
    "Want higher",
    "rankings and more",
    "traffic?",
  ];
}

function getAboutHeroLineClass(index: number, total: number) {
  if (total <= 1) return aboutStyles.heroTitleLineSingle;
  if (index === 0) return aboutStyles.heroTitleLineTop;
  if (index === total - 1) return aboutStyles.heroTitleLineBottom;
  return aboutStyles.heroTitleLineMiddle;
}

export const metadata: Metadata = createPageMetadata({
  title: "About Rehan Kadri | SEO & Growth Strategist",
  description:
    "Learn more about Rehan Kadri, the growth marketer behind tested SEO, content, and audience growth systems used to scale Rehanous.com to 1M+ monthly organic visitors.",
  path: "/about",
  type: "profile",
  imageAlt: "Growth proof from The Rehan Kadri",
  keywords: [
    "about Rehan Kadri",
    "Rehan Kadri",
    "growth marketer",
    "SEO strategist",
    "content marketing",
    "social media growth",
    "YouTube growth",
    "AI marketing workflows",
  ],
});

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Rehan Kadri",
  url: canonicalUrl,
  description:
    "About Rehan Kadri, a growth marketer and SEO strategist sharing tested growth systems across SEO, content, social media, and AI-powered marketing workflows.",
  mainEntity: {
    "@type": "Person",
    name: "Rehan Kadri",
    url: SITE_URL,
    image: buildAbsoluteImageUrl("/rehan.png"),
    description:
      "Growth Marketer. SEO nerd. And the guy who tests marketing strategies so you don't have to.",
    jobTitle: "Growth Marketer",
    worksFor: {
      "@type": "Organization",
      name: "Fuzen.io",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Sandip University",
    },
    sameAs: [
      socialLinks.linkedin,
      socialLinks.instagram,
      socialLinks.youtube,
      socialLinks.x,
    ],
    knowsAbout: [
      "SEO",
      "Content marketing",
      "Social media growth",
      "YouTube growth",
      "Instagram growth",
      "LinkedIn growth",
      "AI-powered marketing workflows",
    ],
  },
  publisher: {
    "@type": "Organization",
    name: "The Rehan Kadri",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: buildAbsoluteImageUrl("/favicon/web-app-manifest-512x512.png"),
    },
  },
};

export default function AboutPage() {
  const aboutHeroLines = buildAboutHeroLines();

  return (
    <main className={`${blogStyles.page} ${blogStyles.postPage}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutPageJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section
        className={`${blogStyles.hero} ${blogStyles.postHero} ${aboutStyles.aboutHero}`}
      >

        <div className={`${blogStyles.heroInner} ${aboutStyles.heroInner}`}>
          <div className={aboutStyles.heroGrid}>
            <div className={aboutStyles.heroCopyBlock}>
              <h1 className={aboutStyles.heroTitle}>
                {aboutHeroLines.map((line, index) => (
                  <span
                    key={line}
                    className={`${aboutStyles.heroTitleLine} ${getAboutHeroLineClass(index, aboutHeroLines.length)}`}
                  >
                    {line}
                  </span>
                ))}
              </h1>

              <div className={aboutStyles.heroText}>
                <p>
                  This blog is where I share everything I&apos;ve learned from
                  building real brands, ranking websites, and growing audiences
                  from zero.
                </p>
                <p>Not theory. Actual stuff I tested myself.</p>
              </div>
            </div>

            <div className={aboutStyles.heroVisual}>
              <div className={aboutStyles.heroChart} aria-hidden="true">
                <div className={aboutStyles.heroChartFrame}>
                  <div className={aboutStyles.heroChartWindow}>
                    <span className={aboutStyles.heroChartDotOrange} />
                    <span className={aboutStyles.heroChartDotAmber} />
                    <span className={aboutStyles.heroChartDotGreen} />
                    <span className={aboutStyles.heroChartWindowLabel}>
                      search-console-proof
                    </span>
                  </div>

                  <div className={aboutStyles.heroMetricGrid}>
                    <div
                      className={`${aboutStyles.heroMetricCard} ${aboutStyles.heroMetricClicks}`}
                    >
                      <div className={aboutStyles.heroMetricTop}>
                        <span className={aboutStyles.heroMetricCheck}>
                          <Check size={13} strokeWidth={3} />
                        </span>
                        <span className={aboutStyles.heroMetricLabel}>
                          Total Clicks
                        </span>
                      </div>
                      <strong className={aboutStyles.heroMetricValue}>
                        4.12M
                      </strong>
                      <span className={aboutStyles.heroMetricHint}>
                        Verified organic click volume
                      </span>
                    </div>

                    <div
                      className={`${aboutStyles.heroMetricCard} ${aboutStyles.heroMetricImpressions}`}
                    >
                      <div className={aboutStyles.heroMetricTop}>
                        <span className={aboutStyles.heroMetricCheck}>
                          <Check size={13} strokeWidth={3} />
                        </span>
                        <span className={aboutStyles.heroMetricLabel}>
                          Total Impressions
                        </span>
                      </div>
                      <strong className={aboutStyles.heroMetricValue}>
                        56.9M
                      </strong>
                      <span className={aboutStyles.heroMetricHint}>
                        Search visibility at scale
                      </span>
                    </div>
                  </div>

                </div>

                <div className={aboutStyles.heroInfoBand}>
                  <div className={aboutStyles.heroStats}>
                    <span className={aboutStyles.heroStat}>
                      <span className={aboutStyles.heroStatIcon} aria-hidden="true">
                        <svg viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 11.5L6.1 8.4L8.4 10.7L13 6.1"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.6 6H13.1V8.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span>1M+ Organic Visitors</span>
                    </span>
                    <span className={aboutStyles.heroStat}>
                      <span className={aboutStyles.heroStatIcon} aria-hidden="true">
                        <svg viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 12.5V8.75"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M7 12.5V5.75"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M11 12.5V3.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M2.5 12.5H13.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span>100K+ Followers</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={blogStyles.postSection}>
        <div className={blogStyles.postShell}>
          <div className={blogStyles.postGrid}>
            <aside className={blogStyles.sidebar}>
              <div className={blogStyles.sidebarStack}>
                <BlogTableOfContents items={tableOfContentsItems} />
              </div>
            </aside>

            <article className={`${blogStyles.articleCopy} authority-post-copy`}>
              <div className={blogStyles.articleProse}>
                <section
                  id="who-am-i"
                  className={blogStyles.articleSection}
                >
                  <h2>So, who am I?</h2>
                  <p>
                    I&apos;m Rehan Kadri. Growth Marketer. SEO nerd. And the guy
                    who tests marketing strategies so you don&apos;t have to.
                  </p>
                  <p>
                    By day, I work as a Growth Marketer at Fuzen.io, a no-code
                    SaaS startup. By night (and weekends), I run my own
                    marketing agency helping brands grow through SEO, content,
                    and social media strategy.
                  </p>
                  <p>
                    I&apos;m also finishing up my BTech in Computer Science at
                    Sandip University. (Yes, I&apos;m doing all three at once.
                    Sleep is optional.)
                  </p>
                </section>

                <section
                  id="what-youll-find-here"
                  className={blogStyles.articleSection}
                >
                  <h2>What you&apos;ll find here</h2>
                  <p>
                    This blog covers the stuff that actually moves the needle:
                  </p>
                  <ul className={blogStyles.articleList}>
                    <li>
                      SEO strategies that get pages to rank without black-hat
                      shortcuts
                    </li>
                    <li>
                      Content marketing that brings in leads, not just pageviews
                    </li>
                    <li>
                      Social media growth playbooks for Instagram, LinkedIn, and
                      YouTube
                    </li>
                    <li>AI-powered marketing tools and workflows for 2026</li>
                  </ul>
                  <p>
                    Here&apos;s the kicker: everything I publish is something
                    I&apos;ve personally tried, tested, or built from scratch.
                  </p>
                  <p>
                    No recycled listicles. No padded word counts to hit a quota.
                  </p>
                  <p>Just the real playbook.</p>
                </section>

                <section
                  id="why-trust-me"
                  className={blogStyles.articleSection}
                >
                  <h2>Why trust me?</h2>
                  <p>Fair question.</p>
                  <p>Here&apos;s what I&apos;ve done:</p>
                  <ul className={blogStyles.articleList}>
                    <li>
                      Scaled a content site to 1M+ monthly organic visitors.
                    </li>
                    <li>Grew a social media account to 100K+ followers.</li>
                    <li>
                      Doubled YouTube subscriber counts with a 150% jump in
                      watch time.
                    </li>
                  </ul>
                  <p>
                    I&apos;ve also worked hands-on with SaaS brands, built
                    outreach systems that land replies, and written SEO content
                    that ranks in competitive markets.
                  </p>
                  <p>
                    The truth is, most people teaching marketing have never
                    actually done it at scale. I have. That&apos;s the
                    difference.
                  </p>
                </section>

                <section
                  id="ready-to-grow"
                  className={blogStyles.articleSection}
                >
                  <h2>Ready to grow?</h2>
                  <p>Browse the blog. Pick a topic. Start reading.</p>
                  <p>
                    And if you want to work together directly, you know where to
                    find me.
                  </p>
                  <p>Let&apos;s dive right in.</p>
                </section>
              </div>

              <section className={aboutStyles.ctaSection}>
                <div className={aboutStyles.ctaLead}>
                  <span className={aboutStyles.ctaEyebrow}>Start here</span>
                  <h3>Browse the blog. Pick a topic. Start reading.</h3>
                </div>
                <div className={aboutStyles.ctaBody}>
                  <p>
                    Dive into the playbooks first. If you want help applying
                    them to your brand, book a strategy call and we&apos;ll map
                    out the next move together.
                  </p>
                  <div className={aboutStyles.ctaActions}>
                    <Link
                      href="/blog"
                      prefetch
                      className={aboutStyles.ctaPrimaryLink}
                    >
                      <span>Read the blog</span>
                      <ArrowUpRight size={17} strokeWidth={2.2} />
                    </Link>
                    <Link
                      href="/contact"
                      prefetch
                      className={aboutStyles.ctaSecondaryLink}
                    >
                      <span>Book a strategy call</span>
                      <ArrowUpRight size={17} strokeWidth={2.2} />
                    </Link>
                  </div>
                  <span className={aboutStyles.ctaNote}>
                    SEO, content, social growth, and systems that actually
                    compound.
                  </span>
                </div>
              </section>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}




