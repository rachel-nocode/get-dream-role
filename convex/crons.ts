import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Early enough that a morning check has fresh jobs, late enough to be cheap.
crons.daily(
  "scan job sources and score new jobs",
  { hourUTC: 6, minuteUTC: 0 },
  internal.discovery.actions.scanAndScoreAll,
);

// An hour after the scan, so the board a user opens in the morning already
// shows which applications nobody is going to answer.
crons.daily(
  "mark silent applications as ghosted",
  { hourUTC: 7, minuteUTC: 0 },
  internal.applications.markGhosted,
);

export default crons;
