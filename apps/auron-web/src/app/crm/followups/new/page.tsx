"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";
import { Badge } from "@/components/ui/badge";

/**
 * 新建跟进 · 写入 crm_客户跟进记录表
 *
 * 9 字段业务员/跟单录入核心 7 项
 */

const CUSTOMERS = ["CUST-QS-001 乾盛服饰", "CUST-HD-002 弘大针织", "CUST-MD-019 鸣笛工贸", "CUST-QD-044 巧岛针织"];
const CONTACTS = [
  { value: "ct-1", label: "陈总 · 乾盛（决策）" },
  { value: "ct-2", label: "小张 · 乾盛（采购）" },
  { value: "ct-3", label: "马经理 · 弘大（决策）" },
  { value: "ct-4", label: "李设计 · 弘大（技术）" },
  { value: "ct-5", label: "丁工 · 鸣笛（技术）" },
  { value: "ct-6", label: "张设计 · 巧岛（技术）" },
];
const STATUS = ["初步接触", "需求确认", "方案制定", "商务洽谈", "签约成交", "合作中", "合作结束"];
const MODE = ["电话", "微信", "面访"];
const EMPLOYEES = ["李白", "刘韬", "亚明", "王姐"];

const FIELDS: FieldDef[] = [
  { name: "customer",       label: "客户",            type: "select", required: true, options: CUSTOMERS, source: "lookup 客户表" },
  { name: "contact",        label: "联系人",          type: "select", required: true, options: CONTACTS.map((c) => c.label), source: "link 联系人表 双向" },
  { name: "status",         label: "跟进状态",         type: "select", required: true, options: STATUS, source: "select 7 选项" },
  { name: "mode",           label: "方式",            type: "select", required: true, options: MODE, source: "前端派生" },
  { name: "record",         label: "跟进记录",         type: "textarea", required: true, placeholder: "如：确认 200 件立领大衣大货交期", source: "text" },
  { name: "nextContactAt",  label: "下次跟进时间",     type: "date", source: "datetime" },
  { name: "lastContactAt",  label: "实际跟进时间",     type: "date", source: "datetime" },
  { name: "owner",          label: "跟进人",           type: "select", required: true, options: EMPLOYEES, source: "user（飞书成员）" },
];

export default function NewFollowupPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新建跟进"
        subtitle="销售 pipeline 推进。crm_客户跟进记录表 · 写入 8 字段"
        backUrl="/crm/followups"
        backLabel="跟进看板"
        fields={FIELDS}
        submitLabel="保存并拖到看板"
        dataSourceNote="crm_客户跟进记录表 9 字段 · 联系人ID 是 link 双向 · status 在 7 个 select 阶段中游走"
        rightSlot={
          <section>
            <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">7 个跟进阶段</p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[14px]">
              {STATUS.map((s) => (
                <Badge key={s} tone="neutral" size="sm">{s}</Badge>
              ))}
            </div>
            <p className="mt-3 text-[14px] text-[var(--ink-mute)] font-mono">
              保存后跟进会出现在看板的当前列。
            </p>
          </section>
        }
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `fu-${String(Date.now()).slice(-6)}`;
          toast.success("跟进已创建", {
            description: `${values.customer} · ${values.status}`,
            duration: 4000,
          });
          router.push(`/crm/followups/${newId}`);
        }}
      />
    </AdminShell>
  );
}
