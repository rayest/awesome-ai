"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

/** 表单字段统一排版：label 上 / input 下，所有表单一致 */

export function FieldLabel({
  children,
  required,
  hint,
  className,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between mb-1.5", className)}>
      <LabelPrimitive.Root className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
        {children}
        {required && <span className="text-[var(--primary)] ml-1">*</span>}
      </LabelPrimitive.Root>
      {hint && (
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">{hint}</span>
      )}
    </div>
  );
}

export function FieldHelp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-1 text-[14px] text-[var(--ink-mute)] font-mono", className)}>
      {children}
    </p>
  );
}

export function FieldGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-5", className)}>{children}</div>;
}

export function FieldRow2({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid grid-cols-2 gap-4", className)}>{children}</div>;
}
