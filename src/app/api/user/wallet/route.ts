import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentDbUser } from "@/lib/auth/current-user";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
    }

    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "user not found in database" }, { status: 404 });
    }

    const body = await request.json();
    const { initiaAddress, initiaUsername } = body;

    if (!initiaAddress) {
      return NextResponse.json({ success: false, error: "initiaAddress is required" }, { status: 400 });
    }

    // Check if address is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { initiaAddress },
    });

    if (existingUser && existingUser.id !== dbUser.id) {
      return NextResponse.json({ success: false, error: "Wallet address already linked to another account" }, { status: 400 });
    }

    // Update user with wallet address
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        initiaAddress,
        ...(initiaUsername ? { initiaUsername } : {}),
      },
      select: {
        id: true,
        initiaAddress: true,
        initiaUsername: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("[UserWallet] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
    }

    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "user not found in database" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasWallet: !!dbUser.initiaAddress,
        initiaAddress: dbUser.initiaAddress,
        initiaUsername: dbUser.initiaUsername,
      },
    });
  } catch (error) {
    console.error("[UserWallet] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
