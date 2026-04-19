"use client";

import { ProductShell } from "@/components/layout/product-shell";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";

export default function LeaderboardPage() {
  return (
    <ProductShell>
      <LeaderboardView />
    </ProductShell>
  );
}
