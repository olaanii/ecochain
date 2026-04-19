/**
 * Web Push helper. VAPID keys are read from env; generate once with:
 *   npx web-push generate-vapid-keys
 * and populate:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...)
 *
 * The public key is also exposed to the client via
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY so the Service Worker can subscribe.
 */

import webpush from "web-push";
import { prisma } from "@/lib/prisma/client";

let configured = false;
let warnedMissing = false;

function configure() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:noreply@ecochain.local";
  if (!publicKey || !privateKey) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn(
        "[push] VAPID keys missing (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY). Push notifications will be dropped.",
      );
    }
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!configure()) return 0;
  const subs = await (prisma as any).pushSubscription.findMany({ where: { userId } });
  return sendToSubs(subs, payload);
}

export async function broadcastPush(payload: PushPayload): Promise<number> {
  if (!configure()) return 0;
  const subs = await (prisma as any).pushSubscription.findMany();
  return sendToSubs(subs, payload);
}

async function sendToSubs(
  subs: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload,
): Promise<number> {
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number } | undefined)?.statusCode;
        // 404/410 mean the subscription is gone — prune.
        if (status === 404 || status === 410) {
          await (prisma as any).pushSubscription.delete({ where: { id: s.id } }).catch(() => undefined);
        } else {
          console.error("[push] send failed", status, err);
        }
      }
    }),
  );
  return sent;
}
