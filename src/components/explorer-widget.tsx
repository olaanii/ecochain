"use client";

import { useState, useEffect } from "react";
import { Search, ExternalLink, Box, Activity, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockData {
  number: number;
  hash: string;
  timestamp: number;
  txCount: number;
}

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

interface ValidatorData {
  address: string;
  name: string;
  stake: string;
  status: "active" | "inactive";
}

export function ExplorerWidget({ className }: { className?: string }) {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from blockchain API
    const fetchData = async () => {
      try {
        const [blocksRes, txsRes, validatorsRes] = await Promise.all([
          fetch('/api/explorer/blocks'),
          fetch('/api/explorer/transactions'),
          fetch('/api/explorer/validators'),
        ]);

        if (blocksRes.ok) setBlocks(await blocksRes.json());
        if (txsRes.ok) setTransactions(await txsRes.json());
        if (validatorsRes.ok) setValidators(await validatorsRes.json());
      } catch (error) {
        console.error("Failed to fetch explorer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (!searchQuery) return;
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  if (isLoading) {
    return (
      <div className={cn("p-4 border rounded-lg", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 border rounded-lg space-y-6", className)}>
      {/* Search */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Block Explorer</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search address, tx hash, or block..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Recent Blocks */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Recent Blocks</h4>
        </div>
        <div className="space-y-2">
          {blocks.map((block) => (
            <div
              key={block.hash}
              className="flex items-center justify-between p-2 hover:bg-secondary rounded-md transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono">#{block.number}</span>
                <span className="text-xs text-muted-foreground">
                  {block.txCount} txs
                </span>
              </div>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Recent Transactions</h4>
        </div>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between p-2 hover:bg-secondary rounded-md transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs font-mono truncate">
                  {tx.hash.slice(0, 10)}...
                </span>
                <span className="text-xs text-muted-foreground">{tx.value}</span>
              </div>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground ml-2"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Validators */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Validators</h4>
        </div>
        <div className="space-y-2">
          {validators.map((validator) => (
            <div
              key={validator.address}
              className="flex items-center justify-between p-2 hover:bg-secondary rounded-md transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    validator.status === "active" ? "bg-green-500" : "bg-gray-400"
                  )}
                />
                <span className="text-xs font-medium truncate">{validator.name}</span>
                <span className="text-xs text-muted-foreground">{validator.stake}</span>
              </div>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground ml-2"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
