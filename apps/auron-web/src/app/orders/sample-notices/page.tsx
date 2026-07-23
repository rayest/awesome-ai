"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getNotices } from "@/lib/data";

const PROGRESS_TONE: Record<string, "neutral" | "info" | "warn" | "primary" | "success" | "danger"> = {
  待通知: "neutral",
  前道中: "info",
  后道中: "warn",
  验货: "primary",
  已签收: "success",
  打回: "danger",
};

const FILTERS = ["全部", "待通知", "前道中", "后道中", "验货", "已签收", "打回"] as const;

export default function SampleNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const [q, setQ] = useState(sp.q ?? "");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");

  const rows = useMemo(() => {
    return getNotices().filter((n) => {
      // URL 级过滤：客户名锁定（不可被搜索覆盖）
      if (sp.customer && n.customer !== sp.customer) return false;
      if (pf !== "全部" && n.progress !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        n.docNo.toLowerCase().includes(lq) ||
        n.customer.includes(q) ||
        n.product.includes(q) ||
        n.charge.includes(q)
      );
    });
  }, [q, pf, sp.customer]);

  /* 浏览器前进/后退时跟随 URL */
  useEffect(() => {
    setQ(sp.q ?? "");
  }, [sp]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 顶部 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="SAMPLE-NOTICES-2026-07-21"
            shortCode="qs-app"
            season="本周"
            composition="5 个新打样 · 3 前道 · 1 后道 · 1 待通知"
            specs={[
              { label: "未结", value: rows.length, mono: true },
              { label: "平均 GSM", value: 276, mono: true },
              { label: "平均交期", value: "5.6d", mono: true },
            ]}
            prices={[
              { label: "涉及客户", value: "3", mono: true },
              { label: "前道师傅", value: "2 / 3 在线", mono: true },
            ]}
          />
        </div>

        {/* 页头 */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              ORDERS · sample-notice
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">打样通知</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              业务发起「我要打这个样」。从通知到工艺单到报价，自上而下串起。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">导出本周</Button>
            <Link href="/orders/sample-notices/new">
              <Button variant="default" size="md">+ 新建打样</Button>
            </Link>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜编号 / 客户 / 产品 / 业务员..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setPf(f)}
                className={cn(
                  "h-9 px-3 rounded-md text-[14px] transition-colors font-mono tracking-tight",
                  pf === f
                    ? "bg-[var(--ink)] text-[var(--background)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 表格 */}
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[140px_90px_1fr_70px_80px_60px_50px_60px_80px_70px_90px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>客户</div>
            <div>产品</div>
            <div className="text-right">GSM</div>
            <div className="text-right">针数</div>
            <div className="text-right">数量</div>
            <div>尺码</div>
            <div>交期</div>
            <div>进度</div>
            <div>前道</div>
            <div>跟单</div>
            <div>更新</div>
          </div>

          {rows.map((n) => (
            <Link
              key={n.id}
              href={`/orders/sample-notices/${n.id}`}
              className={cn(
                "grid grid-cols-[140px_90px_1fr_70px_80px_60px_50px_60px_80px_70px_90px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
                "hover:bg-[var(--accent)]/40 transition-colors cursor-pointer"
              )}
            >
              <div className="font-mono text-[14px] text-[var(--ink)] font-medium tracking-tight">
                {n.docNo}
              </div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{n.customer}</div>
              <div className="text-[14px] font-medium text-[var(--ink)] truncate">
                {n.product}
                {n.yarnNote && (
                  <span className="ml-1.5 text-[14px] font-mono text-[var(--ink-mute)]">
                    · {n.yarnNote}
                  </span>
                )}
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">
                {n.specs.gsm}
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">
                {n.specs.needle}G
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">
                {n.qty}
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-mute)]">
                {n.sizeRange}
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)]">
                {n.deliveryDate.slice(5)}
              </div>
              <div>
                <Badge tone={PROGRESS_TONE[n.progress]} size="sm">{n.progress}</Badge>
              </div>
              <div className="text-[14px] text-[var(--ink-dim)]">{n.master}</div>
              <div className="text-[14px] text-[var(--ink-dim)]">{n.charge}</div>
              <div className="text-[14px] font-mono text-[var(--ink-mute)]">{n.updated}</div>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
