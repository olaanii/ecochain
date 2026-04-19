"use client";

import React from "react";
import { DaoShell } from "@/components/layout/dao-shell";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  Wallet, 
  Plus, 
  ChevronRight,
  PieChart,
  Activity,
  UserCheck
} from "lucide-react";
import Image from "next/image";

export function GovernanceDashboard() {
  return (
    <DaoShell activeNavItem="Proposals" activeSidebarItem="Governance">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Top Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Total Staked Card */}
           <div className="lg:col-span-1 bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-4 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Wallet className="w-16 h-16 text-white" />
              </div>
              <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest leading-none">Total Staked ECO</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-extrabold text-white tracking-tight">142,850,201</span>
                 <span className="text-base font-bold text-[#cafd00]">ECO</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <TrendingUp className="w-3.5 h-3.5 text-[#4ade80]" />
                 <span className="text-xs font-bold text-[#4ade80]">+12.4% this epoch</span>
              </div>
           </div>

           {/* Active Proposals Card */}
           <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-4 shadow-xl">
              <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest leading-none">Active Proposals</span>
              <div className="flex flex-col gap-0.5">
                 <span className="text-3xl font-extrabold text-white tracking-tight">24</span>
                 <span className="text-xs font-bold text-[#ff7351] tracking-wide">4 Ending within 24h</span>
              </div>
              <div className="flex items-center -space-x-3 mt-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-[#131111] overflow-hidden grayscale hover:grayscale-0 transition-all">
                      <Image 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} 
                        alt="User" 
                        width={32} 
                        height={32} 
                      />
                   </div>
                 ))}
                 <div className="w-8 h-8 rounded-full border-2 border-[#131111] bg-[#262626] flex items-center justify-center">
                    <span className="text-[8px] font-bold text-[#adaaaa]">+12</span>
                 </div>
              </div>
           </div>

           {/* Active Voters Card */}
           <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-4 shadow-xl">
              <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest leading-none">Active Voters</span>
              <div className="flex flex-col gap-0.5">
                 <span className="text-3xl font-extrabold text-white tracking-tight">8,142</span>
                 <span className="text-xs font-bold text-[#cafd00] tracking-wide">68% Quorum reached</span>
              </div>
              <div className="h-1 w-full bg-[#1a1919] rounded-full mt-6 overflow-hidden">
                 <div className="h-full bg-[#cafd00] rounded-full" style={{ width: "68%" }} />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
           
           {/* Center Content: Trending Proposals */}
           <main className="xl:col-span-8 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                 <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white tracking-tight">Trending Proposals</h3>
                 <button className="flex items-center gap-1.5 text-[10px] font-bold text-[#cafd00] uppercase tracking-widest hover:underline px-2">
                    View All
                    <ChevronRight className="w-3.5 h-3.5" />
                 </button>
              </div>

              <div className="flex flex-col gap-4">
                 {[
                   { 
                     id: "ECO-102", 
                     title: "Implement Automated Liquidity Provisioning via Uniswap V3 Hooks",
                     desc: "This proposal aims to deploy a portion of the treasury into automated LP strategies to increase protocol revenue and deepen ECO liquidity...",
                     votes: "12.4M ECO",
                     percent: 88,
                     timeLeft: "2d 14h left"
                   },
                   { 
                     id: "ECO-103", 
                     title: "Grant: Community Education and Web3 Onboarding Initiative",
                     desc: "Funding for a 6-month education program to onboard developers and community managers from emerging markets into the ECO ecosystem...",
                     votes: "2.1M ECO",
                     percent: 42,
                     timeLeft: "5d 08h left"
                   }
                 ].map((prop, i) => (
                   <div key={i} className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-6 hover:border-[#cafd00]/30 transition-all group cursor-pointer relative overflow-hidden">
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-4">
                            <span className="bg-[rgba(202,253,0,0.1)] text-[#cafd00] border border-[rgba(202,253,0,0.2)] px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest">Active</span>
                            <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">{prop.id}</span>
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-[#adaaaa] tracking-tight">
                            <Clock className="w-3.5 h-3.5" />
                            {prop.timeLeft}
                         </div>
                      </div>

                      <div className="flex flex-col gap-3">
                         <h4 className="text-xl font-extrabold text-white tracking-tight group-hover:text-[#cafd00] transition-colors leading-tight">
                            {prop.title}
                         </h4>
                         <p className="text-xs text-[#adaaaa] leading-relaxed max-w-2xl line-clamp-2">
                            {prop.desc}
                         </p>
                      </div>

                      <div className="flex flex-col gap-4 mt-2">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-[#494847]">For: {prop.votes}</span>
                            <span className="text-white">{prop.percent}%</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                               <div className="h-full bg-[#cafd00] rounded-full" style={{ width: `${prop.percent}%` }} />
                            </div>
                            <button className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#cafd00] hover:text-[#3a4a00] hover:border-transparent transition-all">
                               Vote Now
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </main>

           {/* Right Column: User Power & Treasury Summary */}
           <aside className="xl:col-span-4 flex flex-col gap-8">
              
              {/* User Voting Power Card */}
              <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(202,253,0,0.02)] blur-3xl rounded-full" />
                 
                 <h5 className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Your Voting Power</h5>
                 
                 <div className="flex flex-col gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">45,000.00</span>
                    <span className="text-xs font-bold text-[#adaaaa] uppercase tracking-widest">ECO Staked</span>
                 </div>

                 <div className="flex flex-col gap-4 border-t border-b border-[rgba(73,72,71,0.15)] py-6">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">Delegation Status</span>
                       <span className="text-xs font-bold text-white tracking-tight">Self-Delegated</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">Voting Weight</span>
                       <span className="text-xs font-bold text-white tracking-tight">0.0315%</span>
                    </div>
                 </div>

                 <button className="w-full bg-[#f3ffca] text-[#3a4a00] py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#cafd00] transition-colors shadow-lg">
                    <UserCheck className="w-4 h-4" />
                    Manage Delegation
                 </button>
              </div>

              {/* Mini Treasury Stats */}
              <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-8 shadow-lg">
                 <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Treasury</h5>
                    <PieChart className="w-4 h-4 text-[#494847]" />
                 </div>

                 <div className="flex flex-col gap-1">
                    <span className="text-3xl font-extrabold text-white tracking-tight">$42.8M</span>
                    <p className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest leading-relaxed">
                       12.5M ECO • 850 ETH • 2.1M USDC
                    </p>
                 </div>

                 <div className="flex flex-col gap-4">
                    <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">Recent Transactions</span>
                    <div className="flex flex-col gap-3">
                       {[
                         { label: "Grant: ECO Analytics...", amount: "-$15,000", neg: true },
                         { label: "Protocol Revenue...", amount: "+$242,000", neg: false },
                         { label: "Staking Rewards...", amount: "+$89,200", neg: false },
                       ].map((tx, i) => (
                         <div key={i} className="flex justify-between items-center text-[10px] group">
                            <span className="text-[#adaaaa] group-hover:text-white transition-colors">{tx.label}</span>
                            <span className={`font-bold ${tx.neg ? "text-[#ff7351]" : "text-[#4ade80]"}`}>
                               {tx.amount}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

           </aside>
        </div>

      </div>
    </DaoShell>
  );
}
