"use client";

import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/skeletons";

const DashboardPage = dynamic(() => import("@/components/dashboard-page").then(mod => ({ default: mod.DashboardPage })), {
  loading: () => <DashboardSkeleton />
});

export default function DashboardRoute() {
  return <DashboardPage />;
}
