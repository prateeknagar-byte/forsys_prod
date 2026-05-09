import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ─── ALL PAGES — HTTP 200 CHECK ───────────────────────────────────────────────
// Auto-discovers every HTML file in the production site and verifies it loads
// with HTTP 200. Catches deleted, renamed, or misconfigured pages.
// Excludes: embed/ (has its own smoke test), forsys-website-new-main/ (not live),
// node_modules/, playwright-report/, test-results/, assets/.
// Runs on all 3 viewports — confirms pages serve correctly on Desktop, Tablet, Mobile.

const EXCLUDE = new Set(['embed', 'forsys-website-new-main', 'node_modules', 'playwright-report', 'test-results', 'assets']);
const ROOT = process.cwd();

function collectPages(dir, base = '') {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDE.has(entry.name)) {
        results.push(...collectPages(path.join(dir, entry.name), `${base}${entry.name}/`));
      }
    } else if (entry.name.endsWith('.html')) {
      results.push(`/${base}${entry.name}`);
    }
  }
  return results.sort();
}

const PAGES = collectPages(ROOT);

test.describe('All Pages — HTTP 200', () => {
  for (const url of PAGES) {
    test(url, async ({ page }) => {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(response.status(), `${url} returned ${response.status()}`).toBe(200);
    });
  }
});

// ─── HOMEPAGE NAV LINKS — ALL RESOLVE ────────────────────────────────────────
// Visits the homepage, collects every internal <a href> in the nav, and checks
// each one returns HTTP 200. Catches nav links pointing to missing pages.

test.describe('Homepage Nav Links — All Resolve', () => {
  test('all nav links return HTTP 200', async ({ page }) => {
    test.skip(page.context().browser().browserType().name() !== 'chromium');
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('#main-nav a[href]')]
        .map(a => a.getAttribute('href'))
        .filter(h => h && !h.startsWith('http') && !h.startsWith('mailto') && !h.startsWith('#') && h.endsWith('.html'))
    );

    const unique = [...new Set(hrefs)];
    expect(unique.length, 'No nav links found').toBeGreaterThan(0);

    for (const href of unique) {
      const url = href.startsWith('/') ? href : `/${href}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(response.status(), `Nav link ${href} returned ${response.status()}`).toBe(200);
    }
  });
});

// ─── HOMEPAGE FOOTER LINKS — ALL RESOLVE ─────────────────────────────────────
// Visits the homepage, collects every internal <a href> in the footer, and
// checks each one returns HTTP 200. Catches footer links pointing to renamed
// or deleted pages (footer is updated less frequently than the nav).

test.describe('Homepage Footer Links — All Resolve', () => {
  test('all footer links return HTTP 200', async ({ page }) => {
    test.skip(page.context().browser().browserType().name() !== 'chromium');
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('footer a[href]')]
        .map(a => a.getAttribute('href'))
        .filter(h => h && !h.startsWith('http') && !h.startsWith('mailto') && !h.startsWith('#') && h.endsWith('.html'))
    );

    const unique = [...new Set(hrefs)];
    expect(unique.length, 'No footer links found').toBeGreaterThan(0);

    for (const href of unique) {
      const url = href.startsWith('/') ? href : `/${href}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      expect(response.status(), `Footer link ${href} returned ${response.status()}`).toBe(200);
    }
  });
});
