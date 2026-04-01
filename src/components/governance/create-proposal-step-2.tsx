"use client";

import React from "react";
import { DaoShell } from "@/components/layout/dao-shell";
import { 
  Eye, 
  Bold, 
  Italic, 
  Link, 
  List, 
  Code, 
  Image as ImageIcon,
  MessageSquare,
  Settings2,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

export function CreateProposalStep2() {
  return (
    <DaoShell activeNavItem="Proposals" activeSidebarItem="Governance">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Step Indicator Header */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Create Proposal</h1>
              <div className="bg-[#262626] border border-white/5 px-4 py-1.5 rounded-lg">
                 <span className="text-xs font-bold text-[#adaaaa] tracking-widest uppercase">Step 2 of 3</span>
              </div>
           </div>
           
           <div className="flex flex-col gap-3">
              <div className="h-1.5 w-full bg-[#1a1919] rounded-full overflow-hidden">
                 <div className="h-full bg-[#cafd00] rounded-full" style={{ width: "66%" }} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                 <span className="text-[#adaaaa]">Basic Info</span>
                 <span className="text-[#cafd00]">Detailed Content</span>
                 <span className="text-[#494847]">Review & Publish</span>
              </div>
           </div>
        </div>

        {/* Editor Section */}
        <div className="bg-[#131313] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 lg:p-10 flex flex-col gap-6 shadow-xl">
           <div className="flex items-center justify-between border-b border-[rgba(73,72,71,0.15)] pb-6">
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white tracking-tight">Detailed Description</h3>
              <div className="flex items-center gap-6">
                 <button className="flex items-center gap-2 text-[10px] font-bold text-[#adaaaa] hover:text-white transition-colors uppercase tracking-widest">
                    <Eye className="w-4 h-4" />
                    Preview
                 </button>
                 <div className="h-4 w-px bg-[rgba(73,72,71,0.3)]" />
                 <span className="text-[10px] font-bold text-[#cafd00] uppercase tracking-widest">Markdown Supported</span>
              </div>
           </div>

           <div className="flex flex-col border border-[rgba(73,72,71,0.3)] rounded-xl overflow-hidden bg-black">
              <div className="flex items-center gap-2 p-3 bg-[#201f1f] border-b border-[rgba(73,72,71,0.3)]">
                 {[
                   { icon: <Bold className="w-4 h-4" /> },
                   { icon: <Italic className="w-4 h-4" /> },
                   { icon: <Link className="w-4 h-4" /> },
                   { icon: <List className="w-4 h-4" /> },
                   { icon: <Code className="w-4 h-4" /> },
                 ].map((tool, i) => (
                   <button key={i} className="p-2 rounded hover:bg-white/5 transition-colors text-[#adaaaa] hover:text-white">
                      {tool.icon}
                   </button>
                 ))}
                 <div className="ml-auto">
                    <button className="p-2 rounded hover:bg-white/5 transition-colors text-[#adaaaa] hover:text-white">
                       <ImageIcon className="w-4 h-4" />
                    </button>
                 </div>
              </div>
              <textarea 
                className="w-full h-80 p-6 bg-transparent text-white placeholder:text-[#adaaaa]/20 focus:outline-none resize-none"
                placeholder="Describe your proposal in detail. Explain the logic, the expected outcomes, and technical implementation requirements..."
              />
              <div className="p-4 bg-[#1a1919] border-t border-[rgba(73,72,71,0.3)] flex justify-between items-center">
                 <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest leading-none">Min 250 characters required</span>
                 <span className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest leading-none">0 / 5000</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Discussion Link Input */}
           <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <MessageSquare className="w-16 h-16 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                 <h4 className="text-lg font-bold text-white tracking-tight">Link to Discussion Forum</h4>
                 <p className="text-xs text-[#adaaaa]">Provide a link to the community discussion thread where this proposal was first debated.</p>
              </div>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <MessageSquare className="w-4 h-4 text-[#adaaaa] group-focus-within:text-[#cafd00] transition-colors" />
                 </div>
                 <input 
                   type="text" 
                   placeholder="https://discourse.ecodao.org/t/..."
                   className="w-full bg-black border border-[rgba(73,72,71,0.3)] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#cafd00] transition-colors"
                 />
              </div>
           </div>

           {/* Governance Parameters UI */}
           <div className="bg-[#131111] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 flex flex-col gap-8 shadow-lg">
              <div className="flex items-center gap-3">
                 <Settings2 className="w-5 h-5 text-[#cafd00]" />
                 <h4 className="text-lg font-bold text-white tracking-tight">Governance Parameters</h4>
              </div>

              <div className="flex flex-col gap-8">
                 {/* Duration Slider Mock */}
                 <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-[#adaaaa]">Duration</span>
                       <span className="text-white">7 Days</span>
                    </div>
                    <div className="relative h-2 w-full bg-[#1a1919] rounded-full">
                       <div className="absolute h-full bg-[#cafd00] rounded-full" style={{ width: "50%" }} />
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-[#3a4a00]" />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-[#494847] uppercase">
                       <span>1 Day</span>
                       <span>14 Days</span>
                    </div>
                 </div>

                 {/* Quorum Slider Mock */}
                 <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-[#adaaaa]">Quorum Threshold</span>
                       <span className="text-[#cafd00]">12%</span>
                    </div>
                    <div className="relative h-2 w-full bg-[#1a1919] rounded-full">
                       <div className="absolute h-full bg-[#cafd00] rounded-full opacity-40" style={{ width: "30%" }} />
                       <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#cafd00] border-4 border-[#3a4a00]" />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-[#494847] uppercase">
                       <span>1%</span>
                       <span>50%</span>
                    </div>
                 </div>
              </div>
           </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 pb-12">
           <button className="flex items-center gap-2 text-sm font-bold text-[#adaaaa] hover:text-white transition-colors group uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Basics
           </button>
           <button className="flex items-center gap-3 bg-[#cafd00] text-[#3a4a00] px-10 py-5 rounded-2xl text-base font-extrabold shadow-[0_0_25px_rgba(202,253,0,0.2)] hover:scale-[1.02] transition-transform uppercase group">
              Save and Continue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

      </div>
    </DaoShell>
  );
}
