This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
