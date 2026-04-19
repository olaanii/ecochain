"use client";

/**
 * EcoChain chart primitives — thin wrappers around Recharts that apply the
 * product's muted palette, tooltip style, and responsive container.
 */

import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart as RPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const chartPalette = {
  primary: "#3b6934",
  primarySoft: "rgba(59,105,52,0.15)",
  accent: "#6fa65a",
  neutral: "#adb3b4",
  neutralSoft: "#e4e9ea",
  muted: "#5a6061",
  series: ["#3b6934", "#6fa65a", "#adb3b4", "#2d3435", "#d7b66b", "#8cb0d9"],
} as const;

const baseAxisProps = {
  stroke: chartPalette.neutral,
  tick: { fill: chartPalette.muted, fontSize: 12, fontFamily: "var(--font-body)" },
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontFamily: "var(--font-body)",
  fontSize: 12,
  color: "var(--color-text-dark)",
  boxShadow: "var(--shadow-card)",
};

export interface SeriesPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

interface CommonProps {
  data: SeriesPoint[];
  height?: number;
  dataKey?: string;
  xKey?: string;
  color?: string;
  yFormatter?: (v: number) => string;
}

export function LineChart({
  data,
  height = 240,
  dataKey = "value",
  xKey = "label",
  color = chartPalette.primary,
  yFormatter,
}: CommonProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartPalette.neutralSoft} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} {...baseAxisProps} />
        <YAxis {...baseAxisProps} tickFormatter={yFormatter} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: chartPalette.neutralSoft }} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: color }}
        />
      </RLineChart>
    </ResponsiveContainer>
  );
}

export function AreaChart({
  data,
  height = 240,
  dataKey = "value",
  xKey = "label",
  color = chartPalette.primary,
  yFormatter,
}: CommonProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartPalette.neutralSoft} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} {...baseAxisProps} />
        <YAxis {...baseAxisProps} tickFormatter={yFormatter} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: chartPalette.neutralSoft }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#areaFill)" />
      </RAreaChart>
    </ResponsiveContainer>
  );
}

export function BarChart({
  data,
  height = 240,
  dataKey = "value",
  xKey = "label",
  color = chartPalette.primary,
  yFormatter,
}: CommonProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartPalette.neutralSoft} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} {...baseAxisProps} />
        <YAxis {...baseAxisProps} tickFormatter={yFormatter} width={48} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: chartPalette.primarySoft }} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={40} />
      </RBarChart>
    </ResponsiveContainer>
  );
}

export function PieChart({
  data,
  height = 240,
  dataKey = "value",
  nameKey = "label",
}: {
  data: SeriesPoint[];
  height?: number;
  dataKey?: string;
  nameKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RPieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-body)", color: chartPalette.muted }} />
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={2}
          stroke="var(--color-card)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={chartPalette.series[i % chartPalette.series.length]} />
          ))}
        </Pie>
      </RPieChart>
    </ResponsiveContainer>
  );
}
