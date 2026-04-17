import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const DailyMissions = dynamic(
  () => import("@/components/figma/daily-missions").then(mod => ({ default: mod.DailyMissions })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 5: Daily Missions - EcoChain",
  description: "Mission grid with streak tracking and bonus challenges.",
};

export default function Screen5Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <DailyMissions />
      </ResponsiveContainer>
    </>
  );
}
