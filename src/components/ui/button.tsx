import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useState, useCallback } from "react";
import clsx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  cooldownMs?: number;
  showCooldownTimer?: boolean;
}

const variantStyles = {
  primary: "border-emerald-300/20 bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-500 text-slate-950 shadow-[0_10px_30px_rgba(16,185,129,0.22)] hover:from-emerald-200 hover:to-teal-400",
  secondary: "border-slate-600/50 bg-slate-800/80 text-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.3)] hover:bg-slate-700/80",
  outline: "border-emerald-300/40 bg-transparent text-emerald-300 hover:bg-emerald-300/10",
  ghost: "border-transparent bg-transparent text-slate-300 hover:bg-white/5",
  danger: "border-red-400/20 bg-gradient-to-r from-red-400 to-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.22)] hover:from-red-300 hover:to-red-400"
};

const sizeStyles = {
  sm: "px-4 py-2 text-xs min-h-[36px] md:min-h-[36px]", // Touch-friendly minimum height
  md: "px-5 py-2.5 text-sm min-h-[44px]", // Touch-friendly minimum height (44px)
  lg: "px-6 py-3 text-base min-h-[48px]", // Touch-friendly minimum height
  xl: "px-8 py-4 text-lg min-h-[52px]" // Touch-friendly minimum height
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  type = "button",
  cooldownMs = 0,
  showCooldownTimer = false,
  onClick,
  ...rest
}: ButtonProps) {
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const isDisabled = disabled || loading || cooldownRemaining > 0;

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (cooldownRemaining > 0 || loading) return;

    if (onClick) {
      onClick(e);
    }

    if (cooldownMs > 0) {
      setCooldownRemaining(cooldownMs);
      const interval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 100) {
            clearInterval(interval);
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    }
  }, [onClick, cooldownMs, cooldownRemaining, loading]);

  const formatCooldown = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 touch-manipulation",
        variantStyles[variant],
        sizeStyles[size],
        !isDisabled && "hover:translate-y-[-1px]",
        className,
      )}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && cooldownRemaining > 0 && showCooldownTimer && (
        <span className="text-xs opacity-75">{formatCooldown(cooldownRemaining)}</span>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {cooldownRemaining > 0 && showCooldownTimer ? formatCooldown(cooldownRemaining) : children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
}
