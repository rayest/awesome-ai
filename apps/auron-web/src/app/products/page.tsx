"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getProducts } from "@/lib/data";

const CATEGORIES = ["全部", "外套", "打底", "T恤", "配饰"] as const;

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [pf, setPf] = useState<(typeof CATEGORIES)[number]>("全部");

  const rows = useMemo(() => {
    return getProducts().filter((p) => {
      if (pf !== "全部" && p.category !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        p.styleNo.toLowerCase().includes(lq) ||
        p.name.includes(q) ||
        p.yarn.includes(q) ||
        p.programName.toLowerCase().includes(lq)
      );
    });
  }, [q, pf]);

  const totals = useMemo(() => {
    return {
      products: rows.length,
      categories: new Set(rows.map((p) => p.category)).size,
      yarnCount: new Set(rows.map((p) => p.yarn.split("/")[0].trim())).size,
    };
  }, [rows]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="PRODUCTS-2026-07-22"
            shortCode="qs-app"
            season="本季 FW26"
            composition={`${totals.products} 款产品 · ${totals.categories} 个类目 · ${totals.yarnCount} 种主纱线`}
            specs={[
              { label: "款数", value: totals.products, mono: true },
              { label: "类目", value: totals.categories, mono: true },
              { label: "主纱线", value: totals.yarnCount, mono: true },
            ]}
            prices={[
              { label: "在档数据源", value: "crm_产品表 9/9", mono: true },
              { label: "字段使用率", value: "100%", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              MASTER · product
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">产品主数据</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              crm_产品表全部 9 字段（9 个 text，无 link / 无 formula / 无 lookup）。
              下次客户说"上次那个款"，直接按款号搜。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">批量导出</Button>
            <Link href="/products/new">
              <Button variant="default" size="md">+ 新增产品</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜款号 / 品名 / 纱线 / 程序名..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {CATEGORIES.map((f) => (
              <button
                key={f}
                onClick={() => setPf(f)}
                className={cn(
                  "h-9 px-3 rounded-md text-[14px] transition-colors font-mono tracking-tight",
                  pf === f ? "bg-[var(--ink)] text-[var(--background)]" : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[14px] font-mono text-[var(--ink-mute)]">
            <span>显示 <span className="text-[var(--ink)] tnum">{rows.length}</span>/<span className="tnum">{getProducts().length}</span> 条</span>
          </div>
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[130px_140px_70px_1fr_60px_140px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>款号</div>
            <div>程序名</div>
            <div>类目</div>
            <div>品名 · 工艺</div>
            <div className="text-right">GSM</div>
            <div>纱线 · 颜色</div>
            <div>尺码</div>
          </div>

          {rows.map((p) => (
            <div
              key={p.styleNo}
              className="grid grid-cols-[130px_140px_70px_1fr_60px_140px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] font-medium text-[var(--ink)] tracking-tight">
                {p.styleNo}
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">{p.programName}</div>
              <div>
                <Badge tone="neutral" size="sm">{p.category}</Badge>
              </div>
              <div className="text-[14px] min-w-0">
                <div className="text-[var(--ink)] font-medium truncate">{p.name}</div>
                <div className="font-mono text-[14px] text-[var(--ink-mute)] truncate">
                  {p.craft}
                </div>
              </div>
              <div className="text-right font-mono tnum text-[14px]">{p.gsm}</div>
              <div className="text-[14px] min-w-0">
                <div className="text-[var(--ink-dim)] truncate">{p.yarn}</div>
                <div className="font-mono text-[14px] text-[var(--ink-mute)] truncate">{p.color}</div>
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">{p.sizeRange}</div>
            </div>
          ))}
        </div>

        {/* crm 字段使用率卡 + 数据源标注 */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <SchemaCard
            label="字段对齐率"
            value="9 / 9"
            sub="crm_产品表所有字段均已展示"
            tone="success"
          />
          <SchemaCard
            label="派生（聚合）"
            value="历史报价次数"
            sub="= COUNT(crm_报价单_基础信息表.打样工艺单ID) JOIN crm_产品表.款号"
            tone="neutral"
          />
          <SchemaCard
            label="派生（聚合）"
            value="最近成交价"
            sub="= MAX(crm_报价单_总计表.含税毛利 WHERE 报价单 ↔ 产品款号)"
            tone="neutral"
          />
        </div>
      </div>
    </AdminShell>
  );
}

function SchemaCard({
  label, value, sub, tone,
}: {
  label: string; value: string; sub: string;
  tone: "success" | "neutral";
}) {
  return (
    <div className="border border-[var(--hairline)] rounded-md p-3 bg-[var(--card)]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">{label}</span>
        {tone === "success" && <span className="font-mono text-[14px] px-1.5 py-0.5 rounded bg-[oklch(0.95_0.05_145)] text-[var(--success)]">✓ 完备</span>}
      </div>
      <div className="font-display text-[18px] font-medium text-[var(--ink)]">{value}</div>
      <div className="font-mono text-[14px] text-[var(--ink-mute)] mt-1 leading-relaxed">{sub}</div>
    </div>
  );
}
