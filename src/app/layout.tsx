import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { AppProviders } from "@/components/providers";
import { NavigationLoading } from "@/components/layout/navigation-loading";
import { SkipLink } from "@/components/a11y";
import { hasClerkSetup, runtimeConfig } from "@/lib/runtime-config";

import "./globals.css";

export const metadata: Metadata = {
  title: "The Quiet Earth — Verified Sustainability on Initia",
  description:
    "Transform real-world actions into verified rewards on the Initia network. A refined sustainability protocol.",
  openGraph: {
    title: "The Quiet Earth",
    description:
      "Transform real-world ecological actions into verified on-chain rewards. Built on Initia.",
    url: "https://example.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const app = (
    <AppProviders>
      <SkipLink />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
    </AppProviders>
  );

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-[var(--color-surface)] text-[var(--color-text-dark)]">
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
