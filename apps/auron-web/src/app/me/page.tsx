"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/domain/kpi-card";
import { MiniSparkline } from "@/components/domain/sparkline";
import { cn } from "@/lib/utils";
import {
  useCurrentUser,
  setCurrentUser,
  relevantToMe,
  useActivities,
  DEMO_USERS,
  type Role,
} from "@/lib/demo-state";

/**
 * /me · 我的工作台（按角色分发）
 *
 * 数据源（伪 SSR friendly，client mount 后读 useCurrentUser）：
 *   业务员 SALES        → 我的客户 + 我的跟进 + 我的报价
 *   报价员 QUOTER       → 我报价的 + 待我审批
 *   前道师傅 KNIT_MASTER→ 我巡检的 5 批次 + 我试产高领打底
 *   业务跟单 ORDER      → 我跟单的 5 张通知 + 进度跟踪
 *   厂长 DIRECTOR       → 全部读 + 审批
 *   老板 OWNER          → 全局 + 待我审批 + 团队状态
 *
 * 本页面所有 mock 数据 **严格从已有 crm_* 表派生**：
 *   - 我的客户 ← crm_客户表.负责人 link
 *   - 我的跟进 ← crm_客户跟进记录表.跟进人 user
 *   - 我的报价 ← crm_报价单_基础.业务 ...
 *   - 我巡检的 ← crm_打样工艺单_基础信息表.前道打样师傅 user
 *   - 我跟单的 ← crm_打样通知_基础信息表.业务跟单 user
 */

export default function MePage() {
  const me = useCurrentUser();

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1480px]">
        <MeHeader me={me} />

        <RoleView role={me.role} />
      </div>
    </AdminShell>
  );
}

