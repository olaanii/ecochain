"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Building2, CheckCircle } from "lucide-react";
import clsx from "clsx";

/* ── Figma asset constants ──────────────────────── */
const imgBrandLogo = "";

type OnboardingStep = "connect" | "select-focus" | "begin";
type FocusOption = "user" | "sponsor";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("connect");
  const [selectedRole, setSelectedRole] = useState<FocusOption | null>(null);
  const [saving, setSaving] = useState(false);

  const stepIndex: Record<OnboardingStep, number> = {
    "connect": 0,
    "select-focus": 1,
    "begin": 2,
  };
  const currentStep = stepIndex[step];

  const [error, setError] = useState<string | null>(null);

  async function handleBegin() {
    if (!selectedRole) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Failed to set up your account. Please try again.");
        setSaving(false);
        return;
      }
      router.push(selectedRole === "sponsor" ? "/sponsor" : "/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9] px-8 py-24">
      <div className="flex w-full max-w-[512px] flex-col items-center px-8 py-16">
        {/* Brand Identity */}
        <div className="flex w-full flex-col items-center pb-12">
          <div className="flex flex-col items-center gap-4">
            <h1
              className="text-center font-semibold text-[#2d3435]"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "48px",
                lineHeight: "48px",
                letterSpacing: "-1.2px",
              }}
            >
              The Quiet Earth
            </h1>
            <p
              className="text-center text-[#5a6061]"
              style={{ fontFamily: "var(--font-body)", fontSize: "18px", lineHeight: "29.25px" }}
            >
              Enter the curated sanctuary.
            </p>
          </div>
        </div>

        {/* Step content */}
        {step === "connect" && (
          <div className="surface-card flex w-full flex-col items-center p-10">
            <h2
              className="mb-8 text-center text-[#2d3435]"
              style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: "500", lineHeight: "32px", letterSpacing: "-0.6px" }}
            >
              Connect
            </h2>
            <button
              type="button"
              onClick={() => setStep("select-focus")}
              className="btn-primary mb-4 flex w-full items-center justify-center gap-3"
            >
              PASSKEY
            </button>
            <button type="button" className="btn-outline flex w-full items-center justify-center">
              MORE OPTIONS
            </button>
          </div>
        )}

        {step === "select-focus" && (
          <div className="surface-card flex w-full flex-col gap-6 p-10">
            <div>
              <h2
                className="text-center text-[#2d3435]"
                style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: "500", lineHeight: "32px", letterSpacing: "-0.6px" }}
              >
                Select Focus
              </h2>
              <p className="mt-2 text-center text-sm text-[#5a6061]">
                How will you engage with the platform?
              </p>
            </div>

            <div className="space-y-3">
              {([
                {
                  role: "user" as FocusOption,
                  icon: Leaf,
                  title: "Individual",
                  desc: "Earn ECO points by completing eco-actions and redeeming real-world rewards.",
                },
                {
                  role: "sponsor" as FocusOption,
                  icon: Building2,
                  title: "Company / Sponsor",
                  desc: "Create rewarding tasks, run campaigns, and drive green behaviour at scale.",
                },
              ] as const).map(({ role, icon: Icon, title, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={clsx(
                    "flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all",
                    selectedRole === role
                      ? "border-[#2d3435] bg-[#f2f4f4]"
                      : "border-[#e4e9ea] bg-white hover:border-[#2d3435]/30"
                  )}
                >
                  <div className={clsx("mt-0.5 rounded-xl p-2.5", selectedRole === role ? "bg-[#2d3435] text-white" : "bg-[#e4e9ea] text-[#5a6061]")}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#2d3435]">{title}</p>
                    <p className="mt-0.5 text-sm text-[#5a6061]">{desc}</p>
                  </div>
                  {selectedRole === role && <CheckCircle size={18} className="mt-0.5 shrink-0 text-[#3b6934]" />}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!selectedRole}
              onClick={() => setStep("begin")}
              className="btn-primary flex w-full items-center justify-center disabled:opacity-40"
            >
              CONTINUE
            </button>
          </div>
        )}

        {step === "begin" && (
          <div className="surface-card flex w-full flex-col items-center gap-6 p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3b6934]/10">
              <CheckCircle size={28} className="text-[#3b6934]" />
            </div>
            <div>
              <h2
                className="text-center text-[#2d3435]"
                style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: "500", lineHeight: "32px", letterSpacing: "-0.6px" }}
              >
                {selectedRole === "sponsor" ? "Welcome, Sponsor" : "Welcome"}
              </h2>
              <p className="mt-2 text-center text-sm text-[#5a6061]">
                {selectedRole === "sponsor"
                  ? "Your sponsor portal is ready. Start creating rewarding tasks."
                  : "Your eco journey starts now. Discover tasks and earn ECO."}
              </p>
            </div>
            {error && (
              <p className="w-full text-center text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleBegin}
              className="btn-primary flex w-full items-center justify-center disabled:opacity-60"
            >
              {saving ? "SETTING UP…" : "BEGIN"}
            </button>
          </div>
        )}

        {/* Step indicator */}
        <div className="mt-12 flex w-full max-w-[384px] flex-col items-start">
          <div className="relative flex w-full items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#f2f4f4]" />
            {(["CREATE IDENTITY", "SELECT FOCUS", "BEGIN"] as const).map((label, i) => (
              <div key={label} className="relative flex flex-col items-center gap-3 bg-[#f9f9f9] px-2">
                <div
                  className={clsx(
                    "relative flex size-3 items-center justify-center rounded-full",
                    i <= currentStep ? "bg-[#3b6934]" : "bg-[#e4e9ea]"
                  )}
                >
                  <div className="absolute size-3 rounded-full shadow-[0px_0px_0px_4px_#f9f9f9]" />
                </div>
                <p
                  className={clsx("whitespace-nowrap", i <= currentStep ? "text-[#3b6934]" : "text-[#5a6061]")}
                  style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: "600", lineHeight: "16px", letterSpacing: "1.2px", textTransform: "uppercase" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
