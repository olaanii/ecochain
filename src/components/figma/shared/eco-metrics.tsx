"use client";

import { Card } from "@/components/ui/card";
import clsx from "clsx";

export interface EcoMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
}

export interface EcoMetricsProps {
  metrics: EcoMetric[];
  title?: string;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function EcoMetrics({
  metrics,
  title,
  variant = 'default',
  className
}: EcoMetricsProps) {
  return (
    <Card
      variant="glass"
      padding={variant === 'compact' ? 'sm' : 'md'}
      title={title}
      className={className}
    >
      <div
        className={clsx(
          "grid gap-4",
          variant === 'compact' ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-2">
              {metric.icon && (
                <span className="text-lg" aria-hidden="true">
                  {metric.icon}
                </span>
              )}
              <span className="text-xs text-slate-400">{metric.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-300">
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-sm text-slate-400">{metric.unit}</span>
              )}
            </div>
            {metric.trend && metric.trendValue && (
              <div
                className={clsx(
                  "flex items-center gap-1 text-xs",
                  metric.trend === 'up' && "text-emerald-400",
                  metric.trend === 'down' && "text-red-400",
                  metric.trend === 'neutral' && "text-slate-400"
                )}
              >
                {metric.trend === 'up' && (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {metric.trend === 'down' && (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{metric.trendValue}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
