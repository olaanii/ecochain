/**
 * Clerk webhook handler.
 *
 * Verifies the svix signature + replay guard, then dispatches user lifecycle
 * events to keep the Postgres `User` table in sync with Clerk.
 *
 * Events handled:
 *   user.created  → create User row
 *   user.updated  → sync email / displayName
 *   user.deleted  → soft-delete (set deletedAt) and write audit log
 *
 * Set CLERK_WEBHOOK_SECRET in Vercel env vars (or .env.local for dev).
 * In Clerk Dashboard → Webhooks, point the endpoint at /api/webhooks/clerk
 * and subscribe to: user.created, user.updated, user.deleted.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyClerkWebhook } from "@/lib/webhooks/clerk";
import { prisma } from "@/lib/prisma/client";
import { writeAuditLog, AuditActions } from "@/lib/audit/log";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("[Webhook] Received Clerk webhook request");

  try {
    const result = await verifyClerkWebhook(request);
    if (!result.ok) {
      console.log("[Webhook] Verification failed:", result.response);
      return result.response;
    }

    const { event } = result;
    const data = event.data as Record<string, unknown>;
    console.log("[Webhook] Processing event:", event.type, "for user:", data.id);

    switch (event.type) {
      case "user.created": {
        const email =
          (data.email_addresses as Array<{ email_address: string; primary?: boolean }>)?.[0]
            ?.email_address ?? "";
        const firstName = (data.first_name as string) ?? "";
        const lastName = (data.last_name as string) ?? "";
        const displayName =
          [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0];

        console.log("[Webhook] Creating user:", { clerkId: data.id, email, displayName });

        // Check if this is the first user - make them admin
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? "admin" : "user";
        console.log("[Webhook] User count:", userCount, "assigning role:", role);

        await prisma.user.upsert({
          where: { clerkId: data.id as string },
          create: {
            clerkId: data.id as string,
            email,
            displayName,
            role,
          },
          update: { email, displayName },
        });
        console.log("[Webhook] User created/updated successfully");
        break;
      }

      case "user.updated": {
        const email =
          (data.email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;
        const firstName = (data.first_name as string) ?? "";
        const lastName = (data.last_name as string) ?? "";
        const displayName = [firstName, lastName].filter(Boolean).join(" ") || undefined;

        console.log("[Webhook] Updating user:", { clerkId: data.id, email, displayName });

        await prisma.user.updateMany({
          where: { clerkId: data.id as string },
          data: {
            ...(email ? { email } : {}),
            ...(displayName ? { displayName } : {}),
          },
        });
        console.log("[Webhook] User updated successfully");
        break;
      }

      case "user.deleted": {
        console.log("[Webhook] Deleting user:", data.id);
        const user = await prisma.user.findUnique({
          where: { clerkId: data.id as string },
          select: { id: true },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { deletedAt: new Date() },
          });
          await writeAuditLog({
            actorId: data.id as string,
            action: AuditActions.USER_DELETED,
            resource: "User",
            resourceId: user.id,
            payload: { source: "clerk.webhook", clerkId: data.id },
          });
          console.log("[Webhook] User soft-deleted successfully");
        } else {
          console.log("[Webhook] User not found for deletion");
        }
        break;
      }

      default:
        console.log("[Webhook] Unhandled event type:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook] Error processing Clerk event:", err);
    console.error("[Webhook] Error stack:", err instanceof Error ? err.stack : "No stack");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
