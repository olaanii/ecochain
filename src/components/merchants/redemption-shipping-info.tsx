"use client";

import clsx from "clsx";
import { ChevronDown, ArrowLeft, ShieldCheck, MapPin } from "lucide-react";

export function RedemptionShippingInfo() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-6 md:p-12 relative">
      <div className="mx-auto max-w-7xl">
        {/* Progress Header */}
        <div className="mb-12 max-w-3xl">
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight mb-4">
            REDEEM_ASSET
          </h1>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#cafd00]">
              Step 02 — Shipping Information
            </span>
            <span className="text-xs tracking-widest text-[#adaaaa] uppercase">
              66% Completed
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#262626] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#f3ffca] to-[#cafd00] w-[66%] shadow-[0_0_10px_rgba(202,253,0,0.5)]" />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Form Section */}
          <div className="col-span-1 lg:col-span-7 flex flex-col gap-8">
            <div className="rounded-xl border border-[rgba(73,72,71,0.15)] bg-[rgba(38,38,38,0.4)] p-8 backdrop-blur-md">
              <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#f3ffca] mb-8">
                SHIPPING_DETAILS
              </h2>
              
              <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue="John Doe"
                      className="rounded-lg border border-[rgba(73,72,71,0.3)] bg-black px-4 py-3 text-base text-white focus:outline-none focus:border-[#cafd00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                      Email Anchor
                    </label>
                    <input 
                      type="email" 
                      defaultValue="j.doe@eco.system"
                      className="rounded-lg border border-[rgba(73,72,71,0.3)] bg-black px-4 py-3 text-base text-white focus:outline-none focus:border-[#cafd00] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                    Terminal Address
                  </label>
                  <input 
                    type="text" 
                    defaultValue="Street Address, Suite, Unit"
                    className="rounded-lg border border-[rgba(73,72,71,0.3)] bg-black px-4 py-3 text-base text-[#6b7280] focus:outline-none focus:border-[#cafd00] focus:text-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                      City
                    </label>
                    <input 
                      type="text" 
                      defaultValue="Neo-Tokyo"
                      className="rounded-lg border border-[rgba(73,72,71,0.3)] bg-black px-4 py-3 text-base text-white focus:outline-none focus:border-[#cafd00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                      State / Sector
                    </label>
                    <input 
                      type="text" 
                      defaultValue="S-04"
                      className="rounded-lg border border-[rgba(73,72,71,0.3)] bg-black px-4 py-3 text-base text-white focus:outline-none focus:border-[#cafd00] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                      Zip Code
                    </label>
                    <input 
                      type="text" 
                      defaultValue="000-00"
                      className="rounded-lg border border-[rgba(73,72,71,0.3)] bg-black px-4 py-3 text-base text-[#6b7280] focus:outline-none focus:border-[#cafd00] focus:text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                    Country / Territory
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-lg border border-[rgba(73,72,71,0.3)] bg-black px-4 py-3 text-base text-white focus:outline-none focus:border-[#cafd00] transition-colors cursor-pointer">
                      <option>United Territories</option>
                      <option>Neo-Europa</option>
                      <option>Pan-Asia Combine</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#adaaaa]">
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="saveAddress" 
                    className="h-5 w-5 rounded border-[rgba(73,72,71,0.3)] bg-black focus:ring-[#cafd00] text-[#cafd00]"
                  />
                  <label htmlFor="saveAddress" className="text-sm text-[#adaaaa] cursor-pointer">
                    Save this address to my Operator Profile
                  </label>
                </div>
              </form>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <button className="flex items-center gap-2 px-6 py-3 font-semibold text-[#adaaaa] hover:text-white transition-colors w-full sm:w-auto justify-center">
                <ArrowLeft className="h-4 w-4" />
                Back to Selection
              </button>
              <button className="font-semibold text-[#3a4a00] bg-gradient-to-r from-[#f3ffca] to-[#cafd00] px-10 py-3 rounded-lg shadow-[0_0_15px_rgba(202,253,0,0.15)] transition-transform hover:scale-[1.02] w-full sm:w-auto text-center">
                Proceed to Confirmation
              </button>
            </div>
          </div>

          {/* Right Column: Summary Sidebar */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
            {/* Product Summary */}
            <div className="rounded-xl border border-[rgba(73,72,71,0.15)] bg-[#131313] overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1543329940-05e83ecf2bb8?w=800&q=80"
                  alt="VOID_NODE SERIES X"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="inline-block rounded-full border border-[rgba(243,255,202,0.3)] bg-[rgba(243,255,202,0.2)] px-3 py-1text-[10px] font-semibold uppercase tracking-widest text-[#f3ffca] backdrop-blur-sm">
                    Limited Edition
                  </span>
                </div>
              </div>

              <div className="flex flex-col p-6 h-full">
                <div className="mb-6">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold mb-1 text-white uppercase">
                    VOID_NODE SERIES X
                  </h3>
                  <p className="text-sm text-[#adaaaa] leading-relaxed">
                    High-performance hardware terminal for ECO_SYSTEM validation and mining.
                  </p>
                </div>

                <div className="border-t border-[rgba(73,72,71,0.1)] pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#adaaaa]">Redemption Value</span>
                    <span className="font-mono text-white">1,250.00 ECO</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#adaaaa]">Priority Shipping</span>
                    <span className="font-mono text-[#f3ffca]">FREE</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#adaaaa]">Import Fees (Estimated)</span>
                    <span className="font-mono text-white">12.50 ECO</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-[rgba(73,72,71,0.3)] pt-4 flex items-center justify-between">
                  <span className="font-semibold text-white uppercase tracking-wider">
                    TOTAL CHARGE
                  </span>
                  <span className="font-mono text-base font-bold text-[#f3ffca]">
                    1,262.50 ECO
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Section */}
            <div className="flex items-center gap-4 rounded-xl border border-[rgba(73,72,71,0.15)] p-6 bg-[#131313]">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(243,255,202,0.1)]">
                <ShieldCheck className="h-6 w-6 text-[#cafd00]" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#cafd00] mb-0.5">
                  Secured Transaction
                </span>
                <span className="text-[10px] uppercase tracking-wide text-[#adaaaa]">
                  Validated by Quantum Ledger v4.2
                </span>
              </div>
            </div>

            {/* Map/Location Visualization */}
            <div className="relative h-32 w-full overflow-hidden rounded-xl border border-[rgba(73,72,71,0.15)] bg-[#262626] flex items-center justify-center">
               <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80"
                  alt="Map Coverage"
                  className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity brightness-150 contrast-125 grayscale"
                />
              <div className="relative z-10 rounded-lg border border-[rgba(243,255,202,0.2)] bg-[rgba(0,0,0,0.8)] px-4 py-2 backdrop-blur-sm flex items-center gap-2">
                <MapPin className="h-3 w-3 text-[#cafd00] animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">
                  Network Coverage Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
