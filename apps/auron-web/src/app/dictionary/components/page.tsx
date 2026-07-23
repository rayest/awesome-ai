"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getComponentParts } from "@/lib/data";

export default function ComponentsPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = getComponentParts();
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(lq) ||
        c.location.toLowerCase().includes(lq) ||
        c.remark.toLowerCase().includes(lq) ||
        c.id.toLowerCase().includes(lq)
    );
  }, [q]);

  const all = getComponentParts();
  const partCount = all.filter((c) => c.isPart).length;
  const trimCount = all.length - partCount;

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-COMPONENTS-2026-07-22"
            shortCode="qs-app"
            season="在档"
            composition={`${all.length} 个部件 · ${partCount} 主片 · ${trimCount} 辅料位`}
            specs={[
              { label: "总部件", value: all.length, mono: true },
              { label: "主片", value: partCount, mono: true },
              { label: "辅料位", value: trimCount, mono: true },
              { label: "字段数", value: "5 / 5", mono: true },
            ]}
            prices={[
              { label: "数据源", value: "crm_字典_部件配置表", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · component
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">部件配置</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              一件衣服由哪些裁片组成 — 前片/后片/袖/领/口袋，每个都在哪里、是不是主片。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dictionary/components/new">
              <Button variant="default" size="md">+ 新增部件</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜部件 / 位置 / 备注..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_100px_140px_1fr_120px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>位置</div>
            <div>名称</div>
            <div>备注</div>
            <div>类型</div>
          </div>
          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/dictionary/components/${c.id}`}
              className="grid grid-cols-[80px_100px_140px_1fr_120px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] text-[var(--ink-mute)] tracking-tight">{c.id}</div>
              <div className="text-[14px] text-[var(--ink-dim)]">{c.location}</div>
              <div className="text-[14px] font-medium text-[var(--ink)]">{c.name}</div>
              <div className="text-[14px] text-[var(--ink-mute)] truncate">{c.remark}</div>
              <div>
                <Badge tone={c.isPart ? "primary" : "neutral"} size="sm">
                  {c.isPart ? "主片" : "辅料位"}
                </Badge>
              </div>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">没有匹配的部件</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}