"use client";

import { 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Send, 
  LayoutDashboard, 
  ShieldCheck, 
  TerminalSquare, 
  ArrowRightLeft, 
  LifeBuoy,
  Plus,
  Settings,
  LogOut
} from "lucide-react";
import Image from "next/image";

export function VerificationConflictResolution() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex">
      {/* Sidebar - Operator Hub */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[rgba(73,72,71,0.15)] bg-[#0e0e0e] sticky top-0 h-screen p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-[#cafd00] p-2 rounded flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold tracking-tight text-white leading-tight">Operator Hub</span>
            <span className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-medium leading-none">Terminal v2.4</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#adaaaa] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Overview</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#f3ffca] bg-[#262626] border-r-4 border-[#cafd00]">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium text-sm">Verification</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#adaaaa] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <TerminalSquare className="w-5 h-5" />
            <span className="font-medium text-sm">Terminals</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#adaaaa] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <ArrowRightLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Transactions</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#adaaaa] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <LifeBuoy className="w-5 h-5" />
            <span className="font-medium text-sm">Support</span>
          </a>
        </nav>

        <div className="pt-6 border-t border-[rgba(73,72,71,0.15)] flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 w-full py-3 mb-2 rounded-lg bg-[#262626] border border-[rgba(73,72,71,0.3)] text-white text-sm font-semibold hover:bg-[#333] transition-colors">
             <Plus className="w-4 h-4" />
             New Terminal
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#adaaaa] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#adaaaa] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-8 md:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-10">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#adaaaa]">
                <span>ECO_SYSTEM</span>
                <span>/</span>
                <span className="text-[#cafd00]">Security Protocols</span>
              </div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-white">
                Conflict Resolution
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-[#adaaaa]">Case ID: #VX-9920-TR</span>
                <span className="text-[10px] font-semibold text-[#ff7351] uppercase tracking-wider">Priority: Critical</span>
              </div>
              <div className="h-12 w-12 rounded-full border border-[rgba(73,72,71,0.2)] bg-[#1a1919] p-0.5 relative shrink-0">
                 <img
                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80"
                    alt="User"
                    className="rounded-full w-full h-full object-cover grayscale"
                 />
              </div>
            </div>
          </header>

          {/* Alert Banner */}
          <div className="bg-[rgba(185,41,2,0.1)] border-l-4 border-[#ff7351] rounded-r-xl p-6 relative overflow-hidden shadow-[0_0_25px_rgba(255,115,81,0.1)]">
            <AlertTriangle className="absolute right-0 top-0 h-32 w-32 text-[rgba(255,115,81,0.05)] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
            <div className="flex gap-4 relative z-10">
              <div className="bg-[#ff7351] h-10 w-10 rounded-lg shrink-0 flex items-center justify-center pt-0.5">
                <AlertTriangle className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#ff7351]">
                  Action Required: Proof Mismatch
                </h3>
                <p className="text-base text-[#adaaaa] leading-relaxed max-w-3xl">
                  The submitted document for "Merchant Entity Verification" contains illegible metadata and fails the automated structural scan. Manual resolution is required to prevent terminal suspension.
                </p>
              </div>
            </div>
          </div>

          {/* Grid Layout for Forms */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* User Submission Panel */}
            <div className="rounded-2xl border border-[rgba(73,72,71,0.15)] bg-[#131313] flex flex-col overflow-hidden">
              <div className="px-6 py-5 border-b border-[rgba(73,72,71,0.15)] flex justify-between items-center bg-[rgba(32,31,31,0.5)]">
                <div className="flex items-center gap-3 text-white">
                   <FileText className="w-5 h-5" />
                   <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold">User Submission</h4>
                </div>
                <div className="bg-[rgba(255,115,81,0.2)] px-2.5 py-1 rounded shadow-sm">
                   <span className="text-[10px] font-semibold text-[#ff7351] uppercase tracking-wider">Invalid Format</span>
                </div>
              </div>

              <div className="p-8 flex flex-col gap-6">
                 {/* Image preview box */}
                 <div className="relative w-full h-48 rounded-xl border border-[rgba(73,72,71,0.3)] bg-black overflow-hidden group">
                   <img
                     src="https://images.unsplash.com/photo-1618044733300-9472054094ee?w=800&q=80"
                     alt="Scanned Document"
                     className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-luminosity"
                   />
                   <div className="absolute top-4 left-4 bg-[#ff7351] px-2.5 py-1 rounded shadow-sm">
                     <span className="text-[10px] font-semibold text-[#450900] uppercase tracking-wider">Scan Failed</span>
                   </div>
                   
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button className="flex items-center gap-2 bg-[#2c2c2c] px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-[#444] transition-colors">
                       <FileText className="w-4 h-4" />
                       View Original
                     </button>
                   </div>
                 </div>

                 <div className="flex flex-col gap-4">
                   <div className="flex justify-between items-center py-2.5 border-b border-[rgba(73,72,71,0.1)]">
                     <span className="text-xs uppercase tracking-wide text-[#adaaaa]">File Name</span>
                     <span className="text-sm font-medium text-white">entity_proof_v2_final.pdf</span>
                   </div>
                   <div className="flex justify-between items-center py-2.5 border-b border-[rgba(73,72,71,0.1)]">
                     <span className="text-xs uppercase tracking-wide text-[#adaaaa]">Timestamp</span>
                     <span className="text-sm font-medium text-white">Oct 24, 2024 · 14:22 UTC</span>
                   </div>
                 </div>
              </div>
            </div>

            {/* Expected Criteria Panel */}
            <div className="rounded-2xl border border-[rgba(73,72,71,0.15)] bg-[#131313] flex flex-col overflow-hidden">
              <div className="px-6 py-5 border-b border-[rgba(73,72,71,0.15)] flex justify-between items-center bg-[rgba(32,31,31,0.5)]">
                <div className="flex items-center gap-3 text-white">
                   <ShieldCheck className="w-5 h-5" />
                   <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold">Expected Criteria</h4>
                </div>
                <div className="bg-[rgba(202,253,0,0.2)] px-2.5 py-1 rounded shadow-sm">
                   <span className="text-[10px] font-semibold text-[#cafd00] uppercase tracking-wider">System Standard</span>
                </div>
              </div>

              <div className="p-8 flex flex-col gap-6">
                <div className="relative rounded-xl border border-[rgba(202,253,0,0.2)] bg-black overflow-hidden p-6 flex flex-col">
                  {/* Subtle Background Glow inside the box */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(202,253,0,0.1)] blur-[40px] pointer-events-none" />
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded border-2 border-dashed border-[rgba(202,253,0,0.2)]">
                      <FileText className="w-5 h-5 text-[#f3ffca]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-[#f3ffca]">Template: 88-X High Fidelity</span>
                      <span className="text-[10px] text-[#adaaaa]">Required resolution: 300 DPI minimum</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 relative z-10 border-t border-[rgba(73,72,71,0.2)] pt-4">
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-[#cafd00]" />
                       <span className="text-xs text-white">Visible Holographic Seal</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-[#cafd00]" />
                       <span className="text-xs text-white">Clear machine-readable zone (MRZ)</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-[#cafd00]" />
                       <span className="text-xs text-white">Full document edge visibility</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-[rgba(73,72,71,0.2)] bg-[rgba(38,38,38,0.5)] p-4">
                  <p className="text-xs text-[#adaaaa] italic leading-relaxed">
                    "Documents must be captured in neutral lighting with all four corners visible. Digital scans are preferred over mobile photographs to ensure OCR accuracy."
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Submit Resolution Section */}
          <div className="rounded-2xl border border-[rgba(73,72,71,0.15)] bg-[rgba(38,38,38,0.4)] backdrop-blur-md p-8 relative overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
             <div className="absolute -top-6 -left-4 w-24 h-24 bg-[rgba(202,253,0,0.05)] blur-2xl rounded-full" />
             
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <FileText className="w-5 h-5 text-white" />
               <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-white tracking-tight">
                 Submit Resolution
               </h3>
             </div>

             <div className="flex flex-col gap-6 relative z-10 max-w-4xl">
               <div className="flex flex-col gap-3">
                 <label className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                   Add Clarification
                 </label>
                 <textarea 
                   className="w-full h-32 rounded-xl border border-[rgba(73,72,71,0.3)] bg-black p-4 text-base text-white placeholder:text-[#adaaaa]/30 focus:outline-none focus:border-[#cafd00] transition-colors resize-none"
                   placeholder="Explain the discrepancy or provide additional context regarding the submitted proof..."
                 />
               </div>

               <div className="flex flex-col sm:flex-row gap-4 items-center sm:justify-end">
                 <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#201f1f] border border-[rgba(73,72,71,0.3)] px-10 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#2c2c2c] hover:border-[#adaaaa]">
                   <Upload className="w-4 h-4" />
                   Attach New Document
                 </button>
                 <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#f3ffca] to-[#cafd00] px-12 py-4 text-sm font-semibold text-[#3a4a00] shadow-[0_0_20px_rgba(202,253,0,0.2)] transition-transform hover:scale-[1.02]">
                   <Send className="w-4 h-4" />
                   Re-submit Proof
                 </button>
               </div>
             </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t border-[rgba(73,72,71,0.15)] pt-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6">
            
            <div className="flex items-center gap-8">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-[#adaaaa]">System Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#cafd00]" />
                  <span className="text-xs font-semibold text-white tracking-wide">Operational</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-[#adaaaa]">Protocol</span>
                <span className="text-xs font-semibold text-white tracking-wide">AES-256 Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="text-[10px] uppercase tracking-widest text-[#adaaaa] hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-[10px] uppercase tracking-widest text-[#adaaaa] hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-[10px] uppercase tracking-widest text-[#adaaaa] hover:text-white transition-colors">API Docs</a>
            </div>

            <div className="text-[10px] uppercase tracking-widest text-[#adaaaa]">
              © 2024 ECO_SYSTEM. The Neon Void Terminal.
            </div>
            
          </footer>

        </div>
      </main>
    </div>
  );
}
