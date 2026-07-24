"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AttentionRail, WorkflowListHeader, WorkflowPulse } from "@/components/domain/workflow-list";
import { getProducts } from "@/lib/data";

const CATEGORIES = ["全部", "外套", "打底", "T恤", "配饰"] as const;

function normalizeProduct(row: any) {
  return {
    ...row,
    name: row.name ?? row.product,
    gsm: row.gsm ?? row["平方克"],
    sizeRange: row.sizeRange ?? row.size,
  };
}

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [pf, setPf] = useState<(typeof CATEGORIES)[number]>("全部");
  const allRows = useMemo(() => getProducts().map(normalizeProduct), []);

  const rows = useMemo(() => {
    return allRows.filter((p) => {
      if (pf !== "全部" && p.category !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        p.styleNo.toLowerCase().includes(lq) ||
        p.name.includes(q) ||
        p.yarn.includes(q) ||
        p.programName.toLowerCase().includes(lq)
      );
    });
  }, [allRows, q, pf]);

  const totals = useMemo(() => {
    return {
      products: rows.length,
      categories: new Set(rows.map((p) => p.category)).size,
      yarnCount: new Set(rows.map((p) => p.yarn.split("/")[0].trim())).size,
    };
  }, [rows]);

  const attentionItems = allRows
    .filter((row) => !row.programName || !row.yarn || !row.sizeRange || !row.craft)
    .map((row) => ({
      title: `${row.styleNo} · ${row.name}`,
      eyebrow: row.category,
      meta: `资料待补：${[
        !row.programName && "程序",
        !row.yarn && "纱线",
        !row.sizeRange && "尺码",
        !row.craft && "工艺",
      ].filter(Boolean).join("、")}`,
      href: `/products/${encodeURIComponent(row.styleNo)}`,
      tone: "warn" as const,
    }));

  return (
    <AdminShell
      pageTitle="产品主数据"
      pageKicker="产品管理"
      pageDescription="统一管理款号、程序、纱线、工艺和颜色，业务、工艺和报价都从这里引用产品信息。"
      pageActions={(
        <>
          <Button variant="outline" size="md">批量导出</Button>
          <Link href="/products/new">
            <Button variant="default" size="md">新增产品</Button>
          </Link>
        </>
      )}
      pageMeta={[
        { label: "款数", value: totals.products },
        { label: "类目", value: totals.categories },
        { label: "主纱线", value: totals.yarnCount },
      ]}
    >
      <div className="mx-auto max-w-[1440px] space-y-5 px-8 py-6">
        <WorkflowPulse
          items={[
            { label: "可复用产品", value: allRows.filter((row) => row.programName && row.yarn && row.craft).length, detail: "主数据完整，可直接用于打样和报价", tone: "success" },
            { label: "外套类", value: allRows.filter((row) => row.category === "外套").length, detail: "点击快速查看外套产品族", active: pf === "外套", onClick: () => setPf("外套") },
            { label: "打底与 T 恤", value: allRows.filter((row) => row.category === "打底" || row.category === "T恤").length, detail: "高频基础款，适合复用既有程序", tone: "primary" },
            { label: "资料待补", value: attentionItems.length, detail: "缺少程序、纱线、尺码或工艺信息", tone: attentionItems.length ? "warn" : "success" },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0">
            <WorkflowListHeader title="产品资料库" count={rows.length}>
          <Input
            placeholder="搜款号 / 品名 / 纱线 / 程序名..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {CATEGORIES.map((f) => (
              <button
                key={f}
                onClick={() => setPf(f)}
                className={cn(
                  "h-9 px-3 rounded-md text-[14px] transition-colors",
                  pf === f ? "bg-[var(--ink)] text-[var(--background)]" : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[14px] font-mono text-[var(--ink-mute)]">
            <span>显示 <span className="text-[var(--ink)] tnum">{rows.length}</span>/<span className="tnum">{allRows.length}</span> 条</span>
          </div>
            </WorkflowListHeader>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[130px_140px_70px_1fr_60px_140px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[13px] font-mono uppercase tracking-[0.08em] text-[var(--ink-mute)]">
            <div>款号</div>
            <div>程序名</div>
            <div>类目</div>
            <div>品名 · 工艺</div>
            <div className="text-right">克重</div>
            <div>纱线 · 颜色</div>
            <div>尺码</div>
          </div>

          {rows.map((p) => (
            <Link
              key={p.styleNo}
              href={`/products/${encodeURIComponent(p.styleNo)}`}
              className="grid grid-cols-[130px_140px_70px_1fr_60px_140px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="font-mono text-[14px] font-medium text-[var(--ink)] tracking-tight">
                {p.styleNo}
              </div>
              <div className="font-mono text-[13px] text-[var(--ink-dim)] truncate">{p.programName}</div>
              <div>
                <Badge tone="neutral" size="sm">{p.category}</Badge>
              </div>
              <div className="text-[14px] min-w-0">
                <div className="text-[var(--ink)] font-medium truncate">{p.name}</div>
                <div className="text-[13px] text-[var(--ink-mute)] truncate">
                  {p.craft}
                </div>
              </div>
              <div className="text-right font-mono tnum text-[14px]">{p.gsm}</div>
              <div className="text-[14px] min-w-0">
                <div className="text-[var(--ink-dim)] truncate">{p.yarn}</div>
                <div className="text-[13px] text-[var(--ink-mute)] truncate">{p.color}</div>
              </div>
              <div className="text-[13px] text-[var(--ink-dim)] truncate">{p.sizeRange}</div>
            </Link>
          ))}
        </div>
          </section>

          <AttentionRail
            title="主数据质量"
            description="先补齐影响打样和报价的关键字段，避免下游重复录入。"
            items={attentionItems}
            emptyText="当前产品资料完整，可直接被业务流程引用"
          />
        </div>
      </div>
    </AdminShell>
  );
}
