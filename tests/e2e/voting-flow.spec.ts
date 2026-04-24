import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #5 - Vote on proposal
 * 
 * Note: These tests check page load functionality.
 */
test.describe('Voting Flow', () => {
  test('governance page loads', async ({ page }) => {
    const response = await page.goto('/governance', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Governance page loaded, status:', response?.status());
  });

  test('proposals page loads', async ({ page }) => {
    const response = await page.goto('/proposals', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Proposals page loaded, status:', response?.status());
  });

  test('vote history page loads', async ({ page }) => {
    const response = await page.goto('/governance/history', { waitUntil: 'commit', timeout: 60000 });
    expect(response?.status()).toBeLessThan(500);
    console.log('Vote history page loaded, status:', response?.status());
  });
});
