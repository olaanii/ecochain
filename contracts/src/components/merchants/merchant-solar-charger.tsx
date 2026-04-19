"use client";

import {
  ArrowLeft,
  ShieldCheck,
  Globe,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const specs = [
  { label: "Battery Capacity", value: "20,000 mAh Internal Buffer" },
  { label: "Ports", value: "2x USB-C (PD), 1x MagSafe" },
  { label: "Material", value: "Graphene-Infused Polymer" },
  { label: "Operating Temp", value: "-20°C to 65°C" },
];

const quickStats = [
  { label: "Power Output", value: "45W Peak" },
  { label: "Durability", value: "IP68 Cert" },
  { label: "Efficiency", value: "24.2%" },
  { label: "Weight", value: "420g" },
];

const thumbnails = [
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&q=60",
  "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=200&q=60",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&q=60",
];

/**
 * Design 5 — Merchant Hub: Solar Charger Detail (Figma 3:2893).
 *
 * Product detail page for the Solaris-X Rugged Charger with
 * hero image, specs grid, pricing card, and eco-impact section.
 */
export function MerchantSolarCharger() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* Breadcrumb */}
      <div className="px-12 pt-6">
        <div className="flex items-center gap-3 text-sm text-[#adaaaa]">
          <Link
            href="/merchants"
            className="flex items-center gap-1 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Merchant Hub
          </Link>
          <span className="text-[#555]">/</span>
          <span className="font-semibold text-white">
            Solaris-X Rugged Series
          </span>
        </div>
      </div>

      {/* Product section */}
      <div className="grid grid-cols-2 gap-12 px-12 pt-6 pb-12">
        {/* Left: Product image */}
        <div>
          <div
            className={clsx(
              "relative overflow-hidden rounded-3xl",
              "border border-[rgba(73,72,71,0.1)]",
              "bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]",
              "aspect-[4/5]",
            )}
          >
            {/* Stock badge */}
            <div
              className={clsx(
                "absolute left-5 top-5 z-10 flex items-center",
                "gap-1.5 rounded-full border",
                "border-[rgba(243,255,202,0.2)]",
                "bg-[rgba(32,31,31,0.6)] px-3 py-1.5",
                "backdrop-blur-sm",
              )}
            >
              <span className="h-2 w-2 rounded-full bg-[#cafd00]" />
              <span
                className="text-[10px] font-semibold uppercase
                           tracking-[1px] text-[#f3ffca]"
              >
                In Stock
              </span>
            </div>

            {/* Product image */}
            <img
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80"
              alt="Solaris-X Rugged Charger"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          <div className="mt-4 flex gap-3">
            {thumbnails.map((src, i) => (
              <div
                key={i}
                className={clsx(
                  "h-24 w-28 overflow-hidden rounded-xl",
                  "border border-[rgba(73,72,71,0.15)]",
                  i === 0 && "ring-2 ring-[#cafd00]",
                )}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product details */}
        <div className="flex flex-col gap-6">
          <div>
            <span
              className="text-xs font-bold uppercase
                         tracking-[1.5px] text-[#adaaaa]"
            >
              Advanced Off-Grid Hardware
            </span>
            <h1
              className="mt-2 font-['Plus_Jakarta_Sans']
                         text-4xl font-extrabold tracking-tight"
            >
              Solaris–X
            </h1>
            <h1
              className="font-['Plus_Jakarta_Sans'] text-4xl
                         font-extrabold italic tracking-tight
                         text-[#cafd00]"
            >
              Rugged Charger
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#adaaaa]">
              Engineered for the Neon Void. A military-grade energy
              harvester capable of rapid deployment in extreme
              environments.
            </p>
          </div>

          {/* Quick stats grid */}
          <div
            className={clsx(
              "grid grid-cols-2 gap-px overflow-hidden",
              "rounded-2xl border border-[rgba(73,72,71,0.15)]",
              "bg-[rgba(73,72,71,0.15)]",
            )}
          >
            {quickStats.map((stat) => (
              <div key={stat.label} className="bg-[#131313] p-5">
                <span
                  className="text-[10px] font-bold uppercase
                             tracking-[1px] text-[#adaaaa]"
                >
                  {stat.label}
                </span>
                <p className="mt-1 text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Pricing card */}
          <div
            className={clsx(
              "rounded-2xl border border-[rgba(73,72,71,0.2)]",
              "bg-[#262626] p-6",
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#adaaaa]">Price</span>
                <p className="text-4xl font-bold">
                  450{" "}
                  <span
                    className="text-base font-semibold
                               text-[#adaaaa]"
                  >
                    ECO
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#adaaaa]">
                  Your Balance
                </span>
                <p className="font-semibold text-[#f3ffca]">
                  1,240 ECO
                </p>
              </div>
            </div>

            <button
              className={clsx(
                "mt-4 flex w-full items-center justify-center",
                "gap-2 rounded-xl bg-[#cafd00] px-6 py-4",
                "text-sm font-bold uppercase tracking-widest",
                "text-black transition-colors hover:bg-[#d6ff4a]",
              )}
            >
              Redeem Now
              <ShoppingCart className="h-4 w-4" />
            </button>

            <div
              className="mt-3 flex items-center justify-center
                         gap-4 text-xs text-[#adaaaa]"
            >
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Certified
                Merchant
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" /> Free Global Node Ship
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specs + Eco Impact */}
      <div className="grid grid-cols-2 gap-12 px-12 pb-16">
        {/* Specs table */}
        <div>
          <h2
            className="text-2xl font-bold tracking-tight
                       text-white"
          >
            Technical Specs
          </h2>
          <div className="mt-6 flex flex-col">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className={clsx(
                  "flex items-center justify-between",
                  "border-b border-[rgba(73,72,71,0.15)]",
                  "py-5",
                )}
              >
                <span className="text-sm text-[#adaaaa]">
                  {spec.label}
                </span>
                <span className="font-mono text-sm text-white">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ECO Impact */}
        <div
          className={clsx(
            "rounded-2xl border border-[rgba(73,72,71,0.15)]",
            "bg-[#131313] p-8",
          )}
        >
          <h3
            className="flex items-center gap-2 text-lg
                       font-bold text-white"
          >
            ⊘ The ECO Impact
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#adaaaa]">
            Every Solaris-X unit is manufactured using recycled
            orbital debris. By redeeming your ECO tokens, you are
            directly funding the reclamation of Earth&apos;s
            atmosphere while securing high-performance hardware for
            your next mission.
          </p>
          <div className="mt-4 flex gap-2">
            <span
              className="rounded bg-[rgba(243,255,202,0.1)]
                         px-3 py-1.5 font-mono text-xs
                         text-[#f3ffca]"
            >
              12KG CO2 OFFSET
            </span>
            <span
              className="rounded bg-[rgba(243,255,202,0.1)]
                         px-3 py-1.5 font-mono text-xs
                         text-[#f3ffca]"
            >
              ZERO PLASTIC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
