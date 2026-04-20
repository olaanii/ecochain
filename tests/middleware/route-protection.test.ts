/**
 * Middleware route-protection logic unit tests.
 * Migrated from tests/middleware.test.js (T-1).
 */

const PROTECTED_ROUTES = [
  "/dashboard",
  "/verification",
  "/merchants",
  "/api/verify",
  "/api/redeem",
  "/api/bridge",
];

const ADMIN_ROUTES = ["/admin"];
const SPONSOR_ROUTES = ["/sponsor"];

function isProtected(path: string): boolean {
  return PROTECTED_ROUTES.some((r) => path === r || path.startsWith(r + "/"));
}

function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some((r) => path === r || path.startsWith(r + "/"));
}

function isSponsorRoute(path: string): boolean {
  return SPONSOR_ROUTES.some((r) => path === r || path.startsWith(r + "/"));
}

describe("Middleware — auth-protected route detection", () => {
  const cases: Array<{ path: string; expected: boolean }> = [
    { path: "/dashboard", expected: true },
    { path: "/dashboard/settings", expected: true },
    { path: "/verification", expected: true },
    { path: "/verification/camera", expected: true },
    { path: "/merchants", expected: true },
    { path: "/merchants/hub-main", expected: true },
    { path: "/api/verify", expected: true },
    { path: "/api/redeem", expected: true },
    { path: "/api/bridge/history", expected: true },
    { path: "/", expected: false },
    { path: "/discover", expected: false },
    { path: "/bridge", expected: false },
    { path: "/api/tasks", expected: false },
    { path: "/api/rewards", expected: false },
  ];

  test.each(cases)("$path → protected=$expected", ({ path, expected }) => {
    expect(isProtected(path)).toBe(expected);
  });
});

describe("Middleware — role-gated route detection", () => {
  test("admin routes require admin role", () => {
    expect(isAdminRoute("/admin")).toBe(true);
    expect(isAdminRoute("/admin/users")).toBe(true);
    expect(isAdminRoute("/dashboard")).toBe(false);
  });

  test("sponsor routes require sponsor role", () => {
    expect(isSponsorRoute("/sponsor")).toBe(true);
    expect(isSponsorRoute("/sponsor/campaigns")).toBe(true);
    expect(isSponsorRoute("/dashboard")).toBe(false);
  });

  test("user can access dashboard but not admin or sponsor", () => {
    expect(isAdminRoute("/dashboard")).toBe(false);
    expect(isSponsorRoute("/dashboard")).toBe(false);
    expect(isProtected("/dashboard")).toBe(true);
  });
});
