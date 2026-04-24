import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentDbUser } from "@/lib/auth/current-user";
import type { ReactNode } from "react";

export default async function SponsorLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    redirect("/onboarding");
  }

  if (dbUser.role !== "sponsor") {
    redirect("/dashboard");
  }

  // Check if user has initiaAddress (wallet connected)
  if (!dbUser.initiaAddress) {
    redirect("/wallet-connect?redirect=/sponsor");
  }

  return <>{children}</>;
}
