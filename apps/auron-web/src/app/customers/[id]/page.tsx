"use client";

import type { ReactNode } from "react";
import { use } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCustomerBundle } from "@/lib/data";
import { withQuery } from "@/lib/url-filter";
import { Phone, Mail, ArrowUpRight } from "lucide-react";

/**
 * /customers/[id] · 客户详情
 *
 * 数据源 · crm_客户表 7 字段全展示（通过 getCustomerBundle() 一次性拉到 5 张关联表）
 *
 * 关联跳转聚合 — 4 个区块：
 *   A. 联系人      (crm_客户联系人表)
 *   B. 跟进        (crm_客户跟进记录表)
 *   C. 打样通知    (crm_打样通知_基础信息表)
 *   D. 报价        (crm_报价单_基础信息表)
 *   工艺单也一并展示（按工艺表 join 通知表）
 *
 * 派生字段（聚合源表 join）：
 *   YTD 营收 / YTD 毛利 / 未结打样数 / 30d 跟进数 / 最后接触时间
 */

export default function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bundle = getCustomerBundle(id);

  if (!bundle) {
    return (
      <AdminShell>
        <div className="px-8 py-16 mx-auto max-w-[1280px] text-center">
          <h1 className="font-display text-[24px] font-medium mb-2">未找到客户 {id}</h1>
          <p className="text-[14px] text-[var(--ink-dim)] mb-6">该 ID 不存在于 crm_客户表（mock 数据）。</p>
          <Link href="/customers"><Button variant="default" size="md">返回客户列表</Button></Link>
        </div>
      </AdminShell>
    );
  }

  const { customer, contacts, followups, notices, quotes, workorders } = bundle;

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 面包屑 */}
        <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/customers" className="hover:text-[var(--ink)]">客户档案</Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{customer.shortName}</span>
          <span className="text-[var(--ink-mute)] ml-2">· {customer.id}</span>
        </div>

        {/* 头部唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo={`CUST-${customer.id}-DETAIL`}
            shortCode={customer.id.replace("CUST-", "")}
            season={customer.type}
            composition={`${customer.name} · ${customer.owner} 负责 · ${customer.collaborators?.length ?? 0} 协作`}
            specs={[
              { label: "客户 ID", value: customer.id, mono: true },
              { label: "类型", value: customer.type, mono: false },
              { label: "YTD 营收", value: `¥${(customer.ytdRevenue / 10000).toFixed(1)}w`, mono: true },
              { label: "YTD 毛利", value: `${customer.ytdMargin.toFixed(1)}%`, mono: true },
              { label: "近 30d 跟进", value: customer.followups30d, mono: true },
              { label: "最后接触", value: customer.lastContactAt, mono: true },
            ]}
            prices={[
              { label: "未结打样", value: customer.openNotices, mono: true },
              { label: "联系人", value: contacts.length, mono: true },
              { label: "在档工艺", value: workorders.length, mono: true },
              { label: "报价数", value: quotes.length, mono: true },
            ]}
          />
        </div>

        {/* 主区 */}
        <div className="grid grid-cols-[1fr_320px] gap-6 mb-10">
          <div className="space-y-8">
            <CustomerBaseFields customer={customer} />
            <RelatedFollowups followups={followups} />
            <RelatedNotices notices={notices} />
            <RelatedQuotes quotes={quotes} />
            <RelatedWorkorders workorders={workorders} />
          </div>

          <div className="space-y-6">
            <CustomerActions customer={customer} />
            <ContactList contacts={contacts} />
            <DataSourceCard />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

/* ─── 子组件 ─── */

function FieldRow({ label, value, mono, source }: { label: string; value: ReactNode; mono?: boolean; source?: string }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[140px]">{label}</span>
      <span className={cn("text-[14px] text-[var(--ink)] flex-1", mono && "font-mono tnum")}>{value}</span>
      {source && <span className="font-mono text-[12px] text-[var(--ink-mute)]">{source}</span>}
    </div>
  );
}

