"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { SystemConfig } from "@/components/admin/system-config";

export default function AdminConfigPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            System Config
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Platform parameters, smart contract addresses, and feature flags.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <SystemConfig />
        </div>
      </div>
    </AdminShell>
  );
}
