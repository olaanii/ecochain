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
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  // For pending filter, show SponsorRequest entries
  if (filter === "pending") {
    const where: Record<string, unknown> = { status: "pending" };
    
    const [requests, total] = await Promise.all([
      prisma.sponsorRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              username: true,
              initiaAddress: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      prisma.sponsorRequest.count({ where }),
    ]);

    const hasMore = requests.length > limit;
    const items = hasMore ? requests.slice(0, limit) : requests;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({ items, nextCursor, total, type: "requests" });
  }

  // For other filters, show User entries with sponsor roles
  const where: Record<string, unknown> = { role: "sponsor" };
  if (filter === "rejected") {
    where.role = "rejected_sponsor";
  }

  const [sponsors, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        username: true,
        initiaAddress: true,
        role: true,
        createdAt: true,
        _count: { select: { verifications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.user.count({ where }),
  ]);

  const hasMore = sponsors.length > limit;
  const items = hasMore ? sponsors.slice(0, limit) : sponsors;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor, total, type: "users" });
}

export async function PATCH(request: NextRequest) {
  const actor = await requireCurrentDbUser();
  if ("error" in actor) return actor.error;
  const roleErr = requireRole(actor, ["admin", "owner"]);
  if (roleErr) return roleErr;

  const { sponsorId, action, requestId } = await request.json();
  if (!sponsorId && !requestId) {
    return NextResponse.json({ error: "sponsorId or requestId required" }, { status: 400 });
  }
  if (!action) {
    return NextResponse.json({ error: "action required" }, { status: 400 });
  }

  const roleMap: Record<string, string> = {
    approve: "sponsor",
    reject: "rejected_sponsor",
    revoke: "user",
  };
  if (!roleMap[action]) {
    return NextResponse.json({ error: "action must be approve|reject|revoke" }, { status: 400 });
  }

  // If requestId is provided, handle SponsorRequest approval/rejection
  if (requestId) {
    const requestRecord = await prisma.sponsorRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!requestRecord) {
      return NextResponse.json({ error: "Sponsor request not found" }, { status: 404 });
    }

    // Update request status
    await prisma.sponsorRequest.update({
      where: { id: requestId },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        reviewedBy: actor.id,
        reviewedAt: new Date(),
      },
    });

    // If approving, also update user role
    if (action === "approve") {
      await prisma.user.update({
        where: { id: requestRecord.userId },
        data: { role: "sponsor" },
      });
    }

    const { writeAuditLog, AuditActions } = await import("@/lib/audit/log");
    await writeAuditLog({
      actorId: actor.clerkId,
      action: action === "approve" ? AuditActions.SPONSOR_APPROVED : AuditActions.SPONSOR_REJECTED,
      resource: "SponsorRequest",
      resourceId: requestId,
      payload: { 
        userId: requestRecord.userId,
        after: { status: action === "approve" ? "approved" : "rejected" },
      },
      req: request,
    });

    return NextResponse.json({ success: true });
  }

  // Otherwise, handle direct user role change (existing behavior)
  const updated = await prisma.user.update({
    where: { id: sponsorId },
    data: { role: roleMap[action] },
    select: { id: true, role: true },
  });

  const { writeAuditLog, AuditActions } = await import("@/lib/audit/log");
  await writeAuditLog({
    actorId: actor.clerkId,
    action: action === "approve" ? AuditActions.SPONSOR_APPROVED : AuditActions.SPONSOR_REJECTED,
    resource: "User",
    resourceId: sponsorId,
    payload: { after: { role: roleMap[action] } },
    req: request,
  });

  return NextResponse.json({ success: true, sponsor: updated });
}
