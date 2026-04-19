"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { PushToggle } from "@/components/notifications/push-toggle";
import { useServerEvents } from "@/hooks/use-server-events";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
}

interface NotificationCenterProps {
  userId?: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setUnread(0);
      return;
    }
    try {
      const res = await fetch(`/api/notifications/list?userId=${encodeURIComponent(userId)}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setItems(json.data.items ?? []);
        setUnread(json.data.unread ?? 0);
      }
    } catch {
      /* ignore */
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useServerEvents({
    channels: ["notification.created"],
    onEvent: () => load(),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const markAll = useCallback(async () => {
    if (!userId) return;
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    load();
  }, [userId, load]);

  const markOne = useCallback(
    async (id: string) => {
      if (!userId) return;
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, id }),
      });
      load();
    },
    [userId, load],
  );

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors hover:bg-[var(--color-secondary-alt)]"
      >
        <Bell size={18} className="text-[var(--color-text-dark)]" />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#3b6934] px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-sm border border-[rgba(45,52,53,0.08)] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[rgba(45,52,53,0.08)] px-4 py-3">
            <span
              className="text-[#2d3435]"
              style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, letterSpacing: "0.36px", textTransform: "uppercase" }}
            >
              Notifications
            </span>
            {unread > 0 ? (
              <button onClick={markAll} className="text-xs text-[#3b6934]" style={{ fontFamily: "var(--font-body)" }}>
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!userId ? (
              <div className="p-6 text-center text-sm text-[#5a6061]">Sign in to see your notifications.</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#5a6061]">You're all caught up.</div>
            ) : (
              <ul className="divide-y divide-[rgba(45,52,53,0.06)]">
                {items.map((n) => (
                  <li
                    key={n.id}
                    onClick={() => markOne(n.id)}
                    className={`cursor-pointer px-4 py-3 ${n.read ? "bg-white" : "bg-[rgba(59,105,52,0.04)]"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2d3435]">{n.title}</span>
                      <span className="text-[10px] text-[#adb3b4]">
                        {new Date(n.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#5a6061]">{n.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-[rgba(45,52,53,0.08)] p-3">
            <PushToggle userId={userId} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
