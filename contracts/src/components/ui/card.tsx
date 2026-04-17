import type { ReactNode } from "react";
import clsx from "clsx";

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
  title?: string;
  className?: string;
}

const variantStyles = {
  default: "border-white/10 bg-white/[0.06] shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl",
  elevated: "border-white/20 bg-white/10 shadow-[0_32px_96px_rgba(2,6,23,0.45)] backdrop-blur-2xl",
  outlined: "border-emerald-300/30 bg-transparent shadow-none",
  glass: "border-white/5 bg-gradient-to-br from-white/8 to-white/4 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-2xl"
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-8"
};

export function Card({ 
  variant = 'default',
  padding = 'md',
  children, 
  title, 
  className 
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[1.75rem] border",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
    >
      {title && (
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-200/90">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
