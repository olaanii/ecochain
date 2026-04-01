"use client";

import React from "react";
import { ImpactShell } from "./impact-shell";
import { 
  Globe, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Users, 
  ChevronRight,
  ArrowUpRight,
  AlertCircle,
  Map,
  Zap,
  CheckCircle2
} from "lucide-react";

export function GlobalImpactComparison() {
  return (
    <ImpactShell activeItem="Rankings">
      <div className="p-12 max-w-[1400px] flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-3">
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Social Benchmarking</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#cafd00] animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Real-time Data</span>
           </div>
           
           <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-10 gap-8">
              <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
                 Global <span className="text-[#cafd00]">Impact</span> Comparison
              </h1>
              
              <div className="flex gap-4">
                 <div className="bg-[#131111] border border-white/5 rounded-2xl p-5 min-w-[160px] flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">Region</span>
                    <span className="text-base font-extrabold text-white">Scandinavia Node</span>
                 </div>
                 <div className="bg-[#131111] border border-white/5 rounded-2xl p-5 min-w-[160px] flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">Verification</span>
                    <span className="text-base font-extrabold text-[#cafd00]">On-Chain High</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           
           {/* Main Performance Chart */}
           <div className="xl:col-span-8 bg-[#131111] border border-white/5 rounded-[40px] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-extrabold text-white leading-tight uppercase">Performance vs. Neutral Baseline</h3>
                    <p className="text-xs text-[#adaaaa] font-medium tracking-tight">Tracking 12-month trailing carbon offset efficiency</p>
                 </div>
                 <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-[#cafd00]" />
                       <span className="text-white">You</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                       <span className="text-[#494847]">Baseline</span>
                    </div>
                 </div>
              </div>

              {/* Bar Chart Mockup */}
              <div className="relative h-64 flex items-end gap-3 px-4">
                 <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-white/10 z-0 flex items-center justify-start">
                    <span className="bg-[#131111] pr-3 text-[8px] font-bold text-[#494847] uppercase tracking-widest leading-none">Carbon Neutral Target</span>
                 </div>
                 
                 {[
                   { h: 30, active: false },
                   { h: 40, active: false },
                   { h: 35, active: false },
                   { h: 55, active: true, peak: true },
                   { h: 45, active: true },
                   { h: 65, active: true },
                   { h: 70, active: true },
                   { h: 68, active: true },
                   { h: 75, active: true },
                 ].map((bar, i) => (
                   <div key={i} className="flex-1 relative group flex flex-col justify-end">
                      {bar.peak && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#cafd00] text-[#3a4a00] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest leading-none">Peak</div>
                      )}
                      <div className={`w-full rounded-t-lg transition-all duration-500 ${
                        bar.active ? "bg-[#cafd00] shadow-[0_0_20px_rgba(202,253,0,0.2)]" : "bg-white/5"
                      }`} style={{ height: `${bar.h}%` }} />
                   </div>
                 ))}
              </div>

              <div className="flex justify-between px-8 text-[9px] font-bold text-[#494847] uppercase tracking-widest">
                 <span>Jan</span>
                 <span>Mar</span>
                 <span>May</span>
                 <span>Jul</span>
                 <span>Sep</span>
                 <span>Nov</span>
              </div>
           </div>

           {/* Operator Status Sidebar */}
           <div className="xl:col-span-4 bg-gradient-to-br from-[#1c1c1c] to-[#131111] border border-white/5 rounded-[40px] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[rgba(202,253,0,0.05)] blur-[80px] rounded-full" />
              
              <div className="relative flex flex-col items-center gap-8">
                 <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#cafd00] border-t-transparent -rotate-45 drop-shadow-[0_0_15px_rgba(202,253,0,0.3)]" />
                    <div className="flex flex-col items-center leading-none">
                       <span className="text-6xl font-black text-white tracking-tighter">98</span>
                       <span className="text-lg font-bold text-[#cafd00]">%</span>
                    </div>
                 </div>

                 <div className="flex flex-col items-center text-center gap-3">
                    <h3 className="text-3xl font-extrabold text-white tracking-tight uppercase">Top Tier Operator</h3>
                    <p className="text-xs text-[#adaaaa] font-medium leading-relaxed max-w-[240px]">
                       You are in the top 2% of sustainable contributors in the Stockholm Metropolitan area.
                    </p>
                 </div>

                 <div className="grid grid-cols-2 w-full gap-4 mt-4">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-1 group-hover:border-[#cafd00]/30 transition-colors">
                       <span className="text-[20px] font-black text-white leading-none tracking-tight">12th</span>
                       <span className="text-[8px] font-bold text-[#494847] uppercase tracking-widest">City Rank</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-1 group-hover:border-[#cafd00]/30 transition-colors">
                       <span className="text-[20px] font-black text-white leading-none tracking-tight">#4,209</span>
                       <span className="text-[8px] font-bold text-[#494847] uppercase tracking-widest">Global Rank</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Average Benchmarking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-[#131111] border border-white/5 rounded-[40px] p-10 flex flex-col gap-10 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                 <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                    <Globe className="w-6 h-6 text-[#cafd00]" />
                 </div>
                 <span className="px-2 py-0.5 rounded bg-[#ff7351]/10 text-[#ff7351] text-[8px] font-black uppercase tracking-widest border border-[#ff7351]/20">Warning</span>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">Global Average</span>
                 <span className="text-4xl font-black text-white tracking-tight leading-none uppercase">4.8 tons</span>
                 <div className="h-2 w-full bg-black rounded-full mt-4 overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-[#ff7351] rounded-full" style={{ width: "85%" }} />
                 </div>
                 <p className="text-[10px] text-[#adaaaa] font-medium leading-relaxed mt-4 max-w-sm">
                    The global average carbon footprint per operator exceeds sustainable thresholds by <span className="text-[#ff7351] font-bold">15%</span>.
                 </p>
              </div>
           </div>

           <div className="bg-[#131111] border border-white/5 rounded-[40px] p-10 flex flex-col gap-10 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                 <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-[#cafd00]">
                    <MapPin className="w-6 h-6" />
                 </div>
                 <span className="px-2 py-0.5 rounded bg-[#cafd00]/10 text-[#cafd00] text-[8px] font-black uppercase tracking-widest border border-[#cafd00]/20">Optimal</span>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">Local Average</span>
                 <span className="text-4xl font-black text-white tracking-tight leading-none uppercase">2.1 tons</span>
                 <div className="h-2 w-full bg-black rounded-full mt-4 overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-[#cafd00] rounded-full" style={{ width: "30%" }} />
                 </div>
                 <p className="text-[10px] text-[#adaaaa] font-medium leading-relaxed mt-4 max-w-sm">
                    Scandinavia Node maintaining <span className="text-[#cafd00] font-bold">60%</span> higher efficiency than global standard.
                 </p>
              </div>
           </div>
        </div>

        {/* Top Operators List & Projected Roadmap */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           
           {/* Top Operators List */}
           <div className="xl:col-span-6 bg-[#131111] border border-white/5 rounded-[40px] p-10 flex flex-col gap-8 shadow-xl">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight">Top Operators</h3>
                    <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">Stockholm Metropolitan</span>
                 </div>
                 <button className="text-[10px] font-bold text-white uppercase tracking-widest hover:text-[#cafd00] transition-colors">View All</button>
              </div>

              <div className="flex flex-col gap-4">
                 {[
                   { rank: "12", name: "You (Void_Runner)", status: "Verified Node Operator", impact: "4.2k", active: true },
                   { rank: "1", name: "Nexus_Prime", status: "Strategic Impact Lab", impact: "12.8k", active: false },
                   { rank: "2", name: "Carbon_DAO", status: "Community Collective", impact: "10.5k", active: false },
                 ].map((op, i) => (
                   <div key={i} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${
                     op.active ? "bg-[#cafd00]/5 border-[#cafd00]/30" : "bg-black border-white/5 hover:border-white/10"
                   }`}>
                      <div className="flex items-center gap-6">
                         <span className={`text-xl font-black ${op.active ? "text-[#cafd00]" : "text-[#494847]"}`}>{op.rank}</span>
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full bg-[#1c1c1c] border flex items-center justify-center ${op.active ? "border-[#cafd00]" : "border-white/10"}`}>
                               <Activity className={`w-5 h-5 ${op.active ? "text-[#cafd00]" : "text-white"}`} />
                            </div>
                            <div className="flex flex-col leading-none">
                               <h5 className={`text-base font-extrabold ${op.active ? "text-white" : "text-[#adaaaa]"}`}>{op.name}</h5>
                               <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest mt-1">{op.status}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className="text-lg font-black text-white tracking-tight">{op.impact}</span>
                         <span className="text-[8px] font-bold text-[#494847] uppercase tracking-widest">Impact</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Projected Roadmap */}
           <div className="xl:col-span-6 bg-[#131111] border border-white/5 rounded-[40px] p-10 flex flex-col justify-between shadow-xl min-h-[460px]">
              <div className="flex flex-col gap-6">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Projected Roadmap</h3>
                 <p className="text-sm text-[#adaaaa] font-medium leading-relaxed max-w-md">
                    Based on your current trajectory, you will achieve "Negative Impact" status within <span className="text-[#cafd00] font-black">4.2 months</span>. Joining the Stockholm "Green Ring" cluster would accelerate this by 15%.
                 </p>
              </div>

              <div className="bg-black/60 border border-white/5 rounded-3xl p-8 flex items-center justify-between group overflow-hidden">
                 <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">Active Forecast Mode</span>
                    <button className="bg-[#cafd00] text-[#3a4a00] px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                       Join Regional Cluster
                    </button>
                 </div>
                 
                 <div className="relative h-24 w-40 flex items-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    {[3, 4, 2, 5, 6, 8, 10].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#cafd00]" style={{ height: `${h * 10}%` }} />
                    ))}
                 </div>
              </div>
           </div>

        </div>

      </div>
    </ImpactShell>
  );
}
