"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const transactions = [
  {
    id: "TX-001",
    action: "Transit Commute",
    amount: "+25 ECO",
    status: "verified",
    timestamp: "2024-03-15 09:30",
    proof: "Photo + GPS",
  },
  {
    id: "TX-002",
    action: "Recycling Drop-off",
    amount: "+15 ECO",
    status: "verified",
    timestamp: "2024-03-14 16:45",
    proof: "Weight Sensor",
  },
  {
    id: "TX-003",
    action: "Bike Commute",
    amount: "+30 ECO",
    status: "pending",
    timestamp: "2024-03-14 08:15",
    proof: "GPS Track",
  },
  {
    id: "TX-004",
    action: "Solar Energy",
    amount: "+50 ECO",
    status: "verified",
    timestamp: "2024-03-13 12:00",
    proof: "Smart Meter",
  },
  {
    id: "TX-005",
    action: "Water Conservation",
    amount: "+20 ECO",
    status: "rejected",
    timestamp: "2024-03-12 18:30",
    proof: "Manual Entry",
  },
];

export function EarningsLedger() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold text-white">ECO Earnings Ledger</h1>
        <p className="text-slate-300">
          Track every cryptographically verified proof-of-impact. Earnings are processed in
          real-time and settled on the NeonVoid substrate.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Total Earned</p>
            <p className="text-3xl font-bold text-emerald-300">1,250 ECO</p>
            <p className="text-xs text-slate-500">+15% this week</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Pending Verification</p>
            <p className="text-3xl font-bold text-amber-300">30 ECO</p>
            <p className="text-xs text-slate-500">1 transaction</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Success Rate</p>
            <p className="text-3xl font-bold text-white">94%</p>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </div>
        </Card>
      </div>

      <Card title="Transaction History">
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-4">
                <div>
                  {tx.status === "verified" && (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  )}
                  {tx.status === "pending" && (
                    <Clock className="h-6 w-6 text-amber-400" />
                  )}
                  {tx.status === "rejected" && (
                    <XCircle className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{tx.action}</p>
                  <p className="text-xs text-slate-400">
                    {tx.timestamp} • {tx.proof}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-300">{tx.amount}</p>
                <Badge
                  className={
                    tx.status === "verified"
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : tx.status === "pending"
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                        : "border-red-400/30 bg-red-400/10 text-red-300"
                  }
                >
                  {tx.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button className="w-full">Load More Transactions</Button>
        </div>
      </Card>
    </main>
  );
}
