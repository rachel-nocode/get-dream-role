# SEO Growth Plan for GetDreamRole

## 🎯 Summary
Grow traffic with a quick-win SEO strategy built around what the site already does well: ATS-specific pages, practical resume advice, and strong job-seeker intent. The first 6-8 weeks should focus on technical SEO basics, expanding the highest-intent ATS content, and publishing a small set of tightly related articles that bring in search traffic and push readers into `/optimize`.

## 🛠️ Key Changes
- [ ] Add technical SEO essentials in the app layer: create `src/app/sitemap.ts`, create `src/app/robots.ts`, and improve [layout.tsx](/Users/witchaudio/Developer/github-personal/get-dream-role/src/app/layout.tsx) metadata with canonical URLs and cleaner per-page defaults.
- [ ] Add structured data beyond the current homepage FAQ: use `BlogPosting` schema on blog posts, `WebPage` or `SoftwareApplication` schema on product/ATS pages, and keep titles/descriptions unique for every indexable page.
- [ ] Strengthen internal linking so every ATS page links to its matching guide, every guide links back to `/optimize`, and the blog index plus homepage surface the best-ranking guides more prominently.
- [ ] Keep the site focused on “job seeker with a real application in hand” keywords, not broad career-advice topics that bring traffic but weak conversions.

## 📝 Content Todo Items
- [ ] Expand the ATS cluster first, because it matches the product and current site structure best.
- [ ] Create dedicated landing pages for `iCIMS` and `Taleo` under `/ats/` before writing broader articles.
- [ ] Publish these next 6 articles in this order:
- [ ] `How to Optimize Your Resume for Workday ATS`
- [ ] `How to Optimize Your Resume for Lever ATS`
- [ ] `How to Optimize Your Resume for iCIMS`
- [ ] `How to Optimize Your Resume for Taleo`
- [ ] `ATS-Friendly Resume Format: What Actually Parses`
- [ ] `Why Qualified Candidates Still Get Rejected by ATS`
- [ ] Refresh the 2 existing blog posts so they each target one main keyword, include a stronger CTA, and link to the matching ATS/product pages.
- [ ] Add a short “Related guides” block near the end of every article to reduce orphan pages and improve crawl flow.
- [ ] Use one primary keyword and 2-4 close variants per page. Example clusters:
- [ ] `optimize resume for greenhouse`, `greenhouse ats resume`, `greenhouse resume tips`
- [ ] `workday ats resume`, `how to pass workday`, `workday resume format`
- [ ] `ats-friendly resume format`, `resume for ats`, `ats safe resume template`

## 🔁 Publishing Workflow
- [ ] Publish 1 ATS landing page or 1 high-intent article every week for 8 weeks.
- [ ] For each new page, include: one clear H1, a plain-English intro, scannable sections, one schema type, one main CTA, and at least 3 internal links.
- [ ] Put conversion CTAs in 3 places on articles: near the top, mid-article, and at the end.
- [ ] Keep articles practical and specific. Prefer “how to pass Workday ATS” over generic “resume tips”.
- [ ] Keep the current hand-written content setup for now in [blog-posts.ts](/Users/witchaudio/Developer/github-personal/get-dream-role/src/lib/blog-posts.ts) and the existing blog pages; only move to a larger content system after the first 8-10 pages are live.

## 📏 Success Checks
- [ ] Connect Google Search Console and submit the sitemap as soon as `sitemap.ts` is live.
- [ ] Track weekly: indexed pages, impressions, clicks, average position, and which pages drive visits to `/optimize`.
- [ ] Success target for the first 8 weeks: all core pages indexed, 8 new/updated search pages live, growing impressions on ATS queries, and clear organic visits reaching the product flow.
- [ ] Review after 30 days and double down only on pages that show early impressions or clicks; update underperforming pages instead of endlessly adding new ones.

## ⚙️ Assumptions
- [ ] Audience stays English-speaking job seekers, mainly tech and knowledge-work applicants.
- [ ] The goal is qualified traffic that can convert, not just higher raw pageviews.
- [ ] Quick wins are the priority, so this plan does not include programmatic SEO, backlinks, or a large editorial CMS rebuild yet.
- [ ] Existing ATS/product positioning is strong enough to anchor the SEO strategy, so we should deepen that niche before expanding wider.
