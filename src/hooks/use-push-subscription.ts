"use client";

import { useCallback, useEffect, useState } from "react";

type PermissionState = NotificationPermission | "unsupported";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function usePushSubscription(_userId?: string) {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    navigator.serviceWorker.getRegistration("/sw.js").then(async (reg) => {
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  const subscribe = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("push_unsupported");
      }
      const permResult = await Notification.requestPermission();
      setPermission(permResult);
      if (permResult !== "granted") throw new Error("permission_denied");

      const keyRes = await fetch("/api/notifications/subscribe", { method: "GET" });
      const keyJson = await keyRes.json();
      const publicKey: string | null = keyJson?.data?.publicKey ?? null;
      if (!publicKey) throw new Error("vapid_key_missing");

      const reg = (await navigator.serviceWorker.getRegistration("/sw.js")) ||
        (await navigator.serviceWorker.register("/sw.js"));
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      });

      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      });
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown");
    } finally {
      setBusy(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, []);

  return { permission, subscribed, busy, error, subscribe, unsubscribe };
}
