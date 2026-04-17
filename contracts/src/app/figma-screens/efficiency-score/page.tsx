import type { Metadata } from "next";
import { EfficiencyScore } from "@/components/figma/efficiency-score";

export const metadata: Metadata = {
  title: "Efficiency Score Card - EcoChain",
  description: "Real-time analytics dashboard tracking your environmental performance across all categories.",
};

export default function EfficiencyScorePage() {
  return <EfficiencyScore />;
}
