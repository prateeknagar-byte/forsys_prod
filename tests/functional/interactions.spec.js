import { test, expect } from '@playwright/test';

// Basic smoke tests for JS-driven UI components on production pages.
// One representative check per component — confirms it renders and responds to clicks.
// Desktop-only; behaviour is viewport-independent.
//
// Note: the homepage .platforms section (platform tabs + accordion) is currently
// hidden via style="display:none" and is excluded until it is made visible.

test.describe('Interactions', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop', 'Desktop-only');
  });

  // Stage rail — one representative services page
  test('stage rail node click switches active panel', async ({ page }) => {
    await page.goto('/services/revenue-lifecycle-strategy.html');
    await page.locator('.stage-node[data-stage="2"]').click();
    await expect(page.locator('.stage-node[data-stage="2"]')).toHaveClass(/is-active/);
    await expect(page.locator('.stage-panel[data-panel="2"]')).toHaveClass(/is-active/);
    await expect(page.locator('.stage-panel.is-active')).toHaveCount(1);
  });

  // Testimonial carousel — homepage
  test('carousel dot click switches active slide', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('.test-dot').nth(1).click();
    await expect(page.locator('#test-slide-2')).toHaveClass(/active/);
    await expect(page.locator('.test-slide.active')).toHaveCount(1);
  });

  // Customer stories filter
  test('filter button shows matching cards and hides others', async ({ page }) => {
    await page.goto('/resources/customer-stories.html');
    await page.locator('.res-filter-btn', { hasText: 'HiTech' }).click();
    await expect(page.locator('.res-card[data-industry="hitech"]').first()).toBeVisible();
    await expect(page.locator('.res-card[data-industry]:not([data-industry="hitech"])').first()).toBeHidden();
  });

  // Events past-event tab navigation
  test('events item click switches active panel', async ({ page }) => {
    await page.goto('/resources/events.html');
    await page.locator('.evt-past-item[data-panel="evt-1"]').click();
    await expect(page.locator('.evt-past-item[data-panel="evt-1"]')).toHaveClass(/active/);
    await expect(page.locator('#evt-1')).toHaveClass(/active/);
  });

  // Events video modal — button is inside #evt-13, activate that panel first
  test('video modal opens and closes', async ({ page }) => {
    await page.goto('/resources/events.html');
    await page.locator('.evt-past-item[data-panel="evt-13"]').click();
    await page.locator('#btn-office-video').click();
    await expect(page.locator('#evt-video-modal')).toBeVisible();
    await page.locator('#evt-modal-close').click();
    await expect(page.locator('#evt-video-modal')).toBeHidden();
  });
});
