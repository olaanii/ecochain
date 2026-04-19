/**
 * POST /api/notifications/read
 * Body: { userId, id? }  — mark one notification as read, or all for user
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentDbUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

    let id: string | undefined;
    try {
      const body = (await request.json()) as { id?: string };
      id = body.id;
    } catch {
      // Empty body is fine: treat as "mark all unread as read"
    }

    if (id) {
      await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { read: true } });
    } else {
      await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[notifications/read] error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}
