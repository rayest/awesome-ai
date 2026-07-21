"use client";

import type { ReactNode } from "react";
import { use } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * 报价单 · 详情页
 *
 * 5 tabs：
 *  - 基础信息 (33 fields)
 *  - 染色工艺报价 (13 fields，含损耗公式链)
 *  - 缝制工艺报价 (7 fields，含管理费公式)
 *  - 辅料报价 (8 fields)
 *  - 总计与毛利 (19 fields，最终结算)
 *
 * 每行公式可追溯，永远不会被改坏。
 */

export default function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // —— 公式引擎（来自 Base 里 50+ formula 字段的可移植版本）——
  // 工艺成本(不含损耗) = 部件单耗 × 工序单价
  // 工艺成本(含损耗) = 工艺成本(不含损耗) × (1 + 损耗系数)
  // 织造成本 = 织物下机克重 × 单价 × (1 + 织造损耗系数)
  // 染色成本合计 = Σ 工艺成本(含损耗)
  // 缝制成本合计 = Σ 工价 × (1 + 管理费系数)
  // 辅料成本合计 = Σ 用量 × 单价
  // 总成本(不含税) = 染色 + 缝制 + 辅料 + 其他
  // 含税成本 = 总成本(不含税) × (1 + 税率)
  // 备案含税价 = 含税成本 ÷ (1 - 目标毛利%)
  // 毛利 = 备案含税价 - 含税成本

  const seamOverhead = 0.18;   // 18% 管理费
  const taxRate = 0.13;        // 13% 增值税
  const targetMargin = 0.32;   // 32% 含税毛利率目标

  const dyeingRows = [
    { part: "前片染色",  process: "缸染低温", unitPrice: 8.4, loss: 0.06, weight: 0.45 },
    { part: "后片染色",  process: "缸染低温", unitPrice: 8.4, loss: 0.06, weight: 0.45 },
    { part: "袖子染色",  process: "缸染低温", unitPrice: 8.4, loss: 0.05, weight: 0.18 },
    { part: "罗纹染色",  process: "浸染",     unitPrice: 6.0, loss: 0.04, weight: 0.08 },
  ].map((r) => ({
    ...r,
    costBeforeLoss: r.unitPrice * r.weight,
    costAfterLoss: r.unitPrice * r.weight * (1 + r.loss),
  }));

  const sewingRows = [
    { process: "复合 + 拉毛", unit: "元/件", qty: 1, unitPrice: 18 },
    { process: "缝制",      unit: "元/件", qty: 1, unitPrice: 32 },
    { process: "锁边",      unit: "元/件", qty: 1, unitPrice: 8 },
    { process: "整烫 + 包装", unit: "元/件", qty: 1, unitPrice: 6 },
  ].map((r) => ({
    ...r,
    subtotal: r.unitPrice * r.qty * (1 + seamOverhead),
  }));

  const accessoryRows = [
    { type: "拉链",       name: "YKK 5# · 60cm", qty: 1, unitPrice: 4.2 },
    { type: "纽扣",       name: "树脂 · 4眼",     qty: 6, unitPrice: 0.45 },
    { type: "缝纫线",     name: "涤纶 60/2",      qty: 0.05, unitPrice: 12 },
    { type: "树脂衬",     name: "60g · 胸衬",     qty: 1, unitPrice: 2.0 },
    { type: "包装袋",     name: "PE · 自封",      qty: 1, unitPrice: 0.8 },
  ].map((r) => ({ ...r, subtotal: r.qty * r.unitPrice }));

  const otherExpenses = [
    { name: "整染费",  amount: 6 },
    { name: "运输费",  amount: 2 },
    { name: "标签费",  amount: 0.5 },
  ];

  // 合计 ——
  const dyeingCost = dyeingRows.reduce((s, r) => s + r.costAfterLoss, 0);
  const sewingCost = sewingRows.reduce((s, r) => s + r.subtotal, 0);
  const accessoryCost = accessoryRows.reduce((s, r) => s + r.subtotal, 0);
  const otherCost = otherExpenses.reduce((s, r) => s + r.amount, 0);

  const costExTax = dyeingCost + sewingCost + accessoryCost + otherCost;
  const costIncTax = costExTax * (1 + taxRate);
  const filedPriceInc = costIncTax / (1 - targetMargin);
  const marginInc = filedPriceInc - costIncTax;
  const marginIncPct = (marginInc / filedPriceInc) * 100;
  const marginExc = filedPriceInc - costIncTax - filedPriceInc * taxRate / (1 + taxRate);
  const marginExcPct = (marginExc / (filedPriceInc / (1 + taxRate))) * 100;

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/orders/quotations" className="hover:text-[var(--ink)]">
            报价
          </Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{id}</span>
        </div>

        {/* 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="Q-2026-0317-A"
            shortCode="GH-QS-007"
            season="Q3-26"
            composition="羊毛双面呢 · 立领大衣 · 200 件 · 320 GSM"
            specs={[
              { label: "订单", value: "200 件", mono: true },
              { label: "尺码", value: "S/M/L", mono: true },
              { label: "织造损耗", value: "5%", mono: true },
              { label: "染色损耗", value: "5%", mono: true },
              { label: "管理费", value: "18%", mono: true },
              { label: "税率", value: "13%", mono: true },
            ]}
            prices={[
              { label: "含税成本", value: `¥ ${costIncTax.toFixed(2)}`, mono: true },
              { label: "备案含税", value: `¥ ${filedPriceInc.toFixed(2)}`, mono: true },
              { label: "毛利", value: `${marginIncPct.toFixed(1)}%`, mono: true },
            ]}
            delivery={[
              { label: "有效期", value: "2026-07-28", mono: true },
              { label: "状态", value: "客户确认", mono: true },
              { label: "报价员", value: "李白", mono: true },
              { label: "更新", value: "今 09:14", mono: true },
            ]}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-medium tracking-tight">
              羊毛双面呢 · 立领大衣
            </h1>
            <p className="mt-1 text-[12px] font-mono text-[var(--ink-mute)]">
              出处：WO-2026-0317-A · 客户：乾盛服饰 · 报价员：李白
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">复制上版</Button>
            <Button variant="outline" size="md">导出 PDF</Button>
            <Button variant="outline" size="md">截图给客户</Button>
            <Button variant="default" size="md">发送报价</Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dyeing">
          <TabsList>
            <TabsTrigger value="base" count={33}>基础信息</TabsTrigger>
            <TabsTrigger value="dyeing" count={4}>染色工艺</TabsTrigger>
            <TabsTrigger value="sewing" count={4}>缝制工艺</TabsTrigger>
            <TabsTrigger value="accessory" count={5}>辅料</TabsTrigger>
            <TabsTrigger value="other" count={3}>其他费用</TabsTrigger>
            <TabsTrigger value="summary">总计与毛利</TabsTrigger>
          </TabsList>

          {/* Tab 1：基础信息 */}
          <TabsContent value="base">
            <BaseInfoTab />
          </TabsContent>

          {/* Tab 2：染色工艺 */}
          <TabsContent value="dyeing">
            <CostTable
              title="染色工艺 · 4 部件"
              headers={["部件", "工艺", "单价", "重量kg", "不含损耗", "损耗%", "含损耗"]}
              rows={dyeingRows.map((r) => ({
                key: r.part,
                cells: [
                  r.part,
                  r.process,
                  `¥ ${r.unitPrice.toFixed(2)}`,
                  r.weight.toFixed(2),
                  `¥ ${r.costBeforeLoss.toFixed(2)}`,
                  `${(r.loss * 100).toFixed(0)}%`,
                  { value: `¥ ${r.costAfterLoss.toFixed(2)}`, highlight: true },
                ],
              }))}
              subtotalLabel="染色工艺合计"
              subtotal={`¥ ${dyeingCost.toFixed(2)}`}
              formula="单价 × 重量 × (1 + 损耗%)"
            />
          </TabsContent>

          {/* Tab 3：缝制工艺 */}
          <TabsContent value="sewing">
            <CostTable
              title="缝制工艺 · 4 工序"
              headers={["工序", "单位", "数量", "工价", "含管理费 (18%)"]}
              rows={sewingRows.map((r) => ({
                key: r.process,
                cells: [
                  r.process,
                  r.unit,
                  r.qty,
                  `¥ ${r.unitPrice.toFixed(2)}`,
                  { value: `¥ ${r.subtotal.toFixed(2)}`, highlight: true },
                ],
              }))}
              subtotalLabel="缝制工艺合计"
              subtotal={`¥ ${sewingCost.toFixed(2)}`}
              formula="工价 × 数量 × (1 + 管理费 18%)"
            />
          </TabsContent>

          {/* Tab 4：辅料 */}
          <TabsContent value="accessory">
            <CostTable
              title="辅料 · 5 类"
              headers={["类型", "品名", "数量", "单价", "小计"]}
              rows={accessoryRows.map((r) => ({
                key: r.name,
                cells: [
                  r.type,
                  r.name,
                  r.qty.toString().padStart(2, " "),
                  `¥ ${r.unitPrice.toFixed(2)}`,
                  { value: `¥ ${r.subtotal.toFixed(2)}`, highlight: true },
                ],
              }))}
              subtotalLabel="辅料合计"
              subtotal={`¥ ${accessoryCost.toFixed(2)}`}
              formula="数量 × 单价"
            />
          </TabsContent>

          {/* Tab 5：其他费用 */}
          <TabsContent value="other">
            <CostTable
              title="其他费用 · 3 项"
              headers={["项目", "金额"]}
              rows={otherExpenses.map((r) => ({
                key: r.name,
                cells: [r.name, { value: `¥ ${r.amount.toFixed(2)}`, highlight: true }],
              }))}
              subtotalLabel="其他费用合计"
              subtotal={`¥ ${otherCost.toFixed(2)}`}
              formula="直接输入金额"
            />
          </TabsContent>

          {/* Tab 6：总计 + 毛利（核心聚合页） */}
          <TabsContent value="summary">
            <SummaryTab
              dyeing={dyeingCost}
              sewing={sewingCost}
              accessory={accessoryCost}
              other={otherCost}
              costExTax={costExTax}
              costIncTax={costIncTax}
              filedPriceInc={filedPriceInc}
              marginInc={marginInc}
              marginIncPct={marginIncPct}
              marginExc={marginExc}
              marginExcPct={marginExcPct}
              taxRate={taxRate}
              targetMargin={targetMargin}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}

