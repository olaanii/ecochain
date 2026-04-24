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

    // Check if user already has a pending or approved request
    const existingRequest = await prisma.sponsorRequest.findFirst({
      where: {
        userId: dbUser.id,
        status: { in: ["pending", "approved"] },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "You already have a pending or approved sponsor request" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { businessName, contactInfo, reason } = body;

    if (!businessName || !contactInfo || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const sponsorRequest = await prisma.sponsorRequest.create({
      data: {
        userId: dbUser.id,
        clerkId: userId,
        businessName,
        contactInfo,
        reason,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, data: sponsorRequest });
  } catch (error) {
    console.error("[SponsorRequest] Error:", error);
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

    // Only allow admins to view all requests, users can only view their own
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all && dbUser.role !== "admin" && dbUser.role !== "owner") {
      return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
    }

    const requests = await prisma.sponsorRequest.findMany({
      where: all ? undefined : { userId: dbUser.id },
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("[SponsorRequest] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
