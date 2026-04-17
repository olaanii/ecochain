"use client";

import React from "react";
import { ImpactShell } from "./impact-shell";
import { 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  Bike, 
  Zap, 
  Download,
  Info,
  ChevronRight,
  TrendingDown
} from "lucide-react";

export function CarbonOffsetsBreakdown() {
  return (
    <ImpactShell activeItem="Carbon Offsets">
      <div className="p-12 max-w-[1400px] flex flex-col gap-10">
        
        {/* Breadcrumb & Title */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center gap-2 text-[10px] font-bold text-[#494847] uppercase tracking-widest">
              <span>Impact Terminal</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#cafd00]">Carbon Offsets</span>
           </div>
           
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="flex flex-col gap-2">
                 <h2 className="text-5xl font-extrabold text-white tracking-tight leading-none">
                    CO2 Offset <span className="text-[#cafd00]">Breakdown</span>
                 </h2>
                 <p className="text-base text-[#adaaaa] leading-relaxed max-w-xl">
                    Real-time telemetry of your decentralized environmental impact across multiple ecological vectors.
                 </p>
              </div>

              <div className="flex gap-4">
                 <div className="bg-[#131111] border border-white/5 rounded-2xl p-6 min-w-[160px] flex flex-col gap-1 shadow-lg">
                    <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest leading-none">Global Rank</span>
                    <span className="text-2xl font-extrabold text-[#f3ffca] tracking-tight">#1,284</span>
                 </div>
                 <div className="bg-[#131111] border border-white/5 rounded-2xl p-6 min-w-[160px] flex flex-col gap-1 shadow-lg">
                    <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest leading-none">Total Avoidance</span>
                    <span className="text-2xl font-extrabold text-white tracking-tight">12.4t</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           
           {/* Chart Card */}
           <div className="xl:col-span-8 bg-[#131111] border border-white/5 rounded-3xl p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[rgba(202,253,0,0.03)] blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Temporal Variance</span>
                    <h4 className="text-2xl font-extrabold text-white">Last 30 Days</h4>
                 </div>
                 <div className="flex bg-black p-1 rounded-xl gap-1 border border-white/5">
                    {["30D", "90D", "1Y"].map((period) => (
                      <button 
                        key={period} 
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          period === "30D" ? "bg-[#cafd00] text-[#3a4a00]" : "text-[#adaaaa] hover:text-white"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#cafd00]" />
                    <span className="text-[#adaaaa]">Energy</span>
                 </div>
                 <div className="flex items-center gap-2 text-[#adaaaa]">
                    <div className="w-2 h-2 rounded-full bg-[#ff7351]" />
                    <span>Mobility</span>
                 </div>
                 <div className="flex items-center gap-2 text-[#adaaaa]">
                    <div className="w-2 h-2 rounded-full bg-[#1a3a00]" />
                    <span>Waste</span>
                 </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-72 w-full bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
                 <div className="absolute inset-x-8 bottom-0 h-40 group-hover:scale-y-110 transition-transform origin-bottom duration-700 opacity-60">
                    <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d">
                       <path 
                         d="M0,250 Q150,220 300,180 T600,120 T900,50 L1000,30" 
                         fill="none" 
                         stroke="#cafd00" 
                         strokeWidth="4" 
                         className="drop-shadow-[0_0_15px_rgba(202,253,0,0.5)]"
                       />
                       <path 
                         d="M0,280 Q150,260 300,240 T600,200 T900,150 L1000,130" 
                         fill="none" 
                         stroke="#ff7351" 
                         strokeWidth="3" 
                         className="opacity-40"
                       />
                    </svg>
                 </div>
                 {/* Floating Tooltip Mock */}
                 <div className="absolute top-1/4 left-3/4 bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl animate-bounce">
                    <span className="text-[10px] font-bold text-[#cafd00]">+2.4t CO2</span>
                 </div>
              </div>

              <div className="flex items-center justify-between px-2 text-[10px] font-bold text-[#494847] uppercase tracking-widest">
                 <span>WK 01</span>
                 <span>WK 02</span>
                 <span>WK 03</span>
                 <span>WK 04</span>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5">
                    <TrendingUp className="w-4 h-4 text-[#cafd00]" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">+12.4% vs previous month</span>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5">
                    <ShieldCheck className="w-4 h-4 text-[#adaaaa]" />
                    <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Data verified by Oracles</span>
                 </div>
              </div>
           </div>

           {/* Metrics List Column */}
           <div className="xl:col-span-4 flex flex-col gap-6">
              {[
                { 
                  label: "Waste Recycled", 
                  title: "142kg", 
                  unit: "Plastic Avoidance", 
                  desc: "Equivalent to saving 2,400 single-use bottles from landfills.", 
                  icon: <Trash2 className="w-5 h-5 text-[#3a4a00]" />, 
                  progress: 75,
                  color: "bg-[#cafd00]"
                },
                { 
                  label: "Green Transit", 
                  title: "420km", 
                  unit: "Cycled / Walked", 
                  desc: "Prevented 84.2kg of CO2 emission compared to fossil fuel vehicle.", 
                  icon: <Bike className="w-5 h-5 text-[#ff7351]" />, 
                  progress: 45,
                  color: "bg-[#ff7351]"
                },
                { 
                  label: "Solar Yield", 
                  title: "1.8mWh", 
                  unit: "Verified Generation", 
                  desc: "Your node contributed 12% more to the grid than last week.", 
                  icon: <Zap className="w-5 h-5 text-[#cafd00]" />, 
                  progress: 90,
                  color: "bg-[#cafd00]"
                }
              ].map((metric, i) => (
                <div key={i} className="bg-[#131111] border border-white/5 rounded-3xl p-8 flex flex-col gap-4 shadow-xl hover:border-[#cafd00]/20 transition-all cursor-pointer group">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">
                      <span className="group-hover:text-white transition-colors">{metric.label}</span>
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
                        {metric.icon}
                      </div>
                   </div>

                   <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-extrabold text-white tracking-tight">{metric.title}</span>
                         <span className="text-xs font-bold text-[#adaaaa] uppercase">{metric.unit}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black rounded-full mt-4 overflow-hidden">
                         <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.progress}%` }} />
                      </div>
                   </div>
                   
                   <p className="text-[10px] text-[#adaaaa] leading-relaxed line-clamp-2 mt-2 font-medium">
                      {metric.desc}
                   </p>
                </div>
              ))}
           </div>
        </div>

        {/* Ledger Section */}
        <section className="bg-[#131111] border border-white/5 rounded-[40px] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">On-Chain Ledger</h3>
              <button className="flex items-center gap-2 text-[10px] font-bold text-[#cbff12] uppercase tracking-widest hover:underline">
                 <Download className="w-4 h-4" />
                 Export Report
              </button>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-white/5 text-[9px] font-bold text-[#494847] uppercase tracking-[2.5px] leading-relaxed">
                       <th className="pb-6">Transaction ID</th>
                       <th className="pb-6">Category</th>
                       <th className="pb-6">Activity</th>
                       <th className="pb-6">Metric</th>
                       <th className="pb-6 text-right">Impact Score</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/[0.03]">
                    {[
                      { id: "0x7a...4b2e", cat: "ENERGY", activity: "Solar Grid Feed-in", metric: "42.5 kWh", score: "+12.4 CO2e", color: "text-[#cafd00]" },
                      { id: "0x3c...1f9a", cat: "MOBILITY", activity: "Urban Cycle Commute", metric: "12.8 km", score: "+2.1 CO2e", color: "text-[#ff7351]" },
                      { id: "0x9d...8e5c", cat: "WASTE", activity: "AI-Sorted Plastic Batch", metric: "8.2 kg", score: "+15.8 CO2e", color: "text-[#cafd00]" }
                    ].map((tx, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-all">
                         <td className="py-8 font-mono text-xs text-[#cbff12] uppercase">{tx.id}</td>
                         <td className="py-8">
                            <span className={`px-2 py-1 rounded text-[8px] font-extrabold uppercase border ${
                              tx.cat === 'ENERGY' ? 'bg-[#cafd00]/10 text-[#cafd00] border-[#cafd00]/20' :
                              tx.cat === 'MOBILITY' ? 'bg-[#ff7351]/10 text-[#ff7351] border-[#ff7351]/20' :
                              'bg-white/5 text-[#adaaaa] border-white/10'
                            }`}>
                               {tx.cat}
                            </span>
                         </td>
                         <td className="py-8 text-sm font-bold text-white tracking-tight">{tx.activity}</td>
                         <td className="py-8 text-sm text-[#adaaaa] font-medium">{tx.metric}</td>
                         <td className={`py-8 text-right text-lg font-extrabold tracking-tight ${tx.color}`}>
                            {tx.score}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

      </div>
    </ImpactShell>
  );
}
