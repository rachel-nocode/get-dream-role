import { test, expect } from '@playwright/test';

test.describe('Privacy page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacy');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Privacy Policy/);
  });

  test('shows Privacy Policy heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
  });

  test('shows contact email', async ({ page }) => {
    await expect(page.getByText('witchaudiostudios@gmail.com')).toBeVisible();
  });

  test('email link is correct', async ({ page }) => {
    const link = page.getByRole('link', { name: 'witchaudiostudios@gmail.com' }).first();
    await expect(link).toHaveAttribute('href', 'mailto:witchaudiostudios@gmail.com');
  });

  test('shows key policy sections', async ({ page }) => {
    await expect(page.getByText('Information We Collect')).toBeVisible();
    await expect(page.getByText('How We Use Your Information')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Third-Party Services/i })).toBeVisible();
  });
});

test.describe('Terms page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/terms');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Terms of Service/);
  });

  test('shows Terms of Service heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
  });

  test('shows contact email', async ({ page }) => {
    await expect(page.getByText('witchaudiostudios@gmail.com')).toBeVisible();
  });

  test('mentions $9.99 price', async ({ page }) => {
    await expect(page.getByText(/\$9\.99/)).toBeVisible();
  });

  test('shows key sections', async ({ page }) => {
    await expect(page.getByText('Acceptance of Terms')).toBeVisible();
    await expect(page.getByRole('heading', { name: /One-Time Payment/i })).toBeVisible();
    await expect(page.getByText('Acceptable Use')).toBeVisible();
  });
});
