"use client";

import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Eye,
} from "lucide-react";
import clsx from "clsx";

const assetMeta = [
  { icon: "⊕", label: "Asset Type", value: "1-Ton Offset" },
  { icon: "⊙", label: "Origin", value: "Brazil, AM" },
  { icon: "◇", label: "Standard", value: "Verra VCU" },
  { icon: "✧", label: "Vintage", value: "2023-2024" },
];

const impactStats = [
  { label: "Biodiversity Index", value: "9.4/10", pct: 94 },
  { label: "Water Retention", value: "88%", pct: 88 },
  { label: "Community Integration", value: "100%", pct: 100 },
];

const certFeatures = [
  "On-chain Ownership Proof",
  "GPS Coordinates Integrated",
  "Retire-on-demand functionality",
];

/**
 * Design 6 — Merchant Hub: Carbon Credit Detail (Figma 3:2720).
 *
 * Detailed view of the Amazonia Regen v.4 carbon credit project
 * with hero banner, asset metadata, transparency section,
 * certificate preview, and satellite feed.
 */
export function MerchantCarbonCredit() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* Hero banner */}
      <div className="relative h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80')",
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t
                     from-[#0e0e0e] via-[rgba(14,14,14,0.6)]
                     to-transparent"
        />

        {/* Hero content */}
        <div className="absolute inset-x-12 bottom-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="rounded bg-[#cafd00] px-2.5 py-1
                           text-[10px] font-bold uppercase
                           tracking-widest text-black"
              >
                Certified Asset
              </span>
              <span className="text-sm text-[#adaaaa]">
                Project ID: AMZ-4492-C
              </span>
            </div>
            <h1
              className="mt-3 font-['Plus_Jakarta_Sans'] text-5xl
                         font-extrabold tracking-tight"
            >
              Amazonia Regen v.4
            </h1>
            <p className="mt-2 max-w-lg text-base text-[#adaaaa]">
              High-integrity carbon sequestration in the heart of
              the Xingu Basin, protecting over 14,000 hectares of
              primary rainforest.
            </p>
          </div>

          {/* Price card */}
          <div
            className={clsx(
              "flex flex-col items-center gap-3 rounded-2xl",
              "border border-[rgba(73,72,71,0.2)] bg-[#262626]",
              "px-8 py-5",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-[#adaaaa]">
                Current Price
              </span>
              <span className="flex items-center gap-1 text-xs text-[#cafd00]">
                <TrendingUp className="h-3 w-3" />
                +2.4%
              </span>
            </div>
            <p className="text-4xl font-bold">
              25.00{" "}
              <span className="text-base font-semibold text-[#cafd00]">
                ECO
              </span>
            </p>
            <button
              className={clsx(
                "w-full rounded-xl bg-[#cafd00] px-8 py-3",
                "text-sm font-bold text-black",
                "transition-colors hover:bg-[#d6ff4a]",
              )}
            >
              Acquire Credits
            </button>
          </div>
        </div>
      </div>

      {/* Asset metadata row */}
      <div className="flex gap-4 px-12 pt-8">
        {assetMeta.map((item) => (
          <div
            key={item.label}
            className={clsx(
              "flex flex-1 flex-col gap-2 rounded-2xl border",
              "border-[rgba(73,72,71,0.1)] bg-[#131313] p-5",
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span
              className="text-[10px] font-bold uppercase
                         tracking-wide text-[#adaaaa]"
            >
              {item.label}
            </span>
            <span className="text-base font-bold">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-[1fr_360px] gap-8 px-12 pt-8 pb-16">
        {/* Left column */}
        <div className="flex flex-col gap-8">
          {/* Transparency section */}
          <div>
            <h2 className="text-2xl font-bold">
              Project Transparency
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#adaaaa]">
              Amazonia Regen v.4 is a flagship REDD+ project focused
              on the prevention of unplanned deforestation of the
              Para State. By providing alternative livelihoods to
              local communities and implementing robust satellite
              monitoring, this project ensures that carbon stays
              locked in the biomass.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#adaaaa]">
              Every ECO token purchase represents a unique,
              non-fungible claim to 1 metric ton of CO2 equivalent
              reduced. The underlying assets are audited quarterly
              by third-party ecological auditors using the
              ECO_SYSTEM decentralized verification protocol.
            </p>
          </div>

          {/* Certificate preview */}
          <div
            className={clsx(
              "flex gap-6 rounded-2xl border",
              "border-[rgba(73,72,71,0.1)] bg-[#131313] p-6",
            )}
          >
            {/* Certificate placeholder */}
            <div
              className={clsx(
                "flex h-44 w-36 shrink-0 items-center",
                "justify-center rounded-xl",
                "border border-[rgba(73,72,71,0.2)]",
                "bg-[#0a0a0a]",
              )}
            >
              <div className="text-center">
                <p
                  className="font-serif text-lg italic
                             text-[#adaaaa]"
                >
                  CERTIFICATE
                </p>
                <p className="mt-1 text-xs text-[#666]">
                  Name and Surname
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-lg font-bold">
                Immutable Certificate Preview
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#adaaaa]">
                Upon purchase, a cryptographically signed certificate
                is minted to your wallet. This includes dynamic
                metadata for real-time impact tracking and project
                imagery.
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {certFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#cafd00]" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="mt-4 flex items-center gap-1 text-sm
                           font-semibold text-[#cafd00]
                           hover:underline"
              >
                View Sample Metadata
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Impact statistics */}
          <div
            className={clsx(
              "rounded-2xl border border-[rgba(73,72,71,0.1)]",
              "bg-[#131313] p-6",
            )}
          >
            <h3
              className="text-xs font-bold uppercase
                         tracking-[1px] text-[#adaaaa]"
            >
              Impact Statistics
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              {impactStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#adaaaa]">
                      {stat.label}
                    </span>
                    <span
                      className="font-semibold text-[#cafd00]"
                    >
                      {stat.value}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-1.5 w-full overflow-hidden
                               rounded-full bg-[rgba(73,72,71,0.3)]"
                  >
                    <div
                      className="h-full rounded-full bg-[#cafd00]
                                 transition-all duration-700"
                      style={{ width: `${stat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Satellite feed */}
          <div
            className={clsx(
              "overflow-hidden rounded-2xl border",
              "border-[rgba(73,72,71,0.1)]",
            )}
          >
            <div className="relative h-40">
              <img
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=60"
                alt="Satellite view of rainforest"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="bg-[#131313] p-5">
              <h4 className="font-semibold">
                Live Satellite Feed
              </h4>
              <p className="mt-1 text-xs text-[#adaaaa]">
                Monitoring coverage 24/7 via the Sentinel-2
                Constellation.
              </p>
              <button
                className={clsx(
                  "mt-3 flex w-full items-center justify-center",
                  "gap-2 rounded-xl border",
                  "border-[rgba(73,72,71,0.2)] py-3",
                  "text-sm text-white transition-colors",
                  "hover:bg-[rgba(255,255,255,0.04)]",
                )}
              >
                <ExternalLink className="h-4 w-4" />
                Access Monitoring Hub
              </button>
            </div>
          </div>

          {/* Escrow badge */}
          <div
            className={clsx(
              "flex items-center gap-3 rounded-2xl border",
              "border-[rgba(73,72,71,0.1)] bg-[#131313] px-5 py-4",
            )}
          >
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#cafd00]" />
            <div>
              <span className="text-sm font-semibold">
                Escrow Protected
              </span>
              <p className="text-xs text-[#adaaaa]">
                Funds released upon verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
