"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusDot, NumChip } from "@/components/domain/a-status";
import { fmtPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Material = {
  id: string;
  code: string;
  name: string;
  category: "纱线" | "面料" | "辅料";
  specs: string;
  twist: "S" | "Z";
  color: string;
  batch: string;
  supplier: string;
  unitPrice: number;
  unit: string;
  stock: number;
  lowStock: boolean;
};

const MOCK: Material[] = [
  { id: "1", code: "Y-2026-0073", name: "澳毛 80s", category: "纱线", specs: "2/48 Nm", twist: "S", color: "原色", batch: "B2408", supplier: "康赛妮", unitPrice: 420, unit: "kg", stock: 88, lowStock: false },
  { id: "2", code: "Y-2026-0142", name: "新疆长绒棉 60s", category: "纱线", specs: "32/1", twist: "Z", color: "本白", batch: "B2410", supplier: "溢达", unitPrice: 96, unit: "kg", stock: 240, lowStock: false },
  { id: "3", code: "Y-2026-0205", name: "天丝 LF", category: "纱线", specs: "30/1", twist: "Z", color: "原色", batch: "B2411", supplier: "兰精", unitPrice: 280, unit: "kg", stock: 12, lowStock: true },
  { id: "4", code: "Y-2026-0311", name: "抗起球腈纶", category: "纱线", specs: "32/2", twist: "S", color: "本白", batch: "B2409", supplier: "吉林化纤", unitPrice: 78, unit: "kg", stock: 380, lowStock: false },
  { id: "5", code: "Y-2026-0421", name: "莫代尔", category: "纱线", specs: "40/1", twist: "Z", color: "本白", batch: "B2410", supplier: "兰精", unitPrice: 168, unit: "kg", stock: 56, lowStock: false },
  { id: "6", code: "Y-2026-0503", name: "羊毛 / 腈纶 50/50", category: "纱线", specs: "28/2", twist: "S", color: "原色", batch: "B2407", supplier: "康赛妮", unitPrice: 198, unit: "kg", stock: 24, lowStock: true },
  { id: "7", code: "Y-2026-0618", name: "新疆长绒棉 80s", category: "纱线", specs: "60/1", twist: "Z", color: "本白", batch: "B2411", supplier: "溢达", unitPrice: 152, unit: "kg", stock: 156, lowStock: false },
  { id: "8", code: "Y-2026-0701", name: "丝光羊毛", category: "纱线", specs: "2/60 Nm", twist: "S", color: "本白", batch: "B2409", supplier: "康赛妮", unitPrice: 580, unit: "kg", stock: 42, lowStock: false },
];

const CATEGORIES = ["全部", "纱线", "面料", "辅料"] as const;
const STOCK_LOW = 30;

export default function MaterialsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("全部");

  const rows = useMemo(() => {
    return MOCK.filter((m) => {
      if (cat !== "全部" && m.category !== cat) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        m.name.toLowerCase().includes(lq) ||
        m.code.toLowerCase().includes(lq) ||
        m.supplier.toLowerCase().includes(lq)
      );
    });
  }, [q, cat]);

  const totals = useMemo(
    () => ({
      items: rows.length,
      lowStock: rows.filter((m) => m.lowStock).length,
      avgPrice: rows.length
        ? rows.reduce((s, r) => s + r.unitPrice, 0) / rows.length
        : 0,
    }),
    [rows]
  );

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 顶部 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="DICT-MATERIALS-2026-07-21"
            shortCode="qs-app"
            season="活跃"
            composition="8 款纱线 · 2 个低于安全库存 · 平均单价 ¥214/kg"
            specs={[
              { label: "物料", value: totals.items, mono: true },
              { label: "低库存", value: totals.lowStock, mono: true },
              { label: "供应商", value: 4, mono: true },
            ]}
            prices={[
              { label: "平均单价", value: `¥${fmtPrice(totals.avgPrice)}/kg`, mono: true },
              { label: "总价值", value: "¥ 280k", mono: true },
            ]}
          />
        </div>

        {/* 页头 */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              DICT · yarn
            </p>
            <h1 className="font-display text-[28px] font-medium tracking-tight">
              物料 / 纱线
            </h1>
            <p className="mt-1.5 text-[13px] text-[var(--ink-dim)] max-w-[520px]">
              所有纺纱/面料供应商与批次。报价单从这里取物料单价。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">
              同步供应商
            </Button>
            <Button variant="default" size="md">
              + 新增物料
            </Button>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="flex items-center gap-3 mb-3">
          <Input
            placeholder="搜纱线名 / 编码 / 供应商..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "h-9 px-3 rounded-md text-[12px] transition-colors font-mono tracking-tight",
                  cat === c
                    ? "bg-[var(--ink)] text-[var(--background)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[11px] font-mono text-[var(--ink-mute)]">
            <span>显示</span>
            <span className="text-[var(--ink)] tnum">{rows.length}</span>
            <span>/</span>
            <span className="tnum">{MOCK.length}</span>
            <span>条</span>
          </div>
        </div>

        {/* 表格 */}
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[40px_120px_1fr_60px_90px_50px_60px_90px_90px_120px_70px_60px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div></div>
            <div>编码</div>
            <div>名称</div>
            <div>类</div>
            <div>规格</div>
            <div className="text-center">捻</div>
            <div>颜色</div>
            <div>批次</div>
            <div>供应商</div>
            <div className="text-right">单价</div>
            <div className="text-center">单位</div>
            <div className="text-right">库存</div>
            <div className="text-center">状态</div>
          </div>

          {rows.map((m) => {
            const low = m.lowStock;
            return (
              <div
                key={m.id}
                className={cn(
                  "grid grid-cols-[40px_120px_1fr_60px_90px_50px_60px_90px_90px_120px_70px_60px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0",
                  "hover:bg-[var(--accent)]/40 transition-colors cursor-pointer"
                )}
              >
                <div className="flex items-center justify-center">
                  <StatusDot tone={low ? "danger" : "neutral"} />
                </div>
                <div className="font-mono text-[11px] text-[var(--ink-dim)] tracking-tight">
                  {m.code}
                </div>
                <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                  {m.name}
                </div>
                <div>
                  <Badge tone="neutral">{m.category}</Badge>
                </div>
                <div className="font-mono tnum text-[12px] text-[var(--ink)]">
                  {m.specs}
                </div>
                <div className="font-mono text-[12px] text-[var(--ink-mute)] text-center">
                  {m.twist}
                </div>
                <div className="text-[12px] text-[var(--ink-dim)]">{m.color}</div>
                <div className="font-mono text-[12px] text-[var(--ink-dim)]">{m.batch}</div>
                <div className="text-[12px] text-[var(--ink-dim)] truncate">
                  {m.supplier}
                </div>
                <div className="text-right font-mono tnum text-[12px] font-medium text-[var(--ink)]">
                  ¥ {m.unitPrice.toLocaleString()}
                </div>
                <div className="text-center font-mono text-[11px] text-[var(--ink-mute)]">
                  {m.unit}
                </div>
                <div className="text-right font-mono tnum text-[12px] text-[var(--ink)]">
                  {m.stock}
                </div>
                <div className="flex items-center justify-center">
                  {low && <NumChip value="低库存" tone="danger" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底栏 */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[var(--ink-mute)]">
          <span>共 {rows.length} 条</span>
          <div className="flex items-center gap-3">
            <span>低于安全库存（{STOCK_LOW} kg）{totals.lowStock} 条</span>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
