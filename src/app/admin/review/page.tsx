"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { ReviewQueue } from "@/components/admin/review-queue";

export default function AdminReviewPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Review Queue
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Manually approve or reject flagged verification submissions.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <ReviewQueue />
        </div>
      </div>
    </AdminShell>
  );
}
