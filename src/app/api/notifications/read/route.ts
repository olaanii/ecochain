/**
 * POST /api/notifications/read
 * Body: { userId, id? }  — mark one notification as read, or all for user
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId, id } = (await request.json()) as { userId?: string; id?: string };
    if (!userId) return NextResponse.json({ success: false, error: "userId_required" }, { status: 400 });
    if (id) {
      await prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    } else {
      await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[notifications/read] error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}
