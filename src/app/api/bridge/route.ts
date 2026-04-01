import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { initiaSubmission } from "@/lib/initia/submission";
import { prisma } from "@/lib/prisma/client";

type BridgeEntry = {
  id: string;
  amount: number;
  denom: string;
  status: "queued" | "completed";
  timestamp: string;
  targetChain?: string;
  transactionLink?: string;
  builder?: string;
};

const bridgeLog: BridgeEntry[] = [];

export async function POST(request: Request) {
  const body = await request.json();
  const { userId } = await auth();

  try {
    const entry = await prisma.bridgeRequest.create({
      data: {
        userId,
        amount: Number(body.amount ?? 0),
        denom: body.denom ?? "INITIA",
        targetChain: body.targetChain ?? initiaSubmission.chainId,
        status: body.status ?? "queued",
        transactionLink:
          body.transactionLink ?? `${initiaSubmission.txnEvidence}?bridge=${crypto.randomUUID()}`,
      },
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        amount: entry.amount,
        denom: entry.denom,
        status: entry.status,
        targetChain: entry.targetChain,
        transactionLink: entry.transactionLink,
        timestamp: entry.createdAt.toISOString(),
      },
      message: "Bridge request submitted. Initia router will confirm with a txn.",
    });
  } catch {
    const entry: BridgeEntry = {
      id: crypto.randomUUID(),
      amount: Number(body.amount ?? 0),
      denom: body.denom ?? "INITIA",
      status: "queued",
      timestamp: new Date().toISOString(),
      targetChain: body.targetChain ?? initiaSubmission.chainId,
      transactionLink:
        body.transactionLink ?? `${initiaSubmission.txnEvidence}?bridge=${crypto.randomUUID()}`,
      builder: body.displayName ?? body.initiaUsername ?? "Builder",
    };

    bridgeLog.unshift(entry);

    return NextResponse.json({
      success: true,
      entry,
      message: "Bridge request submitted. The Initia router will confirm with a txn link.",
    });
  }
}

export async function GET() {
  try {
    const history = await prisma.bridgeRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: true },
    });

    return NextResponse.json({
      history: history.map((entry: any) => ({
        id: entry.id,
        amount: entry.amount,
        denom: entry.denom,
        status: entry.status,
        targetChain: entry.targetChain,
        transactionLink: entry.transactionLink,
        timestamp: entry.createdAt.toISOString(),
        builder: entry.user?.displayName ?? entry.user?.initiaUsername ?? "Builder",
      })),
    });
  } catch {
    return NextResponse.json({
      history: bridgeLog.slice(0, 6),
    });
  }
}
