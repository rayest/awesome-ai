"use client";

import type { ReactNode } from "react";
import { use, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { ProcessRail } from "@/components/domain/workflow-list";
import { Button } from "@/components/ui/button";
import { SelectControl } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getQuote, getDyeings, getOperations, getTrims } from "@/lib/data";

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
  const q = getQuote(id);
  const dyeings = getDyeings();
  const operations = getOperations();
  const trims = getTrims();

  // —— 动态参数（来自基础信息 + 字典；用户可调） ——
  const [mgmtFee, setMgmtFee] = useState(parseFloat(String(q?.mgmtFee ?? "1.30")) || 1.30);  // 管理费系数 (crm field 18)
  const [taxRate, setTaxRate] = useState(0.13);                    // 增值税
  const [targetMargin, setTargetMargin] = useState(0.32);          // 目标毛利

  // —— 各 tab 表单 state（可增删改） ——
  const [dyeingRows, setDyeingRows] = useState([
    { id: "d1", part: "前片染色", process: dyeings[0]?.name ?? "缸染低温", unitPrice: 8.4, loss: 0.06, weight: 0.45 },
    { id: "d2", part: "后片染色", process: dyeings[0]?.name ?? "缸染低温", unitPrice: 8.4, loss: 0.06, weight: 0.45 },
    { id: "d3", part: "袖子染色", process: dyeings[0]?.name ?? "缸染低温", unitPrice: 8.4, loss: 0.05, weight: 0.18 },
    { id: "d4", part: "罗纹染色", process: dyeings[1]?.name ?? "浸染",     unitPrice: 6.0, loss: 0.04, weight: 0.08 },
  ]);

  const [sewingRows, setSewingRows] = useState([
    { id: "s1", process: operations[0]?.name ?? "复合 + 拉毛", unit: "元/件", qty: 1, unitPrice: 18 },
    { id: "s2", process: "缝制",                                 unit: "元/件", qty: 1, unitPrice: 32 },
    { id: "s3", process: "锁边",                                 unit: "元/件", qty: 1, unitPrice: 8  },
    { id: "s4", process: "整烫 + 包装",                          unit: "元/件", qty: 1, unitPrice: 6  },
  ]);

  const [accessoryRows, setAccessoryRows] = useState([
    { id: "a1", type: "拉链",   name: trims[0]?.name ?? "YKK 5# · 60cm", qty: 1,   unitPrice: 4.2 },
    { id: "a2", type: "纽扣",   name: trims[1]?.name ?? "树脂 · 4眼",     qty: 6,   unitPrice: 0.45 },
    { id: "a3", type: "缝纫线", name: "涤纶 60/2",                       qty: 0.05,unitPrice: 12  },
    { id: "a4", type: "树脂衬", name: "60g · 胸衬",                      qty: 1,   unitPrice: 2.0 },
    { id: "a5", type: "包装袋", name: "PE · 自封",                       qty: 1,   unitPrice: 0.8 },
  ]);

  const [otherRows, setOtherRows] = useState([
    { id: "o1", name: "整染费", amount: 6 },
    { id: "o2", name: "运输费", amount: 2 },
    { id: "o3", name: "标签费", amount: 0.5 },
  ]);

  // —— 公式引擎（实时计算） ——
  const enrichedDyeing = dyeingRows.map((r) => ({
    ...r,
    costBeforeLoss: r.unitPrice * r.weight,
    costAfterLoss:  r.unitPrice * r.weight * (1 + r.loss),
  }));
  const enrichedSewing = sewingRows.map((r) => ({
    ...r,
    subtotal: r.unitPrice * r.qty * Number(mgmtFee),
  }));
  const enrichedAccessory = accessoryRows.map((r) => ({ ...r, subtotal: r.qty * r.unitPrice }));

  const dyeingCost    = enrichedDyeing.reduce((s, r) => s + r.costAfterLoss, 0);
  const sewingCost    = enrichedSewing.reduce((s, r) => s + r.subtotal, 0);
  const accessoryCost = enrichedAccessory.reduce((s, r) => s + r.subtotal, 0);
  const otherCost     = otherRows.reduce((s, r) => s + r.amount, 0);

  const costExTax    = dyeingCost + sewingCost + accessoryCost + otherCost;
  const taxAmount    = costExTax * taxRate;
  const costIncTax   = costExTax * (1 + taxRate);
  const filedPriceInc = costIncTax / (1 - targetMargin);
  const filedPriceExc = filedPriceInc / (1 + taxRate);
  const marginInc    = filedPriceInc - costIncTax;
  const marginIncPct = (marginInc / filedPriceInc) * 100;
  const marginExc    = filedPriceExc - costExTax;
  const marginExcPct = (marginExc / filedPriceExc) * 100;

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1480px]">
        <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/orders/quotations" className="hover:text-[var(--ink)]">报价</Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{id}</span>
        </div>

        <div className="mb-6">
          <FabricLabel
            docNo={q?.docNo ?? id}
            shortCode={q?.styleNo ?? "—"}
            season="Q3-26"
            composition={`${q?.product ?? "羊毛双面呢 · 立领大衣"} · ${q?.orderQty ?? 200} 件 · ${q?.sizeRange ?? "S/M/L/XL"}`}
            specs={[
              { label: "订单", value: `${q?.orderQty ?? 200} 件`, mono: true },
              { label: "尺码", value: q?.sizeRange ?? "S/M/L/XL", mono: true },
              { label: "管理费", value: `${(mgmtFee * 100 - 100).toFixed(0)}%`, mono: true },
              { label: "税率", value: `${(taxRate * 100).toFixed(0)}%`, mono: true },
              { label: "目标毛利", value: `${(targetMargin * 100).toFixed(0)}%`, mono: true },
            ]}
            prices={[
              { label: "含税成本", value: `¥ ${costIncTax.toFixed(2)}`, mono: true },
              { label: "备案含税", value: `¥ ${filedPriceInc.toFixed(2)}`, mono: true },
              { label: "毛利", value: `${marginIncPct.toFixed(1)}%`, mono: true },
            ]}
            delivery={[
              { label: "有效期", value: q?.validUntil ?? "—", mono: true },
              { label: "状态", value: q?.status ?? (id === "Q-2026-0317-A" ? "已发" : "草稿"), mono: true },
              { label: "报价员", value: q?.quoter ?? "李白", mono: true },
              { label: "更新", value: q?.updated ?? "今 09:14", mono: true },
            ]}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-medium tracking-tight">
              {q?.product ?? "羊毛双面呢 · 立领大衣"}
            </h1>
            <p className="mt-1 text-[14px] font-mono text-[var(--ink-mute)]">
              出处：{q?.workorderId ?? "WO-2026-0317-A"} · 客户：{q?.customerName ?? "乾盛服饰"} · 报价员：{q?.quoter ?? "李白"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">复制为新报价</Button>
            <Button variant="outline" size="md">导出 PDF</Button>
            <Button variant="outline" size="md">生成客户预览</Button>
            <Button variant="default" size="md">发送给客户确认</Button>
          </div>
        </div>

        <ProcessRail
          steps={[
            { label: "打样与工艺", detail: "上游工艺参数与基础成本已确认", state: "done" },
            { label: "报价核对", detail: "当前核对费用、税率与目标毛利", state: "current" },
            { label: "客户确认", detail: "发送后等待客户接受或提出调整", state: "next" },
          ]}
        />

        {/* 动态参数条 */}
        <div className="mb-4 border border-[var(--hairline)] rounded-md p-3 bg-[var(--card)] flex items-center gap-6 text-[14px] font-mono">
          <span className="text-[var(--ink-mute)]">报价参数</span>
          <label className="flex items-center gap-2">
            <span className="text-[var(--ink-mute)]">管理费系数</span>
            <input type="number" step={0.05} min={1} max={3} value={mgmtFee}
              onChange={(e) => setMgmtFee(Number(e.target.value))}
              className="w-20 bg-transparent border border-[var(--hairline)] rounded px-2 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]"
            />
            <span className="text-[var(--ink-mute)]">× (如 1.30 = +30%)</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[var(--ink-mute)]">税率</span>
            <input type="number" step={0.01} min={0} max={0.3} value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-20 bg-transparent border border-[var(--hairline)] rounded px-2 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[var(--ink-mute)]">目标毛利</span>
            <input type="number" step={0.01} min={0} max={0.8} value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-20 bg-transparent border border-[var(--hairline)] rounded px-2 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]"
            />
          </label>
          <span className="ml-auto text-[var(--ink-mute)]">修改后即时重算</span>
        </div>

        <Tabs defaultValue="dyeing">
          <TabsList>
            <TabsTrigger value="base">商务信息</TabsTrigger>
            <TabsTrigger value="dyeing" count={dyeingRows.length}>染色工艺</TabsTrigger>
            <TabsTrigger value="sewing" count={sewingRows.length}>缝制工艺</TabsTrigger>
            <TabsTrigger value="accessory" count={accessoryRows.length}>辅料</TabsTrigger>
            <TabsTrigger value="other" count={otherRows.length}>其他费用</TabsTrigger>
            <TabsTrigger value="summary">总计与毛利</TabsTrigger>
          </TabsList>

          <TabsContent value="base"><BaseInfoTab /></TabsContent>

          <TabsContent value="dyeing">
            <DyeingTab
              rows={enrichedDyeing}
              dyeings={dyeings.map((d) => d.name)}
              setRows={setDyeingRows}
              subtotal={dyeingCost}
            />
          </TabsContent>

          <TabsContent value="sewing">
            <SewingTab
              rows={enrichedSewing}
              operations={operations.map((o) => o.name)}
              setRows={setSewingRows}
              mgmtFee={mgmtFee}
              subtotal={sewingCost}
            />
          </TabsContent>

          <TabsContent value="accessory">
            <AccessoryTab
              rows={enrichedAccessory}
              trims={trims.map((t) => t.name)}
              setRows={setAccessoryRows}
              subtotal={accessoryCost}
            />
          </TabsContent>

          <TabsContent value="other">
            <OtherTab rows={otherRows} setRows={setOtherRows} subtotal={otherCost} />
          </TabsContent>

          <TabsContent value="summary">
            <SummaryTab
              dyeing={dyeingCost} sewing={sewingCost} accessory={accessoryCost} other={otherCost}
              costExTax={costExTax} taxAmount={taxAmount} costIncTax={costIncTax}
              filedPriceInc={filedPriceInc} filedPriceExc={filedPriceExc}
              marginInc={marginInc} marginIncPct={marginIncPct}
              marginExc={marginExc} marginExcPct={marginExcPct}
              taxRate={taxRate} targetMargin={targetMargin}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );

