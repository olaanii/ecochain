import type { Metadata } from "next";
import { PersonalDashboard } from "@/components/figma/personal-dashboard";

export const metadata: Metadata = {
  title: "Personal Impact Dashboard - EcoChain",
  description: "Your comprehensive environmental impact analytics and performance metrics.",
};

export default function PersonalDashboardPage() {
  return <PersonalDashboard />;
}
