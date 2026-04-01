"use client";

import InterwovenKitStyles from "@initia/interwovenkit-react/styles.js";
import {
  InterwovenKitProvider,
  injectStyles,
} from "@initia/interwovenkit-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";

import { initiaConfig } from "@/lib/initia/config";
import { NavigationProvider } from "@/contexts/navigation-context";
import { WalletProvider } from "@/contexts/wallet-context";

const queryClient = new QueryClient();

import { defineChain } from "viem";

const ecochain = defineChain({
  id: 1598283435881984,
  name: "Ecochain",
  nativeCurrency: { name: "GAS", symbol: "GAS", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_INITIA_JSON_RPC || "http://localhost:8545"] },
  },
});

const wagmiConfig = createConfig({
  ssr: true,
  chains: [ecochain, mainnet],

  transports: {
    [ecochain.id]: http(),
    [mainnet.id]: http(),
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
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider {...initiaConfig}>
          <WalletProvider>
            <NavigationProvider>{children}</NavigationProvider>
          </WalletProvider>
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
