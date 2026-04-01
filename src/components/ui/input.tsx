import type { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...rest
}: InputProps) {
  const hasError = !!error;

  return (
    <div className="w-full">
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? `${rest.id}-error` : helperText ? `${rest.id}-helper` : undefined}
          className={clsx(
            "w-full rounded-xl border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 backdrop-blur-sm transition duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            hasError
              ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/50"
              : "border-white/10 focus:border-emerald-300/50 focus:ring-emerald-300/50",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${rest.id}-error`} className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${rest.id}-helper`} className="mt-1.5 text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
