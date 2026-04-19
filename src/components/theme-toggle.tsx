"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle() {
  const { preferences, updatePreference } = useUserStore();
  const currentTheme = preferences.theme || "system";

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updatePreference("theme", themes[nextIndex].value);
    localStorage.setItem("ecochain-theme", themes[nextIndex].value);
  };

  const CurrentIcon = themes.find((t) => t.value === currentTheme)?.icon || Monitor;

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        "transition-colors hover:bg-secondary",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
      title={`Current theme: ${currentTheme}. Click to change.`}
    >
      <CurrentIcon className="h-5 w-5" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
