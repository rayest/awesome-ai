import type { ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkflowSection({
  id,
  index,
  title,
  description,
  children,
}: {
  id?: string;
  index: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)]">
      <header className="flex items-start gap-4 border-b border-[var(--hairline)] px-5 py-4">
        <span className="font-mono text-[12px] font-medium text-[var(--primary)]">{index}</span>
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-[var(--ink)]">{title}</h2>
          <p className="mt-1 text-[13px] leading-5 text-[var(--ink-dim)]">{description}</p>
        </div>
      </header>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

export function FormControl({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink)]">
        {label}
        {required && <span className="text-[var(--destructive)]">*</span>}
        {hint && <span className="ml-auto text-[11px] font-normal text-[var(--ink-mute)]">{hint}</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error && <span role="alert" className="mt-1.5 block text-[12px] text-[var(--destructive)]">{error}</span>}
    </label>
  );
}

export function ReadOnlyFact({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0 bg-[var(--secondary)]/35 px-4 py-3">
      <p className="text-[11px] text-[var(--ink-mute)]">{label}</p>
      <p className={cn("mt-1 truncate text-[13px] font-medium text-[var(--ink)]", mono && "font-mono tabular-nums")}>{value}</p>
    </div>
  );
}

export function ChoiceButton({
  selected,
  onClick,
  children,
  mono,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-md border px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/35",
        selected
          ? "border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]"
          : "border-[var(--hairline-strong)] bg-[var(--card)] text-[var(--ink-dim)] hover:bg-[var(--accent)]/40",
        mono && "font-mono",
      )}
    >
      {children}
    </button>
  );
}

export function WorkflowProgress({
  items,
}: {
  items: { label: string; done: boolean; href: string }[];
}) {
  return (
    <nav aria-label="填写进度" className="grid overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)] md:grid-cols-4">
      {items.map((item, index) => (
        <a
          key={item.label}
          href={item.href}
          className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3 transition-colors hover:bg-[var(--accent)]/35 md:border-b-0 md:border-r"
        >
          <span className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
            item.done
              ? "border-[var(--success)] bg-[var(--success)] text-white"
              : "border-[var(--hairline-strong)] text-[var(--ink-mute)]",
          )}>
            {item.done ? <Check className="h-3.5 w-3.5" /> : index + 1}
          </span>
          <span className={cn("text-[13px] font-medium", item.done ? "text-[var(--ink)]" : "text-[var(--ink-dim)]")}>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function CompletionList({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-[var(--ink-dim)]">{item.label}</span>
          <span className={cn("flex items-center gap-1", item.done ? "text-[var(--success)]" : "text-[var(--ink-mute)]")}>
            {item.done ? <Check className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {item.done ? "已完成" : "待填写"}
          </span>
        </div>
      ))}
    </div>
  );
}

export const workflowSelectClass = "h-10 w-full rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 text-[14px] text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30";

export const workflowTextareaClass = "w-full resize-y rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-2 text-[14px] leading-5 text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30";
