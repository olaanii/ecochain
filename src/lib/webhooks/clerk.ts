/**
 * Clerk webhook verification helper.
 *
 * Verifies the svix signature on incoming Clerk webhook requests and
 * guards against replay attacks by storing event IDs in Redis for 24h.
 *
 * Usage:
 *   const result = await verifyClerkWebhook(request);
 *   if (!result.ok) return result.response;
 *   const { event } = result;
 */

import { Webhook } from "svix";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis/client";

export type ClerkWebhookEvent = {
  type: string;
  data: Record<string, unknown>;
  object: string;
};

type VerifyOk = { ok: true; event: ClerkWebhookEvent };
type VerifyFail = { ok: false; response: NextResponse };
export type VerifyResult = VerifyOk | VerifyFail;

const REPLAY_TTL = 24 * 60 * 60; // 24 hours in seconds
const REPLAY_PREFIX = "webhook:clerk:seen:";

export async function verifyClerkWebhook(request: NextRequest): Promise<VerifyResult> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Webhook] CLERK_WEBHOOK_SECRET is not set");
    return {
      ok: false,
      response: NextResponse.json({ error: "Webhook not configured" }, { status: 500 }),
    };
  }

  // Read required svix headers
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing svix headers" }, { status: 400 }),
    };
  }

  // Replay guard — reject events we've already processed
  const replayKey = `${REPLAY_PREFIX}${svixId}`;
  try {
    const seen = await redis.get(replayKey);
    if (seen) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Duplicate event" }, { status: 200 }),
      };
    }
  } catch {
    // Redis unavailable — allow through (fail open for availability)
  }

  // Verify signature
  const body = await request.text();
  const wh = new Webhook(secret);
  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid signature" }, { status: 401 }),
    };
  }

  // Mark event as seen (best-effort — Redis may be unavailable)
  try {
    await redis.setex(replayKey, REPLAY_TTL, "1");
  } catch {
    // no-op
  }

  return { ok: true, event };
}
