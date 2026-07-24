"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * KpiCard — Dashboard 关键指标卡
 *
 * 大数字 mono + label + 迷你 sparkline + 同比变化
 * 整张可点击跳转（href 传入时）
 */
export function KpiCard({
  label,
  value,
  unit,
  delta,
  spark,
  sparkTone = "neutral",
  alert,
  href,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: { value: number; period: string; positive?: boolean };
  spark?: number[];
  sparkTone?: "neutral" | "primary" | "success" | "warn" | "danger";
  alert?: boolean;          // 红框警告
  href?: string;
}) {
  const CardInner = (
    <div
      className={cn(
        "group relative rounded-md border bg-[var(--card)] p-4 transition-colors",
        alert
          ? "border-[var(--destructive)]/60 hover:border-[var(--destructive)]"
          : "border-[var(--hairline)] hover:border-[var(--primary)]/60",
        href && "cursor-pointer"
      )}
    >
      {/* label */}
      <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] flex items-center justify-between">
        <span>{label}</span>
        {alert && (
          <AlertTriangle className="h-3.5 w-3.5 text-[var(--destructive)]" />
        )}
      </p>

      {/* value */}
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-[32px] font-medium tracking-tight tnum text-[var(--ink)]">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-[14px] text-[var(--ink-mute)] ml-1">
            {unit}
          </span>
        )}
      </div>

      {/* delta + spark */}
      {(delta || spark) && (
        <div className="mt-2 flex items-end justify-between gap-2">
          {delta && (
            <div className="flex items-center gap-1 text-[14px] font-mono">
              <span
                className={cn(
                  "px-1 py-0.5 rounded tnum font-medium",
                  delta.positive
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[oklch(0.95_0.04_22)] text-[var(--destructive)]",
                  delta.value === 0 && "bg-[var(--secondary)] text-[var(--ink-mute)]"
                )}
              >
                {delta.value > 0 ? "+" : ""}
                {delta.value.toFixed(1)}%
              </span>
              <span className="text-[var(--ink-mute)]">{delta.period}</span>
            </div>
          )}
          {spark && spark.length > 1 && (
            <div className="h-8 w-24 -mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline values={spark} tone={sparkTone} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {CardInner}
      </Link>
    );
  }
  return CardInner;
}

// Re-export for convenience
import { MiniSparkline as Sparkline } from "@/components/domain/sparkline";