function FieldGrid({ items }: { items: { label: string; value: ReactNode; mono?: boolean; source?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-12">
      {items.map((it, i) => (
        <FieldRow key={i} label={it.label} value={it.value} mono={it.mono} source={it.source} />
      ))}
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 border-b border-[var(--hairline)] pb-2">
      <p className="font-display text-[16px] font-medium text-[var(--ink)]">{title}</p>
      {count && <span className="font-mono text-[12px] text-[var(--ink-mute)]">{count}</span>}
    </div>
  );
}

function CustomerBaseFields({ customer }: { customer: any }) {
  return (
    <section>
      <SectionTitle title="客户档案 · crm_客户表" count="7 / 7 字段" />
      <div className="border border-[var(--hairline)] rounded-md p-5 bg-[var(--card)]">
        <FieldGrid
          items={[
            { label: "客户 ID",      value: customer.id, mono: true, source: "text (auto)" },
            { label: "客户名称",     value: customer.name, source: "text" },
            { label: "简称",         value: customer.shortName, source: "text" },
            { label: "客户类型",     value: <Badge tone={customer.type === "重要" ? "success" : customer.type === "已合作" ? "info" : "neutral"} size="sm">{customer.type}</Badge>, source: "select 3 选项" },
            { label: "标签",         value: customer.tags.length === 0 ? <span className="font-mono text-[12px] text-[var(--ink-mute)]">—</span> : (
                <span className="inline-flex items-center gap-1">
                  {customer.tags.map((t: string) => (
                    <span key={t} className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--ink-dim)]">#{t}</span>
                  ))}
                </span>
              ), source: "select: 品牌商/跨境" },
            { label: "负责人",       value: <PersonChip name={customer.owner} />, source: "link 人员" },
            { label: "协作人",       value: customer.collaborators?.length > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  {customer.collaborators.map((n: string) => <PersonChip key={n} name={n} />)}
                </span>
              ) : <span className="font-mono text-[12px] text-[var(--ink-mute)]">—</span>, source: "link 人员 (多)" },
            { label: "客户备注",     value: customer.note || "—", source: "text" },
            { label: "YTD 营收",     value: customer.ytdRevenue > 0 ? `¥${customer.ytdRevenue.toLocaleString()}` : "—", mono: true, source: "源 crm_报价单_总计表 ⓘ" },
            { label: "YTD 毛利",     value: customer.ytdMargin > 0 ? `${customer.ytdMargin.toFixed(1)}%` : "—", mono: true, source: "源 crm_报价单_总计表 ⓘ" },
            { label: "未结打样",     value: customer.openNotices, mono: true, source: "源 crm_打样通知_基础 ⓘ" },
            { label: "近 30d 跟进",  value: customer.followups30d, mono: true, source: "源 crm_客户跟进记录 ⓘ" },
            { label: "最后接触",     value: customer.lastContactAt, mono: true, source: "源 crm_客户跟进记录 MAX ⓘ" },
          ]}
        />
      </div>
    </section>
  );
}

function PersonChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center text-[12px] font-mono">{name[0]}</span>
      <span className="text-[14px] text-[var(--ink)]">{name}</span>
    </span>
  );
}

function CustomerActions({ customer }: { customer: any }) {
  return (
    <section>
      <SectionTitle title="快捷操作" />
      <div className="space-y-2">
        <Link href={`/orders/sample-notices/new?customer=${customer.id}`} className="block">
          <div className="border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors group">
            <p className="text-[14px] font-medium text-[var(--ink)]">+ 新建打样通知</p>
            <p className="text-[12px] font-mono text-[var(--ink-mute)] mt-0.5">从客户档案发起新需求</p>
          </div>
        </Link>
        <Link href={withQuery("/crm/followups", { customer: customer.id })} className="block">
          <div className="border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors">
            <p className="text-[14px] font-medium text-[var(--ink)]">+ 新跟进</p>
            <p className="text-[12px] font-mono text-[var(--ink-mute)] mt-0.5">预约下次接触时间</p>
          </div>
        </Link>
        <Link href={`/orders/quotations/new?customer=${customer.id}`} className="block">
          <div className="border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors">
            <p className="text-[14px] font-medium text-[var(--ink)]">+ 发起报价</p>
            <p className="text-[12px] font-mono text-[var(--ink-mute)] mt-0.5">基于已有工艺出价</p>
          </div>
        </Link>
        <Link href={`/crm/contacts/new?customer=${customer.id}`} className="block">
          <div className="border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors">
            <p className="text-[14px] font-medium text-[var(--ink)]">+ 添加联系人</p>
            <p className="text-[12px] font-mono text-[var(--ink-mute)] mt-0.5">关联 crm_客户联系人表</p>
          </div>
        </Link>
        <button className="w-full border border-[var(--hairline)] rounded-md p-3 hover:border-[var(--primary)] hover:bg-[var(--accent)]/30 transition-colors text-left">
          <p className="text-[14px] font-medium text-[var(--ink)]">✏️ 编辑客户</p>
          <p className="text-[12px] font-mono text-[var(--ink-mute)] mt-0.5">改 type / 备注 / 协作人</p>
        </button>
      </div>
    </section>
  );
}

