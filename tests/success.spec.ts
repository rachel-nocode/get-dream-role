import { test, expect } from '@playwright/test';

test.describe('Success page', () => {
  test('demo mode shows success state', async ({ page }) => {
    await page.goto('/success?demo=true');
    await expect(page.getByText("You're all set.")).toBeVisible({ timeout: 10000 });
  });

  test('demo mode sets gdrPaid in localStorage', async ({ page }) => {
    await page.goto('/success?demo=true');
    await expect(page.getByText("You're all set.")).toBeVisible({ timeout: 10000 });
    const paid = await page.evaluate(() => localStorage.getItem('gdrPaid'));
    expect(paid).toBe('true');
  });

  test('success page shows unlock items', async ({ page }) => {
    await page.goto('/success?demo=true');
    await expect(page.getByText('Unlimited resume analyses')).toBeVisible({ timeout: 10000 });
  });

  test('Continue to Optimizer button links to /optimize', async ({ page }) => {
    await page.goto('/success?demo=true');
    await expect(page.getByRole('button', { name: /Continue to Optimizer/i })).toBeVisible({ timeout: 10000 });
  });

  test('missing session_id shows error state', async ({ page }) => {
    await page.goto('/success');
    await expect(page.getByText(/Payment not confirmed/i)).toBeVisible({ timeout: 10000 });
  });

  test('error state has Try Again and Back to Home links', async ({ page }) => {
    await page.goto('/success');
    await expect(page.getByRole('link', { name: 'Try Again' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible({ timeout: 10000 });
  });
});
