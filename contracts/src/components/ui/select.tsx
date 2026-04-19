import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export function Select({
  options,
  error,
  helperText,
  placeholder,
  className,
  disabled,
  ...rest
}: SelectProps) {
  const hasError = !!error;

  return (
    <div className="w-full">
      <div className="relative">
        <select
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? `${rest.id}-error` : helperText ? `${rest.id}-helper` : undefined}
          className={clsx(
            "w-full appearance-none rounded-xl border bg-slate-900/50 px-4 py-2.5 pr-10 text-sm text-slate-100 backdrop-blur-sm transition duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950",
            hasError
              ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/50"
              : "border-white/10 focus:border-emerald-300/50 focus:ring-emerald-300/50",
            disabled && "cursor-not-allowed opacity-50",
            !rest.value && "text-slate-500",
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-slate-900 text-slate-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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
