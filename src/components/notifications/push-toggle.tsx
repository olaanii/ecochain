"use client";

import { Bell, BellOff } from "lucide-react";
import { usePushSubscription } from "@/hooks/use-push-subscription";

interface PushToggleProps {
  userId?: string;
  className?: string;
}

export function PushToggle({ userId, className }: PushToggleProps) {
  const { permission, subscribed, busy, error, subscribe, unsubscribe } = usePushSubscription(userId);

  if (permission === "unsupported") return null;

  const label = subscribed ? "Notifications on" : "Enable notifications";
  const Icon = subscribed ? Bell : BellOff;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-sm border border-[rgba(45,52,53,0.08)] bg-white px-4 py-2 text-sm text-[#2d3435] transition hover:bg-[#f2f4f4] disabled:opacity-60"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <Icon className="h-4 w-4" />
        <span>{busy ? "…" : label}</span>
      </button>
      {error ? (
        <p className="mt-2 text-xs text-red-600" style={{ fontFamily: "var(--font-body)" }}>
          {error === "permission_denied"
            ? "Permission denied in your browser."
            : error === "vapid_key_missing"
              ? "Push not configured. Set VAPID keys."
              : "Couldn't enable notifications."}
        </p>
      ) : null}
    </div>
  );
}
