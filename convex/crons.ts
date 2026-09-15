import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Early enough that a morning check has fresh jobs, late enough to be cheap.
crons.daily(
  "scan job sources and score new jobs",
  { hourUTC: 6, minuteUTC: 0 },
  internal.discovery.actions.scanAndScoreAll,
);

export default crons;