/* ─── 顶部 ─── */
function MeHeader({ me }: { me: ReturnType<typeof useCurrentUser> }) {
  return (
    <div className="mb-6 space-y-4">
      <FabricLabel
        docNo={`ME-${me.name}-${new Date().toISOString().slice(0, 10)}`}
        shortCode="我的"
        season={me.role}
        composition={`${me.position} · ${me.dept} · 演示态可切换身份`}
        specs={[
          { label: "姓名", value: me.name, mono: false },
          { label: "角色", value: me.role, mono: true },
          { label: "部门", value: me.dept, mono: true },
          { label: "下次跟进", value: "今 16:00", mono: true },
        ]}
        prices={[
          { label: "今日新跟进", value: "3 条", mono: true },
          { label: "等我审批", value: "2 件", mono: true },
          { label: "未结工艺", value: "4 单", mono: true },
        ]}
      />

      {/* 角色切换器 (演示态) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0">
          演示态 · 切换：
        </span>
        <div className="flex items-center gap-1">
          {DEMO_USERS.map((u) => (
            <button
              key={u.key}
              onClick={() => setCurrentUser(u.key)}
              className={cn(
                "h-7 px-2.5 rounded-md text-[14px] transition-colors shrink-0",
                me.key === u.key
                  ? "bg-[var(--ink)] text-[var(--background)] font-medium"
                  : "border border-[var(--hairline-strong)] text-[var(--ink-dim)] hover:bg-[var(--accent)]"
              )}
              title={`${u.position} · ${u.dept}`}
            >
              <span className="font-mono">{u.role}</span>
              <span className="ml-1.5">{u.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 按角色分发 ─── */
function RoleView({ role }: { role: Role }) {
  switch (role) {
    case "SALES":       return <SalesView />;
    case "QUOTER":      return <QuoterView />;
    case "KNIT_MASTER": return <KnitMasterView />;
    case "SEW_MASTER":  return <SewMasterView />;
    case "ORDER":       return <OrderView />;
    case "DIRECTOR":    return <DirectorView />;
    case "OWNER":       return <OwnerView />;
    default:            return <OwnerView />;
  }
}

/* ════════════════════════════════════════════════ */
/*              5 个角色视图                          */
/* ════════════════════════════════════════════════ */

/* —— 1 · 业务员 —— */
function SalesView() {
  const me = useCurrentUser();
  const myCustomers = [
    { id: "CUST-QS-001", name: "乾盛服饰",       shortName: "乾盛",   type: "重要",   tags: ["品牌商"], lastContact: "今 09:14", openNotices: 4, ytdRevenue: 2_450_000 },
    { id: "CUST-QD-044", name: "巧岛针织",       shortName: "巧岛",   type: "未合作", tags: ["跨境"],   lastContact: "今 11:02", openNotices: 1, ytdRevenue: 0 },
    { id: "CUST-MD-019", name: "鸣笛工贸",       shortName: "鸣笛",   type: "已合作", tags: [],         lastContact: "8 天前",   openNotices: 0, ytdRevenue: 0 },
  ];
  const myFollowups = [
    { customer: "巧岛",   contact: "张设计", what: "色牢度报价被打回，今日重算",       due: "今 17:00", status: "需求确认" },
    { customer: "鸣笛",   contact: "丁工",   what: "到访工厂看机器",                   due: "今 14:00", status: "方案制定" },
    { customer: "乾盛",   contact: "陈总",   what: "200 件大货合同辅料清单确认",         due: "今 14:00", status: "合作中"   },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title={`${me.name} · 业务员视图`} sub={`销售 pipeline 的核心：客户 + 跟进 + 报价`} badge="SALES" />

      {/* KPI */}
      <section>
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="我的客户"   value="3"   unit="家"  delta={{ value: 0, period: "本周" }}          spark={[3,3,3,3,3,3,3]} sparkTone="neutral" href="/customers" />
          <KpiCard label="30d 跟进"   value="8"   unit="次"  delta={{ value: 2, period: "本周" }}          spark={[2,3,4,5,6,7,8]} sparkTone="success" href="/crm/followups" />
          <KpiCard label="在手报价"   value="4"   unit="单"  delta={{ value: 0, period: "本周" }}          spark={[3,3,4,4,4,4,4]} sparkTone="neutral" href="/orders/quotations" />
          <KpiCard label="等待我跟进" value="3"   unit="条"  delta={{ value: 1, period: "今日新增", positive: false }} alert spark={[1,1,2,2,2,3,3]} sparkTone="warn" href="/crm/followups" />
        </div>
      </section>

      {/* 我的客户 */}
      <section>
        <SectionSub title="我的客户" href="/customers" count={`${myCustomers.length} 家`} />
        <CardList
          items={myCustomers.map((c) => ({
            href: `/customers/${c.id}`,
            badge: <Badge tone={c.type === "重要" ? "success" : "info"} size="sm">{c.type}</Badge>,
            title: c.name,
            subtitle: `#${c.id.replace("CUST-", "")} · ${c.tags[0] ?? "—"} · 上次 ${c.lastContact}`,
            right: [
              { label: "未结打样", value: c.openNotices, mono: true },
              { label: "YTD", value: `¥${(c.ytdRevenue / 10000).toFixed(1)}w`, mono: true },
            ],
          }))}
        />
      </section>

      {/* 我的跟进 */}
      <section>
        <SectionSub title="今日跟进" href="/crm/followups" count={`${myFollowups.length} 条`} />
        <FollowupList items={myFollowups} />
      </section>
    </div>
  );
}

/* —— 2 · 报价员 —— */
function QuoterView() {
  const me = useCurrentUser();
  return (
    <div className="space-y-8">
      <SectionTitle title={`${me.name} · 报价员视图`} sub={`报价全权 · 含毛利/含税成本 · 优先审批`} badge="QUOTER" />
      <section>
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="我报价的"     value="5"   unit="单"  delta={{ value: 0, period: "本月" }}     spark={[3,4,4,5,5,5,5]} sparkTone="primary" href="/orders/quotations" />
          <KpiCard label="待我审批"     value="2"   unit="件"  delta={{ value: 1, period: "今日", positive: false }} alert spark={[0,0,1,1,1,2,2]} sparkTone="danger" href="/orders/quotations" />
          <KpiCard label="平均含税毛利" value="32.4" unit="%" delta={{ value: -1.2, period: "环比", positive: false }} spark={[34,33,34,31,30,31,32]} sparkTone="warn" alert href="/orders/quotations" />
          <KpiCard label="本月成交"     value="3"   unit="单"  delta={{ value: 1, period: "本周" }}      spark={[0,0,1,1,2,3,3]} sparkTone="success" href="/orders/quotations" />
        </div>
      </section>

      <section>
        <SectionSub title="等待审批" count="2 件" />
        <QuoteList items={[
          { doc: "Q-0317-A", customer: "乾盛", product: "羊毛双面呢立领大衣", amount: 410.40, qty: "200 件", status: "待李老板审批" },
          { doc: "Q-0315-A", customer: "弘大", product: "圆机 T 恤基础款",     amount: 96.50,  qty: "500 件", status: "重算中（染色涨价）" },
        ]} />
      </section>
    </div>
  );
}

/* —— 3 · 前道师傅 —— */
function KnitMasterView() {
  const me = useCurrentUser();
  return (
    <div className="space-y-8">
      <SectionTitle title={`${me.name} · 前道师傅视图`} sub={`织造用料 · 纱线排列 · 工艺配方 · 含税成本 🔒`} badge="KNIT_MASTER" />
      <section>
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="我巡检的批次" value="5" unit="个"  delta={{ value: 0, period: "今日" }}     spark={[5,4,6,5,5,5,5]} sparkTone="primary" href="/orders/sample-workorders" />
          <KpiCard label="待处理异常"   value="1" unit="单"  delta={{ value: 0, period: "本周" }}     spark={[0,0,1,1,1,1,1]} sparkTone="warn" alert href="/orders/sample-workorders/WO-2026-0317-A" />
          <KpiCard label="机台运行率"   value="92" unit="%"  delta={{ value: 3, period: "昨日" }}      spark={[80,84,87,89,90,91,92]} sparkTone="success" href="/dictionary/machines" />
          <KpiCard label="本周试产"     value="2" unit="款"  delta={{ value: 1, period: "今日" }}      spark={[0,0,0,1,1,1,2]} sparkTone="neutral" href="/dictionary/machines" />
        </div>
      </section>

      <section>
        <SectionSub title="今日巡检" count="5 批次" />
        <CardList
          items={[
            { href: "/orders/sample-workorders/WO-2026-0317-A", title: "WO-0317-A · 前道织造中", subtitle: "羊绒/长绒棉 60/40 · 320 GSM · 已织 80%", badge: <Badge tone="info" size="sm">进行中</Badge>, right: [{ label: "剩余", value: "5 天" }] },
            { href: "/orders/sample-workorders/WO-2026-0316-A", title: "WO-0316-A · 罗纹打底", subtitle: "莫代尔 40/1 · 180 GSM · 染色待排", badge: <Badge tone="warn" size="sm">染色待排</Badge>, right: [{ label: "剩余", value: "2 天" }] },
            { href: "/orders/sample-workorders/WO-2026-0325-A", title: "WO-0325-A · 高领打底试产首件", subtitle: "抗起球腈纶 32/2 · 260 GSM · 已完成首件", badge: <Badge tone="success" size="sm">已完成</Badge>, right: [{ label: "成型率", value: "94%" }] },
          ]}
        />
      </section>
    </div>
  );
}

/* —— 4 · 业务跟单 —— */
function OrderView() {
  const me = useCurrentUser();
  return (
    <div className="space-y-8">
      <SectionTitle title={`${me.name} · 业务跟单视图`} sub={`打样通知进度跟踪 · 染厂 / 辅料 / 物流对接`} badge="ORDER" />
      <section>
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="我跟单的通知" value="5" unit="张" delta={{ value: 0, period: "本周" }} spark={[5,5,5,5,5,5,5]} sparkTone="primary" href="/orders/sample-notices" />
          <KpiCard label="今日催交辅料" value="2" unit="项" delta={{ value: 0, period: "今日" }} spark={[1,1,2,2,2,2,2]} sparkTone="warn" href="/orders/sample-notices" />
          <KpiCard label="打回需要重做" value="1" unit="张" delta={{ value: 0, period: "今日" }} spark={[0,0,0,1,1,1,1]} sparkTone="danger" alert href="/orders/sample-notices/SMPL-2026-0317-A" />
          <KpiCard label="待我送辅料"   value="3" unit="项" delta={{ value: 0, period: "今日" }} spark={[2,2,3,3,3,3,3]} sparkTone="neutral" href="/orders/sample-notices" />
        </div>
      </section>

      <section>
        <SectionSub title="我跟单的打样通知" count="5 张" />
        <CardList
          items={[
            { href: "/orders/sample-notices/SMPL-2026-0317-A", title: "SMPL-0317-A · 乾盛羊毛双面呢", subtitle: "已通知 · 前道中 · 辅料在送", badge: <Badge tone="info" size="sm">前道中</Badge>, right: [{ label: "交样", value: "07-28" }] },
            { href: "/orders/sample-notices/SMPL-2026-0316-A", title: "SMPL-0316-A · 弘大圆 T", subtitle: "已通知 · 后道中 · 验货待定", badge: <Badge tone="warn" size="sm">后道中</Badge>, right: [{ label: "交样", value: "07-25" }] },
            { href: "/orders/sample-notices/SMPL-2026-0315-A", title: "SMPL-0315-A · 弘大圆 T", subtitle: "已签收 · 已结案", badge: <Badge tone="success" size="sm">已签收</Badge>, right: [{ label: "结案", value: "07-21" }] },
          ]}
        />
      </section>
    </div>
  );
}

/* —— 5 · 后道师傅 —— */
function SewMasterView() {
  const me = useCurrentUser();
  return (
    <div className="space-y-8">
      <SectionTitle title={`${me.name} · 后道师傅视图`} sub={`染色工艺 · 缝制工价 · 整烫包装 · 织造/染色成本 🔒`} badge="SEW_MASTER" />
      <section>
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="染色在产"     value="4" unit="批" delta={{ value: 0, period: "今日" }} spark={[3,4,4,4,4,4,4]} sparkTone="primary" href="/orders/sample-notices" />
          <KpiCard label="缝制在产"     value="6" unit="批" delta={{ value: 1, period: "本周" }} spark={[5,5,5,6,6,6,6]} sparkTone="success" href="/orders/sample-notices" />
          <KpiCard label="整烫在产"     value="2" unit="批" delta={{ value: 0, period: "今日" }} spark={[2,2,2,2,2,2,2]} sparkTone="neutral" href="/orders/sample-notices" />
          <KpiCard label="今日出货"     value="1" unit="批" delta={{ value: 1, period: "今日" }} spark={[0,0,0,0,0,0,1]} sparkTone="success" href="/orders/sample-notices" />
        </div>
      </section>
    </div>
  );
}

/* —— 6 · 厂长 —— */
function DirectorView() {
  const me = useCurrentUser();
  return (
    <div className="space-y-8">
      <SectionTitle title={`${me.name} · 厂长视图`} sub={`审批 · 异常 · 趋势 · 团队状态`} badge="DIRECTOR" />
      <DirectorInner />
    </div>
  );
}

/* —— 7 · 老板 —— */
function OwnerView() {
  const me = useCurrentUser();
  return (
    <div className="space-y-8">
      <SectionTitle title={`${me.name} · 老板视图`} sub={`全厂每日 · 待审 · 异常 · 趋势 · 团队 · 含成本和毛利`} badge="OWNER" />
      <DirectorInner />

      {/* 老板专属：跨表活动聚合 */}
      <section>
        <SectionSub title="跨表活动" href="/inbox" count={`${unreadCount()} 条未读`} />
        <ActivityFeed limit={5} />
      </section>
    </div>
  );
}

function DirectorInner() {
  return (
    <section>
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="YTD 营收"     value="¥ 6.5M"  delta={{ value: 12.4, period: "同比", positive: true }} spark={[3.2,3.5,3.3,3.8,4.2,5.1,6.5]} sparkTone="primary" href="/orders/quotations" />
        <KpiCard label="YTD 毛利"     value="¥ 1.7M"  delta={{ value: 2.1,  period: "环比", positive: true }} spark={[2.0,2.1,2.0,2.2,1.6,1.7,1.7]} sparkTone="success" href="/orders/quotations" />
        <KpiCard label="平均含税毛利" value="32.4%"   delta={{ value: -1.2, period: "环比", positive: false }} spark={[34,33,34,31,30,31,32]} sparkTone="warn" alert href="/orders/quotations" />
        <KpiCard label="在手工艺"     value="4 单"    delta={{ value: 0, period: "环比" }} spark={[6,5,5,4,5,4,4]} sparkTone="neutral" href="/orders/sample-workorders" />
        <KpiCard label="未结打样"     value="2 单"    delta={{ value: 1, period: "今日", positive: false }} alert spark={[0,0,1,1,1,2,2]} sparkTone="danger" href="/orders/sample-notices" />
        <KpiCard label="在档纱线"     value="12 款"   delta={{ value: 0, period: "字典行数" }} spark={[12,12,12,12,12,12,12]} sparkTone="neutral" href="/dictionary/materials" />
        <KpiCard label="逾期跟进"     value="2 个"    delta={{ value: 1, period: "本周", positive: false }} alert spark={[0,0,1,1,1,2,2]} sparkTone="danger" href="/crm/followups" />
        <KpiCard label="待审报价"     value="2 件"    delta={{ value: 1, period: "今日", positive: false }} alert spark={[0,0,0,1,1,2,2]} sparkTone="primary" href="/orders/quotations" />
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════ */
/*              通用小部件                          */
/* ════════════════════════════════════════════════ */

function SectionTitle({ title, sub, badge }: { title: string; sub: string; badge: string }) {
  return (
    <div className="flex items-end justify-between border-b border-[var(--hairline)] pb-3">
      <div>
        <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">/me · 我的工作台</p>
        <h1 className="font-display text-[32px] font-medium tracking-tight text-[var(--ink)]">{title}</h1>
        <p className="mt-1 text-[14px] text-[var(--ink-dim)] max-w-[560px]">{sub}</p>
      </div>
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] px-2.5 py-1 rounded bg-[var(--accent)] text-[var(--ink)] border border-[var(--hairline-strong)]">
        {badge}
      </span>
    </div>
  );
}

function SectionSub({ title, href, count }: { title: string; href?: string; count?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="font-display text-[18px] font-medium text-[var(--ink)]">{title}</p>
      {count && (
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">{count}</span>
      )}
      {href && (
        <Link href={href} className="text-[14px] font-mono text-[var(--ink-dim)] hover:text-[var(--primary)]">
          查看全部 →
        </Link>
      )}
    </div>
  );
}

function CardList({ items }: { items: { href: string; title: string; subtitle: string; badge: React.ReactNode; right: { label: string; value: string | number; mono?: boolean }[] }[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it, i) => (
        <Link
          key={i}
          href={it.href}
          className="group border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)] hover:border-[var(--primary)] transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            {it.badge}
            <span className="text-[14px] font-mono text-[var(--ink-mute)] group-hover:text-[var(--primary)]">
              详情 →
            </span>
          </div>
          <p className="text-[14px] font-medium text-[var(--ink)] mb-1">{it.title}</p>
          <p className="text-[14px] font-mono text-[var(--ink-mute)] mb-3 truncate">{it.subtitle}</p>
          <div className="flex items-center gap-4 border-t border-[var(--hairline)] pt-2">
            {it.right.map((r, j) => (
              <div key={j}>
                <p className="text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] font-mono">{r.label}</p>
                <p className={cn("text-[14px] text-[var(--ink)] mt-0.5", r.mono && "font-mono tnum")}>{r.value}</p>
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}

function FollowupList({ items }: { items: { customer: string; contact: string; what: string; due: string; status: string }[] }) {
  return (
    <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
      {items.map((it, i) => (
        <Link
          key={i}
          href="/crm/followups"
          className="grid grid-cols-[80px_120px_1fr_120px_140px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors"
        >
          <Badge tone="info" size="sm">{it.status}</Badge>
          <span className="text-[14px] font-medium text-[var(--ink)]">{it.customer}</span>
          <span className="text-[14px] text-[var(--ink-dim)] truncate">{it.contact} · {it.what}</span>
          <span className={cn("font-mono text-[14px]", it.due.startsWith("今") ? "text-[var(--warn)] font-medium" : "text-[var(--ink-dim)]")}>
            {it.due}
          </span>
          <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            跟进记录 →
          </span>
        </Link>
      ))}
    </div>
  );
}

function QuoteList({ items }: { items: { doc: string; customer: string; product: string; amount: number; qty: string; status: string }[] }) {
  return (
    <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
      {items.map((it, i) => (
        <Link
          key={i}
          href={`/orders/quotations/${it.doc}`}
          className="grid grid-cols-[140px_120px_1fr_120px_100px_1fr] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors"
        >
          <span className="font-mono text-[14px] font-medium text-[var(--ink)]">{it.doc}</span>
          <span className="text-[14px] text-[var(--ink-dim)]">{it.customer}</span>
          <span className="text-[14px] text-[var(--ink)] truncate">{it.product}</span>
          <span className="font-mono tnum text-[14px] text-[var(--ink)] text-right">¥{it.amount.toFixed(2)}</span>
          <span className="font-mono text-[14px] text-[var(--ink-dim)]">{it.qty}</span>
          <Badge tone="warn" size="sm">{it.status}</Badge>
        </Link>
      ))}
    </div>
  );
}

/* ── 复用 inbox 的活动流 ── */
function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const { activities, unread } = useActivities();
  const list = activities.slice(0, limit);
  return (
    <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
      <div className="px-4 py-3 border-b border-[var(--hairline)] flex items-center justify-between bg-[var(--secondary)]/40">
        <p className="font-display text-[18px] font-medium">最近活动 · {unread} 条未读</p>
        <Link href="/inbox" className="font-mono text-[14px] text-[var(--ink-dim)] hover:text-[var(--primary)]">查看全部 →</Link>
      </div>
      {list.map((a) => (
        <Link
          key={a.id}
          href={a.href}
          className="grid grid-cols-[80px_40px_1fr_120px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 transition-colors"
        >
          <Badge tone={KIND_TONE[a.kind]} size="sm">{KIND_LABEL[a.kind]}</Badge>
          <span className="w-7 h-7 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center text-[14px] font-mono">
            {a.whoInitials}
          </span>
          <span className="text-[14px] text-[var(--ink)] truncate">
            {a.whoName} · {a.summary}
          </span>
          <span className="font-mono text-[14px] text-[var(--ink-mute)]">{a.at}</span>
        </Link>
      ))}
    </div>
  );
}

function unreadCount() {
  const { unread } = useActivities();
  return unread;
}

const KIND_LABEL = {
  followup:  "跟进",
  quotation: "报价",
  sample:    "打样",
  workorder: "工艺",
  audit:     "审计",
  team:      "团队",
} as const;

const KIND_TONE = {
  followup:  "info",
  quotation: "primary",
  sample:    "warn",
  workorder: "success",
  audit:     "neutral",
  team:      "neutral",
} as const;
