/**
 * Webhook security utilities — replay guard, signature verification
 */

import { redis } from "@/lib/redis/client";
import { createHmac, timingSafeEqual } from "crypto";

const WEBHOOK_REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const WEBHOOK_NONCE_PREFIX = "webhook:nonce:";

/**
 * Verify webhook timestamp is within acceptable window (replay protection)
 */
export async function verifyWebhookTimestamp(
  timestamp: number,
  toleranceMs: number = WEBHOOK_REPLAY_WINDOW_MS
): Promise<{ valid: boolean; error?: string }> {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 0) {
    return { valid: false, error: "Webhook timestamp is in the future" };
  }
  if (diff > toleranceMs) {
    return { valid: false, error: "Webhook timestamp too old (replay suspected)" };
  }
  return { valid: true };
}

/**
 * Check if webhook ID has been seen before (nonce replay protection)
 */
export async function checkWebhookIdempotency(
  webhookId: string,
  ttlSeconds: number = 300
): Promise<{ valid: boolean; error?: string }> {
  const key = `${WEBHOOK_NONCE_PREFIX}${webhookId}`;

  try {
    const exists = await redis.get(key);
    if (exists) {
      return { valid: false, error: "Duplicate webhook ID (replay suspected)" };
    }

    await redis.setex(key, ttlSeconds, "1");
    return { valid: true };
  } catch {
    // Redis unavailable — fail open with warning
    console.warn("[Webhook] Redis unavailable for nonce check, allowing request");
    return { valid: true };
  }
}

/**
 * Verify HMAC-SHA256 signature for generic webhooks
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: "sha256" | "sha512" = "sha256"
): boolean {
  const expected = createHmac(algorithm, secret).update(payload).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Verify Stripe-style signature (t=timestamp,v1=sig)
 */
export function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): { valid: boolean; timestamp?: number; error?: string } {
  const parts = signature.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key.trim()] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parseInt(parts.t, 10);
  if (!timestamp || isNaN(timestamp)) {
    return { valid: false, error: "Invalid timestamp in signature" };
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    const valid = timingSafeEqual(Buffer.from(parts.v1 || ""), Buffer.from(expected));
    return { valid, timestamp };
  } catch {
    return { valid: false, error: "Signature mismatch" };
  }
}

/**
 * Validate webhook request security (combines timestamp + idempotency)
 */
export async function validateWebhookSecurity(
  webhookId: string,
  timestamp: number,
  options?: { toleranceMs?: number }
): Promise<{ valid: boolean; error?: string }> {
  // Check timestamp first
  const timestampCheck = await verifyWebhookTimestamp(timestamp, options?.toleranceMs);
  if (!timestampCheck.valid) {
    return timestampCheck;
  }

  // Check idempotency
  const idempotencyCheck = await checkWebhookIdempotency(webhookId);
  if (!idempotencyCheck.valid) {
    return idempotencyCheck;
  }

  return { valid: true };
}
