import { test, expect } from '@playwright/test';

// ─── VISUAL SNAPSHOTS — ABOVE FOLD (nav + hero) ───────────────────────────────
// Snapshots the viewport only — not the full page. Captures nav + hero section.
// 78 pages × 3 viewports (Desktop 1280px, Tablet 1024px, Mobile 375px) = 234 tests.
// Stable: animations frozen, scrollbar hidden, JS timers cleared, slideshow reset to slide 0.
//
// First run:  npx playwright test tests/visual --update-snapshots  (generates baselines)
// Subsequent: npx playwright test tests/visual                     (compares against baselines)
// After intentional redesign: re-run with --update-snapshots and commit the new PNGs.

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
  // Kill all JS timers so slideshows stop advancing
  await page.evaluate(() => {
    const high = setTimeout(() => {}, 0);
    for (let i = 0; i <= high; i++) clearTimeout(i);
    const highI = setInterval(() => {}, 99999);
    for (let i = 0; i <= highI; i++) clearInterval(i);
  });
  // Wait for browser to finish painting after timers are killed
  await page.waitForTimeout(300);
  // Reset hero slideshow to slide 0 (after timers are dead so it cannot advance again)
  await page.evaluate(() => {
    const firstDot = document.querySelector('.slide-dot[data-idx="0"]');
    if (firstDot) firstDot.click();
  });
}

