"use client";

import { MapPin, Plus } from "lucide-react";
import clsx from "clsx";

/**
 * Terminal log entries for the live feed panel.
 */
const logEntries = [
  {
    time: "14:22:01",
    level: "INFO",
    msg: "INITIALIZING SENSOR_SUITE_A",
    warn: false,
  },
  {
    time: "14:22:02",
    level: "INFO",
    msg: "ESTABLISHING CONNECTION TO NODE.DELTA",
    warn: false,
  },
  {
    time: "14:22:04",
    level: "LOG",
    msg: "WATTAGE_FLOW: 12.44kW | STABLE",
    warn: false,
  },
  {
    time: "14:22:05",
    level: "LOG",
    msg: "THERMAL_STATE: 31.2C | NOMINAL",
    warn: false,
  },
  {
    time: "14:22:08",
    level: "LOG",
    msg: "GEO_COORD: 40.7128° N, 74.0060° W",
    warn: false,
  },
  {
    time: "14:22:12",
    level: "WARN",
    msg: "VOLTAGE_FLUCTUATION DETECTED (0.02%)",
    warn: true,
  },
  {
    time: "14:22:15",
    level: "LOG",
    msg: "WATTAGE_FLOW: 12.82kW | STABLE",
    warn: false,
  },
  {
    time: "14:22:18",
    level: "LOG",
    msg: "THERMAL_STATE: 31.9C | NOMINAL",
    warn: false,
  },
  {
    time: "14:22:20",
    level: "INFO",
    msg: "PACKET_VERIFIED:",
    warn: false,
  },
];

const stats = [
  { label: "Network Latency", value: "14", unit: "ms" },
  { label: "Buffer Load", value: "62", unit: "%" },
  { label: "Data Integrity", value: "99.9", unit: "%" },
];

/**
 * Design 2 — Verification Engine (Figma node 3:3455).
 *
 * Renders real-time IoT sensor telemetry with an energy
 * output chart, terminal-style log feed, deployment zone
 * map, and three metric stat cards.
 */
