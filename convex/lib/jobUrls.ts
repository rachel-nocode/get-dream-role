export type ParsedJobUrl =
  | {
      source: "greenhouse";
      boardToken: string;
      jobId: string;
      apiUrl: string;
      applyUrl: string;
    }
  | {
      source: "lever";
      site: string;
      postingId: string;
      apiUrl: string;
      applyUrl: string;
      region: "global" | "eu";
    }
  | {
      source: "ashby";
      org: string;
      jobId: string;
      apiUrl: string;
      applyUrl: string;
    };

export const UNSUPPORTED_JOB_URL_MESSAGE =
  "Supports Greenhouse, Lever, and Ashby job URLs.";

export function parseJobUrl(input: string): ParsedJobUrl {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Paste a valid job URL. " + UNSUPPORTED_JOB_URL_MESSAGE);
  }

  const hostname = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (
    hostname === "boards.greenhouse.io" ||
    hostname === "job-boards.greenhouse.io"
  ) {
    const [boardToken, jobsSegment, jobId] = parts;
    if (!boardToken || jobsSegment !== "jobs" || !jobId) {
      throw new Error("That Greenhouse URL is missing a board token or job id.");
    }

    return {
      source: "greenhouse",
      boardToken,
      jobId,
      apiUrl: `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${jobId}?questions=true&pay_transparency=true`,
      applyUrl: url.toString(),
    };
  }

  if (hostname === "jobs.lever.co" || hostname === "jobs.eu.lever.co") {
    const [site, postingId] = parts;
    if (!site || !postingId) {
      throw new Error("That Lever URL is missing a company site or posting id.");
    }

    const region = hostname === "jobs.eu.lever.co" ? "eu" : "global";

    const apiHost = region === "eu" ? "api.eu.lever.co" : "api.lever.co";

    return {
      source: "lever",
      site,
      postingId,
      region,
      apiUrl: `https://${apiHost}/v0/postings/${site}/${postingId}?mode=json`,
      applyUrl: url.toString(),
    };
  }

  if (hostname === "jobs.ashbyhq.com") {
    const [org, jobId] = parts;
    if (!org || !jobId) {
      throw new Error("That Ashby URL is missing an org or job id.");
    }

    return {
      source: "ashby",
      org,
      jobId,
      apiUrl: `https://api.ashbyhq.com/posting-api/job-board/${org}`,
      applyUrl: url.toString(),
    };
  }

  throw new Error(UNSUPPORTED_JOB_URL_MESSAGE);
}
