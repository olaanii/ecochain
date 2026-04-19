"use client";

import { ProductShell } from "@/components/layout/product-shell";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <ProductShell>
      <AnalyticsDashboard />
    </ProductShell>
  );
}
