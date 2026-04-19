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
  defaultTheme = "system",
  storageKey = "ecochain-theme",
}: ThemeProviderProps) {
  const { preferences, updatePreference } = useUserStore();

  useEffect(() => {
    // Initialize theme from storage or default
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
      updatePreference("theme", storedTheme);
    }
  }, [storageKey, updatePreference]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let theme: Theme = preferences.theme || defaultTheme;

    if (theme === "system") {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(theme);
  }, [preferences.theme, defaultTheme]);

  return <>{children}</>;
}
