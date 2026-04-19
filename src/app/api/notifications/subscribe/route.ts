/**
 * POST   /api/notifications/subscribe — register a Web Push subscription
 * DELETE /api/notifications/subscribe — remove by endpoint
 * GET    /api/notifications/subscribe — returns public VAPID key for client bootstrap
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SubscribeSchema = z.object({
  userId: z.string().optional(),
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().optional(),
});

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || null;
  return NextResponse.json({ success: true, data: { publicKey } });
}

export async function POST(request: NextRequest) {
  try {
    const body = SubscribeSchema.parse(await request.json());
    const sub = await (prisma as any).pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      create: {
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        userId: body.userId,
        userAgent: body.userAgent,
      },
      update: {
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        userId: body.userId ?? undefined,
        userAgent: body.userAgent,
      },
    });
    return NextResponse.json({ success: true, data: { id: sub.id } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "invalid_body", details: err.errors }, { status: 400 });
    }
    console.error("[push] subscribe error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = (await request.json()) as { endpoint?: string };
    if (!endpoint) return NextResponse.json({ success: false, error: "endpoint_required" }, { status: 400 });
    await (prisma as any).pushSubscription.deleteMany({ where: { endpoint } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push] unsubscribe error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}
