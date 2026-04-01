import type { Metadata } from "next";
import { EarningsLedger } from "@/components/figma/earnings-ledger";

export const metadata: Metadata = {
  title: "ECO Earnings Ledger - EcoChain",
  description: "Track every cryptographically verified proof-of-impact. Earnings are processed in real-time and settled on the NeonVoid substrate.",
};

export default function EarningsLedgerPage() {
  return <EarningsLedger />;
}