"use client";

import clsx from "clsx";
import { Check, Hash, Calendar, ArrowRight, FileText } from "lucide-react";

export function RedemptionSuccess() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[rgba(243,255,202,0.05)] rounded-full blur-[60px] pointer-events-none" />

      <div className="relative w-full max-w-[672px] flex flex-col items-center">
        {/* Success Header Area */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Animated Success Icon Container */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* Glow behind icon */}
            <div className="absolute w-48 h-48 bg-[rgba(202,253,0,0.2)] rounded-full blur-2xl" />
            
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#cafd00] bg-[#131313] shadow-[0_0_30px_rgba(202,253,0,0.3)]">
              <Check className="h-12 w-12 text-[#cafd00]" strokeWidth={3} />
            </div>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-5xl font-extrabold tracking-tight mb-4">
            Redemption Successful
          </h1>
          <p className="text-base text-[#adaaaa] leading-relaxed max-w-md">
            Your assets have been processed through the ECO_SYSTEM node.
            Terminal synchronization complete.
          </p>
        </div>

        {/* Asymmetric Bento Grid for Order Details */}
        <div className="w-full grid grid-cols-12 gap-4 mb-8">
          {/* Order ID Card */}
          <div className="col-span-12 md:col-span-7 flex flex-col justify-between rounded-2xl border border-[rgba(73,72,71,0.15)] bg-[rgba(38,38,38,0.4)] backdrop-blur-md p-6">
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa] mb-1 block">
                  Order Identity
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#f3ffca]">
                  #RX-9902-VOID
                </span>
              </div>
              <Hash className="h-6 w-6 text-[#adaaaa]" />
            </div>

            <div className="flex">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(73,72,71,0.1)] bg-[rgba(0,0,0,0.4)] px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#f3ffca]" />
                <span className="text-sm text-[#adaaaa]">
                  Status: Confirmed on Chain
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Date Card */}
          <div className="col-span-12 md:col-span-5 relative flex flex-col rounded-2xl border border-[rgba(73,72,71,0.15)] bg-[#201f1f] p-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#adaaaa] mb-4">
              Arrival Estimate
            </span>
            <div className="mb-4 flex items-end">
              <span className="font-['Plus_Jakarta_Sans'] text-5xl font-extrabold text-white leading-none">
                24
              </span>
              <span className="ml-1 text-xl font-semibold text-[#adaaaa] leading-none pb-1">
                OCT
              </span>
            </div>
            <p className="text-sm text-[#adaaaa] leading-relaxed">
              Scheduled window:<br />09:00 - 18:00 UTC
            </p>
            <Calendar className="absolute top-6 right-6 h-6 w-6 text-[rgba(255,255,255,0.1)] pointer-events-none" />
          </div>

          {/* Asset Preview Mini Card */}
          <div className="col-span-12 flex items-center justify-between rounded-2xl border border-[rgba(73,72,71,0.15)] bg-[rgba(38,38,38,0.4)] backdrop-blur-md p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[rgba(73,72,71,0.2)] bg-black">
                <img
                  src="https://images.unsplash.com/photo-1614064000300-8cb494a37b3f?w=200&q=80"
                  alt="Nexus Genesis Shard"
                  className="h-full w-full object-cover opacity-80"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-white">
                  Nexus Genesis Shard
                </span>
                <span className="text-xs font-normal text-[#adaaaa] mt-1">
                  Quantity: 01 // Tier: Legendary
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-8 hidden h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(73,72,71,0.3)] to-transparent sm:block" />

            <div className="flex flex-col items-end shrink-0">
              <span className="text-xs text-[#adaaaa] mb-1">
                Redemption Cost
              </span>
              <span className="text-base font-semibold text-[#f3ffca]">
                0.42 ETH
              </span>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex w-full flex-col sm:flex-row gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#f3ffca] to-[#cafd00] py-4 px-8 shadow-[0_0_20px_rgba(202,253,0,0.15)] transition-transform hover:scale-[1.02]">
            <span className="text-lg font-semibold text-[#3a4a00] tracking-tight">
              View My Assets
            </span>
            <ArrowRight className="h-5 w-5 text-[#3a4a00]" strokeWidth={2.5} />
          </button>
          
          <button className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(73,72,71,0.2)] bg-[#262626] py-4 px-8 transition-colors hover:bg-[#333]">
            <FileText className="h-4 w-4 text-white" />
            <span className="text-base font-semibold text-white">Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
