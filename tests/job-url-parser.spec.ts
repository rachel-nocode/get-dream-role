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

  test("rejects unsupported job URLs", () => {
    expect(() => parseJobUrl("https://example.com/jobs/123")).toThrow(
      "V1 supports Greenhouse and Lever job URLs only.",
    );
  });
});
