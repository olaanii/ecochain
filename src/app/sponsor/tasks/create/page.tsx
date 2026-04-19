"use client";

import { useState } from "react";
import { SponsorShell } from "@/components/layout/sponsor-shell";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const CATEGORIES = ["transit", "recycling", "energy", "community"];
const VERIFICATION_METHODS = ["photo", "api", "iot", "manual", "oracle"];
const STEPS = ["Details", "Rewards", "Verification", "Review"];

export default function CreateTaskPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    verificationHint: "",
    category: "",
    baseReward: "",
    bonusFactor: "1.0",
    verificationMethod: "",
    endDate: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <SponsorShell>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Back */}
        <Link
          href="/sponsor/tasks"
          className="inline-flex items-center gap-1.5 text-sm text-[#5a6061] hover:text-[#2d3435]"
        >
          <ArrowLeft size={14} />
          Back to Tasks
        </Link>

        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Create New Task
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Define an eco-action for users to complete and earn rewards.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  i === step
                    ? "bg-[#2d3435] text-white"
                    : i < step
                    ? "bg-[#3b6934] text-white"
                    : "bg-[#e4e9ea] text-[#5a6061]"
                )}
              >
                {i + 1}
              </button>
              <span className={clsx("text-sm", i === step ? "font-medium text-[#2d3435]" : "text-[#5a6061]")}>
                {s}
              </span>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-[#5a6061]" />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-[#2d3435]">Task Details</h2>
              <Field label="Task Name">
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Urban Cycling Challenge"
                  className="input-base"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  placeholder="Describe what users need to do…"
                  className="input-base resize-none"
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="input-base"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  className="input-base"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-[#2d3435]">Reward Configuration</h2>
              <Field label="Base Reward (ECO points)">
                <input
                  type="number"
                  value={form.baseReward}
                  onChange={(e) => set("baseReward", e.target.value)}
                  placeholder="e.g. 150"
                  min={1}
                  className="input-base"
                />
              </Field>
              <Field label="Bonus Factor" hint="Multiplier applied on top of base reward (1.0 = no bonus)">
                <input
                  type="number"
                  value={form.bonusFactor}
                  onChange={(e) => set("bonusFactor", e.target.value)}
                  placeholder="1.0"
                  step={0.1}
                  min={1}
                  className="input-base"
                />
              </Field>
              <div className="rounded-xl bg-[#f9f9f9] p-4 text-sm text-[#5a6061]">
                Effective max reward:{" "}
                <span className="font-semibold text-[#2d3435]">
                  {form.baseReward && form.bonusFactor
                    ? Math.round(parseFloat(form.baseReward) * parseFloat(form.bonusFactor))
                    : "—"}{" "}
                  ECO
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-[#2d3435]">Verification</h2>
              <Field label="Verification Method">
                <select
                  value={form.verificationMethod}
                  onChange={(e) => set("verificationMethod", e.target.value)}
                  className="input-base"
                >
                  <option value="">Select method</option>
                  {VERIFICATION_METHODS.map((m) => (
                    <option key={m} value={m} className="capitalize">{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Verification Hint" hint="Shown to users when they attempt the task">
                <textarea
                  value={form.verificationHint}
                  onChange={(e) => set("verificationHint", e.target.value)}
                  rows={3}
                  placeholder="e.g. Upload a photo of your cycling route on Strava…"
                  className="input-base resize-none"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-[#2d3435]">Review & Publish</h2>
              {[
                ["Name", form.name],
                ["Category", form.category],
                ["Base Reward", `${form.baseReward} ECO`],
                ["Bonus Factor", form.bonusFactor],
                ["Verification Method", form.verificationMethod],
                ["End Date", form.endDate],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between border-b border-[#f2f4f4] pb-3 text-sm">
                  <span className="text-[#5a6061]">{k}</span>
                  <span className="font-medium text-[#2d3435] capitalize">{v || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-xl border border-[#e4e9ea] px-5 py-2.5 text-sm font-medium text-[#2d3435] transition-colors hover:bg-[#f2f4f4] disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl bg-[#2d3435] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Continue
            </button>
          ) : (
            <button className="rounded-xl bg-[#3b6934] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80">
              Publish Task
            </button>
          )}
        </div>
      </div>
    </SponsorShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#2d3435]">{label}</label>
      {hint && <p className="text-xs text-[#5a6061]">{hint}</p>}
      {children}
    </div>
  );
}
