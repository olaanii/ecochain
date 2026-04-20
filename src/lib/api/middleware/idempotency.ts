/**
 * Idempotency-Key middleware.
 *
 * Stores responses keyed by `Idempotency-Key` header in Redis for 24 hours.
 * On a duplicate request with the same key, returns the cached response
 * immediately without executing the handler again.
 *
 * Covers: /api/redeem, /api/stake, /api/bridge, /api/verify (mutating routes).
 *
 * Degrades gracefully when Redis is absent — falls through to the handler.
 */

import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis/client";

const TTL_SECONDS = 24 * 60 * 60;
const KEY_PREFIX = "idempotency:";

export interface IdempotencyResult {
  cached: boolean;
  response?: NextResponse;
  key?: string;
}

export async function checkIdempotency(
  request: NextRequest,
): Promise<IdempotencyResult> {
  const key = request.headers.get("idempotency-key");
  if (!key) return { cached: false };

  const storeKey = `${KEY_PREFIX}${key}`;

  try {
    const cached = await redis.get(storeKey);
    if (cached) {
      const { status, body, headers } = JSON.parse(cached) as {
        status: number;
        body: unknown;
        headers: Record<string, string>;
      };
      const response = NextResponse.json(body, { status });
      Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      response.headers.set("Idempotency-Replayed", "true");
      return { cached: true, response, key: storeKey };
    }
  } catch {
    // Redis unavailable — fall through
  }

  return { cached: false, key: storeKey };
}

export async function storeIdempotencyResponse(
  storeKey: string,
  response: NextResponse,
): Promise<void> {
  if (!storeKey) return;
  try {
    const cloned = response.clone();
    const body = await cloned.json().catch(() => null);
    const headers: Record<string, string> = {};
    cloned.headers.forEach((v, k) => {
      if (k.toLowerCase() !== "set-cookie") headers[k] = v;
    });
    await redis.setex(
      storeKey,
      TTL_SECONDS,
      JSON.stringify({ status: response.status, body, headers }),
    );
  } catch {
    // Redis unavailable — no-op
  }
}

/**
 * Wraps a route handler with idempotency protection.
 *
 * Usage:
 * ```ts
 * export const POST = withIdempotency(async (req) => { ... });
 * ```
 */
export function withIdempotency(
  handler: (req: NextRequest) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const { cached, response, key } = await checkIdempotency(req);
    if (cached && response) return response;

    const result = await handler(req);

    if (key && result.status < 500) {
      await storeIdempotencyResponse(key, result);
    }

    return result;
  };
}
