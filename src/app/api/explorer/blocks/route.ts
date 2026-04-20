/**
 * GET /api/explorer/blocks
 * 
 * Returns recent blockchain blocks for the explorer view.
 * In production, this queries the Initia L1 or rollup RPC.
 * Currently returns mock data for UI development.
 */

import { NextRequest, NextResponse } from "next/server";

interface Block {
  height: string;
  hash: string;
  time: string;
  txCount: number;
  proposer: string;
}

// Mock blocks data - replace with real RPC queries
const MOCK_BLOCKS: Block[] = [
  {
    height: "1058421",
    hash: "0x7a3f...9e2b",
    time: "2026-04-20T16:42:00Z",
    txCount: 12,
    proposer: "initvaloper1...",
  },
  {
    height: "1058420",
    hash: "0x8b4c...1f3a",
    time: "2026-04-20T16:41:30Z",
    txCount: 8,
    proposer: "initvaloper2...",
  },
  {
    height: "1058419",
    hash: "0x9d5e...2g4b",
    time: "2026-04-20T16:41:00Z",
    txCount: 15,
    proposer: "initvaloper3...",
  },
  {
    height: "1058418",
    hash: "0x1a6f...3h5c",
    time: "2026-04-20T16:40:30Z",
    txCount: 3,
    proposer: "initvaloper1...",
  },
  {
    height: "1058417",
    hash: "0x2b7g...4i6d",
    time: "2026-04-20T16:40:00Z",
    txCount: 22,
    proposer: "initvaloper2...",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Slice the mock data
    const blocks = MOCK_BLOCKS.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        blocks,
        total: MOCK_BLOCKS.length,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < MOCK_BLOCKS.length,
        },
      },
    });
  } catch (error) {
    console.error("[explorer/blocks] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blocks" },
      { status: 500 }
    );
  }
}
