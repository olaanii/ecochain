"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export function MerchantHubMain() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-6 md:p-12 relative overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header - Hero Section */}
        <div className="relative bg-[#131313] p-12 rounded-xl mb-6 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute right-[-10%] top-[-50%] w-[600px] h-[600px] bg-[#f3ffca] opacity-20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl flex flex-col items-start">
            <div className="flex items-center gap-3 mb-10">
              <span className="rounded-full border border-[rgba(243,255,202,0.3)] bg-[rgba(243,255,202,0.1)] px-3 py-1 text-[10px] font-semibold tracking-widest text-[#f3ffca] uppercase">
                Priority Access
              </span>
              <span className="text-[12px] font-medium tracking-widest text-[#adaaaa] uppercase">
                Category: Artifacts
              </span>
            </div>

            <h1 className="font-['Plus_Jakarta_Sans'] text-5xl md:text-6xl font-extrabold tracking-[-3px] mb-8">
              LIMITED EDITION
            </h1>

            <p className="text-lg text-[#adaaaa] leading-relaxed mb-12 max-w-[500px]">
              Exclusive high-tier redemptions for authorized ecosystem operators. These assets represent the pinnacle of network authority and hardware performance.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-lg bg-gradient-to-br from-[#f3ffca] to-[#cafd00] px-8 py-3.5 text-base font-semibold text-[#3a4a00] shadow-[0_0_20px_rgba(202,253,0,0.3)] transition-transform hover:scale-[1.02]">
                Initialize Terminal
              </button>
              <button className="rounded-lg border border-[rgba(73,72,71,0.3)] bg-[#262626] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#333]">
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          
          {/* Featured Card (Large) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-xl border border-[rgba(202,253,0,0.2)] bg-[#1a1919] overflow-hidden flex flex-col shadow-[0_0_15px_rgba(202,253,0,0.05)] h-full relative group">
            <div className="relative h-64 lg:h-[400px] w-full shrink-0">
              <img
                src="https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&q=80"
                alt="Titan Node Chassis"
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1919] to-transparent via-transparent" />
              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-2 rounded-lg border border-[rgba(243,255,202,0.2)] bg-[rgba(38,38,38,0.4)] px-4 py-2 backdrop-blur-md">
                  <div className="h-2 w-2 rounded-full bg-[#f3ffca] animate-pulse" />
                  <span className="text-sm font-semibold tracking-tight text-[#f3ffca]">1/50 REMAINING</span>
                </div>
              </div>
            </div>
            {/* Absolute positioning of text base over the image bottom/box */}
            <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col md:flex-row justify-between items-end gap-6 bg-gradient-to-t from-[#1a1919] via-[#1a1919]/90 to-transparent">
               <div className="flex flex-col gap-3 flex-1">
                 <h3 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold uppercase tracking-tight text-white">
                   Titan Node Chassis
                 </h3>
                 <p className="text-sm text-[#adaaaa] max-w-sm">
                    Military-grade computational housing for high-throughput node operations. Guaranteed zero-latency cooling.
                 </p>
               </div>
               <div className="flex flex-col items-end gap-1">
                 <span className="text-xs uppercase text-[#adaaaa] tracking-wider font-medium">Redemption Cost</span>
                 <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#f3ffca]">75,000 ECO</span>
               </div>
            </div>
          </div>

          {/* Side Card 1 - Genesis NFT */}
          <div className="rounded-xl border border-[rgba(73,72,71,0.15)] bg-[#201f1f] p-6 flex flex-col transition-colors hover:border-[#cafd00]/30 group">
             <div className="relative h-48 w-full rounded-lg overflow-hidden bg-black mb-6 border border-[rgba(73,72,71,0.2)]">
               <img
                  src="https://images.unsplash.com/photo-1614064641913-6b71f30b2eb3?w=600&q=80"
                  alt="Genesis NFT Key"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-screen transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded bg-[rgba(255,115,81,0.2)] border border-[rgba(255,115,81,0.4)] px-2.5 py-1">
                  <span className="block text-[10px] font-semibold text-[#ff7351] tracking-wider uppercase">
                    LAST 3 UNITS
                  </span>
                </div>
             </div>
             <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white mb-2">Genesis NFT Key</h4>
                  <p className="text-sm text-[#adaaaa]">
                    Unlocks Tier-1 governance privileges and early access to the Neon Void protocol layers.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-base font-semibold text-[#cafd00]">12,500 ECO</span>
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#262626] transition-colors hover:bg-[#333]">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </button>
                </div>
             </div>
          </div>

          {/* Side Card 2 - Black Card Elite */}
          <div className="rounded-xl border border-[rgba(73,72,71,0.15)] bg-[#201f1f] p-6 flex flex-col transition-colors hover:border-[#cafd00]/30 group">
             <div className="relative h-48 w-full rounded-lg overflow-hidden bg-black mb-6 border border-[rgba(73,72,71,0.2)]">
               <img
                  src="https://images.unsplash.com/photo-1617260023429-17bf57fc3e68?w=600&q=80"
                  alt="Black Card Elite"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 grayscale mix-blend-screen transition-transform duration-500 group-hover:scale-105"
                />
             </div>
             <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white mb-2">Black Card Elite</h4>
                  <p className="text-sm text-[#adaaaa]">
                    Physical titanium membership token. Offers unlimited lounge access in virtual merchant districts.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-base font-semibold text-[#cafd00]">5,000 ECO</span>
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#262626] transition-colors hover:bg-[#333]">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </button>
                </div>
             </div>
          </div>

          {/* Side Card 3 - Void Core v.8 */}
          <div className="rounded-xl border border-[rgba(73,72,71,0.15)] bg-[#201f1f] p-6 flex flex-col transition-colors hover:border-[#cafd00]/30 group">
             <div className="relative h-48 w-full rounded-lg overflow-hidden bg-black mb-6 border border-[rgba(73,72,71,0.2)]">
               <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"
                  alt="Void Core v.8"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-screen transition-transform duration-500 group-hover:scale-105"
                />
             </div>
             <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white mb-2">Void Core v.8</h4>
                  <p className="text-sm text-[#adaaaa]">
                    Experimental processing unit. Increases node validation rewards by a fixed 12.5% multiplier.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-base font-semibold text-[#cafd00]">45,000 ECO</span>
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#262626] transition-colors hover:bg-[#333]">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </button>
                </div>
             </div>
          </div>

          {/* Stats/Newsletter Card */}
          <div className="rounded-xl bg-[#f3ffca] p-8 relative overflow-hidden flex flex-col justify-center">
            {/* abstract shape / deco */}
            <div className="absolute top-[-20px] right-[-20px] opacity-10 pointer-events-none">
              <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="#3a4a00" />
                <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="#cafd00" />
              </svg>
            </div>
            <h4 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#3a4a00] tracking-tight leading-tight mb-2 relative z-10">
              JOIN THE<br />NEON ELITE
            </h4>
            <p className="text-sm font-medium text-[#3a4a00]/80 mb-6 relative z-10">
              Subscribe to get notified first when limited edition artifacts drop in the vault.
            </p>
            <div className="flex items-center gap-2 relative z-10">
               <input 
                 type="email" 
                 placeholder="Operator Email" 
                 className="flex-1 rounded-lg border border-[rgba(58,74,0,0.2)] bg-[rgba(58,74,0,0.1)] px-4 py-2.5 text-sm text-[#3a4a00] placeholder:text-[#3a4a00]/40 focus:outline-none focus:border-[#3a4a00]"
               />
               <button className="rounded-lg bg-[#3a4a00] px-6 py-2.5 text-sm font-semibold text-[#f3ffca] hover:bg-[#2c3800] transition-colors">
                 Alert
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
