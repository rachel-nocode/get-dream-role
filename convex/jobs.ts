import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  ActionCtx,
  MutationCtx,
  QueryCtx,
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { parseJobUrl } from "./lib/jobUrls";
import { jobQuestion, jobSource } from "./validators";

type ImportedJob = {
  source: "greenhouse" | "lever";
  url: string;
  externalId: string;
  boardToken?: string;
  leverSite?: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  applyUrl: string;
  questions: Array<{
    label: string;
    required: boolean;
    fields: Array<{
      name: string;
      type: string;
      options: Array<{ label: string; value: string }>;
    }>;
  }>;
};

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to import jobs.");
  }
  return userId;
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ");
}

function stripHtml(value: string) {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h[1-6]|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function humanizeToken(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeGreenhouseQuestions(rawQuestions: unknown) {
  if (!Array.isArray(rawQuestions)) return [];

  return rawQuestions
    .filter((question): question is Record<string, unknown> => {
      return typeof question === "object" && question !== null;
    })
    .map((question) => {
      const fields = Array.isArray(question.fields) ? question.fields : [];

      return {
        label: String(question.label ?? "Question"),
        required: Boolean(question.required),
        fields: fields
          .filter((field): field is Record<string, unknown> => {
            return typeof field === "object" && field !== null;
          })
          .map((field) => {
            const values = Array.isArray(field.values) ? field.values : [];

            return {
              name: String(field.name ?? ""),
              type: String(field.type ?? "text"),
              options: values
                .filter((option): option is Record<string, unknown> => {
                  return typeof option === "object" && option !== null;
                })
                .map((option) => ({
                  label: String(option.label ?? option.value ?? ""),
                  value: String(option.value ?? option.label ?? ""),
                })),
            };
          }),
      };
    })
    .filter((question) => question.label.trim().length > 0);
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Job board returned ${response.status}. Check that the posting is public.`);
  }

  return await response.json();
}

async function importGreenhouse(parsed: ReturnType<typeof parseJobUrl>): Promise<ImportedJob> {
  if (parsed.source !== "greenhouse") {
    throw new Error("Expected a Greenhouse URL.");
  }

  const data = (await fetchJson(parsed.apiUrl)) as Record<string, unknown>;
  const location =
    typeof data.location === "object" && data.location !== null
      ? String((data.location as Record<string, unknown>).name ?? "")
      : undefined;
  const questions = [
    ...normalizeGreenhouseQuestions(data.questions),
    ...normalizeGreenhouseQuestions(data.location_questions),
  ];

  return {
    source: "greenhouse",
    url: parsed.applyUrl,
    externalId: parsed.jobId,
    boardToken: parsed.boardToken,
    title: String(data.title ?? "Untitled role"),
    company: humanizeToken(parsed.boardToken),
    location,
    description: stripHtml(String(data.content ?? "")),
    applyUrl: String(data.absolute_url ?? parsed.applyUrl),
    questions,
  };
}

async function importLever(parsed: ReturnType<typeof parseJobUrl>): Promise<ImportedJob> {
  if (parsed.source !== "lever") {
    throw new Error("Expected a Lever URL.");
  }

  const data = (await fetchJson(parsed.apiUrl)) as Record<string, unknown>;
  const categories =
    typeof data.categories === "object" && data.categories !== null
      ? (data.categories as Record<string, unknown>)
      : {};
  const lists = Array.isArray(data.lists)
    ? data.lists
        .filter((list): list is Record<string, unknown> => {
          return typeof list === "object" && list !== null;
        })
        .map((list) => `${String(list.text ?? "")}\n${stripHtml(String(list.content ?? ""))}`)
        .join("\n\n")
    : "";
  const description = [
    String(data.descriptionPlain ?? data.openingPlain ?? ""),
    lists,
    String(data.additionalPlain ?? ""),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return {
    source: "lever",
    url: parsed.applyUrl,
    externalId: parsed.postingId,
    leverSite: parsed.site,
    title: String(data.text ?? "Untitled role"),
    company: humanizeToken(parsed.site),
    location: String(categories.location ?? ""),
    description: description || stripHtml(String(data.description ?? "")),
    applyUrl: String(data.applyUrl ?? `${parsed.applyUrl.replace(/\/apply$/, "")}/apply`),
    questions: [],
  };
}

export const importFromUrl = action({
  args: { url: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{ jobImportId: Id<"jobImports">; applicationId: Id<"applications"> }> => {
    const userId = await requireUserId(ctx);
    const parsed = parseJobUrl(args.url);
    const job =
      parsed.source === "greenhouse"
        ? await importGreenhouse(parsed)
        : await importLever(parsed);

    return (await ctx.runMutation(internal.jobs.saveImportedJob, {
      userId,
      ...job,
    })) as { jobImportId: Id<"jobImports">; applicationId: Id<"applications"> };
  },
});

export const saveImportedJob = internalMutation({
  args: {
    userId: v.id("users"),
    source: jobSource,
    url: v.string(),
    externalId: v.string(),
    boardToken: v.optional(v.string()),
    leverSite: v.optional(v.string()),
    title: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    description: v.string(),
    applyUrl: v.string(),
    questions: v.array(jobQuestion),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    const existingJob = await ctx.db
      .query("jobImports")
      .withIndex("by_user_source_external", (q) =>
        q
          .eq("userId", args.userId)
          .eq("source", args.source)
          .eq("externalId", args.externalId),
      )
      .first();

    const patch = {
      source: args.source,
      url: args.url,
      externalId: args.externalId,
      boardToken: args.boardToken,
      leverSite: args.leverSite,
      title: args.title,
      company: args.company,
      location: args.location,
      description: args.description,
      applyUrl: args.applyUrl,
      questions: args.questions,
      updatedAt: now,
    };

    const jobImportId =
      existingJob === null
        ? await ctx.db.insert("jobImports", {
            userId: args.userId,
            createdAt: now,
            ...patch,
          })
        : (await ctx.db.patch(existingJob._id, patch), existingJob._id);

    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_jobImportId", (q) => q.eq("jobImportId", jobImportId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    const applicationId =
      existingApplication === null
        ? await ctx.db.insert("applications", {
            userId: args.userId,
            jobImportId,
            status: "draft",
            createdAt: now,
            updatedAt: now,
          })
        : existingApplication._id;

    return { jobImportId, applicationId };
  },
});

export const getForUser = internalQuery({
  args: {
    userId: v.id("users"),
    jobImportId: v.id("jobImports"),
  },
  handler: async (ctx: QueryCtx, args) => {
    const job = await ctx.db.get(args.jobImportId);
    if (!job || job.userId !== args.userId) return null;
    return job;
  },
});

export const getById = query({
  args: { jobImportId: v.id("jobImports") },
  handler: async (ctx: QueryCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const job = await ctx.db.get(args.jobImportId as Id<"jobImports">);
    if (!job || job.userId !== userId) return null;
    return job;
  },
});
