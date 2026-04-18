---
name: seo-growth-bible
description: >
  SEO playbook covering keyword research, content strategy, on-page optimization, technical SEO,
  link building, site architecture, Core Web Vitals, E-E-A-T, programmatic SEO, competitor
  analysis, CRO, rank tracking, GEO (Generative Engine Optimization), LLM Seeding, AI Overviews,
  and entity SEO. Use for any SEO question or growth challenge. Trigger for: "grow my traffic,"
  "rank on Google," "SEO audit," "get backlinks," "technical SEO," "content strategy,"
  "improve rankings," "organic traffic," "rank in AI search," "get cited by ChatGPT,"
  "LLM visibility," "AI Overviews," "GEO strategy," or any mention of Google, rankings, SERP,
  domain authority, or search engine optimization. Always use this skill even for simple SEO
  questions — it contains deep playbooks and frameworks that dramatically elevate output quality.
---

# SEO Growth Bible
### 0 to 1,000,000 Monthly Organic Visitors — The Complete Playbook (2026 Edition)
#### Now includes: GEO · LLM Seeding · AI Overviews · Seen & Trusted Framework · Entity SEO

---

## HOW TO USE THIS SKILL

This skill is organized in **two layers**:

1. **This file** — Strategic frameworks, decision trees, and actionable checklists for every major SEO domain. Answer most questions directly from here.
2. **Reference files** — Deep-dive playbooks. Load these when the user needs step-by-step execution or expert-level depth on a specific topic:
   - `references/technical-seo.md` — Core Web Vitals, schema, crawl budget, log files, mobile-first
   - `references/content-creation.md` — Skyscraper Technique, long-form frameworks, E-E-A-T, on-page SEO, content formatting
   - `references/link-building.md` — Digital PR, guest posting, HARO, broken links, tiered links, co-citations
   - `references/growth-scaling.md` — Month-by-month roadmap, programmatic SEO, CRO, KPI dashboards
   - `references/ai-seo.md` — GEO, LLM Seeding, AI Overviews, Seen & Trusted Framework, entity SEO, AI visibility tracking

**Rule:** Always diagnose the user's site stage (0–10K, 10K–100K, 100K–1M) before prescribing tactics. Different stages require radically different priorities.

---

## PART 1 — FOUNDATION & STRATEGY

### 1.1 Site Architecture

The goal: every page reachable in ≤3 clicks from the homepage. Every orphan page is wasted crawl budget.

**Silo Architecture (preferred for authority sites):**
```
Homepage
├── Pillar Page: "Topic A" (broad, 3K–5K words)
│   ├── Cluster: Subtopic A1
│   ├── Cluster: Subtopic A2
│   └── Cluster: Subtopic A3
├── Pillar Page: "Topic B"
│   └── ...
```
- Internal links flow UP to pillar pages and LATERALLY within clusters
- Never link from one silo to another at cluster level (cross-links dilute authority signals)
- Use breadcrumbs on every page — they're both UX and PageRank sculpting tools

**URL Structure Rules:**
- Flat is better: `/blog/keyword-slug/` not `/blog/category/subcategory/post/`
- Include target keyword in URL slug, keep it under 5 words
- No dates in URLs unless recency is a ranking factor (news sites)
- 301-redirect all legacy URLs before changing structure

**Crawlability Checklist:**
- [ ] `robots.txt` blocks only staging, admin, and duplicate content — not CSS/JS
- [ ] Do NOT block AI crawlers (Googlebot-Extended, GPTBot, PerplexityBot) unless intentional — blocking them removes you from AI search
- [ ] XML sitemap submitted to GSC, auto-updated by CMS
- [ ] No `noindex` on pages you want ranked
- [ ] Canonical tags on all paginated, filtered, and duplicate URLs
- [ ] Internal search results pages blocked from indexing
- [ ] Hreflang implemented if multilingual

---

### 1.2 Keyword Research Frameworks

**The Three-Layer Funnel:**

| Layer | Intent | Volume | Difficulty | Purpose |
|-------|--------|--------|------------|---------| 
| TOFU (Top) | Informational | High | High | Brand awareness, email capture |
| MOFU (Middle) | Investigational | Medium | Medium | Nurture, comparisons, guides |
| BOFU (Bottom) | Transactional | Low | Low | Direct conversions |

