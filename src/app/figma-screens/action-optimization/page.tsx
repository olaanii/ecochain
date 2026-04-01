import type { Metadata } from "next";
import { ActionOptimization } from "@/components/figma/action-optimization";

export const metadata: Metadata = {
  title: "Action Optimization - EcoChain",
  description: "AI-powered recommendations to maximize your environmental impact and earnings.",
};

export default function ActionOptimizationPage() {
  return <ActionOptimization />;
}
