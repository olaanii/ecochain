import type { ReactNode } from "react";
import { Navigation, TopNavigation } from "@/components/figma/shared/navigation";

interface FigmaScreensLayoutProps {
  children: ReactNode;
}

export default function FigmaScreensLayout({ children }: FigmaScreensLayoutProps) {
  return (
    <>
      <TopNavigation searchPlaceholder="Search screens..." />
      <Navigation title="EcoChain Screens" subtitle="Figma Designs" />
      <div className="ml-64 pt-20">
        {children}
      </div>
    </>
  );
}