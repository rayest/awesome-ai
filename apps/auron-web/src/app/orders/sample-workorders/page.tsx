"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NumChip } from "@/components/domain/a-status";
import { AttentionRail, WorkflowListHeader, WorkflowPulse } from "@/components/domain/workflow-list";
import { getWorkorders } from "@/lib/data";

const STATUS_TONE = {
  待审: "neutral",
  已发: "info",
  织造中: "primary",
  染整中: "warn",
} as const;

const FILTERS = ["全部", "待审", "已发", "织造中", "染整中"] as const;

function normalizeWorkorder(row: any, index: number) {
  return {
    ...row,
    machine: row.machine ?? row.modelSpec,
    product: row.product ?? row.programName,
    master: row.master ?? row.frontMaster,
    gsm: row.gsm ?? row["平方克重（GSM）"],
    status: row.status ?? (index === 0 ? "织造中" : index === 1 ? "已发" : "待审"),
  };
}

export default function SampleWorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ master?: string; customer?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const [q, setQ] = useState(sp.q ?? "");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");
  const allRows = useMemo(() => getWorkorders().map(normalizeWorkorder), []);

  const rows = useMemo(() => {
    return allRows.filter((w) => {
      // URL 级过滤：师傅名锁定（不可被搜索覆盖）
      if (sp.master && w.master !== sp.master) return false;
      // URL 级过滤：客户名锁定
      if (sp.customer && w.customer !== sp.customer) return false;
      if (pf !== "全部" && w.status !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        (w.id ?? "").toLowerCase().includes(lq) ||
        (w.customer ?? "").includes(q) ||
        (w.product ?? "").includes(q) ||
        (w.master ?? "").includes(q)
      );
    });
  }, [allRows, q, pf, sp.master, sp.customer]);

  const averageLoss = allRows.length
    ? allRows.reduce((sum, row) => sum + (row.yamLoss ?? 0), 0) / allRows.length
    : 0;
  const attentionItems = allRows
    .filter((row) => row.status === "待审" || (row.yamLoss ?? 0) > 8 || !row.machine)
    .map((row) => ({
      title: `${row.customer ?? "未关联客户"} · ${row.product ?? row.programName ?? "未命名工艺"}`,
      eyebrow: row.id,
      meta: !row.machine
        ? "尚未指定机型，无法安排织造"
        : (row.yamLoss ?? 0) > 8
          ? `纱线损耗 ${(row.yamLoss ?? 0).toFixed(1)}%，建议复核用料`
          : "工艺单等待审核，审核后才能下发",
      href: `/orders/sample-workorders/${row.id}`,
      tone: !row.machine || (row.yamLoss ?? 0) > 8 ? "danger" as const : "warn" as const,
    }));

  /* 浏览器前进/后退时跟随 URL */
  useEffect(() => {
    setQ(sp.q ?? "");
  }, [sp]);

  return (
    <AdminShell
      pageTitle="打样工艺"
      pageKicker="工坊协作"
      pageDescription="承接打样通知，维护织造、染整、后道和包装要求，方便车间按统一工艺执行。"
      pageActions={(
        <>
          <Button variant="outline" size="md">导出工艺</Button>
          <Link href="/orders/sample-workorders/new">
            <Button variant="default" size="md">新建工艺单</Button>
          </Link>
        </>
      )}
      pageMeta={[
        { label: "工艺单", value: allRows.length },
        { label: "生产中", value: allRows.filter((row) => row.status === "织造中" || row.status === "染整中").length },
        { label: "平均损耗", value: `${averageLoss.toFixed(1)}%` },
      ]}
    >
      <div className="mx-auto max-w-[1440px] space-y-5 px-8 py-6">
        <WorkflowPulse
          items={[
            { label: "等待审核", value: allRows.filter((row) => row.status === "待审").length, detail: "核对机型、参数和用料后才能下发", tone: "warn", active: pf === "待审", onClick: () => setPf("待审") },
            { label: "已发待排产", value: allRows.filter((row) => row.status === "已发").length, detail: "工艺已确认，等待车间安排机台", tone: "neutral", active: pf === "已发", onClick: () => setPf("已发") },
            { label: "织造进行中", value: allRows.filter((row) => row.status === "织造中").length, detail: "关注机型负荷、转速与下机时间", tone: "primary", active: pf === "织造中", onClick: () => setPf("织造中") },
            { label: "高损耗工艺", value: allRows.filter((row) => (row.yamLoss ?? 0) > 8).length, detail: "损耗超过 8%，需要复核配比与成本", tone: "danger" },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0">
            <WorkflowListHeader title="工艺执行台账" count={rows.length}>
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
            </WorkflowListHeader>

        {/* 表格 */}
        <div className="overflow-x-auto rounded-md border border-[var(--hairline)] bg-[var(--card)]">
          <div className="grid min-w-[1120px] grid-cols-[150px_70px_1fr_120px_70px_70px_70px_70px_70px_70px_70px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>客户</div>
            <div>产品</div>
            <div>机型</div>
            <div className="text-right">针数</div>
            <div className="text-right">克重</div>
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
                "grid min-w-[1120px] grid-cols-[150px_70px_1fr_120px_70px_70px_70px_70px_70px_70px_70px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
                "hover:bg-[var(--accent)]/40 transition-colors"
              )}
            >
              <div className="font-mono text-[14px] font-medium text-[var(--ink)]">
                {w.id.replace("WO-2026-", "")}
              </div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{w.customer ?? "—"}</div>
              <div className="text-[14px] font-medium text-[var(--ink)] truncate">
                {w.product ?? "—"}
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">{w.machine}</div>
              <div className="text-right font-mono tnum text-[14px]">{w.needle}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{w.gsm}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">{w.rotateRpm ?? w.rpm ?? "—"}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">{w.stitchTime ?? w.stitchSec ?? "—"}</div>
              <div className="text-right">
                <NumChip
                  value={w.yamLoss != null ? `${w.yamLoss}%` : "—"}
                  tone={w.yamLoss == null ? "neutral" : w.yamLoss > 8 ? "danger" : w.yamLoss > 6 ? "warn" : "neutral"}
                />
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">{w.yarn ?? "—"}</div>
              <div>
                <Badge tone={STATUS_TONE[w.status as keyof typeof STATUS_TONE]} size="sm">{w.status ?? "—"}</Badge>
              </div>
              <div className="text-[14px] font-mono text-[var(--ink-mute)]">{w.updated ?? "—"}</div>
            </Link>
          ))}
        </div>
          </section>

          <AttentionRail
            title="工艺异常"
            description="审核、机型缺失和高损耗记录集中处理，减少车间反复确认。"
            items={attentionItems}
          />
        </div>
      </div>
    </AdminShell>
  );
}
