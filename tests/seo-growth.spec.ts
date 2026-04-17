import { expect, test } from "@playwright/test";

test.describe("SEO growth surfaces", () => {
  test("robots and sitemap expose the new SEO routes", async ({ request }) => {
    const robotsResponse = await request.get("/robots.txt");
    expect(robotsResponse.ok()).toBeTruthy();
    const robotsText = await robotsResponse.text();
    expect(robotsText).toContain("Allow: /");
    expect(robotsText).toContain(
      "Sitemap: https://www.getdreamrole.com/sitemap.xml",
    );

    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.ok()).toBeTruthy();
    const sitemapText = await sitemapResponse.text();

    expect(sitemapText).toContain("https://www.getdreamrole.com/ats/icims");
    expect(sitemapText).toContain("https://www.getdreamrole.com/ats/taleo");
    expect(sitemapText).toContain(
      "https://www.getdreamrole.com/blog/optimize-resume-workday-ats",
    );
    expect(sitemapText).toContain(
      "https://www.getdreamrole.com/blog/why-qualified-candidates-get-rejected-by-ats",
    );
  });

  test("blog index highlights the new high-intent guides", async ({ page }) => {
    await page.goto("/blog");

    await expect(
      page.getByRole("heading", { name: "Resume & ATS Guides" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "How to Optimize Your Resume for Workday ATS (2026 Guide)",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "ATS-Friendly Resume Format: What Actually Parses in 2026",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Why Qualified Candidates Still Get Rejected by ATS",
      }),
    ).toBeVisible();
  });

  test("new ATS landing pages and guides include schema and product paths", async ({
    page,
  }) => {
    await page.goto("/ats/icims");
    await expect(
      page.getByRole("heading", { name: "Get more interviews through iCIMS." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Full iCIMS optimization guide",
      }),
    ).toBeVisible();

    const icimsSchema = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(icimsSchema).toContain('"@type":"WebPage"');

    await page.goto("/blog/optimize-resume-workday-ats");
    await expect(
      page.getByRole("heading", {
        name: "How to Optimize Your Resume for Workday ATS (2026 Guide)",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Optimize my resume for Workday" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Optimize my resume now" }),
    ).toBeVisible();

    const articleSchema = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(articleSchema).toContain('"@type":"BlogPosting"');
  });
});
