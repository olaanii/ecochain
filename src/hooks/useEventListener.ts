/**
 * useEventListener Hook
 * 
 * React hook for managing blockchain event listener
 * Provides status, start/stop controls, and failed event management
 */

import { useEffect, useState, useCallback } from 'react';

export interface EventListenerStatus {
  isListening: boolean;
  lastBlockProcessed: bigint;
  queueSize: number;
}

export interface FailedEvent {
  id: string;
  type: string;
  error?: string;
  failedAt: string;
}

export interface Alert {
  eventId: string;
  eventType: string;
  error?: string;
  timestamp: string;
}

/**
 * Hook for managing blockchain event listener
 */
export function useEventListener() {
  const [status, setStatus] = useState<EventListenerStatus | null>(null);
  const [failedEvents, setFailedEvents] = useState<FailedEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch listener status
   */
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blockchain/events');
      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch failed events
   */
  const fetchFailedEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/blockchain/events?action=failed');
      const data = await response.json();

      if (data.success) {
        setFailedEvents(data.failedEvents || []);
      }
    } catch (err) {
      console.error('Error fetching failed events:', err);
    }
  }, []);

  /**
   * Fetch recent alerts
   */
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/blockchain/events?action=alerts');
      const data = await response.json();

      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, []);

  /**
   * Start event listener
   */
  const start = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blockchain/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchStatus();
        setError(null);
      } else {
        setError(data.error || 'Failed to start listener');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  /**
   * Stop event listener
   */
  const stop = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blockchain/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchStatus();
        setError(null);
      } else {
        setError(data.error || 'Failed to stop listener');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  /**
   * Clear failed events
   */
  const clearFailed = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blockchain/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-failed' }),
      });

      const data = await response.json();

      if (data.success) {
        setFailedEvents([]);
        setError(null);
      } else {
        setError(data.error || 'Failed to clear failed events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchStatus(), fetchFailedEvents(), fetchAlerts()]);
  }, [fetchStatus, fetchFailedEvents, fetchAlerts]);

  /**
   * Auto-refresh status every 10 seconds
   */
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    status,
    failedEvents,
    alerts,
    loading,
    error,
    start,
    stop,
    clearFailed,
    refresh,
    fetchStatus,
    fetchFailedEvents,
    fetchAlerts,
  };
}
