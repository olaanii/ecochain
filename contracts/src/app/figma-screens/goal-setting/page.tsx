import type { Metadata } from "next";
import { GoalSetting } from "@/components/figma/goal-setting";

export const metadata: Metadata = {
  title: "Goal Setting - EcoChain",
  description: "Calibrate your environmental impact targets and track progress toward your goals.",
};

export default function GoalSettingPage() {
  return <GoalSetting />;
}
