import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// HubSpot renders fields dynamically via JS — wait up to 15s for form to load
const HS_TIMEOUT = 15000;

// Intercept HubSpot submission network request and return mock success
async function interceptHubSpot(page) {
  await page.route('**hsforms.com/submissions/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ inlineMessage: 'Thanks for submitting the form.' }),
    });
  });
  await page.route('**api.hsforms.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ inlineMessage: 'Thanks for submitting the form.' }),
    });
  });
}

// ─── CONTACT FORM ────────────────────────────────────────────────────────────

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/company/contact.html');
    await page.waitForSelector('.hbspt-form form', { timeout: HS_TIMEOUT });
  });

  test('contact form renders on the page', async ({ page }) => {
    await expect(page.locator('.hbspt-form form')).toBeVisible();
  });

  test('contact form has required fields', async ({ page }) => {
    const form = page.locator('.hbspt-form form');
    await expect(form.locator('input.hs-input[name="firstname"]')).toBeVisible();
    await expect(form.locator('input.hs-input[name="lastname"]')).toBeVisible();
    await expect(form.locator('input.hs-input[name="email"]')).toBeVisible();
    await expect(form.locator('input.hs-input[name="company"]')).toBeVisible();
  });

  test('contact form submit button is present', async ({ page }) => {
    await expect(page.locator('.hbspt-form .hs-button')).toBeVisible();
  });

  test('contact form fields accept input', async ({ page }) => {
    const form = page.locator('.hbspt-form form');
    await form.locator('input.hs-input[name="firstname"]').fill('Test');
    await form.locator('input.hs-input[name="lastname"]').fill('User');
    await form.locator('input.hs-input[name="email"]').fill('test@example.com');
    await form.locator('input.hs-input[name="company"]').fill('Test Company');
    await expect(form.locator('input.hs-input[name="firstname"]')).toHaveValue('Test');
    await expect(form.locator('input.hs-input[name="email"]')).toHaveValue('test@example.com');
  });

  test('contact form intercepts submission network request', async ({ page }) => {
    await interceptHubSpot(page);
    const form = page.locator('.hbspt-form form');
    await form.locator('input.hs-input[name="firstname"]').fill('Test');
    await form.locator('input.hs-input[name="lastname"]').fill('User');
    await form.locator('input.hs-input[name="email"]').fill('test@example.com');
    await form.locator('input.hs-input[name="company"]').fill('Test Company');

    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('hsforms') || req.url().includes('hubspot')),
      page.locator('.hbspt-form .hs-button').click(),
    ]);

    expect(request).toBeTruthy();
  });
});

// ─── PROPEL26 LEAD-GEN FORM — INLINE VALIDATION ──────────────────────────────
// Custom form (not HubSpot) with client-side validation. Fields get .has-error
// on submit when empty; error clears when the field is filled.

test.describe('Propel26 Form — Inline Validation', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop', 'Desktop-only');
    await page.goto('/lead-gen/forsys-propel26.html');
  });

  test('submitting empty form shows errors; re-submitting with field filled clears its error', async ({ page }) => {
    const submit = page.locator('#propel26-form button[type="submit"]');
    await submit.click();
    await expect(page.locator('#full_name')).toHaveClass(/has-error/);
    // errors only clear on re-submit — fill field then submit again
    await page.locator('#full_name').fill('John Doe');
    await submit.click();
    await expect(page.locator('#full_name')).not.toHaveClass(/has-error/);
  });
});

// ─── OTHER HUBSPOT FORM PAGES — STRUCTURAL CHECKS ────────────────────────────
// All pages below embed HubSpot forms. Tests verify structural integrity only:
// the page loads (200), the HubSpot embed script tag is present, and the
// correct portal ID (3988816) is wired in. No waiting for HubSpot JS to execute.
//
// To retire a form page: remove its URL from the list below.
// To add a new form page: add its URL to the list below.
// Runs Desktop only — HTML content is identical across viewports.

const HS_FORM_PAGES = [
  // Lead-gen (temporary — remove URL when page is retired)
  '/lead-gen/salesforce-lead-gen-callout-form.html',
  // On-demand webinar pages (11 total)
  '/past-webinars/agentforce-webinar-ondemand.html',
  '/past-webinars/apprise-healthcare-ondemand.html',
  '/past-webinars/apprise-pricing-ondemand.html',
  '/past-webinars/clm-webinar-ondemand.html',
  '/past-webinars/integrations-webinar-ondemand.html',
  '/past-webinars/manufacturing-webinar-ondemand.html',
  '/past-webinars/pharma-webinar-ondemand.html',
  '/past-webinars/rev30-webinar-ondemand.html',
  '/past-webinars/revramp-salesforce-webinar-ondemand.html',
  '/past-webinars/spiff-webinar-ondemand.html',
];

test.describe('HubSpot Form Pages — Structural Checks', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop', 'Desktop-only — HTML is viewport-independent');
  });

  for (const url of HS_FORM_PAGES) {
    test(url, async ({ page }) => {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(response.status(), `${url} — page did not load (${response.status()})`).toBe(200);
      const html = await page.content();
      expect(html, `${url} — HubSpot embed script missing`).toContain('hsforms.net');
      expect(html, `${url} — Portal ID 3988816 missing`).toContain('3988816');
    });
  }
});

// ─── EMBED PAGES — HTML STRUCTURE SMOKE TEST (all 253 pages) ─────────────────
// Checks what YOUR code controls — no waiting for HubSpot JS to execute.
// Verifies: page loads (200), HubSpot embed script present, correct portal ID.
// Runs Desktop only — content is identical across viewports, no need to triple-run.

const embedDir = path.join(process.cwd(), 'embed');
const embedFiles = fs.readdirSync(embedDir)
  .filter(f => f.endsWith('.html'))
  .sort();

test.describe('Embed Pages — HTML Structure Smoke Test', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop', 'Desktop-only smoke test');
  });

  for (const file of embedFiles) {
    test(file, async ({ page }) => {
      const url = `/embed/${encodeURIComponent(file)}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      expect(response.status(), `${file} — page did not load (${response.status()})`).toBe(200);

      const html = await page.content();
      expect(html, `${file} — HubSpot embed script missing`).toContain('js.hsforms.net/forms/embed/v2.js');
      expect(html, `${file} — Portal ID 3988816 missing`).toContain('3988816');
    });
  }
});
