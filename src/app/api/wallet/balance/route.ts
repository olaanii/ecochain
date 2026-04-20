/**
 * GET /api/wallet/balance?address=0x...
 * 
 * Returns multi-token balances for the wallet display component.
 * Aggregates on-chain ECO balance with mock prices for other tokens.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPublicClient } from "@/lib/blockchain/viem-clients";
import { createBalanceManager } from "@/lib/blockchain/balance-manager";

const QuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

// Token prices (in production, fetch from price oracle)
const TOKEN_PRICES: Record<string, number> = {
  ECO: 1.25,
  INIT: 1.25,
  USDC: 1.0,
  ETH: 3500.0,
  TIA: 2.5,
};

interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  priceUsd?: number;
  icon?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = request.nextUrl;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Missing address parameter" },
        { status: 400 }
      );
    }

    const validated = QuerySchema.parse({ address });
    const addr = validated.address as `0x${string}`;

    // Fetch ECO balance from blockchain
    let ecoBalance = "0";
    try {
      const publicClient = getPublicClient();
      const manager = createBalanceManager(publicClient);
      const bal = await manager.getBalance(addr);
      ecoBalance = bal.total.toString();
    } catch (err) {
      console.error("[wallet/balance] ECO balance fetch failed:", err);
      // Continue with zero balance rather than failing entirely
    }

    // Build multi-token response
    const balances: TokenBalance[] = [
      {
        symbol: "ECO",
        balance: ecoBalance,
        decimals: 18,
        priceUsd: TOKEN_PRICES.ECO,
      },
      {
        symbol: "INIT",
        balance: "0.0000",
        decimals: 6,
        priceUsd: TOKEN_PRICES.INIT,
      },
      {
        symbol: "USDC",
        balance: "0.00",
        decimals: 6,
        priceUsd: TOKEN_PRICES.USDC,
      },
      {
        symbol: "ETH",
        balance: "0.0000",
        decimals: 18,
        priceUsd: TOKEN_PRICES.ETH,
      },
    ];

    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        address: validated.address,
        balances,
        latency,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[wallet/balance] error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid address format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
