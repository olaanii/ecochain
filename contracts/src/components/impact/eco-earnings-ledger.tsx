"use client";

import React from "react";
import { ImpactShell } from "./impact-shell";
import { 
  History, 
  ExternalLink, 
  ChevronDown, 
  Wallet, 
  TrendingUp, 
  Zap, 
  Recycle, 
  Trees, 
  Droplets,
  ArrowRight,
  Filter
} from "lucide-react";
import Image from "next/image";

export function EcoEarningsLedger() {
  const tabs = [
    { label: "All Proofs", active: true },
    { label: "Validated", active: false },
    { label: "Processing", active: false },
  ];

  const earnings = [
    {
      title: "Solar Array Verification",
      sub: "Block #14,293,021 • Sector 7G",
      timestamp: "2023.10.24 14:22",
      reward: "+450.00 ECO",
      icon: <Zap className="w-5 h-5 text-[#cafd00]" />,
    },
    {
      title: "Polymer Reclamation",
      sub: "Batch-ID: NEON-9902 • 12kg Processed",
      timestamp: "2023.10.24 11:05",
      reward: "+125.40 ECO",
      icon: <Recycle className="w-5 h-5 text-[#ff7351]" />,
    },
    {
      title: "Urban Canopy Expansion",
      sub: "Satellite Sync: L-32 • Node #422",
      timestamp: "2023.10.23 23:59",
      reward: "+88.00 ECO",
      icon: <Trees className="w-5 h-5 text-[#4ade80]" />,
    },
    {
      title: "Hydro-Filtration Proof",
      sub: "Flow Analysis • Station Delta-V",
      timestamp: "2023.10.23 18:40",
      reward: "+210.15 ECO",
      icon: <Droplets className="w-5 h-5 text-white/40" />,
    }
  ];

  return (
    <ImpactShell activeItem="Earnings">
      <div className="p-12 max-w-[1400px] flex flex-col gap-10">
        
        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
           <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                 <div className="h-0.5 w-10 bg-[#cafd00]" />
                 <span className="text-[10px] font-black text-[#adaaaa] uppercase tracking-[3px]">Ledger Overview</span>
              </div>
              <div className="flex flex-col gap-3">
                 <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
                    ECO Earnings <span className="text-[#494847]">Ledger</span>
                 </h1>
                 <p className="text-base text-[#adaaaa] font-medium leading-relaxed max-w-xl">
                    Track every cryptographically verified proof-of-impact. Earnings are processed in real-time and settled on the NeonVoid substrate.
                 </p>
              </div>
           </div>

           <div className="flex gap-4">
              <div className="bg-[#131111] border border-white/5 rounded-2xl p-6 min-w-[200px] flex flex-col gap-2 shadow-xl group hover:border-[#cafd00]/30 transition-all">
                 <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">Unclaimed Rebates</span>
                 <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white tracking-tight">1,240.50</span>
                    <span className="text-sm font-bold text-[#cafd00]">ECO</span>
                 </div>
                 <div className="flex items-center gap-1.5 mt-1 opacity-60">
                    <History className="w-3 h-3 text-[#adaaaa] animate-spin-slow" />
                    <span className="text-[8px] font-bold text-[#adaaaa] uppercase tracking-widest">Pending Validation</span>
                 </div>
              </div>
              <div className="bg-[#131111] border border-white/5 rounded-2xl p-6 min-w-[200px] flex flex-col gap-2 shadow-xl group hover:border-[#cafd00]/30 transition-all">
                 <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">Lifetime Earnings</span>
                 <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white tracking-tight">42.8k</span>
                    <span className="text-sm font-bold text-[#adaaaa]">ECO</span>
                 </div>
                 <div className="flex items-center gap-1.5 mt-1">
                    <TrendingUp className="w-3 h-3 text-[#4ade80]" />
                    <span className="text-[8px] font-bold text-[#4ade80] uppercase tracking-widest">+12.4% vs Last Cycle</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Tab Navigation & Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="flex gap-10">
              {tabs.map((tab) => (
                <button 
                  key={tab.label}
                  className={`relative pb-4 text-xs font-black uppercase tracking-widest transition-all ${
                    tab.active ? "text-white" : "text-[#494847] hover:text-white"
                  }`}
                >
                   {tab.label}
                   {tab.active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#cafd00]" />}
                </button>
              ))}
           </div>
           
           <button className="flex items-center gap-2 text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest hover:text-white transition-all">
              <Filter className="w-3.5 h-3.5" />
              Sort by: Newest
              <ChevronDown className="w-3.5 h-3.5" />
           </button>
        </div>

        {/* Earnings List */}
        <div className="flex flex-col gap-3">
           {earnings.map((tx, i) => (
             <div key={i} className="bg-[#131111] border border-white/5 rounded-2xl p-8 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-pointer group">
                <div className="flex items-center gap-8">
                   <div className="w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center group-hover:bg-[#cafd00]/10 transition-all">
                      {tx.icon}
                   </div>
                   <div className="flex flex-col gap-1">
                      <h4 className="text-lg font-black text-white tracking-tight">{tx.title}</h4>
                      <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">{tx.sub}</span>
                   </div>
                </div>

                <div className="hidden lg:flex flex-col items-center gap-1 text-center">
                   <span className="text-[8px] font-bold text-[#494847] uppercase tracking-widest">Timestamp</span>
                   <span className="text-xs font-mono text-white/80">{tx.timestamp}</span>
                </div>

                <div className="flex items-center gap-12">
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[8px] font-bold text-[#494847] uppercase tracking-widest">Reward</span>
                      <span className="text-xl font-black text-white tracking-tighter group-hover:text-[#cafd00] transition-colors">{tx.reward}</span>
                   </div>
                   <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#adaaaa] hover:bg-white/10 hover:text-white transition-all">
                      View Proof
                      <ExternalLink className="w-3 h-3" />
                   </button>
                </div>
             </div>
           ))}
           
           <button className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-[#494847] uppercase tracking-widest hover:text-white py-10 transition-colors">
              Load More Ledger Data
              <ChevronDown className="w-4 h-4 ml-1" />
           </button>
        </div>

        {/* Upsell / Banner */}
        <section className="bg-gradient-to-br from-[#1c1c1c] to-[#0e0e0e] border border-white/10 rounded-[40px] p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-16 shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(202,253,0,0.05)_0%,transparent_60%)]" />
           
           <div className="flex-1 flex flex-col gap-8 relative z-10">
              <h3 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                 Boost Your Impact Multiplier
              </h3>
              <p className="text-lg text-[#adaaaa] font-medium leading-relaxed max-w-lg">
                 Stake your ECO tokens to unlock tiered rewards and 2x governance weight on protocol upgrades.
              </p>
              
              <div className="flex gap-4">
                 <button className="bg-[#cafd00] text-[#3a4a00] px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                    Start Staking
                 </button>
                 <button className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    View Tiers
                 </button>
              </div>
           </div>

           <div className="w-full lg:w-[460px] h-[340px] relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl group">
              <Image 
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1500&auto=format&fit=crop" 
                alt="Impact Cube" 
                fill
                className="object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-[3000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
           </div>
        </section>

      </div>
    </ImpactShell>
  );
}
