/**
 * GET /api/notifications/list?userId=...&limit=20
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentDbUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

    const url = request.nextUrl;
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);

    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ]);
    return NextResponse.json({ success: true, data: { items, unread } });
  } catch (err) {
    console.error("[notifications/list] error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}
