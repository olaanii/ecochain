"use client";

import Image from "next/image";
import Link from "next/link";

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

export default function VerificationPage() {
  const submissions = [
    {
      id: "#QE-8492",
      title: "Urban Reforestation Initiative",
      time: "2 HOURS AGO",
      description: "User uploaded documentation confirming the planting of 50 native saplings in an urban public park. GPS coordinates and photo evidence provided.",
      impact: "50 Trees Planted",
      location: "East District Park",
      confidence: "92%",
      image: imgPlantedTrees,
      userImage: imgUserPortrait
    },
    {
      id: "#QE-8491",
      title: "Residential Solar Installation",
      time: "5 HOURS AGO",
      description: "Homeowner completed installation of 6kW solar panel system with grid integration. Permit documentation and completion certificate verified.",
      impact: "6 kW Solar",
      location: "West Residential Zone",
      confidence: "88%",
      image: imgSolarPanelInstallation,
      userImage: imgUserPortrait
    }
  ];

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
        <div className="flex flex-col gap-12">
          {submissions.map((submission, index) => (
            <div key={submission.id} className="surface-card p-8 shadow-lg">
              <div className="flex gap-8">
                {/* Image */}
                <div className="aspect-[4/3] surface-muted overflow-hidden rounded-sm relative flex-shrink-0">
                  <div className="h-[220px] w-full">
                    <Image
                      src={submission.image}
                      alt={submission.title}
                      fill
                      className="object-cover"
                      style={{ objectPosition: "center top" }}
                    />
                  </div>
                  <div className="absolute left-4 top-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                    <p
                      className="text-[#2d3435]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "12px",
                        fontWeight: "600",
                        letterSpacing: "0.36px",
                        textTransform: "uppercase"
                      }}
                    >
                      ID: {submission.id}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between min-h-[200px] flex-1">
                  <div className="flex flex-col gap-2 pb-8">
                    <div className="flex items-start justify-between">
                      <h2
                        className="text-[#2d3435]"
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "22px",
                          fontWeight: "500",
                          lineHeight: "30.8px"
                        }}
                      >
                        {submission.title}
                      </h2>
                      <p
                        className="text-[#5a6061]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "12px",
                          fontWeight: "600",
                          letterSpacing: "0.36px",
                          textTransform: "uppercase"
                        }}
                      >
                        {submission.time}
                      </p>
                    </div>
                    
                    <p
                      className="text-[#5a6061] max-w-[672px]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "16px",
                        lineHeight: "24px",
                        letterSpacing: "0.16px"
                      }}
                    >
                      {submission.description}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-4 gap-6 pt-4">
                      <div className="flex flex-col gap-1">
                        <p
                          className="text-[#5a6061]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "12px",
                            fontWeight: "600",
                            letterSpacing: "0.36px",
                            textTransform: "uppercase"
                          }}
                        >
                          IMPACT
                        </p>
                        <p
                          className="text-[#3b6934]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "16px",
                            fontWeight: "500",
                            letterSpacing: "0.16px"
                          }}
                        >
                          {submission.impact}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <p
                          className="text-[#5a6061]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "12px",
                            fontWeight: "600",
                            letterSpacing: "0.36px",
                            textTransform: "uppercase"
                          }}
                        >
                          LOCATION
                        </p>
                        <p
                          className="text-[#2d3435]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "16px",
                            fontWeight: "400",
                            letterSpacing: "0.16px"
                          }}
                        >
                          {submission.location}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <p
                          className="text-[#5a6061]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "12px",
                            fontWeight: "600",
                            letterSpacing: "0.36px",
                            textTransform: "uppercase"
                          }}
                        >
                          SUBMITTED BY
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="relative h-6 w-6">
                            <Image
                              src={submission.userImage}
                              alt="User"
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                          <p
                            className="text-[#2d3435]"
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "16px",
                              fontWeight: "400",
                              letterSpacing: "0.16px"
                            }}
                          >
                            Alex Chen
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <p
                          className="text-[#5a6061]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "12px",
                            fontWeight: "600",
                            letterSpacing: "0.36px",
                            textTransform: "uppercase"
                          }}
                        >
                          CONFIDENCE<br />SCORE
                        </p>
                        <p
                          className="text-[#2d3435]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "16px",
                            fontWeight: "400",
                            letterSpacing: "0.16px"
                          }}
                        >
                          {submission.confidence}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-[#e4e9ea] flex items-center gap-6 pt-6">
                    <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-sm">
                      <div className="relative h-2.5 w-3.5">
                        <Image
                          src={imgApproveIcon}
                          alt="Approve"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span
                        className="text-[#e6ffdb]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "16px",
                          fontWeight: "500",
                          letterSpacing: "0.16px"
                        }}
                      >
                        Approve
                      </span>
                    </button>
                    
                    <button className="flex items-center gap-2 px-6 py-3 rounded-sm border border-[#e4e9ea] bg-white">
                      <div className="relative h-3 w-3">
                        <Image
                          src={imgRejectIcon}
                          alt="Reject"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span
                        className="text-[#2d3435]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "16px",
                          fontWeight: "500",
                          letterSpacing: "0.16px"
                        }}
                      >
                        Reject
                      </span>
                    </button>
                    
                    <div className="flex-1 flex justify-end">
                      <button className="px-4 py-2">
                        <span
                          className="text-[#5a6061]"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "16px",
                            fontWeight: "400",
                            letterSpacing: "0.16px"
                          }}
                        >
                          Request Details
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center pt-4">
          <button className="surface-muted flex items-center gap-3 px-8 py-4 rounded-sm border border-[rgba(173,179,180,0.1)] shadow-sm">
            <span
              className="text-[#2d3435]"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                fontWeight: "500",
                letterSpacing: "0.16px"
              }}
            >
              Load Older Submissions
            </span>
            <div className="relative h-3.5 w-3.5">
              <Image
                src={imgLoadMoreIcon}
                alt="Load more"
                fill
                className="object-contain"
              />
            </div>
          </button>
        </div>
      </div>
    </ProductShell>
  );
}