**Step-by-Step Keyword Research Process:**

1. **Seed Keywords** — Brainstorm 10–20 core topics your audience cares about
2. **Competitor Mining** — Run competitor domains through Ahrefs Site Explorer → "Top Pages" → steal their top 50 keywords
3. **Gap Analysis** — Use Ahrefs "Content Gap" or Semrush "Keyword Gap" — find keywords competitors rank for that you don't
4. **Long-Tail Expansion** — Use "Also rank for," "Related searches," and "People Also Ask" to build clusters of 20–50 keywords per topic
5. **Intent Classification** — Tag each keyword: Informational / Navigational / Commercial / Transactional
6. **Prioritization Matrix:**
   - Score = (Search Volume × Business Value) ÷ Keyword Difficulty
   - Rank and build content queue from highest score down
7. **Hidden Gems Filter** — Look for KD <30, Volume >500, with weak DR40 or below pages ranking — these are your quick wins
8. **AI Prompt Keywords** — Beyond traditional keywords, identify how users phrase questions to AI tools: "What's the best X for Y use case?" These are longer, conversational, context-rich. Optimize content to match these prompt patterns.

**Brian Dean's Keyword Golden Ratio (KGR):**
- KGR = (Allintitle results) ÷ (Monthly Search Volume)
- KGR < 0.25 = fast-ranking opportunity
- Use for new sites with no authority yet

---

### 1.3 Competitor Analysis

**The 5-Step Competitor Teardown:**

1. **Identify True SERP Competitors** — Search your 5 most important keywords. The ranking pages ARE your competitors (not your business competitors)
2. **Authority Gap** — Compare your DR vs. theirs in Ahrefs. DR gap >20 means you need content + links before competing on head terms
3. **Content Gap** — Every keyword they rank for that you don't = content opportunity
4. **Backlink Gap** — Domains linking to competitors but not you = outreach list
5. **Traffic Velocity** — Use Ahrefs "Traffic History" to spot whether competitors are growing or declining. Target declining competitors' keywords
6. **AI Visibility Gap (NEW)** — Use Semrush AI Visibility Toolkit or Profound to check if competitors appear in ChatGPT/Perplexity answers where you don't

**Competitor Intelligence Stack:**
- Ahrefs: Backlinks, organic keywords, content top pages
- Semrush: Advertising keywords (reveals commercial intent), traffic trends, AI Visibility Toolkit
- SparkToro: Audience overlap — where competitor's audience spends time online
- SimilarWeb: Traffic source breakdown (what % is organic vs paid)
- Profound / Semrush AI Toolkit: LLM citation tracking, prompt-level brand visibility

---

### 1.4 Topic Cluster & Content Pillar Strategy

**The Hub-and-Spoke Model (HubSpot / Moz validated):**

- **Pillar Page** = comprehensive overview of a broad topic (target: 3,000–5,000 words)
  - Example: "The Complete Guide to Email Marketing"
- **Cluster Pages** = deep dives on subtopics that link BACK to pillar
  - Examples: "Email Subject Line Best Practices," "How to Build an Email List," "Email Segmentation Strategy"
- **Internal Link Rule:** Every cluster page links to the pillar. The pillar links out to every cluster.

**Pillar Page Formula:**
1. Target a broad keyword (Volume: 5K–50K/mo)
2. Answer every major sub-question in a dedicated H2 section
3. Include a linkable asset (original data, tool, template, infographic)
4. Make it the best resource on the internet for that topic
5. Write context-inclusive copy: every sentence should stand alone and make sense when pulled by an AI
6. Update every 6–12 months

---

## PART 2 — ON-PAGE SEO & CONTENT FORMATTING

### 2.1 Core On-Page Optimization

**Title Tag Formula:**
`[Primary Keyword] — [Compelling Benefit/Modifier] | [Brand]`
- Keep under 60 characters
- Front-load the keyword
- Use numbers, brackets, or power words: "Complete Guide," "7 Steps," "[2026]"
- Add Title Tag Modifiers to capture long-tail variants (e.g., "for beginners," "step by step," "free template")

