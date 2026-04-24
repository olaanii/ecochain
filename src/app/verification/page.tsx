"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { ProductShell } from "@/components/layout/product-shell";

/* ── Asset placeholders - replace with actual assets ──────────────────────── */
const imgUserProfile = "";
const imgPlantedTrees = "";
const imgUserPortrait = "";
const imgSolarPanelInstallation = "";
const imgNotificationIcon = "";
const imgVerificationIcon = "";
const imgApproveIcon = "";
const imgRejectIcon = "";
const imgLoadMoreIcon = "";
const imgNavDashboard = "";
const imgNavActions = "";
const imgNavOffers = "";
const imgNavHistory = "";
const imgNavImpact = "";

interface Verification {
  id: string;
  taskId: string;
  userId: string;
  status: string;
  fraudScore: number;
  evidence: unknown;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  task?: {
    name: string;
    description: string;
    category: string;
  };
  user?: {
    displayName: string;
    initiaUsername: string;
  };
}

export default function VerificationPage() {
  const [submissions, setSubmissions] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const res = await fetch('/api/verify/history?limit=20');
        const data = await res.json();
        if (data.success) {
          setSubmissions(data.verifications || []);
        }
      } catch (err) {
        console.error('Failed to fetch verifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVerifications();
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
      <div className="flex flex-col gap-20 max-w-[1280px] mx-auto px-32 py-24">
        {/* Header */}
        <div className="flex flex-col gap-6 max-w-[768px]">
          <div className="flex items-center gap-2">
            <div className="relative h-3.5 w-3.5">
              <Image
                src={imgVerificationIcon}
                alt="Verification"
                fill
                className="object-contain"
              />
            </div>
            <p
              className="text-[#3b6934]"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.36px",
                textTransform: "uppercase"
              }}
            >
              VERIFICATION QUEUE
            </p>
          </div>
          
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
            Review Submissions
          </h1>
          
          <p
            className="text-[#5a6061]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "22px",
              fontWeight: "500",
              lineHeight: "30.8px"
            }}
          >
            Evaluate user contributions for environmental impact accuracy. Ensure<br />
            all data aligns with our sanctuary standards.
          </p>
        </div>

        {/* Submissions */}
        <div className="flex flex-col gap-6">
          {submissions.length === 0 ? (
            <div className="py-12 text-center text-[#5a6061]">
              No pending verifications.
            </div>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex flex-col gap-6 p-8 border border-[#e0e0e0] rounded-2xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-[#e0e0e0]">
                      <span className="flex items-center justify-center h-full text-[#5a6061] text-lg font-medium">
                        {(submission.user?.displayName || submission.user?.initiaUsername || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p
                        className="text-[#2d3435]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "18px",
                          fontWeight: "600",
                          lineHeight: "28px"
                        }}
                      >
                        {submission.task?.name || 'Unknown Task'}
                      </p>
                      <p
                        className="text-[#5a6061]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "14px",
                          lineHeight: "20px"
                        }}
                      >
                        {new Date(submission.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        submission.status === 'verified'
                          ? 'bg-[rgba(59,105,52,0.1)] text-[#3b6934]'
                          : submission.status === 'rejected'
                          ? 'bg-[rgba(214,48,49,0.1)] text-[#d63031]'
                          : 'bg-[rgba(45,52,54,0.1)] text-[#2d3435]'
                      }`}
                    >
                      {submission.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p
                  className="text-[#5a6061]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "16px",
                    lineHeight: "24px"
                  }}
                >
                  {submission.task?.description || 'No description available.'}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-[#5a6061]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "14px",
                        lineHeight: "20px"
                      }}
                    >
                      Category:
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
                      {submission.task?.category || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className="text-[#5a6061]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "14px",
                        lineHeight: "20px"
                      }}
                    >
                      Fraud Score:
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
                      {(submission.fraudScore * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProductShell>
  );
}
