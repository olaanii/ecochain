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
  const result = await verifyClerkWebhook(request);
  if (!result.ok) return result.response;

  const { event } = result;
  const data = event.data as Record<string, unknown>;

  try {
    switch (event.type) {
      case "user.created": {
        const email =
          (data.email_addresses as Array<{ email_address: string; primary?: boolean }>)?.[0]
            ?.email_address ?? "";
        const firstName = (data.first_name as string) ?? "";
        const lastName = (data.last_name as string) ?? "";
        const displayName =
          [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0];

        await prisma.user.upsert({
          where: { clerkId: data.id as string },
          create: {
            clerkId: data.id as string,
            email,
            displayName,
            role: "user",
          },
          update: { email, displayName },
        });
        break;
      }

      case "user.updated": {
        const email =
          (data.email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;
        const firstName = (data.first_name as string) ?? "";
        const lastName = (data.last_name as string) ?? "";
        const displayName = [firstName, lastName].filter(Boolean).join(" ") || undefined;

        await prisma.user.updateMany({
          where: { clerkId: data.id as string },
          data: {
            ...(email ? { email } : {}),
            ...(displayName ? { displayName } : {}),
          },
        });
        break;
      }

      case "user.deleted": {
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
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[Webhook] Error processing Clerk event:", event.type, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
