"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusDot, NumChip } from "@/components/domain/a-status";
import { cn } from "@/lib/utils";

type Notice = {
  id: string;
  docNo: string;
  customer: string;
  customerCode: string;
  product: string;
  color: string;
  specs: { gsm: number; needle: number };
  yarnNote?: string;
  dyeRequirement?: string;
  qty: number;
  sizeRange: string;
  deliveryDate: string;
  progress: "待通知" | "前道中" | "后道中" | "验货" | "已签收" | "打回";
  charge: string;
  master: string;
  updated: string;
};

const MOCK: Notice[] = [
  {
    id: "0317-A",
    docNo: "SMPL-2026-0317-A",
    customer: "乾盛",
    customerCode: "GH-QS-007",
    product: "羊毛双面呢 · 立领大衣",
    color: "炭灰",
    specs: { gsm: 320, needle: 18 },
    yarnNote: "澳毛 80s + 长绒棉 60s",
    dyeRequirement: "缸染低温",
    qty: 3,
    sizeRange: "S/M/L",
    deliveryDate: "2026-07-28",
    progress: "前道中",
    charge: "李白",
    master: "老周",
    updated: "今 09:14",
  },
  {
    id: "0316-B",
    docNo: "SMPL-2026-0316-B",
    customer: "弘大",
    customerCode: "GH-HD-002",
    product: "罗纹打底衫（女）",
    color: "米白",
    specs: { gsm: 180, needle: 16 },
    yarnNote: "莫代尔 40/1",
    qty: 2,
    sizeRange: "M/L",
    deliveryDate: "2026-07-25",
    progress: "后道中",
    charge: "李白",
    master: "阿亮",
    updated: "昨 17:30",
  },
  {
    id: "0315-A",
    docNo: "SMPL-2026-0315-A",
    customer: "弘大",
    customerCode: "GH-HD-002",
    product: "圆机 T 恤（基础款）",
    color: "军绿",
    specs: { gsm: 220, needle: 14 },
    yarnNote: "长绒棉 60s",
    dyeRequirement: "成衣染",
    qty: 4,
    sizeRange: "S/M/L/XL",
    deliveryDate: "2026-07-22",
    progress: "已签收",
    charge: "李白",
    master: "老周",
    updated: "3 天前",
  },
  {
    id: "0314-C",
    docNo: "SMPL-2026-0314-C",
    customer: "一针坊",
    customerCode: "GH-YX-031",
    product: "提花围巾（原创款）",
    color: "原色",
    specs: { gsm: 280, needle: 12 },
    yarnNote: "丝光羊毛",
    qty: 2,
    sizeRange: "均码",
    deliveryDate: "2026-07-30",
    progress: "待通知",
    charge: "亚明",
    master: "—",
    updated: "5 小时前",
  },
  {
    id: "0313-D",
    docNo: "SMPL-2026-0313-D",
    customer: "巧岛",
    customerCode: "GH-QD-044",
    product: "卫衣（女）",
    color: "藏蓝",
    specs: { gsm: 380, needle: 16 },
    qty: 3,
    sizeRange: "M/L/XL",
    deliveryDate: "2026-07-26",
    progress: "打回",
    charge: "刘韬",
    master: "阿亮",
    updated: "今 11:02",
  },
];

const PROGRESS_TONE = {
  待通知: "neutral",
  前道中: "info",
  后道中: "warn",
  验货: "primary",
  已签收: "success",
  打回: "danger",
} as const;

const FILTERS = ["全部", "待通知", "前道中", "后道中", "验货", "已签收", "打回"] as const;

export default function SampleNoticesPage() {
  const [q, setQ] = useState("");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");

  const rows = useMemo(() => {
    return MOCK.filter((n) => {
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
  }, [q, pf]);

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
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              ORDERS · sample-notice
            </p>
            <h1 className="font-display text-[28px] font-medium tracking-tight">打样通知</h1>
            <p className="mt-1.5 text-[13px] text-[var(--ink-dim)] max-w-[520px]">
              业务发起「我要打这个样」。从通知到工艺单到报价，自上而下串起。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">导出本周</Button>
            <Button variant="default" size="md">+ 新建打样</Button>
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
                  "h-9 px-3 rounded-md text-[12px] transition-colors font-mono tracking-tight",
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
          <div className="grid grid-cols-[140px_90px_1fr_70px_80px_60px_50px_60px_80px_70px_90px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
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
              <div className="font-mono text-[11px] text-[var(--ink)] font-medium tracking-tight">
                {n.docNo}
              </div>
              <div className="text-[12px] text-[var(--ink-dim)] truncate">{n.customer}</div>
              <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                {n.product}
                {n.yarnNote && (
                  <span className="ml-1.5 text-[11px] font-mono text-[var(--ink-mute)]">
                    · {n.yarnNote}
                  </span>
                )}
              </div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink)]">
                {n.specs.gsm}
              </div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink-dim)]">
                {n.specs.needle}G
              </div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink-dim)]">
                {n.qty}
              </div>
              <div className="font-mono text-[11px] text-[var(--ink-mute)]">
                {n.sizeRange}
              </div>
              <div className="font-mono text-[12px] text-[var(--ink-dim)]">
                {n.deliveryDate.slice(5)}
              </div>
              <div>
                <Badge tone={PROGRESS_TONE[n.progress]} size="sm">{n.progress}</Badge>
              </div>
              <div className="text-[12px] text-[var(--ink-dim)]">{n.master}</div>
              <div className="text-[12px] text-[var(--ink-dim)]">{n.charge}</div>
              <div className="text-[11px] font-mono text-[var(--ink-mute)]">{n.updated}</div>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
