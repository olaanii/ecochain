import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const CO2Breakdown = dynamic(
  () => import("@/components/figma/co2-breakdown").then(mod => ({ default: mod.CO2Breakdown })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 10: CO2 Offset Breakdown - EcoChain",
  description: "Category breakdown with monthly trends and impact details.",
};

export default function Screen10Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <CO2Breakdown />
      </ResponsiveContainer>
    </>
  );
}
