import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, ShieldCheck, UploadCloud } from "lucide-react";

import { ProductShell } from "@/components/layout/product-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fallbackDashboard } from "@/lib/dashboard-data";

type VerificationPageProps = {
  searchParams: Promise<{ taskId?: string }>;
};

export default async function VerificationPage({ searchParams }: VerificationPageProps) {
  const params = await searchParams;
  const selectedTask =
    fallbackDashboard.tasks.find((task) => task.id === params.taskId) ?? fallbackDashboard.tasks[0];

  return (
    <ProductShell
      title="Verification center"
      subtitle="A cleaner proof workflow for image capture, oracle checks, and reward issuance."
    >
      <div className="space-y-8">
        <section className="surface overflow-hidden rounded-[2rem] px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <Badge>Proof workflow</Badge>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Guide users from real-world evidence to trusted on-chain reward events.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  Verification now behaves like a proper product surface: one selected mission,
                  one proof checklist, and one clear outcome path into operator approval or reward
                  minting.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/verification/camera">
                  <Button>
                    Open capture flow
                    <Camera size={15} />
                  </Button>
                </Link>
                <Link href="/verification/status">
                  <Button variant="outline">
                    Review live status
                    <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </div>

            <Card title="Selected mission">
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold text-white">{selectedTask.name}</h3>
                    <Badge>{selectedTask.category}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {selectedTask.description}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                    Verification hint
                  </p>
                  <p className="mt-3 text-sm leading-6 text-emerald-300">
                    {selectedTask.verificationHint}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                      Base reward
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {selectedTask.baseReward} INITIA
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                      Multiplier
                    </p>
                    <p className="mt-3 text-xl font-semibold text-emerald-300">
                      x{selectedTask.bonusMultiplier.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Capture evidence",
              description: "Guide the user through image, sensor, or witness-based input with a single mission context.",
              icon: Camera,
            },
            {
              title: "Run oracle checks",
              description: "Fraud screening and confidence scoring happen before rewards are surfaced to operators.",
              icon: ShieldCheck,
            },
            {
              title: "Approve and mint",
              description: "Verified submissions move into reward issuance, bridge readiness, and downstream redemption.",
              icon: CheckCircle2,
            },
          ].map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.title}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
              </Card>
            );
          })}
        </section>

        <Card title="Recommended proof channels">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Camera capture for field evidence and transit artifacts.",
              "Weight and device readings for recycling or energy verification.",
              "Manual review queues for edge cases and conflict resolution.",
            ].map((channel) => (
              <div
                key={channel}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-slate-100">
                    <UploadCloud size={16} />
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{channel}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ProductShell>
  );
}
