"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { Search, ShieldAlert, Users, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";

interface DbUser {
  id: string;
  displayName: string | null;
  username: string | null;
  initiaAddress: string;
  role: string;
  level: number;
  totalRewards: number;
  createdAt: string;
  _count: { verifications: number };
}

const roleColor: Record<string, string> = {
  user: "bg-[#e4e9ea] text-[#5a6061]",
  sponsor: "bg-amber-100 text-amber-700",
  admin: "bg-purple-100 text-purple-700",
  owner: "bg-red-100 text-red-700",
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "flagged", label: "Flagged" },
  { key: "suspended", label: "Suspended" },
];

export default function AdminUsersPage() {
  const params = useSearchParams();
  const filter = params.get("filter") ?? "all";
  const [users, setUsers] = useState<DbUser[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [roleMenu, setRoleMenu] = useState<string | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function doSearch(q: string) {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setSearch(q), 300);
  }

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ filter, limit: "50" });
    if (search) p.set("search", search);
    fetch(`/api/admin/users?${p}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.items ?? []); setTotal(d.total ?? 0); setNextCursor(d.nextCursor); })
      .finally(() => setLoading(false));
  }, [filter, search]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    const p = new URLSearchParams({ filter, limit: "50", cursor: nextCursor });
    if (search) p.set("search", search);
    const d = await fetch(`/api/admin/users?${p}`).then((r) => r.json());
    setUsers((prev) => [...prev, ...(d.items ?? [])]);
    setNextCursor(d.nextCursor);
    setLoadingMore(false);
  }

  async function changeRole(userId: string, role: string) {
    setActing(userId);
    setRoleMenu(null);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    setActing(null);
  }

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
            Manage accounts, roles, and access across the platform. {total > 0 && `${total} total.`}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-[#e4e9ea]">
          {filterTabs.map((t) => (
            <a
              key={t.key}
              href={t.key === "all" ? "/admin/users" : `/admin/users?filter=${t.key}`}
              className={clsx(
                "px-4 py-2 text-sm font-medium transition-colors",
                filter === t.key
                  ? "border-b-2 border-[#2d3435] text-[#2d3435]"
                  : "text-[#5a6061] hover:text-[#2d3435]",
              )}
            >
              {t.label}
            </a>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6061]" />
            <input
              type="text"
              placeholder="Search by name or address…"
              onChange={(e) => doSearch(e.target.value)}
              className="w-full rounded-xl border border-[#e4e9ea] bg-white py-2.5 pl-9 pr-4 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-[#5a6061]">
            <ShieldAlert size={13} className="text-amber-500" />
            <span>{users.filter((u) => u.role === "flagged").length} flagged</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-[#f2f4f4]" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users size={32} className="text-[#c8d0d1]" />
              <p className="text-sm text-[#5a6061]">No users found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f2f4f4] text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">User</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Address</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Level</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Total ECO</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4f4]">
                {users.map((u) => (
                  <tr key={u.id} className="group transition-colors hover:bg-[#f9f9f9]">
                    <td className="px-6 py-4 font-medium text-[#2d3435]">
                      {u.displayName ?? u.username ?? u.initiaAddress.slice(0, 10) + "…"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#5a6061]">
                      {u.initiaAddress.slice(0, 18)}…
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        disabled={acting === u.id}
                        onClick={() => setRoleMenu(roleMenu === u.id ? null : u.id)}
                        className={clsx(
                          "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition-opacity",
                          roleColor[u.role] ?? "bg-[#e4e9ea] text-[#5a6061]",
                          acting === u.id && "opacity-50",
                        )}
                      >
                        {u.role} <ChevronDown size={10} />
                      </button>
                      {roleMenu === u.id && (
                        <div className="absolute left-6 top-full z-20 mt-1 rounded-xl border border-[#e4e9ea] bg-white shadow-lg">
                          {["user", "sponsor", "admin"].map((r) => (
                            <button
                              key={r}
                              onClick={() => changeRole(u.id, r)}
                              className="block w-full px-4 py-2 text-left text-xs capitalize text-[#2d3435] hover:bg-[#f2f4f4]"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#5a6061]">{u.level}</td>
                    <td className="px-6 py-4 text-[#5a6061]">{u.totalRewards.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[#5a6061]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {nextCursor && (
            <div className="border-t border-[#f2f4f4] px-6 py-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-sm font-medium text-[#2d6fa6] hover:underline disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
