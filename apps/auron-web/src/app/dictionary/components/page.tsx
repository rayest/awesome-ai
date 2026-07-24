"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
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
    <AdminShell
      pageTitle="部件配置"
      pageKicker="字典维护"
      pageDescription="维护领子、袖口、下摆等部件配置，让工艺描述保持统一。"
      pageActions={(
        <Link href="/dictionary/components/new">
          <Button variant="default" size="md">新增部件</Button>
        </Link>
      )}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
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