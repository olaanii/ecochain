import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #4 - Unstake tokens
 * 
 * Note: These tests check page load functionality.
 */
test.describe('Unstaking Flow', () => {
  test('unstake page loads', async ({ page }) => {
    const response = await page.goto('/unstake', { waitUntil: 'commit', timeout: 30000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Unstake page loaded, status:', response?.status());
  });

  test('stakes page loads', async ({ page }) => {
    const response = await page.goto('/stakes', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Stakes page loaded, status:', response?.status());
  });

  test('rewards page loads', async ({ page }) => {
    const response = await page.goto('/rewards', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Rewards page loaded, status:', response?.status());
  });
});
