/**
 * GET /api/stats/protocol
 * 
 * Returns protocol-level statistics (TVL, staked amount, 
 * reward pool, active users, etc.) for dashboard analytics.
 * Currently returns mock data; wire to real contracts for production.
 */

import { NextRequest, NextResponse } from "next/server";

interface ProtocolStats {
  tvl: {
    value: string;
    usd: number;
    change24h: number;
  };
  staked: {
    value: string;
    usd: number;
    percentOfSupply: number;
  };
  rewardPool: {
    value: string;
    usd: number;
    distributed24h: string;
  };
  users: {
    total: number;
    active24h: number;
    new24h: number;
  };
  transactions: {
    total: number;
    volume24h: string;
    avgTime: number;
  };
  ecoPrice: {
    usd: number;
    change24h: number;
  };
  updatedAt: string;
}

export async function GET(_request: NextRequest) {
  try {
    // Mock protocol stats - replace with real on-chain queries
    const stats: ProtocolStats = {
      tvl: {
        value: "12500000",
        usd: 15625000,
        change24h: 3.2,
      },
      staked: {
        value: "8750000",
        usd: 10937500,
        percentOfSupply: 70,
      },
      rewardPool: {
        value: "2500000",
        usd: 3125000,
        distributed24h: "125000",
      },
      users: {
        total: 15420,
        active24h: 3420,
        new24h: 156,
      },
      transactions: {
        total: 452380,
        volume24h: "850000",
        avgTime: 2.5,
      },
      ecoPrice: {
        usd: 1.25,
        change24h: -1.8,
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[stats/protocol] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch protocol stats" },
      { status: 500 }
    );
  }
}
