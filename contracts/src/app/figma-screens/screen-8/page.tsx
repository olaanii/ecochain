import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ScreenNavigation } from "@/components/figma/shared/screen-navigation";
import { ResponsiveContainer } from "@/components/figma/shared/responsive-container";
import { ScreenLoading } from "@/components/figma/shared/screen-loading";

const EarningsLedger = dynamic(
  () => import("@/components/figma/earnings-ledger").then(mod => ({ default: mod.EarningsLedger })),
  { loading: () => <ScreenLoading /> }
);

export const metadata: Metadata = {
  title: "Screen 8: ECO Earnings Ledger - EcoChain",
  description: "Transaction history with verification status and earnings summary.",
};

export default function Screen8Page() {
  return (
    <>
      <ScreenNavigation />
      <ResponsiveContainer maxWidth="2xl" padding="md">
        <EarningsLedger />
      </ResponsiveContainer>
    </>
  );
}
