import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type PulseItem = {
  label: string;
  value: ReactNode;
  detail: string;
  tone?: "neutral" | "primary" | "warn" | "danger" | "success";
  active?: boolean;
  onClick?: () => void;
};

const PULSE_TONE = {
  neutral: "text-[var(--ink)]",
  primary: "text-[var(--primary)]",
  warn: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
  success: "text-[var(--success)]",
} as const;

export function WorkflowPulse({ items }: { items: PulseItem[] }) {
  return (
    <section className="grid overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)] md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const content = (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] font-medium text-[var(--ink-dim)]">{item.label}</p>
              <span className={cn("font-mono text-[22px] font-semibold leading-none tabular-nums", PULSE_TONE[item.tone ?? "neutral"])}>
                {item.value}
              </span>
            </div>
            <p className="mt-3 text-[12px] leading-4 text-[var(--ink-mute)]">{item.detail}</p>
          </>
        );

        const className = cn(
          "min-h-[92px] border-b border-[var(--hairline)] p-4 text-left transition-colors md:border-r xl:border-b-0",
          item.active ? "bg-[var(--accent)]" : "hover:bg-[var(--secondary)]/45",
        );

        return item.onClick ? (
          <button key={item.label} type="button" onClick={item.onClick} className={className}>
            {content}
          </button>
        ) : (
          <div key={item.label} className={className}>
            {content}
          </div>
        );
      })}
    </section>
  );
}

type AttentionItem = {
  title: string;
  meta: string;
  href: string;
  eyebrow?: string;
  tone?: "neutral" | "warn" | "danger" | "success";
};

const DOT_TONE = {
  neutral: "bg-[var(--ink-mute)]",
  warn: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
  success: "bg-[var(--success)]",
} as const;

export function AttentionRail({
  title = "需要关注",
  description,
  items,
  emptyText = "当前没有需要优先处理的记录",
}: {
  title?: string;
  description: string;
  items: AttentionItem[];
  emptyText?: string;
}) {
  return (
    <aside className="rounded-lg border border-[var(--hairline)] bg-[var(--card)]">
      <div className="border-b border-[var(--hairline)] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <CircleAlert className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="text-[14px] font-semibold text-[var(--ink)]">{title}</h2>
        </div>
        <p className="mt-1 text-[12px] leading-4 text-[var(--ink-mute)]">{description}</p>
      </div>

      <div className="divide-y divide-[var(--hairline)]">
        {items.length ? items.slice(0, 5).map((item) => (
          <Link
            key={`${item.href}-${item.title}`}
            href={item.href}
            className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--accent)]/45"
          >
            <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", DOT_TONE[item.tone ?? "neutral"])} />
            <span className="min-w-0 flex-1">
              {item.eyebrow && (
                <span className="block font-mono text-[11px] text-[var(--ink-mute)]">{item.eyebrow}</span>
              )}
              <span className="mt-0.5 block truncate text-[13px] font-medium text-[var(--ink)]">{item.title}</span>
              <span className="mt-1 block text-[12px] leading-4 text-[var(--ink-dim)]">{item.meta}</span>
            </span>
            <ArrowRight className="mt-2 h-3.5 w-3.5 shrink-0 text-[var(--ink-mute)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--ink)]" />
          </Link>
        )) : (
          <p className="px-4 py-8 text-center text-[13px] text-[var(--ink-mute)]">{emptyText}</p>
        )}
      </div>
    </aside>
  );
}

export function WorkflowListHeader({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="mr-2 flex items-baseline gap-2">
        <h2 className="text-[16px] font-semibold tracking-tight text-[var(--ink)]">{title}</h2>
        <span className="font-mono text-[12px] tabular-nums text-[var(--ink-mute)]">{count} 条</span>
      </div>
      {children}
    </div>
  );
}

export function ProcessRail({
  steps,
}: {
  steps: { label: string; detail: string; state: "done" | "current" | "next" }[];
}) {
  return (
    <nav aria-label="业务流程" className="mb-5 overflow-x-auto rounded-lg border border-[var(--hairline)] bg-[var(--card)]">
      <ol className="grid min-w-[720px] grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.label}
            aria-current={step.state === "current" ? "step" : undefined}
            className={cn(
              "relative border-r border-[var(--hairline)] px-4 py-3 last:border-r-0",
              step.state === "current" && "bg-[var(--primary)]/[0.055]",
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px]",
                step.state === "done" && "border-[var(--success)] bg-[var(--success)] text-white",
                step.state === "current" && "border-[var(--primary)] text-[var(--primary)]",
                step.state === "next" && "border-[var(--hairline-strong)] text-[var(--ink-mute)]",
              )}>
                {step.state === "done" ? "✓" : index + 1}
              </span>
              <span className={cn("text-[13px] font-semibold", step.state === "current" ? "text-[var(--primary)]" : "text-[var(--ink)]")}>{step.label}</span>
            </div>
            <p className="mt-1 pl-7 text-[11px] leading-4 text-[var(--ink-mute)]">{step.detail}</p>
          </li>
        ))}
      </ol>
    </nav>
  );
}