**Meta Description Formula:**
- 150–160 characters
- Include primary keyword naturally
- Add a CTA: "Learn how to…", "Discover the…", "Get the full breakdown"
- NOT a ranking factor, but affects CTR which IS

**Header Structure:**
- H1: Exact or close variant of primary keyword (ONE per page)
- H2s: Major sections, include secondary keywords
- H3s: Sub-points, LSI keywords and long-tail variants
- Never skip levels (H1 → H3 without an H2)

**Content Optimization Checklist:**
- [ ] Primary keyword in first 100–150 words
- [ ] LSI keywords used naturally throughout (find with Clearscope, Surfer, or Google's "Related Searches")
- [ ] Images have descriptive alt text with keyword where natural
- [ ] Target word count matches or exceeds average of top 3 ranking pages
- [ ] Table of contents for posts >2,000 words (also triggers sitelinks)
- [ ] Author bio with credentials (E-E-A-T signal)
- [ ] Last-updated date visible
- [ ] FAQ section targeting PAA questions (add FAQPage schema)
- [ ] Internal links to 3–5 relevant cluster pages
- [ ] Outbound links to authoritative sources (signals topical authority)
- [ ] Keyword used in at least one H2 or H3

---

### 2.2 Content Formatting for Scannability (Ahrefs + Backlinko Best Practices)

**Why formatting matters:** Most users don't read from start to finish. They scan. Good formatting keeps them on the page and signals quality to both humans and AI.

**The PSP Introduction Formula (Ahrefs):**
1. **Problem** — State the challenge the reader faces
2. **Solution** — Present your answer briefly (1–2 sentences)
3. **Proof** — Show why they should trust you (data point, experience, case study)
Total length: 2 paragraphs max. This also creates space for an above-the-fold image.

**Blog Post Format Matching (Search Intent Alignment):**
- Check the dominant format in the top 10 SERPs for your keyword:
  - Listicle? → Write a listicle
  - How-to guide? → Write step-by-step
  - Expanded definition ("What is X")? → Lead with definition, add FAQ + schema
  - Review? → Follow Google's review guidelines; include pros/cons, firsthand experience
- Format is not a rule but a strong signal — you can differentiate on angle within the format

**Formatting Elements That Help Rankings:**
- **Bold text** — Google's John Mueller confirmed bolding helps understand paragraph meaning. Use for key terms, not decorative emphasis.
- **Short paragraphs** — 2–3 sentences max. Makes mobile reading easy and stops pogo-sticking.
- **Numbered lists** — Use for chronological steps (things that must be in order)
- **Bullet points** — Use for non-chronological tips, features, or options
- **Tables** — Ideal for comparisons; AI systems extract tabular data easily
- **Images** — Some SERPs pull images from articles; include relevant images with descriptive filenames and alt text
- **Checklists** — High engagement; repurpose as downloadable PDFs or Twitter/X posts

**Formatting for AI Extractability (GEO + on-page hybrid):**
- Write clear, self-contained sentences AI can pull into answers without additional context (called "context-inclusive copy")
- Don't bury key insights in long paragraphs — surface them in subheadings or callout boxes
- Use numbered steps and clear transitions for processes — AI pulls individual steps when users ask for specific instructions
- Include direct quotes or statistics with attribution — pages with stats/quotes show 30–40% higher visibility in AI answers
- Add clear summaries at the end of complex sections — AI looks for digestible explanations

**URL Best Practices:**
- Keep URLs short: `/keyword-slug` not `/category/subcategory/long-post-title`
- Include your target keyword in the URL
- Short, keyword-rich URLs get more clicks and correlate with higher rankings
- Don't change existing URLs unless broken — it causes technical SEO issues

---

## PART 3 — E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

Post-HCU (Helpful Content Update), E-E-A-T is non-negotiable. Lily Ray's research shows sites hit by HCU shared: thin authorship, no real-world experience signals, and trust gaps.

**E-E-A-T now serves a DUAL PURPOSE:**
1. Helps you rank in traditional Google search
2. Increases AI search visibility — LLMs cite authoritative sources; strong E-E-A-T signals signal to LLMs that your brand is trustworthy and worth quoting

Example: Backlinko's SEO strategy guide ranks for 100+ keywords AND appears as a cited source in Perplexity — because it's structured, experience-forward, and semantically complete.

**E-E-A-T Implementation Checklist:**
- [ ] Every article has a named author with a bio and credentials
- [ ] Author pages exist, link to social profiles and other publications
- [ ] "About Us" page clearly explains who the company is and why you're qualified
- [ ] Cite primary sources (studies, .gov, .edu) throughout content
- [ ] Include original quotes from real experts (adds Experience + Authoritativeness)
- [ ] Add "Fact-checked by" or "Reviewed by [Expert]" for YMYL topics
- [ ] Display trust signals: awards, press mentions, certifications, case studies
- [ ] Contact page, privacy policy, terms of service all present
- [ ] Structured data for `Article`, `Author`, `Organization`
- [ ] Include personal experience, firsthand results, or case studies — Google explicitly penalizes generic "AI-style" content that lacks real experience
- [ ] Make key points quotable: write clear, authoritative sentences that convey complete ideas on their own

**E-E-A-T and YMYL:**
- YMYL = Your Money, Your Life (finance, health, legal, safety topics)
- These require the highest E-E-A-T bar
- Formal credentials or deep expertise required for medical/legal/financial topics
- Everyday proficiency can qualify as expertise for other topics

**The 46-Point E-E-A-T Audit:**
Use the free Backlinko/Digitaloft E-E-A-T Evaluation Guide to audit your site, content, and authors. It covers signals from Google's Quality Rater Guidelines that most SEOs miss.

---

## PART 4 — LINK BUILDING (OVERVIEW)

> For full execution playbooks, load `references/link-building.md`

**2026 Mindset Shift:** Link building is no longer just about Google PageRank. You're optimizing for **comprehensive brand presence** — across search, AI search, social, and forums. Context beats the `<href>` tag. AI systems surface brands that appear across multiple trusted sources.

**Link Velocity Rule:** Earn links at a natural, accelerating pace. Sudden spikes followed by silence are a red flag. Aim for consistent monthly growth.

**The Link Value Hierarchy:**
1. Editorial links from high-DR relevant publications (most valuable)
2. Guest posts on niche-relevant sites (DR 40+) — goal is now mentions in trusted content, not just anchor text
3. Niche directory and resource page links
4. PR-generated links (news, data studies) — best for LLM citations too
5. Co-citations (brand mentioned alongside trusted brands even without a link)
6. Forum/community links (lowest value, but build entity associations in LLMs)

**Anchor Text Distribution (natural profile):**
- Branded anchors: 40–50%
- Generic ("click here," "learn more"): 20–25%
- Partial match keyword: 15–20%
- Exact match keyword: 5–10% MAX
- Naked URL: 5–10%

**Quick Wins (first 90 days):**
1. Reclaim unlinked brand mentions (Google: `"YourBrand" -site:yourdomain.com`)
2. Fix broken links on competitor resource pages — offer your content as replacement
3. Submit to 10–15 high-quality niche directories
4. Create one original data study (surveys, scraping, original research) — earns links passively AND gets cited by LLMs

**Outreach Principles (Ahrefs + Backlinko):**
- Average link outreach conversion: 1–5%. Scale to 100–1,000 prospects to generate meaningful links.
- Use scoped-shotgun approach: templates with dynamic personalization variables (Pitchbox, Buzzstream)
- Never use templated flattery — say something specific or nothing at all
- Make your outreach about THEM, not you — lead with what makes your content unique and how it helps their readers
- Build relationships before you ask — people do favors for friends, not strangers

**Name Your Strategies:**
Named tactics (e.g., "The Moving Man Method," "The Skyscraper Technique") get cited by name in blog posts, YouTube videos, and now LLM answers. Name your original methods — LLMs surface named techniques more readily.

---

## PART 5 — TECHNICAL SEO (OVERVIEW)

> For full checklists, load `references/technical-seo.md`

**The Technical SEO Priority Stack (in order):**
1. **Indexability** — Can Google find and index your pages?
2. **AI Crawlability** — Are AI bots (GPTBot, PerplexityBot) allowed to crawl? If not, you're invisible in AI search.
3. **Crawlability** — Is crawl budget being wasted?
4. **Core Web Vitals** — LCP <2.5s, INP <200ms, CLS <0.1
5. **Mobile-First** — 100% of ranking uses mobile version of your site
6. **Schema Markup** — Structured data for rich results (also helps AI parse your content)
7. **HTTPS** — Non-negotiable since 2014
8. **Log File Analysis** — Are bots actually crawling what you think?

**5 Technical Issues That Kill Rankings (fix first):**
1. Duplicate content without canonicals
2. Slow server response time (TTFB >600ms)
3. Redirect chains longer than 2 hops
4. Broken internal links (crawl with Screaming Frog monthly)
5. Thin pages (<300 words) that aren't intentionally short

**Schema for AI Visibility:**
- `FAQPage` schema (WordPress: RankMath or Yoast can auto-add) — increases LLM citations
- `Article` + `Author` schema — reinforces E-E-A-T signals for both Google and AI
- `HowTo` schema for step-by-step processes
- Serve content as rendered HTML — ChatGPT and Perplexity bots may not process JavaScript

---

## PART 6 — AI SEARCH & GEO (OVERVIEW)

> For complete AI SEO playbook, load `references/ai-seo.md`

AI search is changing how brands get discovered. Over 700 million people use ChatGPT weekly. Google's AI Mode has 100M+ monthly active users. AI-driven traffic is projected to surpass traditional search traffic by 2027–2028.

**Two New Disciplines:**

| Discipline | Goal | Core Strategy |
|-----------|------|---------------|
| **GEO** (Generative Engine Optimization) | Get cited in AI-generated answers | Structure + authority + AI-friendly content |
| **LLM Seeding** | Train LLMs to associate your brand with key topics | Cross-platform visibility, original POV, structured data |

**The Seen & Trusted Framework (Backlinko):**
AI systems surface brands based on two forces:
1. **Consensus** — Multiple independent sources agree about your brand/product
2. **Consistency** — The same information about your brand appears across all platforms

This means: your product descriptions, specs, and brand story must be identical across your website, Amazon, review sites, Reddit, YouTube, and social media.

**Signals AI Systems Use to Select Citations:**
- Strong rankings and domain authority (AI still leans on this)
- Detailed reviews on G2, Capterra, Trustpilot, Amazon
- Active, authentic community presence (Reddit, Quora, LinkedIn, Stack Overflow)
- Appearances in "best of" listicles (Forbes, Business Insider, TechRadar, NerdWallet)
- Third-party publication coverage from trusted domains
- Structured, extractable on-page content
- Original data and statistics
- Named, unique frameworks and methodologies

**Quick AI Visibility Wins:**
- Add `FAQPage` schema to all blog posts
- Write context-inclusive sentences (extractable without surrounding text)
- Create a unique take, methodology, or framework in your niche (name it!)
- Build a presence on G2 / Capterra / review platforms
- Participate authentically on Reddit, Quora, and LinkedIn — not promotional content
- Ensure brand info is consistent across all platforms
- Create a Wikipedia-style "About" page for your brand with structured data

---

## PART 7 — GROWTH ROADMAP (SUMMARY)

> For the full month-by-month plan, load `references/growth-scaling.md`

| Phase | Timeframe | Traffic Target | Primary Focus |
|-------|-----------|---------------|---------------|
| Foundation | Months 1–3 | 0 → 1K | Technical fixes, 10 pillar pages, first links |
| Momentum | Months 4–6 | 1K → 10K | Cluster content, guest posts, link velocity |
| Authority | Months 7–12 | 10K → 50K | Digital PR, programmatic SEO, CRO |
| Scale | Months 13–24 | 50K → 250K | Topic domination, partnerships, link magnets |
| Dominance | Months 25–36 | 250K → 1M | Brand building, UGC, automation, LLM seeding |

**The 80/20 Rule of SEO Growth:**
- 80% of your traffic will come from 20% of your pages — identify and double down on winners
- 80% of your links should support the 20% of pages that drive conversions

---

## PART 8 — DECISION TREES

### "Where do I start?" Decision Tree

```
Is the site brand new?
├── YES → Start with: technical foundation + 10 BOFU pages + local citations/directories
└── NO → Run a full audit first:
    ├── Has traffic dropped? → Penalty/algorithm check (GSC manual actions, core update timeline)
    ├── Traffic plateaued? → Content refresh + link velocity increase
    └── Growing but slow? → Competitor gap analysis + cluster content expansion
```

### "What content should I create next?" Decision Tree

```
Do you have any content ranking on page 2 or 3?
├── YES → Refresh and optimize THOSE pages first (fastest ROI)
└── NO → Prioritize by:
    ├── Low competition BOFU keywords (drives revenue)
    ├── Topic cluster gaps (builds pillar authority)
    └── Linkable assets (drives backlinks passively)
```

### "How do I show up in AI search?" Decision Tree

```
Are you currently cited by ChatGPT / Perplexity for your core topics?
├── NO → Start with:
│   ├── Audit robots.txt — are AI bots blocked?
│   ├── Add FAQPage schema to top posts
│   ├── Build G2/Capterra/review platform profiles
│   └── Identify top "best of" listicles in your niche — get into them
└── YES → Scale with:
    ├── LLM Seeding — original POVs, named frameworks
    ├── Cross-platform presence (Reddit, LinkedIn, YouTube)
    └── Track with Semrush AI Toolkit or Profound — monitor citation share
```

---

## PART 9 — TOOLS STACK

| Category | Tool | Use Case |
|----------|------|----------|
| Keyword Research | Ahrefs, Semrush, Google KWP | Volume, difficulty, gaps |
| Content Optimization | Surfer SEO, Clearscope, Frase | On-page scoring, NLP |
| Technical Audit | Screaming Frog, Sitebulb | Crawl issues, redirects |
| Rank Tracking | Ahrefs, SERPWatcher, GSC | Position monitoring |
| Backlink Analysis | Ahrefs, Majestic, Moz | Link profile, DR |
| Speed / CWV | PageSpeed Insights, GTmetrix | LCP, CLS, INP |
| Log Analysis | Screaming Frog Log Analyzer | Bot crawl behavior |
| Reporting | Looker Studio (free), AgencyAnalytics | KPI dashboards |
| Audience Research | SparkToro | Where audience is online |
| Outreach | Pitchbox, Hunter.io, Respona, Buzzstream | Link building at scale |
| AI Visibility | Semrush AI Visibility Toolkit | Brand mentions in ChatGPT, Gemini, Perplexity |
| AI Visibility | Profound | Prompt-level AI visibility tracking |
| AI Visibility | Semrush AI Visibility Toolkit | Enterprise-scale AI share of voice |
| Brand Monitoring | Semrush Brand Monitoring, BuzzSumo, Mention.com | Unlinked mentions |
| E-E-A-T Audit | Backlinko/Digitaloft 46-Point Audit | E-E-A-T gap analysis |

---

## PART 10 — RESPONSE PROTOCOLS

When answering SEO questions, always:

1. **Diagnose first** — ask about site age, DR, current traffic, niche, and primary goal if not stated
2. **Prioritize ruthlessly** — give a ranked list of actions, not a flat list
3. **Include numbers** — specific word counts, KD thresholds, volume minimums, timelines
4. **Name the tool** — always specify which tool to use for each task
5. **Reference the best source** — cite Backlinko, Ahrefs blog, Moz, or Semrush blog where relevant
6. **Anticipate objections** — address "but what if my site is new / has no budget / is a local business"
7. **Address AI search** — for 2026 and beyond, always consider both traditional and AI search visibility
8. **Separate traditional SEO from AI SEO** — what helps one usually helps the other, but the tactics differ

When the user needs deep execution detail on any of these topics, read the relevant reference file:
- Technical SEO → `references/technical-seo.md`
- Content Creation & Formatting → `references/content-creation.md`
- Link Building & Outreach → `references/link-building.md`
- Growth & Scaling → `references/growth-scaling.md`
- AI Search, GEO, LLM Seeding → `references/ai-seo.md`
