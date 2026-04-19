import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";

const ALLOWED_ROLES = ["user", "sponsor", "admin"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, displayName: true, initiaAddress: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    role: user.role,
    displayName: user.displayName,
    initiaAddress: user.initiaAddress,
  });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { role } = body;

  if (!role || !ALLOWED_ROLES.includes(role as AllowedRole)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${ALLOWED_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { clerkId: userId },
    data: { role },
    select: { id: true, role: true },
  });

  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
  } catch (err) {
    console.error("[/api/me] Failed to sync role to Clerk metadata:", err);
  }

  return NextResponse.json({ id: user.id, role: user.role });
}
