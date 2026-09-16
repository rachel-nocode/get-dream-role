# GetDreamRole Job Agent — Redesign Plan (Sept 2026)

Goal: turn GetDreamRole into an affordable, effective, bring-your-own-key (BYOK) job-seeker agent that
finds jobs, tailors resumes honestly, prepares every application so submitting takes one click, and
tracks everything in a dashboard.

Research digests live in `docs/agent-research/` (open-source agents, skills and workflows, LLM
pricing, safety and job APIs). This plan is what we build from them.

## 1. What the research says (the short version)

- The two biggest open-source job agents of 2026 (career-ops 71k stars, ai-job-search 43k stars)
  never auto-submit. The bots that do ("1,000 jobs in 2 days") shipped wrong work-authorization
  answers silently and get candidates flagged.
- Server-side submission from a cloud IP is the top fraud signal in Greenhouse's Real Talent
  detection. LinkedIn and Indeed ban automation outright. Every ATS apply endpoint needs the
  employer's key (Recruitee is the lone exception).
- Quality beats volume: 69 tailored apps produced 20 interviews; 5,000 bot apps produced 20.
- Fabrication is the number one shipped bug. Survivors enforce honesty in code (fact registry,
  term whitelist, placeholders, human checkpoint), not just in prompts.
- Cost is a non-issue when the user brings a key: a full application (score + resume + cover
  letter + answers) costs roughly $0.002 on gpt-5-nano, $0.06 on Claude Sonnet 5, $0.15 on Opus 5.
- The model the app hardcodes today (`llama-3.3-70b-versatile` on Groq) was deprecated for free
  and dev tiers in June 2026. The current tailoring path is effectively broken.

## 2. Product shape

"Autonomous" means the agent does everything except the Submit click, which happens in the
user's own browser. That is the only version that is both effective and safe.

Pipeline (each application moves through these stages):

```
discovered -> scored -> drafted -> needs_review -> approved -> submitted -> interview | offer | rejected | ghosted
```

Four surfaces, all inside the existing signed-in app shell:

1. **Profile** (`/profile`): master profile = fact registry parsed from the resume and confirmed by
   the user, plus preferences (target titles, locations, remote, salary floor, deal-breakers) and an
   answer bank (work authorization, relocation, start date, salary expectation, etc.).
