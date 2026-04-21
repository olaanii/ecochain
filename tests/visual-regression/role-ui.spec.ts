import { test, expect, type Page } from "@playwright/test";

/**
 * Visual Regression Tests — Role-Based UI
 * 
 * These tests capture snapshots of key pages for each user role to detect
 * unintended visual changes during development.
 * 
 * Run: npx playwright test tests/visual-regression/role-ui.spec.ts --update-snapshots
 */

const VIEWPORT = { width: 1440, height: 900 };

// Test all role-based pages for visual consistency
test.describe("Visual Regression — Role-Based UI", () => {
  test.use({ viewport: VIEWPORT });

  test.describe("User Role Pages", () => {
    test("dashboard page", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("user-dashboard.png", {
        fullPage: true,
      });
    });

    test("earn page", async ({ page }) => {
      await page.goto("/earn");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("user-earn.png", {
        fullPage: true,
      });
    });

    test("wallet page", async ({ page }) => {
      await page.goto("/wallet");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("user-wallet.png", {
        fullPage: true,
      });
    });

    test("impact page", async ({ page }) => {
      await page.goto("/impact");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("user-impact.png", {
        fullPage: true,
      });
    });

    test("community page", async ({ page }) => {
      await page.goto("/community");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("user-community.png", {
        fullPage: true,
      });
    });
  });

  test.describe("Sponsor Role Pages", () => {
    test("sponsor dashboard", async ({ page }) => {
      await page.goto("/sponsor");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("sponsor-dashboard.png", {
        fullPage: true,
      });
    });

    test("sponsor campaigns", async ({ page }) => {
      await page.goto("/sponsor/campaigns");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("sponsor-campaigns.png", {
        fullPage: true,
      });
    });

    test("sponsor tasks", async ({ page }) => {
      await page.goto("/sponsor/tasks");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("sponsor-tasks.png", {
        fullPage: true,
      });
    });

    test("sponsor analytics", async ({ page }) => {
      await page.goto("/sponsor/analytics");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("sponsor-analytics.png", {
        fullPage: true,
      });
    });

    test("sponsor rewards pool", async ({ page }) => {
      await page.goto("/sponsor/rewards-pool");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("sponsor-rewards-pool.png", {
        fullPage: true,
      });
    });
  });

  test.describe("Admin Role Pages", () => {
    test("admin dashboard", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("admin-dashboard.png", {
        fullPage: true,
      });
    });

    test("admin users", async ({ page }) => {
      await page.goto("/admin/users");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("admin-users.png", {
        fullPage: true,
      });
    });

    test("admin sponsors", async ({ page }) => {
      await page.goto("/admin/sponsors");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("admin-sponsors.png", {
        fullPage: true,
      });
    });

    test("admin review queue", async ({ page }) => {
      await page.goto("/admin/review");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("admin-review.png", {
        fullPage: true,
      });
    });

    test("admin onchain", async ({ page }) => {
      await page.goto("/admin/onchain");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("admin-onchain.png", {
        fullPage: true,
      });
    });
  });

  test.describe("Dark Mode Snapshots", () => {
    test("dashboard dark mode", async ({ page }) => {
      // Set dark mode
      await page.goto("/dashboard");
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
      });
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("user-dashboard-dark.png", {
        fullPage: true,
      });
    });

    test("sponsor dashboard dark mode", async ({ page }) => {
      await page.goto("/sponsor");
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
      });
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("sponsor-dashboard-dark.png", {
        fullPage: true,
      });
    });

    test("admin dashboard dark mode", async ({ page }) => {
      await page.goto("/admin");
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
      });
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("admin-dashboard-dark.png", {
        fullPage: true,
      });
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("user dashboard mobile", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("user-dashboard-mobile.png", {
        fullPage: true,
      });
    });

    test("sponsor dashboard mobile", async ({ page }) => {
      await page.goto("/sponsor");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("sponsor-dashboard-mobile.png", {
        fullPage: true,
      });
    });

    test("admin dashboard mobile", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot("admin-dashboard-mobile.png", {
        fullPage: true,
      });
    });
  });

  test.describe("Interactive States", () => {
    test("command palette open", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      
      // Open command palette with Cmd+K
      await page.keyboard.press("Meta+k");
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot("command-palette-open.png", {
        fullPage: false,
      });
    });

    test("mobile drawer open", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      
      // Open mobile drawer
      const menuButton = page.getByLabel("Open menu");
      await menuButton.click();
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot("mobile-drawer-open.png", {
        fullPage: false,
      });
    });
  });
});