const PAGES = [
  // ── Main ──────────────────────────────────────────────────────────────────
  { name: 'homepage',                                    url: '/index.html' },
  { name: 'contact',                                     url: '/contact.html' },
  { name: 'privacy',                                     url: '/privacy.html' },

  // ── Services ──────────────────────────────────────────────────────────────
  { name: 'services-revenue-lifecycle-strategy',         url: '/services/revenue-lifecycle-strategy.html' },
  { name: 'services-ai-agents-development',              url: '/services/ai-agents-development.html' },
  { name: 'services-ai-application-development',        url: '/services/ai-application-development.html' },
  { name: 'services-ai-enabled-managed-services',       url: '/services/ai-enabled-managed-services.html' },
  { name: 'services-autonomous-commerce',               url: '/services/autonomous-commerce.html' },
  { name: 'services-build-or-buy-strategy',             url: '/services/build-or-buy-strategy.html' },
  { name: 'services-data-migration',                    url: '/services/data-migration.html' },
  { name: 'services-devops',                            url: '/services/devops.html' },
  { name: 'services-enterprise-ai-strategy',            url: '/services/enterprise-ai-strategy.html' },
  { name: 'services-integrations',                      url: '/services/integrations.html' },

  // ── Solutions — Salesforce ─────────────────────────────────────────────────
  { name: 'sol-sf-agentforce-crm',                      url: '/solutions/salesforce/agentforce-crm.html' },
  { name: 'sol-sf-agentforce-commerce',                 url: '/solutions/salesforce/agentforce-commerce.html' },
  { name: 'sol-sf-agentforce-platform',                 url: '/solutions/salesforce/agentforce-platform.html' },
  { name: 'sol-sf-agentforce-revenue-management',       url: '/solutions/salesforce/agentforce-revenue-management.html' },
  { name: 'sol-sf-manufacturing-cloud',                 url: '/solutions/salesforce/manufacturing-cloud.html' },

  // ── Solutions — Conga ─────────────────────────────────────────────────────
  { name: 'sol-conga-contract-lifecycle-management',    url: '/solutions/conga/contract-lifecycle-management.html' },
  { name: 'sol-conga-revenue-and-commerce',             url: '/solutions/conga/revenue-and-commerce.html' },
  { name: 'sol-conga-smart-cpq',                        url: '/solutions/conga/smart-cpq.html' },
  { name: 'sol-conga-smart-pricing-optimisation',       url: '/solutions/conga/smart-pricing-optimisation.html' },

  // ── Solutions — Oracle ────────────────────────────────────────────────────
  { name: 'sol-oracle-bpa-aistudio',                    url: '/solutions/oracle/bpa-aistudio.html' },
  { name: 'sol-oracle-fusion-finance-accounting',       url: '/solutions/oracle/fusion-finance-accounting.html' },
  { name: 'sol-oracle-fusion-supply-chain',             url: '/solutions/oracle/fusion-supply-chain.html' },
  { name: 'sol-oracle-oic-paas',                        url: '/solutions/oracle/oic-paas.html' },

  // ── Forsys Solutions ──────────────────────────────────────────────────────
  { name: 'fs-revramp',                                 url: '/forsys-solutions/revramp.html' },
  { name: 'fs-lexishift',                               url: '/forsys-solutions/lexishift.html' },
  { name: 'fs-revmove',                                 url: '/forsys-solutions/revmove.html' },
  { name: 'fs-mna-for-salesforce',                      url: '/forsys-solutions/mna-for-salesforce.html' },
  { name: 'fs-aitest',                                  url: '/forsys-solutions/aitest.html' },
  { name: 'fs-ai-agents',                               url: '/forsys-solutions/ai-agents.html' },

  // ── Industries ────────────────────────────────────────────────────────────
  { name: 'ind-hi-tech',                                url: '/industries/hi-tech.html' },
  { name: 'ind-financial-services',                     url: '/industries/financial-services.html' },
  { name: 'ind-healthcare-life-sciences',               url: '/industries/healthcare-life-sciences.html' },
  { name: 'ind-manufacturing',                          url: '/industries/manufacturing.html' },
  { name: 'ind-saas-subscription',                      url: '/industries/saas-subscription.html' },

  // ── Partnerships ──────────────────────────────────────────────────────────
  { name: 'partner-salesforce',                         url: '/partnerships/salesforce.html' },
  { name: 'partner-conga',                              url: '/partnerships/conga.html' },
  { name: 'partner-oracle',                             url: '/partnerships/oracle.html' },
  { name: 'partner-rocketlane',                         url: '/partnerships/rocketlane.html' },
  { name: 'partner-provus',                             url: '/partnerships/provus.html' },
  { name: 'partner-m3ter',                              url: '/partnerships/m3ter.html' },
  { name: 'partner-servicenow',                         url: '/partnerships/servicenow.html' },
  { name: 'partner-flosum',                             url: '/partnerships/flosum.html' },
  { name: 'partner-anthropic',                          url: '/partnerships/anthropic.html' },

  // ── Resources ─────────────────────────────────────────────────────────────
  { name: 'res-customer-stories',                       url: '/resources/customer-stories.html' },
  { name: 'res-blogs',                                  url: '/resources/blogs.html' },
  { name: 'res-events',                                 url: '/resources/events.html' },
  { name: 'res-thought-leadership',                     url: '/resources/thought-leadership.html' },
  { name: 'res-webinars-events',                        url: '/resources/webinars-events.html' },
  { name: 'res-rev30-webinar',                          url: '/resources/rev30-webinar-ondemand.html' },

  // ── Company ───────────────────────────────────────────────────────────────
  { name: 'co-about',                                   url: '/company/about.html' },
  { name: 'co-careers',                                 url: '/company/careers.html' },
  { name: 'co-code-of-conduct',                         url: '/company/code-of-conduct.html' },
  { name: 'co-contact',                                 url: '/company/contact.html' },
  { name: 'co-culture',                                 url: '/company/culture.html' },
  { name: 'co-leadership',                              url: '/company/leadership.html' },
  { name: 'co-news-press',                              url: '/company/news-press.html' },
  { name: 'co-privacy-policy',                          url: '/company/privacy-policy.html' },
  { name: 'co-sustainability-policy',                   url: '/company/sustainability-policy.html' },

  // ── Past Webinars ─────────────────────────────────────────────────────────
  { name: 'webinar-agentforce',                         url: '/past-webinars/agentforce-webinar-ondemand.html' },
  { name: 'webinar-apprise-healthcare',                 url: '/past-webinars/apprise-healthcare-ondemand.html' },
  { name: 'webinar-apprise-pricing',                    url: '/past-webinars/apprise-pricing-ondemand.html' },
  { name: 'webinar-clm',                                url: '/past-webinars/clm-webinar-ondemand.html' },
  { name: 'webinar-integrations',                       url: '/past-webinars/integrations-webinar-ondemand.html' },
  { name: 'webinar-manufacturing',                      url: '/past-webinars/manufacturing-webinar-ondemand.html' },
  { name: 'webinar-pharma',                             url: '/past-webinars/pharma-webinar-ondemand.html' },
  { name: 'webinar-rev30',                              url: '/past-webinars/rev30-webinar-ondemand.html' },
  { name: 'webinar-revramp-salesforce',                 url: '/past-webinars/revramp-salesforce-webinar-ondemand.html' },
  { name: 'webinar-spiff',                              url: '/past-webinars/spiff-webinar-ondemand.html' },
  { name: 'webinar-womens-day-2022',                    url: '/past-webinars/womens-day-2022.html' },

  // ── Lead Gen ──────────────────────────────────────────────────────────────
  { name: 'lead-gen-propel26',                          url: '/lead-gen/forsys-propel26.html' },
  { name: 'lead-gen-apprise-rsvp',                      url: '/lead-gen/apprise-us-rsvp.html' },
  { name: 'lead-gen-awt',                               url: '/lead-gen/awt-lead-gen-callout-form.html' },
  { name: 'lead-gen-conga',                             url: '/lead-gen/conga-lead-gen-callout-form.html' },
  { name: 'lead-gen-oracle',                            url: '/lead-gen/oracle-lead-gen-callout-form.html' },
  { name: 'lead-gen-salesforce',                        url: '/lead-gen/salesforce-lead-gen-callout-form.html' },
];

test.describe('Visual Snapshots', () => {
  for (const { name, url } of PAGES) {
    test(name, async ({ page }) => {
      await page.goto(url, { waitUntil: 'load' });
      await prepPage(page);
      await expect(page).toHaveScreenshot(`${name}.png`);
    });
  }
});
