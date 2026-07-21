"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NumChip } from "@/components/domain/a-status";
import { cn } from "@/lib/utils";

type Quote = {
  id: string;
  docNo: string;
  customer: string;
  product: string;
  qty: number;
  sizeRange: string;
  landedCost: number;        // 含税成本
  internalCost: number;      // 不含税成本
  filedTaxInc: number;       // 备案含税
  filedTaxExc: number;       // 备案不含税
  marginInc: number;         // 含税毛利率
  marginExc: number;         // 不含税毛利率
  status: "草稿" | "已发" | "客户确认" | "已拒";
  validUntil: string;
  quoter: string;
  updated: string;
};

const MOCK_Q: Quote[] = [
  {
    id: "Q-0317-A",
    docNo: "Q-2026-0317-A",
    customer: "乾盛",
    product: "羊毛双面呢 · 立领大衣",
    qty: 200,
    sizeRange: "S/M/L",
    landedCost: 312,
    internalCost: 270,
    filedTaxInc: 420,
    filedTaxExc: 363,
    marginInc: 25.7,
    marginExc: 25.6,
    status: "客户确认",
    validUntil: "2026-07-28",
    quoter: "李白",
    updated: "今 09:14",
  },
  {
    id: "Q-0316-B",
    docNo: "Q-2026-0316-B",
    customer: "弘大",
    product: "罗纹打底衫",
    qty: 800,
    sizeRange: "M/L",
    landedCost: 96,
    internalCost: 84,
    filedTaxInc: 144,
    filedTaxExc: 124,
    marginInc: 33.3,
    marginExc: 32.3,
    status: "已发",
    validUntil: "2026-07-25",
    quoter: "李白",
    updated: "昨 17:30",
  },
  {
    id: "Q-0315-A",
    docNo: "Q-2026-0315-A",
    customer: "弘大",
    product: "圆机 T 恤",
    qty: 2000,
    sizeRange: "S/M/L/XL",
    landedCost: 28,
    internalCost: 24,
    filedTaxInc: 42,
    filedTaxExc: 36,
    marginInc: 33.3,
    marginExc: 33.3,
    status: "草稿",
    validUntil: "2026-07-22",
    quoter: "李白",
    updated: "3 天前",
  },
  {
    id: "Q-0314-C",
    docNo: "Q-2026-0314-C",
    customer: "巧岛",
    product: "卫衣（女）",
    qty: 600,
    sizeRange: "M/L/XL",
    landedCost: 268,
    internalCost: 232,
    filedTaxInc: 320,
    filedTaxExc: 276,
    marginInc: 16.3,
    marginExc: 16.0,
    status: "已拒",
    validUntil: "2026-07-22",
    quoter: "刘韬",
    updated: "今 11:02",
  },
  {
    id: "Q-0313-D",
    docNo: "Q-2026-0313-D",
    customer: "一针坊",
    product: "提花围巾（原创款）",
    qty: 50,
    sizeRange: "均码",
    landedCost: 78,
    internalCost: 67,
    filedTaxInc: 168,
    filedTaxExc: 145,
    marginInc: 53.6,
    marginExc: 53.8,
    status: "客户确认",
    validUntil: "2026-07-20",
    quoter: "亚明",
    updated: "今 08:22",
  },
];

const STATUS_TONE = {
  草稿: "neutral",
  已发: "info",
  客户确认: "success",
  已拒: "danger",
} as const;

const FILTERS = ["全部", "草稿", "已发", "客户确认", "已拒"] as const;

export default function QuotationsPage() {
  const [q, setQ] = useState("");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");

  const rows = useMemo(() => {
    return MOCK_Q.filter((w) => {
      if (pf !== "全部" && w.status !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        w.docNo.toLowerCase().includes(lq) ||
        w.customer.includes(q) ||
        w.product.includes(q) ||
        w.quoter.includes(q)
      );
    });
  }, [q, pf]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 顶部 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="QUOTE-OVERVIEW-2026-07-21"
            shortCode="qs-app"
            season="本月"
            composition="5 个报价 · 平均毛利 32.4% · ¥ 18.6w 在途订单"
            specs={[
              { label: "在档", value: rows.length, mono: true },
              { label: "已确认", value: 2, mono: true },
              { label: "草稿", value: 1, mono: true },
            ]}
            prices={[
              { label: "平均毛利", value: "32.4%", mono: true },
              { label: "在途金额", value: "¥ 18.6w", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              ORDERS · quote
            </p>
            <h1 className="font-display text-[28px] font-medium tracking-tight">报价</h1>
            <p className="mt-1.5 text-[13px] text-[var(--ink-dim)] max-w-[520px]">
              染整 + 缝制 + 辅料 + 其他费用 + 毛利率。每个数字都按公式拆解。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">导出本月</Button>
            <Button variant="default" size="md">+ 新建报价</Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜编号 / 客户 / 产品 / 报价员..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setPf(f)}
                className={cn(
                  "h-9 px-3 rounded-md text-[12px] transition-colors font-mono tracking-tight",
                  pf === f
                    ? "bg-[var(--ink)] text-[var(--background)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[120px_70px_1fr_60px_60px_90px_90px_70px_70px_80px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>报价编号</div>
            <div>客户</div>
            <div>产品</div>
            <div className="text-right">数量</div>
            <div>尺码</div>
            <div className="text-right">含税成本</div>
            <div className="text-right">备案含税</div>
            <div className="text-right">毛利%</div>
            <div>有效期</div>
            <div>状态</div>
            <div>更新</div>
          </div>

          {rows.map((w) => (
            <Link
              key={w.id}
              href={`/orders/quotations/${w.id}`}
              className={cn(
                "grid grid-cols-[120px_70px_1fr_60px_60px_90px_90px_70px_70px_80px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
                "hover:bg-[var(--accent)]/40 transition-colors"
              )}
            >
              <div className="font-mono text-[11px] font-medium text-[var(--ink)]">
                {w.docNo.replace("Q-2026-", "")}
              </div>
              <div className="text-[12px] text-[var(--ink-dim)] truncate">{w.customer}</div>
              <div className="text-[13px] font-medium text-[var(--ink)] truncate">{w.product}</div>
              <div className="text-right font-mono tnum text-[12px]">{w.qty}</div>
              <div className="font-mono text-[11px] text-[var(--ink-mute)] truncate">{w.sizeRange}</div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink-dim)]">¥{w.landedCost.toFixed(2)}</div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink)]">¥{w.filedTaxInc.toFixed(2)}</div>
              <div className="text-right">
                <NumChip
                  value={`${w.marginInc.toFixed(1)}%`}
                  tone={
                    w.marginInc >= 25 ? "success"
                      : w.marginInc >= 15 ? "warn"
                      : "danger"
                  }
                />
              </div>
              <div className="font-mono text-[11px] text-[var(--ink-dim)]">{w.validUntil.slice(5)}</div>
              <div>
                <Badge tone={STATUS_TONE[w.status]} size="sm">{w.status}</Badge>
              </div>
              <div className="text-[11px] font-mono text-[var(--ink-mute)]">{w.updated}</div>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
