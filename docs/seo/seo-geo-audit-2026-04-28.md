# SEO + GEO Audit - 2026-04-28

Goal: rank for the right ATS/resume keywords in Google and get cited by AI answer engines when users ask which ATS checker/resume optimizer to use.

## Verdict

GetDreamRole has a strong seed strategy: ATS-specific pages, comparison page, schema helpers, sitemap, and crawlable content. The current ceiling is not branding. The ceiling is technical index hygiene plus missing bottom-funnel pages.

Priority order:

1. Fix canonical/noindex metadata on non-content routes.
2. Ship `/free-ats-resume-checker`.
3. Add static/cached marketing layout so SEO pages are not all dynamic.
4. Add evidence-heavy GEO content: methodology, comparisons, FAQs, first-party examples.
5. Expand internal links and backlinks around the ATS platform cluster.

## What I Checked

- Routes, metadata, sitemap, robots, JSON-LD helpers, blog metadata, publishing docs.
- Rendered localhost HTML for home, Workday guide, ATS optimizer guide, app/private routes.
- Live Google-facing index sample: `site:getdreamrole.com`, brand queries, and ATS checker competitor SERPs.
- Build and lint.

Verification:

- `npm run build`: passed.
- `npm run lint`: passed with 4 generated Convex warnings only.
- `site:getdreamrole.com`: Workday blog post is indexed; broad brand/domain footprint is still thin.

## Critical Findings

### 1. App/private pages canonicalize to homepage and are indexable

Severity: Critical  
Category: Technical SEO / Indexation  
Location: `src/lib/seo.ts:28-37`, `src/app/layout.tsx:25`, simple metadata routes like `src/app/dashboard/page.tsx`, `src/app/applications/page.tsx`, `src/app/settings/billing/page.tsx`, `src/app/payment/page.tsx`, `src/app/success/page.tsx`, `src/app/jobs/import/page.tsx`

Rendered examples:

- `/dashboard` title: `Dashboard | GetDreamRole | GetDreamRole`; canonical: `/`
- `/applications` title: `Applications | GetDreamRole | GetDreamRole`; canonical: `/`
- `/settings/billing` title: `Billing | GetDreamRole | GetDreamRole`; canonical: `/`
- `/payment`, `/success`, `/results`: default homepage title + canonical `/`

Impact:

- Google can discover low-value app/payment/auth pages and treat them as duplicate or canonicalized-to-home noise.
- Private/app pages can dilute crawl budget and confuse canonical signals.
- Titles like `Dashboard | GetDreamRole | GetDreamRole` look sloppy if indexed.

Fix:

- Remove default `alternates.canonical: "/"` from `baseMetadata`.
- Give every indexable route explicit canonical via `buildMetadata`.
- Add `robots: { index: false, follow: false }` to app/account/payment/success/results routes.
- Keep `/results` disallowed only if it has no public value, but use `noindex` for pages you want removed from index. Google says robots blocks crawling, while `noindex` prevents indexing when crawlers can see the directive.

### 2. Future-dated posts are live

Severity: Critical  
Category: Trust / Freshness  
Location: `src/lib/blog-posts.ts:205-231`, `docs/seo/publishing-calendar.md:33`

Current date is 2026-04-28. Live posts include:

- Workable date: 2026-04-30
- SmartRecruiters date: 2026-05-07

Impact:

- Future dates on visible content and sitemap `lastmod` can look manipulative or broken.
- AI answer engines and crawlers may distrust freshness signals.

Fix:

- Either unpublish future-dated posts until their dates or change dates to actual publish date.
- Do not put future `lastModified` in sitemap for live URLs.

### 3. Highest-intent keywords are planned but not shipped

Severity: Critical  
Category: Keyword Coverage / Revenue  
Location: `docs/seo/content-briefs.md:7-305`

404 today:

