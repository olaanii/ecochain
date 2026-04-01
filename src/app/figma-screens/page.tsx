import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Figma Screens - EcoChain",
  description: "Browse all implemented Figma designs for the EcoChain platform.",
};

const screens = [
  {
    id: "ai-coach",
    title: "AI Coach: Aura Hub",
    description: "Neural network insights and personalized recommendations",
    category: "AI",
  },
  {
    id: "efficiency-score",
    title: "Efficiency Score Card",
    description: "Real-time analytics dashboard with performance metrics",
    category: "Analytics",
  },
  {
    id: "achievements",
    title: "Achievement Gallery",
    description: "Badge system with environmental achievements",
    category: "Gamification",
  },
  {
    id: "daily-missions",
    title: "Daily Missions",
    description: "Mission grid with environmental tasks",
    category: "Tasks",
  },
  {
    id: "goal-setting",
    title: "Goal Setting",
    description: "Impact calibration with interactive sliders",
    category: "Planning",
  },
  {
    id: "action-optimization",
    title: "Action Optimization",
    description: "AI recommendations for maximum impact",
    category: "AI",
  },
  {
    id: "earnings-ledger",
    title: "ECO Earnings Ledger",
    description: "Transaction ledger with proof verification",
    category: "Finance",
  },
  {
    id: "impact-comparison",
    title: "Impact Comparison",
    description: "Global rankings and performance comparison",
    category: "Social",
  },
  {
    id: "personal-dashboard",
    title: "Personal Impact Dashboard",
    description: "Main analytics with circular gauge",
    category: "Analytics",
  },
  {
    id: "co2-breakdown",
    title: "CO2 Offset Breakdown",
    description: "Carbon offset analytics with charts",
    category: "Analytics",
  },
  {
    id: "guild-hub",
    title: "Guild Hub",
    description: "Discover and join environmental collectives",
    category: "Social",
  },
  {
    id: "establish-guild",
    title: "Establish Guild",
    description: "Create and configure your own guild",
    category: "Social",
  },
  {
    id: "impact-leaderboard",
    title: "Impact Leaderboard",
    description: "Squad rankings and competitive visualization",
    category: "Social",
  },
  {
    id: "squad-hub",
    title: "Squad Hub",
    description: "Active operations and mission dashboard",
    category: "Operations",
  },
  {
    id: "general-forum",
    title: "General Forum",
    description: "DAO governance and policy discussions",
    category: "Governance",
  },
  {
    id: "operator-terminal",
    title: "Operator Terminal",
    description: "Technical support and hardware integration",
    category: "Support",
  },
  {
    id: "messages",
    title: "Messages",
    description: "Encrypted peer-to-peer communication",
    category: "Communication",
  },
  {
    id: "guild-treasury",
    title: "Guild Treasury",
    description: "Financial management and spending proposals",
    category: "Finance",
  },
  {
    id: "operator-profile",
    title: "Operator Profile",
    description: "Individual operator stats and achievements",
    category: "Profile",
  },
  {
    id: "operations-calendar",
    title: "Operations Calendar",
    description: "Event scheduling and governance syncs",
    category: "Planning",
  },
];

export default function FigmaScreensIndex() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold text-white">Figma Screens</h1>
        <p className="text-slate-300">
          Browse all 20 implemented designs from the EcoChain Figma file. Each screen follows
          the project's design system with consistent styling and components.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {screens.map((screen) => (
          <Link key={screen.id} href={`/figma-screens/${screen.id}`}>
            <Card className="transition-all hover:border-emerald-400/30 hover:bg-white/8">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-white">{screen.title}</h2>
                  <Badge>{screen.category}</Badge>
                </div>
                <p className="text-sm text-slate-400">{screen.description}</p>
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <span>View screen</span>
                  <span>→</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
