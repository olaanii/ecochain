import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const PersonalDashboard = dynamic(
  () => import("@/components/figma/personal-dashboard").then(mod => ({ default: mod.PersonalDashboard })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 1: Personal Impact Dashboard - EcoChain",
  description: "Your comprehensive environmental impact analytics and performance metrics.",
};

export default function Screen1Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <PersonalDashboard />
      </ResponsiveContainer>
    </>
  );
}
