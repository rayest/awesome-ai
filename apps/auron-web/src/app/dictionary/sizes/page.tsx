"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSizeConfs } from "@/lib/data";

export default function SizesPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = getSizeConfs();
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter(
      (s) =>
        s.size.toLowerCase().includes(lq) ||
        s.euLetter.toLowerCase().includes(lq) ||
        s.ageOrNumeric.toLowerCase().includes(lq) ||
        s.id.toLowerCase().includes(lq)
    );
  }, [q]);

  const all = getSizeConfs();

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-SIZES-2026-07-22"
            shortCode="qs-app"
            season="在档"
            composition={`${all.length} 个尺码档位 · 覆盖 XS 至 XXXL`}
            specs={[
              { label: "总档位", value: all.length, mono: true },
              { label: "字段数", value: "5 / 5", mono: true },
            ]}
            prices={[
              { label: "数据源", value: "crm_字典_尺码配置表", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · size
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">尺码配置</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              通知单和报价单的尺码都从这里选。高度/欧码/号型一一对应。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dictionary/sizes/new">
              <Button variant="default" size="md">+ 新增尺码</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜尺码 / 欧码 / 号型..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_100px_140px_140px_1fr] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>尺码</div>
            <div className="text-right">身高 cm</div>
            <div>欧码</div>
            <div>号型</div>
          </div>
          {rows.map((s) => (
            <Link
              key={s.id}
              href={`/dictionary/sizes/${s.id}`}
              className="grid grid-cols-[80px_100px_140px_140px_1fr] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] text-[var(--ink-mute)] tracking-tight">{s.id}</div>
              <div className="font-display text-[16px] font-medium text-[var(--ink)]">{s.size}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{s.heightCm}</div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)]">{s.euLetter}</div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)]">{s.ageOrNumeric}</div>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">没有匹配的尺码</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}