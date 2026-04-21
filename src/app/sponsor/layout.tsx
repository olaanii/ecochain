import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import type { ReactNode } from "react";

export default async function SponsorLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    redirect("/onboarding");
  }

  const role = (user.publicMetadata?.role as string) ?? "user";

  const sponsorRoles = ["sponsor", "sponsor_admin", "sponsor_viewer"];
  if (!sponsorRoles.includes(role)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
