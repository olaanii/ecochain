"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface BlockchainStatusProps {
  network?: string;
  blockHeight?: number;
  className?: string;
}

export function BlockchainStatus({
  network = "Initia Testnet",
  blockHeight,
  className
}: BlockchainStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [currentBlock, setCurrentBlock] = useState(blockHeight || 0);

  useEffect(() => {
    // Simulate connection status
    const timer = setTimeout(() => {
      setStatus('connected');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Simulate block updates
    if (status === 'connected') {
      const interval = setInterval(() => {
        setCurrentBlock(prev => prev + 1);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const statusConfig = {
    connected: {
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      label: 'Connected',
      icon: '●'
    },
    connecting: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      label: 'Connecting',
      icon: '◐'
    },
    disconnected: {
      color: 'text-slate-400',
      bgColor: 'bg-slate-400/10',
      label: 'Disconnected',
      icon: '○'
    },
    error: {
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      label: 'Error',
      icon: '✕'
    }
  };

  const config = statusConfig[status];

  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "flex h-2 w-2 items-center justify-center text-xs",
            config.color,
            status === 'connecting' && "animate-pulse"
          )}
          aria-hidden="true"
        >
          {config.icon}
        </span>
        <span className="text-sm font-medium text-slate-200">
          {network}
        </span>
      </div>
      
      <Badge
        variant={status === 'connected' ? 'success' : status === 'error' ? 'error' : 'default' as const}
        className="text-xs"
      >
        {config.label}
      </Badge>

      {status === 'connected' && currentBlock > 0 && (
        <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
          <span>Block:</span>
          <span className="font-mono text-emerald-400">
            {currentBlock.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
