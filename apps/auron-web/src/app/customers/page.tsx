"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusDot, NumChip } from "@/components/domain/a-status";
import { NewCustomerSheet } from "@/components/domain/customer-form";
import { cn, fmtPrice, fmtCompact } from "@/lib/utils";

type Customer = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  region: string;
  type: "活跃" | "潜客" | "老客" | "流失";
  tier: "A" | "B" | "C";
  followupsLast30d: number;
  openSampleNotices: number;
  ytdRevenue: number;
  ytdMargin: number;
  owner: string;
  lastContactAt: string;
};

/* —— Mock 数据（替成 Spring 接口只需换 fetch） —— */
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    code: "GH-QS-007",
    name: "乾盛服饰有限公司",
    shortName: "乾盛",
    region: "义乌 / 浙江",
    type: "活跃",
    tier: "A",
    followupsLast30d: 12,
    openSampleNotices: 7,
    ytdRevenue: 2_450_000,
    ytdMargin: 18.4,
    owner: "李白",
    lastContactAt: "今 09:14",
  },
  {
    id: "2",
    code: "GH-HD-002",
    name: "弘大针织（深圳）",
    shortName: "弘大",
    region: "深圳 / 广东",
    type: "活跃",
    tier: "A",
    followupsLast30d: 8,
    openSampleNotices: 4,
    ytdRevenue: 1_820_000,
    ytdMargin: 21.2,
    owner: "李白",
    lastContactAt: "昨 17:30",
  },
  {
    id: "3",
    code: "GH-MD-019",
    name: "鸣笛工贸",
    shortName: "鸣笛",
    region: "宁波 / 浙江",
    type: "潜客",
    tier: "B",
    followupsLast30d: 2,
    openSampleNotices: 0,
    ytdRevenue: 0,
    ytdMargin: 0,
    owner: "刘韬",
    lastContactAt: "8 天前",
  },
  {
    id: "4",
    code: "GH-YX-031",
    name: "一针坊原创工作室",
    shortName: "一针坊",
    region: "杭州 / 浙江",
    type: "活跃",
    tier: "B",
    followupsLast30d: 5,
    openSampleNotices: 2,
    ytdRevenue: 380_000,
    ytdMargin: 14.7,
    owner: "亚明",
    lastContactAt: "3 天前",
  },
  {
    id: "5",
    code: "GH-XF-088",
    name: "霞飞外贸",
    shortName: "霞飞",
    region: "义乌 / 外贸",
    type: "老客",
    tier: "C",
    followupsLast30d: 0,
    openSampleNotices: 0,
    ytdRevenue: 96_000,
    ytdMargin: 9.2,
    owner: "李白",
    lastContactAt: "62 天前",
  },
  {
    id: "6",
    code: "GH-QD-044",
    name: "巧岛针织",
    shortName: "巧岛",
    region: "青岛 / 山东",
    type: "潜客",
    tier: "B",
    followupsLast30d: 3,
    openSampleNotices: 1,
    ytdRevenue: 0,
    ytdMargin: 0,
    owner: "刘韬",
    lastContactAt: "今 11:02",
  },
];

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"全部" | Customer["type"]>("全部");

  const rows = useMemo(() => {
    return MOCK_CUSTOMERS.filter((c) => {
      if (typeFilter !== "全部" && c.type !== typeFilter) return false;
      if (!q) return true;
      const lc = q.toLowerCase();
      return (
        c.name.toLowerCase().includes(lc) ||
        c.shortName.toLowerCase().includes(lc) ||
        c.code.toLowerCase().includes(lc) ||
        c.owner.toLowerCase().includes(lc)
      );
    });
  }, [q, typeFilter]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, c) => ({
        revenue: acc.revenue + c.ytdRevenue,
        notices: acc.notices + c.openSampleNotices,
        followups: acc.followups + c.followupsLast30d,
      }),
      { revenue: 0, notices: 0, followups: 0 }
    );
  }, [rows]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* ─── 顶部 唛头：今日关键快照 ─── */}
        <div className="mb-6">
          <FabricLabel
            docNo="CUST-OVERVIEW-2026-07-21"
            shortCode="qs-app"
            season="今日"
            composition="6 家活跃客户 · 35 个未结工艺 · ¥3.5M YTD 流水"
            specs={[
              { label: "客户", value: rows.length, mono: true },
              { label: "未结打样", value: totals.notices, mono: true },
              { label: "近 30d 跟进", value: totals.followups, mono: true },
            ]}
            prices={[
              { label: "YTD 营收", value: `¥${fmtCompact(totals.revenue)}`, mono: true },
              { label: "YTD 毛利", value: "16.8%", mono: true },
              { label: "平均客单", value: `¥${fmtCompact(Math.round(totals.revenue / Math.max(rows.length, 1)))}`, mono: true },
            ]}
          />
        </div>

        {/* ─── 页头 ─── */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              CRM · customers
            </p>
            <h1 className="font-display text-[28px] font-medium tracking-tight text-[var(--ink)]">
              客户档案
            </h1>
            <p className="mt-1.5 text-[13px] text-[var(--ink-dim)] max-w-[520px]">
              业务员、跟单、报价员共同维护。客户归属到人，离职可交接。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">
              <span className="font-mono text-[11px]">⇪</span> 导入 Excel
            </Button>
            <NewCustomerSheet />
          </div>
        </div>

        {/* ─── 工具栏：搜索 + 筛选 ─── */}
        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜客户名称 / 编码 / 业务员..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {(["全部", "活跃", "潜客", "老客", "流失"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "h-9 px-3 rounded-md text-[12px] transition-colors font-mono tracking-tight",
                  typeFilter === t
                    ? "bg-[var(--ink)] text-[var(--background)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[11px] font-mono text-[var(--ink-mute)]">
            <span>显示</span>
            <span className="text-[var(--ink)] tnum font-medium">{rows.length}</span>
            <span>/</span>
            <span className="tnum">{MOCK_CUSTOMERS.length}</span>
            <span>条</span>
          </div>
        </div>

        {/* ─── 表格 ─── */}
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          {/* 表头 */}
          <div className="grid grid-cols-[40px_120px_1fr_80px_90px_120px_120px_100px_80px_120px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div></div>
            <div>编码</div>
            <div>客户</div>
            <div>区域</div>
            <div>类型</div>
            <div className="text-right">YTD 营收</div>
            <div className="text-right">YTD 毛利</div>
            <div className="text-right">未结打样</div>
            <div className="text-right">近 30d 跟进</div>
            <div>归属</div>
            <div>最后接触</div>
          </div>

          {/* 行 */}
          {rows.map((c) => (
            <CustomerRow key={c.id} c={c} />
          ))}

          {rows.length === 0 && (
            <div className="px-6 py-16 text-center text-[13px] text-[var(--ink-mute)]">
              没有符合条件的客户。
            </div>
          )}
        </div>

        {/* ─── 底栏统计 ─── */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[var(--ink-mute)]">
          <span>共 {rows.length} 条结果</span>
          <div className="flex items-center gap-3">
            <span>YTD 合计 ¥{fmtPrice(totals.revenue)}</span>
            <span className="text-[var(--hairline-strong)]">|</span>
            <span>未结打样 {totals.notices}</span>
            <span className="text-[var(--hairline-strong)]">|</span>
            <span>近 30d 跟进 {totals.followups}</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function CustomerRow({ c }: { c: Customer }) {
  const toneByType = {
    活跃: "success",
    潜客: "info",
    老客: "neutral",
    流失: "neutral",
  } as const;
  const tierColor =
    c.tier === "A"
      ? "var(--primary)"
      : c.tier === "B"
      ? "var(--ink-dim)"
      : "var(--ink-mute)";

  return (
    <div
      className={cn(
        "grid grid-cols-[40px_120px_1fr_80px_90px_120px_120px_100px_80px_120px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
        "hover:bg-[var(--accent)]/40 transition-colors group cursor-pointer"
      )}
    >
      <div className="flex items-center justify-center">
        <StatusDot
          tone={
            c.ytdMargin >= 18
              ? "success"
              : c.ytdMargin >= 12
              ? "warn"
              : c.ytdMargin > 0
              ? "danger"
              : "neutral"
          }
        />
      </div>

      {/* 编码 */}
      <div className="font-mono text-[11px] text-[var(--ink-dim)] tracking-tight">
        {c.code}
      </div>

      {/* 客户 */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="font-mono text-[10px] uppercase font-medium px-1.5 py-0.5 rounded shrink-0"
          style={{ background: tierColor + "20", color: tierColor }}
        >
          {c.tier}
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[var(--ink)] truncate">
            {c.name}
          </div>
          <div className="text-[11px] text-[var(--ink-mute)] truncate font-mono">
            {c.shortName} · {c.id} 条联系人
          </div>
        </div>
      </div>

      {/* 区域 */}
      <div className="text-[12px] text-[var(--ink-dim)] truncate">
        {c.region.split(" / ")[1]}
      </div>

      {/* 类型 */}
      <div>
        <Badge tone={toneByType[c.type]}>{c.type}</Badge>
      </div>

      {/* YTD 营收 */}
      <div className="text-right font-mono tnum text-[12px] text-[var(--ink)]">
        ¥{fmtCompact(c.ytdRevenue)}
      </div>

      {/* YTD 毛利 */}
      <div className="text-right font-mono tnum text-[12px]">
        {c.ytdMargin > 0 ? (
          <NumChip
            value={`${c.ytdMargin.toFixed(1)}%`}
            tone={
              c.ytdMargin >= 18
                ? "success"
                : c.ytdMargin >= 12
                ? "warn"
                : "danger"
            }
          />
        ) : (
          <span className="text-[var(--ink-mute)]">—</span>
        )}
      </div>

      {/* 未结打样 */}
      <div className="text-right font-mono tnum text-[12px] text-[var(--ink-dim)]">
        {c.openSampleNotices > 0 ? (
          c.openSampleNotices
        ) : (
          <span className="text-[var(--ink-mute)]">0</span>
        )}
      </div>

      {/* 近 30d 跟进 */}
      <div className="text-right font-mono tnum text-[12px] text-[var(--ink-dim)]">
        {c.followupsLast30d}
      </div>

      {/* 归属 */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center text-[9px] font-mono shrink-0">
          {c.owner[0]}
        </span>
        <span className="text-[12px] text-[var(--ink-dim)] truncate">
          {c.owner}
        </span>
      </div>

      {/* 最后接触 */}
      <div className="text-[11px] font-mono text-[var(--ink-mute)]">
        {c.lastContactAt}
      </div>
    </div>
  );
}
