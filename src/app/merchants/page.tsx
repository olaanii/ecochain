"use client";

import Image from "next/image";
import Link from "next/link";

import { ProductShell } from "@/components/layout/product-shell";

/* ── Figma asset constants ──────────────────────── */
const imgUserProfile = "";
const imgBrandLogo = "";
const imgBrandLogo1 = "";
const imgBrandLogo2 = "";
const imgBrandLogo3 = "";
const imgNotificationIcon = "";
const imgBalanceIcon = "";
const imgArrowIcon = "";
const imgNavDashboard = "";
const imgNavActions = "";
const imgNavOffers = "";
const imgNavHistory = "";
const imgNavImpact = "";

export default function MerchantsPage() {
  const offers = [
    {
      brand: "AURA ESSENTIALS",
      title: "20% off zero-waste\nstarter kits",
      points: "250 PTS",
      logo: imgBrandLogo
    },
    {
      brand: "GREEN ROUTE",
      title: "Free month of bike\nshare membership",
      points: "300 PTS",
      logo: imgBrandLogo1
    },
    {
      brand: "ECO KITCHEN",
      title: "$30 credit for organic\nproduce delivery",
      points: "400 PTS",
      logo: imgBrandLogo2
    },
    {
      brand: "LUMINA",
      title: "$50 credit towards\nsolar panel installation",
      points: "500 PTS",
      logo: imgBrandLogo3
    }
  ];

  return (
    <ProductShell>
      <div className="flex flex-col gap-24 max-w-[1280px] mx-auto px-24 py-20">
        {/* Header Section */}
        <div className="flex flex-col gap-6 max-w-[672px]">
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
            Curated Rewards
          </h1>
          
          <p
            className="text-[#5a6061] max-w-[672px]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              lineHeight: "28px"
            }}
          >
            Redeem your accrued impact points for exclusive offers from our network of<br />
            zero-waste and sustainable partners. A quiet exchange for a better earth.
          </p>
          
          <div className="surface-card flex items-center gap-3 px-6 py-4 shadow-lg">
            <div className="relative h-4.5 w-4.5">
              <Image
                src={imgBalanceIcon}
                alt="Balance"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p
                className="text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: "400",
                  letterSpacing: "0.6px",
                  textTransform: "uppercase"
                }}
              >
                AVAILABLE BALANCE
              </p>
              <div className="flex items-end">
                <span
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "24px",
                    fontWeight: "500",
                    lineHeight: "32px"
                  }}
                >
                  1,250{" "}
                </span>
                <span
                  className="text-[#757c7d]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "16px",
                    lineHeight: "24px"
                  }}
                >
                  pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-3 gap-12">
          {offers.map((offer, index) => (
            <div key={index} className="surface-card flex flex-col justify-between p-8 rounded-sm shadow-lg relative">
              <div className="pb-12">
                <div className="flex items-start justify-between">
                  <div className="surface-muted flex items-center justify-center rounded-lg h-12 w-12">
                    <div className="h-full w-full mix-blend-multiply opacity-80">
                      <Image
                        src={offer.logo}
                        alt={offer.brand}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="surface-secondary px-3 py-1.5 rounded-sm">
                    <p
                      className="text-[#2d3435]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "10px",
                        fontWeight: "400",
                        letterSpacing: "1px",
                        textTransform: "uppercase"
                      }}
                    >
                      {offer.points}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <p
                  className="text-[#757c7d]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    fontWeight: "400",
                    letterSpacing: "1.2px",
                    textTransform: "uppercase"
                  }}
                >
                  {offer.brand}
                </p>
                
                <h3
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "22px",
                    fontWeight: "500",
                    lineHeight: "30.25px"
                  }}
                >
                  {offer.title.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < offer.title.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </h3>
                
                <button className="flex items-center gap-2 pt-4">
                  <span
                    className="text-[#3b6934]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      fontWeight: "400",
                      letterSpacing: "1.4px",
                      textTransform: "uppercase"
                    }}
                  >
                    REDEEM OFFER
                  </span>
                  <div className="relative h-3 w-3">
                    <Image
                      src={imgArrowIcon}
                      alt="Arrow"
                      fill
                      className="object-contain"
                    />
                  </div>
                </button>
              </div>
              
              <div className="absolute inset-0 border border-[#adb3b4] rounded-sm opacity-10" />
            </div>
          ))}
        </div>
      </div>
    </ProductShell>
  );
}