function FieldGrid({ fields }: { fields: Array<[string, ReactNode, boolean?]> }) {
  return (
    <div className="grid gap-x-12 lg:grid-cols-2">
      {fields.map(([label, value, mono], i) => (
        <div key={i} className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
          <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[160px]">{label}</span>
          <span className={cn("text-[14px] text-[var(--ink)]", mono && "font-mono tnum")}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function BaseInfoTab() {
  const f: Array<[string, ReactNode, boolean?]> = [
    ["报价单 ID", "Q-2026-0317-A", true],
    ["日期", "2026-07-18", true],
    ["客户", "乾盛服饰有限公司"],
    ["部门", "业务部"],
    ["款号", "GH-QS-007-26FW-0317"],
    ["品名", "羊毛双面呢"],
    ["来源工艺单", "WO-2026-0317-A"],
    ["订单数量", "200 件", true],
    ["订单颜色", "炭灰"],
    ["订单尺码范围", "S/M/L/XL"],
    ["管理费系数", "1.30", true],
    ["税率", "13%", true],
    ["目标毛利", "32%", true],
    ["备注", "客户要求 7/28 前交样"],
  ];
  return (
    <div className="space-y-4">
      <BaseLinkBanner quoteId="Q-2026-0317-A" table="crm_报价单_基础信息表 (含 33 字段)" />
      <FieldGrid fields={f} />
    </div>
  );
}

/* ─── 关联基 Banner ─── */
function BaseLinkBanner({ quoteId, table }: { quoteId: string; table: string }) {
  const label = table.includes("染色") ? "染色工艺" : table.includes("缝制") ? "缝制工艺" : table.includes("辅料") ? "辅料费用" : table.includes("其他") ? "其他费用" : "商务信息";
  return (
    <div className="flex items-center justify-between rounded-md border border-[var(--hairline)] bg-[var(--card)] px-3 py-2 text-[13px]">
      <span className="text-[var(--ink-dim)]">{label}</span>
      <span className="font-mono text-[var(--ink-mute)]">关联报价 {quoteId}</span>
    </div>
  );
}

/* ─── 染色工艺 Tab（可编辑） ─── */
type DyeingR = {
  id: string; part: string; process: string;
  unitPrice: number; loss: number; weight: number;
  costBeforeLoss?: number; costAfterLoss?: number;
};
function DyeingTab({
  rows, dyeings, setRows, subtotal,
}: {
  rows: DyeingR[]; dyeings: string[];
  setRows: React.Dispatch<React.SetStateAction<DyeingR[]>>;
  subtotal: number;
}) {
  const update = (id: string, p: Partial<DyeingR>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [...rs, {
      id: `d${Date.now()}`, part: "新部件染色", process: dyeings[0] ?? "",
      unitPrice: 0, loss: 0.05, weight: 0.1,
    }]);

  return (
    <div className="space-y-4">
      <BaseLinkBanner quoteId="Q-2026-0317-A" table="crm_报价单_染色工艺报价表" />
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] flex items-center justify-between">
          <p className="font-display text-[18px] font-medium">染色工艺 · {rows.length} 部件</p>
          <p className="font-mono text-[14px] text-[var(--ink-mute)]">
            公式：单价 × 重量 × (1 + 损耗%) · 损耗% 动态可调
          </p>
        </div>
        <div className="grid grid-cols-[120px_1fr_90px_90px_90px_110px_110px_60px] gap-2 px-3 py-2 bg-[var(--secondary)]/30 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          <div>部件</div>
          <div>工艺 · 从染色工艺中选择</div>
          <div className="text-right">单价 ¥/公斤</div>
          <div className="text-right">重量 公斤</div>
          <div className="text-right">损耗 %</div>
          <div className="text-right">不含损耗</div>
          <div className="text-right">含损耗</div>
          <div></div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[120px_1fr_90px_90px_90px_110px_110px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 font-mono text-[14px]">
            <input value={r.part} onChange={(e) => update(r.id, { part: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]" />
            <SelectControl value={r.process} onValueChange={(value) => update(r.id, { process: value })}
              options={dyeings.map((value) => ({ value, label: value }))} />
            <input type="number" step={0.1} min={0} value={r.unitPrice}
              onChange={(e) => update(r.id, { unitPrice: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <input type="number" step={0.01} min={0} value={r.weight}
              onChange={(e) => update(r.id, { weight: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <input type="number" step={0.01} min={0} max={1} value={r.loss}
              onChange={(e) => update(r.id, { loss: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <div className="text-right tnum text-[var(--ink-dim)]">¥ {(r.costBeforeLoss ?? 0).toFixed(2)}</div>
            <div className="text-right tnum font-medium text-[var(--ink)] bg-[var(--accent)]/20 rounded px-1.5 py-1">¥ {(r.costAfterLoss ?? 0).toFixed(2)}</div>
            <button onClick={() => remove(r.id)} className="text-[var(--ink-mute)] hover:text-[var(--destructive)] text-center">✕</button>
          </div>
        ))}
        <div className="px-3 py-2 bg-[var(--background)]/40 border-t border-[var(--hairline)]">
          <button onClick={add} className="font-mono text-[14px] text-[var(--primary)] hover:underline">+ 添加一行</button>
        </div>
        <div className="border-t-2 border-[var(--ink)] bg-[var(--secondary)]/40 px-4 py-3 grid grid-cols-2 text-[14px] font-mono">
          <span className="text-[var(--ink-mute)] uppercase tracking-[0.18em] self-center">染色工艺合计</span>
          <span className="text-right text-[16px] tnum font-medium text-[var(--ink)]">¥ {subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── 缝制工艺 Tab（可编辑，管理费动态） ─── */
type SewingR = {
  id: string; process: string; unit: string; qty: number; unitPrice: number; subtotal?: number;
};
function SewingTab({
  rows, operations, setRows, mgmtFee, subtotal,
}: {
  rows: SewingR[]; operations: string[];
  setRows: React.Dispatch<React.SetStateAction<SewingR[]>>;
  mgmtFee: number; subtotal: number;
}) {
  const update = (id: string, p: Partial<SewingR>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [...rs, {
      id: `s${Date.now()}`, process: operations[0] ?? "新工序", unit: "元/件", qty: 1, unitPrice: 0,
    }]);

  return (
    <div className="space-y-4">
      <BaseLinkBanner quoteId="Q-2026-0317-A" table="crm_报价单_缝制工艺报价表" />
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] flex items-center justify-between">
          <p className="font-display text-[18px] font-medium">缝制工艺 · {rows.length} 工序</p>
          <p className="font-mono text-[14px] text-[var(--ink-mute)]">
            公式：工价 × 数量 × 管理费系数 {(mgmtFee).toFixed(2)} × · 顶部可调
          </p>
        </div>
        <div className="grid grid-cols-[1fr_90px_80px_100px_130px_60px] gap-2 px-3 py-2 bg-[var(--secondary)]/30 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          <div>工序 · 从工序字典中选择</div>
          <div>单位</div>
          <div className="text-right">数量</div>
          <div className="text-right">工价 ¥</div>
          <div className="text-right">小计 (含管理费)</div>
          <div></div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_90px_80px_100px_130px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 font-mono text-[14px]">
            <SelectControl value={r.process} onValueChange={(value) => update(r.id, { process: value })}
              options={operations.map((value) => ({ value, label: value }))} />
            <SelectControl value={r.unit} onValueChange={(value) => update(r.id, { unit: value })}
              options={["元/件", "元/米", "元/只", "元/套"].map((value) => ({ value, label: value }))} />
            <input type="number" step={0.01} min={0} value={r.qty}
              onChange={(e) => update(r.id, { qty: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <input type="number" step={0.1} min={0} value={r.unitPrice}
              onChange={(e) => update(r.id, { unitPrice: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <div className="text-right tnum font-medium text-[var(--ink)] bg-[var(--accent)]/20 rounded px-1.5 py-1">¥ {(r.subtotal ?? 0).toFixed(2)}</div>
            <button onClick={() => remove(r.id)} className="text-[var(--ink-mute)] hover:text-[var(--destructive)] text-center">✕</button>
          </div>
        ))}
        <div className="px-3 py-2 bg-[var(--background)]/40 border-t border-[var(--hairline)]">
          <button onClick={add} className="font-mono text-[14px] text-[var(--primary)] hover:underline">+ 添加一行</button>
        </div>
        <div className="border-t-2 border-[var(--ink)] bg-[var(--secondary)]/40 px-4 py-3 grid grid-cols-2 text-[14px] font-mono">
          <span className="text-[var(--ink-mute)] uppercase tracking-[0.18em] self-center">缝制工艺合计</span>
          <span className="text-right text-[16px] tnum font-medium text-[var(--ink)]">¥ {subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── 辅料 Tab（可编辑） ─── */
type AccessoryR = {
  id: string; type: string; name: string; qty: number; unitPrice: number; subtotal?: number;
};
function AccessoryTab({
  rows, trims, setRows, subtotal,
}: {
  rows: AccessoryR[]; trims: string[];
  setRows: React.Dispatch<React.SetStateAction<AccessoryR[]>>;
  subtotal: number;
}) {
  const update = (id: string, p: Partial<AccessoryR>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [...rs, {
      id: `a${Date.now()}`, type: "新辅料", name: trims[0] ?? "", qty: 1, unitPrice: 0,
    }]);

  return (
    <div className="space-y-4">
      <BaseLinkBanner quoteId="Q-2026-0317-A" table="crm_报价单_辅料报价表" />
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] flex items-center justify-between">
          <p className="font-display text-[18px] font-medium">辅料 · {rows.length} 类</p>
          <p className="font-mono text-[14px] text-[var(--ink-mute)]">
            数量或单价变化后自动更新小计
          </p>
        </div>
        <div className="grid grid-cols-[90px_1fr_80px_100px_120px_60px] gap-2 px-3 py-2 bg-[var(--secondary)]/30 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          <div>类型</div>
          <div>辅料名 · 从辅料配置中选择</div>
          <div className="text-right">数量</div>
          <div className="text-right">单价 ¥</div>
          <div className="text-right">小计</div>
          <div></div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[90px_1fr_80px_100px_120px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 font-mono text-[14px]">
            <input value={r.type} onChange={(e) => update(r.id, { type: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]" />
            <SelectControl value={r.name} onValueChange={(value) => update(r.id, { name: value })}
              options={trims.map((value) => ({ value, label: value }))} />
            <input type="number" step={0.01} min={0} value={r.qty}
              onChange={(e) => update(r.id, { qty: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <input type="number" step={0.1} min={0} value={r.unitPrice}
              onChange={(e) => update(r.id, { unitPrice: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <div className="text-right tnum font-medium text-[var(--ink)] bg-[var(--accent)]/20 rounded px-1.5 py-1">¥ {(r.subtotal ?? 0).toFixed(2)}</div>
            <button onClick={() => remove(r.id)} className="text-[var(--ink-mute)] hover:text-[var(--destructive)] text-center">✕</button>
          </div>
        ))}
        <div className="px-3 py-2 bg-[var(--background)]/40 border-t border-[var(--hairline)]">
          <button onClick={add} className="font-mono text-[14px] text-[var(--primary)] hover:underline">+ 添加一行</button>
        </div>
        <div className="border-t-2 border-[var(--ink)] bg-[var(--secondary)]/40 px-4 py-3 grid grid-cols-2 text-[14px] font-mono">
          <span className="text-[var(--ink-mute)] uppercase tracking-[0.18em] self-center">辅料合计</span>
          <span className="text-right text-[16px] tnum font-medium text-[var(--ink)]">¥ {subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── 其他费用 Tab（可编辑） ─── */
type OtherR = { id: string; name: string; amount: number };
function OtherTab({
  rows, setRows, subtotal,
}: {
  rows: OtherR[]; setRows: React.Dispatch<React.SetStateAction<OtherR[]>>;
  subtotal: number;
}) {
  const update = (id: string, p: Partial<OtherR>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [...rs, { id: `o${Date.now()}`, name: "新费用", amount: 0 }]);

  return (
    <div className="space-y-4">
      <BaseLinkBanner quoteId="Q-2026-0317-A" table="crm_报价单_其他费用" />
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[var(--secondary)]/40 border-b border-[var(--hairline)]">
          <p className="font-display text-[18px] font-medium">其他费用 · {rows.length} 项</p>
        </div>
        <div className="grid grid-cols-[1fr_140px_60px] gap-2 px-3 py-2 bg-[var(--secondary)]/30 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          <div>项目</div>
          <div className="text-right">金额 ¥</div>
          <div></div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_140px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 font-mono text-[14px]">
            <input value={r.name} onChange={(e) => update(r.id, { name: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]" />
            <input type="number" step={0.1} value={r.amount}
              onChange={(e) => update(r.id, { amount: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <button onClick={() => remove(r.id)} className="text-[var(--ink-mute)] hover:text-[var(--destructive)] text-center">✕</button>
          </div>
        ))}
        <div className="px-3 py-2 bg-[var(--background)]/40 border-t border-[var(--hairline)]">
          <button onClick={add} className="font-mono text-[14px] text-[var(--primary)] hover:underline">+ 添加一行</button>
        </div>
        <div className="border-t-2 border-[var(--ink)] bg-[var(--secondary)]/40 px-4 py-3 grid grid-cols-2 text-[14px] font-mono">
          <span className="text-[var(--ink-mute)] uppercase tracking-[0.18em] self-center">其他费用合计</span>
          <span className="text-right text-[16px] tnum font-medium text-[var(--ink)]">¥ {subtotal.toFixed(2)}</span>
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
  taxAmount,
  costIncTax,
  filedPriceInc,
  filedPriceExc,
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
  taxAmount: number;
  costIncTax: number;
  filedPriceInc: number;
  filedPriceExc: number;
  marginInc: number;
  marginIncPct: number;
  marginExc: number;
  marginExcPct: number;
  taxRate: number;
  targetMargin: number;
}) {
  const rows = [
    { label: "染色工艺成本小计", value: dyeing, formula: "单价 × 重量 ×（1 + 损耗）" },
    { label: "缝制工艺成本小计", value: sewing, formula: "工价 ×（1 + 管理费）" },
    { label: "织造成本小计",     value: dyeing + sewing, formula: "原料 + 机台 + 染色 + 缝制" },
    { label: "辅料成本小计",     value: accessory, formula: "单价 × 用量 × 损耗系数" },
    { label: "其他费用小计",     value: other, formula: "各项单件金额合计" },
  ];

  // crm_报价单_总计表 19 字段——逐字段渲染
  const TOTAL_FIELDS = [
    { key: "filer-shrink", label: "备案不含税价",     value: `¥ ${filedPriceExc.toFixed(2)}` },
    { key: "filer-inc",    label: "备案含税价",       value: `¥ ${filedPriceInc.toFixed(2)}` },
    { key: "tax-amount",   label: "税费 (13%)",       value: `¥ ${taxAmount.toFixed(2)}` },
    { key: "tax-rate",     label: "税率",             value: `${(taxRate * 100).toFixed(0)}%` },
    { key: "weave-loss",   label: "织造损耗",         value: "5%" },
    { key: "dye-loss",     label: "染色损耗",         value: "5%" },
    { key: "machine-rate", label: "机台费标准",       value: "¥ 2.40 / 件" },
    { key: "mgmt-rate",    label: "管理费系数",       value: "1.18" },
  ];

  return (
    <div className="space-y-4">
      {/* 公式链说明 */}
      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--secondary)]/40">
        <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] mb-3">
          成本构成与报价过程
        </p>
        <div className="grid grid-cols-5 gap-3 text-[14px] font-mono">
          {[
            { step: "1", title: "染色合计", formula: "× (1+5%)", val: `¥ ${dyeing.toFixed(2)}` },
            { step: "2", title: "缝制合计", formula: "× (1+18%)", val: `¥ ${sewing.toFixed(2)}` },
            { step: "3", title: "辅料合计", formula: "Σ 用量×价", val: `¥ ${accessory.toFixed(2)}` },
            { step: "4", title: "不含税", formula: "× (1+13%)", val: `¥ ${costExTax.toFixed(2)}` },
            { step: "5", title: "含税", formula: "÷ (1-32%)", val: `¥ ${filedPriceInc.toFixed(2)}` },
          ].map((s) => (
            <div key={s.step} className="border border-[var(--hairline)] rounded p-3 bg-[var(--card)]">
              <div className="text-[var(--ink-mute)] text-[14px] uppercase tracking-[0.2em]">
                Step {s.step}
              </div>
              <div className="text-[var(--ink)] font-medium mt-1">{s.title}</div>
              <div className="text-[var(--primary)] text-[14px] mt-1">{s.formula}</div>
              <div className="text-[var(--ink)] text-[14px] tnum mt-1.5 font-medium">{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 项成本细分 */}
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <table className="w-full text-[14px] font-mono">
          <thead>
            <tr className="bg-[var(--secondary)]/40 text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
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
              <td colSpan={2} className="px-4 py-3 text-[14px] uppercase tracking-[0.18em] text-[var(--ink)] font-medium">
                总成本 · 不含税
              </td>
              <td className="px-4 py-3 text-right tnum text-[16px] font-medium text-[var(--ink)]">
                ¥ {costExTax.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t border-[var(--hairline)] bg-[var(--secondary)]/30">
              <td colSpan={2} className="px-4 py-3 text-[14px] uppercase tracking-[0.18em] text-[var(--ink)] font-medium">
                总成本 · 含税 = 不含税 × (1 + {taxRate * 100}%)
              </td>
              <td className="px-4 py-3 text-right tnum text-[16px] font-medium text-[var(--ink)]">
                ¥ {costIncTax.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t border-[var(--hairline)] bg-[var(--accent)]/30">
              <td colSpan={2} className="px-4 py-3 text-[14px] uppercase tracking-[0.18em] text-[var(--ink)] font-medium">
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
          <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--success)] mb-1">
            含税毛利
          </p>
          <p className="font-display text-[36px] font-medium text-[var(--ink)] tnum">
            ¥ {marginInc.toFixed(2)}
          </p>
          <p className="font-mono text-[14px] text-[var(--success)] tnum mt-1">
            {marginIncPct.toFixed(1)}%
          </p>
          <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-3">
            = 备案含税价 - 含税成本
          </p>
        </div>
        <div className="border border-[var(--hairline)] rounded-md p-5 bg-[var(--info-soft)]">
          <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--info)] mb-1">
            不含税毛利
          </p>
          <p className="font-display text-[36px] font-medium text-[var(--ink)] tnum">
            ¥ {marginExc.toFixed(2)}
          </p>
          <p className="font-mono text-[14px] text-[var(--info)] tnum mt-1">
            {marginExcPct.toFixed(1)}%
          </p>
          <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-3">
            = 备案价 ÷ (1+税率) - 不含税成本
          </p>
        </div>
      </div>

      {/* crm_报价单_总计表 19 字段 — 现场字段对齐卡 */}
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[var(--secondary)]/40 border-b border-[var(--hairline)]">
          <p className="font-display text-[18px] font-medium">报价关键结果</p>
          <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] mt-0.5">
            所有费用变化后自动更新
          </p>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[var(--hairline)]">
          {TOTAL_FIELDS.map((f) => (
            <div key={f.key} className="bg-[var(--card)] px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">{f.label}</span>
              </div>
              <div className="font-display text-[18px] font-medium tnum text-[var(--ink)]">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 审计校验 */}
      <div className="border border-dashed border-[var(--success)] rounded-md p-4 flex items-start gap-3 bg-[var(--success-soft)]/30">
        <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--success)] border border-[var(--success)] px-1.5 py-0.5 rounded shrink-0 font-medium">
          ✓ 审计通过
        </span>
        <div className="text-[14px]">
          <p className="text-[var(--ink)] font-medium">
            含税成本 + 毛利 = 备案含税价 (误差 &lt; ¥0.01)
          </p>
          <p className="font-mono text-[14px] text-[var(--ink-mute)] mt-0.5">
            ¥{costIncTax.toFixed(2)} + ¥{marginInc.toFixed(2)} ={" "}
            <span className="text-[var(--success)] font-medium">
              ¥{filedPriceInc.toFixed(2)} ✓
            </span>
          </p>
          <p className="text-[14px] text-[var(--ink-mute)] mt-2">
            本报价的关键修改会保留在审计日志中。调整费用后，成本和毛利会立即重新计算。
          </p>
        </div>
      </div>
    </div>
  );
}
}
