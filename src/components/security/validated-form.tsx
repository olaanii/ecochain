import { useState, useCallback } from "react";
import { z, ZodSchema } from "zod";
import { AlertCircle, CheckCircle } from "lucide-react";
import { clsx } from "clsx";

interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          "w-full rounded-lg border bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100",
          "placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-emerald-300/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-red-500/50 focus:ring-red-300/50"
            : "border-slate-600/50 focus:border-emerald-300/50"
        )}
      />
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface ValidatedFormProps<T extends z.ZodType<any, any>> {
  schema: T;
  initialValues: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  children: (props: {
    values: z.infer<T>;
    errors: Partial<Record<keyof z.infer<T>, string>>;
    touched: Partial<Record<keyof z.infer<T>, boolean>>;
    handleChange: (field: keyof z.infer<T>, value: any) => void;
    handleBlur: (field: keyof z.infer<T>) => void;
    isSubmitting: boolean;
    isValid: boolean;
  }) => React.ReactNode;
  className?: string;
}

export function ValidatedForm<T extends z.ZodType<any, any>>({
  schema,
  initialValues,
  onSubmit,
  children,
  className,
}: ValidatedFormProps<T>) {
  const [values, setValues] = useState<z.infer<T>>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof z.infer<T>, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof z.infer<T>, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (field: keyof z.infer<T>, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      
      // Validate field on change if already touched
      if (touched[field]) {
        const fieldSchema = z.object({ [field as string]: (schema as any).shape[field as string] });
        try {
          fieldSchema.parse({ [field]: value });
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        } catch (err) {
          if (err instanceof z.ZodError) {
            setErrors((prev) => ({
              ...prev,
              [field]: err.errors[0]?.message || "Invalid value",
            }));
          }
        }
      }
    },
    [schema, touched]
  );

  const handleBlur = useCallback(
    (field: keyof z.infer<T>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      
      const fieldSchema = z.object({ [field as string]: (schema as any).shape[field as string] });
      try {
        fieldSchema.parse({ [field]: values[field] });
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [field]: err.errors[0]?.message || "Invalid value",
          }));
        }
      }
    },
    [schema, values]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const validatedData = schema.parse(values);
        await onSubmit(validatedData);
        setErrors({});
        setTouched({});
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldErrors: Partial<Record<keyof z.infer<T>, string>> = {};
          err.errors.forEach((error) => {
            const field = error.path[0] as keyof z.infer<T>;
            fieldErrors[field] = error.message;
          });
          setErrors(fieldErrors);
          
          // Mark all fields with errors as touched
          const touchedFields: Partial<Record<keyof z.infer<T>, boolean>> = {};
          Object.keys(fieldErrors).forEach((key) => {
            touchedFields[key as keyof z.infer<T>] = true;
          });
          setTouched(touchedFields);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [schema, values, onSubmit]
  );

  const isValid = Object.keys(errors).length === 0;

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
        isValid,
      })}
    </form>
  );
}

interface FormSuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function FormSuccessMessage({ message, onDismiss }: FormSuccessMessageProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
      <div className="flex-1">
        <p className="text-sm text-emerald-300">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-300"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface FormErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function FormErrorMessage({ message, onDismiss }: FormErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
      <div className="flex-1">
        <p className="text-sm text-red-300">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-300"
        >
          ×
        </button>
      )}
    </div>
  );
}
