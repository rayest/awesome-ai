"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NumChip } from "@/components/domain/a-status";
import { fmtPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getMaterials, getMaterialUsedInWorkorders } from "@/lib/data";
import { FromQueryBadge, withQuery } from "@/lib/url-filter";

/**
 * 物料 / 纱线 字典
 *
 * 数据源：docs/data/crm/crm_字典_物料信息表.json
 *   字段：纱线名称 / 供应商 / 规格(select) / 单价(元/㎏) / link 织造用料表 /
 *         颜色(text) / 类别(text) / 捻向(select Z/S) / 物料ID(auto_number) /
 *         批号(text) / 穿纱方式(formula)
 */

const CATEGORIES = ["全部", "纱线"] as const;

export default function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ supplier?: string; yarnName?: string; q?: string }>;
}) {
  // ── 数据从 docs/data 加载（真后端阶段换成 fetch()） ──
  const allMaterials = useMemo(() => getMaterials(), []);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("全部");

  const rows = useMemo(() => {
    return allMaterials.filter((m) => {
      if (cat !== "全部" && m.category !== cat) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        m.yarnName.toLowerCase().includes(lq) ||
        m.id.toLowerCase().includes(lq) ||
        m.supplier.toLowerCase().includes(lq)
      );
    });
  }, [allMaterials, q, cat]);

  const totals = useMemo(() => ({
    items: rows.length,
    specs: new Set(rows.map((r) => r.spec)).size,
    suppliers: new Set(rows.map((r) => r.supplier)).size,
    avgPrice: rows.length ? rows.reduce((s, r) => s + r.unitPrice, 0) / rows.length : 0,
  }), [rows]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-MATERIALS-2026-07-22"
            shortCode="qs-app"
            season="活跃"
            composition={`${totals.items} 款纱线 · ${totals.specs} 种规格 · ${totals.suppliers} 家供应商`}
            specs={[
              { label: "物料", value: totals.items, mono: true },
              { label: "规格", value: totals.specs, mono: true },
              { label: "供应商", value: totals.suppliers, mono: true },
            ]}
            prices={[
              { label: "平均单价", value: `¥${fmtPrice(totals.avgPrice)}/kg`, mono: true },
              { label: "穿纱方式", value: "公式渲染中", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · yarn
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">
              物料 / 纱线
            </h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              所有纺纱/面料供应商与批次。报价单从这里取物料单价。数据源：docs/data/crm/crm_字典_物料信息表.json（11 字段）。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">同步供应商</Button>
            <Link href="/dictionary/materials/new">
              <Button variant="default" size="md">+ 新增物料</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜纱线名 / 物料ID / 供应商..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "h-9 px-3 rounded-md text-[14px] transition-colors font-mono tracking-tight",
                  cat === c ? "bg-[var(--ink)] text-[var(--background)]" : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[14px] font-mono text-[var(--ink-mute)]">
            <span>显示 <span className="text-[var(--ink)] tnum">{rows.length}</span>/<span className="tnum">{allMaterials.length}</span> 条</span>
          </div>
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[140px_1fr_60px_100px_50px_70px_90px_120px_80px_140px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>物料 ID</div>
            <div>纱线名称</div>
            <div>类别</div>
            <div>规格</div>
            <div className="text-center">捻向</div>
            <div>颜色</div>
            <div>批号</div>
            <div>供应商</div>
            <div className="text-right">单价 ¥/kg</div>
            <div>穿纱方式</div>
            <div className="text-center">被引用</div>
          </div>

          {rows.map((m) => {
            const usedIn = getMaterialUsedInWorkorders(m.id);
            return (
              <Link
                key={m.id}
                href={`/dictionary/materials/${m.id}`}
                className="grid grid-cols-[140px_1fr_60px_100px_50px_70px_90px_120px_80px_140px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors"
              >
                <div className="font-mono text-[14px] text-[var(--ink-dim)] tracking-tight">{m.id}</div>
                <div className="text-[14px] font-medium text-[var(--ink)] truncate">{m.yarnName}</div>
                <div><Badge tone="neutral" size="sm">{m.category}</Badge></div>
                <div className="font-mono tnum text-[14px] text-[var(--ink)]">{m.spec}</div>
                <div className="font-mono text-[14px] text-[var(--ink-mute)] text-center">{m.twist}</div>
                <div className="text-[14px] text-[var(--ink-dim)]">{m.color}</div>
                <div className="font-mono text-[14px] text-[var(--ink-dim)]">{m.batch}</div>
                <div className="text-[14px] text-[var(--ink-dim)] truncate">{m.supplier}</div>
                <div className="text-right font-mono tnum text-[14px] font-medium text-[var(--ink)]">¥ {m.unitPrice.toLocaleString()}</div>
                <div className="text-[13px] font-mono text-[var(--ink-dim)] truncate">{m.yarnMode}</div>
                <div className="text-center">
                  {usedIn.length > 0
                    ? <NumChip value={`${usedIn.length}`} tone="primary" />
                    : <span className="font-mono text-[11px] text-[var(--ink-mute)]">—</span>}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-[14px] font-mono text-[var(--ink-mute)]">
          <span>共 {rows.length} 条 · 数据源 docs/data/crm/crm_字典_物料信息表.json</span>
          <span>规格 {totals.specs} 种 · 捻向 Z / S · {totals.suppliers} 家供应商</span>
        </div>
      </div>
    </AdminShell>
  );
}
