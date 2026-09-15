# Skills, workflows, community evidence, market (Sept 2026) — key points

## Reference skill architectures
- ai-job-search: profile split (candidate, behavioral, writing-style, job-evaluation w/ deal-breakers + language gates, STAR bank). /setup /scrape /rank /apply /outcome /interview /expand /gmail-sync. /apply = parse → fit-score (skills, level, culture/location, trajectory, hard gates) → Drafter agent → Reviewer agent (fresh context; company research + critique) → revise → ATS text check (contact literal, reading order, keyword coverage) → 2-page cap relevance-weighted. "keywords the profile genuinely supports get added; gaps stay visible, never stuffed." 69 apps → 20 interviews → 1 offer.
- proficiently-claude-skills: map experience direct/analogous/transferable → rewrite → critique pass strips AI-sounding language (Flesch >90) → never change titles/dates, never hide gaps, 2 pages max.
- job-seeker-claude-skills: "never invent experience, degrees, employers, titles, dates, metrics, certifications, tools, projects"; unknown numbers → `[add metric if true]` placeholders.
- resume-tailoring-skill: "experience discovery" interview to surface undocumented work; confidence scores + gap list.
- resume-tailor-plugin: ATS score = required 40% / nice-to-have 20% / quantification 20% / completeness 10% / keyword distribution 10%; blocks generic openers + keyword stuffing.
- Code-enforced honesty: reject any new capitalized term not in base resume or skills whitelist; diff drafts; strip comp/benefits/EEO boilerplate before keyword analysis; ID'd statements; confirm only defensible skills before rewriting.

## Prompt patterns
1. Extract JD → top 3–4 weighted requirements → map to experience → rewrite bullets mirroring exact terms → change log + unmet-requirement list.
2. XYZ bullets ("Accomplished X as measured by Y by doing Z"), ≥60% quantified.
3. STAR bank 8–10 stories; "honest bridge answers" for gaps.
4. "Why this company" = Present-Past-Future.
5. Cover letter ≤ half page, 250–300 words (some <200).
6. Screening answers: 90-second structured drafts using only claims already in materials.

## Automation workflow chains (n8n)
- Schedule → scrape (Apify/JSearch) → dedupe vs seen → LLM score 1–100 + skill match → threshold 75 → Notion/Sheets + Telegram → cover letter → Drive.
- Haiku gatekeeper → Sonnet scorer → Sheets → GPT resume/letter JSON. Approve/decline buttons in email digest → on approve generate materials "from only the provided profile text".

## Evidence
- Quality-first human-submitted: 29% interview rate (69→20→1); 268 evaluated → 44 apps → 4 interviews at 9 min/morning.
- Volume bots: 5,000 apps → 20 interviews = same as 300 manual. 819 apps → 5 interviews.
- Base rates: 2–3% response; ~42 apps/interview; personalized +53% callback; referrals beat everything.
- Recruiters 2026: 67% say AI apps slow hiring; 62% reject non-personalized AI resumes; AI-vocab tells (leverage, spearhead, synergy); "98% improvement" reads fake. One resume should fit 80–90% of targets.
- Reddit: 20 precise > 200 generic; "ATS score" myth (parse+rank, no auto-reject); apply early.
- Format rules: keyword mirroring inside bullets; 1 page <10 yrs, 2 pages 10+; single column, no tables/text boxes; contact not in header; standard headings; text-selectable PDF/DOCX.
- Follow-up: 3–5 business days then +1 week, <100 words, add new value. LinkedIn msg reply ~17% vs 5% email; <5 sentences; ask insider for referral first.

## Commercial
Teal $29/mo (tracker + per-job keywords; weekly-billing trap) | Huntr $40/mo (kanban) | Simplify free autofill ext, $31.99/mo plus | Jobscan $49.95/mo (scare-score upsell) | Jobright Turbo $39.99 (generic output) | LazyApply $99–999/yr (56% 1-star) | Sonara $29–49 | JobCopilot $19.90–24.90 (spam rep) | Rezi $29/mo or $149 lifetime.
Universal complaints: generic AI text, billing dark patterns, broken form-fills. Opportunity: undercut $30–40/mo with transparent BYOK, no weekly billing.

## Recommendations
1. Master profile = single source of truth (structured facts + writing style + deal-breakers + STAR/answer bank); discovery interview at onboarding.
2. Enforce honesty in code: term-whitelist diff, placeholders, confirm-defensible-skills gate, change log.
3. Two-pass: Drafter → fresh-context Reviewer (strip AI vocab, block generic openers). Cheap gatekeeper + stronger writer.
4. Scoring 0–100 with dimensions + hard gates; threshold ~75; strip EEO/comp boilerplate first.
5. ATS layer: single-column, text check, page cap, DOCX + PDF export.
6. HITL: never auto-submit; approve/decline; cap 5–10 quality apps/day; surface referral paths.
7. Tracker with funnel stats, Gmail sync (later), follow-up scheduler T+3–5 bd, T+12; stale nudges.
