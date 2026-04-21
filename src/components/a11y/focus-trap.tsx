"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FocusTrapProps {
  children: ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}

/**
 * FocusTrap — Traps focus within a container for modals/dialogs.
 * 
 * Usage:
 * ```tsx
 * <FocusTrap isActive={isOpen} onEscape={closeModal}>
 *   <ModalContent />
 * </FocusTrap>
 * ```
 */
export function FocusTrap({ children, isActive, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // Store previously focused element
      previouslyFocusedRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element
      const container = containerRef.current;
      if (container) {
        const focusableElements = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }

      // Handle escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onEscape?.();
        }
        if (e.key === "Tab") {
          const container = containerRef.current;
          if (!container) return;

          const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        // Restore focus on cleanup
        previouslyFocusedRef.current?.focus();
      };
    }
  }, [isActive, onEscape]);

  return <div ref={containerRef}>{children}</div>;
}
