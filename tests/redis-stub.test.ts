/**
 * Regression tests for the Redis graceful-fallback behaviour.
 *
 * When Redis is not configured (no REDIS_URL, REDIS_HOST unset or set to
 * localhost without an opt-in, or DISABLE_REDIS=1), the client module must
 * return a stub that no-ops every call so the rest of the app never crashes
 * and the dev server doesn't flood the logs with ECONNREFUSED stacks.
 */

describe("redis client — graceful fallback", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  it("treats a bare localhost + no opt-in as disabled", async () => {
    delete process.env.REDIS_URL;
    delete process.env.REDIS_ENABLED;
    delete process.env.DISABLE_REDIS;
    process.env.REDIS_HOST = "localhost";

    const mod = await import("../src/lib/redis/client");
    expect(mod.isRedisEnabled()).toBe(false);
  });

  it("treats DISABLE_REDIS=1 as disabled even when URL set", async () => {
    process.env.REDIS_URL = "redis://real-host:6379";
    process.env.DISABLE_REDIS = "1";

    const mod = await import("../src/lib/redis/client");
    expect(mod.isRedisEnabled()).toBe(false);
  });

  it("stub client resolves reads/writes/pubsub without throwing", async () => {
    delete process.env.REDIS_URL;
    delete process.env.REDIS_ENABLED;
    process.env.REDIS_HOST = "localhost";

    const { redis } = await import("../src/lib/redis/client");

    await expect(redis.get("any")).resolves.toBeNull();
    await expect(redis.setex("any", 10, "v")).resolves.toBeNull();
    await expect(redis.del("any")).resolves.toBe(0);
    await expect(redis.publish("ch", "msg")).resolves.toBe(0);
    await expect(redis.ping()).resolves.toBe("PONG-STUB");
  });

  it("stub supports .on() for lifecycle listeners without crashing", async () => {
    delete process.env.REDIS_URL;
    delete process.env.REDIS_ENABLED;
    process.env.REDIS_HOST = "localhost";

    const { redis } = await import("../src/lib/redis/client");
    expect(() => {
      redis.on("error", () => undefined);
      redis.on("connect", () => undefined);
      redis.on("message", () => undefined);
    }).not.toThrow();
  });

  it("cache helpers degrade to null/0 when Redis disabled", async () => {
    delete process.env.REDIS_URL;
    delete process.env.REDIS_ENABLED;
    process.env.REDIS_HOST = "localhost";

    const { cacheGet, cacheSet, cacheDelete } = await import(
      "../src/lib/redis/cache"
    );

    await expect(cacheGet<string>("k")).resolves.toBeNull();
    await expect(cacheSet("k", "v", 60)).resolves.toBe(true);
    // stub `del` returns 0 → deletion helper sees "not found" which is fine.
    await expect(cacheDelete("k")).resolves.toBe(false);
  });
});
