import { test, expect } from '@playwright/test';

test.describe('API routes', () => {
  test('GET /api/verify-payment?demo=true returns paid:true', async ({ request }) => {
    const res = await request.get('/api/verify-payment?demo=true');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.paid).toBe(true);
    expect(body.demo).toBe(true);
  });

  test('GET /api/verify-payment with no params returns 400', async ({ request }) => {
    const res = await request.get('/api/verify-payment');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.paid).toBe(false);
  });

  test('POST /api/checkout returns a redirect URL', async ({ request }) => {
    const res = await request.post('/api/checkout', {
      data: { returnPath: '/optimize' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.url).toBeTruthy();
    expect(typeof body.url).toBe('string');
  });

  test('POST /api/analyze returns result with atsScore and sections', async ({ request }) => {
    const res = await request.post('/api/analyze', {
      data: {
        atsTarget: 'greenhouse',
        jobTitle: 'Software Engineer',
        jobDescription: 'We need a React developer with TypeScript Node.js and AWS experience for our growing platform team.',
        resumeText: 'John Doe. Software Engineer. 5 years building React TypeScript Node.js applications. AWS certified. Led teams of 3-5 engineers.',
      },
      timeout: 30000,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('atsScore');
    expect(typeof body.atsScore).toBe('number');
    // sections may be called 'sections' (demo) or 'sectionFeedback' (Groq)
    const hasSections = Array.isArray(body.sections) || Array.isArray(body.sectionFeedback);
    expect(hasSections).toBe(true);
  });

  test('POST /api/analyze with empty body still returns a result', async ({ request }) => {
    const res = await request.post('/api/analyze', {
      data: { atsTarget: '', jobTitle: '', jobDescription: '', resumeText: '' },
      timeout: 30000,
    });
    expect([200, 400, 422]).toContain(res.status());
  });

  test('POST /api/jobs/match requires an optimized resume', async ({ request }) => {
    const res = await request.post('/api/jobs/match', {
      data: { optimizedResume: '', jobTitle: 'Frontend Engineer', keywords: ['React'] },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Optimized resume/i);
  });
});