- `/free-ats-resume-checker`
- `/tools/ats-score-checker`
- `/blog/does-my-resume-pass-ats`
- `/guides/ats-keywords-list`
- `/cover-letter-optimizer`

Impact:

- You are ranking for platform long-tail, but missing the queries where users are ready to run a scan.
- Competitors own this funnel. Teal has a live resume checker page promising ATS score, formatting feedback, structure feedback, content strength, and keyword usage.

Fix:

- Ship `/free-ats-resume-checker` first. It should reuse the optimizer flow above the fold, not be a blog-only page.
- Then ship `/blog/does-my-resume-pass-ats`, then `/tools/ats-score-checker`.

## High Findings

### 4. All marketing pages build as dynamic routes

Severity: High  
Category: Performance / Crawl Efficiency  
Location: `src/app/layout.tsx:27-44`

`next build` reports every content route as dynamic (`ƒ`), including `/`, `/ats/*`, `/blog/*`, and `/vs/jobscan`.

Impact:

- SEO pages lose static rendering/caching advantages.
- More server work per crawl and visitor.
- Slower first response can hurt crawl efficiency and conversion, especially on new sites.

Likely cause:

- Root layout wraps all routes in Convex auth/server provider and client provider.

Fix:

- Split marketing/content routes into a static public layout.
- Keep Convex/auth providers only around app routes: `/dashboard`, `/applications`, `/settings`, authenticated flows.
- Confirm `/`, `/blog/*`, `/ats/*`, `/vs/*`, `/privacy`, `/terms` become static or cached after refactor.

### 5. Content depth is too thin for competitive SERPs

Severity: High  
Category: Content Quality / GEO  
Location: `src/app/blog/*/page.tsx`, `src/app/ats/*/page.tsx`

Word counts:

- Platform blog posts: about 506 to 735 words.
- ATS landing pages: about 434 to 473 words.
- Jobscan comparison: about 1,258 words.

Impact:

- Thin pages can index but struggle against Jobscan, Teal, Resume Worded, Enhancv, and comparison spam pages.
- AI answer engines need quotable, structured, evidence-rich content. Current pages are useful but not citation magnets.

Fix:

- Expand each platform post to 1,400-2,000 words with:
  - Exact parser quirks.
  - Example before/after bullets.
  - Formatting do/don't table.
  - FAQ visible on page.
  - Methodology: how GetDreamRole evaluates ATS fit.
  - Links to `/free-ats-resume-checker`, `/tools/ats-score-checker`, and platform hub.

### 6. Schema overclaims review/rating trust without visible proof

Severity: High  
Category: Structured Data / Trust  
Location: `src/app/page.tsx:52-124`, `src/lib/seo.ts:194-245`

Homepage emits `AggregateRating` 4.9 / 1200 and three reviews in `SoftwareApplication` JSON-LD.

Impact:

- If reviews and rating count are not visible, verifiable, and sourced, this can trigger rich result distrust.
- For GEO, unsupported claims reduce citation quality.

Fix:

- Either add a visible reviews/testimonials section matching schema or remove rating/review schema until proof exists.
- Add date/source context for reviews if real.

### 7. FAQ schema has limited Google rich-result value

Severity: High  
Category: SERP Features / Schema  
Location: `src/app/page.tsx:19-124`, `src/app/vs/jobscan/page.tsx`

Google's FAQ rich result docs now say eligibility is limited to well-known authoritative health/government sites, and not to use FAQPage for advertising purposes.

Impact:

- FAQ schema probably will not win FAQ rich results for this product.
- Still useful for content clarity, but should not be treated as the main structured-data strategy.

Fix:

- Keep visible FAQ content if useful.
- Add `BreadcrumbList`, `HowTo`, `SoftwareApplication`, `Product`, `ItemList`, and `Dataset` where eligible and accurate.

## Medium Findings

### 8. Homepage title underserves the biggest transactional keyword

Severity: Medium  
Category: Keyword Targeting  
Location: `src/app/page.tsx:73-85`

