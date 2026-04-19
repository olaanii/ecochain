"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, RefreshCw, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/wallet-context";
import { useWalletStore } from "@/stores/wallet-store";
import { Button } from "@/components/ui/button";

interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  priceUsd?: number;
  icon?: string;
}

interface BalanceDisplayProps {
  className?: string;
  showChange?: boolean;
  defaultCurrency?: string;
  showUsd?: boolean;
  autoRefresh?: boolean;
}

// Mock token prices (in production, fetch from price oracle)
const MOCK_PRICES: Record<string, number> = {
  INIT: 1.25,
  USDC: 1.00,
  ETH: 3500.00,
  TIA: 2.50,
};

export function BalanceDisplay({
  className,
  showChange = true,
  defaultCurrency = "INIT",
  showUsd = true,
  autoRefresh = true,
}: BalanceDisplayProps) {
  const { isConnected, address } = useWallet();
  const { balance, setWalletState } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [previousBalance, setPreviousBalance] = useState<string | null>(null);
  const [change, setChange] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<string>(defaultCurrency);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([
    { symbol: "INIT", balance: "0.0000", decimals: 6, priceUsd: MOCK_PRICES.INIT },
    { symbol: "USDC", balance: "0.00", decimals: 6, priceUsd: MOCK_PRICES.USDC },
    { symbol: "ETH", balance: "0.0000", decimals: 18, priceUsd: MOCK_PRICES.ETH },
  ]);
  const [showTokenSelector, setShowTokenSelector] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      // Fetch balances from blockchain API
      const response = await fetch(`/api/wallet/balance?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();
      
      setPreviousBalance(balance || null);
      setTokenBalances(data.balances || tokenBalances);
      
      // Update wallet store with primary token balance
      const primaryToken = data.balances?.find((t: TokenBalance) => t.symbol === selectedToken);
      if (primaryToken) {
        setWalletState({ balance: primaryToken.balance });
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address, balance, selectedToken, tokenBalances, setWalletState]);

  useEffect(() => {
    if (address && isConnected) {
      fetchBalance();
    }
  }, [address, isConnected, fetchBalance]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, fetchBalance]);

  useEffect(() => {
    if (balance && previousBalance) {
      const current = parseFloat(balance);
      const prev = parseFloat(previousBalance);
      const percentChange = ((current - prev) / prev) * 100;
      setChange(percentChange);
    }
  }, [balance, previousBalance]);

  const currentToken = tokenBalances.find((t) => t.symbol === selectedToken);
  const usdValue = currentToken?.priceUsd
    ? (parseFloat(currentToken.balance) * currentToken.priceUsd).toFixed(2)
    : "0.00";

  if (!isConnected) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Wallet className="h-4 w-4" />
        <span className="text-sm">Not connected</span>
      </div>
    );
  }

  const isPositive = change >= 0;

  return (
    <div className={cn("space-y-2 relative", className)}>
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Balance</span>
        <button
          onClick={fetchBalance}
          disabled={isLoading}
          className={cn(
            "text-muted-foreground hover:text-foreground transition-colors",
            isLoading && "animate-spin"
          )}
          aria-label="Refresh balance"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">
          {isLoading ? "..." : currentToken?.balance || "0.0000"}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{selectedToken}</span>
          <button
            onClick={() => setShowTokenSelector(!showTokenSelector)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {showUsd && (
        <div className="text-sm text-muted-foreground">
          ≈ ${isLoading ? "..." : usdValue} USD
        </div>
      )}

      {showChange && previousBalance && change !== 0 && (
        <div className="flex items-center gap-1 text-xs">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {isPositive ? "+" : ""}{change.toFixed(2)}%
          </span>
          <span className="text-muted-foreground">since last update</span>
        </div>
      )}

      {/* Token Selector Dropdown */}
      {showTokenSelector && (
        <div className="absolute top-full left-0 mt-2 bg-card border rounded-lg shadow-lg p-2 min-w-[160px] z-50">
          {tokenBalances.map((token) => (
            <button
              key={token.symbol}
              onClick={() => {
                setSelectedToken(token.symbol);
                setShowTokenSelector(false);
                setWalletState({ balance: token.balance });
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                selectedToken === token.symbol
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              )}
            >
              <span>{token.symbol}</span>
              {showUsd && token.priceUsd && (
                <span className="text-xs opacity-70">
                  ${(parseFloat(token.balance) * token.priceUsd).toFixed(2)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
