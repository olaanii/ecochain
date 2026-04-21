import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import type { ReactNode } from "react";
import { ProductShell } from "@/components/layout/product-shell";

export default async function UserLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    redirect("/onboarding");
  }

  return <ProductShell>{children}</ProductShell>;
}
