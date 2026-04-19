/**
 * POST /api/verification/:verificationId/attestation
 *
 * Returns an EIP-712 signed Attestation that the caller can forward directly
 * to `EcoVerifier.submitProof(...)` on chain. The on-chain contract will
 * refuse any claim not signed by an address holding `ORACLE_ROLE` — so this
 * endpoint is the gate that ultimately decides whether a verification turns
 * into minted ECO tokens.
 *
 * Preconditions (all must hold, else 4xx):
 *   - Caller is authenticated (Clerk).
 *   - Verification exists and belongs to the caller.
 *   - Verification has been approved by the off-chain pipeline
 *     (status === "verified").
 *   - No on-chain submission has happened yet (transactionHash is null).
 *   - The task has a slug (used as the on-chain bytes32 taskId seed).
 *   - Reward > 0.
 *
 * Body:
 *   { nonce: string | number }
 *     On-chain `EcoVerifier.nonces(user)` — the caller reads it via viem /
 *     wagmi before invoking this route. We don't trust it blindly: the
 *     signature binds the nonce so a stale value will simply be rejected on
 *     chain, but we still validate it's a non-negative integer here.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import {
  signAttestation,
  serializeSignedAttestation,
} from "@/lib/blockchain/oracle-signer";

export const runtime = "nodejs"; // viem/accounts needs Node crypto, not edge.

const BodySchema = z.object({
  nonce: z
    .union([z.string(), z.number()])
    .transform((v) => {
      const n = typeof v === "string" ? v.trim() : v;
      if (typeof n === "string" && !/^\d+$/.test(n)) {
        throw new Error("nonce must be a non-negative integer");
      }
      return BigInt(n);
    })
    .refine((n) => n >= BigInt(0), { message: "nonce must be >= 0" }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ verificationId: string }> },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { verificationId } = await params;
    if (!verificationId) {
      return NextResponse.json(
        { success: false, error: "verificationId is required" },
        { status: 400 },
      );
    }

    let parsed: z.infer<typeof BodySchema>;
    try {
      parsed = BodySchema.parse(await request.json());
    } catch (err) {
      const msg =
        err instanceof z.ZodError
          ? err.errors[0]?.message ?? "invalid body"
          : (err as Error).message;
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 },
      );
    }

    const caller = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, initiaAddress: true },
    });
    if (!caller) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }
    if (!caller.initiaAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "User has no on-chain address — link a wallet first",
        },
        { status: 409 },
      );
    }

    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      select: {
        id: true,
        userId: true,
        status: true,
        reward: true,
        proofHash: true,
        transactionHash: true,
        task: { select: { slug: true } },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: "Verification not found" },
        { status: 404 },
      );
    }
    if (verification.userId !== caller.id) {
      // Don't leak existence of other users' verifications.
      return NextResponse.json(
        { success: false, error: "Verification not found" },
        { status: 404 },
      );
    }
    if (verification.status !== "verified") {
      return NextResponse.json(
        {
          success: false,
          error: `Verification is not approved (status=${verification.status})`,
        },
        { status: 409 },
      );
    }
    if (verification.transactionHash) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification already claimed on-chain",
          transactionHash: verification.transactionHash,
        },
        { status: 409 },
      );
    }
    if (verification.reward <= 0) {
      return NextResponse.json(
        { success: false, error: "Verification has no reward to claim" },
        { status: 409 },
      );
    }
    if (!verification.task?.slug) {
      return NextResponse.json(
        { success: false, error: "Task has no slug; cannot derive taskId" },
        { status: 500 },
      );
    }

    // Reward in the DB is stored as a plain integer (whole ECO units). The
    // on-chain reward is 18-decimal wei, so scale up.
    const rewardWei = BigInt(verification.reward) * BigInt(10) ** BigInt(18);

    const signed = await signAttestation({
      user: caller.initiaAddress,
      taskId: `slug:${verification.task.slug}`,
      proofHash: verification.proofHash,
      reward: rewardWei,
      nonce: parsed.nonce,
    });

    return NextResponse.json(
      {
        success: true,
        data: serializeSignedAttestation(signed),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/verification/attestation] error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    // Missing ORACLE_SIGNER_PRIVATE_KEY / chain id are configuration errors;
    // don't echo them verbatim to the client, but surface a useful category.
    const isConfigError = /missing required env|could not resolve/i.test(
      message,
    );
    return NextResponse.json(
      {
        success: false,
        error: isConfigError
          ? "Signer service is not configured"
          : "Failed to sign attestation",
      },
      { status: isConfigError ? 503 : 500 },
    );
  }
}
