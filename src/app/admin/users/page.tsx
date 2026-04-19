"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { Search, MoreHorizontal, ShieldAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

const users = [
  { id: "1", name: "eco_alex", address: "init1abc...def", role: "user", level: 8, rewards: 12400, status: "active", joined: "Jan 2026" },
  { id: "2", name: "green_mara", address: "init1xyz...uvw", role: "user", level: 6, rewards: 8900, status: "active", joined: "Feb 2026" },
  { id: "3", name: "anon92", address: "init1sus...pct", role: "user", level: 2, rewards: 300, status: "flagged", joined: "Apr 2026" },
  { id: "4", name: "GreenFleet Ltd", address: "init1spo...nsr", role: "sponsor", level: 1, rewards: 0, status: "active", joined: "Mar 2026" },
  { id: "5", name: "treerunner", address: "init1tre...run", role: "user", level: 5, rewards: 6200, status: "active", joined: "Feb 2026" },
  { id: "6", name: "spambot44", address: "init1bot...444", role: "user", level: 1, rewards: 50, status: "suspended", joined: "Apr 2026" },
];

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  flagged: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
};

const roleColor: Record<string, string> = {
  user: "bg-[#e4e9ea] text-[#5a6061]",
  sponsor: "bg-amber-100 text-amber-700",
  admin: "bg-red-100 text-red-700",
};

export default function AdminUsersPage() {
  const params = useSearchParams();
  const filter = params.get("filter") ?? "all";

  const filtered = users.filter((u) => {
    if (filter === "all") return true;
    return u.status === filter;
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Users
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Manage accounts, roles, and access across the platform.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6061]" />
            <input
              type="text"
              placeholder="Search by name or address…"
              className="w-full rounded-xl border border-[#e4e9ea] bg-white py-2.5 pl-9 pr-4 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-[#5a6061]">
            <ShieldAlert size={13} className="text-amber-500" />
            <span>{users.filter((u) => u.status === "flagged").length} flagged</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f2f4f4] text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">User</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Address</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Role</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Level</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Total ECO</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f4]">
              {filtered.map((user) => (
                <tr key={user.id} className="group transition-colors hover:bg-[#f9f9f9]">
                  <td className="px-6 py-4 font-medium text-[#2d3435]">@{user.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[#5a6061]">{user.address}</td>
                  <td className="px-6 py-4">
                    <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", roleColor[user.role])}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#5a6061]">{user.level}</td>
                  <td className="px-6 py-4 text-[#5a6061]">{user.rewards.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[#5a6061]">{user.joined}</td>
                  <td className="px-6 py-4">
                    <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusColor[user.status])}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-1 text-[#5a6061] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#e4e9ea]">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-[#5a6061]">No users found.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
