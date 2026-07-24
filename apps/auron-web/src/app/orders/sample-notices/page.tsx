"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AttentionRail, WorkflowListHeader, WorkflowPulse } from "@/components/domain/workflow-list";
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

function normalizeNotice(row: any) {
  return {
    ...row,
    customer: row.customer ?? row.customerName ?? row.name,
    master: row.master ?? row.frontMaster,
    charge: row.charge ?? row.bizManager,
  };
}

export default function SampleNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const [q, setQ] = useState(sp.q ?? "");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");
  const allRows = useMemo(() => getNotices().map(normalizeNotice), []);

  const rows = useMemo(() => {
    return allRows.filter((n) => {
      // URL 级过滤：客户名锁定（不可被搜索覆盖）
      if (sp.customer && n.customer !== sp.customer) return false;
      if (pf !== "全部" && n.progress !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        (n.id ?? "").toLowerCase().includes(lq) ||
        (n.customer ?? "").includes(q) ||
        (n.product ?? "").includes(q) ||
        (n.charge ?? "").includes(q)
      );
    });
  }, [allRows, q, pf, sp.customer]);

  const attentionItems = allRows
    .filter((row) => row.progress === "打回" || row.progress === "验货" || row.progress === "待通知")
    .map((row) => ({
      title: `${row.customer ?? "未关联客户"} · ${row.product ?? "未命名产品"}`,
      eyebrow: row.id,
      meta: row.progress === "打回"
        ? "样衣被打回，需要确认问题并安排返工"
        : row.progress === "验货"
          ? `等待验货，计划交样 ${row.deliveryDate?.slice(5) ?? "待定"}`
          : "通知尚未下发，工坊暂时无法开始",
      href: `/orders/sample-notices/${row.id}`,
      tone: row.progress === "打回" ? "danger" as const : row.progress === "验货" ? "warn" as const : "neutral" as const,
    }));

  /* 浏览器前进/后退时跟随 URL */
  useEffect(() => {
    setQ(sp.q ?? "");
  }, [sp]);

  return (
    <AdminShell
      pageTitle="打样通知"
      pageKicker="工坊协作"
      pageDescription="业务发起打样后，从通知到工艺单再到报价，按当前进度跟进每一个样衣。"
      pageActions={(
        <>
          <Button variant="outline" size="md">导出本周</Button>
          <Link href="/orders/sample-notices/new">
            <Button variant="default" size="md">新建打样</Button>
          </Link>
        </>
      )}
      pageMeta={[
        { label: "未结", value: rows.length },
        { label: "平均克重", value: 276 },
        { label: "平均交期", value: "5.6d" },
      ]}
    >
      <div className="mx-auto max-w-[1440px] space-y-5 px-8 py-6">
        <WorkflowPulse
          items={[
            { label: "等待下发", value: allRows.filter((row) => row.progress === "待通知").length, detail: "业务资料已录入，等待工坊接收", tone: "warn", active: pf === "待通知", onClick: () => setPf("待通知") },
            { label: "工坊进行中", value: allRows.filter((row) => row.progress === "前道中" || row.progress === "后道中").length, detail: "前道与后道正在协同制作样衣", tone: "primary" },
            { label: "等待验货", value: allRows.filter((row) => row.progress === "验货").length, detail: "样衣已完成，等待确认质量与尺寸", tone: "warn", active: pf === "验货", onClick: () => setPf("验货") },
            { label: "异常打回", value: allRows.filter((row) => row.progress === "打回").length, detail: "需要明确责任人与返工节点", tone: "danger", active: pf === "打回", onClick: () => setPf("打回") },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0">
            <WorkflowListHeader title="打样进度" count={rows.length}>
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
            </WorkflowListHeader>

        {/* 表格 */}
        <div className="overflow-x-auto rounded-md border border-[var(--hairline)] bg-[var(--card)]">
          <div className="grid min-w-[1100px] grid-cols-[140px_90px_1fr_70px_80px_60px_50px_60px_80px_70px_90px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div>编号</div>
            <div>客户</div>
            <div>产品</div>
            <div className="text-right">克重</div>
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
                "grid min-w-[1100px] grid-cols-[140px_90px_1fr_70px_80px_60px_50px_60px_80px_70px_90px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
                "hover:bg-[var(--accent)]/40 transition-colors cursor-pointer"
              )}
            >
              <div className="font-mono text-[14px] text-[var(--ink)] font-medium tracking-tight">
                {n.id}
              </div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{n.customer ?? "—"}</div>
              <div className="text-[14px] font-medium text-[var(--ink)] truncate">
                {n.product ?? "—"}
                {n.yarnNote && (
                  <span className="ml-1.5 text-[14px] font-mono text-[var(--ink-mute)]">
                    · {n.yarnNote}
                  </span>
                )}
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">
                {n.specs?.gsm ?? "—"}
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">
                {n.specs?.needle ? `${n.specs.needle}G` : "—"}
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">
                {n.qty ?? "—"}
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-mute)]">
                {n.sizeRange ?? "—"}
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)]">
                {n.deliveryDate?.slice(5) ?? "—"}
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
          </section>

          <AttentionRail
            title="今日调度"
            description="把待下发、待验货和异常样衣汇总到一个处理队列。"
            items={attentionItems}
          />
        </div>
      </div>
    </AdminShell>
  );
}
