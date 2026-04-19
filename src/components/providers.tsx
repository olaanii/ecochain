"use client";

import InterwovenKitStyles from "@initia/interwovenkit-react/styles.js";
import {
  InterwovenKitProvider,
  injectStyles,
} from "@initia/interwovenkit-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";

import { wagmiConfig } from "@/lib/blockchain/wagmi-config";
import { initiaConfig } from "@/lib/initia/config";
import { NavigationProvider } from "@/contexts/navigation-context";
import { WalletProvider } from "@/contexts/wallet-context";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    injectStyles(InterwovenKitStyles);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <InterwovenKitProvider {...initiaConfig}>
          <WalletProvider>
            <NavigationProvider>
              <ThemeProvider>
                {children}
                <Toaster />
              </ThemeProvider>
            </NavigationProvider>
          </WalletProvider>
        </InterwovenKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
