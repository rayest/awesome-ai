"use client";

import { cn } from "@/lib/utils";

/**
 * MiniSparkline — 极简折线图
 *
 * 不要饼图、不要大图。只一根线 + 平滑填充。
 * 用于 Dashboard KPI 角落的 7/30 天趋势展示。
 */
export function MiniSparkline({
  values,
  tone = "neutral",
  className,
  height = 32,
}: {
  values: number[];        // 顺序数值（最新在最右）
  tone?: "neutral" | "primary" | "success" | "warn" | "danger";
  className?: string;
  height?: number;
}) {
  if (values.length < 2) return null;

  const w = 100;
  const h = height;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);

  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" L ");
  const pathD = `M ${points}`;
  const areaD = `M 0,${h} L ${points} L 100,${h} Z`;

  const colors: Record<string, string> = {
    neutral: "var(--ink-dim)",
    primary: "var(--primary)",
    success: "var(--success)",
    warn: "var(--warn)",
    danger: "var(--destructive)",
  };

  const c = colors[tone];

  // 起点和终点
  const lastX = w;
  const lastY = h - ((values[values.length - 1] - min) / range) * h;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <path
        d={areaD}
        fill={c}
        opacity="0.08"
      />
      <path
        d={pathD}
        stroke={c}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={c} />
    </svg>
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
  const colors = {
    neutral: "var(--ink-mute)",
    primary: "var(--primary)",
    success: "var(--success)",
    warn: "var(--warn)",
    danger: "var(--destructive)",
  };
  const c = colors[tone];

  return (
    <div className={cn("flex items-end gap-[2px] w-full", className)} style={{ height }}>
      {values.map((v, i) => {
        const norm = max === min ? 0.5 : (v - min) / (max - min);
        const ratio = 0.18 + norm * 0.82;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${ratio * 100}%`,
              background: c,
              opacity: 0.4 + norm * 0.6,
            }}
          />
        );
      })}
    </div>
  );
}
