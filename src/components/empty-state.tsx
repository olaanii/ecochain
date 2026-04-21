"use client";

import { LucideIcon, Inbox, Search, FileX, AlertCircle, Box } from "lucide-react";

interface EmptyStateProps {
  /** Icon to display - defaults to Inbox */
  icon?: LucideIcon;
  /** Main title text */
  title?: string;
  /** Descriptive text */
  description?: string;
  /** Optional action button or element */
  action?: React.ReactNode;
  /** Variant preset for common use cases */
  variant?: "default" | "search" | "error" | "no-data";
  /** Additional CSS classes */
  className?: string;
}

const variantConfig = {
  default: { icon: Inbox, title: "Nothing here yet", description: "Check back later for updates." },
  search: { icon: Search, title: "No results found", description: "Try adjusting your search terms." },
  error: { icon: AlertCircle, title: "Couldn\'t load data", description: "Something went wrong. Try refreshing." },
  "no-data": { icon: FileX, title: "No data available", description: "There\'s nothing to show right now." },
};

/**
 * EmptyState — Consistent empty/blank state component.
 * 
 * Usage:
 * ```tsx
 * <EmptyState />
 * <EmptyState variant="search" />
 * <EmptyState 
 *   icon={Box}
 *   title="No tasks yet"
 *   action={<Button>Create Task</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  action,
  variant = "default",
  className = "",
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;
  const title = customTitle || config.title;
  const description = customDescription || config.description;

  return (
    <div 
      className={`flex flex-col items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)] p-12 text-center shadow-[var(--shadow-base)] ${className}`}
      role="status"
      aria-label={title}
    >
      <div 
        className="mb-4 rounded-full p-3"
        style={{ backgroundColor: "var(--color-surface-muted)" }}
      >
        <Icon 
          className="h-8 w-8" 
          style={{ color: "var(--color-text-muted)" }}
          aria-hidden="true"
        />
      </div>
      
      <h3 
        className="mb-1 text-base font-semibold"
        style={{ color: "var(--color-text-dark)" }}
      >
        {title}
      </h3>
      
      <p 
        className="mb-4 max-w-xs text-sm"
        style={{ color: "var(--color-text-muted)" }}
      >
        {description}
      </p>
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
