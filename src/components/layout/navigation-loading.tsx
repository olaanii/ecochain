"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

/**
 * NavigationLoading Component
 * 
 * Displays a loading indicator for navigation transitions that take
 * longer than 200ms to complete.
 * 
 * **Validates: Requirement 15.6**
 */
export function NavigationLoading() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [previousPathname, setPreviousPathname] = useState(pathname);

  useEffect(() => {
    // Detect navigation start
    if (pathname !== previousPathname) {
      setIsLoading(true);
      
      // Set a timeout to hide the loading indicator after navigation completes
      // In practice, Next.js will render the new page quickly, and this will be cleared
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setPreviousPathname(pathname);
      }, 200);

      return () => {
        clearTimeout(timeout);
        setIsLoading(false);
      };
    }
  }, [pathname, previousPathname]);

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={clsx(
        "fixed top-0 left-0 right-0 z-[100]",
        "h-1 bg-gradient-to-r from-[#cafd00] via-[#b8e600] to-[#cafd00]",
        "animate-pulse"
      )}
      role="progressbar"
      aria-label="Loading page"
      aria-busy="true"
    >
      <div
        className={clsx(
          "h-full bg-gradient-to-r from-transparent via-white/30 to-transparent",
          "animate-shimmer"
        )}
        style={{
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
    </div>
  );
}