export function VerificationEngine() {
  return (
    <div className="flex flex-col gap-6 px-12 pb-12 pt-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="font-['Plus_Jakarta_Sans'] text-[32px]
                       font-extrabold tracking-tight text-white"
          >
            Verification Engine
          </h1>
          <p className="mt-1 text-base text-[#adaaaa]">
            Real-time IoT sensor telemetry from Node_774-Delta.
          </p>
        </div>
        <span
          className={clsx(
            "inline-flex items-center gap-2 rounded-full",
            "border border-[rgba(243,255,202,0.2)]",
            "bg-[rgba(32,31,31,0.6)] px-4 py-2",
            "font-mono text-xs text-[#f3ffca]",
          )}
        >
          <span className="h-2 w-2 rounded-full bg-[#f3ffca]" />
          LIVE FEED
        </span>
      </div>

      {/* Top row: Chart + Terminal */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Energy Output Chart */}
        <div
          className={clsx(
            "rounded-2xl border border-[rgba(73,72,71,0.1)]",
            "bg-[#131313] p-6",
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3
                className="text-sm font-bold uppercase
                           tracking-[1px] text-white"
              >
                Energy Output Analytics
              </h3>
              <p className="text-sm text-[#adaaaa]">
                Aggregated wattage per nanosecond cluster
              </p>
            </div>
            <div className="flex gap-1">
              {["1H", "24H", "7D"].map((p) => (
                <button
                  key={p}
                  className={clsx(
                    "rounded-lg px-3 py-1.5 text-xs font-medium",
                    p === "24H"
                      ? "bg-[#cafd00] text-black"
                      : "text-[#adaaaa] hover:text-white",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-12">
            <div>
              <span
                className="text-xs font-bold uppercase
                           tracking-[1px] text-[#adaaaa]"
              >
                Peak Output
              </span>
              <p className="text-3xl font-bold text-white">
                84.2{" "}
                <span className="text-sm font-normal text-[#adaaaa]">
                  kW
                </span>
              </p>
            </div>
            <div>
              <span
                className="text-xs font-bold uppercase
                           tracking-[1px] text-[#adaaaa]"
              >
                Avg Temp
              </span>
              <p className="text-3xl font-bold text-white">
                32.4
                <span className="text-sm font-normal text-[#adaaaa]">
                  °C
                </span>
              </p>
            </div>
          </div>

          {/* SVG chart placeholder */}
          <div className="mt-8 h-40">
            <svg
              viewBox="0 0 600 160"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="chartGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgba(202,253,0,0.3)"
                  />
                  <stop
                    offset="100%"
                    stopColor="rgba(202,253,0,0)"
                  />
                </linearGradient>
              </defs>
              <path
                d="M0,140 C40,140 60,130 100,120 C140,110 160,130 200,100 C240,70 260,90 300,50 C340,10 360,40 400,30 C440,20 460,50 500,40 C540,30 560,60 600,50 L600,160 L0,160 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M0,140 C40,140 60,130 100,120 C140,110 160,130 200,100 C240,70 260,90 300,50 C340,10 360,40 400,30 C440,20 460,50 500,40 C540,30 560,60 600,50"
                fill="none"
                stroke="#cafd00"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Terminal Log Feed */}
        <div
          className={clsx(
            "flex flex-col rounded-2xl border",
            "border-[rgba(73,72,71,0.1)] bg-[#0c0c0c]",
            "overflow-hidden",
          )}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center justify-between
                       border-b border-[rgba(73,72,71,0.15)]
                       px-4 py-3"
          >
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="font-mono text-xs text-[#adaaaa]">
              root@eco-system:~# logs --follow
            </span>
          </div>

          {/* Log entries */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
            {logEntries.map((entry, i) => (
              <div
                key={i}
                className={clsx(
                  "py-1",
                  entry.warn ? "text-[#cafd00]" : "text-[#adaaaa]",
                )}
              >
                <span className="text-[#666]">[{entry.time}]</span>{" "}
                <span
                  className={clsx(
                    "font-bold",
                    entry.level === "WARN"
                      ? "text-[#cafd00]"
                      : entry.level === "INFO"
                        ? "text-white"
                        : "text-[#adaaaa]",
                  )}
                >
                  {entry.level}
                </span>{" "}
                {entry.msg}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Deployment zone + Stats */}
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-6">
        {/* Deployment Zone */}
        <div
          className={clsx(
            "relative overflow-hidden rounded-2xl border",
            "border-[rgba(73,72,71,0.1)] bg-[#131313] p-6",
          )}
        >
          {/* Map background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=60')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative">
            <span
              className="text-xs font-bold uppercase
                         tracking-[1px] text-[#adaaaa]"
            >
              Deployment Zone
            </span>
            <h3 className="mt-2 text-xl font-bold text-white">
              New York City, Hub-A
            </h3>
            <div
              className="mt-16 flex items-center gap-1
                         text-sm text-[#adaaaa]"
            >
              <MapPin className="h-3 w-3" />
              40.7128° N, 74.0060° W
            </div>
          </div>
        </div>

        {/* Stat cards */}
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={clsx(
              "flex flex-col justify-center rounded-2xl border",
              "border-[rgba(73,72,71,0.1)] bg-[#131313] p-6",
            )}
          >
            <span
              className="text-xs font-bold uppercase
                         tracking-[1px] text-[#adaaaa]"
            >
              {stat.label}
            </span>
            <p className="mt-3 text-5xl font-bold text-white">
              {stat.value}
              <span
                className="ml-1 text-lg font-normal
                           text-[#adaaaa]"
              >
                {stat.unit}
              </span>
            </p>
            {/* Progress bar */}
            <div
              className="mt-4 h-1 w-full overflow-hidden
                         rounded-full bg-[rgba(73,72,71,0.3)]"
            >
              <div
                className="h-full rounded-full bg-[#cafd00]"
                style={{
                  width: `${parseFloat(stat.value)}%`,
                  maxWidth: "100%",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Floating add button */}
      <button
        className={clsx(
          "fixed bottom-8 right-8 flex h-14 w-14",
          "items-center justify-center rounded-full",
          "bg-[#cafd00] text-black shadow-lg",
          "transition-transform hover:scale-105",
        )}
        aria-label="Add"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
