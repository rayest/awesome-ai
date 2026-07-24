"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldHelp, FieldGroup, FieldRow2 } from "@/components/ui/field";
import { Plus } from "lucide-react";

/**
 * 新建客户表单 — 中央 Dialog modal
 *
 * 数据源：crm_客户表 7 字段
 *   客户ID · 客户名称 · 标签(select: 品牌商/跨境) ·
 *   客户类型(select: 未合作/已合作/重要) · 客户备注 ·
 *   负责人(link 人员) · 协作人(link 人员)
 *
 * 交互：中央 modal（不是右侧 Sheet），宽 640px；
 *       通用 EntityForm 不承担这条链路（demo 阶段客户快捷创建保持简单）
 */

type CustomerType = "未合作" | "已合作" | "重要";
type Tag = "品牌商" | "跨境";

type CustomerFormData = {
  shortName: string;
  fullName: string;
  type: CustomerType;
  tags: Tag[];
  owner: string;
  collaborators: string;
  note: string;
};

const DEFAULT_DATA: CustomerFormData = {
  shortName: "",
  fullName: "",
  type: "未合作",
  tags: [],
  owner: "李白",
  collaborators: "",
  note: "",
};

const TYPE_OPTIONS: CustomerType[] = ["未合作", "已合作", "重要"];
const TAG_OPTIONS: Tag[] = ["品牌商", "跨境"];

export function NewCustomerSheet({
  onCreated,
}: {
  onCreated?: (c: CustomerFormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerFormData>(DEFAULT_DATA);

  const update = <K extends keyof CustomerFormData>(k: K, v: CustomerFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleTag = (t: Tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
    }));
  };

  const isValid = form.shortName.length > 0 && form.fullName.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="md">
          <Plus className="w-4 h-4" />
          新建客户
        </Button>
      </DialogTrigger>

      <DialogContent size="lg">
        <DialogTitle>新建客户</DialogTitle>
        <DialogDescription>客户 ID 由 crm 自动生成（auto_number）</DialogDescription>

        <form
          className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isValid || saving) return;
            setSaving(true);
            void Promise.resolve().then(async () => {
              await new Promise((r) => setTimeout(r, 400));
              onCreated?.(form);
              toast.success("客户已创建", {
                description: `${form.shortName} · ${form.fullName}`,
                duration: 4000,
              });
              setForm(DEFAULT_DATA);
              setSaving(false);
              setOpen(false);
            });
          }}
        >
          {/* 基础 */}
          <section>
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--ink-mute)] mb-3 border-b border-[var(--hairline)] pb-2">
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
                <FieldHelp>列表和通知里使用的短名称</FieldHelp>
              </div>
              <div>
                <FieldLabel required>客户全称</FieldLabel>
                <Input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="如：乾盛服饰有限公司"
                />
              </div>
            </FieldGroup>
          </section>

          {/* 分类 */}
          <section>
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--ink-mute)] mb-3 border-b border-[var(--hairline)] pb-2">
              客户分类
            </p>
            <FieldGroup>
              <div>
                <FieldLabel>客户类型</FieldLabel>
                <FieldRow2>
                  {TYPE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update("type", t)}
                      className={
                        "h-9 px-3 rounded-md text-[14px] transition-colors flex-1 " +
                        (form.type === t
                          ? "bg-[var(--ink)] text-[var(--background)]"
                          : "text-[var(--ink-dim)] border border-[var(--hairline-strong)] hover:bg-[var(--accent)]")
                      }
                    >
                      {t}
                    </button>
                  ))}
                </FieldRow2>
                <FieldHelp>用于筛选客户和安排跟进优先级</FieldHelp>
              </div>
              <div>
                <FieldLabel>标签</FieldLabel>
                <FieldRow2>
                  {TAG_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={
                        "h-9 px-3 rounded-md text-[14px] transition-colors flex-1 " +
                        (form.tags.includes(t)
                          ? "bg-[var(--accent-foreground)] text-[var(--background)]"
                          : "text-[var(--ink-dim)] border border-[var(--hairline-strong)] hover:bg-[var(--accent)]")
                      }
                    >
                      #{t}
                    </button>
                  ))}
                </FieldRow2>
              </div>
            </FieldGroup>
          </section>

          {/* 归属 */}
          <section>
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--ink-mute)] mb-3 border-b border-[var(--hairline)] pb-2">
              负责人
            </p>
            <FieldGroup>
              <div>
                <FieldLabel hint="必选">负责人</FieldLabel>
                <Input
                  value={form.owner}
                  onChange={(e) => update("owner", e.target.value)}
                  placeholder="如：李白"
                />
              </div>
              <div>
                <FieldLabel hint="可填">协作人</FieldLabel>
                <Input
                  value={form.collaborators}
                  onChange={(e) => update("collaborators", e.target.value)}
                  placeholder="多个协作人，逗号分隔"
                />
              </div>
            </FieldGroup>
          </section>

          {/* 备注 */}
          <section>
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--ink-mute)] mb-3 border-b border-[var(--hairline)] pb-2">
              备注
            </p>
            <div>
              <FieldLabel>客户备注</FieldLabel>
              <textarea
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
                rows={3}
                placeholder="下单偏好、付款节奏、特别要求..."
                className="w-full rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-2 text-[14px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] resize-none"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={!isValid}
            className="hidden"
            aria-hidden
          />
        </form>

        {/* Footer — sticky 底部 */}
        <div className="-mx-6 px-6 pt-4 mt-4 border-t border-[var(--hairline)] flex items-center justify-between">
          <span className="font-mono text-[14px] text-[var(--ink-mute)]">
            {isValid ? "✓ 可保存" : "必填字段未完成"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" type="button" onClick={() => setOpen(false)}>
              取消
            </Button>
            <SubmitTrigger onSubmit={() => {
              if (!isValid || saving) return;
              setSaving(true);
              void Promise.resolve().then(async () => {
                await new Promise((r) => setTimeout(r, 400));
                onCreated?.(form);
                toast.success("客户已创建", {
                  description: `${form.shortName} · ${form.fullName} · 客户ID 由 crm 自动生成`,
                  duration: 4000,
                });
                setForm(DEFAULT_DATA);
                setSaving(false);
                setOpen(false);
              });
            }} disabled={!isValid || saving} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* 隐藏的提交按钮 — 真正的"保存并新建"通过 footer 触发，
   视觉上只是 sticky 底部的可见按钮 */
function SubmitTrigger({
  onSubmit,
  disabled,
}: {
  onSubmit: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      variant="default"
      size="md"
      onClick={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      disabled={disabled}
    >
      保存并新建
    </Button>
  );
}
