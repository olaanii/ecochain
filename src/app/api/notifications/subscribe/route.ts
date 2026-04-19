/**
 * POST   /api/notifications/subscribe — register a Web Push subscription
 * DELETE /api/notifications/subscribe — remove by endpoint
 * GET    /api/notifications/subscribe — returns public VAPID key for client bootstrap
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentDbUser } from "@/lib/auth/current-user";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SubscribeSchema = z.object({
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
    const user = await getCurrentDbUser();
    if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

    const body = SubscribeSchema.parse(await request.json());
    const sub = await (prisma as any).pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      create: {
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        userId: user.id,
        userAgent: body.userAgent,
      },
      update: {
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        userId: user.id,
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
    const user = await getCurrentDbUser();
    if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

    let endpoint: string | undefined;
    try {
      const body = (await request.json()) as { endpoint?: string };
      endpoint = body.endpoint;
    } catch {
      return NextResponse.json({ success: false, error: "invalid_body" }, { status: 400 });
    }
    if (!endpoint) return NextResponse.json({ success: false, error: "endpoint_required" }, { status: 400 });

    // Only delete subscriptions the caller actually owns.
    await (prisma as any).pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push] unsubscribe error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}
