import { test, expect } from '@playwright/test';

const JOB_DESCRIPTION = 'We are looking for a skilled software engineer with experience in React, TypeScript, Node.js, and AWS to join our growing platform team.';

async function goToStep2(page: any) {
  await page.getByText('Greenhouse').click();
  await page.getByRole('button', { name: /Continue/i }).click();
  await expect(page.getByPlaceholder(/Senior Frontend/i)).toBeVisible({ timeout: 8000 });
}

async function goToStep3(page: any) {
  await goToStep2(page);
  await page.getByPlaceholder(/Senior Frontend/i).fill('Software Engineer');
  await page.getByPlaceholder(/Paste the full/i).fill(JOB_DESCRIPTION);
  await page.getByRole('button', { name: /Continue/i }).click();
  await expect(page.getByText('Upload Your Resume').first()).toBeVisible({ timeout: 8000 });
}

test.describe('Optimize wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/optimize');
    await page.evaluate(() => {
      sessionStorage.removeItem('gdrWizard');
      localStorage.removeItem('gdrPaid');
    });
    await page.reload();
  });

  test('loads on step 1 — ATS selection', async ({ page }) => {
    await expect(page.getByText('Optimize Your Resume')).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  test('step 1: selecting an ATS target enables Continue', async ({ page }) => {
    await page.getByText('Greenhouse').click();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeEnabled();
  });

  test('step 1 → step 2: advance after selecting ATS', async ({ page }) => {
    await goToStep2(page);
    await expect(page.getByPlaceholder(/Senior Frontend/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Paste the full/i)).toBeVisible();
  });

  test('step 2: Continue disabled with short job description', async ({ page }) => {
    await goToStep2(page);
    await page.getByPlaceholder(/Paste the full/i).fill('Too short');
    await expect(page.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  test('step 2 → step 3: advance after filling job description', async ({ page }) => {
    await goToStep3(page);
    await expect(page.getByText('Upload Your Resume').first()).toBeVisible();
  });

  test('Back button returns to step 1 from step 2', async ({ page }) => {
    await goToStep2(page);
    await page.getByRole('button', { name: /Back/i }).click();
    await expect(page.getByText('Greenhouse')).toBeVisible({ timeout: 5000 });
  });

  test('wizard state persists after page reload', async ({ page }) => {
    await goToStep2(page);
    await page.getByPlaceholder(/Senior Frontend/i).fill('Frontend Engineer');
    await page.reload();
    await expect(page.getByPlaceholder(/Senior Frontend/i)).toHaveValue('Frontend Engineer', { timeout: 8000 });
  });

  test('payment gate shown on step 3 analyze when unpaid', async ({ page }) => {
    await page.evaluate((jd) => {
      sessionStorage.setItem('gdrWizard', JSON.stringify({
        step: 3,
        atsTarget: 'greenhouse',
        jobTitle: 'Software Engineer',
        jobDescription: jd,
        resumeFileName: 'resume.pdf',
        resumeText: 'John Doe. Software Engineer with 5 years React TypeScript experience building web applications.',
      }));
    }, JOB_DESCRIPTION);
    await page.reload();
    await expect(page.getByRole('button', { name: /Analyze Resume/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Analyze Resume/i }).click();
    await expect(page.getByText(/Unlock Your Analysis/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('$9.99').first()).toBeVisible();
  });

  test('already paid skips payment gate and starts analysis', async ({ page }) => {
    await page.evaluate((jd) => {
      localStorage.setItem('gdrPaid', 'true');
      sessionStorage.setItem('gdrWizard', JSON.stringify({
        step: 3,
        atsTarget: 'greenhouse',
        jobTitle: 'Software Engineer',
        jobDescription: jd,
        resumeFileName: 'resume.pdf',
        resumeText: 'John Doe. Software Engineer with 5 years React TypeScript experience building web applications.',
      }));
    }, JOB_DESCRIPTION);
    await page.reload();
    await page.getByRole('button', { name: /Analyze Resume/i }).click();
    // Analysis overlay appears
    await expect(page.getByText(/Building your optimized resume/i)).toBeVisible({ timeout: 8000 });
  });

  test('step 3 file upload zone is visible', async ({ page }) => {
    await goToStep3(page);
    await expect(page.getByText('Upload Your Resume').first()).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });
});
