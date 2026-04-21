"use client";

import Link from "next/link";

/**
 * SkipLink — Skip to main content link for keyboard users.
 * 
 * This component is visually hidden by default and appears when focused,
 * allowing keyboard users to skip repetitive navigation.
 * 
 * Usage: Place at the top of the page, before navigation.
 */
export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="fixed left-4 top-4 z-[100] -translate-y-[150%] rounded-xl px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
      style={{ backgroundColor: "var(--color-brand-primary)" }}
    >
      Skip to main content
    </Link>
  );
}