function ContactList({ contacts }: { contacts: any[] }) {
  return (
    <section>
      <SectionTitle title="该客户联系人" count={`${contacts.length} 个`} />
      {contacts.length === 0 ? (
        <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-6 text-center">
          <p className="text-[12px] text-[var(--ink-mute)] font-mono">暂无联系人</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => (
            <Link key={c.id} href={`/crm/contacts/${c.id}`} className="block border border-[var(--hairline)] rounded-md p-3 bg-[var(--card)] hover:border-[var(--primary)] transition-colors">
              <div className="flex items-start gap-2 mb-2">
                <PersonChip name={c.name} />
                <span className="text-[12px] font-mono text-[var(--ink-mute)]">{c.title}</span>
                <span className="ml-auto font-mono text-[12px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--ink-dim)]">{c.role}</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] font-mono text-[var(--ink-dim)]">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-[12px] font-mono text-[var(--ink-dim)] mt-0.5">
                <Mail className="w-3 h-3" />
                <span className="truncate">{c.email}</span>
              </div>
              <p className="text-[12px] font-mono text-[var(--ink-mute)] mt-1">上次接触 {c.lastTouchAt}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function DataSourceCard() {
  return (
    <section>
      <SectionTitle title="数据源 / crm 字段映射" />
      <div className="border border-[var(--hairline)] rounded-md p-3 bg-[var(--secondary)]/40 space-y-1.5 font-mono text-[12px]">
        <p className="text-[var(--ink-mute)] flex justify-between"><span>主表</span><span className="text-[var(--ink-dim)]">crm_客户表 7/7</span></p>
        <p className="text-[var(--ink-mute)] flex justify-between"><span>聚合方式</span><span className="text-[var(--ink-dim)]">getCustomerBundle()</span></p>
        <p className="text-[var(--ink-mute)] flex justify-between"><span>联系人</span><span className="text-[var(--ink-dim)]">crm_客户联系人表</span></p>
        <p className="text-[var(--ink-mute)] flex justify-between"><span>跟进</span><span className="text-[var(--ink-dim)]">crm_客户跟进记录表</span></p>
        <p className="text-[var(--ink-mute)] flex justify-between"><span>打样通知</span><span className="text-[var(--ink-dim)]">crm_打样通知_基础</span></p>
        <p className="text-[var(--ink-mute)] flex justify-between"><span>报价</span><span className="text-[var(--ink-dim)]">crm_报价单_基础</span></p>
        <p className="text-[var(--ink-mute)] flex justify-between"><span>工艺单</span><span className="text-[var(--ink-dim)]">crm_打样工艺单_基础</span></p>
        <p className="pt-2 border-t border-[var(--hairline)] text-[12px] text-[var(--ink-mute)]">派生 5 列 ⓘ 角标 · 源表聚合在后端接管</p>
      </div>
    </section>
  );
}

/* ─── 4 张关联表 ─── */

function RelatedFollowups({ followups }: { followups: any[] }) {
  return (
    <section>
      <SectionTitle title="该客户的跟进" count={`${followups.length} 条`} />
      {followups.length === 0 ? <EmptyHint /> : (
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          {followups.map((f) => (
            <Link key={f.id} href={`/crm/followups/${f.id}`} className="grid grid-cols-[100px_140px_1fr_140px_120px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors">
              <Badge tone="info" size="sm">{f.status}</Badge>
              <span className="text-[14px] text-[var(--ink)]">{f.contactName}</span>
              <span className="text-[14px] text-[var(--ink-dim)] truncate">{f.record}</span>
              <span className={cn("font-mono text-[14px]", f.nextContactAt.startsWith("今") ? "text-[var(--warn)]" : "text-[var(--ink-dim)]")}>{f.nextContactAt}</span>
              <span className="font-mono text-[12px] text-[var(--ink-mute)] text-right inline-flex items-center justify-end gap-1">{f.owner}<ArrowUpRight className="w-3 h-3" /></span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function RelatedNotices({ notices }: { notices: any[] }) {
  return (
    <section>
      <SectionTitle title="该客户的打样通知" count={`${notices.length} 张`} />
      {notices.length === 0 ? <EmptyHint /> : (
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          {notices.map((n) => (
            <Link key={n.id} href={`/orders/sample-notices/${n.id}`} className="grid grid-cols-[160px_1fr_60px_60px_100px_60px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors">
              <span className="font-mono text-[14px] font-medium text-[var(--ink)]">{n.id}</span>
              <span className="text-[14px] text-[var(--ink-dim)] truncate">{n.product} · {n.color}</span>
              <span className="font-mono tnum text-[14px] text-right">{n.specs.gsm}</span>
              <span className="text-[12px] font-mono text-[var(--ink-mute)]">GSM</span>
              <Badge tone={n.progress === "已签收" ? "success" : n.progress === "前道中" ? "info" : n.progress === "后道中" ? "warn" : n.progress === "打回" ? "danger" : "neutral"} size="sm">{n.progress}</Badge>
              <span className="font-mono text-[12px] text-[var(--ink-mute)]">{n.updated}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function RelatedQuotes({ quotes }: { quotes: any[] }) {
  return (
    <section>
      <SectionTitle title="该客户的报价" count={`${quotes.length} 件`} />
      {quotes.length === 0 ? <EmptyHint /> : (
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          {quotes.map((q) => (
            <Link key={q.id} href={`/orders/quotations/${q.id}`} className="grid grid-cols-[140px_1fr_120px_100px_140px_60px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors">
              <span className="font-mono text-[14px] font-medium text-[var(--ink)]">{q.id}</span>
              <span className="text-[14px] text-[var(--ink-dim)] truncate">{q.product}</span>
              <span className="font-mono tnum text-[14px] text-right">¥{q.filedPriceInc.toFixed(2)}</span>
              <span className="font-mono text-[12px] text-[var(--ink-dim)]">{q.orderQty} 件</span>
              <Badge tone={q.status === "已成交" ? "success" : "warn"} size="sm">{q.status}</Badge>
              <span className="font-mono text-[12px] text-[var(--ink-mute)]">{q.updated}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function RelatedWorkorders({ workorders }: { workorders: any[] }) {
  return (
    <section>
      <SectionTitle title="该客户的工艺单" count={`${workorders.length} 件`} />
      {workorders.length === 0 ? <EmptyHint /> : (
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          {workorders.map((w) => (
            <Link key={w.id} href={`/orders/sample-workorders/${w.id}`} className="grid grid-cols-[140px_1fr_1fr_120px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors">
              <span className="font-mono text-[14px] font-medium text-[var(--ink)]">{w.id}</span>
              <span className="text-[14px] text-[var(--ink-dim)]">{w.part}</span>
              <span className="text-[14px] text-[var(--ink-dim)] truncate">{w.yarn} · {w.ratio}</span>
              <Badge tone={w.status === "织造中" ? "info" : "success"} size="sm">{w.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyHint() {
  return (
    <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-6 px-6 text-center">
      <p className="text-[12px] text-[var(--ink-mute)] font-mono">暂无记录</p>
    </div>
  );
}
