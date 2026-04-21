"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ecochain-theme",
}: ThemeProviderProps) {
  const { preferences, updatePreference } = useUserStore();

  useEffect(() => {
    // Force light mode - always set to light
    updatePreference("theme", "light");
    localStorage.setItem(storageKey, "light");
  }, [storageKey, updatePreference]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("light");
  }, []);

  return <>{children}</>;
}
