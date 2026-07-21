"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusDot, NumChip } from "@/components/domain/a-status";
import { cn } from "@/lib/utils";

type WO = {
  id: string;
  docNo: string;
  customer: string;
  product: string;
  machine: string;          // 机型 口径"
  needle: string;           // 针数  e.g. "18G"
  gsm: number;
  stitchTime: number;       // 下机时间 秒
  rotateRpm: number;        // 转速
  yamLoss: number;          // 损耗系数 %
  yarn: string;             // 主纱线
  blend: string;            // 配比  e.g. "60 / 40"
  status: "待审" | "已发" | "织造中" | "染整中";
  master: string;
  updated: string;
};

const MOCK_WOS: WO[] = [
  { id: "WO-0317-A", docNo: "WO-2026-0317-A", customer: "乾盛", product: "羊毛双面呢", machine: "广源 GY-18 寸", needle: "18G", gsm: 320, stitchTime: 240, rotateRpm: 18, yamLoss: 8, yarn: "澳毛 80s", blend: "60 / 40", status: "织造中", master: "老周", updated: "今 09:14" },
  { id: "WO-0316-B", docNo: "WO-2026-0316-B", customer: "弘大", product: "罗纹打底衫", machine: "中纺 ZF-16 寸", needle: "16G", gsm: 180, stitchTime: 180, rotateRpm: 22, yamLoss: 6, yarn: "莫代尔 40/1", blend: "100", status: "染整中", master: "阿亮", updated: "昨 17:30" },
  { id: "WO-0315-A", docNo: "WO-2026-0315-A", customer: "弘大", product: "圆机 T 恤", machine: "瑞奇 RQ-14 寸", needle: "14G", gsm: 220, stitchTime: 150, rotateRpm: 24, yamLoss: 5, yarn: "长绒棉 60s", blend: "100", status: "已发", master: "老周", updated: "3 天前" },
  { id: "WO-0314-C", docNo: "WO-2026-0314-C", customer: "一针坊", product: "提花围巾", machine: "盛源 SY-12 寸", needle: "12G", gsm: 280, stitchTime: 300, rotateRpm: 14, yamLoss: 9, yarn: "丝光羊毛", blend: "100", status: "待审", master: "—", updated: "5 小时前" },
];

const STATUS_TONE = {
  待审: "neutral",
  已发: "info",
  织造中: "primary",
  染整中: "warn",
} as const;

const FILTERS = ["全部", "待审", "已发", "织造中", "染整中"] as const;

export default function SampleWorkOrdersPage() {
  const [q, setQ] = useState("");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");

  const rows = useMemo(() => {
    return MOCK_WOS.filter((w) => {
      if (pf !== "全部" && w.status !== pf) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        w.docNo.toLowerCase().includes(lq) ||
        w.customer.includes(q) ||
        w.product.includes(q) ||
        w.master.includes(q)
      );
    });
  }, [q, pf]);

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
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              ORDERS · workorder
            </p>
            <h1 className="font-display text-[28px] font-medium tracking-tight">
              打样工艺
            </h1>
            <p className="mt-1.5 text-[13px] text-[var(--ink-dim)] max-w-[520px]">
              工艺配方：机 + 纱 + 排 + 染 + 缝。从此告别老师傅脑子里的工艺本。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">导出本周工艺</Button>
            <Button variant="default" size="md">+ 新建工艺</Button>
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
          <div className="grid grid-cols-[150px_70px_1fr_120px_70px_70px_70px_70px_70px_70px_70px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
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
              <div className="font-mono text-[11px] font-medium text-[var(--ink)]">
                {w.docNo.replace("WO-2026-", "")}
              </div>
              <div className="text-[12px] text-[var(--ink-dim)] truncate">{w.customer}</div>
              <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                {w.product}
              </div>
              <div className="font-mono text-[11px] text-[var(--ink-dim)] truncate">{w.machine}</div>
              <div className="text-right font-mono tnum text-[12px]">{w.needle}</div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink)]">{w.gsm}</div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink-dim)]">{w.rotateRpm}</div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink-dim)]">{w.stitchTime}</div>
              <div className="text-right">
                <NumChip
                  value={`${w.yamLoss}%`}
                  tone={w.yamLoss > 8 ? "danger" : w.yamLoss > 6 ? "warn" : "neutral"}
                />
              </div>
              <div className="font-mono text-[11px] text-[var(--ink-dim)] truncate">{w.yarn}</div>
              <div>
                <Badge tone={STATUS_TONE[w.status]} size="sm">{w.status}</Badge>
              </div>
              <div className="text-[11px] font-mono text-[var(--ink-mute)]">{w.updated}</div>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
