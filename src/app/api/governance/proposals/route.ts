/**
 * GET  /api/governance/proposals  — list proposals with filters
 * POST /api/governance/proposals  — create a proposal
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { publishEvent } from "@/lib/realtime/pubsub";
import { getCurrentDbUser } from "@/lib/auth/current-user";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ListQuerySchema = z.object({
  status: z.enum(["active", "completed", "failed", "all"]).default("all"),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const CreateSchema = z.object({
  title: z.string().min(6).max(200),
  description: z.string().min(20).max(5000),
  quorum: z.number().int().min(1),
  durationDays: z.number().int().min(1).max(30).default(7),
});

export async function GET(request: NextRequest) {
  try {
    const params = ListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const now = new Date();

    const where: Record<string, unknown> = {};
    if (params.status === "active") {
      where.endTime = { gt: now };
      where.status = { in: ["active", "pending"] };
    } else if (params.status === "completed") {
      where.status = { in: ["passed", "executed", "completed"] };
    } else if (params.status === "failed") {
      where.status = { in: ["failed", "rejected"] };
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [total, proposals] = await Promise.all([
      prisma.daoProposal.count({ where }),
      prisma.daoProposal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: proposals.map(formatProposal),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "invalid_params", details: err.errors }, { status: 400 });
    }
    console.error("[governance] list error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const caller = await getCurrentDbUser();
    if (!caller) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

    const body = CreateSchema.parse(await request.json());
    const now = new Date();
    const endTime = new Date(now.getTime() + body.durationDays * 24 * 60 * 60 * 1000);

    const proposal = await prisma.daoProposal.create({
      data: {
        title: body.title,
        description: body.description,
        proposer: caller.id,
        status: "active",
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        quorum: body.quorum,
        startTime: now,
        endTime,
      },
    });

    await publishEvent("proposal.created", formatProposal(proposal));

    return NextResponse.json({ success: true, data: formatProposal(proposal) }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "invalid_body", details: err.errors }, { status: 400 });
    }
    console.error("[governance] create error", err);
    return NextResponse.json({ success: false, error: "internal" }, { status: 500 });
  }
}

function formatProposal(p: {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  startTime: Date;
  endTime: Date;
  executionTime: Date | null;
  createdAt: Date;
}) {
  const totalVotes = p.votesFor + p.votesAgainst + p.votesAbstain;
  const approvePct = totalVotes > 0 ? Math.round((p.votesFor / totalVotes) * 100) : 0;
  const rejectPct = totalVotes > 0 ? Math.round((p.votesAgainst / totalVotes) * 100) : 0;
  const quorumPct = p.quorum > 0 ? Math.min(100, Math.round((totalVotes / p.quorum) * 100)) : 0;
  const now = Date.now();
  const endsInMs = p.endTime.getTime() - now;

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    proposer: p.proposer,
    status: p.status,
    votesFor: p.votesFor,
    votesAgainst: p.votesAgainst,
    votesAbstain: p.votesAbstain,
    totalVotes,
    quorum: p.quorum,
    quorumPct,
    approvePct,
    rejectPct,
    startTime: p.startTime.toISOString(),
    endTime: p.endTime.toISOString(),
    executionTime: p.executionTime?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    endsInMs,
    isOpen: endsInMs > 0 && ["active", "pending"].includes(p.status),
  };
}
