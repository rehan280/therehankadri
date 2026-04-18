# Technical SEO — Deep Dive Reference
*Part of the SEO Growth Bible skill*

---

## CORE WEB VITALS OPTIMIZATION

Google's CWV are a confirmed ranking signal since 2021. The three metrics and their thresholds:

| Metric | What It Measures | Good | Needs Work | Poor |
|--------|-----------------|------|------------|------|
| LCP (Largest Contentful Paint) | Load speed of main content | <2.5s | 2.5–4s | >4s |
| INP (Interaction to Next Paint) | Responsiveness to input | <200ms | 200–500ms | >500ms |
| CLS (Cumulative Layout Shift) | Visual stability | <0.1 | 0.1–0.25 | >0.25 |

**Note:** FID was retired and replaced by INP in March 2024.

### LCP Optimization Playbook

LCP is most commonly caused by a hero image, above-the-fold text block, or video thumbnail.

**Step 1 — Identify LCP element:**
- Open Chrome DevTools → Performance panel → record load → look for LCP marker
- Or use PageSpeed Insights — it names the LCP element

**Step 2 — Fix LCP by element type:**

*If LCP = Hero Image:*
- Convert to WebP or AVIF (30–50% smaller than JPEG)
- Add `fetchpriority="high"` attribute to the `<img>` tag
- Preload it: `<link rel="preload" as="image" href="hero.webp">`
- Serve it from CDN (Cloudflare, Fastly, BunnyCDN)
- Never lazy-load the LCP image

*If LCP = Text Block:*
- Eliminate render-blocking CSS/JS above the fold
- Inline critical CSS in `<head>` (use Critical tool or PurgeCSS)
- Preload web fonts: `<link rel="preload" as="font">`
- Use `font-display: swap` to prevent invisible text during font load

*If LCP = Slow Server (TTFB >600ms):*
- Upgrade hosting to VPS or managed WordPress (Kinsta, WP Engine, Cloudways)
- Enable server-side caching (Redis, Varnish)
- Add Cloudflare in front — their edge network reduces TTFB globally

### INP Optimization Playbook

INP replaced FID in March 2024 — it measures ALL interactions, not just the first.

**Common causes:**
- Heavy JavaScript executing on click/tap
- Long tasks blocking the main thread
- Third-party scripts (chat widgets, ads, analytics) firing on interaction

**Fixes:**
1. Audit JS with Chrome DevTools → Performance → look for Long Tasks (>50ms)
2. Defer non-critical third-party scripts until after page interaction
3. Use `scheduler.yield()` to break up long tasks
4. Replace synchronous event handlers with async equivalents
5. Reduce main-thread JavaScript — audit with Coverage panel (unused JS)

### CLS Optimization Playbook

CLS happens when elements shift after initial render — usually from images without dimensions or late-loading ads.

**Fixes:**
1. Always set `width` and `height` attributes on ALL images and video embeds
2. Pre-allocate space for ads with min-height CSS
3. Don't insert content above existing content dynamically (e.g., cookie banners, notification bars)
4. For web fonts: use `font-display: optional` if you can accept fallback font on slow connections
5. Test with WebPageTest "Filmstrip" view — visual CLS is obvious here

---

## SCHEMA MARKUP & STRUCTURED DATA

Structured data doesn't directly boost rankings, but it enables **rich results** which increase CTR by 20–30% (Google's own data).

### Priority Schema Types by Site Type

**Blog/Content Site:**
```json
{
  "@type": "Article",
  "headline": "Title here",
  "datePublished": "2025-01-01",
  "dateModified": "2025-03-15",
  "author": { "@type": "Person", "name": "Jane Doe" },
  "publisher": { "@type": "Organization", "name": "Brand" }
}
```

**E-commerce:**
- `Product` schema with `offers`, `aggregateRating`, `review`
- `BreadcrumbList` on every product/category page
- `ItemList` on category pages

**Local Business:**
- `LocalBusiness` with `address`, `telephone`, `openingHours`, `geo`
- `Review` and `AggregateRating`
- `FAQPage` for common questions

**SaaS/Software:**
- `SoftwareApplication` with `operatingSystem`, `applicationCategory`, `offers`
- `FAQPage` on pricing and features pages

**FAQ Pages (any site):**
- Implement on any page with Q&A content
- Earns expandable FAQ rich result in SERP
- Typically increases CTR 5–15%

**HowTo Pages:**
- Use on tutorial/guide content with sequential steps
- Can earn expandable step-by-step rich results

