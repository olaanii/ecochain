import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #6 - Bridge assets
 */
test.describe('Bridge Flow', () => {
  test('bridge page loads', async ({ page }) => {
    await page.goto('/bridge', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Bridge page loaded');
  });

  test('bridge history page loads', async ({ page }) => {
    await page.goto('/bridge/history', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Bridge history page loaded, URL:', page.url());
  });

  test('cross-chain page loads', async ({ page }) => {
    await page.goto('/cross-chain', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Cross-chain page loaded');
  });
});
