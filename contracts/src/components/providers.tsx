"use client";

import InterwovenKitStyles from "@initia/interwovenkit-react/styles.js";
import {
  InterwovenKitProvider,
  injectStyles,
} from "@initia/interwovenkit-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { WagmiProvider } from "wagmi";

import { wagmiConfig } from "@/lib/blockchain/wagmi-config";
import { initiaConfig } from "@/lib/initia/config";
import { NavigationProvider } from "@/contexts/navigation-context";
import { WalletProvider } from "@/contexts/wallet-context";

const queryClient = new QueryClient();

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
            <NavigationProvider>{children}</NavigationProvider>
          </WalletProvider>
        </InterwovenKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
