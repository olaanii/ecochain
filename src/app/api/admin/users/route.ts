import { NextRequest, NextResponse } from "next/server";
import { requireCurrentDbUser, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  const actor = await requireCurrentDbUser();
  if ("error" in actor) return actor.error;
  const roleErr = requireRole(actor, ["admin", "owner"]);
  if (roleErr) return roleErr;

  const { searchParams } = request.nextUrl;
  const filter = searchParams.get("filter") ?? "all";
  const search = searchParams.get("search") ?? "";
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  const where: Record<string, unknown> = {};
  if (filter === "flagged") {
    where.verifications = { some: { fraudScore: { gt: 0.7 } } };
  } else if (filter === "suspended") {
    where.role = "suspended";
  }
  if (search) {
    where.OR = [
      { displayName: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { initiaAddress: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        clerkId: true,
        displayName: true,
        username: true,
        initiaAddress: true,
        role: true,
        level: true,
        totalRewards: true,
        streakDays: true,
        createdAt: true,
        _count: { select: { verifications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.user.count({ where }),
  ]);

  const hasMore = users.length > limit;
  const items = hasMore ? users.slice(0, limit) : users;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor, total });
}

export async function PATCH(request: NextRequest) {
  const actor = await requireCurrentDbUser();
  if ("error" in actor) return actor.error;
  const roleErr = requireRole(actor, ["admin", "owner"]);
  if (roleErr) return roleErr;

  const { userId, role } = await request.json();
  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role required" }, { status: 400 });
  }

  const allowed = ["user", "sponsor", "admin"];
  if (!allowed.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, role: true },
  });

  const { writeAuditLog, AuditActions } = await import("@/lib/audit/log");
  await writeAuditLog({
    actorId: actor.clerkId,
    action: AuditActions.USER_ROLE_CHANGED,
    resource: "User",
    resourceId: userId,
    payload: { after: { role } },
    req: request,
  });

  return NextResponse.json({ success: true, user: updated });
}
