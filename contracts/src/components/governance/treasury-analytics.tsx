"use client";

import React from "react";
import { DaoShell } from "@/components/layout/dao-shell";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Target, 
  Users, 
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export function TreasuryAnalytics() {
  return (
    <DaoShell activeNavItem="Analytics" activeSidebarItem="Treasury">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgba(202,253,0,0.05)] blur-[100px] rounded-full pointer-events-none" />

        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between pb-8 border-b border-[rgba(73,72,71,0.15)] gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-white leading-none">
              Treasury <span className="text-[#cafd00]">Analytics</span>
            </h1>
            <p className="text-base text-[#adaaaa] leading-relaxed max-w-xl">
              Live transparency portal for ECO_SYSTEM DAO. Auditing real-time assets, 
              voting distribution, and historical spending flows.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-[#201f1f] border border-[rgba(73,72,71,0.2)] rounded-xl p-5 min-w-[180px] flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Net Worth</span>
              <span className="text-xl font-bold text-[#f3ffca]">$42,891,024.12</span>
            </div>
            <div className="bg-[#201f1f] border border-[rgba(73,72,71,0.2)] rounded-xl p-5 min-w-[140px] flex flex-col gap-1 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
              <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">24h Change</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4ade80]" />
                <span className="text-xl font-bold text-[#4ade80]">+2.4%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Top Grid: Growth & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Treasury Growth Chart Card */}
          <div className="lg:col-span-8 bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-white tracking-tight">Treasury Growth Over Time</h3>
              <div className="flex bg-[#262626] p-1 rounded-lg gap-1">
                {["1M", "6M", "1Y"].map((period) => (
                  <button 
                    key={period}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                      period === "6M" ? "bg-[#cafd00] text-[#4a5e00]" : "text-[#adaaaa] hover:text-white"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64 bg-black/40 rounded-xl border border-[rgba(73,72,71,0.1)] relative overflow-hidden group">
              {/* Mock Graph SVG Effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full h-full p-8 opacity-40 group-hover:opacity-60 transition-opacity">
                    <svg viewBox="0 0 1000 300" className="w-full h-full">
                       <path 
                        d="M0,250 Q150,220 300,180 T600,120 T900,50 L1000,30" 
                        fill="none" 
                        stroke="#cafd00" 
                        strokeWidth="4" 
                        className="drop-shadow-[0_0_10px_rgba(202,253,0,0.5)]"
                       />
                       {[...Array(5)].map((_, i) => (
                         <line key={i} x1={i * 250} y1="0" x2={i * 250} y2="300" stroke="rgba(73,72,71,0.1)" strokeWidth="1" />
                       ))}
                    </svg>
                 </div>
              </div>
            </div>

            <div className="flex justify-between px-2 text-[10px] font-bold text-[#adaaaa] uppercase tracking-wider">
              <span>Jan 2024</span>
              <span>Mar 2024</span>
              <span>May 2024</span>
              <span>Jun 2024</span>
            </div>
          </div>

          {/* Distribution Donut Card */}
          <div className="lg:col-span-4 bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-8 shadow-xl relative overflow-hidden">
             {/* Inner glow */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-[rgba(202,253,0,0.05)] blur-3xl pointer-events-none" />
             
             <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-white tracking-tight">Distribution by Asset</h3>

             <div className="flex-1 flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40">
                   <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <circle 
                        cx="50" cy="50" r="40" fill="transparent" 
                        stroke="#cafd00" strokeWidth="10" 
                        strokeDasharray="251.2" strokeDashoffset="75"
                        className="drop-shadow-[0_0_8px_rgba(202,253,0,0.3)]"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-2xl font-bold text-white">72%</span>
                     <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">In ECO</span>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-3">
               {[
                 { label: "ECO Token", value: "72.4%", color: "bg-[#cafd00]" },
                 { label: "USDC Stable", value: "18.2%", color: "bg-[rgba(255,255,255,0.4)]" },
                 { label: "ETH Reserve", value: "9.4%", color: "bg-[#464743]" },
               ].map((asset) => (
                 <div key={asset.label} className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${asset.color}`} />
                     <span className="text-xs text-white">{asset.label}</span>
                   </div>
                   <span className="text-xs font-bold text-[#adaaaa]">{asset.value}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Bottom Grid: Spending & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Spending Category List Card */}
          <div className="lg:col-span-5 bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
             <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-white tracking-tight">Spending by Category</h3>
             
             <div className="flex flex-col gap-6">
               {[
                 { label: "Development Grants", amount: "$1.2M", percent: 65 },
                 { label: "Liquidity Incentives", amount: "$840k", percent: 45 },
                 { label: "Marketing & Comms", amount: "$320k", percent: 15 },
                 { label: "Operations", amount: "$110k", percent: 8 },
               ].map((item) => (
                 <div key={item.label} className="flex flex-col gap-2">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-white font-medium">{item.label}</span>
                     <span className="text-[#adaaaa] font-bold">{item.amount}</span>
                   </div>
                   <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden">
                     <div className="h-full bg-[#cafd00] rounded-full opacity-80" style={{ width: `${item.percent}%` }} />
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Recent Transactions Table Card */}
          <div className="lg:col-span-7 bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
             <div className="flex justify-between items-center">
               <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-white tracking-tight">Recent Transactions</h3>
               <button className="text-xs font-bold text-[#cafd00] hover:underline uppercase tracking-widest">View All</button>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-[rgba(73,72,71,0.15)]">
                     <th className="pb-3 text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Hash</th>
                     <th className="pb-3 text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Description</th>
                     <th className="pb-3 text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Amount</th>
                     <th className="pb-3 text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[rgba(73,72,71,0.05)]">
                   {[
                     { hash: "0x82f...a92b", desc: "Q2 Tech Infrastructure Payment", amount: "-45,000 USDC", status: "Success", color: "text-[#beee00]" },
                     { hash: "0x1c4...33e1", desc: "Yield Harvesting - Curve Pool", amount: "+12.4 ETH", status: "Success", color: "text-[#4ade80]" },
                     { hash: "0xdf9...01c4", desc: "DAO UI Overhaul Grant", amount: "-125,000 ECO", status: "Success", color: "text-[#beee00]" },
                     { hash: "0x55a...e992", desc: "V3 Smart Contract Audit", amount: "-8,000 USDC", status: "Success", color: "text-[#beee00]" },
                   ].map((tx, i) => (
                     <tr key={i} className="group hover:bg-white/5 transition-colors">
                       <td className="py-4 text-[11px] font-mono text-[#beee00] uppercase">{tx.hash}</td>
                       <td className="py-4 text-xs text-white max-w-[200px] truncate">{tx.desc}</td>
                       <td className={`py-4 text-xs font-bold ${tx.amount.startsWith('+') ? 'text-[#4ade80]' : 'text-white'}`}>{tx.amount}</td>
                       <td className="py-4 text-right">
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201f1f] border border-[rgba(243,255,202,0.3)] text-[9px] font-bold text-[#beee00] uppercase shadow-sm">
                           <div className="w-1 h-1 rounded-full bg-[#f3ffca]" />
                           {tx.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Bottom Ticker Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
           {[
             { label: "Active Proposals", value: "12 Proposals", icon: <MessageSquare className="w-5 h-5 text-[#f3ffca]" /> },
             { label: "Total Delegates", value: "4,892 Nodes", icon: <Users className="w-6 h-6 text-[#f3ffca]" /> },
             { label: "Voting Quorum", value: "15% Required", icon: <ShieldCheck className="w-5 h-5 text-[#f3ffca]" /> },
           ].map((stat, i) => (
             <div key={i} className="backdrop-blur-md bg-[rgba(38,38,38,0.4)] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex items-center gap-4 group hover:border-[#cafd00]/30 transition-all">
                <div className="w-12 h-12 rounded-full bg-[rgba(202,253,0,0.1)] flex items-center justify-center p-2.5 group-hover:scale-110 transition-transform">
                   {stat.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">{stat.label}</span>
                  <span className="text-xl font-bold text-white tracking-tight">{stat.value}</span>
                </div>
             </div>
           ))}
        </div>

      </div>
    </DaoShell>
  );
}
