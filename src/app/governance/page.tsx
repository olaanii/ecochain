"use client";

import { ProductShell } from "@/components/layout/product-shell";
import { GovernanceView } from "@/components/governance/governance-view";

export default function GovernancePage() {
  return (
    <ProductShell>
      <GovernanceView />
    </ProductShell>
  );
}
