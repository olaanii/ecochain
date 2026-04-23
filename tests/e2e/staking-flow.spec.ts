import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #3 - Stake tokens
 */
test.describe('Staking Flow', () => {
  test('staking page loads', async ({ page }) => {
    await page.goto('/stake', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    // Verify page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Log page title for debugging
    const title = await page.title();
    console.log('Page title:', title);
    
    // Verify we have some content
    const text = await page.textContent('body');
    expect(text?.length).toBeGreaterThan(0);
  });

  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Dashboard loaded, URL:', page.url());
  });

  test('homepage loads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for any interactive elements
    const buttons = page.locator('button');
    const count = await buttons.count();
    console.log(`Found ${count} buttons`);
  });
});
