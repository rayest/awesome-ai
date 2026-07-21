"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldHelp, FieldGroup, FieldRow2 } from "@/components/ui/field";
import { Plus } from "lucide-react";

type CustomerFormData = {
  shortName: string;
  fullName: string;
  code: string;
  region: string;
  type: "活跃" | "潜客" | "老客" | "流失";
  tier: "A" | "B" | "C";
  owner: string;
  note: string;
};

export function NewCustomerSheet({
  onCreated,
}: {
  onCreated?: (c: CustomerFormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomerFormData>({
    shortName: "",
    fullName: "",
    code: "",
    region: "",
    type: "潜客",
    tier: "B",
    owner: "李白",
    note: "",
  });

  const update = <K extends keyof CustomerFormData>(k: K, v: CustomerFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const code = form.code || `GH-${(form.shortName || "???").slice(0, 2).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

  const isValid = form.shortName.length > 0 && form.fullName.length > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default" size="md">
          <Plus className="w-4 h-4" />
          新建客户
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        title="新建客户"
        description={`编号将由系统自动生成 — ${code}`}
      >
        <form
          className="px-6 py-6 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isValid) return;
            onCreated?.(form);
            setOpen(false);
          }}
        >
          {/* 基础 */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-3 border-b border-[var(--hairline)] pb-2">
              基础信息
            </p>
            <FieldGroup>
              <div>
                <FieldLabel required>客户简称</FieldLabel>
                <Input
                  value={form.shortName}
                  onChange={(e) => update("shortName", e.target.value)}
                  placeholder="如：乾盛"
                  autoFocus
                />
                <FieldHelp>在表格里显示用的 2-4 字短名</FieldHelp>
              </div>
              <div>
                <FieldLabel required>客户全称</FieldLabel>
                <Input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="如：乾盛服饰有限公司"
                />
              </div>
              <FieldRow2>
                <div>
                  <FieldLabel hint="可选">客户编号</FieldLabel>
                  <Input
                    mono
                    value={form.code}
                    onChange={(e) => update("code", e.target.value)}
                    placeholder={code}
                  />
                </div>
                <div>
                  <FieldLabel hint="可调">客户等级</FieldLabel>
                  <TierToggle value={form.tier} onChange={(v) => update("tier", v)} />
                </div>
              </FieldRow2>
              <div>
                <FieldLabel>所在区域</FieldLabel>
                <Input
                  value={form.region}
                  onChange={(e) => update("region", e.target.value)}
                  placeholder="如：义乌 / 浙江"
                />
              </div>
            </FieldGroup>
          </section>

          {/* 分类 */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-3 border-b border-[var(--hairline)] pb-2">
              分类与归属
            </p>
            <FieldGroup>
              <div>
                <FieldLabel>客户类型</FieldLabel>
                <TypeToggle value={form.type} onChange={(v) => update("type", v)} />
              </div>
              <FieldRow2>
                <div>
                  <FieldLabel>归属业务员</FieldLabel>
                  <Input
                    value={form.owner}
                    onChange={(e) => update("owner", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel hint="可改">协作人</FieldLabel>
                  <Input placeholder="可选" />
                </div>
              </FieldRow2>
            </FieldGroup>
          </section>

          {/* 备注 */}
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-3 border-b border-[var(--hairline)] pb-2">
              备注
            </p>
            <div>
              <FieldLabel>客户备注</FieldLabel>
              <textarea
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
                rows={4}
                placeholder="下单偏好、付款节奏、特别要求..."
                className="w-full rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] resize-none"
              />
            </div>
          </section>

          {/* Footer */}
          <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-[var(--card)] border-t border-[var(--hairline)] flex items-center justify-between">
            <span className="font-mono text-[10px] text-[var(--ink-mute)]">
              {isValid ? "✓ 可保存" : "必填字段未完成"}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="md" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button variant="default" size="md" type="submit" disabled={!isValid}>
                保存并新建
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* —— 内部小控件 —— */
function TierToggle({
  value,
  onChange,
}: {
  value: "A" | "B" | "C";
  onChange: (v: "A" | "B" | "C") => void;
}) {
  const tone = {
    A: "var(--primary)",
    B: "var(--ink-dim)",
    C: "var(--ink-mute)",
  };
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-md border border-[var(--hairline-strong)] bg-[var(--secondary)]/40">
      {(["A", "B", "C"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className="w-8 h-7 rounded text-[12px] font-mono font-medium transition-colors"
          style={{
            background: value === t ? tone[t] : "transparent",
            color: value === t ? "var(--background)" : tone[t],
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function TypeToggle({
  value,
  onChange,
}: {
  value: "活跃" | "潜客" | "老客" | "流失";
  onChange: (v: "活跃" | "潜客" | "老客" | "流失") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-md border border-[var(--hairline-strong)] bg-[var(--secondary)]/40">
      {(["活跃", "潜客", "老客", "流失"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={
            "h-7 px-3 rounded text-[12px] transition-colors " +
            (value === t
              ? "bg-[var(--ink)] text-[var(--background)]"
              : "text-[var(--ink-dim)]")
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}
