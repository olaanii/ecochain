'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/blockchain/wagmi-config';

/**
 * Blockchain Provider Component
 * 
 * Wraps the application with wagmi and React Query providers
 * for blockchain interactions and state management.
 * 
 * Requirement 16.1, 16.2, 16.3
 */

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

interface BlockchainProviderProps {
  children: ReactNode;
}

export function BlockchainProvider({ children }: BlockchainProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
