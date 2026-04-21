"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion.
 * 
 * Usage:
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion();
 * 
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { opacity: 1 }}
 * />
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * ReducedMotionWrapper — Conditionally disables animations.
 * 
 * Wrap animation-heavy components to respect user preferences.
 */
interface ReducedMotionWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ReducedMotionWrapper({
  children,
  fallback,
}: ReducedMotionWrapperProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
