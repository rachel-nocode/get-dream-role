import { NextRequest, NextResponse } from "next/server";
import type { MatchedJob } from "@/lib/types";

type JSearchJob = {
  job_id?: string;
  job_title?: string;
  employer_name?: string;
  job_city?: string | null;
  job_state?: string | null;
  job_country?: string | null;
  job_location?: string | null;
  job_employment_type?: string | null;
  job_posted_at_datetime_utc?: string | null;
  job_description?: string;
  job_apply_link?: string;
  job_apply_url?: string;
  job_is_remote?: boolean;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_min?: number | null;
  job_salary_max?: number | null;
  job_salary_currency?: string | null;
};

const STOPWORDS = new Set([
  "about",
  "above",
  "across",
  "after",
  "again",
  "against",
  "also",
  "among",
  "and",
  "are",
  "because",
  "been",
  "being",
  "both",
  "but",
  "can",
  "did",
  "does",
  "doing",
  "each",
  "for",
  "from",
  "had",
  "has",
  "have",
  "into",
  "its",
  "more",
  "most",
  "our",
  "out",
  "over",
  "per",
  "role",
  "that",
  "the",
  "their",
  "this",
  "through",
  "to",
  "with",
  "within",
  "work",
  "your",
]);

const ROLE_FALLBACKS = [
  "frontend engineer",
  "front-end engineer",
  "software engineer",
  "full stack engineer",
  "product manager",
  "data analyst",
  "data scientist",
  "designer",
  "marketing manager",
  "sales manager",
  "customer success",
];

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
}

