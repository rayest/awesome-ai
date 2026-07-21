import { cn } from "@/lib/utils";

/** 状态指示条：用于表格行内表示「进行中/已签收」等 */
export function StatusDot({
  tone = "neutral",
  className,
}: {
  tone?: "neutral" | "primary" | "success" | "warn" | "danger" | "info";
  className?: string;
}) {
  const color = {
    neutral: "var(--ink-mute)",
    primary: "var(--primary)",
    success: "var(--success)",
    warn: "var(--warn)",
    danger: "var(--destructive)",
    info: "var(--info)",
  }[tone];
  return (
    <span
      className={cn("inline-block w-1.5 h-1.5 rounded-full shrink-0", className)}
      style={{ background: color }}
    />
  );
}

/** 数字 chip：用于紧贴数据的「次要徽章」 */
export function NumChip({
  value,
  tone = "neutral",
}: {
  value: string | number;
  tone?: "neutral" | "primary" | "success" | "warn" | "danger" | "info";
}) {
  const toneClass = {
    neutral: "bg-[var(--secondary)] text-[var(--ink-dim)]",
    primary: "bg-[var(--accent)] text-[var(--accent-foreground)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
    danger: "bg-[oklch(0.95_0.04_22)] text-[var(--destructive)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono tnum tracking-tight",
        toneClass
      )}
    >
      {value}
    </span>
  );
}
