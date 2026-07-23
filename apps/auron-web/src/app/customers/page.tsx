"use client";

import { use, useState, useEffect, useMemo } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, fmtCompact, fmtPrice } from "@/lib/utils";
import { NewCustomerSheet } from "@/components/domain/customer-form";
import { EmptyState, EmptyIllustration } from "@/components/ui/empty-state";
import { NumChip } from "@/components/domain/a-status";
import { getCustomers, type Customer, type CustomerType, type Tag } from "@/lib/data";

const TYPE_TONE: Record<CustomerType, "neutral" | "info" | "success"> = {
  "未合作": "neutral",
  "已合作": "info",
  "重要":   "success",
};

/* —— 派生字段在每一格的 hover 角标，注明 join 来源 —— */
const DERIVED_FROM: Record<string, string> = {
  ytdRevenue:   "crm_报价单_总计表 SUM(含税毛利)",
  ytdMargin:    "crm_报价单_总计表 损益计算",
  openNotices:  'crm_打样通知_基础信息表 进度状态 ≠ "已结束"',
  followups30d: "crm_客户跟进记录表 30 天内",
  lastContactAt:"crm_客户跟进记录表 max(实际跟进时间)",
};

export default function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; tag?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const [q, setQ] = useState(sp.q ?? "");
  const [typeFilter, setTypeFilter] = useState<"全部" | CustomerType>(
    (sp.type as CustomerType) ?? "全部"
  );
  const [tagFilter, setTagFilter] = useState<"全部" | Tag>(
    (sp.tag as Tag) ?? "全部"
  );

  /* 浏览器前进/后退时跟随 URL */
  useEffect(() => {
    setQ(sp.q ?? "");
    if (sp.type) setTypeFilter(sp.type as CustomerType);
    if (sp.tag) setTagFilter(sp.tag as Tag);
  }, [sp]);

  const rows = useMemo(() => {
    return getCustomers().filter((c) => {
      if (typeFilter !== "全部" && c.type !== typeFilter) return false;
      if (tagFilter !== "全部" && !(c.tags ?? []).includes(tagFilter)) return false;
      if (!q) return true;
      const lc = q.toLowerCase();
      return (
        c.name.toLowerCase().includes(lc) ||
        c.shortName.toLowerCase().includes(lc) ||
        c.id.toLowerCase().includes(lc) ||
        c.owner.toLowerCase().includes(lc)
      );
    });
  }, [q, typeFilter, tagFilter]);

  const totals = useMemo(() => {
    const all = getCustomers();
    return {
      customers: rows.length,
      totalCount: all.length,
      ytdRevenue: rows.reduce((s, r) => s + (r.ytdRevenue ?? 0), 0),
      openNotices: rows.reduce((s, r) => s + (r.openNotices ?? 0), 0),
      followups30d: rows.reduce((s, r) => s + (r.followups30d ?? 0), 0),
    };
  }, [rows]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="CUST-OVERVIEW-2026-07-22"
            shortCode="qs-app"
            season="今日"
            composition={`${totals.customers} 家客户 · ${totals.openNotices} 个未结工艺 · ${totals.followups30d} 跟进/30d`}
            specs={[
              { label: "客户", value: totals.customers, mono: true },
              { label: "未结打样", value: totals.openNotices, mono: true },
              { label: "跟进/30d", value: totals.followups30d, mono: true },
            ]}
            prices={[
              { label: "YTD 营收", value: `¥${fmtCompact(totals.ytdRevenue)}`, mono: true },
              { label: "重要客户", value: getCustomers().filter((c) => c.type === "重要").length, mono: true },
              { label: "品牌商", value: getCustomers().filter((c) => (c.tags ?? []).includes("品牌商")).length, mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              CRM · customers
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight text-[var(--ink)]">
              客户档案
            </h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              客户主表 7 字段。派生 5 列来自报价/通知/跟进的聚合，已在每列加角标注明数据源。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">
              <span className="font-mono text-[14px]">⇪</span> 导入 Excel
            </Button>
            <NewCustomerSheet />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜客户名称 / ID / 业务员..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {(["全部", "未合作", "已合作", "重要"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "h-9 px-3 rounded-md text-[14px] transition-colors font-mono tracking-tight",
                  typeFilter === t ? "bg-[var(--ink)] text-[var(--background)]" : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(["全部", "品牌商", "跨境"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                className={cn(
                  "h-9 px-3 rounded-md text-[14px] transition-colors font-mono tracking-tight",
                  tagFilter === t
                    ? "bg-[var(--accent-foreground)] text-[var(--background)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                #{t}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[14px] font-mono text-[var(--ink-mute)]">
            <span>显示 <span className="text-[var(--ink)] tnum font-medium">{rows.length}</span>/<span className="tnum">{getCustomers().length}</span> 条</span>
          </div>
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[140px_1fr_60px_90px_140px_140px_110px_100px_120px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>客户 ID</div>
            <div>客户名称</div>
            <div>标签</div>
            <div>类型</div>
            <div className="text-right">YTD 营收</div>
            <div className="text-right">YTD 毛利</div>
            <div className="text-right">未结打样</div>
            <div className="text-right">跟进/30d</div>
            <div>归属人 · 最后接触</div>
          </div>

          {rows.map((c) => <CustomerRow key={c.id} c={c} />)}

          {rows.length === 0 && (
            <EmptyState
              density="card"
              title={q ? "没有匹配的搜索结果" : "还没有客户"}
              description={q ? `没有客户名称/ID/业务员包含「${q}」的记录。` : "导入现有客户或新建第一个客户。"}
              illustration={<EmptyIllustration kind="box" />}
            />
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[14px] font-mono text-[var(--ink-mute)]">
          <span>共 {rows.length} 条结果</span>
          <div className="flex items-center gap-3">
            <span>YTD 合计 ¥{fmtPrice(totals.ytdRevenue)}</span>
            <span className="text-[var(--hairline-strong)]">|</span>
            <span>未结打样 {totals.openNotices}</span>
            <span className="text-[var(--hairline-strong)]">|</span>
            <span>30d 跟进 {totals.followups30d}</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function CustomerRow({ c }: { c: Customer }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[140px_1fr_60px_90px_140px_140px_110px_100px_120px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
        "hover:bg-[var(--accent)]/40 transition-colors group cursor-pointer"
      )}
    >
      <div className="font-mono text-[14px] text-[var(--ink-dim)] tracking-tight">
        {c.id}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <div className="min-w-0">
          <div className="text-[14px] font-medium text-[var(--ink)] truncate flex items-center gap-1.5">
            {c.name}
            {c.type === "重要" && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
            )}
          </div>
          <div className="text-[14px] text-[var(--ink-mute)] truncate font-mono">
            {c.shortName}
            {c.collaborators && c.collaborators.length > 0 && (
              <> · +{c.collaborators.length} 协</>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {(c.tags ?? []).length === 0 ? <span className="font-mono text-[14px] text-[var(--ink-mute)]">—</span> : (c.tags ?? []).map((t) => (
          <span
            key={t}
            className="font-mono text-[14px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent)", color: "var(--ink-dim)" }}
          >
            #{t}
          </span>
        ))}
      </div>

      <div>
        <Badge tone={TYPE_TONE[c.type]} size="sm">{c.type}</Badge>
      </div>

      {/* 派生字段带角标 */}
      <DerivedCell
        kind="money"
        value={c.ytdRevenue && c.ytdRevenue > 0 ? `¥${fmtCompact(c.ytdRevenue)}` : "—"}
        source={DERIVED_FROM.ytdRevenue}
      />
      <DerivedCell
        kind="pct"
        value={c.ytdMargin && c.ytdMargin > 0 ? `${c.ytdMargin.toFixed(1)}%` : "—"}
        source={DERIVED_FROM.ytdMargin}
        tone={
          !c.ytdMargin || c.ytdMargin === 0 ? "neutral" :
          c.ytdMargin >= 18 ? "success" :
          c.ytdMargin >= 12 ? "warn" : "danger"
        }
      />
      <DerivedCell
        kind="num"
        value={c.openNotices ?? 0}
        source={DERIVED_FROM.openNotices}
        accent={Boolean(c.openNotices && c.openNotices > 0)}
      />
      <DerivedCell
        kind="num"
        value={c.followups30d ?? 0}
        source={DERIVED_FROM.followups30d}
      />

      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center text-[14px] font-mono shrink-0">
          {(c.owner ?? '')[0]}
        </span>
        <div className="min-w-0">
          <div className="text-[14px] text-[var(--ink-dim)] truncate">{c.owner}</div>
          <div className="text-[14px] font-mono text-[var(--ink-mute)] truncate" title={c.lastContactAt ? "源: crm_客户跟进记录表" : ""}>
            {c.lastContactAt ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* —— 派生字段单元格：右上有 ⓘ 数据源 hover —— */
function DerivedCell({
  kind,
  value,
  source,
  tone,
  accent,
}: {
  kind: "money" | "pct" | "num";
  value: string | number;
  source: string;
  tone?: "neutral" | "success" | "warn" | "danger";
  accent?: boolean;
}) {
  const toneColor =
    tone === "success" ? "var(--success)" :
    tone === "warn"    ? "var(--warn)"    :
    tone === "danger"  ? "var(--destructive)" :
    "var(--ink-mute)";
  return (
    <div className="relative text-right group/cell">
      <div className={cn(
        "font-mono tnum text-[14px]",
        tone === "success" || tone === "warn" || tone === "danger" ? "" : "text-[var(--ink)]",
      )} style={tone && tone !== "neutral" ? { color: toneColor } : undefined}>
        {kind === "pct" && accent && (
          <NumChip value={value as string} tone={tone === "neutral" ? "neutral" : tone} />
        )}
        {!(kind === "pct" && accent) && (
          <span className={accent ? "text-[var(--ink)]" : "text-[var(--ink-dim)]"}>
            {value}
          </span>
        )}
      </div>
      <div className="absolute -top-0.5 -right-0.5 opacity-0 group-hover/cell:opacity-100 transition-opacity">
        <span
          title={source}
          className="inline-block w-3.5 h-3.5 rounded-full bg-[var(--accent-foreground)] text-[var(--background)] text-[14px] font-mono leading-[14px] text-center cursor-help"
        >
          ⓘ
        </span>
      </div>
    </div>
  );
}
