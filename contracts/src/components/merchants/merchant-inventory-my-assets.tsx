"use client";

import { useState } from "react";
import clsx from "clsx";
import { Plus, CheckCircle2, ChevronRight, Package, Cpu, Fingerprint, FileText } from "lucide-react";

const filterTabs = [
  "All Assets",
  "Hardware",
  "Subscriptions",
  "Digital Assets",
];

const assets = [
  {
    id: "1",
    type: "Hardware",
    status: "Shipped",
    title: "Solar Charger Pro",
    description:
      "High-efficiency portable power module for off-grid terminal operations.",
    date: "Redeemed 12.04.24",
    actionText: "Track Order",
    icon: <Package className="h-5 w-5 text-current" />,
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
  },
  {
    id: "2",
    type: "Hardware",
    status: "Active",
    title: "Node Case v2",
    description:
      "Ruggedized enclosure for decentralized compute modules. IP67 rated.",
    date: "REDEMPTION: #8821-X",
    actionText: "Config",
    icon: <Cpu className="h-5 w-5 text-current" />,
    image:
      "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&q=80",
  },
  {
    id: "3",
    type: "Digital Asset",
    status: "Digital Asset",
    title: "Active Subscription",
    description:
      "Real-time ecosystem analytics & premium API access for merchant nodes.",
    date: "Renews in 14 days",
    actionText: "Manage",
    icon: <ChevronRight className="h-5 w-5 text-current" />,
    gradientBg: true,
  },
  {
    id: "4",
    type: "Hardware",
    status: "Shipped",
    title: "Bio-Key Genesis",
    description:
      "Physical cold-storage authentication device with fingerprint sensor.",
    date: "Redeemed 28.03.24",
    actionText: "View Manual",
    icon: <Fingerprint className="h-5 w-5 text-current" />,
    image:
      "https://images.unsplash.com/photo-1582136081186-5384bc1334c4?w=600&q=80",
  },
  {
    id: "5",
    type: "Digital Asset",
    status: "Digital Asset",
    title: "Genesis Certificate",
    description:
      "Non-fungible ownership record for Early Operator Tier infrastructure.",
    date: "ID: 0x442...EA19",
    actionText: "Open Vault",
    icon: <FileText className="h-5 w-5 text-current" />,
    image:
      "https://images.unsplash.com/photo-1614064000300-8cb494a37b3f?w=600&q=80",
  },
];

export function MerchantInventoryMyAssets() {
  const [activeTab, setActiveTab] = useState("All Assets");

  const filteredAssets = assets.filter((asset) => {
    if (activeTab === "All Assets") return true;
    if (activeTab === "Subscriptions" && asset.title.includes("Subscription")) return true;
    return asset.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-8 md:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="font-['Plus_Jakarta_Sans'] text-5xl font-extrabold tracking-tight">
              Merchant <span className="text-[#cafd00]">Inventory</span>
            </h1>
            <p className="text-lg text-[#adaaaa] leading-relaxed">
              Manage your redeemed hardware, active service nodes, and digital utility subscriptions within the ECO_SYSTEM infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-6 rounded-xl border border-[rgba(73,72,71,0.15)] bg-[rgba(38,38,38,0.4)] px-6 py-4 backdrop-blur-md">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#adaaaa]">
                Total Assets
              </span>
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold">
                24
              </span>
            </div>
            <div className="h-8 w-px bg-[rgba(73,72,71,0.3)]" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#adaaaa]">
                Active nodes
              </span>
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#cafd00]">
                08
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-4 mb-10 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "rounded-full px-6 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border",
                activeTab === tab
                  ? "bg-[#cafd00] text-[#3a4a00] border-transparent"
                  : "bg-[#262626] text-white border-[rgba(73,72,71,0.2)] hover:bg-[#333]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Redeem New Asset Card */}
          <button className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[rgba(73,72,71,0.3)] bg-transparent hover:bg-[rgba(255,255,255,0.02)] transition-colors p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#262626]">
              <Plus className="h-8 w-8 text-[#adaaaa]" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-[#adaaaa]">
              Redeem New Asset
            </h3>
            <p className="text-xs text-[#adaaaa] max-w-[200px]">
              Use your credits to unlock more ecosystem hardware.
            </p>
          </button>

          {/* Render Asset Cards */}
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative isolate flex flex-col overflow-hidden rounded-xl bg-[#131313] min-h-[380px]"
            >
              {/* Image/Top Area */}
              <div className="relative flex h-48 w-full shrink-0 flex-col items-center justify-center bg-[#262626] z-10 overflow-hidden">
                {asset.image && (
                  <img
                    src={asset.image}
                    alt={asset.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {asset.gradientBg && (
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(243,255,202,1)_0%,rgba(243,255,202,0)_70%)]" />
                )}
                {/* Status Badge */}
                <div className="absolute right-4 top-4 z-20">
                  <div
                    className={clsx(
                      "flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm",
                      asset.status === "Active"
                        ? "bg-[#cafd00] text-[#3a4a00]"
                        : "bg-[rgba(38,38,38,0.9)] border border-[rgba(243,255,202,0.2)] text-[#f3ffca]"
                    )}
                  >
                    {asset.status}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex flex-1 flex-col p-6 z-20 bg-[#131313]">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">
                    {asset.title}
                  </h3>
                  <div className="text-[#adaaaa]">{asset.icon}</div>
                </div>

                <p className="text-sm text-[#adaaaa] leading-relaxed mb-6 flex-1">
                  {asset.description}
                </p>

                <div className="flex items-center justify-between border-t border-[rgba(73,72,71,0.15)] pt-4 mt-auto">
                  <span className="text-[10px] uppercase text-[#adaaaa]">
                    {asset.date}
                  </span>
                  <button className="text-sm font-semibold text-[#f3ffca] hover:text-[#cafd00] transition-colors">
                    {asset.actionText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
