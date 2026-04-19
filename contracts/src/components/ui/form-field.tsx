import type { ReactNode } from "react";
import clsx from "clsx";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  helperText,
  children,
  className
}: FormFieldProps) {
  const hasError = !!error;

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          {label}
          {required && <span className="ml-1 text-red-400" aria-label="required">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
