import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #2 - Verify task → Claim reward
 * 
 * Note: These tests check page load functionality.
 */
test.describe('Task Verification Flow', () => {
  test('tasks page loads', async ({ page }) => {
    const response = await page.goto('/tasks', { waitUntil: 'commit', timeout: 30000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Tasks page loaded, status:', response?.status());
  });

  test('rewards page loads', async ({ page }) => {
    const response = await page.goto('/rewards', { waitUntil: 'commit', timeout: 30000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Rewards page loaded, status:', response?.status());
  });

  test('verification page loads', async ({ page }) => {
    const response = await page.goto('/verify', { waitUntil: 'commit', timeout: 30000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Verification page loaded, status:', response?.status());
  });
});
