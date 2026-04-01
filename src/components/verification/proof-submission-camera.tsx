"use client";

import {
  Sun,
  Crosshair,
  ScanBarcode,
  MapPin,
  Clock,
  Zap,
  FlipHorizontal,
  Upload,
} from "lucide-react";
import clsx from "clsx";

/**
 * Instruction card data for the camera proof submission page.
 */
const instructions = [
  {
    icon: <Sun className="h-[22px] w-[22px] text-[#f3ffca]" />,
    title: "Optimal Lighting",
    description:
      "Avoid harsh glare and shadows on the panel surface for AI validation.",
  },
  {
    icon: <Crosshair className="h-[18px] w-[18px] text-[#f3ffca]" />,
    title: "Center Framing",
    description:
      "The panel should occupy at least 60% of the camera viewfinder frame.",
  },
  {
    icon: <ScanBarcode className="h-5 w-5 text-[#f3ffca]" />,
    title: "Serial Visibility",
    description:
      "Scan must include the manufacturer\u0027s identifying hardware sticker.",
  },
];

const metadataRows = [
  { label: "Device Node", value: "X-TER-9942", highlight: false },
  { label: "Protocol", value: "Ecosystem Proof V3", highlight: false },
  { label: "Estimated Credit", value: "+14.5 ECO", highlight: true },
];

/**
 * Design 1 — Proof Submission Camera UI (Figma node 3:3663).
 *
 * Displays a camera viewfinder panel for solar panel
 * verification alongside instructions and submission metadata.
 */
