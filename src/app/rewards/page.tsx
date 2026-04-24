"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { ProductShell } from "@/components/layout/product-shell";

/* ── Asset placeholders - replace with actual assets ──────────────────────── */
const imgUserProfile = "";
const imgNavDashboard = "";
const imgNavActions = "";
const imgNavOffers = "";
const imgNavHistory = "";
const imgNavImpact = "";
const imgNotificationIcon = "";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  source: string;
  transactionHash: string | null;
  metadata: unknown;
  createdAt: string;
}

export default function RewardsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions?limit=20');
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <ProductShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
        </div>
      </ProductShell>
    );
  }

  return (
    <ProductShell>
      <div className="flex flex-col gap-24 max-w-[629px] mx-auto px-32 py-24">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <h1
            className="text-[#2d3435]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "56px",
              fontWeight: "600",
              lineHeight: "67.2px",
              letterSpacing: "-1.12px"
            }}
          >
            Rewards History
          </h1>
          
          <p
            className="text-[#5a6061]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              lineHeight: "28px"
            }}
          >
            Track your earned impact points and redemption history across all sustainability actions.
          </p>
        </div>

        {/* Points Balance */}
        <div className="relative h-[176px]">
          <div className="absolute left-0 top-0">
            <p
              className="text-[#3b6934]"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "112px",
                fontWeight: "600",
                lineHeight: "112px",
                letterSpacing: "-2.24px"
              }}
            >
              4,250
            </p>
          </div>
          <div className="absolute left-[321.58px] top-[16px]">
            <p
              className="text-[#5a6061]"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "18px",
                lineHeight: "28px"
              }}
            >
              Impact Points
            </p>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex flex-col gap-12 pt-8">
          <h2
            className="text-[#2d3435]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "28px",
              fontWeight: "500",
              lineHeight: "42px",
              letterSpacing: "-0.28px"
            }}
          >
            Recent Activity
          </h2>
          
          <div className="flex flex-col gap-4">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-[#5a6061]">
                No transactions yet.
              </div>
            ) : (
              transactions.map((tx) => {
                const amount = Number(tx.amount) / 1e18;
                const isPositive = amount >= 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-4 border-b border-[#e0e0e0] last:border-0"
                  >
                    <div className="flex flex-col gap-1">
                      <p
                        className="text-[#2d3435]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "16px",
                          fontWeight: "500",
                          lineHeight: "24px"
                        }}
                      >
                        {tx.source || tx.type}
                      </p>
                      <p
                        className="text-[#5a6061]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "14px",
                          lineHeight: "20px"
                        }}
                      >
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                    <p
                      className={`text-[${isPositive ? '#3b6934' : '#d63031'}]`}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "16px",
                        fontWeight: "600",
                        lineHeight: "24px"
                      }}
                    >
                      {isPositive ? '+' : ''}{amount.toFixed(2)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="pt-4">
            <button className="border-b border-[rgba(173,179,180,0.2)] pb-1.5">
              <p
                className="text-[#2d3431]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.36px",
                  textTransform: "uppercase"
                }}
              >
                LOAD MORE HISTORY
              </p>
            </button>
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
