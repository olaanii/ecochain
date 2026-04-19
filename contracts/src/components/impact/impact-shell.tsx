"use client";

import React from "react";
import { 
  LayoutGrid, 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  Bike, 
  Zap, 
  Download,
  Info,
  Search,
  Bell,
  Wallet,
  Settings,
  HelpCircle,
  FileText,
  BarChart3,
  Award,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarItem({ icon, label, active }: SidebarItemProps) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? "bg-[#cafd00]/10 text-[#cafd00] border border-[#cafd00]/20" : "text-[#adaaaa] hover:text-white hover:bg-white/5"
    }`}>
      <span className={active ? "text-[#cafd00]" : "text-[#adaaaa]"}>{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      {active && <div className="ml-auto w-1 h-4 bg-[#cafd00] rounded-full" />}
    </button>
  );
}

export function ImpactShell({ children, activeItem = "Carbon Offsets" }: { children: React.ReactNode, activeItem?: string }) {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex font-['Plus_Jakarta_Sans']">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0e0e0e] flex flex-col fixed inset-y-0 z-50">
        <div className="p-8 flex flex-col gap-10">
          <div className="flex flex-col gap-1">
             <h2 className="text-[#cafd00] text-lg font-extrabold tracking-tight uppercase">Impact Terminal</h2>
             <span className="text-[9px] font-bold text-[#494847] uppercase tracking-[2px]">Verified On-Chain</span>
          </div>

          <nav className="flex flex-col gap-2">
            <SidebarItem icon={<LayoutGrid className="w-4 h-4" />} label="Overview" active={activeItem === "Overview"} />
            <SidebarItem icon={<Leaf className="w-4 h-4" />} label="Carbon Offsets" active={activeItem === "Carbon Offsets"} />
            <SidebarItem icon={<TrendingUp className="w-4 h-4" />} label="Earnings" active={activeItem === "Earnings"} />
            <SidebarItem icon={<Award className="w-4 h-4" />} label="Achievements" active={activeItem === "Achievements"} />
            <SidebarItem icon={<BarChart3 className="w-4 h-4" />} label="Rankings" active={activeItem === "Rankings"} />
            <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" active={activeItem === "Settings"} />
          </nav>
        </div>

        <div className="mt-auto p-8 flex flex-col gap-6">
           <button className="w-full bg-white/5 border border-white/10 text-white flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-all group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Impact Report
           </button>
           
           <div className="flex flex-col gap-4">
              <Link href="#" className="flex items-center gap-3 text-[10px] font-bold text-[#adaaaa] hover:text-[#cafd00] transition-colors uppercase tracking-widest leading-none">
                 <HelpCircle className="w-3.5 h-3.5" />
                 Support
              </Link>
              <Link href="#" className="flex items-center gap-3 text-[10px] font-bold text-[#adaaaa] hover:text-[#cafd00] transition-colors uppercase tracking-widest leading-none">
                 <FileText className="w-3.5 h-3.5" />
                 Documentation
              </Link>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-[#0e0e0e]/80 backdrop-blur-xl sticky top-0 z-40">
           <div className="flex items-center gap-8">
              <h1 className="text-xl font-extrabold tracking-tighter hover:text-[#cafd00] cursor-pointer transition-colors">NeonVoid Impact</h1>
              <nav className="hidden xl:flex items-center gap-6">
                 {["Marketplace", "Validators", "Impact Terminal"].map((link) => (
                   <Link 
                    key={link} 
                    href="#" 
                    className={`text-[11px] font-bold uppercase tracking-widest ${
                      link === "Impact Terminal" ? "text-white" : "text-[#adaaaa] hover:text-white"
                    } transition-colors`}
                   >
                    {link}
                    {link === "Impact Terminal" && <div className="h-0.5 w-full bg-[#cafd00] mt-1" />}
                   </Link>
                 ))}
              </nav>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#494847] group-focus-within:text-[#cafd00] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search offsets..."
                   className="bg-[#131111] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-[11px] w-[240px] focus:outline-none focus:border-[#cafd00]/30 transition-all"
                 />
              </div>
              <button className="p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                 <Bell className="w-4 h-4 text-[#adaaaa]" />
              </button>
              <button className="bg-[#cafd00] text-[#3a4a00] px-6 py-2.5 rounded-lg text-xs font-extrabold uppercase shadow-[0_0_20px_rgba(202,253,0,0.2)] hover:scale-105 transition-all">
                 Connect Wallet
              </button>
           </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
