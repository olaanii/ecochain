"use client";

import React from "react";
import { DaoShell } from "@/components/layout/dao-shell";
import { 
  ArrowRight, 
  ChevronDown, 
  X, 
  Lightbulb, 
  Target, 
  Users,
  LayoutGrid
} from "lucide-react";

export function CreateProposalStep1() {
  return (
    <DaoShell activeNavItem="Proposals" activeSidebarItem="Governance">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <section className="flex flex-col gap-6">
           <div className="flex items-center gap-2">
              <div className="flex bg-[#cafd00] p-1.5 rounded-lg">
                 <LayoutGrid className="w-4 h-4 text-[#3a4a00]" />
              </div>
              <span className="text-[10px] font-bold text-[#cafd00] uppercase tracking-[2px]">Proposal Initiation</span>
           </div>

           <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[rgba(73,72,71,0.15)] pb-10 gap-8">
              <div className="flex flex-col gap-2">
                 <h1 className="font-['Plus_Jakarta_Sans'] text-5xl font-extrabold tracking-tight text-white leading-none">
                    New Governance <span className="text-[#cafd00]">Proposal</span>
                 </h1>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="h-0.5 w-12 bg-[#cafd00]" />
                    <span className="text-xs font-bold text-[#adaaaa] tracking-widest uppercase">Step 01 / 03</span>
                 </div>
              </div>
              
              <div className="flex gap-1.5 h-1">
                 <div className="w-12 h-full bg-[#cafd00] rounded-full" />
                 <div className="w-12 h-full bg-[#1a1919] rounded-full" />
                 <div className="w-12 h-full bg-[#1a1919] rounded-full" />
              </div>
           </section>
        </div>

        {/* Form Container */}
        <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-10 lg:p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[rgba(202,253,0,0.02)] blur-[100px] rounded-full pointer-events-none" />

           {/* Title Input */}
           <div className="flex flex-col gap-4">
              <label className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest px-1">Proposal Title</label>
              <input 
                type="text" 
                placeholder="e.g. Infrastructure Upgrade: Node Latency Reduction"
                className="w-full bg-black border border-[rgba(73,72,71,0.3)] rounded-2xl py-6 px-8 text-lg font-bold text-white placeholder:text-[#494847] focus:outline-none focus:border-[#cafd00] focus:ring-1 focus:ring-[#cafd00]/20 transition-all"
              />
              <span className="text-[9px] text-[#494847] font-bold uppercase tracking-widest px-1">Make it concise and descriptive of the core objective.</span>
           </div>

           {/* Category Selection */}
           <div className="flex flex-col gap-4">
              <label className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest px-1">Category</label>
              <div className="relative group cursor-pointer">
                 <div className="w-full bg-black border border-[rgba(73,72,71,0.3)] rounded-2xl py-6 px-8 text-base text-[#adaaaa] group-hover:border-[rgba(202,253,0,0.3)] transition-all flex items-center justify-between">
                    <span>Select an area of impact</span>
                    <ChevronDown className="w-5 h-5 text-[#494847] group-hover:text-[#cafd00]" />
                 </div>
              </div>
           </div>

           {/* Short Summary */}
           <div className="flex flex-col gap-4">
              <label className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest px-1">Short Summary</label>
              <textarea 
                className="w-full h-40 bg-black border border-[rgba(73,72,71,0.3)] rounded-2xl py-6 px-8 text-base text-white placeholder:text-[#494847] focus:outline-none focus:border-[#cafd00] focus:ring-1 focus:ring-[#cafd00]/20 transition-all resize-none"
                placeholder="Briefly explain the problem and your proposed solution..."
              />
              <div className="flex justify-between items-center px-1">
                 <span className="text-[9px] text-[#494847] font-bold uppercase tracking-widest">Minimum 150 characters required for submission.</span>
                 <span className="text-[9px] text-[#adaaaa] font-bold tracking-widest uppercase">0 / 580</span>
              </div>
           </div>

           {/* Footer Actions */}
           <div className="flex items-center justify-between pt-6 border-t border-[rgba(73,72,71,0.1)]">
              <button className="flex items-center gap-2 text-xs font-bold text-[#adaaaa] hover:text-[#ff7351] transition-colors uppercase tracking-widest group px-2">
                 <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                 Cancel Draft
              </button>
              <button className="flex items-center gap-3 bg-[#cafd00] text-[#3a4a00] px-12 py-5 rounded-2xl text-base font-extrabold shadow-[0_0_25px_rgba(202,253,0,0.2)] hover:scale-[1.02] transition-transform uppercase group">
                 Continue to Details
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Be Specific", desc: "Quantifiable outcomes help voters understand the direct impact of your proposal.", icon: <Lightbulb className="w-6 h-6 text-[#cafd00]" /> },
             { title: "Check Alignment", desc: "Ensure your proposal aligns with the ECO_DAO's quarterly strategic roadmap.", icon: <Target className="w-6 h-6 text-[#cafd00]" /> },
             { title: "Community First", desc: "Socialize your idea in the #governance channel before final submission.", icon: <Users className="w-6 h-6 text-[#cafd00]" /> },
           ].map((tip, i) => (
             <div key={i} className="bg-[#131111] border border-white/5 rounded-2xl p-8 flex flex-col gap-4 group hover:border-[#cafd00]/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#cafd00]/10 transition-colors">
                   {tip.icon}
                </div>
                <div className="flex flex-col gap-2">
                   <h4 className="text-base font-bold text-white tracking-tight">{tip.title}</h4>
                   <p className="text-xs text-[#adaaaa] leading-relaxed">{tip.desc}</p>
                </div>
             </div>
           ))}
        </div>

      </div>
    </DaoShell>
  );
}
