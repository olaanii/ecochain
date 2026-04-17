"use client";

import React from "react";
import { DaoShell } from "@/components/layout/dao-shell";
import { 
  Search, 
  TrendingUp, 
  PlusCircled, 
  CheckCircle2, 
  User, 
  Users, 
  MapPin, 
  Globe, 
  FileText,
  Filter,
  ArrowRight
} from "lucide-react";
import Image from "next/image";

export function DelegateVotingPower() {
  return (
    <DaoShell activeNavItem="Delegate" activeSidebarItem="Settings">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[rgba(73,72,71,0.15)] pb-10 gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="font-['Plus_Jakarta_Sans'] text-5xl font-extrabold tracking-tight text-white leading-none">
              Delegate <span className="text-[#cafd00]">Voting Power</span>
            </h1>
            <p className="text-base text-[#adaaaa] leading-relaxed max-w-2xl">
              Empower the ECO ecosystem by delegating your governance weight to active community contributors or represent yourself.
            </p>
          </div>

          <div className="bg-[#131111] border border-[rgba(202,253,0,0.2)] rounded-2xl p-6 min-w-[320px] flex flex-col gap-2 shadow-[0_0_25px_rgba(202,253,0,0.05)]">
             <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-[1.5px]">Your Voting Weight</span>
             <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">42,850.00</span>
                <span className="text-xl font-bold text-[#cafd00]">ECO</span>
             </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Left Column: Selection & Search */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            
            {/* Current Status Card */}
            <div className="bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
               <h4 className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Current Status</h4>
               
               <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-[#262626] flex items-center justify-center border border-white/10">
                     <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-white uppercase tracking-tight">Self Delegated</span>
                     <span className="text-[10px] font-mono text-[#adaaaa] uppercase">0x71C...8eA2</span>
                  </div>
                  <div className="ml-auto">
                     <div className="w-5 h-5 rounded-full bg-[#cafd00] flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3a4a00]" />
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                     <span className="text-[#adaaaa]">Active Proposals</span>
                     <span className="text-white">12</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                     <span className="text-[#adaaaa]">Participation</span>
                     <span className="text-[#cafd00]">100%</span>
                  </div>
               </div>
            </div>

            {/* Find Delegate Section */}
            <div className="flex flex-col gap-4">
               <h4 className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Find Delegate</h4>
               
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adaaaa]" />
                  <input 
                    type="text" 
                    placeholder="Search by name or wallet address..."
                    className="w-full bg-[#131313] border border-[rgba(73,72,71,0.3)] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#cafd00] transition-colors"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-white/5 hover:bg-white/5 transition-colors">
                     <TrendingUp className="w-4 h-4 text-[#adaaaa]" />
                     <span className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest">Top Voted</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-white/5 hover:bg-white/5 transition-colors">
                     <Users className="w-4 h-4 text-[#adaaaa]" />
                     <span className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest">New Delegates</span>
                  </button>
               </div>

               <button className="w-full mt-4 bg-[#cafd00] text-[#3a4a00] py-5 rounded-2xl text-base font-extrabold shadow-[0_0_20px_rgba(202,253,0,0.15)] hover:scale-[1.02] transition-all">
                  Confirm Delegation
               </button>
            </div>
          </div>

          {/* Right Column: Recommendations & Detail */}
          <div className="xl:col-span-8 flex flex-col gap-10">
            
            {/* Recommended Delegates */}
            <div className="flex flex-col gap-6">
               <div className="flex justify-between items-center">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">Recommended Delegates</h3>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#262626] border border-white/5 text-[10px] font-bold text-[#adaaaa] uppercase">
                     <Filter className="w-3 h-3" />
                     Filter
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Delegate Card 1 */}
                  <div className="bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-6 hover:border-[#cafd00]/30 cursor-pointer transition-all group overflow-hidden relative">
                     <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                           <div className="relative w-12 h-12 rounded-xl bg-[#262626] overflow-hidden">
                              <Image 
                                src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=100&q=80" 
                                alt="OxVantage" 
                                fill 
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle2 className="w-5 h-5 text-[#cafd00]" />
                              </div>
                           </div>
                           <div className="flex flex-col">
                              <h5 className="text-lg font-bold text-white tracking-tight">OxVantage</h5>
                              <span className="text-[10px] font-mono text-[#adaaaa]">vantage_protocol.eth</span>
                           </div>
                        </div>
                        <span className="bg-[rgba(202,253,0,0.1)] px-2 py-0.5 rounded text-[8px] font-bold text-[#cafd00] uppercase tracking-widest border border-[rgba(202,253,0,0.2)]">Top 1%</span>
                     </div>

                     <p className="text-xs text-[#adaaaa] leading-relaxed line-clamp-2">
                        Focused on long-term sustainability and treasury diversification. Former core contributor...
                     </p>

                     <div className="flex gap-4">
                        <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col border border-white/5">
                           <span className="text-[8px] font-bold text-[#adaaaa] uppercase mb-1">Participation</span>
                           <span className="text-base font-bold text-white tracking-tight">98.4%</span>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col border border-white/5">
                           <span className="text-[8px] font-bold text-[#adaaaa] uppercase mb-1">Voting Weight</span>
                           <span className="text-base font-bold text-white tracking-tight">2.4M</span>
                        </div>
                     </div>

                     <button className="w-full py-3 rounded-lg border border-[rgba(73,72,71,0.3)] text-xs font-bold text-white hover:bg-[#cafd00] hover:text-[#3a4a00] hover:border-transparent transition-all">
                        Select Delegate
                     </button>
                  </div>

                  {/* Delegate Card 2 */}
                  <div className="bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-6 hover:border-[#cafd00]/30 cursor-pointer transition-all group relative">
                     <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                           <div className="relative w-12 h-12 rounded-xl bg-[#262626] overflow-hidden">
                              <Image 
                                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&q=80" 
                                alt="LunaDAO" 
                                fill 
                                className="object-cover grayscale"
                              />
                           </div>
                           <div className="flex flex-col">
                              <h5 className="text-lg font-bold text-white tracking-tight">LunaDAO</h5>
                              <span className="text-[10px] font-mono text-[#adaaaa]">lunadao.delegate</span>
                           </div>
                        </div>
                        <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] font-bold text-[#adaaaa] uppercase tracking-widest border border-white/10">Governance</span>
                     </div>

                     <p className="text-xs text-[#adaaaa] leading-relaxed line-clamp-2">
                        Community-first approach. We vote based on transparent forum discussions and on-chain...
                     </p>

                     <div className="flex gap-4">
                        <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col border border-white/5 text-[#adaaaa]">
                           <span className="text-[8px] font-bold uppercase mb-1">Participation</span>
                           <span className="text-base font-bold text-white tracking-tight">94.1%</span>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col border border-white/5 text-[#adaaaa]">
                           <span className="text-[8px] font-bold uppercase mb-1">Voting Weight</span>
                           <span className="text-base font-bold text-white tracking-tight">840K</span>
                        </div>
                     </div>

                     <button className="w-full py-3 rounded-lg border border-[rgba(73,72,71,0.3)] text-xs font-bold text-white hover:bg-[#cafd00] hover:text-[#3a4a00] hover:border-transparent transition-all">
                        Select Delegate
                     </button>
                  </div>
               </div>
            </div>

            {/* In-depth Delegate View */}
            <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[rgba(202,253,0,0.03)] blur-[80px] pointer-events-none rounded-full" />
                
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                   <div className="flex flex-col items-center text-center gap-5 lg:w-1/3">
                      <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#cafd00] to-transparent">
                         <div className="w-full h-full rounded-full bg-[#1a1919] flex items-center justify-center p-6 relative overflow-hidden">
                            <Users className="w-full h-full text-[#cafd00]" />
                         </div>
                      </div>
                      <div className="flex flex-col gap-1">
                         <h4 className="text-2xl font-extrabold text-white tracking-tight">Atlas Foundation</h4>
                         <span className="text-[10px] font-bold text-[#cafd00] uppercase tracking-[1px] leading-tight max-w-[140px]">Official Infrastructure Delegate</span>
                      </div>
                      <div className="flex gap-3 mt-2">
                         <button className="p-2.5 rounded-lg bg-[#262626] border border-white/5 hover:bg-white/10 transition-colors">
                            <Globe className="w-4 h-4 text-[#adaaaa]" />
                         </button>
                         <button className="p-2.5 rounded-lg bg-[#262626] border border-white/5 hover:bg-white/10 transition-colors">
                            <FileText className="w-4 h-4 text-[#adaaaa]" />
                         </button>
                      </div>
                   </div>

                   <div className="flex-1 flex flex-col gap-8">
                      <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(73,72,71,0.1)] rounded-2xl p-6 italic">
                         <p className="text-sm text-[#adaaaa] leading-relaxed">
                            "Our mission is to ensure the technical integrity of the ECO protocol through rigorous governance analysis and security-focused voting."
                         </p>
                      </div>

                      <div className="grid grid-cols-3 gap-8">
                         <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-[#adaaaa] uppercase tracking-widest">Votes</span>
                            <span className="text-2xl font-bold text-white tracking-tight">142</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-[#adaaaa] uppercase tracking-widest">Proposed</span>
                            <span className="text-2xl font-bold text-white tracking-tight">8</span>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-[#adaaaa] uppercase tracking-widest">Rank</span>
                            <span className="text-2xl font-bold text-white tracking-tight">#04</span>
                         </div>
                      </div>

                      <button className="w-full bg-white text-black py-4 rounded-xl text-sm font-extrabold uppercase tracking-widest hover:bg-[#f3ffca] transition-colors relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                         Delegate to Atlas Foundation
                      </button>
                   </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </DaoShell>
  );
}
