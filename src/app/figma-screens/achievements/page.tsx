import type { Metadata } from "next";
import { AchievementGallery } from "@/components/figma/achievement-gallery";

export const metadata: Metadata = {
  title: "Achievement Gallery - EcoChain",
  description: "Showcase your environmental accomplishments and unlock exclusive badges.",
};

export default function AchievementsPage() {
  return <AchievementGallery />;
}
