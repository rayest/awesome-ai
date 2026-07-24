"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getMachines } from "@/lib/data";

export default function MachinesPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!q) return getMachines();
    const lq = q.toLowerCase();
    return getMachines().filter(
      (m) =>
        (m.id ?? "").toLowerCase().includes(lq) ||
        (m.modelSpec ?? "").toLowerCase().includes(lq) ||
        m.needle.toString().includes(q)
    );
  }, [q]);

  return (
    <AdminShell
      pageTitle="机型配置"
      pageKicker="字典维护"
      pageDescription="维护横机、针型和机型信息，帮助工艺单匹配正确生产设备。"
      pageActions={(
        <Link href="/dictionary/machines/new">
          <Button variant="default" size="md">新增机型</Button>
        </Link>
      )}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
                <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜机型 / 编码 / 针数..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_1fr_60px_60px_70px_70px_90px_1fr_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编码</div>
            <div>机型</div>
            <div className="text-right">针数</div>
            <div className="text-right">转速</div>
            <div>类别</div>
            <div className="text-right">使用率</div>
            <div className="text-right">承载</div>
            <div>适合产品</div>
            <div>状态</div>
          </div>

          {rows.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[80px_1fr_60px_60px_70px_70px_90px_1fr_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] font-medium text-[var(--ink)] tracking-tight">
                {m.id}
              </div>
              <div className="text-[14px] text-[var(--ink)] font-medium truncate">
                {m.modelSpec}
              </div>
              <div className="text-right font-mono tnum text-[14px] font-medium text-[var(--ink)]">
                {m.needle}G
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">
                {m.rpm}
              </div>
              <div>
                <Badge tone={m.type === "高速机" ? "primary" : "neutral"} size="sm">{m.type}</Badge>
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">
                {m.modelSpec?.match(/\d+/)?.[0] ?? "—"} 寸
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">
                {m.rpm} r/min
              </div>
              <div className="text-[14px] text-[var(--ink-mute)] truncate font-mono">
                —
              </div>
              <div>
                <Badge tone="neutral" size="sm">—</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-[14px] font-mono text-[var(--ink-mute)]">
          共 {rows.length} 台机型 · {getMachines().filter((m) => m.type === "高速机").length} 台高速机 · 平均针数 {Math.round(getMachines().reduce((s, m) => s + m.needle, 0) / Math.max(1, getMachines().length))}G
        </div>
      </div>
    </AdminShell>
  );
}
