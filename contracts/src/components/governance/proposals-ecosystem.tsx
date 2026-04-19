"use client";

import React from "react";
import { DaoShell } from "@/components/layout/dao-shell";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Tag,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Shield
} from "lucide-react";

export function ProposalsEcosystem() {
  const categories = [
    { label: "All Proposals", count: 42, active: true },
    { label: "Active", count: 12, active: false },
    { label: "Passed", count: 24, active: false },
    { label: "Failed", count: 6, active: false },
  ];

  const proposals = [
    {
      id: "EP-042",
      status: "ACTIVE",
      type: "Treasury",
      title: "Allocate 500k $ECO for Q3 Liquidity Mining",
      proposer: "cryptosage.eth",
      currentVotes: "1.2M",
      againstVotes: "240K",
      quorum: "84%",
      endsIn: "2d 14h 22m",
      progress: 75,
      color: "bg-[#cafd00]"
    },
    {
      id: "EP-041",
      status: "PASSED",
      type: "Policy",
      title: "Upgrade Governance V2: Quadratic Voting Implementation",
      proposer: "janedoe.dao",
      currentVotes: "4.8M",
      againstVotes: "310K",
      statusText: "Success",
      execution: "Complete",
      progress: 92,
      color: "bg-[#4ade80]"
    },
    {
      id: "EP-043",
      status: "ACTIVE",
      type: "Ecosystem",
      title: "Strategic Partnership with NeonProtocol for L2 Bridging",
      proposer: "neon_dev_lead",
      currentVotes: "890K",
      againstVotes: "1.1M",
      quorum: "41%",
      endsIn: "6d 08h 11m",
      progress: 45,
      color: "bg-[#ff7351]"
    },
    {
      id: "EP-039",
      status: "FAILED",
      type: "Security",
      title: "Reduce Staking Unbonding Period to 1 Day",
      proposer: "anonymous_voter",
      currentVotes: "500K",
      againstVotes: "2.0M",
      statusText: "Rejected",
      execution: "Defeated",
      progress: 20,
      color: "bg-[#ff7351]"
    }
  ];

  return (
    <DaoShell activeNavItem="Proposals" activeSidebarItem="Governance">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(202,253,0,0.1)] border border-[rgba(202,253,0,0.2)] w-fit">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#cafd00] animate-pulse" />
                 <span className="text-[9px] font-bold text-[#cafd00] uppercase tracking-widest">Live Governance</span>
              </div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-5xl font-extrabold tracking-tight text-white leading-none">
                 Proposal <span className="text-[#cafd00]">Ecosystem</span>
              </h1>
              <p className="text-base text-[#adaaaa] leading-relaxed max-w-2xl">
                 Review, debate, and vote on the future of ECO_DAO. Your tokens represent your voice in the decentralized protocol.
              </p>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adaaaa]" />
                 <input 
                   type="text" 
                   placeholder="Search proposals..."
                   className="w-full bg-[#131111] border border-[rgba(73,72,71,0.3)] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#cafd00] w-[300px] transition-all"
                 />
              </div>
              <button className="p-4 rounded-xl bg-[#262626] border border-white/5 hover:border-white/10 transition-colors">
                 <Filter className="w-5 h-5 text-white" />
              </button>
           </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-[rgba(73,72,71,0.15)] pb-1">
           {categories.map((cat) => (
             <button 
               key={cat.label}
               className={`flex items-center gap-3 pb-4 relative transition-all ${
                 cat.active ? "text-[#cafd00]" : "text-[#adaaaa] hover:text-white"
               }`}
             >
               <span className="text-sm font-bold tracking-tight">{cat.label}</span>
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                 cat.active ? "bg-[#cafd00] text-[#3a4a00]" : "bg-[#262626] text-[#adaaaa]"
               }`}>
                 {cat.count}
               </span>
               {cat.active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cafd00]" />}
             </button>
           ))}
        </div>

        {/* Proposals List */}
        <div className="flex flex-col gap-6">
           {proposals.map((proposal, i) => (
             <div 
               key={i} 
               className="bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col lg:flex-row gap-8 hover:border-[#cafd00]/30 transition-all cursor-pointer group"
             >
                <div className="flex-1 flex flex-col gap-6">
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-[#494847] uppercase font-bold tracking-widest leading-none">#{proposal.id}</span>
                      <div className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-widest uppercase leading-none ${
                        proposal.status === "ACTIVE" ? "bg-[rgba(202,253,0,0.1)] text-[#cafd00] border border-[rgba(202,253,0,0.2)]" :
                        proposal.status === "PASSED" ? "bg-[rgba(74,222,128,0.1)] text-[#4ade80] border border-[rgba(74,222,128,0.2)]" :
                        "bg-[rgba(255,115,81,0.1)] text-[#ff7351] border border-[rgba(255,115,81,0.2)]"
                      }`}>
                         {proposal.status}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest leading-none border-l border-[rgba(73,72,71,0.3)] pl-4">
                         <Landmark className="w-3 h-3" />
                         {proposal.type}
                      </div>
                   </div>

                   <h3 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-[#cafd00] transition-colors leading-tight">
                      {proposal.title}
                   </h3>

                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#262626] border border-white/5 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                         {proposal.proposer.charAt(0)}
                      </div>
                      <div className="flex gap-1.5 items-center">
                         <span className="text-[10px] text-[#adaaaa] font-bold uppercase tracking-widest">Proposed by</span>
                         <span className="text-[10px] text-white font-bold">{proposal.proposer}</span>
                      </div>
                   </div>
                </div>

                <div className="w-full lg:w-[320px] flex flex-col gap-6 justify-center">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-[#adaaaa]">{proposal.status === 'ACTIVE' ? 'Current Votes' : 'Final Result'}</span>
                      <span className={`text-white ${proposal.statusText === 'Rejected' ? 'text-[#ff7351]' : ''}`}>
                         {proposal.status === 'ACTIVE' ? `Quorum ${proposal.quorum}` : proposal.statusText}
                      </span>
                   </div>
                   
                   <div className="h-1.5 w-full bg-[#1a1919] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${proposal.color}`} 
                        style={{ width: `${proposal.progress}%` }} 
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">For</span>
                         <span className="text-sm font-bold text-white tracking-tight">{proposal.currentVotes}</span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                         <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">{proposal.status === 'ACTIVE' ? proposal.endsIn ? 'Ends In' : 'Against' : proposal.execution ? 'Execution' : 'Against'}</span>
                         <span className={`text-sm font-bold tracking-tight ${proposal.endsIn ? 'text-white' : 'text-[#adaaaa]'}`}>
                           {proposal.status === 'ACTIVE' ? (proposal.endsIn || proposal.againstVotes) : (proposal.execution || proposal.againstVotes)}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Pagination Section */}
        <div className="flex items-center justify-between pt-10 border-t border-[rgba(73,72,71,0.15)] pb-12">
           <div className="flex items-center gap-2 text-xs font-bold text-[#adaaaa] uppercase tracking-widest">
              <span>Showing</span>
              <span className="text-white">1 - 10</span>
              <span>of</span>
              <span className="text-white">42</span>
              <span>proposals</span>
           </div>

           <div className="flex gap-2">
              <button className="w-10 h-10 rounded-lg bg-[#1a1919] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors disabled:opacity-20">
                 <ChevronLeft className="w-5 h-5 text-[#adaaaa]" />
              </button>
              {[1, 2, 3, "...", 5].map((page, i) => (
                <button 
                  key={i}
                  className={`w-10 h-10 rounded-lg text-xs font-bold border transition-all ${
                    page === 1 ? "bg-[#cafd00] border-transparent text-[#3a4a00] shadow-[0_0_15px_rgba(202,253,0,0.15)]" : "bg-transparent border-white/5 text-[#adaaaa] hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="w-10 h-10 rounded-lg bg-[#1a1919] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors">
                 <ChevronRight className="w-5 h-5 text-[#adaaaa]" />
              </button>
           </div>
        </div>

      </div>
    </DaoShell>
  );
}
