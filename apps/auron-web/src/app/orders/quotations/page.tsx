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
import { getQuotes } from "@/lib/data";

const STATUS_TONE: Record<string, "neutral" | "info" | "success" | "danger"> = {
  草稿: "neutral",
  已发: "info",
  客户确认: "success",
  已拒: "danger",
};

const FILTERS = ["全部", "草稿", "已发", "客户确认", "已拒"] as const;

function normalizeQuote(row: any, index: number) {
  const landedCost = row.landedCost ?? row.costInc;
  const filedTaxInc = row.filedTaxInc ?? row.filedPriceInc;
  const marginInc = row.marginInc ?? (
    filedTaxInc && landedCost != null ? ((filedTaxInc - landedCost) / filedTaxInc) * 100 : undefined
  );

  return {
    ...row,
    status: row.status ?? (index === 0 ? "已发" : "草稿"),
    qty: row.qty ?? row.orderQty,
    sizeRange: row.sizeRange ?? row.orderSizeRange?.join("/"),
    landedCost,
    filedTaxInc,
    marginInc,
  };
}

export default function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const [q, setQ] = useState(sp.q ?? "");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");
  const allRows = useMemo(() => getQuotes().map(normalizeQuote), []);

  const rows = useMemo(() => {
    return allRows.filter((w) => {
      // URL 级过滤：客户名锁定（不可被搜索覆盖）
      if (sp.customer && w.customer !== sp.customer) return false;
      if (pf !== "全部" && w.status !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        (w.id ?? "").toLowerCase().includes(lq) ||
        (w.customer ?? "").includes(q) ||
        (w.product ?? "").includes(q) ||
        (w.quoter ?? "").includes(q)
      );
    });
  }, [allRows, q, pf, sp.customer]);

  const averageMargin = allRows.length
    ? allRows.reduce((sum, row) => sum + (row.marginInc ?? 0), 0) / allRows.length
    : 0;
  const attentionItems = allRows
    .filter((row) => row.status === "草稿" || row.status === "已拒" || (row.marginInc ?? 0) < 15)
    .map((row) => ({
      title: `${row.customer ?? "未关联客户"} · ${row.product ?? "未命名产品"}`,
      eyebrow: row.id,
      meta: row.status === "已拒"
        ? "客户已拒绝，需要调整方案后重新报价"
        : (row.marginInc ?? 0) < 15
          ? `含税毛利仅 ${(row.marginInc ?? 0).toFixed(1)}%，建议复核成本`
          : "仍在草稿中，等待报价员完成并发送",
      href: `/orders/quotations/${row.id}`,
      tone: row.status === "已拒" ? "danger" as const : (row.marginInc ?? 0) < 15 ? "warn" as const : "neutral" as const,
    }));

  /* 浏览器前进/后退时跟随 URL */
  useEffect(() => {
    setQ(sp.q ?? "");
  }, [sp]);

  return (
    <AdminShell
      pageTitle="报价"
      pageKicker="报价管理"
      pageDescription="维护染整、缝制、辅料、其他费用和毛利率，让报价员能快速追溯每个数字。"
      pageActions={(
        <>
          <Button variant="outline" size="md">导出本月</Button>
          <Link href="/orders/quotations/new">
            <Button variant="default" size="md">新建报价</Button>
          </Link>
        </>
      )}
      pageMeta={[
        { label: "报价", value: rows.length },
        { label: "已确认", value: rows.filter((row) => row.status === "客户确认").length },
        { label: "草稿", value: rows.filter((row) => row.status === "草稿").length },
      ]}
    >
      <div className="mx-auto max-w-[1440px] space-y-5 px-8 py-6">
        <WorkflowPulse
          items={[
            { label: "待完成草稿", value: allRows.filter((row) => row.status === "草稿").length, detail: "尚未形成客户可确认的正式报价", tone: "warn", active: pf === "草稿", onClick: () => setPf("草稿") },
            { label: "等待客户确认", value: allRows.filter((row) => row.status === "已发").length, detail: "已发送，建议结合跟进计划主动推进", tone: "primary", active: pf === "已发", onClick: () => setPf("已发") },
            { label: "本期已确认", value: allRows.filter((row) => row.status === "客户确认").length, detail: "可进入后续订单与生产准备", tone: "success", active: pf === "客户确认", onClick: () => setPf("客户确认") },
            { label: "平均含税毛利", value: `${averageMargin.toFixed(1)}%`, detail: "低于 15% 的报价已进入右侧关注队列", tone: averageMargin < 15 ? "danger" : "neutral" },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0">
            <WorkflowListHeader title="报价台账" count={rows.length}>
          <Input
            placeholder="搜编号 / 客户 / 产品 / 报价员..."
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

        <div className="border border-[var(--hairline)] rounded-md overflow-x-auto bg-[var(--card)]">
          <div className="grid min-w-[1080px] grid-cols-[120px_80px_220px_70px_70px_100px_100px_80px_80px_90px_70px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.12em] text-[var(--ink-mute)]">
            <div>报价编号</div>
            <div>客户</div>
            <div>产品</div>
            <div className="text-right">数量</div>
            <div>尺码</div>
            <div className="text-right">含税成本</div>
            <div className="text-right">备案含税</div>
            <div className="text-right">毛利%</div>
            <div>有效期</div>
            <div>状态</div>
            <div>更新</div>
          </div>

          {rows.map((w) => (
            <Link
              key={w.id}
              href={`/orders/quotations/${w.id}`}
              className={cn(
                "grid min-w-[1080px] grid-cols-[120px_80px_220px_70px_70px_100px_100px_80px_80px_90px_70px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
                "hover:bg-[var(--accent)]/40 transition-colors"
              )}
            >
              <div className="font-mono text-[14px] font-medium text-[var(--ink)]">
                {w.id.replace("Q-2026-", "")}
              </div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{w.customer ?? "—"}</div>
              <div className="text-[14px] font-medium text-[var(--ink)] truncate">{w.product ?? "—"}</div>
              <div className="text-right font-mono tnum text-[14px]">{w.qty ?? "—"}</div>
              <div className="font-mono text-[14px] text-[var(--ink-mute)] truncate">{w.sizeRange ?? "—"}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink-dim)]">{w.landedCost ? `¥${w.landedCost.toFixed(2)}` : "—"}</div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{w.filedTaxInc ? `¥${w.filedTaxInc.toFixed(2)}` : "—"}</div>
              <div className="text-right">
                <NumChip
                  value={w.marginInc ? `${w.marginInc.toFixed(1)}%` : "—"}
                  tone={
                    (w.marginInc ?? 0) >= 25 ? "success"
                      : (w.marginInc ?? 0) >= 15 ? "warn"
                      : "danger"
                  }
                />
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)]">{w.validUntil?.slice(5) ?? "—"}</div>
              <div>
                <Badge tone={STATUS_TONE[w.status as keyof typeof STATUS_TONE]} size="sm">{w.status ?? "—"}</Badge>
              </div>
              <div className="text-[14px] font-mono text-[var(--ink-mute)]">{w.updated ?? "—"}</div>
            </Link>
          ))}
        </div>
          </section>

          <AttentionRail
            title="报价风险"
            description="集中显示被拒、低毛利和待完成报价，避免风险埋在表格里。"
            items={attentionItems}
          />
        </div>
      </div>
    </AdminShell>
  );
}
