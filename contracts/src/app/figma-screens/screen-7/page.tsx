import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const ActionOptimization = dynamic(
  () => import("@/components/figma/action-optimization").then(mod => ({ default: mod.ActionOptimization })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 7: Action Optimization - EcoChain",
  description: "AI recommendations with impact predictions and confidence scores.",
};

export default function Screen7Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <ActionOptimization />
      </ResponsiveContainer>
    </>
  );
}
