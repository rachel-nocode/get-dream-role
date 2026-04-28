import type { Page } from '@playwright/test';

export async function createPaidTestUser(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gdrPaid', 'true');
    localStorage.setItem('gdrFreeUsed', 'true');
    localStorage.setItem(
      'gdrTestUser',
      JSON.stringify({
        email: 'paid.mobile.user@example.com',
        plan: 'lifetime',
      }),
    );
  });
}

export async function clearPaidTestUser(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('gdrPaid');
    localStorage.removeItem('gdrFreeUsed');
    localStorage.removeItem('gdrTestUser');
    sessionStorage.removeItem('gdrWizard');
    sessionStorage.removeItem('gdrResult');
  });
}
