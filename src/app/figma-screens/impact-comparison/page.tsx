import type { Metadata } from "next";
import { ImpactComparison } from "@/components/figma/impact-comparison";

export const metadata: Metadata = {
  title: "Impact Comparison - EcoChain",
  description: "See how your environmental impact compares to the global community.",
};

export default function ImpactComparisonPage() {
  return <ImpactComparison />;
}
