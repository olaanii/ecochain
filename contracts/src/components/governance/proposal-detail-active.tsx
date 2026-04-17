"use client";

import React from "react";
import { DaoShell } from "@/components/layout/dao-shell";
import { 
  ArrowUpRight, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2,
  Users,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export function ProposalDetailActive() {
  return (
    <DaoShell activeNavItem="Proposals" activeSidebarItem="Governance">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Proposal Header Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[rgba(202,253,0,0.1)] border border-[rgba(202,253,0,0.2)] px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#cafd00]" />
              <span className="text-[10px] font-bold text-[#cafd00] uppercase tracking-widest">Active</span>
            </div>
            <span className="text-xs text-[#adaaaa] font-medium">Core Proposal</span>
            <span className="text-[#adaaaa]">•</span>
            <span className="text-xs text-[#adaaaa]">Ends in 2 days, 4 hours</span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] text-5xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl">
            EP-042: Amazon Basin Reforestation Funding
          </h1>

          <div className="flex items-center gap-8 py-3 border-y border-[rgba(73,72,71,0.15)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(202,253,0,0.2)] flex items-center justify-center p-1.5">
                <Users className="w-full h-full text-[#cafd00]" />
              </div>
              <span className="text-xs text-[#adaaaa] font-medium">
                Proposed by: <span className="text-[#f3ffca] hover:underline cursor-pointer">ecoguerilla.eth</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-[#adaaaa]">
                <TrendingUp className="w-full h-full" />
              </div>
              <span className="text-xs text-[#adaaaa] font-medium">Jan 24, 2024</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Content Column */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            <div className="backdrop-blur-md bg-[rgba(38,38,38,0.4)] border border-[rgba(73,72,71,0.15)] rounded-2xl p-8 lg:p-10 flex flex-col gap-8 shadow-2xl">
              
              <div className="flex flex-col gap-4">
                <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#f3ffca]">Abstract</h3>
                <p className="text-sm text-[#adaaaa] leading-relaxed">
                  This proposal seeks the allocation of 2.5M ECO tokens (approx. $450k) to initiate
                  the first phase of the Amazon Basin Reforestation Project. This initiative aims to
                  restore 15,000 hectares of degraded rainforest over the next 12 months using
                  decentralized monitoring protocols and local community engagement.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#f3ffca]">Background & Motivation</h3>
                <p className="text-sm text-[#adaaaa] leading-relaxed">
                  The Amazon Basin serves as the planet's primary carbon sink. However, recent
                  data suggests a 14% increase in localized deforestation within the North-Eastern
                  sector. ECO_DAO has the unique opportunity to leverage its treasury to fund high-
                  impact, verifiable reforestation that creates tangible environmental assets (Natural
                  Capital Tokens) for our ecosystem.
                </p>
              </div>

              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[rgba(73,72,71,0.3)] bg-black shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1590274853856-f20d5ee3d228?w=1200&q=80"
                  alt="Amazon Rainforest"
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#f3ffca]">Implementation Plan</h3>
                <ul className="flex flex-col gap-4">
                  {[
                    { phase: "Phase 1", desc: "On-the-ground assessment and sapling nursery establishment (Months 1-3)." },
                    { phase: "Phase 2", desc: "Initial planting of native hardwoods and biodiversity corridors (Months 4-9)." },
                    { phase: "Phase 3", desc: "Integration with Sentinel-2 satellite monitoring for proof-of-growth verification (Months 10-12)." },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="font-bold text-white whitespace-nowrap">{item.phase}:</span>
                      <span className="text-[#adaaaa] leading-relaxed">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 border-t border-[rgba(73,72,71,0.15)] flex flex-wrap gap-6">
                <a href="#" className="flex items-center gap-2 text-xs font-bold text-[#cafd00] hover:opacity-80 transition-opacity">
                  <MessageSquare className="w-5 h-5" />
                  DISCUSSION ON DISCORD
                </a>
                <a href="#" className="flex items-center gap-2 text-xs font-bold text-[#cafd00] hover:opacity-80 transition-opacity">
                  <GitHubLogoIcon className="w-5 h-5" />
                  TECHNICAL SPECIFICATION (GITHUB)
                </a>
              </div>
            </div>
          </div>

          {/* Voting Sidebar Column */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Live Vote Tally */}
            <div className="backdrop-blur-md bg-[rgba(38,38,38,0.4)] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 shadow-[0px_0px_30px_rgba(202,253,0,0.1)] flex flex-col gap-6">
              <h4 className="text-xs font-bold text-[#adaaaa] uppercase tracking-widest">Live Vote Tally</h4>
              
              <div className="flex flex-col gap-6">
                {[
                  { label: "FOR", value: "64.2%", subtitle: "(12.4M ECO)", color: "bg-[#cafd00]", textColor: "text-[#cafd00]", width: "64.2%" },
                  { label: "AGAINST", value: "28.8%", subtitle: "(5.5M ECO)", color: "bg-[#ff7351]", textColor: "text-[#ff7351]", width: "28.8%" },
                  { label: "ABSTAIN", value: "7.0%", subtitle: "(1.3M ECO)", color: "bg-[#494847]", textColor: "text-[#adaaaa]", width: "7.0%" },
                ].map((vote) => (
                  <div key={vote.label} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className={`text-[10px] font-bold ${vote.textColor}`}>{vote.label}</span>
                      <span className="text-xs font-bold text-white uppercase">{vote.value} <span className="text-[#adaaaa] font-medium">{vote.subtitle}</span></span>
                    </div>
                    <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden">
                      <div className={`h-full ${vote.color} rounded-full`} style={{ width: vote.width }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[rgba(0,0,0,0.5)] border border-[rgba(73,72,71,0.2)] rounded-xl p-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest">Quorum Status</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border-2 border-dashed border-[rgba(202,253,0,0.2)] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#cafd00]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight">Quorum Reached</span>
                    <span className="text-[10px] text-[#adaaaa]">(15M Minimum)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Voting Power */}
            <div className="backdrop-blur-md bg-[rgba(38,38,38,0.4)] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-6">
              <h4 className="text-xs font-bold text-[#adaaaa] uppercase tracking-widest">Your Voting Power</h4>
              
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-white">42,500</span>
                  <span className="text-[10px] font-medium text-[#adaaaa]">Available vECO Tokens</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-[#cafd00]">0.22% Weight</span>
                  <button className="text-[10px] text-[#adaaaa] underline hover:text-white transition-colors">Delegate Power</button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button className="w-full bg-[#cafd00] text-[#3a4a00] py-4 rounded-xl text-sm font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(202,253,0,0.15)] hover:scale-[1.02] transition-all">
                  Cast Your Vote
                </button>
                <span className="text-[10px] text-[#adaaaa] text-center">Gasless voting powered by Snapshot X</span>
              </div>
            </div>

            {/* Recent Voters */}
            <div className="backdrop-blur-md bg-[rgba(38,38,38,0.4)] border border-[rgba(73,72,71,0.15)] rounded-2xl p-6 flex flex-col gap-6">
              <h4 className="text-xs font-bold text-[#adaaaa] uppercase tracking-widest">Recent Voters</h4>
              
              <div className="flex flex-col gap-4">
                {[
                  { name: "vitalik.eth", vote: "For", color: "text-[#cafd00]" },
                  { name: "aeyakovenko.sol", vote: "Against", color: "text-[#ff7351]" },
                  { name: "balajis.eth", vote: "For", color: "text-[#cafd00]" },
                ].map((voter) => (
                  <div key={voter.name} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#262626]" />
                      <span className="text-xs font-medium text-white group-hover:text-[#cafd00] transition-colors">{voter.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${voter.color}`}>{voter.vote}</span>
                  </div>
                ))}
              </div>

              <button className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-widest pt-2 flex items-center justify-center gap-2 hover:text-white transition-colors">
                View All 1,248 Voters
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </DaoShell>
  );
}
