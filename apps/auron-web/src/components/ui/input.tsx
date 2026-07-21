import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  mono?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, mono, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-1.5 text-[13px] text-[var(--ink)]",
        "placeholder:text-[var(--ink-mute)]",
        "focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        mono && "font-mono tnum",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
