"use client";

import React from "react";
import { DaoShell } from "@/components/layout/dao-shell";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Terminal, 
  Clock, 
  Users, 
  Wallet,
  Zap,
  ArrowRight,
  Info,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";

export function ReviewAndSubmit() {
  return (
    <DaoShell activeNavItem="Proposals" activeSidebarItem="Governance">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Step Indicator Header */}
        <div className="flex flex-col gap-6">
           <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[#adaaaa] tracking-widest uppercase">Step 3 of 3</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Review & <span className="text-[#cafd00]">Submit</span></h1>
           </div>
           <p className="text-sm text-[#adaaaa] leading-relaxed max-w-2xl">
              Your proposal is ready for the blockchain. Review the parameters carefully. Once submitted, this action cannot be undone and will require a security deposit.
           </p>

           <div className="flex gap-1.5 h-1 max-w-[140px]">
              <div className="w-full h-full bg-[#cafd00] rounded-full" />
              <div className="w-full h-full bg-[#cafd00] rounded-full" />
              <div className="w-full h-full bg-[#cafd00] rounded-full shadow-[0_0_10px_rgba(202,253,0,0.5)]" />
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           
           {/* Left Column: Proposal Summary & Payload */}
           <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* Proposal Preview Card */}
              <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CheckCircle2 className="w-24 h-24 text-[#cafd00]" />
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-lg">
                       <Wallet className="w-3.5 h-3.5 text-[#adaaaa]" />
                       <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Treasury Allocation</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-[rgba(73,72,71,0.5)]" />
                    <span className="text-[10px] font-bold text-[#ff7351] uppercase tracking-widest">High Priority</span>
                    <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-[rgba(202,253,0,0.1)] border border-[rgba(202,253,0,0.2)] rounded-lg">
                       <span className="text-[8px] font-bold text-[#cafd00] uppercase tracking-widest">Draft State</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-6">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                       Expansion of Liquidity Provisioning: Q4 Eco-Asset Protocol Growth
                    </h2>
                    <p className="text-sm text-[#adaaaa] leading-relaxed max-w-3xl">
                       This proposal aims to allocate 450,000 ECO tokens from the Treasury to the ETH/ECO pair on Uniswap V3. This move is designed to reduce slippage for institutional participants and stabilize the DAO's native asset during the upcoming protocol upgrade. 
                    </p>
                    <p className="text-xs text-[#adaaaa]/60 leading-relaxed max-w-3xl border-l border-[rgba(73,72,71,0.3)] pl-6">
                       The liquidity will be managed by a 3-of-5 multi-sig composed of the core development team and two community-elected guardians.
                    </p>
                 </div>
              </div>

              {/* Technical Data Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Transaction Payload */}
                 <div className="bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                       <Terminal className="w-4 h-4 text-[#cafd00]" />
                       <h4 className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Transaction Payload</h4>
                    </div>
                    <div className="flex flex-col gap-4">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-[#494847]">Target Contract</span>
                          <span className="font-mono text-[#cafd00] bg-[rgba(202,253,0,0.05)] px-2 py-0.5 rounded border border-[rgba(202,253,0,0.1)]">0x71C...3d92</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-[#494847]">Function</span>
                          <span className="text-white font-medium">transfer(address, uint256)</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-[#494847]">Value</span>
                          <span className="text-white font-extrabold">450,000.00 ECO</span>
                       </div>
                    </div>
                 </div>

                 {/* Voting Window */}
                 <div className="bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                       <Clock className="w-4 h-4 text-[#cafd00]" />
                       <h4 className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Voting Window</h4>
                    </div>
                    <div className="flex flex-col gap-4">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-[#494847]">Start Block</span>
                          <span className="text-white font-mono">#18,452,109</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-[#494847]">Voting Period</span>
                          <span className="text-white font-medium">72 Hours (3 Days)</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-[#494847]">Quorum</span>
                          <span className="text-white font-bold">4.0% (1.2M ECO)</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Alerts & Actions */}
           <div className="xl:col-span-4 flex flex-col gap-8">
              
              {/* Alert Card */}
              <div className="bg-[rgba(255,115,81,0.03)] border border-[rgba(255,115,81,0.15)] rounded-2xl p-8 flex flex-col gap-6">
                 <div className="flex items-center gap-3 text-[#ff7351]">
                    <ShieldAlert className="w-5 h-5" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Crucial Information</h4>
                 </div>
                 <ul className="flex flex-col gap-4">
                    {[
                      "A non-refundable deposit of 100 ECO is required to prevent spam.",
                      "Gas fees for this transaction are estimated at 0.024 ETH.",
                      "Ensure all wallet balances are sufficient before proceeding to sign."
                    ].map((text, i) => (
                      <li key={i} className="flex gap-3 items-start">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#ff7351] mt-1 shrink-0" />
                         <span className="text-[10px] text-[#adaaaa] leading-relaxed">{text}</span>
                      </li>
                    ))}
                 </ul>
              </div>

              {/* Submission Control Panel */}
              <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                 <div className="flex justify-between items-center border-b border-[rgba(73,72,71,0.1)] pb-6 mb-2">
                    <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">Submission Cost</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">100 ECO + Gas</span>
                 </div>

                 <p className="text-[9px] text-[#adaaaa] leading-relaxed text-center px-4">
                    By clicking below, you initiate the on-chain governance process. This transaction will be broadcast to the Ethereum Mainnet.
                 </p>

                 <div className="flex flex-col gap-4">
                    <button className="w-full bg-gradient-to-br from-[#f3ffca] to-[#cafd00] text-[#3a4a00] py-5 rounded-2xl text-sm font-extrabold uppercase tracking-[2px] shadow-[0_0_30px_rgba(202,253,0,0.25)] hover:scale-[1.02] transition-transform">
                       Launch Proposal on Chain
                    </button>
                    <button className="w-full bg-transparent border border-[rgba(73,72,71,0.3)] text-[#adaaaa] py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
                       Save as Draft Locally
                    </button>
                 </div>

                 {/* Proposer Info Badge */}
                 <div className="mt-4 flex items-center justify-center p-4 bg-white/5 border border-white/5 rounded-2xl gap-4">
                    <div className="w-10 h-10 rounded-full border border-[rgba(202,253,0,0.3)] overflow-hidden relative">
                       <Image 
                         src="https://api.dicebear.com/7.x/avataaars/svg?seed=cryptosage" 
                         alt="Proposer" 
                         fill
                         className="object-cover"
                       />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[8px] font-bold text-[#494847] uppercase tracking-widest leading-none mb-1">Proposed By</span>
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-tight">0x4a...92f1</span>
                          <span className="text-[8px] font-bold text-[#cafd00] uppercase">(Verified)</span>
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </DaoShell>
  );
}
