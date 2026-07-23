import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * EmptyState — 统一全站空状态
 *
 * 三种密度：
 *  - dense（表格内一行）
 *  - card（卡片中空）
 *  - page（整页大块）
 */

type Density = "dense" | "card" | "page";

export function EmptyState({
  title,
  description,
  action,
  illustration,
  density = "card",
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: ReactNode;
  density?: Density;
  className?: string;
}) {
  if (density === "dense") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-3 py-10 text-[14px] text-[var(--ink-mute)] font-mono",
          className
        )}
      >
        {illustration && <div>{illustration}</div>}
        <div>
          <p className="text-[var(--ink-dim)]">{title}</p>
          {description && <p className="mt-0.5 text-[14px]">{description}</p>}
          {action}
        </div>
      </div>
    );
  }

  if (density === "page") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center py-20 px-6",
          className
        )}
      >
        {illustration && <div className="mb-6">{illustration}</div>}
        <h3 className="font-display text-[20px] font-medium text-[var(--ink)] mb-2 max-w-[420px]">
          {title}
        </h3>
        {description && (
          <p className="text-[14px] text-[var(--ink-dim)] max-w-[480px] mb-6 leading-relaxed">
            {description}
          </p>
        )}
        {action}
      </div>
    );
  }

  // card (default)
  return (
    <div
      className={cn(
        "border border-dashed border-[var(--hairline-strong)] rounded-md py-12 px-6 text-center bg-[var(--secondary)]/20",
        className
      )}
    >
      {illustration && (
        <div className="mb-4 mx-auto w-fit opacity-70">{illustration}</div>
      )}
      <h3 className="font-display text-[18px] font-medium text-[var(--ink)] mb-1">{title}</h3>
      {description && (
        <p className="text-[14px] text-[var(--ink-mute)] max-w-[420px] mx-auto mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

/** 简洁的几何占位 */
export function EmptyIllustration({ kind = "box" }: { kind?: "box" | "cards" | "search" | "filter" }) {
  if (kind === "box") {
    return (
      <svg width="56" height="48" viewBox="0 0 56 48" fill="none" className="text-[var(--ink-mute)]">
        <rect x="6" y="10" width="44" height="32" rx="3" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        <path d="M6 20h44" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <path d="M14 14v4M22 14v4" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      </svg>
    );
  }
  if (kind === "cards") {
    return (
      <svg width="64" height="44" viewBox="0 0 64 44" fill="none" className="text-[var(--ink-mute)]">
        <rect x="4" y="6" width="56" height="28" rx="3" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        <rect x="8" y="10" width="20" height="3" fill="currentColor" opacity="0.3" />
        <rect x="8" y="16" width="14" height="2" fill="currentColor" opacity="0.3" />
        <rect x="40" y="20" width="12" height="3" fill="currentColor" opacity="0.4" />
        <rect x="8" y="36" width="48" height="2" fill="currentColor" opacity="0.3" />
      </svg>
    );
  }
  if (kind === "search") {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[var(--ink-mute)]">
        <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <path d="M30 30l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    );
  }
  // filter
  return (
    <svg width="56" height="44" viewBox="0 0 56 44" fill="none" className="text-[var(--ink-mute)]">
      <path d="M6 6h44l-14 18v14l-16-6V24L6 6z" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}
