"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSampleTypes } from "@/lib/data";

export default function SampleTypesPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = getSampleTypes();
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter((s) => s.name.toLowerCase().includes(lq) || s.id.toLowerCase().includes(lq));
  }, [q]);

  const all = getSampleTypes();

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-SAMPLE-TYPES-2026-07-22"
            shortCode="qs-app"
            season="在档"
            composition={`${all.length} 个样品种类`}
            specs={[
              { label: "总类目", value: all.length, mono: true },
              { label: "字段数", value: "2 / 2", mono: true },
            ]}
            prices={[
              { label: "数据源", value: "crm_字典_样品种类表", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · sample-type
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">样品种类</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              通知单和报价单的「产品类目」下拉选项就从这里来。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dictionary/sample-types/new">
              <Button variant="default" size="md">+ 新增样品种类</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜样品种类..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>名称</div>
          </div>
          {rows.map((s) => (
            <Link
              key={s.id}
              href={`/dictionary/sample-types/${s.id}`}
              className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] text-[var(--ink-mute)] tracking-tight">{s.id}</div>
              <div className="font-display text-[16px] font-medium text-[var(--ink)]">{s.name}</div>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">没有匹配的样品种类</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}