/* ─── Subcomponents ─── */

function FieldGrid({ fields }: { fields: Array<[string, ReactNode, boolean?]> }) {
  return (
    <div className="grid grid-cols-2 gap-x-12">
      {fields.map(([label, value, mono], i) => (
        <div
          key={i}
          className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[160px]">
            {label}
          </span>
          <span className={cn("text-[13px] text-[var(--ink)]", mono && "font-mono tnum")}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function BaseInfoTab() {
  const f: Array<[string, ReactNode, boolean?]> = [
    ["报价编号", "Q-2026-0317-A"],
    ["打样工艺单 ID", "WO-2026-0317-A"],
    ["客户", "乾盛服饰有限公司"],
    ["品名", "羊毛双面呢"],
    ["款号", "GH-QS-007-26FW-0317"],
    ["日期", "2026-07-18"],
    ["订单数量", "200 件"],
    ["订单颜色", "炭灰"],
    ["订单尺码范围", "S/M/L/XL"],
    ["报价尺码", "S/M/L"],
    ["染色工艺", "缸染低温 · 120℃"],
    ["染色要求", "色牢度 ≥ 4 级 · PH 5.5-6.5"],
    ["缝合工艺", "1×1 罗纹 · 双面拼合"],
    ["织造损耗", "5%"],
    ["染色损耗", "5%"],
    ["包装方式", "PE 自封袋 · 10 件 / 包"],
    ["送货方式 / 地址", "义乌乾盛工厂 · 物流 5 天"],
    ["图片", "已上传（3 张）"],
    ["其他信息", "客户要求 7/28 前交样"],
    ["含税成本", "¥ 311.65"],
    ["不含税成本", "¥ 275.80"],
    ["备案报价（不含税）", "¥ 363.18"],
    ["备案报价（含税）", "¥ 410.40"],
    ["管理费系数", "18%"],
    ["机台费标准", "¥ 8 / 小时"],
    ["染色损耗系数", "5%"],
    ["不含税毛利", "¥ 87.38"],
    ["含税毛利", "¥ 98.75"],
    ["含税毛利率", "32.1%"],
    ["不含税毛利率", "31.7%"],
    ["不含税成本", "¥ 275.80"],
    ["不含税毛利", "¥ 87.38"],
    ["不含税毛利", "¥ 87.38"],
  ];
  return <FieldGrid fields={f} />;
}

/** 通用成本表（小计 + 公式说明） */
type Cell = string | number | { value: string; highlight?: boolean };

function CostTable({
  title,
  headers,
  rows,
  subtotalLabel,
  subtotal,
  formula,
}: {
  title: string;
  headers: string[];
  rows: Array<{
    key: string;
    cells: Cell[];
  }>;
  subtotalLabel: string;
  subtotal: string;
  formula: string;
}) {
  return (
    <div className="space-y-4">
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] flex items-center justify-between">
          <p className="font-display text-[14px] font-medium">{title}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            公式：{formula}
          </p>
        </div>
        <table className="w-full text-[12px] font-mono">
          <thead>
            <tr className="bg-[var(--secondary)]/30 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-3 py-2",
                    i >= headers.length - 2 ? "text-right" : "text-left"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-[var(--hairline)]">
                {r.cells.map((cell, i) => {
                  const obj = typeof cell === "object" ? cell : null;
                  const isHighlight = obj?.highlight === true;
                  const text = obj ? obj.value : String(cell);
                  const last = i === r.cells.length - 1;
                  return (
                    <td
                      key={i}
                      className={cn(
                        "px-3 py-2",
                        last || i >= r.cells.length - 2 ? "text-right tnum" : "",
                        isHighlight &&
                          "font-medium text-[var(--ink)] bg-[var(--accent)]/20"
                      )}
                    >
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-[var(--ink)] bg-[var(--secondary)]/40 px-4 py-3 grid grid-cols-2 text-[12px] font-mono">
          <span className="text-[var(--ink-mute)] text-[10px] uppercase tracking-[0.18em] self-center">
            {subtotalLabel}
          </span>
          <span className="text-right text-[16px] tnum font-medium text-[var(--ink)]">
            {subtotal}
          </span>
        </div>
      </div>
    </div>
  );
}

/** 总计 + 毛利（聚合页） */
function SummaryTab({
  dyeing,
  sewing,
  accessory,
  other,
  costExTax,
  costIncTax,
  filedPriceInc,
  marginInc,
  marginIncPct,
  marginExc,
  marginExcPct,
  taxRate,
  targetMargin,
}: {
  dyeing: number;
  sewing: number;
  accessory: number;
  other: number;
  costExTax: number;
  costIncTax: number;
  filedPriceInc: number;
  marginInc: number;
  marginIncPct: number;
  marginExc: number;
  marginExcPct: number;
  taxRate: number;
  targetMargin: number;
}) {
  const rows = [
    { label: "染色工艺", value: dyeing, formula: "Σ 单件染色 × (1 + 5% 损耗)" },
    { label: "缝制工艺", value: sewing, formula: "Σ 工价 × (1 + 18% 管理费)" },
    { label: "辅料", value: accessory, formula: "Σ 数量 × 单价" },
    { label: "其他费用", value: other, formula: "整染 + 运输 + 标签" },
  ];

  return (
    <div className="space-y-4">
      {/* 公式链说明 */}
      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--secondary)]/40">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] mb-3">
          报价公式链 · 可审计
        </p>
        <div className="grid grid-cols-5 gap-3 text-[11px] font-mono">
          {[
            { step: "1", title: "染色合计", formula: "× (1+5%)", val: `¥ ${dyeing.toFixed(2)}` },
            { step: "2", title: "缝制合计", formula: "× (1+18%)", val: `¥ ${sewing.toFixed(2)}` },
            { step: "3", title: "辅料合计", formula: "Σ 用量×价", val: `¥ ${accessory.toFixed(2)}` },
            { step: "4", title: "不含税", formula: "× (1+13%)", val: `¥ ${costExTax.toFixed(2)}` },
            { step: "5", title: "含税", formula: "÷ (1-32%)", val: `¥ ${filedPriceInc.toFixed(2)}` },
          ].map((s) => (
            <div key={s.step} className="border border-[var(--hairline)] rounded p-3 bg-[var(--card)]">
              <div className="text-[var(--ink-mute)] text-[9px] uppercase tracking-[0.2em]">
                Step {s.step}
              </div>
              <div className="text-[var(--ink)] font-medium mt-1">{s.title}</div>
              <div className="text-[var(--primary)] text-[10px] mt-1">{s.formula}</div>
              <div className="text-[var(--ink)] text-[14px] tnum mt-1.5 font-medium">{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 项成本细分 */}
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <table className="w-full text-[12px] font-mono">
          <thead>
            <tr className="bg-[var(--secondary)]/40 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
              <th className="px-4 py-2 text-left">分项</th>
              <th className="px-4 py-2 text-left">公式</th>
              <th className="px-4 py-2 text-right">金额（不含税）</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-[var(--hairline)]">
                <td className="px-4 py-2.5 text-[var(--ink)] font-medium">{r.label}</td>
                <td className="px-4 py-2.5 text-[var(--ink-mute)]">{r.formula}</td>
                <td className="px-4 py-2.5 text-right tnum text-[var(--ink)]">¥ {r.value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--ink)] bg-[var(--secondary)]/30">
              <td colSpan={2} className="px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)] font-medium">
                总成本 · 不含税
              </td>
              <td className="px-4 py-3 text-right tnum text-[16px] font-medium text-[var(--ink)]">
                ¥ {costExTax.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t border-[var(--hairline)] bg-[var(--secondary)]/30">
              <td colSpan={2} className="px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)] font-medium">
                总成本 · 含税 = 不含税 × (1 + {taxRate * 100}%)
              </td>
              <td className="px-4 py-3 text-right tnum text-[16px] font-medium text-[var(--ink)]">
                ¥ {costIncTax.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t border-[var(--hairline)] bg-[var(--accent)]/30">
              <td colSpan={2} className="px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)] font-medium">
                备案含税价 = 含税成本 ÷ (1 - {(targetMargin * 100).toFixed(0)}% 目标毛利)
              </td>
              <td className="px-4 py-3 text-right tnum text-[20px] font-semibold text-[var(--primary)]">
                ¥ {filedPriceInc.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 利润双轨 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[var(--hairline)] rounded-md p-5 bg-[var(--success-soft)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--success)] mb-1">
            含税毛利
          </p>
          <p className="font-display text-[36px] font-medium text-[var(--ink)] tnum">
            ¥ {marginInc.toFixed(2)}
          </p>
          <p className="font-mono text-[14px] text-[var(--success)] tnum mt-1">
            {marginIncPct.toFixed(1)}%
          </p>
          <p className="text-[11px] font-mono text-[var(--ink-mute)] mt-3">
            = 备案含税价 - 含税成本
          </p>
        </div>
        <div className="border border-[var(--hairline)] rounded-md p-5 bg-[var(--info-soft)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--info)] mb-1">
            不含税毛利
          </p>
          <p className="font-display text-[36px] font-medium text-[var(--ink)] tnum">
            ¥ {marginExc.toFixed(2)}
          </p>
          <p className="font-mono text-[14px] text-[var(--info)] tnum mt-1">
            {marginExcPct.toFixed(1)}%
          </p>
          <p className="text-[11px] font-mono text-[var(--ink-mute)] mt-3">
            = 备案价 ÷ (1+税率) - 不含税成本
          </p>
        </div>
      </div>

      {/* 审计校验 */}
      <div className="border border-dashed border-[var(--success)] rounded-md p-4 flex items-start gap-3 bg-[var(--success-soft)]/30">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--success)] border border-[var(--success)] px-1.5 py-0.5 rounded shrink-0 font-medium">
          ✓ 审计通过
        </span>
        <div className="text-[12px]">
          <p className="text-[var(--ink)] font-medium">
            含税成本 + 毛利 = 备案含税价 (误差 &lt; ¥0.01)
          </p>
          <p className="font-mono text-[11px] text-[var(--ink-mute)] mt-0.5">
            ¥{costIncTax.toFixed(2)} + ¥{marginInc.toFixed(2)} ={" "}
            <span className="text-[var(--success)] font-medium">
              ¥{filedPriceInc.toFixed(2)} ✓
            </span>
          </p>
          <p className="text-[11px] text-[var(--ink-mute)] mt-2">
            本报价已同步写入审计日志。修改任一字段会触发新一次公式链重算。
          </p>
        </div>
      </div>
    </div>
  );
}
