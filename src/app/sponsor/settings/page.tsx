"use client";

import { useState } from "react";
import { SponsorShell } from "@/components/layout/sponsor-shell";

export default function SponsorSettingsPage() {
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    contactEmail: "",
    description: "",
    industry: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <SponsorShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Sponsor Settings
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Manage your company profile and sponsorship preferences.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <h2 className="mb-6 text-base font-semibold text-[#2d3435]">Company Profile</h2>
          <div className="space-y-5">
            {[
              { key: "companyName", label: "Company Name", placeholder: "Acme Corp" },
              { key: "website", label: "Website", placeholder: "https://acme.com" },
              { key: "contactEmail", label: "Contact Email", placeholder: "sponsorship@acme.com" },
              { key: "industry", label: "Industry", placeholder: "e.g. Technology, Retail, Energy" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-sm font-medium text-[#2d3435]">{label}</label>
                <input
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-[#e4e9ea] bg-[#f9f9f9] px-4 py-2.5 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#2d3435]">About</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Tell users about your environmental mission…"
                className="w-full resize-none rounded-xl border border-[#e4e9ea] bg-[#f9f9f9] px-4 py-2.5 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#f2f4f4] pt-6">
            <button
              type="button"
              className="rounded-xl border border-[#e4e9ea] px-5 py-2.5 text-sm font-medium text-[#2d3435] transition-colors hover:bg-[#f2f4f4]"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#2d3435] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </SponsorShell>
  );
}
