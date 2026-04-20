"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useEffect, useState, useCallback } from "react";
import { ScrollText, ChevronDown, Filter } from "lucide-react";

interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  resource: string;
  resourceId: string;
  payload: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const actionGroups: Record<string, string> = {
  "user.role_changed": "text-[#2d6fa6] bg-[#eaf2fb]",
  "user.banned": "text-red-700 bg-red-50",
  "user.unbanned": "text-green-700 bg-green-50",
  "user.deleted": "text-red-700 bg-red-50",
  "contract.paused": "text-amber-700 bg-amber-50",
  "contract.unpaused": "text-green-700 bg-green-50",
  "sponsor.approved": "text-green-700 bg-green-50",
  "sponsor.rejected": "text-red-700 bg-red-50",
  "fraud.proof_quarantined": "text-amber-700 bg-amber-50",
};

function ActionBadge({ action }: { action: string }) {
  const cls = actionGroups[action] ?? "text-[#5a6061] bg-[#f2f4f4]";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {action}
    </span>
  );
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionFilter, setActionFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams({ limit: "50" });
      if (cursor) params.set("cursor", cursor);
      if (actionFilter) params.set("action", actionFilter);
      const res = await fetch(`/api/admin/audit?${params}`);
      const data = await res.json();
      return data as { items: AuditEntry[]; nextCursor: string | null; total: number };
    },
    [actionFilter],
  );

  useEffect(() => {
    setLoading(true);
    load().then((d) => {
      setEntries(d.items);
      setNextCursor(d.nextCursor);
      setTotal(d.total);
    }).finally(() => setLoading(false));
  }, [load]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    const d = await load(nextCursor);
    setEntries((prev) => [...prev, ...d.items]);
    setNextCursor(d.nextCursor);
    setLoadingMore(false);
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Audit Log
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Immutable record of every privileged admin action. {total > 0 && `${total} total entries.`}
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6061]" />
            <input
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="Filter by action…"
              className="w-full rounded-xl border border-[#e4e9ea] bg-white py-2.5 pl-9 pr-4 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-[#f2f4f4]" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ScrollText size={32} className="text-[#c8d0d1]" />
              <p className="text-sm text-[#5a6061]">No audit entries yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f2f4f4] text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Action</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Resource</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Actor</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">IP</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4f4]">
                {entries.map((e) => (
                  <>
                    <tr
                      key={e.id}
                      className="group cursor-pointer transition-colors hover:bg-[#f9f9f9]"
                      onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                    >
                      <td className="whitespace-nowrap px-6 py-3 text-xs text-[#5a6061]">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <ActionBadge action={e.action} />
                      </td>
                      <td className="px-6 py-3 text-xs text-[#5a6061]">
                        {e.resource}
                        <span className="ml-1 font-mono text-[#2d3435]">{e.resourceId.slice(0, 12)}…</span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-[#5a6061]">
                        {e.actorId.slice(0, 16)}…
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-[#5a6061]">
                        {e.ipAddress ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <ChevronDown
                          size={14}
                          className={`text-[#5a6061] transition-transform ${expanded === e.id ? "rotate-180" : ""}`}
                        />
                      </td>
                    </tr>
                    {expanded === e.id && (
                      <tr key={`${e.id}-detail`}>
                        <td colSpan={6} className="bg-[#f9fafb] px-6 py-4">
                          <pre className="overflow-auto rounded-xl bg-[#f2f4f4] p-4 text-xs text-[#2d3435]">
                            {JSON.stringify(e.payload, null, 2)}
                          </pre>
                          {e.userAgent && (
                            <p className="mt-2 text-xs text-[#5a6061]">
                              <span className="font-medium">User-agent:</span> {e.userAgent}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
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
