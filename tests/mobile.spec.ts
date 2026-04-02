import { test, expect } from '@playwright/test';

// These tests run in the 'mobile' project (Pixel 5 viewport)
test.describe('Mobile layout', () => {
  test('landing page renders on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('GetDreamRole').first()).toBeVisible();
  });

  test('footer is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('© 2026')).toBeVisible();
  });

  test('optimize page is usable on mobile', async ({ page }) => {
    await page.goto('/optimize');
    await expect(page.getByText('Optimize Your Resume')).toBeVisible();
  });

  test('payment page renders on mobile', async ({ page }) => {
    await page.goto('/payment');
    await expect(page.getByText('$9.99')).toBeVisible();
  });
});
