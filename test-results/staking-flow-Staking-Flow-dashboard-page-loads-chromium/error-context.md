# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: staking-flow.spec.ts >> Staking Flow >> dashboard page loads
- Location: tests\e2e\staking-flow.spec.ts:15:3

# Error details

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/dashboard", waiting until "commit"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * E2E Test: Critical Flow #3 - Stake tokens
  5  |  * 
  6  |  * Note: These tests check page load functionality.
  7  |  */
  8  | test.describe('Staking Flow', () => {
  9  |   test('staking page loads', async ({ page }) => {
  10 |     const response = await page.goto('/stake', { waitUntil: 'commit', timeout: 60000 });
  11 |     expect(response?.status()).toBeLessThan(500);
  12 |     console.log('Staking page loaded, status:', response?.status());
  13 |   });
  14 | 
  15 |   test('dashboard page loads', async ({ page }) => {
> 16 |     const response = await page.goto('/dashboard', { waitUntil: 'commit', timeout: 30000 });
     |                                 ^ TimeoutError: page.goto: Timeout 30000ms exceeded.
  17 |     expect(response?.status()).toBeLessThan(500);
  18 |     console.log('Dashboard page loaded, status:', response?.status());
  19 |   });
  20 | 
  21 |   test('homepage loads', async ({ page }) => {
  22 |     const response = await page.goto('/', { waitUntil: 'commit', timeout: 30000 });
  23 |     expect(response?.status()).toBeLessThan(500);
  24 |     console.log('Homepage loaded, status:', response?.status());
  25 |   });
  26 | });
  27 | 
```