2. **Discover** (`/jobs`): sources the user watches (company boards on Greenhouse / Lever / Ashby /
   SmartRecruiters / Recruitee, free remote feeds, optional JSearch or Adzuna with the user's key).
   A daily scan plus "Scan now" pulls postings, dedupes, runs a free deterministic pre-filter, and
   LLM-scores only the survivors (0-100 with dimensions and hard gates).
3. **Apply kit** (`/applications/[id]`): tailored resume with a diff view and change log, gap list,
   flagged claims that need confirmation, cover letter, prefilled screening answers with a
   confidence label, "Open apply form", "Mark submitted".
4. **Tracker** (`/applications`, `/dashboard`): kanban by stage, funnel stats, follow-ups due, cost
   spent this month, activity log per application.

## 3. Architecture decisions

- **Stack stays**: Next.js 16 App Router, Convex (data, actions, crons), Convex Auth email OTP,
  Stripe, Tailwind 4. No new frameworks.
- **LLM calls run in Convex actions**, not Next.js routes, so the user's key never leaves the
  backend and the tracker updates reactively. Files that import the Anthropic SDK use `"use node"`.
- **Provider layer** (`convex/ai/`):
  - `providers.ts`: registry of providers, models, per-million pricing, base URLs, JSON mode
    support, key-format hints, and `/models` validation endpoints.
  - `crypto.ts`: AES-256-GCM with a random 12-byte IV, key from env `BYOK_MASTER_KEY`, AAD
    `${userId}:${provider}`.
  - `client.ts`: one `generateJson()` entry point. Anthropic goes through `@anthropic-ai/sdk`
    Messages API with `output_config.format` (json_schema). Everything else (OpenAI, Google,
    Groq, OpenRouter, Mistral, DeepSeek, xAI) goes through the OpenAI-compatible chat completions
    endpoint with `response_format: json_schema` and a `json_object` fallback. Returns parsed
    JSON plus usage and estimated USD.
  - Every call logs to `aiUsage` (provider, model, tokens in/out, usd, purpose, applicationId).
- **Model presets** shown in settings with cost per application:
  - Free: Google `gemini-3.1-flash-lite` or Groq `openai/gpt-oss-120b`.
  - Cheap: OpenAI `gpt-5.4-nano` or `gpt-5-mini`.
  - Best value: Anthropic `claude-sonnet-5` (default when an Anthropic key is added).
  - Best quality: Anthropic `claude-opus-5`.
  - The house Groq key (`GROQ_API_KEY`) stays as a free-trial fallback for users without a key,
    switched to `openai/gpt-oss-120b`, capped by the existing usage counter.
- **Honesty enforced in code** (`convex/ai/verify.ts`, pure TypeScript, unit tested):
  - Every tailored bullet must cite at least one fact ID from the registry.
  - New capitalized terms, tools, numbers, or credentials not in the registry become
    `flaggedClaims` the user must confirm or reject before the draft can be approved.
  - Employers, titles, dates, and entry counts must match the source exactly.
  - Screening questions about visa, clearance, degree, years, salary, or identity are never
    guessed; they come from the answer bank or are marked `needs_human`.
- **Safety rails**: no LinkedIn or Indeed automation, no server-side form submission, daily
  submit cap (default 10, max 30), per-company cap (2 open applications, 30 days apart), no
  hidden text in resumes.
- **Cost rails**: deterministic pre-filter before any LLM call, per-call `max_tokens` caps,
  daily scoring budget, cost meter on the dashboard.

## 4. Phases

Each phase ends with `npx tsc --noEmit`, `npm run lint`, and `npm run build` passing, then a
commit. Convex codegen cannot reach the network here, so new Convex modules are added by hand to
`convex/_generated/api.d.ts` (the `dataModel` types derive from the schema automatically).

### Phase 1 — BYOK provider layer and AI settings
- Add `@anthropic-ai/sdk`. Build `convex/ai/{providers,crypto,client}.ts` and `convex/apiKeys.ts`
  (save with validation ping, remove, list masked) plus `aiSettings` (chosen provider/model).
- Schema: `apiKeys`, `aiSettings`, `aiUsage`.
- Settings page `/settings/ai`: add/remove keys per provider, choose preset or model, see cost
  per application and this month's spend.
- Rewire `convex/drafts.ts` and `src/lib/groq.ts` to the new client. Replace the deprecated
  Groq model. Remove the fake "demo draft" fallback in favor of a clear "add a key" error.
- Nav gets an "AI" settings link. Proxy protects `/settings/ai`.

### Phase 2 — Master profile and job discovery
- Schema: `careerProfiles` (experiences with bullet IDs, skills, education, certifications,
  preferences, answerBank, writingStyle), `jobSources`, `discoveredJobs`.
- `convex/careerProfile.ts`: parse resume text into the registry (structured output), upsert,
  confirm. `/profile` page with editable sections and the answer bank.
- `convex/discovery.ts`: source fetchers for Greenhouse, Lever, Ashby, SmartRecruiters,
  Recruitee boards and Remotive, RemoteOK, Arbeitnow, Jobicy, Himalayas feeds. Normalize,
  dedupe on (source, externalId) and (company, title, url), deterministic pre-filter
  (title keywords, location/remote, posted within 30 days), then LLM fit score for the top N.
- `convex/crons.ts`: daily scan. `/jobs` page: sources manager, queue with score badges,
  Save / Dismiss / Build apply kit. Extend `parseJobUrl` for Ashby URLs (keep tests green).

### Phase 3 — Honest tailoring pipeline
- `convex/ai/tailor.ts`: extract requirements from the JD -> map each to fact IDs or gap ->
  rewrite bullets citing IDs -> cover letter under 250 words -> screening answers from the
  answer bank -> deterministic verify pass -> cheap reviewer pass that strips AI-sounding
  vocabulary and generic openers.
- Draft schema gains `changeLog`, `gaps`, `flaggedClaims`, `evidenceMap`, `needsHuman`,
  `model`, `tokensIn`, `tokensOut`, `costUsd`.
- Application detail: diff view (original vs tailored), change log, gap list, flagged claims
  confirm/reject, cost line. Approving requires zero unresolved flagged claims.

### Phase 4 — Apply kit and tracker dashboard
- Status set extended to the pipeline above; existing statuses map cleanly (`draft`,
  `ready` -> `drafted`, `opened` -> `needs_review`).
- `activityLog` table; `nextActionAt` on applications; follow-up drafts (T+7 and T+14),
  auto-ghost after 30 days via cron.
- `/applications` becomes a kanban with stage columns and move controls; `/dashboard` shows
  funnel (applied -> responses -> interviews -> offers), due follow-ups, cost this month,
  top discovered jobs.
- Apply kit tab: Greenhouse question schema with prefilled answers and confidence, copy
  buttons, resume download as .txt and .md, "Open apply form" (logs), "Mark submitted"
  (enforces daily and per-company caps).
- Landing and billing copy updated to explain BYOK pricing.

### Phase 5 — Verify and ship
- Typecheck, lint, build, run the Playwright specs that work without a Convex deployment.
- Update README with setup (env vars: `BYOK_MASTER_KEY`, optional `GROQ_API_KEY`), and the
  docs. Commit and push to `claude/friendly-planck-4jamj8`.

## 5. Out of scope for this pass
- Browser extension autofill, Gmail status sync, PDF/DOCX rendering, Telegram digests,
  Recruitee direct submit. All are noted as follow-ups in the README.