Current title: `ATS Resume Optimizer for Greenhouse, Workday & Lever`

Better homepage target:

- `ATS Resume Checker & Resume Optimizer for Any Job`
- Or: `Free ATS Resume Checker + AI Resume Optimizer`

Impact:

- Current title is specific and credible, but misses `free ats resume checker`, `ats resume checker`, and `resume score checker` emphasis.

Fix:

- Make homepage broader and let `/ats/*` own platform modifiers.
- Make `/free-ats-resume-checker` own "free" transactional searches.

### 9. `/optimize` target intent is too generic

Severity: Medium  
Category: Keyword Targeting  
Location: `src/app/optimize/page.tsx:10-22`

Current title: `Optimize Your Resume for the Right ATS`

Impact:

- Product page should capture "resume optimizer", "AI resume optimizer", and "ATS resume checker" more directly.

Fix:

- New title: `AI ATS Resume Optimizer: Match Your Resume to Any Job`
- Add on-page explanatory copy visible to crawlers above or below the tool.

### 10. Breadcrumb schema missing across most content pages

Severity: Medium  
Category: Structured Data / Internal Linking  
Location: `src/app/blog/*/page.tsx`, `src/app/ats/*/page.tsx`

Impact:

- Breadcrumbs help search engines understand hierarchy and can improve SERP presentation.
- Existing visual breadcrumb/back links are not JSON-LD except `/vs/jobscan`.

Fix:

- Add `buildBreadcrumbSchema` to blog and ATS pages.
- Use `Home > ATS Platforms > Workday ATS` and `Home > Blog > Post`.

### 11. Sitemap `lastModified` for static routes changes every request/build

Severity: Medium  
Category: Crawl Signals  
Location: `src/app/sitemap.ts:23-38`

Impact:

- Every sitemap generation tells crawlers core static pages changed now, even if content did not.
- This weakens freshness accuracy.

Fix:

- Store explicit `lastModified` dates per route.
- Use file/content dates for blog posts.

### 12. Missing competitor comparison cluster

Severity: Medium  
Category: Commercial SEO / GEO  
Current coverage: `/vs/jobscan` only

Needed pages:

- `/vs/resume-worded`
- `/vs/teal`
- `/vs/enhancv`
- `/vs/skillsyncer`
- `/vs/resumake` or `/vs/kickresume` if SERP data supports it
- `/alternatives/jobscan`

Impact:

- "Alternative" and "vs" queries are high intent and easier than head terms.
- GEO systems often answer "best X" with comparison pages.

Fix:

- Build a comparison template with transparent pros/cons.
- Avoid fake "we win everything" copy. Credibility matters.

## Low Findings

### 13. Meta keywords exist everywhere

Severity: Low  
Category: Legacy SEO  
Location: `src/lib/seo.ts:39`, `buildMetadata`

Impact:

- Modern Google does not use meta keywords for ranking. Not harmful, just noise.

Fix:

- Fine to leave, but do not spend time optimizing meta keywords.

### 14. Organization schema is sparse

Severity: Low  
Category: Entity SEO / GEO  
Location: `src/lib/seo.ts:258-267`

Impact:

- AI systems need stable entity facts: sameAs, founders/authors, contact, logo, app category.

Fix:

- Add `sameAs` profiles once real public profiles exist.
- Add `founder` or `creator` only if you want public attribution.
- Add `contactPoint` only if support email exists.

## Keyword Map

### Own Now

These are already mapped to pages:

- `ats resume optimizer` -> `/`, `/optimize`, `/blog/ats-resume-optimizer-guide`
- `resume ats checker` -> `/`, `/optimize`
- `optimize resume for greenhouse` -> `/ats/greenhouse`, `/blog/optimize-resume-greenhouse-ats`
- `workday ats resume` -> `/ats/workday`, `/blog/optimize-resume-workday-ats`
- `lever ats resume` -> `/ats/lever`, `/blog/optimize-resume-lever-ats`
- `icims resume guide` -> `/ats/icims`, `/blog/optimize-resume-icims-ats`
- `taleo resume guide` -> `/ats/taleo`, `/blog/optimize-resume-taleo-ats`
- `jobscan alternative` -> `/vs/jobscan`

