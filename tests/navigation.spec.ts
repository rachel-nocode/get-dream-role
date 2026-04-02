import { test, expect } from '@playwright/test';

test.describe('Navigation & footer persistence', () => {
  const pages = ['/', '/payment', '/optimize', '/privacy', '/terms'];

  for (const path of pages) {
    test(`footer is visible on ${path}`, async ({ page }) => {
      await page.goto(path);
      const footer = page.locator('footer');
      await expect(footer.getByText('GetDreamRole')).toBeVisible();
      await expect(footer.getByText('© 2026')).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'Terms' })).toBeVisible();
    });
  }

  test('privacy link in footer goes to /privacy', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL('/privacy');
  });

  test('terms link in footer goes to /terms', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').getByRole('link', { name: 'Terms' }).click();
    await expect(page).toHaveURL('/terms');
  });

  test('back link on privacy returns to home', async ({ page }) => {
    await page.goto('/privacy');
    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page).toHaveURL('/');
  });

  test('back link on terms returns to home', async ({ page }) => {
    await page.goto('/terms');
    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page).toHaveURL('/');
  });
});
