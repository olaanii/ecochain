"use client";

import Image from "next/image";

import { ProductShell } from "@/components/layout/product-shell";

/* ── Figma asset constants ──────────────────────── */
const imgForestCanopy = "";
const imgSolarPanels = "";
const imgVegetables = "";
const imgFilterIcon = "";
const imgImpactIcon1 = "";
const imgImpactIcon2 = "";
const imgImpactIcon3 = "";
const imgImpactIcon4 = "";

export default function DiscoverPage() {
  const actions = [
    {
      id: 1,
      category: "FORESTRY",
      title: "Reforestation Project",
      description: "Join the initiative to plant indigenous trees in degraded areas, restoring natural habitats and sequestering carbon.",
      impact: "High Impact",
      points: "+500 Points",
      image: imgForestCanopy,
      impactIcon: imgImpactIcon1,
      isLarge: true
    },
    {
      id: 2,
      category: "ENERGY",
      title: "Renewable Energy Audit",
      description: "Conduct a comprehensive energy audit of your home or workplace and implement renewable solutions.",
      impact: "Medium Impact",
      points: "+250 Points",
      image: imgSolarPanels,
      impactIcon: imgImpactIcon2,
      isLarge: false
    },
    {
      id: 3,
      category: "WASTE",
      title: "Composting Workshop",
      description: "Learn and implement sustainable waste management through community composting initiatives.",
      impact: "Medium Impact",
      points: "+200 Points",
      image: imgSolarPanels,
      impactIcon: imgImpactIcon3,
      isLarge: false
    },
    {
      id: 4,
      category: "COMMUNITY",
      title: "Support Local Agriculture",
      description: "Commit to purchasing seasonal produce from local farmers markets for one month to reduce transportation emissions and support the local economy.",
      impact: "Ongoing",
      points: "+300 Points",
      image: imgVegetables,
      impactIcon: imgImpactIcon4,
      isLarge: false
    }
  ];

  return (
    <ProductShell>
      <div className="flex flex-col gap-24">
        {/* Header Section */}
        <div className="flex items-end justify-between">
          <div className="max-w-[672px]">
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
              Discover Actions
            </h1>
            <p
              className="text-[#5a6061] mt-6"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "18px",
                lineHeight: "29.25px"
              }}
            >
              Engage in curated initiatives designed to restore balance to our ecosystems.<br />
              Every action contributes to a larger, sustainable narrative.
            </p>
          </div>
          <button className="surface-secondary flex items-center gap-2 px-6 py-3 rounded-sm">
            <div className="relative h-3.5 w-3.5">
              <Image
                src={imgFilterIcon}
                alt="Filter"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="text-[#2d3435]"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "14px",
                fontWeight: "600",
                letterSpacing: "0.42px",
                textTransform: "uppercase"
              }}
            >
              REFINE
            </span>
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-12 grid-cols-12 grid-rows-[542px_350px]">
          {/* Large Card - Reforestation Project */}
          <div className="surface-card col-span-8 row-span-1 isolate overflow-hidden relative rounded-sm">
            <div className="relative h-80 overflow-hidden z-20">
              <div className="absolute inset-0">
                <Image
                  src={imgForestCanopy}
                  alt="Forest canopy"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center top" }}
                />
              </div>
              <div className="absolute left-6 top-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-sm">
                <p
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.36px",
                    textTransform: "uppercase"
                  }}
                >
                  FORESTRY
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 relative z-10 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <h2
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "28px",
                    fontWeight: "400",
                    lineHeight: "42px",
                    letterSpacing: "-0.28px"
                  }}
                >
                  Reforestation Project
                </h2>
                <p
                  className="text-[#5a6061] overflow-hidden"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "16px",
                    lineHeight: "24px"
                  }}
                >
                  Join the initiative to plant indigenous trees in degraded areas, restoring natural habitats and sequestering carbon.
                </p>
              </div>
              
              <div className="pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative h-4 w-4">
                      <Image
                        src={imgImpactIcon1}
                        alt="Impact"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span
                      className="text-[#3b6934]"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      High Impact
                    </span>
                  </div>
                  <span
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "14px",
                      fontWeight: "400"
                    }}
                  >
                    +500 Points
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Small Card 1 - Renewable Energy Audit */}
          <div className="surface-card col-span-4 row-span-1 isolate overflow-hidden relative rounded-sm">
            <div className="relative h-64 overflow-hidden z-20">
              <div className="absolute inset-0">
                <Image
                  src={imgSolarPanels}
                  alt="Solar panels"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute left-6 top-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-sm">
                <p
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.36px",
                    textTransform: "uppercase"
                  }}
                >
                  ENERGY
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 relative z-10 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <h2
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "28px",
                    fontWeight: "400",
                    lineHeight: "42px",
                    letterSpacing: "-0.28px"
                  }}
                >
                  Renewable Energy Audit
                </h2>
                <p
                  className="text-[#5a6061]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "16px",
                    lineHeight: "24px"
                  }}
                >
                  Conduct a comprehensive energy audit of your home or workplace and implement renewable solutions.
                </p>
              </div>
              
              <div className="pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative h-4 w-4">
                      <Image
                        src={imgImpactIcon2}
                        alt="Impact"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span
                      className="text-[#3b6934]"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      Medium Impact
                    </span>
                  </div>
                  <span
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "14px",
                      fontWeight: "400"
                    }}
                  >
                    +250 Points
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Small Card 2 - Composting Workshop */}
          <div className="surface-card col-span-4 row-span-2 isolate overflow-hidden relative rounded-sm">
            <div className="relative h-64 overflow-hidden z-20">
              <div className="absolute inset-0">
                <Image
                  src={imgSolarPanels}
                  alt="Composting"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute left-6 top-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-sm">
                <p
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.36px",
                    textTransform: "uppercase"
                  }}
                >
                  WASTE
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 relative z-10 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <h2
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "28px",
                    fontWeight: "400",
                    lineHeight: "42px",
                    letterSpacing: "-0.28px"
                  }}
                >
                  Composting Workshop
                </h2>
                <p
                  className="text-[#5a6061]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "16px",
                    lineHeight: "24px"
                  }}
                >
                  Learn and implement sustainable waste management through community composting initiatives.
                </p>
              </div>
              
              <div className="pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative h-4 w-4">
                      <Image
                        src={imgImpactIcon3}
                        alt="Impact"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span
                      className="text-[#3b6934]"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      Medium Impact
                    </span>
                  </div>
                  <span
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "14px",
                      fontWeight: "400"
                    }}
                  >
                    +200 Points
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Medium Card - Support Local Agriculture */}
          <div className="surface-card col-span-8 row-span-2 isolate overflow-hidden relative rounded-sm">
            <div className="relative h-64 overflow-hidden z-20">
              <div className="absolute inset-0">
                <Image
                  src={imgVegetables}
                  alt="Local vegetables"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "left center" }}
                />
              </div>
            </div>
            
            <div className="bg-white p-8 relative z-10 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="surface-muted inline-flex px-3 py-1 rounded-sm">
                  <p
                    className="text-[#2d3435]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "12px",
                      fontWeight: "600",
                      letterSpacing: "0.36px",
                      textTransform: "uppercase"
                    }}
                  >
                    COMMUNITY
                  </p>
                </div>
                
                <h2
                  className="text-[#2d3435] pt-1"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "28px",
                    fontWeight: "400",
                    lineHeight: "42px",
                    letterSpacing: "-0.28px"
                  }}
                >
                  Support Local Agriculture
                </h2>
                <p
                  className="text-[#5a6061]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "16px",
                    lineHeight: "24px"
                  }}
                >
                  Commit to purchasing seasonal produce from local farmers markets for one month to reduce transportation emissions and support the local economy.
                </p>
              </div>
              
              <div className="pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative h-5 w-4.5">
                      <Image
                        src={imgImpactIcon4}
                        alt="Impact"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span
                      className="text-[#3b6934]"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      Ongoing
                    </span>
                  </div>
                  <span
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "14px",
                      fontWeight: "400"
                    }}
                  >
                    +300 Points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
