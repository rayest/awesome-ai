"use client";

import { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectControl } from "@/components/ui/select";
import { useDrawerPresentation } from "@/components/layout/route-presentation";

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
  span?: "full";
  visibleWhen?: {
    field: string;
    equals: string | string[];
  };
  section?: {
    title: string;
    description?: string;
  };
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
  const inDrawer = useDrawerPresentation();
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [currentValues, setCurrentValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, String(field.defaultValue ?? "")])),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const fd = new FormData(event.currentTarget);
    const values: Record<string, string | number> = {};
    for (const field of fields) {
      const raw = fd.get(field.name);
      if (raw == null) continue;
      values[field.name] = field.type === "number" ? Number(raw) : String(raw);
    }
    const missingRequired = fields.find(
      (field) => field.required && !String(values[field.name] ?? "").trim(),
    );
    if (missingRequired) {
      setSubmitError(`请填写必填项：${missingRequired.label}`);
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("【新增记录】保存失败", { title, error });
      setSubmitError("保存失败，请检查网络后重试。已填写的内容会保留在当前页面。");
      setSaving(false);
    }
  }

  return (
    <div className={inDrawer ? "min-h-full bg-[var(--background)] p-4 sm:p-6" : "mx-auto max-w-[1320px] px-8 py-6"}>
      {!inDrawer && (
        <div className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--ink-mute)]">
          <Link href={backUrl} className="hover:text-[var(--ink)]">{backLabel}</Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{title}</span>
        </div>
      )}

      {!inDrawer && <div className="mb-5">
        <p className="mb-1 text-[12px] font-medium text-[var(--primary)]">
          新建记录
        </p>
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[600px]">{subtitle}</p>
        )}
      </div>}

      <div className={inDrawer ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"}>
        <form
          className={inDrawer
            ? "min-w-0 overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)]"
            : "min-w-0 overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)]"}
          onSubmit={handleSubmit}
          onChange={(event) => {
            const target = event.target;
            if (
              !(target instanceof HTMLInputElement)
              && !(target instanceof HTMLSelectElement)
              && !(target instanceof HTMLTextAreaElement)
            ) return;
            if (!target.name) return;
            setCurrentValues((current) => ({ ...current, [target.name]: target.value }));
          }}
        >
          <div className={inDrawer ? "grid gap-x-4 gap-y-4 p-4 sm:grid-cols-2 sm:p-5" : "grid gap-x-5 gap-y-4 p-6 md:grid-cols-2"}>
            {fields.map((field) => {
              if (field.visibleWhen) {
                const expected = Array.isArray(field.visibleWhen.equals) ? field.visibleWhen.equals : [field.visibleWhen.equals];
                if (!expected.includes(currentValues[field.visibleWhen.field] ?? "")) return null;
              }
              return (
                <Fragment key={field.name}>
                  {field.section && (
                    <div className="border-b border-[var(--hairline)] pb-3 md:col-span-2">
                      <p className="text-[15px] font-semibold text-[var(--ink)]">{field.section.title}</p>
                      {field.section.description && (
                        <p className="mt-1 text-[12px] leading-5 text-[var(--ink-mute)]">
                          {field.section.description}
                        </p>
                      )}
                    </div>
                  )}
                  <FormField
                    field={field}
                    value={currentValues[field.name] ?? ""}
                    onValueChange={(value) =>
                      setCurrentValues((current) => ({ ...current, [field.name]: value }))
                    }
                  />
                </Fragment>
              );
            })}
          </div>

          <div className="sticky bottom-0 flex flex-col items-stretch justify-between gap-3 border-t border-[var(--hairline)] bg-[var(--card)]/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:px-5">
            <div className="min-w-0">
              {submitError ? (
                <p role="alert" className="flex items-center gap-2 text-[12px] text-[var(--destructive)]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {submitError}
                </p>
              ) : (
                <p className="flex items-center gap-2 text-[12px] text-[var(--ink-mute)]">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  标有 * 的项目为必填，保存后返回列表
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Link href={backUrl}>
                <Button variant="ghost" size="md" type="button">取消</Button>
              </Link>
              <Button variant="default" size="md" type="submit" disabled={saving}>
                {saving && <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />}
                {saving ? "正在保存…" : submitLabel}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          {rightSlot}
        </div>
      </div>
    </div>
  );
}

function FormField({
  field,
  value,
  onValueChange,
}: {
  field: FieldDef;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const id = `f-${field.name}`;
  const label = (
    <label htmlFor={id} className="block">
      <span className="text-[13px] font-medium text-[var(--ink)]">
        {field.label}
        {field.required && <span className="text-[var(--destructive)] ml-1">*</span>}
      </span>
    </label>
  );

  return (
    <div className={field.span === "full" || field.type === "textarea" ? "md:col-span-2" : undefined}>
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
          <SelectControl
            name={field.name}
            required={field.required}
            value={value || undefined}
            onValueChange={onValueChange}
            placeholder="请选择"
            aria-label={field.label}
            className={field.mono ? "font-mono tnum" : undefined}
            options={(field.options ?? []).map((option) => ({
              value: option,
              label: option,
            }))}
          />
        ) : field.type === "date" ? (
          <>
            <DatePicker
              value={value}
              onChange={onValueChange}
              required={field.required}
              aria-label={field.label}
              placeholder={field.placeholder}
            />
            <input type="hidden" name={field.name} value={value} />
          </>
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
    </div>
  );
}

function inputClass(mono?: boolean) {
  return `w-full rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-2 text-[14px] ${mono ? "font-mono tnum" : ""} text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] resize-y`;
}
