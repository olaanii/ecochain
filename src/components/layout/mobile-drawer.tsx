"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { NavSection } from "@/lib/navigation/config";

interface NavItem {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Legacy flat list — used only for landing variant */
  navItems?: NavItem[];
  /** Role-aware sections from navigationFor(role) — preferred */
  sections?: NavSection[];
}

/**
 * Mobile navigation drawer with touch gesture support, backdrop overlay,
 * body scroll lock, and accessibility features.
 *
 * Accepts either `sections` (role-aware full nav) or `navItems` (legacy flat).
 * When `sections` is provided it renders all top-level sections with
 * expandable sub-nav for the active section — resolving [N-4].
 *
 * **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**
 */
export function MobileDrawer({ isOpen, onClose, navItems, sections }: MobileDrawerProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);

  // Auto-expand the section that matches the current pathname
  const activeSection = sections?.find(
    (s) => pathname === s.href || pathname.startsWith(s.href + "/") || pathname.startsWith(s.href + "?"),
  );
  const [expandedId, setExpandedId] = useState<string | null>(activeSection?.id ?? null);

  useEffect(() => {
    if (isOpen && activeSection) setExpandedId(activeSection.id);
  }, [isOpen, activeSection]);

  // Body scroll lock when drawer is open (Requirement 12.6)
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when drawer opens
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    drawer.addEventListener("keydown", handleTabKey);
    return () => drawer.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Touch gesture support for swipe to close (Requirement 12.5)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const deltaX = touchCurrentX.current - touchStartX.current;
    const threshold = 50; // Minimum swipe distance in pixels

    // Swipe left to close (drawer slides out to the left)
    if (deltaX < -threshold) {
      onClose();
    }
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle navigation link click - close drawer and navigate (Requirement 12.4)
  const handleNavClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay (Requirement 12.1) */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer (Requirement 12.1, 12.2) */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className={clsx(
          "fixed right-0 top-0 z-50 h-full w-[280px]",
          "bg-[#1a1a1a] shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between border-b border-[rgba(73,72,71,0.3)] px-6 py-4">
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#f3ffca]">
            Menu
          </h2>
          <button
            onClick={onClose}
            className={clsx(
              "rounded-lg p-2 text-[#adaaaa]",
              "transition-colors hover:bg-[rgba(73,72,71,0.3)] hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-[#cafd00]"
            )}
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation links (Requirement 12.3) */}
        <nav className="flex flex-col px-4 py-6">
          {sections ? (
            sections.map((section) => {
              const isSectionActive =
                pathname === section.href ||
                pathname.startsWith(section.href + "/") ||
                pathname.startsWith(section.href + "?");
              const isExpanded = expandedId === section.id;
              const Icon = section.icon;

              return (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setExpandedId(isExpanded ? null : section.id);
                      if (section.subNav.length === 0) {
                        onClose();
                      }
                    }}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors",
                      isSectionActive
                        ? "border-l-4 border-[#cafd00] bg-[#cafd00]/10 text-[#cafd00]"
                        : "text-[#adaaaa] hover:bg-[rgba(73,72,71,0.2)] hover:text-white",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {section.label}
                    </span>
                    {section.subNav.length > 0 && (
                      <ChevronDown
                        size={15}
                        className={clsx("transition-transform", isExpanded && "rotate-180")}
                      />
                    )}
                  </button>

                  {isExpanded && section.subNav.length > 0 && (
                    <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-[rgba(73,72,71,0.3)] pl-3">
                      {section.subNav.map((sub) => {
                        const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "?");
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={handleNavClick}
                            className={clsx(
                              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isSubActive
                                ? "text-[#cafd00]"
                                : "text-[#adaaaa] hover:text-white",
                            )}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            (navItems ?? []).map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={clsx(
                    "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "border-l-4 border-[#cafd00] bg-[#cafd00]/10 text-[#cafd00]"
                      : "text-[#adaaaa] hover:bg-[rgba(73,72,71,0.2)] hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </>
  );
}
