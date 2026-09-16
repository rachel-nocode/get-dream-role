# Auto-apply safety, legality, feasibility (Sept 2026) — key points

## Platform rules
- Risk = account termination + per-company "do not hire" flags, not litigation, IF no login bypass / CAPTCHA bypass / fake identity.
- LinkedIn UA §8.2 bans bots + extensions; 2026 enforcement: ~4,900 extension IDs probed, DOM mutation monitor, fingerprint, velocity/timing. ~40% of accounts on non-compliant tools restricted. NEVER automate Easy Apply; deep-link only.
- Indeed ToS prohibits automating Indeed Apply. Same.
- Greenhouse hosted forms reCAPTCHA; Lever CAPTCHA; Workday per-tenant account + CAPTCHA; Cloudflare kills server Playwright.
- Greenhouse Real Talent (2025): datacenter IP = "high-risk" signal; targets bots/mass applications; per-company blocklists. Ashby AI Application Review. => server-side submitter from cloud IP is the TOP fraud signal.
- Recruiter sentiment: applications +412% since 2023; 91% caught deception; red flags = mismatched roles, timestamp clusters, identical resumes/cover letters, wrong location/salary, hallucinated skills.

## Free job APIs (read)
- Greenhouse: GET boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true ; /jobs/{id}?questions=true. POST apply needs EMPLOYER key → not for us.
- Lever: GET api.lever.co/v0/postings/{site}?mode=json&skip&limit. POST employer key only.
- Ashby: GET api.ashbyhq.com/posting-api/job-board/{org}?includeCompensation=true (unauth). Apply employer key only.
- SmartRecruiters: GET api.smartrecruiters.com/v1/companies/{id}/postings (public).
- Recruitee: GET {co}.recruitee.com/api/offers/ ; POST /api/offers/{slug}/candidates (documented candidate-side, no auth) — only mainstream ATS with candidate apply API.
- Workable: GET apply.workable.com/api/v1/widget/accounts/{slug}
- Workday: POST {t}.wd{N}.myworkdayjobs.com/wday/cxs/{t}/{site}/jobs {appliedFacets,limit,offset,searchText} (unofficial)
- Aggregators: JSearch 200 req/mo free; Adzuna ~1000/mo free (app_id+app_key); The Muse v2 500 req/h unkeyed; Remotive (≤4 fetches/day, must link back); RemoteOK GET remoteok.com/api (backlink); Arbeitnow GET arbeitnow.com/api/job-board-api; Jobicy GET jobicy.com/api/v2/remote-jobs?count≤200 (≤1/hour); USAJobs data.usajobs.gov/api/search (free key); HN Who is Hiring via hn.algolia.com/api/v1/search?tags=comment,story_{id}.
- Wellfound/YC WaaS: don't scrape.

## Recommended apply model
- Automate: discovery, dedupe, fit-scoring vs verified profile, resume/cover DRAFTS, screening answers only from confirmed Q&A bank, prefill, tracking, follow-up drafts.
- Human: the Submit click; free-text Qs the bank can't answer confidently; salary/visa/clearance/relocation/EEO; anything LinkedIn/Indeed.
- Pattern: Simplify-style copilot; scale.jobs caps ~30/day with human review.
- Queue states: discovered → scored → drafted → needs_review → approved → submitted → tracked. Daily cap 10–30; per-company cap (≤2 open, ≥30 days between); min fit threshold; no burst timestamps; show Greenhouse questions schema with prefilled answers flagged by confidence.

## Anti-fabrication
- Evidence registry: parse master resume into atomic facts with IDs; every bullet cites ≥1 fact ID; do_not_claim list.
- Deterministic checks: temporal validation, structural invariants (same employers/dates/count), evaluator pass.
- One human checkpoint after resume stage eliminated all identity fabrications (arXiv 2608.26171).
- UX: diff view original vs tailored; only reorder/rephrase; new skill/tool/number/credential highlighted + explicit confirm → enters registry as user-confirmed; numbers exact; screening answers on visa/degree/years/clearance never guessed → needs_human.

## Follow-up & tracking
- Gmail polling query: newer_than:2d (from:greenhouse-mail.io OR from:hire.lever.co OR from:ashbyhq.com OR from:myworkday.com OR from:icims.com OR from:smartrecruiters.com OR subject:application). (Phase later; optional.)
- Classify → {company, role, status applied|screen|assessment|interview|rejected|offer, dates, next_action}; auto-update above confidence else ask. Auto "ghosted" after ~30 days.
- Cadence: first follow-up 7–10 days (never <48h); second 10–14 days later; max two; thank-you within 24h post-interview. Generate drafts; user sends.
