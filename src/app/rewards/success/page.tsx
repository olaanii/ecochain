"use client";

import Image from "next/image";
import Link from "next/link";

import { ProductShell } from "@/components/layout/product-shell";

/* ── Figma asset constants ──────────────────────── */
const imgZeroWasteKitItems = "";
const imgSuccessIcon = "";
const imgArrowIcon = "";

export default function RedemptionSuccessPage() {
  return (
    <ProductShell>
      <div className="flex flex-col items-center justify-center py-20 px-12">
        <div className="flex flex-col items-center max-w-[672px] w-full">
          {/* Success Icon and Header */}
          <div className="flex flex-col items-center pb-16">
            <div className="h-24 w-20 pb-4">
              <div className="bg-[rgba(59,105,52,0.1)] flex items-center justify-center rounded-lg h-20 w-20">
                <div className="relative h-7.5 w-7.5">
                  <Image
                    src={imgSuccessIcon}
                    alt="Success"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <h1
                className="text-[#2d3435]"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "56px",
                  fontWeight: "600",
                  lineHeight: "61.6px",
                  letterSpacing: "-1.12px"
                }}
              >
                Redeemed.
              </h1>
            </div>
            
            <div className="pt-6 px-4">
              <p
                className="text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  lineHeight: "26px"
                }}
              >
                Your quiet contribution to a better world. The details of<br />
                your exchange are below.
              </p>
            </div>
          </div>

          {/* Redemption Details Card */}
          <div className="surface-card p-12 rounded-sm w-full">
            <div className="flex flex-col items-center">
              <p
                className="text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: "600",
                  letterSpacing: "0.42px",
                  textTransform: "uppercase"
                }}
              >
                TOTAL IMPACT
              </p>
              
              <div className="pt-2">
                <div className="relative h-[60px] w-[136px]">
                  <div className="absolute left-0 top-0">
                    <p
                      className="text-[#2d3435]"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "40px",
                        fontWeight: "500",
                        lineHeight: "60px",
                        letterSpacing: "-1px"
                      }}
                    >
                      - 500
                    </p>
                  </div>
                  <div className="absolute left-[93px] top-6 pl-2">
                    <p
                      className="text-[#757c7d]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "18px",
                        lineHeight: "28px"
                      }}
                    >
                      INIT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12">
              <div className="surface-muted flex items-center justify-between p-8 rounded-sm">
                <div className="flex items-center">
                  <div className="surface-secondary overflow-hidden rounded-sm h-16 w-16">
                    <div className="h-full w-full">
                      <Image
                        src={imgZeroWasteKitItems}
                        alt="Zero waste kit"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="pl-6">
                    <div>
                      <h3
                        className="text-[#2d3435]"
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "18px",
                          fontWeight: "500",
                          lineHeight: "28px"
                        }}
                      >
                        Zero-Waste Starter Kit
                      </h3>
                    </div>
                    <div className="pt-1">
                      <p
                        className="text-[#5a6061]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "14px",
                          lineHeight: "20px"
                        }}
                      >
                        Digital Voucher #8472-A
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <p
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      lineHeight: "20px"
                    }}
                  >
                    Date
                  </p>
                  <div className="pt-1">
                    <p
                      className="text-[#2d3435]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "16px",
                        lineHeight: "24px"
                      }}
                    >
                      Oct 24, 2023
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12">
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="btn-primary flex items-center justify-center py-4 rounded-sm w-full"
                >
                  <span
                    className="text-[#e6ffdb]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      lineHeight: "24px"
                    }}
                  >
                    Return to Dashboard
                  </span>
                  <div className="pl-2">
                    <div className="relative h-2.5 w-2.5">
                      <Image
                        src={imgArrowIcon}
                        alt="Arrow"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="pt-4">
                <Link
                  href="/rewards"
                  className="flex items-center justify-center py-4 rounded-sm w-full border border-[#e4e9ea]"
                >
                  <span
                    className="text-[#2d3435]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      lineHeight: "20px"
                    }}
                  >
                    View Transaction History
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