export function ProofSubmissionCamera() {
  return (
    <div
      className="flex gap-12 px-12 pb-12 pt-[96px]"
      style={{ maxWidth: 1280 }}
    >
      {/* Left: Camera Viewfinder */}
      <div className="flex w-[528px] shrink-0 flex-col gap-6">
        <div
          className={clsx(
            "relative aspect-[4/3] overflow-hidden rounded-3xl",
            "border border-[rgba(73,72,71,0.1)] bg-black",
            "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]",
          )}
        >
          {/* Solar panel background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80')",
            }}
          />

          {/* Neon grid overlay */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(202,253,0,0.1) 2.5%, transparent 2.5%), linear-gradient(rgba(202,253,0,0.1) 2.5%, transparent 2.5%)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Scanner bracket */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={clsx(
                "relative h-64 w-64 rounded-2xl",
                "border-2 border-[rgba(202,253,0,0.5)]",
              )}
            >
              {/* Corner highlights */}
              {[
                "top-[-4px] left-[-4px] border-t-4 border-l-4",
                "top-[-4px] right-[-4px] border-t-4 border-r-4",
                "bottom-[-4px] left-[-4px] border-b-4 border-l-4",
                "bottom-[-4px] right-[-4px] border-b-4 border-r-4",
              ].map((pos) => (
                <div
                  key={pos}
                  className={clsx(
                    "absolute h-6 w-6 border-[#f3ffca]",
                    "shadow-[0_0_10px_rgba(202,253,0,0.5)]",
                    pos,
                  )}
                />
              ))}
            </div>
          </div>

          {/* Camera controls */}
          <div
            className={clsx(
              "absolute inset-x-0 bottom-0 flex flex-col gap-6",
              "bg-gradient-to-t from-[rgba(0,0,0,0.8)]",
              "to-transparent p-8",
            )}
          >
            <div className="flex items-center justify-center gap-12">
              <button
                className={clsx(
                  "flex h-12 w-12 items-center justify-center",
                  "rounded-full bg-[rgba(38,38,38,0.4)]",
                  "backdrop-blur-sm",
                )}
                aria-label="Flash"
              >
                <Zap className="h-5 w-3" />
              </button>
              {/* Shutter button */}
              <button
                className={clsx(
                  "flex h-20 w-20 items-center justify-center",
                  "rounded-full border-4 border-white p-2.5",
                )}
                aria-label="Capture"
              >
                <div
                  className={clsx(
                    "h-full w-full rounded-full",
                    "bg-[rgba(255,255,255,0.9)]",
                    "shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                  )}
                />
              </button>
              <button
                className={clsx(
                  "flex h-12 w-12 items-center justify-center",
                  "rounded-full bg-[rgba(38,38,38,0.4)]",
                  "backdrop-blur-sm",
                )}
                aria-label="Flip camera"
              >
                <FlipHorizontal className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="flex justify-center">
              <span
                className={clsx(
                  "rounded-full bg-[rgba(0,0,0,0.4)]",
                  "px-4 py-1.5 text-xs font-medium uppercase",
                  "tracking-[0.3px] text-[#f3ffca]",
                  "backdrop-blur-sm",
                )}
              >
                Auto-Detect: Solar Array V3
              </span>
            </div>
          </div>

          {/* Live scanner badge */}
          <div
            className={clsx(
              "absolute left-6 top-6 flex items-center gap-2",
              "rounded-full border border-[rgba(243,255,202,0.2)]",
              "bg-[rgba(32,31,31,0.6)] px-3.5 py-[7px]",
              "backdrop-blur-sm",
            )}
          >
            <div className="h-2 w-2 rounded-full bg-[#f3ffca]" />
            <span
              className="text-[10px] font-semibold uppercase
                         tracking-[1px] text-[#f3ffca]"
            >
              Live Scanner
            </span>
          </div>
        </div>

        {/* Location & Timestamp */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-[#adaaaa]">
            <MapPin className="h-3 w-[9px]" />
            34.0522° N, 118.2437° W
          </div>
          <div className="flex items-center gap-2 text-sm text-[#adaaaa]">
            <Clock className="h-3 w-3" />
            Timestamp: 14:02:33 UTC
          </div>
        </div>
      </div>

      {/* Right: Instructions & Metadata */}
      <div className="flex flex-1 flex-col gap-8 self-end">
        {/* Heading */}
        <div className="flex flex-col gap-4">
          <h2
            className="font-['Plus_Jakarta_Sans'] text-[30px]
                       font-extrabold leading-tight tracking-tight
                       text-white"
          >
            Asset Verification: Solar Panel Proof
          </h2>
          <p className="text-base leading-[26px] text-[#adaaaa]">
            Please capture a clear, high-resolution photo of the
            primary solar array. Ensure the serial number or QR tag
            is visible if applicable.
          </p>
        </div>

        {/* Instruction cards */}
        <div className="flex flex-col gap-4">
          {instructions.map((item) => (
            <div
              key={item.title}
              className={clsx(
                "flex gap-5 rounded-2xl border",
                "border-[rgba(73,72,71,0.1)] bg-[#131313]",
                "p-6",
              )}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center
                           justify-center rounded-xl
                           bg-[rgba(243,255,202,0.1)]"
              >
                {item.icon}
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">
                  {item.title}
                </h4>
                <p className="mt-1 text-sm leading-5 text-[#adaaaa]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Metadata card */}
        <div
          className={clsx(
            "flex flex-col gap-6 rounded-2xl border",
            "border-[rgba(73,72,71,0.2)] bg-[#262626] p-6",
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold uppercase
                         tracking-[1.2px] text-[#adaaaa]"
            >
              Submission Metadata
            </span>
            <span
              className="rounded bg-[rgba(243,255,202,0.1)]
                         px-2 py-1 font-mono text-xs
                         text-[#f3ffca]"
            >
              ENCRYPTED_SHA256
            </span>
          </div>

          <div className="flex flex-col gap-4 pb-2">
            {metadataRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-[#adaaaa]">
                  {row.label}
                </span>
                <span
                  className={clsx(
                    "font-mono text-sm",
                    row.highlight
                      ? "font-semibold text-[#f3ffca]"
                      : "text-white",
                  )}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <button
            className={clsx(
              "flex w-full items-center justify-center gap-2",
              "rounded-xl border border-[#f3ffca] px-6 py-4",
              "text-xs font-semibold uppercase tracking-[1.2px]",
              "text-[#f3ffca] transition-colors",
              "hover:bg-[rgba(243,255,202,0.08)]",
            )}
          >
            <Upload className="h-4 w-4" />
            Upload Existing File
          </button>
        </div>
      </div>
    </div>
  );
}
