"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

/**
 * MiniSparkline — 基于 Recharts 的极简面积趋势图
 *
 * KPI 默认使用线性插值；主趋势图可开启 monotone 平滑插值。
 */
export function MiniSparkline({
  values,
  tone = "neutral",
  className,
  height = 32,
  smooth = false,
}: {
  values: number[];        // 顺序数值（最新在最右）
  tone?: "neutral" | "primary" | "success" | "warn" | "danger";
  className?: string;
  height?: number;
  smooth?: boolean;
}) {
  if (values.length < 2) return null;

  const data = values.map((value, index) => ({ index, value }));
  const colors = {
    neutral: "var(--ink-dim)",
    primary: "var(--primary)",
    success: "var(--success)",
    warn: "var(--warn)",
    danger: "var(--destructive)",
  } as const;

  const color = colors[tone];

  return (
    <div className={cn("w-full", className)} style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 1, bottom: 2, left: 1 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area
            type={smooth ? "monotone" : "linear"}
            dataKey="value"
            stroke={color}
            strokeWidth={smooth ? 1.6 : 1.2}
            fill={color}
            fillOpacity={0.08}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 迷你柱状图 */
export function MiniBars({
  values,
  tone = "primary",
  className,
  height = 32,
}: {
  values: number[];
  tone?: "neutral" | "primary" | "success" | "warn" | "danger";
  className?: string;
  height?: number;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const data = values.map((value, index) => {
    const normalized = max === min ? 0.5 : (value - min) / (max - min);
    return {
      index,
      value,
      opacity: 0.4 + normalized * 0.6,
    };
  });
  const colors = {
    neutral: "var(--ink-mute)",
    primary: "var(--primary)",
    success: "var(--success)",
    warn: "var(--warn)",
    danger: "var(--destructive)",
  };
  const c = colors[tone];

  return (
    <div className={cn("w-full", className)} style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 1, right: 0, bottom: 0, left: 0 }}>
          <Bar
            dataKey="value"
            fill={c}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((item) => (
              <Cell key={item.index} fill={c} fillOpacity={item.opacity} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
