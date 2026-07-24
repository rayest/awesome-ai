"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getParts } from "@/lib/data";

export default function PartsPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = getParts();
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter((p) => p.name.toLowerCase().includes(lq) || p.id.toLowerCase().includes(lq));
  }, [q]);

  const all = getParts();

  return (
    <AdminShell
      pageTitle="测量部位"
      pageKicker="字典维护"
      pageDescription="维护衣长、袖长、肩宽等测量部位，工艺单的尺寸要求从这里选择。"
      pageActions={(
        <Link href="/dictionary/parts/new">
          <Button variant="default" size="md">新增部位</Button>
        </Link>
      )}
      pageMeta={[{ label: "部位", value: all.length }]}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
                <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜部位..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>部位名</div>
          </div>
          {rows.map((p) => (
            <Link
              key={p.id}
              href={`/dictionary/parts/${p.id}`}
              className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] text-[var(--ink-mute)] tracking-tight">{p.id}</div>
              <div className="text-[14px] font-medium text-[var(--ink)]">{p.name}</div>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">没有匹配的部位</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}