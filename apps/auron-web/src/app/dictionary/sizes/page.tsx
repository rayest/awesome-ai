"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
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
    <AdminShell
      pageTitle="尺码配置"
      pageKicker="字典维护"
      pageDescription="维护尺码组和尺码明细，减少产品和工艺单里重复录入。"
      pageActions={(
        <Link href="/dictionary/sizes/new">
          <Button variant="default" size="md">新增尺码</Button>
        </Link>
      )}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
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