"use client";

import React from "react";
import { 
  Cpu, 
  Activity, 
  Zap, 
  Shield, 
  Terminal, 
  Settings, 
  User, 
  LayoutGrid, 
  Target, 
  BookOpen, 
  Bell,
  Wifi,
  ChevronRight,
  TrendingUp,
  Snowflake,
  Search,
  ExternalLink
} from "lucide-react";
import Image from "next/image";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function AuraSidebarItem({ icon, label, active }: SidebarItemProps) {
  return (
    <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
      active ? "bg-[rgba(202,253,0,0.05)] text-[#cafd00]" : "text-[#adaaaa] hover:text-white hover:bg-white/5"
    }`}>
      <span className={active ? "text-[#cafd00]" : "text-[#494847]"}>{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

export function AuraOSShell({ children, activeItem = "Goals" }: { children: React.ReactNode, activeItem?: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-['Plus_Jakarta_Sans']">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col fixed inset-y-0 z-50 pt-10">
        <div className="px-8 mb-12 flex flex-col gap-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a3a00] to-[#0a0a0a] border border-[#cafd00]/20 flex items-center justify-center">
                 <Zap className="w-5 h-5 text-[#cafd00]" />
              </div>
              <div className="flex flex-col">
                 <h2 className="text-sm font-black text-white uppercase tracking-tighter">AURA_v2.0</h2>
                 <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest leading-none">System Active</span>
              </div>
           </div>
        </div>

        <nav className="px-4 flex flex-col gap-2">
           <AuraSidebarItem icon={<Target className="w-4 h-4" />} label="Missions" active={activeItem === "Missions"} />
           <AuraSidebarItem icon={<Target className="w-4 h-4" />} label="Goals" active={activeItem === "Goals"} />
           <AuraSidebarItem icon={<BookOpen className="w-4 h-4" />} label="Learning" active={activeItem === "Learning"} />
           <AuraSidebarItem icon={<Bell className="w-4 h-4" />} label="Alerts" active={activeItem === "Alerts"} />
        </nav>

        <div className="mt-auto p-4 flex flex-col gap-8">
           <button className="w-full bg-[#cafd00] text-[#3a4a00] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[2px] shadow-[0_0_20px_rgba(202,253,0,0.15)] hover:scale-105 transition-all">
              NEURAL_SYNC
           </button>
           
           <div className="flex flex-col gap-2">
              <button className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-[#494847] hover:text-white transition-colors uppercase tracking-widest">
                 <Settings className="w-3.5 h-3.5" />
                 Settings
              </button>
              <button className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-[#494847] hover:text-white transition-colors uppercase tracking-widest">
                 <Terminal className="w-3.5 h-3.5" />
                 Terminal
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-12 sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
           <div className="flex items-center gap-12">
              <h1 className="text-xl font-black text-white tracking-tighter uppercase cursor-pointer hover:text-[#cafd00] transition-colors">AURA_OS</h1>
              <nav className="flex items-center gap-8">
                 {["DIRECTIVES", "SYNC", "NEURAL_LINK"].map((link) => (
                   <button 
                    key={link} 
                    className={`text-[10px] font-bold uppercase tracking-[2px] transition-all hover:text-white ${
                      link === "SYNC" ? "text-white border-b border-[#cafd00] pb-1" : "text-[#494847]"
                    }`}
                   >
                    {link}
                   </button>
                 ))}
              </nav>
           </div>

           <div className="flex items-center gap-6">
              <button className="p-2 text-[#494847] hover:text-[#cafd00] transition-colors"><Wifi className="w-5 h-5" /></button>
              <button className="p-2 text-[#494847] hover:text-[#cafd00] transition-colors"><Cpu className="w-5 h-5" /></button>
              <button className="p-2 text-[#494847] hover:text-white transition-colors"><User className="w-5 h-5" /></button>
           </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export function ActionOptimization() {
  return (
    <AuraOSShell activeItem="Goals">
      <div className="p-12 max-w-[1500px] flex flex-col gap-10">
        
        {/* Title Section */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#cafd00]" />
              <span className="text-[10px] font-black text-[#cafd00] uppercase tracking-[3px]">Optimization Protocol Alpha-9</span>
           </div>
           
           <div className="max-w-4xl flex flex-col gap-4">
              <h2 className="text-8xl font-black text-white tracking-tighter uppercase leading-none">
                 Action <span className="text-[#cafd00]">Optimization</span>
              </h2>
              <p className="text-sm text-[#adaaaa] font-medium leading-relaxed">
                 Aura AI has analyzed your current operational trajectory. Implementation of the following recommendations will yield a significant increase in ECO-yield and neural efficiency.
              </p>
           </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
           
           {/* Primary Comparison Card */}
           <div className="xl:col-span-8 bg-[#111111] border border-white/5 rounded-[48px] p-12 flex flex-col gap-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                 <Zap className="w-48 h-48 text-white" />
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#cafd00]/30 transition-colors">
                       <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Node Deployment Strategy</h3>
                       <span className="text-[10px] font-bold text-[#494847] uppercase tracking-widest">Recommended shift in regional allocation</span>
                    </div>
                 </div>
                 <div className="bg-[#cafd00]/10 border border-[#cafd00]/20 px-3 py-1 rounded text-[10px] font-bold text-[#cafd00] uppercase tracking-widest leading-none">
                    +15% ECO Yield
                 </div>
              </div>

              <div className="flex items-center justify-between relative">
                 {/* VS Badge */}
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-black text-[#494847] z-10">VS</div>
                 
                 {/* Current Action */}
                 <div className="w-[45%] flex flex-col gap-6 p-8 rounded-[32px] border border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-bold text-[#494847] uppercase tracking-widest">Current Action</span>
                       <h4 className="text-2xl font-black text-white uppercase tracking-tight">Manual Relay Mode</h4>
                    </div>
                    <p className="text-[10px] text-[#adaaaa] font-medium leading-relaxed">
                       Standard energy distribution across existing legacy nodes with high latency overhead.
                    </p>
                    <div className="flex items-baseline gap-2 pt-4 border-t border-white/5">
                       <span className="text-3xl font-black text-white">0.84</span>
                       <span className="text-[10px] font-bold text-[#494847] uppercase">ECO/SEC</span>
                    </div>
                 </div>

                 {/* Aura Recommendation */}
                 <div className="w-[45%] flex flex-col gap-6 p-8 rounded-[32px] border border-[#cafd00]/20 bg-[#cafd00]/5 shadow-[0_0_30px_rgba(202,253,0,0.05)]">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-bold text-[#cafd00] uppercase tracking-widest">Aura Recommendation</span>
                       <h4 className="text-2xl font-black text-white uppercase tracking-tight">Neural Pulse Sync</h4>
                    </div>
                    <p className="text-[10px] text-[#adaaaa] font-medium leading-relaxed">
                       Optimized asynchronous packet delivery using predictive buffer clustering.
                    </p>
                    <div className="flex items-baseline gap-2 pt-4 border-t border-white/5">
                       <span className="text-3xl font-black text-[#cafd00]">1.12</span>
                       <span className="text-[10px] font-bold text-[#cafd00] uppercase tracking-widest">ECO/SEC</span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-8 items-center border-t border-white/5 pt-12">
                 <p className="text-xs text-[#adaaaa] italic font-medium">"Transitioning now will save 4.2k in computation waste."</p>
                 <button className="bg-[#cafd00] text-[#3a4a00] px-16 py-6 rounded-3xl text-sm font-black uppercase tracking-[3px] shadow-[0_0_30px_rgba(202,253,0,0.25)] hover:scale-105 transition-all">
                    EXECUTEREC OMMENDATION
                 </button>
              </div>
           </div>

           {/* Metrics Column */}
           <div className="xl:col-span-4 flex flex-col gap-8">
              
              {/* Real-time Rewards Gauge */}
              <div className="bg-[#111111] border border-white/5 rounded-[40px] p-8 flex flex-col gap-10 shadow-xl items-center text-center">
                 <h4 className="text-[10px] font-black text-[#494847] uppercase tracking-widest">Real-time Rewards</h4>
                 
                 <div className="relative w-44 h-44 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[10px] border-white/5" />
                    <div className="absolute inset-0 rounded-full border-[10px] border-[#cafd00] border-t-transparent -rotate-12 drop-shadow-[0_0_10px_rgba(202,253,0,0.4)]" />
                    <div className="flex flex-col items-center">
                       <span className="text-4xl font-black text-white tracking-tighter">682</span>
                       <span className="text-[9px] font-bold text-[#cafd00] uppercase tracking-widest">ECO TODAY</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 w-full gap-4">
                    <div className="bg-black border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                       <span className="text-[8px] font-bold text-[#494847] uppercase tracking-widest">Projected</span>
                       <span className="text-lg font-black text-white">1.2K</span>
                    </div>
                    <div className="bg-black border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                       <span className="text-[8px] font-bold text-[#494847] uppercase tracking-widest">Peak Rate</span>
                       <span className="text-lg font-black text-white">4.2/s</span>
                    </div>
                 </div>
              </div>

              {/* Aura Logs Section */}
              <div className="bg-[#0c0c0c] border border-white/5 rounded-[40px] p-10 flex flex-col gap-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-40">
                    <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-[#ff7351]" />
                       <div className="w-2 h-2 rounded-full bg-[#cbff12]" />
                       <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-[#494847] uppercase tracking-[3px]">AURA_LOG_v2.0</span>
                 </div>

                 <div className="flex flex-col gap-4 font-mono text-[10px] leading-relaxed">
                    <div className="flex gap-4">
                       <span className="text-[#494847]">12:04:22</span>
                       <span className="text-[#adaaaa] group-hover:text-white transition-colors">{">"} Analyzing node clusters...</span>
                    </div>
                    <div className="flex gap-4">
                       <span className="text-[#494847]">12:04:25</span>
                       <span className="text-[#ff7351] font-bold">{">"} Efficiency leak detected in Sector 4</span>
                    </div>
                    <div className="flex gap-4">
                       <span className="text-[#494847]">12:05:01</span>
                       <span className="text-[#cafd00] font-bold animate-pulse">{">"} Calculating Delta ECO projection...</span>
                    </div>
                    <div className="flex gap-4">
                       <span className="text-[#494847]">12:05:12</span>
                       <span className="text-[#adaaaa]">{">"} Suggestion: Neural Pulse Sync active</span>
                    </div>
                 </div>
              </div>

              {/* Live View Preview */}
              <div className="relative rounded-[40px] overflow-hidden group shadow-2xl h-56 border border-white/5">
                 <Image 
                   src="https://images.unsplash.com/photo-1558494949-ef010cbdcc4b?q=80&w=1500&auto=format&fit=crop" 
                   alt="Server View" 
                   fill
                   className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[2000ms]"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                 <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-[#cafd00]/20 backdrop-blur-md rounded border border-[#cafd00]/30 shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#cafd00] animate-pulse" />
                    <span className="text-[8px] font-black text-[#cafd00] uppercase tracking-widest">Live View</span>
                 </div>
                 <div className="absolute bottom-6 left-6 flex flex-col">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Neural Processing Cluster A-1</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Delta Impact Analysis */}
        <section className="bg-[#111111] border border-white/5 rounded-[48px] p-12 flex flex-col gap-10 shadow-2xl">
           <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-[#cafd00]" />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Delta Impact Analysis</h3>
           </div>

           <div className="flex flex-col gap-10">
              {[
                { label: "Energy Efficiency Delta", value: "+28.4%", color: "bg-[#cafd00]", progress: 85 },
                { label: "Computing Resource Savings", value: "+12.1%", color: "bg-white/40", progress: 45 },
                { label: "Network Latency Reduction", value: "-45.2ms", color: "bg-[#cafd00]", progress: 70 },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-4">
                   <div className="flex justify-between items-center px-2">
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</span>
                      <span className={`text-lg font-black tracking-tight ${item.value.startsWith('-') ? "text-[#cafd00]" : "text-[#cafd00]"}`}>{item.value}</span>
                   </div>
                   <div className="h-2 w-full bg-black rounded-full overflow-hidden relative">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.progress}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Tweaks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
           {[
             { label: "Memory Paging", desc: "Increase buffer size for sector-7 tasks to reduce IO wait times.", boost: "+4%", icon: <Cpu className="w-5 h-5" /> },
             { label: "Security Hash", desc: "Swap SHA-256 for Blake3 for faster identity verification cycles.", boost: "+8%", icon: <Shield className="w-5 h-5" /> },
             { label: "Thermal Reg", desc: "Adjust fan curve to prioritize noise reduction during low-load.", boost: "+2%", icon: <Snowflake className="w-5 h-5" /> },
           ].map((tweak, i) => (
             <div key={i} className="bg-[#111111] border border-white/5 rounded-3xl p-8 flex flex-col gap-6 hover:border-[#cafd00]/30 transition-all cursor-pointer group">
                <div className="flex justify-between items-center">
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#cafd00]/10 transition-colors">
                      {tweak.icon}
                   </div>
                   <span className="text-xs font-black text-[#cafd00] uppercase tracking-widest">{tweak.boost}</span>
                </div>
                <div className="flex flex-col gap-2">
                   <h5 className="text-lg font-black text-white uppercase tracking-tight leading-none">{tweak.label}</h5>
                   <p className="text-xs text-[#adaaaa] font-medium leading-relaxed">{tweak.desc}</p>
                </div>
                <button className="w-fit text-[9px] font-black text-[#adaaaa] hover:text-[#cafd00] uppercase tracking-[2px] transition-colors border-b border-white/10 pb-1 mt-4">
                   APPLY TWEAK
                </button>
             </div>
           ))}
        </div>

      </div>
    </AuraOSShell>
  );
}
