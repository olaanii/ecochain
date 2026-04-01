import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const EfficiencyScore = dynamic(
  () => import("@/components/figma/efficiency-score").then(mod => ({ default: mod.EfficiencyScore })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 3: Efficiency Score - EcoChain",
  description: "Overall efficiency metrics and performance breakdown.",
};

export default function Screen3Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <EfficiencyScore />
      </ResponsiveContainer>
    </>
  );
}
