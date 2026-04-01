"use client";

import {
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCircle2,
  BarChart3,
  Telescope,
} from "lucide-react";
import clsx from "clsx";

const timelineSteps = [
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Data Received",
    description:
      "Payload successfully ingested and decrypted. Validation complete.",
    time: "14:22:04 UTC",
    status: "done" as const,
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Analyzing",
    description:
      "Cross-referencing global merchant databases and security protocols.",
    time: "IN PROGRESS",
    status: "active" as const,
  },
  {
    icon: <Telescope className="h-5 w-5" />,
    title: "Finalizing",
    description:
      "Generation of Terminal access keys and security certificates.",
    time: "PENDING",
    status: "pending" as const,
  },
];

/**
 * Design 3 — Verification Status: Pending (Figma node 3:3269).
 *
 * Shows a large progress ring at 74%, sidebar info cards,
 * and an interactive process timeline.
 */
export function VerificationStatus() {
  const progress = 74;

  return (
    <div className="flex flex-col gap-8 px-12 pb-12 pt-8">
      {/* Page header */}
      <div>
        <span
          className="text-xs font-bold uppercase
                     tracking-[1.2px] text-[#cafd00]"
        >
          System Integrity Check
        </span>
        <h1
          className="mt-1 font-['Plus_Jakarta_Sans'] text-[36px]
                     font-extrabold tracking-tight text-white"
        >
          Verification Status
        </h1>
        <p
          className="mt-2 max-w-xl text-base leading-relaxed
                     text-[#adaaaa]"
        >
          Your application is currently being processed by our
          automated neural network. Final human oversight may be
          required for high-tier terminal access.
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left: Progress ring card */}
        <div
          className={clsx(
            "flex flex-col items-center justify-center",
            "rounded-2xl border border-[rgba(73,72,71,0.1)]",
            "bg-[#131313] px-12 py-16",
          )}
        >
          {/* SVG ring */}
          <div className="relative h-64 w-64">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 256 256">
              {/* Track */}
              <circle
                cx="128"
                cy="128"
                r="112"
                fill="none"
                stroke="rgba(73,72,71,0.2)"
                strokeWidth="4"
              />
              {/* Progress arc */}
              <circle
                cx="128"
                cy="128"
                r="112"
                fill="none"
                stroke="#cafd00"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 112}`}
                strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div
              className="absolute inset-0 flex flex-col items-center
                         justify-center"
            >
              <RefreshCw
                className="mb-2 h-8 w-8 animate-spin text-[#adaaaa]"
                style={{ animationDuration: "3s" }}
              />
              <span className="text-5xl font-bold text-white">
                {progress}%
              </span>
              <span
                className="mt-1 text-xs font-semibold uppercase
                           tracking-[1.2px] text-[#adaaaa]"
              >
                Processing
              </span>
            </div>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-white">
            Verification Pending
          </h2>
          <p className="mt-2 text-sm text-[#adaaaa]">
            Expected completion within{" "}
            <span className="font-semibold text-white">
              2-4 business hours
            </span>
            .
          </p>
        </div>

        {/* Right: Info cards */}
        <div className="flex flex-col gap-4">
          <div
            className={clsx(
              "flex gap-4 rounded-2xl border",
              "border-[rgba(73,72,71,0.1)] bg-[#131313] p-6",
            )}
          >
            <ShieldCheck className="h-6 w-6 shrink-0 text-[#cafd00]" />
            <div>
              <h3 className="font-semibold text-white">
                Encrypted Review
              </h3>
              <p className="mt-1 text-sm text-[#adaaaa]">
                Your sensitive data is hashed and processed within
                a secure sandbox environment.
              </p>
            </div>
          </div>

          <div
            className={clsx(
              "flex gap-4 rounded-2xl border",
              "border-[rgba(73,72,71,0.1)] bg-[#131313] p-6",
            )}
          >
            <Clock className="h-6 w-6 shrink-0 text-[#adaaaa]" />
            <div>
              <h3 className="font-semibold text-white">
                Next Actions
              </h3>
              <p className="mt-1 text-sm text-[#adaaaa]">
                Once verified, you will receive an invitation link
                to the Terminal v2.4 private beta.
              </p>
            </div>
          </div>

          {/* CTA card */}
          <div
            className={clsx(
              "rounded-2xl bg-[#cafd00] p-6",
              "text-center",
            )}
          >
            <h3 className="text-lg font-bold text-black">
              Need help?
            </h3>
            <p className="mt-1 text-sm text-[rgba(0,0,0,0.6)]">
              Our support agents are active 24/7
            </p>
            <button
              className={clsx(
                "mt-4 rounded-xl bg-black px-6 py-3",
                "text-sm font-semibold text-white",
                "transition-colors hover:bg-[#1a1a1a]",
              )}
            >
              Contact Operator
            </button>
          </div>
        </div>
      </div>

      {/* Process Timeline */}
      <div
        className={clsx(
          "rounded-2xl border border-[rgba(73,72,71,0.1)]",
          "bg-[#131313] p-8",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Process Timeline
          </h2>
          <span className="flex items-center gap-2 text-sm text-[#adaaaa]">
            <span className="h-2 w-2 rounded-full bg-[#cafd00]" />
            Active Session
          </span>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-0">
          {timelineSteps.map((step, i) => (
            <div key={step.title} className="flex flex-col">
              {/* Icon + connector */}
              <div className="flex items-center">
                <div
                  className={clsx(
                    "flex h-12 w-12 shrink-0 items-center",
                    "justify-center rounded-2xl",
                    step.status === "done"
                      ? "bg-[#cafd00] text-black"
                      : step.status === "active"
                        ? "bg-[#cafd00] text-black"
                        : "bg-[rgba(73,72,71,0.3)] text-[#666]",
                  )}
                >
                  {step.icon}
                </div>
                {i < timelineSteps.length - 1 && (
                  <div
                    className={clsx(
                      "h-0.5 flex-1",
                      step.status === "done"
                        ? "bg-[#cafd00]"
                        : "bg-[rgba(73,72,71,0.3)]",
                    )}
                  />
                )}
              </div>

              {/* Text content */}
              <div className="mt-4 pr-8">
                <h4
                  className={clsx(
                    "font-semibold",
                    step.status === "pending"
                      ? "text-[#666]"
                      : "text-white",
                  )}
                >
                  {step.title}
                </h4>
                <p
                  className={clsx(
                    "mt-1 text-sm leading-5",
                    step.status === "pending"
                      ? "text-[#555]"
                      : "text-[#adaaaa]",
                  )}
                >
                  {step.description}
                </p>
                <span
                  className={clsx(
                    "mt-2 inline-block font-mono text-xs",
                    "uppercase tracking-wide",
                    step.status === "active"
                      ? "text-[#cafd00]"
                      : step.status === "done"
                        ? "text-[#adaaaa]"
                        : "text-[#555]",
                  )}
                >
                  {step.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
