"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getOperations } from "@/lib/data";

const CATEGORY_TONE: Record<string, "neutral" | "info" | "warn" | "primary" | "success"> = {
  前道: "info",
  后道: "warn",
  染整: "primary",
  缝制: "success",
  复合: "neutral",
};

export default function OperationsPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = getOperations();
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter(
      (o) =>
        o.name.toLowerCase().includes(lq) ||
        o.category.toLowerCase().includes(lq) ||
        o.id.toLowerCase().includes(lq)
    );
  }, [q]);

  const all = getOperations();
  const cats = Array.from(new Set(all.map((o) => o.category.split(" - ")[0])));

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-OPERATIONS-2026-07-22"
            shortCode="qs-app"
            season="在档"
            composition={`${all.length} 道工序 · ${cats.length} 个工艺阶段`}
            specs={[
              { label: "总工序", value: all.length, mono: true },
              { label: "工艺阶段", value: cats.length, mono: true },
              { label: "字段数", value: "3 / 3", mono: true },
            ]}
            prices={[
              { label: "数据源", value: "crm_字典_工序表", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · operation
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">工序字典</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              报价单里的「染整 + 缝制 + 辅料 + 其他费用」就是从这张表挑出来的。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dictionary/operations/new">
              <Button variant="default" size="md">+ 新增工序</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜工序 / 阶段 / 编号..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_140px_1fr_140px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>阶段</div>
            <div>工序名</div>
            <div className="text-right">单价</div>
          </div>
          {rows.map((o) => {
            const phase = o.category.split(" - ")[0];
            return (
              <Link
                key={o.id}
                href={`/dictionary/operations/${o.id}`}
                className="grid grid-cols-[80px_140px_1fr_140px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
              >
                <div className="font-mono text-[14px] text-[var(--ink-mute)] tracking-tight">{o.id}</div>
                <div>
                  <Badge tone={CATEGORY_TONE[phase] ?? "neutral"} size="sm">{phase}</Badge>
                </div>
                <div className="text-[14px] font-medium text-[var(--ink)] truncate">{o.name}</div>
                <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{o.price}</div>
              </Link>
            );
          })}
          {rows.length === 0 && (
            <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">没有匹配的工序</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}