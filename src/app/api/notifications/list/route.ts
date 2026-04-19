/**
 * GET /api/notifications/list?userId=...&limit=20
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const userId = url.searchParams.get("userId");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    if (!userId) return NextResponse.json({ success: true, data: { items: [], unread: 0 } });

    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return NextResponse.json({ success: true, data: { items, unread } });
  } catch (err) {
    console.error("[notifications/list] error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}
