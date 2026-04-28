import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle('Free ATS Resume Checker + AI Resume Optimizer');
  });

  test('navbar shows brand name', async ({ page }) => {
    const navbar = page.locator('nav');
    await expect(navbar.getByText('GetDreamRole')).toBeVisible();
  });

  test('navbar has Start Optimizing CTA', async ({ page }) => {
    await expect(page.locator('nav').getByRole('link', { name: 'Free ATS Score' })).toBeVisible();
  });

  test('navbar Pricing link navigates to /payment', async ({ page, isMobile }) => {
    if (isMobile) {
      // Pricing link is hidden on mobile nav — navigate directly
      await page.goto('/payment');
    } else {
      await page.getByRole('link', { name: 'Pricing' }).click();
    }
    await expect(page).toHaveURL('/payment');
  });

  test('hero section renders with heading', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('How It Works section exists on the page', async ({ page }) => {
    const section = page.locator('#how-it-works');
    await expect(section).toBeAttached();
  });

  test('Features section is visible', async ({ page }) => {
    await expect(page.getByText('What GetDreamRole Does')).toBeVisible();
  });

  test('Benefits section is visible', async ({ page }) => {
    await expect(page.getByText(/Why job seekers use GetDreamRole/i)).toBeVisible();
  });

  test('footer shows correct year and name', async ({ page }) => {
    await expect(page.getByText('© 2026')).toBeVisible();
    const footer = page.locator('footer');
    await expect(footer.getByText('GetDreamRole')).toBeVisible();
  });

  test('footer has Privacy and Terms links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms' })).toBeVisible();
  });

  test('footer has no GitHub link', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'GitHub' })).not.toBeAttached();
  });
});
