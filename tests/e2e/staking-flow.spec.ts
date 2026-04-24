import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #3 - Stake tokens
 * 
 * Note: These tests check page load functionality.
 */
test.describe('Staking Flow', () => {
  test('staking page loads', async ({ page }) => {
    const response = await page.goto('/stake', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Staking page loaded, status:', response?.status());
  });

  test('dashboard page loads', async ({ page }) => {
    const response = await page.goto('/dashboard', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Dashboard page loaded, status:', response?.status());
  });

  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'commit', timeout: 30000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Homepage loaded, status:', response?.status());
  });
});
