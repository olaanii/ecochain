"use client";

import Image from "next/image";
import Link from "next/link";

import { ProductShell } from "@/components/layout/product-shell";

/* ── Asset placeholders - replace with actual assets ──────────────────────── */
const imgUserProfile = "";
const imgNavDashboard = "";
const imgNavActions = "";
const imgNavOffers = "";
const imgNavHistory = "";
const imgNavImpact = "";
const imgNotificationIcon = "";

export default function RewardsPage() {
  const transactions = [
    {
      date: "OCT 24, 2023",
      title: "Community Tree Planting",
      points: "+500",
      type: "earned"
    },
    {
      date: "OCT 18, 2023",
      title: "Redeemed: Organic Cotton Tote",
      points: "-1,200",
      type: "redeemed"
    },
    {
      date: "OCT 12, 2023",
      title: "Weekly Commute (Bike)",
      points: "+150",
      type: "earned"
    },
    {
      date: "SEP 30, 2023",
      title: "Zero-Waste Groceries Bonus",
      points: "+300",
      type: "earned"
    }
  ];

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
          
          <div className="flex flex-col gap-12">
            {transactions.map((transaction, index) => (
              <div key={index} className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p
                    className="text-[#adb3b4]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      fontWeight: "600",
                      letterSpacing: "0.36px",
                      textTransform: "uppercase"
                    }}
                  >
                    {transaction.date}
                  </p>
                  <p
                    className="text-[#2d3435]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      fontWeight: "500",
                      lineHeight: "24px"
                    }}
                  >
                    {transaction.title}
                  </p>
                </div>
                <p
                  className={transaction.type === "earned" ? "text-[#3b6934]" : "text-[#5a6061]"}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "18px",
                    fontWeight: "500",
                    lineHeight: "28px"
                  }}
                >
                  {transaction.points}
                </p>
              </div>
            ))}
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
