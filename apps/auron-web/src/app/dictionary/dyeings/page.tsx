"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getDyeings } from "@/lib/data";

const CATEGORY_TONE: Record<string, "neutral" | "info" | "warn" | "primary" | "success"> = {
  标准染色: "info",
  特殊染色: "primary",
  染整: "warn",
  印花: "success",
};

export default function DyeingsPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = getDyeings();
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter(
      (d) =>
        d.name.toLowerCase().includes(lq) ||
        d.category.toLowerCase().includes(lq) ||
        d.pricingMode.toLowerCase().includes(lq) ||
        d.id.toLowerCase().includes(lq)
    );
  }, [q]);

  const all = getDyeings();
  const cats = Array.from(new Set(all.map((d) => d.category)));

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-DYEINGS-2026-07-22"
            shortCode="qs-app"
            season="在档"
            composition={`${all.length} 种染色工艺 · ${cats.length} 个分类`}
            specs={[
              { label: "总工艺", value: all.length, mono: true },
              { label: "分类", value: cats.length, mono: true },
              { label: "字段数", value: "5 / 5", mono: true },
            ]}
            prices={[
              { label: "数据源", value: "crm_字典_染色工艺信息表", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · dyeing
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">染色工艺</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              缸染低温 / 成衣染 / 整染 / 色牢度等级 ... 报价的「染整费用」都从这张表里挑。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dictionary/dyeings/new">
              <Button variant="default" size="md">+ 新增染色工艺</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜工艺 / 分类 / 计费方式..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_120px_1fr_140px_120px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>分类</div>
            <div>工艺名</div>
            <div className="text-right">单价</div>
            <div>计费方式</div>
          </div>
          {rows.map((d) => (
            <Link
              key={d.id}
              href={`/dictionary/dyeings/${d.id}`}
              className="grid grid-cols-[80px_120px_1fr_140px_120px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] text-[var(--ink-mute)] tracking-tight">{d.id}</div>
              <div>
                <Badge tone={CATEGORY_TONE[d.category] ?? "neutral"} size="sm">{d.category}</Badge>
              </div>
              <div className="text-[14px] font-medium text-[var(--ink)] truncate">{d.name}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{d.price}</div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{d.pricingMode}</div>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">没有匹配的染色工艺</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}