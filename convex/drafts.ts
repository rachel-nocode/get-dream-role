import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { ActionCtx, action } from "./_generated/server";

type GeneratedDraft = {
  atsScore: number;
  matchScore: number;
  missingKeywords: string[];
  presentKeywords: string[];
  tailoredBullets: string[];
  optimizedResume: string;
  coverLetter: string;
  answerDrafts: Array<{
    question: string;
    answer: string;
    required: boolean;
  }>;
  summary: string;
};

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to generate an application pack.");
  }
  return userId;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function clampScore(value: unknown) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeGeneratedDraft(value: unknown): GeneratedDraft {
  if (typeof value !== "object" || value === null) {
    throw new Error("The model returned an invalid draft.");
  }

  const record = value as Record<string, unknown>;
  const answerDrafts = Array.isArray(record.answerDrafts)
    ? record.answerDrafts
        .filter((item): item is Record<string, unknown> => {
          return typeof item === "object" && item !== null;
        })
        .map((item) => ({
          question: String(item.question ?? ""),
          answer: String(item.answer ?? ""),
          required: Boolean(item.required),
        }))
        .filter((item) => item.question.length > 0 || item.answer.length > 0)
    : [];

  return {
    atsScore: clampScore(record.atsScore),
    matchScore: clampScore(record.matchScore),
    missingKeywords: asStringArray(record.missingKeywords),
    presentKeywords: asStringArray(record.presentKeywords),
    tailoredBullets: asStringArray(record.tailoredBullets),
    optimizedResume: String(record.optimizedResume ?? ""),
    coverLetter: String(record.coverLetter ?? ""),
    answerDrafts,
    summary: String(record.summary ?? ""),
  };
}

function fallbackDraft(args: {
  resumeSource: string;
  jobTitle: string;
  company: string;
  questions: Array<{ label: string; required: boolean }>;
}): GeneratedDraft {
  return {
    atsScore: 82,
    matchScore: 78,
    missingKeywords: ["role-specific tooling", "measurable impact"],
    presentKeywords: ["collaboration", "execution", "customer outcomes"],
    tailoredBullets: [
      `Reframed recent experience around ${args.jobTitle} outcomes at ${args.company}.`,
      "Pulled measurable impact higher in the bullet structure so a recruiter can scan it fast.",
      "Mirrored the job language without inventing experience.",
    ],
    optimizedResume: `${args.resumeSource}\n\nTAILORED NOTES\n- Emphasize the responsibilities that overlap with ${args.jobTitle}.\n- Add exact tools and measurable outcomes from your real work before submitting.`,
    coverLetter: `Hi ${args.company} team,\n\nI am excited about the ${args.jobTitle} role because it lines up with the kind of practical, outcome-focused work I want to do next. My background maps well to the posting's mix of execution, communication, and ownership, and I would bring a clear bias toward useful work that moves the team forward.\n\nBest,\n`,
    answerDrafts: args.questions.map((question) => ({
      question: question.label,
      required: question.required,
      answer:
        "I would answer this with a concise, specific example from my background and tie it directly to the role requirements.",
    })),
    summary:
      "Demo draft generated because no Groq key is available in Convex. The live version will produce a deeper tailored packet.",
  };
}

async function callGroq(args: {
  resumeSource: string;
  jobTitle: string;
  company: string;
  location?: string;
  description: string;
  questions: Array<{ label: string; required: boolean }>;
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallbackDraft(args);
  }

  const systemPrompt = `You are GetDreamRole Apply Copilot. Generate application materials that improve fit while staying honest.

Return ONLY valid JSON with this exact shape:
{
  "atsScore": number,
  "matchScore": number,
  "missingKeywords": string[],
  "presentKeywords": string[],
  "tailoredBullets": string[],
  "optimizedResume": string,
  "coverLetter": string,
  "answerDrafts": [{ "question": string, "answer": string, "required": boolean }],
  "summary": string
}

Rules:
- Never fabricate employers, degrees, titles, metrics, or skills.
- If a needed detail is absent, phrase it as a suggested placeholder the user should verify.
- Keep the cover letter human, specific, and under 260 words.
- Draft application answers only for questions provided by the job board.`;

  const userPrompt = `JOB
Title: ${args.jobTitle}
Company: ${args.company}
Location: ${args.location ?? "Not specified"}

Description:
${args.description}

Questions:
${JSON.stringify(args.questions)}

Candidate resume/source material:
${args.resumeSource}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.35,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq returned ${response.status}. Try again in a minute.`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty draft.");
  }

  return normalizeGeneratedDraft(JSON.parse(content));
}

export const generateForJob = action({
  args: {
    jobImportId: v.id("jobImports"),
    resumeSource: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ draftId: Id<"applicationDrafts">; applicationId: Id<"applications"> }> => {
    const userId = await requireUserId(ctx);
    const job = (await ctx.runQuery(internal.jobs.getForUser, {
      userId,
      jobImportId: args.jobImportId,
    })) as Doc<"jobImports"> | null;

    if (!job) {
      throw new Error("Could not find that imported job.");
    }

    const profile = (await ctx.runQuery(internal.draftSupport.getProfileForUser, {
      userId,
    })) as Doc<"profiles"> | null;
    const resumeSource: string = (args.resumeSource ?? profile?.resumeText ?? "").trim();
    if (!resumeSource) {
      throw new Error("Add resume text before generating a draft.");
    }

    if (process.env.APPLY_COPILOT_REQUIRE_SUBSCRIPTION === "true") {
      const hasAccess = await ctx.runQuery(internal.draftSupport.hasApplyCopilotAccess, {
        userId,
      });
      if (!hasAccess) {
        throw new Error("Apply Copilot requires an active subscription.");
      }
    }

    const generated = await callGroq({
      resumeSource,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      questions: job.questions.map((question: Doc<"jobImports">["questions"][number]) => ({
        label: question.label,
        required: question.required,
      })),
    });

    return (await ctx.runMutation(internal.draftSupport.saveGeneratedDraft, {
      userId,
      jobImportId: args.jobImportId,
      resumeSource,
      ...generated,
    })) as { draftId: Id<"applicationDrafts">; applicationId: Id<"applications"> };
  },
});
