import type { Metadata } from "next";
import { CO2Breakdown } from "@/components/figma/co2-breakdown";

export const metadata: Metadata = {
  title: "CO2 Offset Breakdown - EcoChain",
  description: "Detailed analysis of your carbon offset contributions across all categories.",
};

export default function CO2BreakdownPage() {
  return <CO2Breakdown />;
}
