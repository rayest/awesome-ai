"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTrims } from "@/lib/data";

export default function TrimsPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = getTrims();
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter((t) => t.name.toLowerCase().includes(lq) || t.id.toLowerCase().includes(lq));
  }, [q]);

  const all = getTrims();

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-TRIMS-2026-07-22"
            shortCode="qs-app"
            season="在档"
            composition={`${all.length} 种辅料`}
            specs={[
              { label: "总辅料", value: all.length, mono: true },
              { label: "字段数", value: "2 / 2", mono: true },
            ]}
            prices={[
              { label: "数据源", value: "crm_字典_辅料配置表", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · trim
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">辅料配置</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              树脂衬 / 拉链 / 纽扣 / 织带 / 吊牌 ... 一件成衣的所有辅料。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dictionary/trims/new">
              <Button variant="default" size="md">+ 新增辅料</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜辅料..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>辅料名</div>
          </div>
          {rows.map((t) => (
            <Link
              key={t.id}
              href={`/dictionary/trims/${t.id}`}
              className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] text-[var(--ink-mute)] tracking-tight">{t.id}</div>
              <div className="text-[14px] font-medium text-[var(--ink)]">{t.name}</div>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">没有匹配的辅料</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}