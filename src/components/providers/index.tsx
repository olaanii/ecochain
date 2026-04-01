'use client';

import { ReactNode } from 'react';
import { BlockchainProvider } from './blockchain-provider';

/**
 * App Providers Component
 * 
 * Combines all application providers including:
 * - Blockchain (wagmi + React Query)
 * - Clerk authentication (handled in layout.tsx)
 */

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BlockchainProvider>
      {children}
    </BlockchainProvider>
  );
}
