"use client";

import React from "react";
import { ImpactShell } from "./impact-shell";
import { 
  Shield, 
  Trash2, 
  Bike, 
  Zap, 
  Search, 
  Activity, 
  Globe, 
  ChevronRight,
  TrendingUp,
  Award,
  Plus,
  ArrowUpRight,
  Recycle,
  Trees,
  Car
} from "lucide-react";
import Image from "next/image";

export function ImpactAnalyticsOverview() {
  return (
    <ImpactShell activeItem="Overview">
      <div className="p-12 max-w-[1400px] flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div className="flex flex-col gap-3">
              <h1 className="text-5xl font-extrabold text-white tracking-tight leading-none uppercase">
                 Impact <span className="text-[#cafd00]">Analytics</span>
              </h1>
              <p className="text-base text-[#adaaaa] leading-relaxed max-w-xl">
                 Real-time visualization of your environmental footprint and on-chain verified contributions to global sustainability goals.
              </p>
           </div>
           
           <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#cafd00] animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-[1.5px]">Network: Mainnet-Void</span>
           </div>
        </div>

        {/* Main Scoreboard Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           
           {/* Centerpiece: Impact Score Gauge */}
           <div className="xl:col-span-8 bg-[#131111] border border-white/5 rounded-[40px] p-12 flex flex-col items-center justify-center gap-12 shadow-2xl relative overflow-hidden group">
              {/* Radial gradient background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(202,253,0,0.03)_0%,transparent_70%)] opacity-100 group-hover:opacity-150 transition-opacity duration-1000" />
              
              <div className="relative flex flex-col items-center">
                 <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-[4px] mb-2">Impact Score</span>
                 <div className="flex items-baseline gap-2">
                    <span className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(202,253,0,0.2)]">842</span>
                    <span className="text-2xl font-bold text-[#adaaaa]">/1000</span>
                 </div>
              </div>

              {/* Functional Gauge Mockup */}
              <div className="relative w-72 h-72">
                 <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    <circle 
                      cx="50" cy="50" r="45" fill="transparent" 
                      stroke="#cafd00" strokeWidth="6" 
                      strokeDasharray="282.7" strokeDashoffset="45"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_15px_rgba(202,253,0,0.4)]"
                    />
                    {/* Tick marks */}
                    {[...Array(6)].map((_, i) => (
                      <circle key={i} cx="50" cy="5" r="1.5" fill="#cafd00" transform={`rotate(${i * 60} 50 50)`} />
                    ))}
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 rounded-full bg-[rgba(202,253,0,0.1)] border border-[#cafd00]/30 flex flex-col items-center justify-center gap-1 shadow-inner group-hover:scale-110 transition-transform">
                       <Shield className="w-6 h-6 text-[#cafd00]" />
                       <span className="text-[8px] font-black text-[#cafd00] uppercase tracking-widest">Elite Tier</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-3 w-full gap-12 border-t border-white/5 pt-12">
                 {[
                   { label: "Carbon Offset", value: "12.4", unit: "tons" },
                   { label: "ECO Earned", value: "2.8k", unit: "vECO" },
                   { label: "Global Rank", value: "#1,402", unit: "" },
                 ].map((stat, i) => (
                   <div key={i} className="flex flex-col items-center gap-1 text-center">
                      <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest leading-none">{stat.label}</span>
                      <div className="flex items-baseline gap-1.5 mt-2">
                         <span className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</span>
                         {stat.unit && <span className="text-xs font-bold text-[#adaaaa] uppercase">{stat.unit}</span>}
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Metrics Small Cards */}
           <div className="xl:col-span-4 flex flex-col gap-6">
              {[
                { 
                  label: "Waste Diverted", 
                  title: "428.5 kg", 
                  icon: <Trash2 className="w-4 h-4" />, 
                  badge: "+12% WoW", 
                  badgeColor: "text-[#cafd00]",
                  color: "bg-[#cafd00]"
                },
                { 
                  label: "Zero-Emission Distance", 
                  title: "1,240 km", 
                  icon: <Bike className="w-4 h-4" />, 
                  badge: "Lv. 4", 
                  badgeColor: "text-white",
                  color: "bg-white/10"
                },
                { 
                  label: "Energy Generated", 
                  title: "84.2 kWh", 
                  icon: <Zap className="w-4 h-4" />, 
                  sub: "HASH: 0x8a2...f3b9 verified by solar-node-04",
                  color: "bg-[#cafd00]/40"
                }
              ].map((metric, i) => (
                <div key={i} className="bg-[#131111] border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-xl hover:bg-white/[0.02] transition-all group cursor-pointer">
                   <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#cafd00]/30 transition-colors">
                        {metric.icon}
                      </div>
                      {metric.badge && (
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-white/10 bg-white/5 ${metric.badgeColor}`}>
                           {metric.badge}
                        </span>
                      )}
                   </div>
                   <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">{metric.label}</span>
                      <span className="text-3xl font-extrabold text-white tracking-tight">{metric.title}</span>
                      <div className="h-1 w-full bg-black rounded-full overflow-hidden mt-2">
                         <div className={`h-full rounded-full ${metric.color}`} style={{ width: "65%" }} />
                      </div>
                      {metric.sub && <p className="text-[9px] font-mono text-[#494847] uppercase mt-2">{metric.sub}</p>}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Recent Contributions Section */}
        <section className="bg-[#131111] border border-white/5 rounded-[40px] p-10 flex flex-col gap-10 shadow-2xl">
           <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                 <h3 className="text-2xl font-extrabold text-white tracking-tight">Recent Contributions</h3>
                 <p className="text-xs text-[#adaaaa] font-medium tracking-tight">Real-time ledger of your eco-actions</p>
              </div>
              <button className="text-[10px] font-bold text-white uppercase tracking-widest hover:text-[#cafd00] transition-colors border-b border-white/10 pb-1">
                 View All Ledger
              </button>
           </div>

           <div className="flex flex-col gap-4">
              {[
                { label: "Verified Plastic Recycling", sub: "Local center #402 • 12.5 kg recovered", score: "+45 vECO", time: "2 hours ago", icon: <Recycle className="w-4 h-4 text-[#cafd00]" /> },
                { label: "EV Charging Network Usage", sub: "ChargePoint Node #12 • 40kWh delivered", score: "+120 vECO", time: "Yesterday", icon: <Car className="w-4 h-4 text-white" /> },
                { label: "Amazon Reforestation NFT", sub: "Minted via Impact Vault • 2 trees secured", score: "+350 vECO", time: "3 days ago", icon: <Trees className="w-4 h-4 text-[#cafd00]" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-black border border-white/5 hover:border-[#cafd00]/20 transition-all cursor-pointer group">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-[#cafd00]/10 transition-all">
                        {item.icon}
                      </div>
                      <div className="flex flex-col gap-1">
                         <h5 className="text-base font-extrabold text-white tracking-tight">{item.label}</h5>
                         <span className="text-[10px] font-medium text-[#494847] uppercase tracking-wide">{item.sub}</span>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-lg font-black text-white tracking-tight leading-none group-hover:text-[#cafd00] transition-colors">{item.score}</span>
                      <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">{item.time}</span>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Promo / Banner Section */}
        <section className="bg-black border border-white/10 rounded-[40px] p-10 lg:p-14 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-12 group shadow-[0_0_50px_rgba(202,253,0,0.05)]">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1500&auto=format&fit=crop')] bg-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-[2000ms]" />
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
           
           <div className="relative flex flex-col gap-4 max-w-2xl">
              <span className="text-[10px] font-bold text-[#cafd00] uppercase tracking-[3px]">Exclusive Reward Unlocked</span>
              <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">
                 Access the Genesis Void Marketplace
              </h3>
              <p className="text-base text-[#adaaaa] font-medium tracking-tight">
                 Your Impact Score has reached the Elite Tier. Claim your exclusive Genesis Vault NFT to unlock zero-fee trading.
              </p>
           </div>

           <div className="relative flex items-center gap-4">
              <button className="bg-[#cafd00] text-[#3a4a00] px-10 py-5 rounded-2xl text-sm font-extrabold uppercase tracking-[1.5px] shadow-[0_0_30px_rgba(202,253,0,0.3)] hover:scale-105 transition-all">
                 Claim NFT Pass
              </button>
              <button className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl text-sm font-extrabold uppercase tracking-[1.5px] hover:bg-white/10 transition-all">
                 Dismiss
              </button>
           </div>
        </section>

      </div>
    </ImpactShell>
  );
}
