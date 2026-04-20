/**
 * GET /api/explorer/transactions
 * 
 * Returns recent blockchain transactions for the explorer view.
 * In production, this queries the Initia L1 or rollup RPC.
 * Currently returns mock data for UI development.
 */

import { NextRequest, NextResponse } from "next/server";

interface Transaction {
  hash: string;
  height: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  denom: string;
  status: "success" | "failed" | "pending";
  time: string;
}

// Mock transactions data - replace with real RPC queries
const MOCK_TXS: Transaction[] = [
  {
    hash: "0xabc123...",
    height: "1058421",
    type: "transfer",
    from: "init1a1b2c3...",
    to: "init4d5e6f...",
    amount: "1000",
    denom: "uinit",
    status: "success",
    time: "2026-04-20T16:42:00Z",
  },
  {
    hash: "0xdef456...",
    height: "1058421",
    type: "stake",
    from: "init2b2c3d4...",
    to: "initvaloper1...",
    amount: "50000",
    denom: "uinit",
    status: "success",
    time: "2026-04-20T16:41:45Z",
  },
  {
    hash: "0xghi789...",
    height: "1058420",
    type: "ibc_transfer",
    from: "init3c3d4e5...",
    to: "osmo1x2y3z...",
    amount: "2500",
    denom: "uinit",
    status: "pending",
    time: "2026-04-20T16:41:30Z",
  },
  {
    hash: "0xjkl012...",
    height: "1058419",
    type: "claim",
    from: "init4d4e5f6...",
    to: "init4d4e5f6...",
    amount: "100",
    denom: "ueco",
    status: "success",
    time: "2026-04-20T16:41:00Z",
  },
  {
    hash: "0xmno345...",
    height: "1058418",
    type: "transfer",
    from: "init5e5f6g7...",
    to: "init6f6g7h8...",
    amount: "750",
    denom: "uinit",
    status: "failed",
    time: "2026-04-20T16:40:30Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type");

    // Filter by type if specified
    let txs = MOCK_TXS;
    if (type) {
      txs = txs.filter((tx) => tx.type === type);
    }

    // Slice the data
    const paginatedTxs = txs.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTxs,
        total: txs.length,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < txs.length,
        },
      },
    });
  } catch (error) {
    console.error("[explorer/transactions] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
