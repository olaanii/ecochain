import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto -mx-4 px-4", className)}>
      <table className="w-full min-w-[600px]">{children}</table>
    </div>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
}

export function TableCell({ children, className, header = false }: TableCellProps) {
  const baseClass = header
    ? "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-secondary-alt)]"
    : "px-4 py-3 text-sm text-[var(--color-text-dark)] border-t border-[var(--color-border)]";
  
  return (
    <td className={cn(baseClass, className)}>{children}</td>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn("border-b border-[var(--color-border)]", className)}>
      {children}
    </thead>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        "hover:bg-[var(--color-secondary-alt)]/50 transition-colors cursor-pointer",
        onClick && "active:bg-[var(--color-secondary-alt)]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
