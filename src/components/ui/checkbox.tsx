import type { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
  helperText?: string;
}

export function Checkbox({
  label,
  error,
  helperText,
  className,
  disabled,
  id,
  ...rest
}: CheckboxProps) {
  const hasError = !!error;
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
            className={clsx(
              "peer h-5 w-5 cursor-pointer appearance-none rounded-md border bg-slate-900/50 backdrop-blur-sm transition duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950",
              "checked:border-emerald-400 checked:bg-emerald-400",
              hasError
                ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/50"
                : "border-white/10 focus:border-emerald-300/50 focus:ring-emerald-300/50",
              disabled && "cursor-not-allowed opacity-50",
              className
            )}
            {...rest}
          />
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-slate-950 opacity-0 transition-opacity peer-checked:opacity-100"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className={clsx(
              "cursor-pointer select-none text-sm text-slate-200",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p id={`${checkboxId}-error`} className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${checkboxId}-helper`} className="mt-1.5 text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
