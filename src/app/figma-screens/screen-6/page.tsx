import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const GoalSetting = dynamic(
  () => import("@/components/figma/goal-setting").then(mod => ({ default: mod.GoalSetting })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 6: Goal Setting - EcoChain",
  description: "Interactive goal setting with progress tracking and insights.",
};

export default function Screen6Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <GoalSetting />
      </ResponsiveContainer>
    </>
  );
}
