# GetDreamRole

A job-seeker agent that does everything except the Submit click.

## The loop

1. **Profile.** Paste your resume once. It is parsed into a registry of atomic facts, each with
   an id, plus your preferences and an answer bank for the screening questions every form asks.
   You confirm it before anything is generated from it.
2. **Discover.** Name the company boards (Greenhouse, Lever, Ashby, SmartRecruiters, Recruitee)
   and remote feeds you watch. A daily scan pulls new postings, dedupes them, runs a free
   deterministic pre-filter, and only spends money scoring the ones that survive.
3. **Tailor & review.** Each posting gets a tailored resume, a cover letter and prefilled
   screening answers, built in small steps with deterministic code between them. Every rewritten
   bullet cites a fact id. Anything the text introduces that your profile does not support comes
   back as a flagged claim you confirm or reject, and the draft cannot be approved until you have.
4. **Apply & track.** The apply kit hands you the answers with a confidence label, the resume as
   `.txt` and `.md`, the cover letter, and a link to the employer's own form. You submit it
   yourself. The tracker follows it through needs review, approved, submitted, interview, offer,
   rejected or ghosted, drafts up to two follow-ups, and shows the funnel and the month's spend.

## The safety stance

- **Nothing is submitted for you.** Server-side submission from a cloud IP is the top fraud
  signal an applicant tracking system looks for. You apply from your own browser, which keeps you
  off those filters. No LinkedIn or Indeed automation either; both ban it outright.
- **Nothing is fabricated.** Honesty is enforced in code, not in a prompt: a fact registry, a
  deterministic verifier, exact numbers, and a human checkpoint on anything new. Questions about
  visa status, clearance, degrees, years or salary are never guessed - they come from your answer
  bank or they come back to you.
- **Volume is capped.** A daily submit cap (10 by default), at most two open applications per
  company, and thirty days between applications to the same employer. Quality is what converts;
  volume is what gets candidates filtered out.

## Bring your own key

Generation runs on your provider key, in the backend, never in the browser. A full application
costs roughly a fifth of a cent on the cheapest models and about fifteen cents on the most
expensive, billed by your provider at cost. There is a shared trial key for your first runs, and
the dashboard shows the month's spend next to the model it ran on.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

Backend secrets live in the Convex deployment (`npx convex env set ...`), not in the Next.js
app, so a user's provider key never reaches the browser.

| Variable | Where | Required | What it does |
| --- | --- | --- | --- |
| `BYOK_MASTER_KEY` | Convex | Yes | Master key that encrypts every stored provider API key (AES-256-GCM). |
| `GROQ_API_KEY` | Convex | Optional | Shared trial key used when a signed-in user has not added a key yet. |
| `GROQ_API_KEY`, `GROQ_API_KEY_2` | Next.js | Optional | House keys for the public resume optimizer at `/optimize`. Without them that route returns demo data. |

Generate the master key with 32 random bytes and store it in Convex:

```bash
openssl rand -base64 32
npx convex env set BYOK_MASTER_KEY "<paste the base64 value>"

# optional shared trial key for users who have not added their own yet
npx convex env set GROQ_API_KEY "<groq key>"
```

Rotating `BYOK_MASTER_KEY` invalidates every stored provider key; users simply re-add theirs.

### Bring your own key

Signed-in users add their own provider keys at `/settings/ai` (Anthropic, OpenAI, Google,
Groq, OpenRouter, Mistral, DeepSeek, xAI). Each key is checked against the provider before it
is stored, encrypted and bound to that user and provider, and only decrypted inside the
backend call that uses it. Queries only ever return the last four characters. The settings
page also shows the estimated cost per application and this month's spend.

## Follow-ups

Deliberately out of scope so far, in rough order of value:

- **Browser-extension autofill** - fill the employer's form in the user's own tab, still with
  their click on Submit.
- **Gmail status sync** - poll for replies from the known ATS senders and move the tracker
  automatically instead of waiting for a manual move.
- **PDF and DOCX export** - today the tailored resume downloads as `.txt` and `.md`.
- **Telegram digest** - the morning's new postings and the day's due follow-ups.
- **Recruitee direct submit** - the one ATS whose apply endpoint does not need the employer's
  key, for users who explicitly opt in.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy this app is the [Vercel Platform](https://vercel.com/new). See the
[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for more details.
