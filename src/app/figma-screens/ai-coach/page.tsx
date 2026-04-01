import type { Metadata } from "next";
import { AICoach } from "@/components/figma/ai-coach";

export const metadata: Metadata = {
  title: "AI Coach: Aura Hub - EcoChain",
  description: "Your personal AI assistant analyzes patterns and suggests optimized eco-actions for maximum impact.",
};

export default function AICoachPage() {
  return <AICoach />;
}
