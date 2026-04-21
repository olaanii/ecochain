"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  MessageCircle,
  Vote,
  TrendingUp,
  Star,
  ArrowRight,
  Award,
  Globe,
} from "lucide-react";
import clsx from "clsx";

const tabs = ["leaderboard", "governance", "activity"] as const;
type Tab = (typeof tabs)[number];

const leaderboard = [
  { rank: 1, name: "eco_alex", eco: 45200, tasks: 89, streak: 12 },
  { rank: 2, name: "green_mara", eco: 38100, tasks: 76, streak: 8 },
  { rank: 3, name: "treerunner", eco: 34500, tasks: 68, streak: 15 },
  { rank: 4, name: "recycleking", eco: 31200, tasks: 62, streak: 5 },
  { rank: 5, name: "bikecommuter", eco: 28900, tasks: 58, streak: 7 },
  { rank: 6, name: "solarpunk", eco: 26700, tasks: 54, streak: 3 },
  { rank: 7, name: "zerowaste", eco: 24300, tasks: 49, streak: 9 },
  { rank: 8, name: "climateguard", eco: 22100, tasks: 45, streak: 4 },
  { rank: 9, name: "earthkeeper", eco: 19800, tasks: 41, streak: 6 },
  { rank: 10, name: "blueplanet", eco: 17600, tasks: 36, streak: 2 },
];

const proposals = [
  { id: "14", title: "Increase staking APY from 8% to 10%", status: "active", votes: { for: 65, against: 12 }, endDate: "Apr 25, 2026" },
  { id: "13", title: "Add community moderation rewards", status: "passed", votes: { for: 89, against: 5 }, endDate: "Apr 10, 2026" },
  { id: "12", title: "Launch mobile app v2", status: "passed", votes: { for: 94, against: 2 }, endDate: "Apr 5, 2026" },
  { id: "11", title: "Reduce task verification time", status: "rejected", votes: { for: 32, against: 58 }, endDate: "Mar 28, 2026" },
];

const recentActivity = [
  { id: "1", user: "eco_alex", action: "completed", target: "Tree Planting Drive", time: "5 min ago" },
  { id: "2", user: "green_mara", action: "earned", target: "200 ECO", time: "12 min ago" },
  { id: "3", user: "treerunner", action: "voted on", target: "Proposal #14", time: "23 min ago" },
  { id: "4", user: "recycleking", action: "staked", target: "500 ECO", time: "45 min ago" },
  { id: "5", user: "bikecommuter", action: "achieved", target: "5-day streak", time: "1 hr ago" },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Community
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Leaderboard, governance, and community activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Community Size", value: "3,841", icon: Users },
          { label: "Your Rank", value: "#142", icon: Trophy },
          { label: "Active Proposals", value: "2", icon: Vote },
          { label: "Your Votes", value: "12", icon: MessageCircle },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  {s.label}
                </p>
                <p
                  className="mt-2 text-2xl font-semibold tracking-[-0.5px] text-[var(--color-text-dark)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {s.value}
                </p>
              </div>
              <div className="rounded-xl bg-[#f2f4f4] p-2.5 text-[var(--color-text-muted)]">
                <s.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-surface-muted,#e4e9ea)]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={clsx(
              "px-4 py-2 text-sm font-medium capitalize transition-colors",
              activeTab === t
                ? "border-b-2 border-[var(--color-text-dark)] text-[var(--color-text-dark)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "leaderboard" && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f2f4f4] text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Rank</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">User</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">ECO</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Tasks</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f4]">
              {leaderboard.map((user) => (
                <tr key={user.rank} className="transition-colors hover:bg-[#f9f9f9]">
                  <td className="px-6 py-4">
                    {user.rank <= 3 ? (
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        user.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                        user.rank === 2 ? "bg-gray-200 text-gray-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {user.rank}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">{user.rank}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--color-text-dark)]">@{user.name}</td>
                  <td className="px-6 py-4 text-[#3b6934] font-semibold">{user.eco.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[var(--color-text-muted)]">{user.tasks}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-[#a05c1a]">
                      <TrendingUp size={12} /> {user.streak} days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "governance" && (
        <div className="space-y-4">
          {proposals.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2 ${
                    p.status === "active" ? "bg-blue-100 text-blue-700" :
                    p.status === "passed" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    <Vote size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[var(--color-text-muted)]">Proposal #{p.id}</span>
                    <h3 className="font-semibold text-[var(--color-text-dark)]">{p.title}</h3>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Ends: {p.endDate}</p>
                  </div>
                </div>
                <span className={clsx(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  p.status === "active" ? "bg-blue-100 text-blue-700" :
                  p.status === "passed" ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700",
                )}>
                  {p.status}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-2">
                  <span>For: {p.votes.for}%</span>
                  <span>Against: {p.votes.against}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2f4f4]">
                  <div 
                    className="h-full rounded-full bg-[#3b6934]"
                    style={{ width: `${p.votes.for}%` }}
                  />
                </div>
              </div>

              {p.status === "active" && (
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-xl bg-[#3b6934] py-2 text-sm font-medium text-white transition-opacity hover:opacity-80">
                    Vote For
                  </button>
                  <button className="flex-1 rounded-xl border border-[var(--color-surface-muted,#e4e9ea)] py-2 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[#f2f4f4]">
                    Vote Against
                  </button>
                </div>
              )}
            </div>
          ))}
          
          <Link
            href="/governance"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#f2f4f4] px-4 py-3 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[#e4e9ea]"
          >
            View All Proposals <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-dark)]">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="rounded-full bg-[#f2f4f4] p-2 text-[var(--color-text-muted)]">
                    <Globe size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-text-dark)]">
                      <span className="font-semibold">@{a.user}</span>{" "}
                      <span className="text-[var(--color-text-muted)]">{a.action}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#3b6934] p-3 text-white">
                <Star size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text-dark)]">Join the Conversation</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Connect with 3,841 eco-warriors in our community.
                </p>
              </div>
              <a
                href="https://discord.gg/ecochain"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto rounded-xl bg-[#f2f4f4] px-4 py-2 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[#e4e9ea]"
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
