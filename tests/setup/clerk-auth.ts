/**
 * Clerk Authentication Setup for Playwright Tests
 * 
 * This provides test utilities for handling Clerk authentication in E2E tests.
 * 
 * Options:
 * 1. Use test mode with pre-configured test users (recommended)
 * 2. Mock Clerk entirely for faster tests
 * 3. Actually sign in during tests (slower but more realistic)
 */

import { test as base } from '@playwright/test';

type ClerkAuthFixtures = {
  signInAsTestUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const test = base.extend<ClerkAuthFixtures>({
  signInAsTestUser: async ({ page }, use) => {
    const signIn = async () => {
      // Option 1: Use Clerk's test mode with pre-configured test user
      // Enable test mode in Clerk Dashboard → Configure → Test Mode
      
      // Navigate to sign-in page
      await page.goto('/sign-in');
      
      // Wait for Clerk's sign-in form to load
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Enter test credentials (configure these in Clerk Dashboard → Users → Test Users)
      await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'test-password');
      
      // Click sign-in button
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard or home
      await page.waitForURL(/(dashboard|\/)/, { timeout: 10000 });
      
      console.log('✓ Signed in as test user');
    };
    
    await use(signIn);
  },
  
  signOut: async ({ page }, use) => {
    const signOut = async () => {
      // Click on user button/avatar
      const userButton = page.locator('[data-clerk-user-button]').first();
      if (await userButton.isVisible().catch(() => false)) {
        await userButton.click();
        
        // Wait for dropdown and click sign out
        await page.waitForSelector('text=Sign out', { timeout: 5000 });
        await page.click('text=Sign out');
        
        console.log('✓ Signed out');
      }
    };
    
    await use(signOut);
  },
});

export { expect } from '@playwright/test';
