"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
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
    <AdminShell
      pageTitle="样品种类"
      pageKicker="字典维护"
      pageDescription="维护开发样、确认样、大货样等样品类型，用于打样通知和工艺流转。"
      pageActions={(
        <Link href="/dictionary/sample-types/new">
          <Button variant="default" size="md">新增样品种类</Button>
        </Link>
      )}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
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