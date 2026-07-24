"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
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
    <AdminShell
      pageTitle="辅料配置"
      pageKicker="字典维护"
      pageDescription="维护纽扣、拉链、吊牌等辅料基础信息，供产品、工艺和报价引用。"
      pageActions={(
        <Link href="/dictionary/trims/new">
          <Button variant="default" size="md">新增辅料</Button>
        </Link>
      )}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
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