# SEO Publishing Calendar — ATS Guide Series

One long-form ATS guide per week. Each guide ships with a matching `/ats/<platform>` landing hub so keyword authority stacks across `/blog` and `/ats` URLs.

## Pattern per platform

- **Blog post** at `/blog/optimize-resume-<platform>-ats`
  - H1 matches exact-match high-intent query
  - 600–900 words, GuideArticleShell, 2+ GuideCta blocks
  - BlogPosting JSON-LD (via `buildBlogPostingSchema`)
  - Cross-link to at least 2 sibling guides + `/ats/<platform>` hub
- **ATS hub** at `/ats/<platform>`
  - AtsLandingContent (facts, mistakes, benefits, relatedLinks)
  - WebPage JSON-LD (via `buildWebPageSchema`)
  - CTA deep-links to `/optimize?ats=<platform>`
- **Sitemap** — add both URLs (`/ats/<platform>` priority 0.8, blog priority 0.7 via loop)
- **blog-posts.ts** — add BlogPostMeta entry with keywords + relatedSlugs
- **/ats page** — add platform card with `hasDedicatedPage: true`

## Cadence

| Week | Ship date | Platform | Blog slug | ATS hub | Primary keyword |
|---|---|---|---|---|---|
| 1 | 2026-04-02 | Greenhouse | `optimize-resume-greenhouse-ats` | `/ats/greenhouse` | optimize resume for greenhouse |
| 2 | 2026-04-15 | Taleo | `optimize-resume-taleo-ats` | `/ats/taleo` | taleo resume guide |
| 3 | 2026-04-15 | iCIMS | `optimize-resume-icims-ats` | `/ats/icims` | icims resume guide |
| 4 | 2026-04-16 | Workday | `optimize-resume-workday-ats` | `/ats/workday` | workday ats resume |
| 5 | 2026-04-16 | Lever | `optimize-resume-lever-ats` | `/ats/lever` | lever ats resume |
| 6 | 2026-04-23 | **BrassRing** | `optimize-resume-brassring-ats` | `/ats/brassring` | brassring ats resume |
| 7 | 2026-04-28 | **Workable** | `optimize-resume-workable-ats` | `/ats/workable` | workable ats resume |
| 8 | 2026-04-28 | **SmartRecruiters** | `optimize-resume-smartrecruiters-ats` | `/ats/smartrecruiters` | smartrecruiters ats resume |

Weeks 1–5 shipped before 2026-04-21. Weeks 6–8 are live with non-future publish dates so sitemap `lastModified` stays trustworthy for crawlers.

## Next candidates (post-2026-05-07)

Prioritized by US search volume + commercial intent. Add one per week.

| Priority | Platform | Why |
|---|---|---|
| P1 | Jobvite | SMB/mid-market, 2,000+ customers, growing |
| P1 | ADP Recruiting | Payroll-bundled, very high penetration in US mid-market |
| P2 | BambooHR | SMB hiring, growing brand search |
| P2 | JazzHR | SMB, price-sensitive segment |
| P3 | SAP SuccessFactors | Enterprise, overlaps with Workday audience |
| P3 | Oracle Recruiting Cloud | Enterprise, overlaps with Taleo (same parent) |
| P4 | Recruitee | EU SMB, international SEO play |
| P4 | Breezy HR | SMB, complements Workable guide |

## Production checklist per week

1. Add `BlogPostMeta` entry to `src/lib/blog-posts.ts` with 5 keywords + 3 relatedSlugs
2. Create `src/app/blog/optimize-resume-<platform>-ats/page.tsx`
3. Create `src/app/ats/<platform>/page.tsx`
4. Update `/ats` platforms array (add card, `hasDedicatedPage: true`)
5. Update `src/app/sitemap.ts` staticRoutes
6. `npm run build` — verify no TS errors, no broken Link imports
7. Preview: hit `/blog/<slug>`, `/ats/<platform>`, `/ats` — check rendering
8. `curl localhost:3000/sitemap.xml` — confirm both URLs present
9. Commit: `feat(seo): add <platform> ATS guide + hub`
10. Push

## Measurement

Track in GSC, week 4 after ship:
- Impressions for primary keyword
- Position for `<platform> ats resume`
- CTR for blog URL
- Conversions from `/optimize?ats=<platform>` (UTM auto-tagged by hub CTA)

Stop investing in a platform if it's not in the top 20 by week 8. Double down if it's top 10 — invest in backlinks and expand with `<platform> vs <competitor>` comparison posts.
