import Link from "next/link";
import { ArrowRight, Gift, ShoppingBag, Store } from "lucide-react";

import { ProductShell } from "@/components/layout/product-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fallbackDashboard } from "@/lib/dashboard-data";

const merchantStats = [
  {
    label: "Partner brands",
    value: "28",
    detail: "Local and regional merchants redeeming on-chain rewards.",
  },
  {
    label: "Redemption completion",
    value: "97.4%",
    detail: "Operators can trace payout, inventory, and delivery from one flow.",
  },
  {
    label: "Average basket",
    value: "84 ECO",
    detail: "High-intent users convert rewards into practical climate-friendly value.",
  },
];

export default function MerchantsPage() {
  const featuredRewards = fallbackDashboard.rewards.slice(0, 4);

  return (
    <ProductShell
      title="Merchant network"
      subtitle="A cleaner SaaS marketplace for redemptions, partner inventory, and appchain-native reward circulation."
    >
      <div className="space-y-8">
        <section className="surface overflow-hidden rounded-[2rem] px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <Badge>Merchant ops</Badge>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Keep redemption, settlement, and partner visibility inside the same product.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  The merchant experience now reads like a premium operations surface instead of a
                  placeholder route. Operators can monitor inventory, highlight sustainable offers,
                  and keep reward circulation tightly tied to real-world impact.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/merchants/hub-main">
                  <Button>
                    Open merchant hub
                    <ArrowRight size={15} />
                  </Button>
                </Link>
                <Link href="/merchants/redemption">
                  <Button variant="outline">
                    Review redemption flow
                    <Gift size={15} />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {merchantStats.map((stat) => (
                <Card key={stat.label}>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{stat.value}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{stat.detail}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card title="Featured catalog" className="h-full">
            <div className="grid gap-4 md:grid-cols-2">
              {featuredRewards.map((reward) => (
                <article
                  key={reward.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                      <ShoppingBag size={18} />
                    </span>
                    <Badge>{reward.cost} ECO</Badge>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{reward.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{reward.subtitle}</p>
                  <p className="mt-4 text-sm font-medium text-emerald-300">{reward.partner}</p>
                </article>
              ))}
            </div>
          </Card>

          <Card title="Operator notes">
            <div className="space-y-4">
              {[
                "Redemptions flow directly from verified ECO balances into partner inventory.",
                "Merchant teams can launch seasonal campaigns without redesigning the fulfillment layer.",
                "Appchain-owned fees make repeat redemption activity an engine for treasury growth.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100">
                      <Store size={16} />
                    </span>
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </ProductShell>
  );
}
