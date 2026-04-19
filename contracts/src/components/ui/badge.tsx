import type { ReactNode } from "react";
import clsx from "clsx";

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  default: "border-emerald-300/20 bg-white/8 text-emerald-100",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  error: "border-red-400/30 bg-red-400/10 text-red-300",
  warning: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  info: "border-blue-400/30 bg-blue-400/10 text-blue-300"
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
