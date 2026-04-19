"use client";

import { useEffect, useRef, useState } from "react";

export type ServerEvent<T = unknown> = {
  channel: string;
  payload: T;
  at: number;
};

export interface UseServerEventsOptions<T = unknown> {
  channels?: string[];
  onEvent?: (event: ServerEvent<T>) => void;
  enabled?: boolean;
}

/**
 * Subscribe to the `/api/events` SSE stream.
 * Automatically reconnects with backoff.
 */
export function useServerEvents<T = unknown>({
  channels,
  onEvent,
  enabled = true,
}: UseServerEventsOptions<T> = {}) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<ServerEvent<T> | null>(null);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let cancelled = false;
    let retry = 0;
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (cancelled) return;
      const qs = channels && channels.length ? `?channels=${encodeURIComponent(channels.join(","))}` : "";
      es = new EventSource(`/api/events${qs}`);

      es.onopen = () => {
        retry = 0;
        setConnected(true);
      };

      const handle = (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as ServerEvent<T>;
          setLastEvent(data);
          handlerRef.current?.(data);
        } catch {
          /* ignore */
        }
      };

      // Listen to every declared channel as a named event; also catch generic messages.
      (channels ?? []).forEach((c) => es?.addEventListener(c, handle as EventListener));
      es.onmessage = handle;

      es.onerror = () => {
        setConnected(false);
        es?.close();
        es = null;
        retry = Math.min(retry + 1, 6);
        const delay = Math.min(1000 * 2 ** retry, 30_000);
        retryTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      es?.close();
      setConnected(false);
    };
  }, [enabled, channels?.join(",")]);

  return { connected, lastEvent };
}
