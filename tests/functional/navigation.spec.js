import { test, expect } from '@playwright/test';

test.describe('Navigation — Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test.skip(({ viewport }) => viewport.width < 1025, 'Desktop only');

  test('logo is visible', async ({ page }) => {
    await expect(page.locator('#main-nav .nav-logo')).toBeVisible();
  });

  test('logo links to homepage', async ({ page }) => {
    await page.locator('#main-nav .nav-logo').click();
    await expect(page).toHaveURL(/index\.html|\/$/);
  });

  test('all top-level nav items are visible', async ({ page }) => {
    const labels = ['What We Do', 'Industries', 'Partnerships', 'Resources', 'Company'];
    for (const label of labels) {
      await expect(page.locator('#main-nav .nav-link', { hasText: label })).toBeVisible();
    }
  });

  test('Contact Us button is visible and links to contact page', async ({ page }) => {
    const cta = page.locator('.btn-nav-primary');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /contact/);
  });

  test('"What We Do" mega menu opens on hover', async ({ page }) => {
    await page.locator('#main-nav .nav-link', { hasText: 'What We Do' }).hover();
    await expect(page.locator('.mega-menu--wide')).toBeVisible();
  });

  test('"What We Do" mega menu has all 5 columns', async ({ page }) => {
    await page.locator('#main-nav .nav-link', { hasText: 'What We Do' }).hover();
    const columns = ['Business Advisory', 'Salesforce Solutions', 'Conga Solutions', 'AI Led Services', 'Forsys AI Solutions'];
    for (const col of columns) {
      await expect(page.locator('.mega-col-title', { hasText: col }).first()).toBeVisible();
    }
  });

  test('"What We Do" mega menu closes when mouse leaves', async ({ page }) => {
    await page.locator('#main-nav .nav-link', { hasText: 'What We Do' }).hover();
    await expect(page.locator('.mega-menu--wide')).toBeVisible();
    await page.mouse.move(10, 700);
    await page.waitForTimeout(500);
    await expect(page.locator('.mega-menu--wide')).toBeHidden();
  });

  test('mega menu link navigates to correct page', async ({ page }) => {
    await page.locator('#main-nav .nav-link', { hasText: 'What We Do' }).hover();
    await page.locator('.mega-menu--wide a', { hasText: 'Revenue Lifecycle Strategy' }).click();
    await expect(page).toHaveURL(/revenue-lifecycle-strategy/);
  });

  test('Industries dropdown opens on hover', async ({ page }) => {
    await page.locator('#main-nav .nav-link', { hasText: 'Industries' }).hover();
    await expect(page.locator('.nav-item--open .dropdown').first()).toBeVisible();
  });

  test('Industries dropdown link navigates correctly', async ({ page }) => {
    await page.locator('#main-nav .nav-link', { hasText: 'Industries' }).hover();
    await page.locator('.nav-item--open .dropdown a', { hasText: 'HiTech' }).click();
    await expect(page).toHaveURL(/hi-tech/);
  });

  test('nav stays fixed at top when scrolling', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 800));
    const nav = page.locator('#main-nav');
    await expect(nav).toBeVisible();
    const box = await nav.boundingBox();
    expect(box.y).toBeLessThanOrEqual(5);
  });

  test('skip link is present and points to main content', async ({ page }) => {
    await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main');
  });

  test('dropdown closes when clicking outside', async ({ page }) => {
    await page.locator('#main-nav .nav-link', { hasText: 'Industries' }).hover();
    await expect(page.locator('.nav-item--open .dropdown').first()).toBeVisible();
    await page.mouse.click(640, 600);
    await expect(page.locator('.nav-item--open')).toHaveCount(0);
  });
});

test.describe('Navigation — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('hamburger button is visible', async ({ page }) => {
    await expect(page.locator('.nav-burger')).toBeVisible();
  });

  test('desktop nav links are hidden on mobile', async ({ page }) => {
    await expect(page.locator('.nav-center')).toBeHidden();
  });

  test('hamburger opens mobile menu', async ({ page }) => {
    await page.locator('.nav-burger').click();
    await expect(page.locator('#main-nav')).toHaveClass(/nav-open/);
  });

  test('mobile menu contains all nav items', async ({ page }) => {
    await page.locator('.nav-burger').click();
    const labels = ['What We Do', 'Industries', 'Partnerships', 'Resources', 'Company'];
    for (const label of labels) {
      await expect(page.locator('.nav-center .nav-link', { hasText: label }).first()).toBeVisible();
    }
  });

  test('hamburger closes mobile menu', async ({ page }) => {
    await page.locator('.nav-burger').click();
    await expect(page.locator('#main-nav')).toHaveClass(/nav-open/);
    await page.locator('.nav-mob-close').click();
    await expect(page.locator('#main-nav')).not.toHaveClass(/nav-open/);
  });

  test('clicking a mobile menu link navigates correctly', async ({ page }) => {
    await page.locator('.nav-burger').click();
    await page.locator('.nav-center .nav-link', { hasText: 'Industries' }).first().click();
    await page.locator('.nav-center a', { hasText: 'HiTech' }).first().click();
    await expect(page).toHaveURL(/hi-tech/);
  });
});

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('footer logo is visible', async ({ page }) => {
    await expect(page.locator('footer .nav-logo')).toBeVisible();
  });

  test('footer logo links to homepage', async ({ page }) => {
    await page.locator('footer .nav-logo').click();
    await expect(page).toHaveURL(/index\.html|\/$/);
  });
});
