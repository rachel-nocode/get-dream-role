import { test, expect } from '@playwright/test';

test.describe('Payment / pricing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payment');
  });

  test('shows $9.99 price', async ({ page }) => {
    await expect(page.getByText('$9.99')).toBeVisible();
  });

  test('shows one-time payment label', async ({ page }) => {
    await expect(page.getByText(/one.time payment/i)).toBeVisible();
  });

  test('shows feature list', async ({ page }) => {
    await expect(page.getByText('Unlimited resume analyses')).toBeVisible();
    await expect(page.getByText(/AI-powered scoring/i)).toBeVisible();
  });

  test('Get Instant Access button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Get Instant Access/i })).toBeVisible();
  });

  test('shows Stripe attribution', async ({ page }) => {
    await expect(page.getByText(/Stripe/i)).toBeVisible();
  });

  test('back link navigates to home', async ({ page }) => {
    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page).toHaveURL('/');
  });

  test('already paid state shown when gdrPaid is set', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('gdrPaid', 'true'));
    await page.reload();
    await expect(page.getByText("You're already unlocked")).toBeVisible();
    await expect(page.getByRole('button', { name: /Go to Optimizer/i })).toBeVisible();
  });
});
