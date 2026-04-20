/**
 * GET /api/explorer/validators
 * 
 * Returns validator set for the explorer view.
 * In production, this queries the Initia L1 staking module.
 * Currently returns mock data for UI development.
 */

import { NextRequest, NextResponse } from "next/server";

interface Validator {
  rank: number;
  address: string;
  moniker: string;
  votingPower: string;
  votingPowerPercent: number;
  commission: number;
  uptime: number;
  status: "active" | "inactive" | "jailed";
}

// Mock validators data - replace with real RPC queries
const MOCK_VALIDATORS: Validator[] = [
  {
    rank: 1,
    address: "initvaloper1abc123...",
    moniker: "EcoChain Validator #1",
    votingPower: "12500000",
    votingPowerPercent: 15.2,
    commission: 5.0,
    uptime: 99.98,
    status: "active",
  },
  {
    rank: 2,
    address: "initvaloper2def456...",
    moniker: "EcoChain Validator #2",
    votingPower: "10800000",
    votingPowerPercent: 13.1,
    commission: 3.5,
    uptime: 99.95,
    status: "active",
  },
  {
    rank: 3,
    address: "initvaloper3ghi789...",
    moniker: "EcoChain Validator #3",
    votingPower: "9200000",
    votingPowerPercent: 11.2,
    commission: 4.0,
    uptime: 99.91,
    status: "active",
  },
  {
    rank: 4,
    address: "initvaloper4jkl012...",
    moniker: "EcoChain Validator #4",
    votingPower: "7800000",
    votingPowerPercent: 9.5,
    commission: 7.5,
    uptime: 99.85,
    status: "active",
  },
  {
    rank: 5,
    address: "initvaloper5mno345...",
    moniker: "EcoChain Validator #5",
    votingPower: "6500000",
    votingPowerPercent: 7.9,
    commission: 5.0,
    uptime: 98.5,
    status: "active",
  },
  {
    rank: 6,
    address: "initvaloper6pqr678...",
    moniker: "EcoChain Validator #6",
    votingPower: "5200000",
    votingPowerPercent: 6.3,
    commission: 10.0,
    uptime: 95.2,
    status: "jailed",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");

    // Filter by status if specified
    let validators = MOCK_VALIDATORS;
    if (status) {
      validators = validators.filter((v) => v.status === status);
    }

    // Slice the data
    const paginated = validators.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        validators: paginated,
        total: validators.length,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < validators.length,
        },
      },
    });
  } catch (error) {
    console.error("[explorer/validators] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch validators" },
      { status: 500 }
    );
  }
}
