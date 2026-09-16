import { expect, test } from "@playwright/test";
import { parseJobUrl } from "../convex/lib/jobUrls";

test.describe("job URL parsing", () => {
  test("parses Greenhouse job URLs", () => {
    const parsed = parseJobUrl("https://boards.greenhouse.io/acme/jobs/12345");

    expect(parsed).toMatchObject({
      source: "greenhouse",
      boardToken: "acme",
      jobId: "12345",
      apiUrl:
        "https://boards-api.greenhouse.io/v1/boards/acme/jobs/12345?questions=true&pay_transparency=true",
    });
  });

  test("parses Lever EU job URLs", () => {
    const parsed = parseJobUrl(
      "https://jobs.eu.lever.co/acme/5ac21346-8e0c-4494-8e7a-3eb92ff77902",
    );

    expect(parsed).toMatchObject({
      source: "lever",
      site: "acme",
      postingId: "5ac21346-8e0c-4494-8e7a-3eb92ff77902",
      region: "eu",
      apiUrl:
        "https://api.eu.lever.co/v0/postings/acme/5ac21346-8e0c-4494-8e7a-3eb92ff77902?mode=json",
    });
  });

  test("parses Ashby job URLs", () => {
    const parsed = parseJobUrl(
      "https://jobs.ashbyhq.com/acme/1f3b8a52-2c4d-4f0a-9c2e-5d1a8b7c6e40",
    );

    expect(parsed).toMatchObject({
      source: "ashby",
      org: "acme",
      jobId: "1f3b8a52-2c4d-4f0a-9c2e-5d1a8b7c6e40",
      apiUrl: "https://api.ashbyhq.com/posting-api/job-board/acme",
      applyUrl: "https://jobs.ashbyhq.com/acme/1f3b8a52-2c4d-4f0a-9c2e-5d1a8b7c6e40",
    });
  });

  test("rejects unsupported job URLs", () => {
    expect(() => parseJobUrl("https://example.com/jobs/123")).toThrow(
      "Supports Greenhouse, Lever, and Ashby job URLs.",
    );
  });
});
