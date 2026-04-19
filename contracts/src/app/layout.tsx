import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

import { AppProviders } from "@/components/providers";
import { NavigationLoading } from "@/components/layout/navigation-loading";
import { hasClerkSetup, runtimeConfig } from "@/lib/runtime-config";

import "./globals.css";

export const metadata: Metadata = {
  title: "EcoLoop - Initia appchain",
  description:
    "Earn verified rewards for sustainable actions and run an Initia appchain without managing the infrastructure.",
  openGraph: {
    title: "EcoLoop",
    description:
      "Initia-powered sustainability platform with instant bridging, Auto-sign UX, and community DAO tools.",
    url: "https://example.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const app = <AppProviders>{children}</AppProviders>;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-50">
        <NavigationLoading />
        {hasClerkSetup ? (
          <ClerkProvider
            publishableKey={runtimeConfig.clerkPublishableKey}
            appearance={{
              baseTheme: "dark",
              elements: {
                card: "rounded-2xl shadow-lg/5",
              },
            }}
          >
            {app}
          </ClerkProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
