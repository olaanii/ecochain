"use client";

import React from "react";
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  ShieldCheck, 
  Zap,
  Info
} from "lucide-react";

interface CastVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CastVoteModal({ isOpen, onClose }: CastVoteModalProps) {
  const [selectedOption, setSelectedOption] = React.useState<"for" | "against" | "abstain" | null>("for");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-[rgba(202,253,0,0.2)] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(202,253,0,0.1)] flex flex-col gap-8 p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Cast Your Vote</h2>
            <span className="text-xs text-[#adaaaa]">Proposal #124: Cross-Chain Liquidity Vaults</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-6 h-6 text-[#adaaaa]" />
          </button>
        </div>

        {/* Voting Power Box */}
        <div className="bg-[#1a1919] border border-[rgba(73,72,71,0.2)] rounded-2xl p-6 flex items-center justify-between shadow-inner">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#cafd00] flex items-center justify-center shadow-[0_0_15px_rgba(202,253,0,0.25)]">
                 <Zap className="w-6 h-6 text-[#3a4a00]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Your Voting Power</span>
                 <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-white tracking-tight">4,200</span>
                    <span className="text-sm font-bold text-[#cafd00]">ECO</span>
                 </div>
              </div>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-bold text-[#adaaaa] uppercase tracking-widest text-right">Snapshot Block</span>
              <span className="text-xs font-mono text-white">#18,442,091</span>
           </div>
        </div>

        {/* Select Decision Section */}
        <div className="flex flex-col gap-4">
           <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Select Decision</span>
           
           <div className="flex flex-col gap-3">
              {[
                { id: "for", label: "For", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-[#cafd00]", borderColor: "border-[#cafd00]" },
                { id: "against", label: "Against", icon: <XCircle className="w-5 h-5" />, color: "text-[#ff7351]", borderColor: "border-[#ff7351]" },
                { id: "abstain", label: "Abstain", icon: <MinusCircle className="w-5 h-5" />, color: "text-[#adaaaa]", borderColor: "border-[#adaaaa]" },
              ].map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id as any)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                      isSelected 
                        ? `${option.borderColor} bg-white/5` 
                        : "border-[rgba(73,72,71,0.2)] hover:border-white/20 bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <span className={`${isSelected ? option.color : "text-[#adaaaa]"}`}>
                          {option.icon}
                       </span>
                       <span className={`text-base font-bold ${isSelected ? "text-white" : "text-[#adaaaa]"}`}>
                          {option.label}
                       </span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? option.borderColor : "border-[rgba(73,72,71,0.3)]"
                    }`}>
                       {isSelected && <div className={`w-3 h-3 rounded-full ${option.color.replace('text-', 'bg-')}`} />}
                    </div>
                  </button>
                );
              })}
           </div>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 gap-4">
           <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
              <span className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest">Impact on Tally</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-xl font-bold text-[#cafd00]">+0.42%</span>
                 <span className="text-[10px] text-[#adaaaa]">total</span>
              </div>
           </div>
           <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
              <span className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-widest">Gas Fee (Initia)</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-xl font-bold text-white">~0.0012</span>
                 <span className="text-[10px] text-[#adaaaa]">INIT</span>
              </div>
           </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex gap-4 cursor-pointer group">
           <div className="relative mt-1">
              <input type="checkbox" className="peer sr-only" />
              <div className="w-5 h-5 rounded border border-[rgba(73,72,71,0.5)] bg-transparent peer-checked:bg-[#cafd00] peer-checked:border-transparent transition-all" />
              <CheckCircle2 className="absolute inset-0 w-5 h-5 text-[#3a4a00] opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
           </div>
           <p className="text-[10px] text-[#adaaaa] leading-relaxed select-none group-hover:text-white transition-colors">
              I confirm that I have read the proposal details and understand that my vote is permanent once signed on the blockchain.
           </p>
        </label>

        {/* Action Button */}
        <div className="flex flex-col gap-4">
           <button className="w-full bg-gradient-to-br from-[#f3ffca] to-[#cafd00] text-[#3a4a00] py-5 rounded-2xl text-base font-extrabold shadow-[0_0_30px_rgba(202,253,0,0.2)] hover:scale-[1.02] transition-transform">
              SIGN & CONFIRM VOTE
           </button>
           <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#adaaaa]" />
              <span className="text-[9px] font-bold text-[#adaaaa] uppercase tracking-[1px]">Secure Hardware Signing Enabled</span>
           </div>
        </div>

      </div>
    </div>
  );
}
