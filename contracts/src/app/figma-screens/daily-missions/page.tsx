import type { Metadata } from "next";
import { DailyMissions } from "@/components/figma/daily-missions";

export const metadata: Metadata = {
  title: "Daily Missions - EcoChain",
  description: "Complete daily environmental tasks to earn rewards and maintain your streak.",
};

export default function DailyMissionsPage() {
  return <DailyMissions />;
}
