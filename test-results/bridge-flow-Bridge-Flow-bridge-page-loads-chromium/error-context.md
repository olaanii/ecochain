# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bridge-flow.spec.ts >> Bridge Flow >> bridge page loads
- Location: tests\e2e\bridge-flow.spec.ts:9:3

# Error details

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/bridge", waiting until "commit"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * E2E Test: Critical Flow #6 - Bridge assets
  5  |  * 
  6  |  * Note: These tests check page load functionality.
  7  |  */
  8  | test.describe('Bridge Flow', () => {
  9  |   test('bridge page loads', async ({ page }) => {
> 10 |     const response = await page.goto('/bridge', { waitUntil: 'commit', timeout: 30000 });
     |                                 ^ TimeoutError: page.goto: Timeout 30000ms exceeded.
  11 |     expect(response?.status()).toBeLessThan(500);
  12 |     console.log('Bridge page loaded, status:', response?.status());
  13 |   });
  14 | 
  15 |   test('bridge history page loads', async ({ page }) => {
  16 |     const response = await page.goto('/bridge/history', { waitUntil: 'commit', timeout: 30000 });
  17 |     expect(response?.status()).toBeLessThan(500);
  18 |     console.log('Bridge history page loaded, status:', response?.status());
  19 |   });
  20 | 
  21 |   test('cross-chain page loads', async ({ page }) => {
  22 |     const response = await page.goto('/cross-chain', { waitUntil: 'commit', timeout: 30000 });
  23 |     expect(response?.status()).toBeLessThan(500);
  24 |     console.log('Cross-chain page loaded, status:', response?.status());
  25 |   });
  26 | });
  27 | 
```