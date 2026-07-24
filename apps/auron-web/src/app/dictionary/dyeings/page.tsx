"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getDyeings } from "@/lib/data";

const CATEGORY_TONE: Record<string, "neutral" | "info" | "warn" | "primary" | "success"> = {
  标准染色: "info",
  特殊染色: "primary",
  染整: "warn",
  印花: "success",
};

export default function DyeingsPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = getDyeings();
    if (!q) return all;
    const lq = q.toLowerCase();
    return all.filter(
      (d) =>
        d.name.toLowerCase().includes(lq) ||
        d.category.toLowerCase().includes(lq) ||
        d.pricingMode.toLowerCase().includes(lq) ||
        d.id.toLowerCase().includes(lq)
    );
  }, [q]);

  const all = getDyeings();
  const cats = Array.from(new Set(all.map((d) => d.category)));

  return (
    <AdminShell
      pageTitle="染色工艺"
      pageKicker="字典维护"
      pageDescription="维护染色方式、颜色工艺和相关说明，供工艺和报价复用。"
      pageActions={(
        <Link href="/dictionary/dyeings/new">
          <Button variant="default" size="md">新增染色工艺</Button>
        </Link>
      )}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
                <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜工艺 / 分类 / 计费方式..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[80px_120px_1fr_140px_120px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>分类</div>
            <div>工艺名</div>
            <div className="text-right">单价</div>
            <div>计费方式</div>
          </div>
          {rows.map((d) => (
            <Link
              key={d.id}
              href={`/dictionary/dyeings/${d.id}`}
              className="grid grid-cols-[80px_120px_1fr_140px_120px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] text-[var(--ink-mute)] tracking-tight">{d.id}</div>
              <div>
                <Badge tone={CATEGORY_TONE[d.category] ?? "neutral"} size="sm">{d.category}</Badge>
              </div>
              <div className="text-[14px] font-medium text-[var(--ink)] truncate">{d.name}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{d.price}</div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{d.pricingMode}</div>
            </Link>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">没有匹配的染色工艺</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}