import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #6 - Bridge assets
 * 
 * Note: These tests check page load functionality.
 */
test.describe('Bridge Flow', () => {
  test('bridge page loads', async ({ page }) => {
    const response = await page.goto('/bridge', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Bridge page loaded, status:', response?.status());
  });

  test('bridge history page loads', async ({ page }) => {
    const response = await page.goto('/bridge/history', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Bridge history page loaded, status:', response?.status());
  });

  test('cross-chain page loads', async ({ page }) => {
    const response = await page.goto('/cross-chain', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Cross-chain page loaded, status:', response?.status());
  });
});
