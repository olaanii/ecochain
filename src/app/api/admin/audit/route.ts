import { NextRequest, NextResponse } from "next/server";
import { requireCurrentDbUser, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  const actor = await requireCurrentDbUser();
  if ("error" in actor) return actor.error;
  const roleErr = requireRole(actor, ["admin", "owner"]);
  if (roleErr) return roleErr;

  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
  const action = searchParams.get("action") ?? undefined;
  const resource = searchParams.get("resource") ?? undefined;
  const actorId = searchParams.get("actorId") ?? undefined;

  const where: Record<string, unknown> = {};
  if (action) where.action = { contains: action, mode: "insensitive" };
  if (resource) where.resource = resource;
  if (actorId) where.actorId = actorId;

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.auditLog.count({ where }),
  ]);

  const hasMore = entries.length > limit;
  const items = hasMore ? entries.slice(0, limit) : entries;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor, total });
}
