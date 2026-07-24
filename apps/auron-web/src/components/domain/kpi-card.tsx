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
        "group relative h-full rounded-2xl bg-[var(--card)] p-4 transition-all sm:p-5",
        alert
          ? "bg-[var(--warn-soft)] hover:-translate-y-0.5"
          : "hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(20,24,18,0.08)]",
        href && "cursor-pointer"
      )}
    >
      {/* label */}
      <p className="flex items-center justify-between gap-2 text-[13px] font-medium text-[var(--ink-mute)]">
        <span>{label}</span>
        {alert && (
          <AlertTriangle className="h-4 w-4 text-[var(--chart-orange)]" />
        )}
      </p>

      {/* value */}
      <div className="mt-2 flex items-baseline gap-1">
        <span className="tnum whitespace-nowrap font-display text-[34px] font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-[38px]">
          {value}
        </span>
        {unit && (
          <span className="ml-1 text-[13px] text-[var(--ink-mute)]">
            {unit}
          </span>
        )}
      </div>

      {/* delta + spark */}
      {(delta || spark) && (
        <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
          {delta && (
            <div className="flex min-w-0 items-center gap-1 text-[12px]">
              <span
                className={cn(
                  "px-1 py-0.5 rounded tnum font-medium",
                  delta.positive
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--warn-soft)] text-[var(--warn)]",
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
            <div className="-mb-1 hidden h-8 w-24 opacity-80 transition-opacity group-hover:opacity-100 sm:block">
              <Sparkline values={spark} tone={sparkTone} smooth />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
      >
        {CardInner}
      </Link>
    );
  }
  return CardInner;
}

// Re-export for convenience
import { MiniSparkline as Sparkline } from "@/components/domain/sparkline";
