import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    redirect("/onboarding");
  }

  const role = (user.publicMetadata?.role as string) ?? "user";

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
