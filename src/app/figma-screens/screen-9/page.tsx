import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const ImpactComparison = dynamic(
  () => import("@/components/figma/impact-comparison").then(mod => ({ default: mod.ImpactComparison })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 9: Impact Comparison - EcoChain",
  description: "Global leaderboard with performance comparison and regional stats.",
};

export default function Screen9Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <ImpactComparison />
      </ResponsiveContainer>
    </>
  );
}
