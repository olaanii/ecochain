import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WalletState = {
  address?: string;
  initiaAddress?: string;
  chainId?: string;
  isConnected: boolean;
  isConnecting: boolean;
  balance?: string;
  username?: string;
  error?: Error;
};

export type WalletActions = {
  setWalletState: (state: Partial<WalletState>) => void;
  setConnecting: (isConnecting: boolean) => void;
  setError: (error: Error | undefined) => void;
  resetWallet: () => void;
};

type WalletStore = WalletState & WalletActions;

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      ...initialState,
      setWalletState: (state) => set((prev) => ({ ...prev, ...state })),
      setConnecting: (isConnecting) => set({ isConnecting }),
      setError: (error) => set({ error }),
      resetWallet: () => set(initialState),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        address: state.address,
        initiaAddress: state.initiaAddress,
        chainId: state.chainId,
        isConnected: state.isConnected,
        username: state.username,
      }),
    }
  )
);
