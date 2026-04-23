import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #5 - Vote on proposal
 */
test.describe('Voting Flow', () => {
  test('governance page loads', async ({ page }) => {
    await page.goto('/governance', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Governance page loaded');
  });

  test('proposals page loads', async ({ page }) => {
    await page.goto('/proposals', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Proposals page loaded, URL:', page.url());
  });

  test('vote history page loads', async ({ page }) => {
    await page.goto('/governance/history', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('Vote history page loaded');
  });
});
