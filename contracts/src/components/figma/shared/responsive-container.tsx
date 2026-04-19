import type { ReactNode } from "react";
import clsx from "clsx";

export interface ResponsiveContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

const maxWidthStyles = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full"
};

const paddingStyles = {
  none: "px-0",
  sm: "px-4 md:px-6",
  md: "px-6 md:px-8 lg:px-12",
  lg: "px-8 md:px-12 lg:px-16"
};

export function ResponsiveContainer({
  maxWidth = 'xl',
  padding = 'md',
  children,
  className
}: ResponsiveContainerProps) {
  return (
    <div
      className={clsx(
        "mx-auto w-full",
        maxWidthStyles[maxWidth],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
