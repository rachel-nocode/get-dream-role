/**
 * The application pipeline, as one ordered list plus the rules that read it.
 *
 * Pure TypeScript with no Convex imports, so both the backend and the browser
 * can use it and the tests can import it directly. Rows written before the
 * pipeline existed still carry their old status, so every read normalizes
 * first and nothing new is ever written with an old literal.
 */

/** Every stage an application can be in, in the order it moves through them. */
export const PIPELINE_STATUSES = [
  "discovered",
  "scored",
  "drafted",
  "needs_review",
  "approved",
  "submitted",
  "interview",
  "offer",
  "rejected",
  "ghosted",
  "archived",
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

/** Statuses written before Phase 4, and the stage each one became. */
const LEGACY_STATUSES = {
  draft: "drafted",
  ready: "needs_review",
  opened: "needs_review",
} as const;

export type LegacyStatus = keyof typeof LEGACY_STATUSES;

/** What a stored row can hold: a pipeline stage or one of the old literals. */
export type StoredStatus = PipelineStatus | LegacyStatus;

/**
 * Stages a user can move an application to by hand. "discovered" and "scored"
 * belong to the discovery queue, and "submitted" goes through the cap check in
 * `markSubmitted` instead of a plain status change.
 */
export const MANUAL_STATUSES = [
  "drafted",
  "needs_review",
  "approved",
  "interview",
  "offer",
  "rejected",
  "ghosted",
  "archived",
] as const;

export type ManualStatus = (typeof MANUAL_STATUSES)[number];

export function isManualStatus(status: PipelineStatus): status is ManualStatus {
  return (MANUAL_STATUSES as readonly string[]).includes(status);
}

/** Stages where nothing more will happen without a new application. */
export const TERMINAL_STATUSES = ["offer", "rejected", "ghosted", "archived"] as const;

export type TerminalStatus = (typeof TERMINAL_STATUSES)[number];

const TERMINAL = new Set<string>(TERMINAL_STATUSES);

export const STATUS_LABELS: Record<PipelineStatus, string> = {
  discovered: "Discovered",
  scored: "Scored",
  drafted: "Drafted",
  needs_review: "Needs review",
  approved: "Approved",
  submitted: "Submitted",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
  archived: "Archived",
};

export function normalizeStatus(status: StoredStatus): PipelineStatus {
  return status in LEGACY_STATUSES
    ? LEGACY_STATUSES[status as LegacyStatus]
    : (status as PipelineStatus);
}

/** True while the application can still turn into an interview or an offer. */
export function isOpen(status: StoredStatus): boolean {
  return !TERMINAL.has(normalizeStatus(status));
}

export function statusLabel(status: StoredStatus): string {
  return STATUS_LABELS[normalizeStatus(status)];
}

/**
 * Stages that mean the user actually sent the application. Archived is left
 * out on purpose: it is a drawer for anything, not a stage after submitting.
 */
const APPLIED_STATUSES = new Set<string>([
  "submitted",
  "interview",
  "offer",
  "rejected",
  "ghosted",
]);

export function hasApplied(status: StoredStatus): boolean {
  return APPLIED_STATUSES.has(normalizeStatus(status));
}

/** Stages where the employer still owes a reply, so a follow-up makes sense. */
const AWAITING_REPLY_STATUSES = new Set<string>(["submitted", "interview"]);

export function awaitsReply(status: StoredStatus): boolean {
  return AWAITING_REPLY_STATUSES.has(normalizeStatus(status));
}
