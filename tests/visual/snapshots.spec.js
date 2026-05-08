import { test, expect } from '@playwright/test';

// ─── VISUAL SNAPSHOTS — ABOVE FOLD (nav + hero) ───────────────────────────────
// Snapshots the viewport only — not the full page. Captures nav + hero section.
// Focused: one representative page per distinct layout template.
// Stable: no scroll-fade cards, no dynamic below-fold content, no full-page noise.
//
// First run:  npx playwright test tests/visual --update-snapshots  (generates baselines)
// Subsequent: npx playwright test tests/visual                     (compares against baselines)
// After intentional redesign: re-run with --update-snapshots and commit the new PNGs.
//
// Tablet skipped — covered by Desktop + Mobile.

async function prepPage(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      ::-webkit-scrollbar { display: none !important; }
      html { scrollbar-width: none !important; }
    `,
  });
}

const PAGES = [
  { name: 'homepage',                   url: '/index.html' },
  { name: 'services',                   url: '/services/revenue-lifecycle-strategy.html' },
  { name: 'solutions',                  url: '/solutions/salesforce/agentforce-crm.html' },
  { name: 'forsys-solutions',           url: '/forsys-solutions/revramp.html' },
  { name: 'industries',                 url: '/industries/hi-tech.html' },
  { name: 'partnerships-strategic',     url: '/partnerships/salesforce.html' },
  { name: 'partnerships-other',         url: '/partnerships/rocketlane.html' },
  { name: 'resources-customer-stories', url: '/resources/customer-stories.html' },
  { name: 'resources-blogs',            url: '/resources/blogs.html' },
  { name: 'resources-events',           url: '/resources/events.html' },
  { name: 'company-about',              url: '/company/about.html' },
  { name: 'company-policy',             url: '/company/privacy-policy.html' },
  { name: 'company-contact',            url: '/company/contact.html' },
  { name: 'past-webinar',               url: '/past-webinars/agentforce-webinar-ondemand.html' },
  { name: 'lead-gen',                   url: '/lead-gen/forsys-propel26.html' },
];

test.describe('Visual Snapshots', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'Tablet', 'Tablet skipped — covered by Desktop + Mobile');
  });

  for (const { name, url } of PAGES) {
    test(name, async ({ page }) => {
      await page.goto(url, { waitUntil: 'load' });
      await prepPage(page);
      await expect(page).toHaveScreenshot(`${name}.png`);
    });
  }
});
