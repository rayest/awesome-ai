"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NumChip } from "@/components/domain/a-status";
import { getWorkorders } from "@/lib/data";

const STATUS_TONE = {
  待审: "neutral",
  已发: "info",
  织造中: "primary",
  染整中: "warn",
} as const;

const FILTERS = ["全部", "待审", "已发", "织造中", "染整中"] as const;

export default function SampleWorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ master?: string; customer?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const [q, setQ] = useState(sp.q ?? "");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");

  const rows = useMemo(() => {
    return getWorkorders().filter((w) => {
      // URL 级过滤：师傅名锁定（不可被搜索覆盖）
      if (sp.master && w.master !== sp.master) return false;
      // URL 级过滤：客户名锁定
      if (sp.customer && w.customer !== sp.customer) return false;
      if (pf !== "全部" && w.status !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        w.id.toLowerCase().includes(lq) ||
        w.customer.includes(q) ||
        w.product.includes(q) ||
        w.master.includes(q)
      );
    });
  }, [q, pf, sp.master, sp.customer]);

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
            docNo="WO-OVERVIEW-2026-07-21"
            shortCode="qs-app"
            season="本周"
            composition="4 个工艺 · 1 待审 · 2 织造中 · 平均 GSM 250"
            specs={[
              { label: "进行中", value: 2, mono: true },
              { label: "待审", value: 1, mono: true },
              { label: "已完成", value: 1, mono: true },
            ]}
            prices={[
              { label: "主纱线", value: "4 款", mono: true },
              { label: "总下机克重", value: "28.4 kg", mono: true },
            ]}
          />
        </div>

        {/* 页头 */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              ORDERS · workorder
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">
              打样工艺
            </h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              工艺配方：机 + 纱 + 排 + 染 + 缝。从此告别老师傅脑子里的工艺本。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">导出本周工艺</Button>
            <Link href="/orders/sample-workorders/new">
              <Button variant="default" size="md">+ 新建工艺</Button>
            </Link>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜编号 / 客户 / 产品 / 师傅..."
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
          <div className="grid grid-cols-[150px_70px_1fr_120px_70px_70px_70px_70px_70px_70px_70px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>客户</div>
            <div>产品</div>
            <div>机型</div>
            <div className="text-right">针数</div>
            <div className="text-right">GSM</div>
            <div className="text-right">转速</div>
            <div className="text-right">下机秒</div>
            <div className="text-right">损耗%</div>
            <div className="truncate">主纱线</div>
            <div>状态</div>
            <div>更新</div>
          </div>

          {rows.map((w) => (
            <Link
              key={w.id}
              href={`/orders/sample-workorders/${w.id}`}
              className={cn(
                "grid grid-cols-[150px_70px_1fr_120px_70px_70px_70px_70px_70px_70px_70px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
                "hover:bg-[var(--accent)]/40 transition-colors"
              )}
            >
              <div className="font-mono text-[14px] font-medium text-[var(--ink)]">
                {w.id.replace("WO-2026-", "")}
              </div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{w.customer}</div>
              <div className="text-[14px] font-medium text-[var(--ink)] truncate">
                {w.product}
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">{w.machine}</div>
              <div className="text-right font-mono tnum text-[14px]">{w.needle}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{w.gsm}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">{w.rotateRpm}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">{w.stitchTime}</div>
              <div className="text-right">
                <NumChip
                  value={`${w.yamLoss}%`}
                  tone={w.yamLoss > 8 ? "danger" : w.yamLoss > 6 ? "warn" : "neutral"}
                />
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">{w.yarn}</div>
              <div>
                <Badge tone={STATUS_TONE[w.status as keyof typeof STATUS_TONE]} size="sm">{w.status}</Badge>
              </div>
              <div className="text-[14px] font-mono text-[var(--ink-mute)]">{w.updated}</div>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
