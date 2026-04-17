"use client";

import React from "react";
import {
  LayoutDashboard,
  Landmark,
  CircleDollarSign,
  History,
  Settings,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

interface DaoShellProps {
  children: React.ReactNode;
  activeSidebarItem?: string;
  activeNavItem?: string;
}

export function DaoShell({ children, activeSidebarItem = "Governance", activeNavItem = "Proposals" }: DaoShellProps) {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(14,14,14,0.8)] border-b border-[rgba(73,72,71,0.15)] shadow-[0px_0px_15px_0px_rgba(202,253,0,0.05)]">
        <div className="flex items-center justify-between max-w-[1536px] mx-auto px-6 py-4">
          <div className="flex items-center gap-10">
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-tight text-[#f3ffca] uppercase">
              ECO_DAO_OS
            </h1>
            
            <nav className="hidden md:flex items-center gap-8">
              {["Treasury", "Proposals", "Analytics", "Delegate"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`text-sm font-medium pb-1.5 transition-colors ${
                    activeNavItem === item 
                      ? "text-[#f3ffca] border-b-2 border-[#cafd00]" 
                      : "text-[#adaaaa] hover:text-[#f3ffca]"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <button className="bg-[#cafd00] text-[#3a4a00] px-5 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(202,253,0,0.15)] hover:shadow-[0_0_20px_rgba(202,253,0,0.3)] transition-all">
            Connect Wallet
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1536px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-[rgba(73,72,71,0.15)] py-8 shrink-0 h-[calc(100vh-73px)] sticky top-[73px]">
          <div className="px-6 mb-8 flex items-center gap-3">
             <div className="relative w-10 h-10 rounded-full bg-[#262626] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80"
                  alt="Voter Avatar"
                  fill
                  className="object-cover grayscale"
                />
             </div>
             <div className="flex flex-col">
                <span className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-[#f3ffca] uppercase">Governance Node</span>
                <span className="text-[10px] tracking-widest text-[#adaaaa] font-medium uppercase">Active Voter</span>
             </div>
          </div>

          <nav className="flex flex-col gap-1 px-4">
             {/* Sidebar Items */}
             {[
               { name: "Dashboard", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
               { name: "Governance", icon: <ShieldCheck className="w-5 h-5" /> },
               { name: "Treasury", icon: <CircleDollarSign className="w-[18px] h-[18px]" /> },
               { name: "History", icon: <History className="w-[18px] h-[18px]" /> },
               { name: "Settings", icon: <Settings className="w-[18px] h-[18px]" /> },
             ].map((item) => {
               const isActive = activeSidebarItem === item.name;
               return (
                 <a
                    key={item.name}
                    href="#"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-[rgba(202,253,0,0.1)] border-l-4 border-[#cafd00] text-[#cafd00]" 
                        : "text-[#adaaaa] hover:bg-[rgba(255,255,255,0.05)]"
                    }`}
                 >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="font-['Plus_Jakarta_Sans'] text-xs font-medium">{item.name}</span>
                 </a>
               );
             })}
          </nav>

          <div className="mt-auto px-6 pt-6">
            <button className="flex items-center justify-center w-full gap-2 rounded-xl bg-[#262626] border border-[rgba(73,72,71,0.15)] py-3 text-xs font-bold text-white hover:bg-[#333] transition-colors">
              <Plus className="w-4 h-4" />
              CREATE PROPOSAL
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
