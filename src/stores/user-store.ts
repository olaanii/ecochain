import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    transactions: boolean;
    priceAlerts: boolean;
    security: boolean;
    marketing: boolean;
  };
  gasPreference: 'slow' | 'average' | 'fast';
  autoSignEnabled: boolean;
  autoSignDuration: number; // in minutes
};

export type UserProfile = {
  id?: string;
  address?: string;
  username?: string;
  email?: string;
  avatar?: string;
  joinedAt?: Date;
  lastLogin?: Date;
  isVerified?: boolean;
  totalStaked?: string;
  totalRewards?: string;
  impactScore?: number;
};

export type UserState = {
  profile: UserProfile;
  preferences: UserPreferences;
  isLoading: boolean;
  error?: Error;
};

export type UserActions = {
  setProfile: (profile: Partial<UserProfile>) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | undefined) => void;
  resetUser: () => void;
};

type UserStore = UserState & UserActions;

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  notifications: {
    transactions: true,
    priceAlerts: true,
    security: true,
    marketing: false,
  },
  gasPreference: 'average',
  autoSignEnabled: false,
  autoSignDuration: 30,
};

const initialState: UserState = {
  profile: {},
  preferences: defaultPreferences,
  isLoading: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      setProfile: (profile) =>
        set((state) => ({
          profile: { ...state.profile, ...profile },
        })),
      setPreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),
      updatePreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      resetUser: () => set(initialState),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
      }),
    }
  )
);
