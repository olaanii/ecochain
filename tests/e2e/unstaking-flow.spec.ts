import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #4 - Unstake tokens
 */
test.describe('Unstaking Flow', () => {
  test('unstake page loads', async ({ page }) => {
    await page.goto('/unstake', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Unstake page loaded');
  });

  test('stakes page loads', async ({ page }) => {
    await page.goto('/stakes', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Stakes page loaded, URL:', page.url());
  });

  test('rewards page loads', async ({ page }) => {
    await page.goto('/rewards', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Rewards page loaded');
  });
});