### Missing And High Value

Ship in this order:

1. `free ats resume checker` -> `/free-ats-resume-checker`
2. `does my resume pass ats` -> `/blog/does-my-resume-pass-ats`
3. `ats score checker` -> `/tools/ats-score-checker`
4. `ats keywords list` -> `/guides/ats-keywords-list`
5. `resume keyword scanner` -> `/tools/resume-keyword-scanner`
6. `jobscan alternative` -> strengthen `/vs/jobscan` plus `/alternatives/jobscan`
7. `cover letter ats optimizer` -> `/cover-letter-optimizer`

### Platform Expansion

Next platform pages:

1. Jobvite
2. ADP Recruiting
3. BambooHR
4. JazzHR
5. SAP SuccessFactors
6. Oracle Recruiting Cloud

Each should ship as a pair:

- `/ats/<platform>`
- `/blog/optimize-resume-<platform>-ats`

## GEO Plan

GEO target prompts:

- "What is the best free ATS resume checker?"
- "Is Jobscan worth it?"
- "Best Jobscan alternatives"
- "How do I know if my resume passes ATS?"
- "How do I optimize a resume for Workday?"
- "What resume format works with ATS?"
- "Which ATS checker is actually free?"

Needed signals:

- Clear definitions at top of pages.
- Direct 40-60 word answers under H1 for question pages.
- Comparison tables with named competitors.
- Visible methodology sections.
- First-party screenshots or sample outputs.
- Original data: keyword frequency by role, before/after score examples, parse-failure examples.
- Schema: `SoftwareApplication`, `HowTo`, `BreadcrumbList`, `Dataset`, `ItemList`, `Article`.

Avoid:

- Unsupported stats.
- Fake review counts.
- Future dates.
- Over-optimized pages that read like keyword stuffing.

## 30-Day Execution Plan

### Week 1

- Fix canonical/noindex issue.
- Remove future dates or unpublish future posts.
- Split public marketing layout from authenticated app layout.
- Ship `/free-ats-resume-checker`.

### Week 2

- Ship `/blog/does-my-resume-pass-ats`.
- Add breadcrumb schema to blog and ATS pages.
- Add static `lastModified` dates to sitemap.
- Add visible methodology block to homepage and optimizer page.

### Week 3

- Ship `/tools/ats-score-checker`.
- Expand `/vs/jobscan` with fresher pricing/product screenshots and transparent methodology.
- Create `/vs/teal` or `/vs/resume-worded` based on Search Console impressions.

### Week 4

- Start `/guides/ats-keywords-list` with original dataset.
- Add Jobvite and ADP platform pages.
- Begin lightweight backlink outreach to career coaches, college career centers, and job-search communities.

## Sources

- Google Search Central: meta descriptions should be unique and page-specific; keyword-stuffed descriptions are weaker. https://developers.google.com/search/docs/appearance/snippet
- Google Search Central: use `noindex` to prevent indexing; robots.txt blocking alone can still leave URLs visible. https://developers.google.com/search/docs/essentials/technical
- Google Search Central: canonical should consolidate duplicate/similar pages, not point unrelated app routes to homepage. https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Search Central: FAQ rich result eligibility is limited and FAQ content must be visible. https://developers.google.com/search/docs/appearance/structured-data/faqpage
- SAGEO Arena paper: structural information such as schema markup matters in realistic SEO/GEO pipelines. https://arxiv.org/abs/2602.12187
- Teal competitor page: live resume checker targets ATS score, formatting, structure, content strength, and keyword usage. https://www.tealhq.com/tool/resume-checker
