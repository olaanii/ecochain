import type { ReactNode } from "react";
import { Navigation } from "./navigation";

export interface FigmaScreenLayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
  showNavigation?: boolean;
}

export function FigmaScreenLayout({
  title,
  description,
  children,
  showNavigation = true
}: FigmaScreenLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {showNavigation && <Navigation title={title} subtitle={description} />}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
