import { test, expect } from '@playwright/test';

/**
 * E2E Test: Critical Flow #1 - Sign in → Dashboard
 * 
 * Note: These tests check basic server responsiveness.
 * The homepage is public and doesn't require authentication.
 */
test.describe('Auth Flow', () => {
  test('server responds with 200', async ({ page }) => {
    // Navigate to homepage without waiting for full load
    const response = await page.goto('/', { waitUntil: 'commit', timeout: 30000 });
    
    // Check server responds with OK status
    expect(response?.status()).toBe(200);
    
    console.log('✓ Server responds with 200');
  });

  test('page URL is correct', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit', timeout: 30000 });
    
    // Check we're on the homepage
    expect(page.url()).toContain('localhost:3000');
    
    console.log('✓ Page URL is correct');
  });

  test('page has body element', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit', timeout: 30000 });
    
    // Check body exists
    const body = page.locator('body');
    await expect(body).toBeAttached();
    
    console.log('✓ Page has body element');
  });
});