function tokenize(value: string) {
  return normalizeToken(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function inferJobTitle(resume: string) {
  const normalized = normalizeToken(resume);
  const fallback = ROLE_FALLBACKS.find((role) => normalized.includes(role));
  if (fallback) return fallback;

  const heading = resume
    .split(/\n+/)
    .map((line) => line.trim())
    .find((line) => {
      const lower = line.toLowerCase();
      return (
        line.length >= 8 &&
        line.length <= 70 &&
        !lower.includes("@") &&
        !lower.includes("linkedin") &&
        /(engineer|developer|manager|designer|analyst|specialist|lead|director)/i.test(line)
      );
    });

  return heading ?? "software engineer";
}

function keywordPool(resume: string, keywords: string[]) {
  const cleanKeywords = unique(
    keywords
      .map((keyword) => keyword.replace(/\s+/g, " "))
      .filter((keyword) => keyword.length >= 2 && keyword.length <= 40),
  );

  if (cleanKeywords.length >= 8) {
    return cleanKeywords.slice(0, 24);
  }

  const counts = new Map<string, number>();
  tokenize(resume).forEach((token) => {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  });

  const resumeKeywords = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
    .filter((token) => !/^\d+$/.test(token))
    .slice(0, 24);

  return unique([...cleanKeywords, ...resumeKeywords]).slice(0, 24);
}

function buildSearchQuery(args: {
  resume: string;
  jobTitle: string;
  keywords: string[];
  location: string;
}) {
  const title = args.jobTitle || inferJobTitle(args.resume);
  const searchKeywords = args.keywords
    .filter((keyword) => keyword.length <= 24 && tokenize(keyword).length <= 3)
    .slice(0, 3);
  const location = args.location ? `in ${args.location}` : "";

  return unique([title, ...searchKeywords, location]).join(" ");
}

function includesKeyword(text: string, keyword: string) {
  const normalizedText = normalizeToken(text);
  const normalizedKeyword = normalizeToken(keyword);
  if (!normalizedKeyword) return false;

  if (normalizedKeyword.includes(" ")) {
    return normalizedText.includes(normalizedKeyword);
  }

  return new RegExp(`(^|\\s)${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(
    normalizedText,
  );
}

function scoreJob(job: JSearchJob, resume: string, keywords: string[], jobTitle: string) {
  const jobText = [job.job_title, job.employer_name, job.job_description].filter(Boolean).join(" ");
  const matchedKeywords = keywords.filter((keyword) => includesKeyword(jobText, keyword));
  const missingKeywords = keywords.filter((keyword) => !includesKeyword(jobText, keyword)).slice(0, 8);
  const jobTokens = new Set(tokenize(jobText));
  const resumeTokens = new Set(tokenize(resume));
  const overlap = Array.from(jobTokens).filter((token) => resumeTokens.has(token)).length;
  const keywordScore =
    keywords.length > 0 ? Math.round((matchedKeywords.length / keywords.length) * 55) : 0;
  const overlapScore = Math.min(30, overlap * 2);
  const titleScore =
    jobTitle && includesKeyword(String(job.job_title ?? ""), jobTitle)
      ? 15
      : matchedKeywords.some((keyword) => includesKeyword(String(job.job_title ?? ""), keyword))
        ? 8
        : 0;

  return {
    matchScore: Math.max(35, Math.min(98, keywordScore + overlapScore + titleScore)),
    matchedKeywords: matchedKeywords.slice(0, 10),
    missingKeywords,
  };
}

function formatLocation(job: JSearchJob) {
  if (job.job_is_remote) return "Remote";
  if (job.job_location) return job.job_location;
  return [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ") || "Location not listed";
}

function numberOrNull(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      optimizedResume?: unknown;
      jobTitle?: unknown;
      keywords?: unknown;
      location?: unknown;
    };
    const optimizedResume = cleanText(body.optimizedResume);
    const jobTitle = cleanText(body.jobTitle);
    const location = cleanText(body.location);
    const keywords = Array.isArray(body.keywords)
      ? body.keywords.filter((keyword): keyword is string => typeof keyword === "string")
      : [];

    if (optimizedResume.length < 50) {
      return NextResponse.json(
        { error: "Optimized resume is required before matching jobs." },
        { status: 400 },
      );
    }

    const apiKey = process.env.JSEARCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "JSearch is not configured." }, { status: 503 });
    }

    const pool = keywordPool(optimizedResume, keywords);
    const query = buildSearchQuery({ resume: optimizedResume, jobTitle, keywords: pool, location });
    const params = new URLSearchParams({
      query,
      page: "1",
      num_pages: "1",
      date_posted: "month",
    });

    if (location.toLowerCase() === "remote") {
      params.set("remote_jobs_only", "true");
    }

    const response = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
      headers: {
        accept: "application/json",
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        "X-RapidAPI-Key": apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `JSearch returned ${response.status}. Try again in a minute.` },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    const data = (await response.json()) as { data?: JSearchJob[] };
    const jobs: MatchedJob[] = (Array.isArray(data.data) ? data.data : [])
      .map((job) => {
        const scored = scoreJob(job, optimizedResume, pool, jobTitle);

        return {
          id: String(job.job_id ?? job.job_apply_link ?? crypto.randomUUID()),
          title: String(job.job_title ?? "Untitled role"),
          company: String(job.employer_name ?? "Unknown company"),
          location: formatLocation(job),
          employmentType: job.job_employment_type ?? null,
          postedAt: job.job_posted_at_datetime_utc ?? null,
          description: String(job.job_description ?? ""),
          applyLink: String(job.job_apply_link ?? job.job_apply_url ?? ""),
          isRemote: Boolean(job.job_is_remote),
          salaryMin: numberOrNull(job.job_min_salary ?? job.job_salary_min),
          salaryMax: numberOrNull(job.job_max_salary ?? job.job_salary_max),
          salaryCurrency: job.job_salary_currency ?? null,
          ...scored,
        };
      })
      .filter((job) => job.applyLink)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json({ query, jobs });
  } catch (error) {
    console.error("Job match error:", error);
    return NextResponse.json({ error: "Failed to match jobs." }, { status: 500 });
  }
}
