"use client";

import { useEffect } from "react";
import { useUserRole } from "@/hooks/use-user-role";

/**
 * RoleThemeWrapper — applies role-specific data attributes for CSS theming.
 * 
 * This component sets `data-role` on the document element, which allows
 * the design tokens CSS to apply role-specific color overrides.
 * 
 * Usage: Wrap around your app content, typically in the root layout.
 */
interface RoleThemeWrapperProps {
  children: React.ReactNode;
}

export function RoleThemeWrapper({ children }: RoleThemeWrapperProps) {
  const { role, isLoaded } = useUserRole();

  useEffect(() => {
    if (!isLoaded) return;
    
    const root = window.document.documentElement;
    
    // Set the data-role attribute for CSS theming
    root.setAttribute("data-role", role);
    
    return () => {
      // Cleanup: remove the attribute on unmount
      root.removeAttribute("data-role");
    };
  }, [role, isLoaded]);

  return <>{children}</>;
}
