"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductShell } from "@/components/layout/product-shell";

/* ── Figma asset constants ──────────────────────── */
const imgHeroImage = "";
const imgBackArrow = "";
const imgStepIcon1 = "";
const imgRewardIcon = "";
const imgArrowIcon = "";

export default function ActionDetailPage() {
  return (
    <ProductShell>
      <div className="flex flex-col gap-16 max-w-[768px] mx-auto">
        {/* Header - Back Link */}
        <div className="flex items-center gap-3">
          <div className="relative h-3.5 w-3.5">
            <Image
              src={imgBackArrow}
              alt="Back arrow"
              fill
              className="object-contain"
            />
          </div>
          <Link
            href="/discover"
            className="text-[#5a6061]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "1.4px",
              textTransform: "uppercase"
            }}
          >
            BACK TO EXPLORE
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-16 pb-32">
          {/* Header - Title & Hero Section */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <p
                className="text-[#3b6934]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase"
                }}
              >
                LOCAL INITIATIVE
              </p>
            </div>
            
            <div className="flex flex-col">
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
                Restore the Urban Canopy in<br />the East District
              </h1>
            </div>

            <div className="surface-muted overflow-hidden rounded-lg pt-4">
              <div className="h-[329px] relative">
                <Image
                  src={imgHeroImage}
                  alt="Hands planting sapling"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center top" }}
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="flex justify-end">
            <div className="max-w-[672px] pr-6">
              <p
                className="text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "24px",
                  lineHeight: "32px",
                  letterSpacing: "0.24px"
                }}
              >
                Our cities are losing their natural cooling systems at an<br />
                unprecedented rate. By joining this weekend's planting<br />
                initiative, you'll directly contribute to lowering<br />
                neighborhood temperatures, restoring local biodiversity,<br />
                and creating shaded corridors for the community.
              </p>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="flex gap-24 pt-24">
            <div className="flex flex-col">
              <div className="pb-4">
                <p
                  className="text-[#3b6934]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "64px",
                    fontWeight: "500",
                    lineHeight: "64px",
                    letterSpacing: "-3.2px"
                  }}
                >
                  -2.5°C
                </p>
              </div>
              <p
                className="text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase"
                }}
              >
                EST. LOCAL COOLING EFFECT
              </p>
            </div>

            <div className="flex flex-col">
              <div className="pb-4">
                <p
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "64px",
                    fontWeight: "500",
                    lineHeight: "64px",
                    letterSpacing: "-3.2px"
                  }}
                >
                  120+
                </p>
              </div>
              <p
                className="text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase"
                }}
              >
                NATIVE TREES TO PLANT
              </p>
            </div>
          </div>

          {/* Action Steps */}
          <div className="flex flex-col gap-16 pb-8 pt-24">
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
              How to participate
            </h2>

            <div className="flex flex-col gap-16">
              {/* Step 1 */}
              <div className="flex gap-8">
                <div className="relative h-[18px] w-[32px]">
                  <Image
                    src={imgStepIcon1}
                    alt="Step 1"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <h3
                    className="text-[#2d3435]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "18px",
                      lineHeight: "28px"
                    }}
                  >
                    Register your commitment
                  </h3>
                  <p
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      lineHeight: "26px"
                    }}
                  >
                    Confirm your attendance below so our organizers can prepare adequate tools, gloves, and<br />
                    saplings for your designated zone.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-8">
                <div className="flex flex-col items-start w-[32px]">
                  <p
                    className="text-[#adb3b4]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "24px",
                      fontWeight: "400",
                      lineHeight: "32px"
                    }}
                  >
                    02
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <h3
                    className="text-[#2d3435]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "18px",
                      lineHeight: "28px"
                    }}
                  >
                    Prepare for the terrain
                  </h3>
                  <p
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      lineHeight: "26px"
                    }}
                  >
                    Wear sturdy, closed-toe footwear and weather-appropriate clothing. Bring a reusable water<br />
                    bottle to minimize single-use plastics on site.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-8">
                <div className="flex flex-col items-start w-[32px]">
                  <p
                    className="text-[#adb3b4]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "24px",
                      fontWeight: "400",
                      lineHeight: "32px"
                    }}
                  >
                    03
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <h3
                    className="text-[#2d3435]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "18px",
                      lineHeight: "28px"
                    }}
                  >
                    Learn from the experts
                  </h3>
                  <p
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      lineHeight: "26px"
                    }}
                  >
                    Upon arrival, local arborists will demonstrate the correct planting techniques to ensure the<br />
                    long-term survival and deep root growth of each sapling.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Section */}
          <div className="surface-muted p-12 rounded-lg">
            <div className="flex gap-6">
              <div className="bg-[rgba(59,105,52,0.1)] flex items-center justify-center rounded-lg h-12 w-12 shrink-0">
                <div className="relative h-[17px] w-[17px]">
                  <Image
                    src={imgRewardIcon}
                    alt="Reward"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h3
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "24px",
                    fontWeight: "500",
                    lineHeight: "32px"
                  }}
                >
                  Earn 500 Impact Points
                </h3>
                <p
                  className="text-[#5a6061]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "16px",
                    lineHeight: "26px"
                  }}
                >
                  Completion of this community action grants you points that are automatically<br />
                  credited to your profile, redeemable at our partner zero-waste stores and local<br />
                  transit networks.
                </p>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col items-start pt-16">
            <Link
              href="/submit"
              className="btn-primary flex items-center gap-4 px-10 py-5 rounded-lg"
            >
              <span
                className="text-[#e6ffdb]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "18px",
                  fontWeight: "500",
                  lineHeight: "28px"
                }}
              >
                Commit to Action
              </span>
              <div className="relative h-3.5 w-3.5">
                <Image
                  src={imgArrowIcon}
                  alt="Arrow"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p
              className="text-[#5a6061] pt-6"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                fontWeight: "400",
                letterSpacing: "1.2px",
                textTransform: "uppercase"
              }}
            >
              SPOTS ARE LIMITED FOR THIS EVENT
            </p>
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