### Schema Implementation Rules
1. Validate with Google's Rich Results Test before deploying
2. Schema must match visible on-page content — never include schema for invisible content
3. Use JSON-LD format (not Microdata) — Google prefers it and it's easier to maintain
4. Place JSON-LD in `<head>` for fastest parsing
5. Test with GSC → Enhancements tab after deploying — monitor for errors

---

## CRAWL BUDGET MANAGEMENT

Crawl budget matters most for sites with 10,000+ pages. For smaller sites, focus on indexability instead.

**What is crawl budget?**
Googlebot allocates a "crawl rate" to each domain based on server health, PageRank, and freshness signals. Wasting it on junk pages means important pages get crawled less frequently.

### Pages That Waste Crawl Budget (Block These)
- Faceted navigation / filter combinations (e.g., `/shoes?color=red&size=10&brand=nike`)
- Pagination beyond page 5 (unless content is unique)
- Internal search result pages
- Tag pages with minimal content
- Session ID URLs
- Print-friendly page variants
- Admin URLs

**How to block them:**
- `robots.txt` Disallow: for URL patterns
- `noindex, nofollow` meta tags
- Canonical to the main version
- Remove from XML sitemap

### Crawl Budget Optimization Checklist
- [ ] Eliminate redirect chains — every redirect hop wastes budget
- [ ] Fix all 404 errors linked internally — use Screaming Frog to find
- [ ] Remove soft 404s (pages returning 200 with "not found" content)
- [ ] Set crawl rate in GSC if Googlebot is overloading server
- [ ] Ensure sitemap contains ONLY indexable, canonical URLs
- [ ] Submit sitemap and "Request Indexing" for priority pages via GSC

### Log File Analysis Process
Log files show what Googlebot ACTUALLY crawled vs. what you think it crawled.

**Tools:** Screaming Frog Log Analyzer, Splunk (enterprise), ELK Stack

**What to look for:**
1. Pages crawled frequently but not ranking → weak content or duplicate signals
2. Important pages never crawled → blocked, orphaned, or no internal links
3. 404/500 errors in bot requests → internal links pointing to dead pages
4. Crawl concentrated on low-value pages → architecture and internal linking problem

---

## MOBILE-FIRST INDEXING CHECKLIST

Since 2023, ALL sites are indexed using mobile version. If your mobile experience is worse than desktop, you'll rank based on the worse version.

- [ ] Responsive design (not separate m.domain.com — use CSS breakpoints)
- [ ] All desktop content is ALSO present on mobile — no content hidden behind "show more" via CSS display:none
- [ ] All images on mobile have lazy loading (except LCP image)
- [ ] Font sizes readable without zoom (minimum 16px body text)
- [ ] Tap targets (buttons, links) minimum 48x48px
- [ ] No horizontal scroll on mobile
- [ ] Structured data same on mobile and desktop
- [ ] Canonical tags same on mobile and desktop
- [ ] GSC → Mobile Usability report shows 0 errors
- [ ] Test with Google's Mobile-Friendly Test

---

## TECHNICAL AUDIT PROCESS (90-Minute Full Site Audit)

**Phase 1: GSC (20 min)**
1. Manual Actions → fix any penalties
2. Core Web Vitals report → identify URLs failing CWV
3. Coverage → identify excluded pages, errors, and crawl anomalies
4. Sitemaps → confirm submitted and no errors
5. Mobile Usability → fix any critical issues

**Phase 2: Screaming Frog Crawl (30 min)**
Configure: include JS rendering, set crawl limit to 10K pages
Reports to pull:
- Response codes → fix all 404s with 301 redirects or content creation
- Redirect chains → collapse to single-hop
- Duplicate title/meta → fix or canonicalize
- Missing title/meta/H1 → add
- Images → fix missing alt text, oversized images
- Thin content (<300 words) → merge, expand, or noindex

**Phase 3: PageSpeed (20 min)**
- Run top 5 highest-traffic URLs through PageSpeed Insights
- Note LCP, INP, CLS for each
- Prioritize fixes by traffic × severity

**Phase 4: Link Audit (20 min)**
- Run domain through Ahrefs → Backlinks → filter for "lost"
- Check for toxic links (irrelevant, spammy anchors, foreign language link farms)
- If toxicity >15% of profile, consider disavow file (use sparingly)
- Identify pages with strong link profiles but poor content → update those pages first

---

## HTTPS AND SECURITY

- HTTP → HTTPS is a ranking signal (confirmed by Google)
- Ensure SSL cert covers www and non-www
- Redirect ALL HTTP to HTTPS (server-level 301, not meta redirect)
- Enable HSTS header after confirming HTTPS is stable
- Check for mixed content warnings (HTTP resources loaded on HTTPS page) — breaks the "padlock" signal
