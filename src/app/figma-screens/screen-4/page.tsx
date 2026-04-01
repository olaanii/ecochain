import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const AchievementGallery = dynamic(
  () => import("@/components/figma/achievement-gallery").then(mod => ({ default: mod.AchievementGallery })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 4: Achievement Gallery - EcoChain",
  description: "Badge showcase with progress tracking and rarity system.",
};

export default function Screen4Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <AchievementGallery />
      </ResponsiveContainer>
    </>
  );
}
