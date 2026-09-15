# Open-source job-search / auto-apply landscape (2026-09-15) — key points

## Winners are human-in-the-loop
- career-ops (71.7k★, Apr 2026): skills inside Claude Code/Codex; scans 100+ companies & 55+ boards via Greenhouse/Ashby/Lever/Wellfound APIs + Playwright + RSS; A–H report with 1–5 score; tailored ATS PDF; drafts answers to free-text Qs; markdown tracker + Go TUI. NEVER auto-submits. Uses host CLI model. Disclaimer re hallucination.
- ai-job-search (42.9k★): /scrape /rank /apply /interview /outcome commands; drafter→reviewer agent pair; LaTeX + PDF verification loop; "never fabricates skills" rule + keyword-gap honesty; CSV tracker + HTML report. Prepare-only.
- job-ops (3.9k★): Docker/Next.js; JobSpy 15+ boards; 0–100 scoring; per-job CV rewrite; kanban; Gmail polling auto-updates status; BYOK (OpenAI/Claude/Gemini/OpenRouter/Ollama). Refuses to auto-apply: "recruiters detect and blacklist automated applications."

## Auto-submitters (cautionary)
- ApplyPilot (1.6k★): 6 stages discover→enrich→score 1-10→tailor→cover→submit via Claude Code + Playwright MCP; Gemini free default; "1,000 jobs in 2 days" → HN hostile; v0.3.0 fixed schema mismatch that sent WRONG work-auth/EEO/screening answers silently; tailor silently no resume; MCP token-heavy.
- JobHuntBot (809★): explicit human confirm before submit; pauses on identity/legal/comp Qs.
- AIHawk (31.6k★) pivoted to anti-detect browser; LinkedIn applier legacy. GodsScion LinkedIn bot: bot-detection issues. Legacy Selenium bots fragile.
- browser-use examples/use-cases/apply_to_job.py — 100-line reference for agentic form filling.

## Tailoring tools
- Reactive Resume (43k★): JSON Resume import, PDF/DOCX export, BYOK, MCP server.
- Resume-Matcher (28.4k★): FastAPI + Next.js 16, LiteLLM; master resume + JD → resume, cover letter, interview prep. No hallucination guardrail.
- RenderCV (17.6k★): YAML → Typst PDF deterministic (ideal sink for LLM YAML).
- OpenResume (8.9k★): browser-only builder + parser (ATS-parse check).
- Pattern: structured resume JSON → schema-validated LLM output → deterministic renderer → ATS text-extraction check → reviewer agent → relevance-weighted trimming.

## Job sources
- JobSpy (4.3k★): Indeed reliable; LinkedIn 429s; Google/ZipRecruiter dead. Python only.
- Greenhouse/Lever/Ashby GET APIs free & unauth for discovery; POST requires employer keys.
- Feashliaa/job-board-aggregator: ~95k company slugs from Common Crawl (CC-BY-NC data).
- Remote feeds: Remotive, RemoteOK, Himalayas (API + RSS + MCP), Jobicy, Arbeitnow, WWR RSS.
- SimplifyJobs listings.json (internships/new grad).

## Trackers
- job-ops kanban + Gmail; jobsync (Next.js/Prisma); JobNavigator (funnel/Sankey + Gmail + Telegram); Notion template; Sheets 11-col template (Company, Role, URL, Date, Status, ATS score, Contact, Follow-up, Stage, Salary, Notes).

## Scoring rubrics
- career-ops A–H dims + 1–5 global; job-ops 0–100; ApplyPilot 1–10; ai-job-search hard rejects (language gate).

## Lessons
1. LinkedIn bots break/ban; scrapers die.
2. Fabrication is the #1 shipped bug; survivors hard-code "never invent", "pause on identity/legal/comp".
3. Spam backlash; HITL wins.
4. Agentic form filling 10–100x tokens; Gemini free suffices for scoring/tailoring.
5. Anonymize PII before LLM calls (beatwad).
6. Pre-fetch Greenhouse ?questions=true to pre-generate answers from answer bank; dry-run; stop on CAPTCHA/login/identity/EEO/comp.
