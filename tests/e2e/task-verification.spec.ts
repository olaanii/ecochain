import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #2 - Verify task → Claim reward
 */
test.describe('Task Verification Flow', () => {
  test('tasks page loads', async ({ page }) => {
    await page.goto('/tasks', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Tasks page loaded');
  });

  test('rewards page loads', async ({ page }) => {
    await page.goto('/rewards', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Rewards page loaded, URL:', page.url());
  });

  test('verification page loads', async ({ page }) => {
    await page.goto('/verify', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Verification page loaded');
  });
});
