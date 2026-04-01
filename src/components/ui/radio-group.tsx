import type { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  helperText?: string;
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  orientation?: 'vertical' | 'horizontal';
}

export function RadioGroup({
  options,
  value,
  onChange,
  error,
  helperText,
  orientation = 'vertical',
  name,
  disabled,
  className,
  ...rest
}: RadioGroupProps) {
  const hasError = !!error;
  const groupName = name || `radio-group-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("w-full", className)} role="radiogroup" aria-invalid={hasError}>
      <div
        className={clsx(
          "flex gap-4",
          orientation === 'vertical' ? "flex-col" : "flex-row flex-wrap"
        )}
      >
        {options.map((option) => {
          const radioId = `${groupName}-${option.value}`;
          const isDisabled = disabled || option.disabled;
          const isChecked = value === option.value;

          return (
            <div key={option.value} className="flex flex-col">
              <div className="flex items-start gap-3">
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id={radioId}
                    name={groupName}
                    value={option.value}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={clsx(
                      "peer h-5 w-5 cursor-pointer appearance-none rounded-full border bg-slate-900/50 backdrop-blur-sm transition duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950",
                      "checked:border-emerald-400",
                      hasError
                        ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/50"
                        : "border-white/10 focus:border-emerald-300/50 focus:ring-emerald-300/50",
                      isDisabled && "cursor-not-allowed opacity-50"
                    )}
                    {...rest}
                  />
                  <div
                    className={clsx(
                      "pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 opacity-0 transition-opacity",
                      isChecked && "opacity-100"
                    )}
                  />
                </div>
                <label
                  htmlFor={radioId}
                  className={clsx(
                    "cursor-pointer select-none text-sm text-slate-200",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {option.label}
                </label>
              </div>
              {option.helperText && (
                <p className="ml-8 mt-1 text-xs text-slate-400">{option.helperText}</p>
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-2 text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
