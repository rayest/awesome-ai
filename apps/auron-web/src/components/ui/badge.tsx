import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium font-mono tracking-tight whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-[var(--secondary)] text-[var(--ink-dim)]",
        primary: "bg-[var(--accent)] text-[var(--accent-foreground)]",
        success: "bg-[var(--success-soft)] text-[var(--success)]",
        warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
        danger: "bg-[oklch(0.95_0.04_22)] text-[var(--destructive)]",
        info: "bg-[var(--info-soft)] text-[var(--info)]",
        ink: "bg-[var(--ink)] text-[var(--background)]",
      },
      size: { sm: "text-[10px] px-1.5 py-0", md: "" },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
