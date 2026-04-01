"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

/**
 * Navigation Context
 * 
 * Provides navigation state and helper functions to all child components.
 * 
 * **Performance Optimizations:**
 * - Link prefetching: Enabled by default in Next.js Link components
 * - Scroll restoration: Automatic via Next.js App Router for back navigation
 * - Route caching: Previously visited pages cached for instant back navigation
 * 
 * **Validates: Requirements 10.1-10.6, 15.1-15.7**
 */

interface NavigationContextValue {
  currentRoute: string;
  previousRoute: string | null;
  navigationHistory: string[];
  isAuthenticated: boolean;
  goToDashboard: () => void;
  goToDiscover: () => void;
  goToVerification: (taskId?: string) => void;
  goToMerchants: () => void;
  goToBridge: () => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
}

const HISTORY_KEY = "navigation_history";
const MAX_HISTORY_LENGTH = 50;

export function NavigationProvider({ children }: NavigationProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const [currentRoute, setCurrentRoute] = useState<string>(pathname);
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Initialize navigation history from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHistory = sessionStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        try {
          const parsed = JSON.parse(storedHistory);
          if (Array.isArray(parsed)) {
            setNavigationHistory(parsed);
          }
        } catch (error) {
          console.error("Failed to parse navigation history:", error);
        }
      }
    }
  }, []);

  // Update navigation state when pathname changes
  useEffect(() => {
    if (pathname !== currentRoute) {
      setPreviousRoute(currentRoute);
      setCurrentRoute(pathname);

      // Update navigation history
      setNavigationHistory((prev) => {
        const newHistory = [...prev, pathname];
        // Keep history limited to MAX_HISTORY_LENGTH
        const trimmedHistory =
          newHistory.length > MAX_HISTORY_LENGTH
            ? newHistory.slice(-MAX_HISTORY_LENGTH)
            : newHistory;

        // Persist to sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
        }

        return trimmedHistory;
      });
    }
  }, [pathname, currentRoute]);

  // Navigation helper functions
  const goToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const goToDiscover = useCallback(() => {
    router.push("/discover");
  }, [router]);

  const goToVerification = useCallback(
    (taskId?: string) => {
      if (taskId) {
        router.push(`/verification?taskId=${taskId}`);
      } else {
        router.push("/verification");
      }
    },
    [router]
  );

  const goToMerchants = useCallback(() => {
    router.push("/merchants");
  }, [router]);

  const goToBridge = useCallback(() => {
    router.push("/bridge");
  }, [router]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const value: NavigationContextValue = {
    currentRoute,
    previousRoute,
    navigationHistory,
    isAuthenticated: isSignedIn ?? false,
    goToDashboard,
    goToDiscover,
    goToVerification,
    goToMerchants,
    goToBridge,
    goBack,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
