import Groq from "groq-sdk";
import { AnalysisResult } from "./types";

function getGroqClients(): Groq[] {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    throw new Error("No GROQ_API_KEY configured");
  }

  return keys.map((apiKey) => new Groq({ apiKey }));
}

export async function analyzeResume(
  atsTarget: string,
  targetName: string,
  jobTitle: string,
  jobDescription: string,
  resumeText: string
): Promise<AnalysisResult> {
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyst. You analyze resumes against job descriptions for specific ATS platforms and provide detailed, actionable optimization recommendations.

Your analysis must be:
- Specific and actionable, not generic
- Grounded in the candidate's real experience — never fabricate achievements
- Focused on keyword alignment, formatting, and ATS parsing compatibility
- Tailored to the specific ATS platform's parsing behavior

You MUST return valid JSON matching this exact schema:
{
  "atsScore": number (0-100, overall ATS compatibility score),
  "matchScore": number (0-100, keyword match against job description),
  "missingKeywords": string[] (keywords from JD not in resume),
  "presentKeywords": string[] (keywords from JD found in resume),
  "suggestedKeywords": string[] (additional keywords to add),
  "sectionFeedback": [{ "section": string, "score": number, "feedback": string, "suggestions": string[] }],
  "bulletRewrites": [{ "original": string, "rewritten": string, "improvement": string }],
  "optimizedResume": string (full rewritten resume text),
  "summary": string (2-3 sentence analysis overview),
  "atsInsights": string[] (platform-specific tips)
}`;

  const userPrompt = `Analyze this resume for the ${targetName} ATS platform.

${jobTitle ? `Target Job Title: ${jobTitle}` : ""}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Provide a complete analysis with scores, keyword gaps, section-by-section feedback, bullet point rewrites, and a fully optimized version of the resume. Keep all improvements grounded in the candidate's actual experience. Return ONLY valid JSON.`;

  const clients = getGroqClients();
  let lastError: unknown;

  for (const groq of clients) {
    try {
      const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Groq");

      const parsed = JSON.parse(content);
      return { ...parsed, atsTarget, targetName } as AnalysisResult;
    } catch (err: unknown) {
      const is429 =
        err instanceof Error && err.message.includes("429");
      if (is429) {
        lastError = err;
        continue; // try next key
      }
      throw err; // non-rate-limit errors bubble up immediately
    }
  }

  throw lastError ?? new Error("All Groq keys exhausted");
}
