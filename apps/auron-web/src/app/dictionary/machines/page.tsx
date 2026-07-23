"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getMachines } from "@/lib/data";

const STATUS_TONE = {
  在用: "success",
  空闲: "neutral",
  维修: "danger",
} as const;

export default function MachinesPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!q) return getMachines();
    const lq = q.toLowerCase();
    return getMachines().filter(
      (m) =>
        m.code.toLowerCase().includes(lq) ||
        m.name.toLowerCase().includes(lq) ||
        m.needle.toString().includes(q)
    );
  }, [q]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-MACHINES-2026-07-21"
            shortCode="qs-app"
            season="在役"
            composition={`${getMachines().length} 台织机 · 4 台在用 · 1 台维修 · 1 台空闲`}
            specs={[
              { label: "总台数", value: getMachines().length, mono: true },
              { label: "在用", value: getMachines().filter((m) => m.status === "在用").length, mono: true },
              { label: "维修", value: getMachines().filter((m) => m.status === "维修").length, mono: true },
            ]}
            prices={[
              { label: "平均使用率", value: `${Math.round(getMachines().reduce((s, m) => s + m.useRate, 0) / getMachines().length)}%`, mono: true },
              { label: "总承载工艺", value: getMachines().reduce((s, m) => s + m.workorders, 0), mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · machine
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">机型配置</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              所有圆机的档案。师傅换机器前先查这里的针数/口径/转速。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">维护保养记录</Button>
            <Link href="/dictionary/machines/new">
              <Button variant="default" size="md">+ 新增机型</Button>
            </Link>
          </div>
        </div>

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
                {m.code}
              </div>
              <div className="text-[14px] text-[var(--ink)] font-medium truncate">
                {m.name}
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
              <div className="text-right">
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[14px] font-mono tnum",
                    m.useRate >= 80
                      ? "bg-[var(--success-soft)] text-[var(--success)]"
                      : m.useRate >= 50
                      ? "bg-[var(--warn-soft)] text-[var(--warn)]"
                      : m.useRate > 0
                      ? "bg-[var(--info-soft)] text-[var(--info)]"
                      : "bg-[var(--secondary)] text-[var(--ink-mute)]"
                  )}
                >
                  {m.useRate}%
                </span>
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">
                {m.workorders} 单
              </div>
              <div className="text-[14px] text-[var(--ink-mute)] truncate font-mono">
                {m.fitness.join(" · ")}
              </div>
              <div>
                <Badge tone={STATUS_TONE[m.status as keyof typeof STATUS_TONE]} size="sm">{m.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-[14px] font-mono text-[var(--ink-mute)]">
          共 {rows.length} 台机型 · {getMachines().filter((m) => m.status === "在用").reduce((s, m) => s + m.workorders, 0)} 个工艺单在跑
        </div>
      </div>
    </AdminShell>
  );
}
