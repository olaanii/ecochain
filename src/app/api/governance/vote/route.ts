/**
 * POST /api/governance/vote
 *
 * Body: { proposalId, userId, support: 'for'|'against'|'abstain', reason? }
 * Uses staked balance as voting power.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { publishEvent } from "@/lib/realtime/pubsub";
import { getCurrentDbUser } from "@/lib/auth/current-user";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Schema = z.object({
  proposalId: z.string().min(1),
  support: z.enum(["for", "against", "abstain"]),
  reason: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const caller = await getCurrentDbUser();
    if (!caller) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

    const body = Schema.parse(await request.json());

    const [user, proposal, existing] = await Promise.all([
      prisma.user.findUnique({
        where: { id: caller.id },
        include: { stakes: { where: { status: "active" } } },
      }),
      prisma.daoProposal.findUnique({ where: { id: body.proposalId } }),
      prisma.vote.findUnique({
        where: { userId_proposalId: { userId: caller.id, proposalId: body.proposalId } },
      }),
    ]);

    if (!user) return NextResponse.json({ success: false, error: "user_not_found" }, { status: 404 });
    if (!proposal) return NextResponse.json({ success: false, error: "proposal_not_found" }, { status: 404 });
    if (existing) return NextResponse.json({ success: false, error: "already_voted" }, { status: 409 });
    if (proposal.endTime.getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: "voting_closed" }, { status: 409 });
    }

    const stakeTotal = user.stakes.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0);
    const votingPower = stakeTotal || Math.max(1, Math.floor(user.totalRewards / 100));

    const vote = await prisma.vote.create({
      data: {
        userId: caller.id,
        proposalId: body.proposalId,
        support: body.support,
        reason: body.reason,
        votingPower,
      },
    });
    const updated = await prisma.daoProposal.update({
      where: { id: body.proposalId },
      data:
        body.support === "for"
          ? { votesFor: { increment: votingPower } }
          : body.support === "against"
            ? { votesAgainst: { increment: votingPower } }
            : { votesAbstain: { increment: votingPower } },
    });

    await publishEvent("proposal.voted", {
      proposalId: updated.id,
      votesFor: updated.votesFor,
      votesAgainst: updated.votesAgainst,
      votesAbstain: updated.votesAbstain,
      by: user.id,
    });

    return NextResponse.json({ success: true, data: { vote, votingPower } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "invalid_body", details: err.errors }, { status: 400 });
    }
    console.error("[governance] vote error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}
