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
import { logActivity } from "./applications";
import { fetchAshbyBoard, normalizeAshbyJob } from "./discovery/fetchers";
import { companyKeyFor } from "./lib/caps";
import { humanizeSlug, stripHtml } from "./lib/html";
import { parseJobUrl } from "./lib/jobUrls";
import { jobQuestion, jobSource, type JobQuestion, type JobSource } from "./validators";

type ImportedJob = {
  source: JobSource;
  url: string;
  externalId: string;
  boardToken?: string;
  leverSite?: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  applyUrl: string;
  questions: JobQuestion[];
};

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to import jobs.");
  }
  return userId;
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
    company: humanizeSlug(parsed.boardToken),
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
    company: humanizeSlug(parsed.site),
    location: String(categories.location ?? ""),
    description: description || stripHtml(String(data.description ?? "")),
    applyUrl: String(data.applyUrl ?? `${parsed.applyUrl.replace(/\/apply$/, "")}/apply`),
    questions: [],
  };
}

/** Ashby has no single-posting endpoint, so we read the board and pick it. */
async function importAshby(parsed: ReturnType<typeof parseJobUrl>): Promise<ImportedJob> {
  if (parsed.source !== "ashby") {
    throw new Error("Expected an Ashby URL.");
  }

  const postings = await fetchAshbyBoard(parsed.org);
  const posting = postings.find((entry) => String(entry.id ?? "") === parsed.jobId);
  if (!posting) {
    throw new Error("That Ashby posting is no longer on the public job board.");
  }

  const job = normalizeAshbyJob(posting, parsed.org);

  return {
    source: "ashby",
    url: job.url || parsed.applyUrl,
    externalId: job.externalId,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    applyUrl: job.applyUrl || parsed.applyUrl,
    questions: [],
  };
}

async function importParsedJob(parsed: ReturnType<typeof parseJobUrl>): Promise<ImportedJob> {
  if (parsed.source === "greenhouse") return await importGreenhouse(parsed);
  if (parsed.source === "lever") return await importLever(parsed);
  return await importAshby(parsed);
}

export const importFromUrl = action({
  args: { url: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{ jobImportId: Id<"jobImports">; applicationId: Id<"applications"> }> => {
    const userId = await requireUserId(ctx);
    const job = await importParsedJob(parseJobUrl(args.url));

    return (await ctx.runMutation(internal.jobs.saveImportedJob, {
      userId,
      ...job,
    })) as { jobImportId: Id<"jobImports">; applicationId: Id<"applications"> };
  },
});

export type SaveImportedJobArgs = ImportedJob & { userId: Id<"users"> };

/**
 * Upserts an imported job and its draft application. Shared by the URL
 * importer and by the discovery queue, which both land in the same place.
 */
export async function saveImportedJobRow(
  ctx: MutationCtx,
  args: SaveImportedJobArgs,
): Promise<{ jobImportId: Id<"jobImports">; applicationId: Id<"applications"> }> {
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

  if (existingApplication !== null) {
    return { jobImportId, applicationId: existingApplication._id };
  }

  const applicationId = await ctx.db.insert("applications", {
    userId: args.userId,
    jobImportId,
    status: "drafted",
    companyKey: companyKeyFor(args.company),
    lastStatusChangeAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await logActivity(ctx, {
    userId: args.userId,
    applicationId,
    type: "created",
    message: `Imported ${args.title} at ${args.company} from ${args.source}.`,
  });

  return { jobImportId, applicationId };
}

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
  handler: async (ctx: MutationCtx, args) => await saveImportedJobRow(ctx, args),
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
