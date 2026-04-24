"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, CheckCircle2, XCircle, RotateCcw, MoreHorizontal, FileText } from "lucide-react";
import clsx from "clsx";

interface Sponsor {
  id: string;
  displayName: string | null;
  username: string | null;
  initiaAddress: string;
  role: string;
  createdAt: string;
  _count?: { verifications: number };
}

interface SponsorRequest {
  id: string;
  userId: string;
  clerkId: string;
  businessName: string;
  contactInfo: string;
  reason: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string | null;
    username: string | null;
    initiaAddress: string;
    email: string | null;
    role: string;
    createdAt: string;
  };
}

const filterTabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminSponsorsPage() {
  const params = useSearchParams();
  const filter = params.get("filter") ?? "all";
  const [items, setItems] = useState<(Sponsor | SponsorRequest)[]>([]);
  const [total, setTotal] = useState(0);
  const [itemsType, setItemsType] = useState<"users" | "requests">("users");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/sponsors?filter=${filter}`)
      .then((r) => r.json())
      .then((d) => { 
        setItems(d.items ?? []); 
        setTotal(d.total ?? 0);
        setItemsType(d.type ?? "users");
      })
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleAction(id: string, action: "approve" | "reject" | "revoke", requestId?: string) {
    setActing(id);
    await fetch("/api/admin/sponsors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        sponsorId: requestId ? undefined : id,
        requestId,
        action,
      }),
    });
    setItems((prev) => prev.filter((s) => s.id !== id));
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
            Sponsors
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Approve or reject sponsor onboarding requests. Total: {total}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-[#e4e9ea]">
          {filterTabs.map((t) => (
            <a
              key={t.key}
              href={t.key === "all" ? "/admin/sponsors" : `/admin/sponsors?filter=${t.key}`}
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

        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-[#f2f4f4]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Globe size={32} className="text-[#c8d0d1]" />
              <p className="text-sm text-[#5a6061]">No sponsors found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f2f4f4] text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">
                    {itemsType === "requests" ? "Business / User" : "Name"}
                  </th>
                  {itemsType === "requests" && (
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Contact</th>
                  )}
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Address</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Joined</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4f4]">
                {items.map((item) => {
                  const isRequest = itemsType === "requests";
                  const request = isRequest ? item as SponsorRequest : null;
                  const sponsor = isRequest ? request!.user : item as Sponsor;
                  const id = isRequest ? request!.id : sponsor.id;
                  const displayName = isRequest 
                    ? request!.businessName 
                    : (sponsor.displayName ?? sponsor.username ?? "—");
                  const address = isRequest ? request!.user.initiaAddress : sponsor.initiaAddress;
                  const status = isRequest ? request!.status : sponsor.role;
                  const createdAt = isRequest ? request!.createdAt : sponsor.createdAt;

                  return (
                    <tr key={id} className="group transition-colors hover:bg-[#f9f9f9]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2d3435]">{displayName}</p>
                          {isRequest && (
                            <p className="text-xs text-[#5a6061]">{sponsor.displayName ?? sponsor.email ?? "—"}</p>
                          )}
                        </div>
                      </td>
                      {isRequest && (
                        <td className="px-6 py-4 text-xs text-[#5a6061]">{request!.contactInfo}</td>
                      )}
                      <td className="px-6 py-4 font-mono text-xs text-[#5a6061]">
                        {address.slice(0, 16)}…
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          status === "sponsor" || status === "approved" ? "bg-green-100 text-green-700" :
                          status === "rejected" || status === "rejected_sponsor" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700",
                        )}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#5a6061]">
                        {new Date(createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isRequest ? (
                            <>
                              <button
                                disabled={acting === id}
                                onClick={() => handleAction(sponsor.id, "approve", id)}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                disabled={acting === id}
                                onClick={() => handleAction(sponsor.id, "reject", id)}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          ) : (
                            <>
                              {sponsor.role !== "sponsor" && (
                                <button
                                  disabled={acting === id}
                                  onClick={() => handleAction(id, "approve")}
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                                >
                                  <CheckCircle2 size={13} /> Approve
                                </button>
                              )}
                              {sponsor.role !== "rejected_sponsor" && (
                                <button
                                  disabled={acting === id}
                                  onClick={() => handleAction(id, "reject")}
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                  <XCircle size={13} /> Reject
                                </button>
                              )}
                              {sponsor.role === "sponsor" && (
                                <button
                                  disabled={acting === id}
                                  onClick={() => handleAction(id, "revoke")}
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-[#5a6061] hover:bg-[#f2f4f4] disabled:opacity-50"
                                >
                                  <RotateCcw size={13} /> Revoke
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
