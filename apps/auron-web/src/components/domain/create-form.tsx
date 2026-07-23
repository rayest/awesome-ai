"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * EntityForm — 通用新建表单容器
 *
 * 用法：
 *   <EntityForm title="新建打样通知" subtitle="..." backUrl="/orders/sample-notices"
 *     fields={...} onSubmit={(v) => ...} />
 *
 * 字段配置（字段级别严格按 crm_* 表的字段来定义 — 不发明新字段）：
 *   type: text / number / select / date / textarea / link
 *   options: [string]   ← select
 *   required?: boolean
 *   source?: string     ← 数据源角标
 *   linkTo?: string     ← 例如 "客户" 字段 link 到 /customers
 */

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "textarea" | "tel" | "email";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  source?: string; // 数据源角标
  mono?: boolean;  // 等宽字体
  defaultValue?: string | number;
};

export function EntityForm({
  title,
  subtitle,
  backUrl,
  backLabel = "返回",
  fields,
  onSubmit,
  submitLabel = "保存并创建",
  rightSlot,
  dataSourceNote,
}: {
  title: string;
  subtitle?: string;
  backUrl: string;
  backLabel?: string;
  fields: FieldDef[];
  onSubmit: (values: Record<string, string | number>) => void | Promise<void>;
  submitLabel?: string;
  rightSlot?: ReactNode;
  dataSourceNote?: string;
}) {
  return (
    <div className="px-8 py-8 mx-auto max-w-[1480px]">
      <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)] mb-4">
        <Link href={backUrl} className="hover:text-[var(--ink)]">{backLabel}</Link>
        <span>›</span>
        <span className="text-[var(--ink)]">{title}</span>
      </div>

      <div className="mb-5">
        <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1">
          CREATE
        </p>
        <h1 className="font-display text-[32px] font-medium tracking-tight text-[var(--ink)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[600px]">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <form
          className="border border-[var(--hairline)] rounded-md p-6 bg-[var(--card)] space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const v: Record<string, string | number> = {};
            for (const f of fields) {
              const raw = fd.get(f.name);
              if (raw == null) continue;
              if (f.type === "number") v[f.name] = Number(raw);
              else v[f.name] = String(raw);
            }
            onSubmit(v);
          }}
        >
          {fields.map((f) => (
            <FormField key={f.name} field={f} />
          ))}

          <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-[var(--card)] border-t border-[var(--hairline)] flex items-center justify-between">
            <span className="font-mono text-[14px] text-[var(--ink-mute)]">
              字段对齐 crm_* · 提交后模拟 toast
            </span>
            <div className="flex items-center gap-2">
              <Link href={backUrl}>
                <Button variant="ghost" size="md" type="button">取消</Button>
              </Link>
              <Button variant="default" size="md" type="submit">
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          {rightSlot}
          {dataSourceNote && (
            <section>
              <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">数据源</p>
              <div className="border border-[var(--hairline)] rounded-md p-3 bg-[var(--secondary)]/40 font-mono text-[14px] text-[var(--ink-mute)] leading-relaxed">
                {dataSourceNote}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ field }: { field: FieldDef }) {
  const id = `f-${field.name}`;
  const label = (
    <label htmlFor={id} className="block">
      <span className="font-display text-[18px] font-medium text-[var(--ink)]">
        {field.label}
        {field.required && <span className="text-[var(--destructive)] ml-1">*</span>}
      </span>
      {field.source && (
        <span className="ml-2 font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          {field.source}
        </span>
      )}
    </label>
  );

  return (
    <div>
      {label}
      <div className="mt-1.5">
        {field.type === "textarea" ? (
          <textarea
            id={id}
            name={field.name}
            required={field.required}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue as string | undefined}
            rows={3}
            className={inputClass(field.mono)}
          />
        ) : field.type === "select" ? (
          <select
            id={id}
            name={field.name}
            required={field.required}
            defaultValue={field.defaultValue as string | undefined}
            className={selectClass(field.mono)}
          >
            <option value="">请选择</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <Input
            id={id}
            type={field.type}
            name={field.name}
            required={field.required}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            mono={field.mono}
          />
        )}
      </div>
      {field.placeholder && field.type !== "textarea" && (
        <p className="mt-1 text-[14px] text-[var(--ink-mute)] font-mono">{field.placeholder}</p>
      )}
    </div>
  );
}

function inputClass(mono?: boolean) {
  return `w-full rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-2 text-[14px] ${mono ? "font-mono tnum" : ""} text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] resize-y`;
}

function selectClass(mono?: boolean) {
  return `w-full h-9 rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 text-[14px] ${mono ? "font-mono tnum" : ""} text-[var(--ink)] focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)]`;
}
