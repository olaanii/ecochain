import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const AICoach = dynamic(
  () => import("@/components/figma/ai-coach").then(mod => ({ default: mod.AICoach })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 2: AI Coach - EcoChain",
  description: "Neural network insights and AI-powered recommendations for environmental impact.",
};

export default function Screen2Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <AICoach />
      </ResponsiveContainer>
    </>
  );
}
