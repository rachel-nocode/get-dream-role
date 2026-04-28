import { test, expect } from '@playwright/test';
import { fakeAnalysisResult } from './helpers/analysis-result';
import { clearPaidTestUser, createPaidTestUser } from './helpers/paid-user';

const JOB_DESCRIPTION =
  'We need a frontend engineer with React, TypeScript, Node.js, AWS, REST APIs, testing, accessibility, and product-focused collaboration experience.';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

// These tests run in the 'mobile' project (Pixel 5 viewport)
test.describe('Mobile layout', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only checks');
    await clearPaidTestUser(page);
  });

  test('landing page renders on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('GetDreamRole').first()).toBeVisible();
    await expect(page.getByText('I thought my resume was fine').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('footer is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('© 2026')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('optimize page is usable on mobile', async ({ page }) => {
    await page.goto('/optimize');
    await expect(page.getByRole('heading', { name: 'Optimize Your Resume' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('payment page renders on mobile', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.getByText('$9.99')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('demo payment success unlocks a paid mobile user', async ({ page }) => {
    await page.goto('/success?demo=true&return=/optimize');
    await expect(page.getByText("You're all set.")).toBeVisible();

    await page.getByRole('button', { name: /Continue to Optimizer/i }).click();
    await expect(page).toHaveURL('/optimize');
    await expect(page.getByRole('heading', { name: 'Optimize Your Resume' })).toBeVisible();

    await page.goto('/payment');
    await expect(page.getByText("You're already unlocked")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('paid mobile user can complete the optimizer flow', async ({ page }) => {
    await page.route('**/api/analyze', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeAnalysisResult),
      });
    });

    await createPaidTestUser(page);
    await page.goto('/optimize');

    await page.getByText('Greenhouse').click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByPlaceholder(/Senior Frontend/i).fill('Frontend Engineer');
    await page.getByPlaceholder(/Paste the full/i).fill(JOB_DESCRIPTION);
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /Use Demo Resume/i }).click();
    await expect(page.getByText('demo-resume.pdf')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: /Analyze Resume/i }).click();
    await expect(page).toHaveURL('/results');
    await expect(page.getByRole('heading', { name: /Analysis Results/i })).toBeVisible();
    await expect(page.getByText('Greenhouse', { exact: true })).toBeVisible();
    await expect(page.getByText('Kubernetes')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
