# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: task-verification.spec.ts >> Task Verification Flow >> rewards page loads
- Location: tests\e2e\task-verification.spec.ts:15:3

# Error details

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/rewards", waiting until "commit"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * E2E Test: Critical Flow #2 - Verify task → Claim reward
  5  |  * 
  6  |  * Note: These tests check page load functionality.
  7  |  */
  8  | test.describe('Task Verification Flow', () => {
  9  |   test('tasks page loads', async ({ page }) => {
  10 |     const response = await page.goto('/tasks', { waitUntil: 'commit', timeout: 30000 });
  11 |     expect(response?.status()).toBeLessThan(500);
  12 |     console.log('Tasks page loaded, status:', response?.status());
  13 |   });
  14 | 
  15 |   test('rewards page loads', async ({ page }) => {
> 16 |     const response = await page.goto('/rewards', { waitUntil: 'commit', timeout: 30000 });
     |                                 ^ TimeoutError: page.goto: Timeout 30000ms exceeded.
  17 |     expect(response?.status()).toBeLessThan(500);
  18 |     console.log('Rewards page loaded, status:', response?.status());
  19 |   });
  20 | 
  21 |   test('verification page loads', async ({ page }) => {
  22 |     const response = await page.goto('/verify', { waitUntil: 'commit', timeout: 30000 });
  23 |     expect(response?.status()).toBeLessThan(500);
  24 |     console.log('Verification page loaded, status:', response?.status());
  25 |   });
  26 | });
  27 | 
```