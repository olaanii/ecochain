import { prisma } from "@/lib/prisma/client";
import type { NextRequest } from "next/server";

export interface AuditPayload {
  before?: unknown;
  after?: unknown;
  [key: string]: unknown;
}

export interface WriteAuditLogOptions {
  actorId: string;
  action: string;
  resource: string;
  resourceId: string;
  payload?: AuditPayload;
  req?: NextRequest | Request;
}

/**
 * Write an immutable audit log entry.
 *
 * Call this after every privileged admin action (role change, pause, ban, etc.).
 * Failures are swallowed and logged to stderr so a logging hiccup never breaks
 * the underlying operation.
 *
 * @example
 * await writeAuditLog({
 *   actorId: clerkUserId,
 *   action: "user.role_changed",
 *   resource: "User",
 *   resourceId: targetUser.id,
 *   payload: { before: { role: "user" }, after: { role: "sponsor" } },
 *   req,
 * });
 */
export async function writeAuditLog(opts: WriteAuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: opts.actorId,
        action: opts.action,
        resource: opts.resource,
        resourceId: opts.resourceId,
        payload: opts.payload ?? {},
        ipAddress: extractIp(opts.req),
        userAgent: opts.req?.headers.get("user-agent") ?? null,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit entry:", err, opts);
  }
}

function extractIp(req?: NextRequest | Request): string | null {
  if (!req) return null;
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    null
  );
}

/** Convenience: common action codes to avoid typos. */
export const AuditActions = {
  USER_ROLE_CHANGED: "user.role_changed",
  USER_BANNED: "user.banned",
  USER_UNBANNED: "user.unbanned",
  USER_DELETED: "user.deleted",
  CONTRACT_PAUSED: "contract.paused",
  CONTRACT_UNPAUSED: "contract.unpaused",
  CONTRACT_UPGRADED: "contract.upgraded",
  TASK_CREATED: "task.created",
  TASK_UPDATED: "task.updated",
  TASK_DELETED: "task.deleted",
  SPONSOR_APPROVED: "sponsor.approved",
  SPONSOR_REJECTED: "sponsor.rejected",
  VERIFICATION_APPROVED: "verification.approved",
  VERIFICATION_REJECTED: "verification.rejected",
  PROOF_REJECTED: "verification.proof_rejected",
  FRAUD_QUARANTINED: "fraud.proof_quarantined",
  USER_SUSPENDED: "user.suspended",
  USER_ROLE_GRANTED: "user.role_granted",
} as const;
