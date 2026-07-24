"use client";

import { use } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, ArrowUpRight } from "lucide-react";
import { getFollowup } from "@/lib/data";

/**
 * /crm/followups/[id] · 跟进详情
 *
 * 数据源 · crm_客户跟进记录表（共 9 字段）全展示
 *   跟进状态(select 7 选项) · 下次跟进时间(datetime) · 跟进记录(text) ·
 *   跟进ID(auto_number) · 跟进人(user) · 客户(lookup) ·
 *   实际跟进时间(datetime) · 联系人ID(link 双向) · 联系人姓名(lookup)
 */

type Followup = {
  id: string;
  customer: string;
  customerId: string;
  contactName: string;
  contactId: string;
  contactPhone: string;
  mode: "phone" | "im" | "visit";
  record: string;
  lastContactAt: string;
  nextContactAt: string;
  owner: string;
  status: string;
};


const FOLLOWUP_HISTORY = [
  { at: "3 周前", mode: "面访", record: "首次拜访 — 厂长接待" },
  { at: "上周",   mode: "电话", record: "确认订单意向 + 寄样" },
  { at: "今 09:14", mode: "电话", record: "确认 200 件立领大衣大货交期" },
];

export default function FollowupDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const f = getFollowup(id);

  if (!f) {
    return (
      <AdminShell>
        <div className="px-8 py-16 mx-auto max-w-[1280px] text-center">
          <h1 className="font-display text-[24px] font-medium mb-2">未找到跟进 {id}</h1>
          <Link href="/crm/followups"><Button variant="default" size="md">返回跟进看板</Button></Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/crm/followups" className="hover:text-[var(--ink)]">跟进看板</Link>
          <span>›</span>
          <Link href={`/customers/${f.customerId}`} className="hover:text-[var(--ink)]">{f.customer}</Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{f.contactName}</span>
        </div>

        <div className="mb-6">
          <FabricLabel
            docNo={`FOLLOWUP-${f.id}`}
            shortCode={f.customerId?.replace("CUST-", "") ?? f.id}
            season={f.status}
            composition={`${f.customer} / ${f.contactName} / ${f.mode === "phone" ? "电话" : f.mode === "im" ? "微信" : "面访"}`}
            specs={[
              { label: "跟进 ID", value: f.id, mono: true },
              { label: "状态", value: f.status, mono: false },
              { label: "跟进人", value: f.owner },
              { label: "实际时间", value: f.lastContactAt, mono: true },
              { label: "下次约定", value: f.nextContactAt, mono: true },
              { label: "方式", value: f.mode === "phone" ? "电话" : f.mode === "im" ? "微信" : "面访" },
            ]}
            prices={[
              { label: "跟进记录", value: `${FOLLOWUP_HISTORY.length} 条`, mono: true },
              { label: "客户", value: f.customer, mono: false },
              { label: "字段数", value: "9 / 9", mono: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          <div className="space-y-8">
            <BaseFields f={f} />
            <FollowupHistory history={FOLLOWUP_HISTORY} />
          </div>
          <div className="space-y-6">
            <Actions f={f} />
            <DataSourceNote />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function FieldRow({ label, value, mono, source }: { label: string; value: ReactNode; mono?: boolean; source?: string }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[120px]">{label}</span>
      <span className={`text-[14px] text-[var(--ink)] flex-1 ${mono && typeof value === "string" ? "font-mono tnum" : ""}`}>{value}</span>
      {source && <span className="font-mono text-[14px] text-[var(--ink-mute)]">{source}</span>}
    </div>
  );
}

function BaseFields({ f }: { f: Followup }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">
        跟进档案 · crm_客户跟进记录表
        <span className="ml-2 font-mono text-[14px] text-[var(--ink-mute)]">9 / 9 字段</span>
      </p>
      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)]">
        <div className="grid grid-cols-2 gap-x-12">
          <FieldRow label="跟进 ID (auto)" value={f.id} mono source="auto_number" />
          <FieldRow label="跟进人" value={f.owner} source="user（飞书成员）" />
          <FieldRow label="跟进状态" value={f.status} source="select 7 选项" />
          <FieldRow label="方式" value={f.mode === "phone" ? "电话" : f.mode === "im" ? "微信" : "面访"} source="3 类派生" />
          <FieldRow label="客户 (lookup)" value={
            <Link href={`/customers/${f.customerId}`} className="text-[var(--primary)] hover:underline">{f.customer}</Link>
          } source="lookup 客户表" />
          <FieldRow label="联系人 (lookup)" value={
            <Link href={`/crm/contacts/${f.contactId}`} className="text-[var(--primary)] hover:underline">{f.contactName}</Link>
          } source="lookup 联系人表" />
          <FieldRow label="实际跟进时间" value={f.lastContactAt} mono source="datetime" />
          <FieldRow label="下次跟进时间" value={f.nextContactAt} mono source="datetime" />
          <FieldRow label="跟进记录" value={f.record} />
        </div>
        <p className="text-[14px] text-[var(--ink-mute)] mt-3 leading-relaxed">
          可从联系人姓名直接进入联系人档案，便于查看历史沟通和客户关系。
        </p>
      </div>
    </section>
  );
}

function FollowupHistory({ history }: { history: typeof FOLLOWUP_HISTORY }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 border-b border-[var(--hairline)] pb-2">
        <p className="font-display text-[18px] font-medium text-[var(--ink)]">历史沟通</p>
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">同 crm_客户跟进记录表.跟进记录</span>
      </div>
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
        {history.map((h, i) => (
          <div key={i} className="grid grid-cols-[100px_60px_1fr] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 transition-colors">
            <span className="font-mono text-[14px] text-[var(--ink-dim)]">{h.at}</span>
            <Badge tone={h.mode === "电话" ? "info" : h.mode === "微信" ? "success" : "warn"} size="sm">{h.mode}</Badge>
            <span className="text-[14px] text-[var(--ink)]">{h.record}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Actions({ f }: { f: Followup }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">操作</p>
      <div className="space-y-2">
        <a href={f.contactPhone ? `tel:${f.contactPhone.replace(/[^\d+]/g, "")}` : "#"} className="flex items-center gap-3 border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors">
          <span className="w-8 h-8 rounded-full bg-[var(--success)] text-white flex items-center justify-center"><Phone className="w-4 h-4" /></span>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink)]">立即拨号</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)]">{f.contactPhone ?? "—"}</p>
          </div>
        </a>
        <button className="w-full flex items-center gap-3 border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors text-left">
          <span className="w-8 h-8 rounded-full bg-[var(--warn)] text-white flex items-center justify-center text-[14px]">+</span>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink)]">标记已跟进</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)]">下次：{f.nextContactAt}</p>
          </div>
        </button>
        <Link href={`/crm/followups?customer=${f.customerId}`} className="flex items-center gap-3 rounded-md bg-[var(--accent)]/45 p-3 transition-colors hover:bg-[var(--accent)]">
          <span className="w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink)]">→ 看板内查看</p>
            <p className="font-mono text-[14px] text-[var(--ink-mute)]">同 Kanban 列内{nextStage(f.status)}</p>
          </div>
        </Link>
        <button className="w-full border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors text-left">
          <p className="text-[14px] font-medium text-[var(--ink)]">⏭ 推进状态</p>
          <p className="font-mono text-[14px] text-[var(--ink-mute)]">{f.status} → {nextStage(f.status)}</p>
        </button>
      </div>
    </section>
  );
}

function nextStage(s: string): string {
  const stages = ["初步接触", "需求确认", "方案制定", "商务洽谈", "签约成交", "合作中", "合作结束"];
  const i = stages.indexOf(s);
  return stages[Math.min(i + 1, stages.length - 1)];
}

function DataSourceNote() {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">数据源</p>
      <div className="border border-[var(--hairline)] rounded-md p-3 bg-[var(--secondary)]/40 space-y-1 font-mono text-[14px]">
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>主表</span><span className="text-[var(--ink-dim)]">crm_客户跟进记录表 9/9</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>link 双向</span><span className="text-[var(--ink-dim)]">crm_客户联系人表.联系人ID</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>lookup</span><span className="text-[var(--ink-dim)]">客户 / 联系人姓名</span>
        </p>
      </div>
    </section>
  );
}
