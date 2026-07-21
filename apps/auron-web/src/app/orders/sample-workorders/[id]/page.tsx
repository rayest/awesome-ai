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
 * 打样工艺单 · 详情页
 *
 * 4 tabs 覆盖 Base 里 4 张表的全部字段：
 *  - 基础信息 (29 fields)
 *  - 织造用料 (26 fields，原 Base 公式重灾区)
 *  - 纱线排列 (8 路)
 *  - 尺寸要求
 *
 * 公式计算引擎在此 demo：
 *  - 织造成本 = 单价 × 比例% × (1+损耗系数)
 *  - 机台费 = 基础 × 时长（秒）/ 3600
 *  - 总下机克重 = 单种克重合计
 */

export default function WorkOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/orders/sample-workorders" className="hover:text-[var(--ink)]">
            打样工艺
          </Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{id}</span>
        </div>

        {/* ─── 唛头：工艺文档级头部 ─── */}
        <div className="mb-6">
          <FabricLabel
            docNo="WO-2026-0317-A"
            shortCode="GH-QS-007"
            season="Q3-26"
            composition="60% 澳毛 80s · 40% 长绒棉 60s · 18G 圆机双面 · 320 GSM"
            specs={[
              { label: "机型", value: "广源 GY-18 寸", mono: true },
              { label: "针数", value: "18G", mono: true },
              { label: "口径", value: "18 寸", mono: true },
              { label: "转速", value: "18 转", mono: true },
              { label: "下机秒", value: "240", mono: true },
              { label: "下机克重", value: "320 GSM", mono: true },
            ]}
            prices={[
              { label: "原料成本", value: "¥ 187.20", mono: true },
              { label: "机台费", value: "¥ 12.40", mono: true },
              { label: "织造成本", value: "¥ 199.60", mono: true },
            ]}
            delivery={[
              { label: "前道师傅", value: "老周", mono: true },
              { label: "时间", value: "今 09:14", mono: true },
              { label: "状态", value: "织造中", mono: true },
              { label: "剩余", value: "5 天", mono: true },
            ]}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-medium tracking-tight">
              羊毛双面呢 · 立领大衣
            </h1>
            <p className="mt-1 text-[12px] font-mono text-[var(--ink-mute)]">
              出处：SMPL-2026-0317-A · 客户：乾盛服饰 · 业务：李白
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">复制为新版</Button>
            <Button variant="outline" size="md">导出 PNG</Button>
            <Button variant="default" size="md">推送至车间</Button>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <Tabs defaultValue="base">
          <TabsList>
            <TabsTrigger value="base" count={21}>
              基础信息
            </TabsTrigger>
            <TabsTrigger value="yarn" count={4}>
              织造用料
            </TabsTrigger>
            <TabsTrigger value="lanes" count={8}>
              纱线排列
            </TabsTrigger>
            <TabsTrigger value="dimensions" count={3}>
              尺寸要求
            </TabsTrigger>
            <TabsTrigger value="audit">
              审计日志
            </TabsTrigger>
          </TabsList>

          {/* Tab 1：基础信息 */}
          <TabsContent value="base">
            <BaseInfoTab />
          </TabsContent>

          {/* Tab 2：织造用料（重点：公式引擎 demo） */}
          <TabsContent value="yarn">
            <YarnMixTab />
          </TabsContent>

          {/* Tab 3：纱线排列（8 路） */}
          <TabsContent value="lanes">
            <YarnLanesTab />
          </TabsContent>

          {/* Tab 4：尺寸要求 */}
          <TabsContent value="dimensions">
            <DimensionsTab />
          </TabsContent>

          {/* Tab 5：审计日志（占位） */}
          <TabsContent value="audit">
            <EmptyState
              title="工艺单还没有改动"
              hint="此处会展示每一项字段修改人 + 修改时间 + 修改前后值。老板和报价员可以查阅。"
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}

/* ─── Subcomponents ─── */

function FieldRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[140px]">
        {label}
      </span>
      <span className={cn("text-[13px] text-[var(--ink)]", mono && "font-mono tnum")}>
        {value}
      </span>
    </div>
  );
}

function FieldGrid({ fields }: { fields: Array<[string, ReactNode, boolean?]> }) {
  return (
    <div className="grid grid-cols-2 gap-x-12">
      {fields.map(([label, value, mono], i) => (
        <FieldRow key={i} label={label} value={value} mono={mono ?? true} />
      ))}
    </div>
  );
}

function BaseInfoTab() {
  const f: Array<[string, ReactNode, boolean?]> = [
    ["工艺单号", "WO-2026-0317-A"],
    ["客户", "乾盛服饰有限公司"],
    ["程序名", "WO0317-DBL-AURON"],
    ["机型", "广源 GY-18 寸 · 18G"],
    ["成分", "60% 澳毛 + 40% 长绒棉"],
    ["配比", "60 / 40"],
    ["平方克重 GSM", 320],
    ["下机克重", 310],
    ["下机叠放要求", "双向叠 · 不起折"],
    ["下机时间", "240 秒"],
    ["转速", "18 转/min"],
    ["针数", "18G"],
    ["染色工艺备注", "低温缸染 · 色牢度 ≥ 4 级"],
    ["织造注意事项", "前 30 圈慢速"],
    ["纱线张力要求", "中等 (2.5)"],
    ["前道打样师傅", "老周"],
    ["业务员", "李白"],
    ["客户厂款号", "GH-QS-007-26FW-0317"],
    ["业务部负责人", "李白"],
    ["总经理", "陈总"],
    ["填写日期", "2026-07-15"],
  ];
  return <FieldGrid fields={f} />;
}

/**
 * 织造用料 Tab —— 公式引擎 demo
 *
 * 4 条纱线混纺。每行的「原料成本」「机台费」「织造成本」都是基于其上的
 * 单价 / 比例 / 损耗系数 / 时长 计算得来。
 *
 * Base 公式噩梦 → 这里每行公式透明可追溯。
 */
function YarnMixTab() {
  const rows = [
    {
      part: "前片",
      material: "澳毛 80s",
      code: "Y-2026-0073",
      supplier: "康赛妮",
      batch: "B2408",
      color: "原色",
      ratio: 60,
      unitPrice: 420,
      loss: 8,        // %
      stitchSec: 100,
      machineRate: 8, // 元/小时
    },
    {
      part: "后片",
      material: "长绒棉 60s",
      code: "Y-2026-0142",
      supplier: "溢达",
      batch: "B2410",
      color: "本白",
      ratio: 30,
      unitPrice: 96,
      loss: 6,
      stitchSec: 90,
      machineRate: 8,
    },
    {
      part: "袖",
      material: "长绒棉 60s",
      code: "Y-2026-0142",
      supplier: "溢达",
      batch: "B2410",
      color: "本白",
      ratio: 8,
      unitPrice: 96,
      loss: 5,
      stitchSec: 35,
      machineRate: 8,
    },
    {
      part: "罗纹",
      material: "抗起球腈纶",
      code: "Y-2026-0311",
      supplier: "吉林化纤",
      batch: "B2409",
      color: "本白",
      ratio: 2,
      unitPrice: 78,
      loss: 4,
      stitchSec: 15,
      machineRate: 8,
    },
  ];

  // —— 公式：透明展示 ——
  const rowsWithCost = rows.map((r) => {
    // 原料成本 = 单价 × 比例% × (1 + 损耗系数/100)   // 元/kg
    const materialCost = r.unitPrice * (r.ratio / 100) * (1 + r.loss / 100);
    // 机台费 = (基础 × 时长秒 / 3600)
    const machineCost = r.machineRate * (r.stitchSec / 3600);
    // 织造成本
    const totalCost = materialCost + machineCost;
    return { ...r, materialCost, machineCost, totalCost };
  });

  const totals = rowsWithCost.reduce(
    (acc, r) => ({
      material: acc.material + r.materialCost,
      machine: acc.machine + r.machineCost,
      total: acc.total + r.totalCost,
      ratio: acc.ratio + r.ratio,
    }),
    { material: 0, machine: 0, total: 0, ratio: 0 }
  );

  return (
    <div className="space-y-4">
      {/* 公式说明卡 */}
      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--secondary)]/40">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] mb-2">
          公式引擎 — 可审计、可追溯
        </p>
        <div className="grid grid-cols-3 gap-4 text-[11px] font-mono">
          <div>
            <div className="text-[var(--ink-mute)]">原料成本 / kg</div>
            <div className="text-[var(--ink)] mt-0.5">
              单价 × 比例 ÷ 100 × (1 + 损耗 ÷ 100)
            </div>
          </div>
          <div>
            <div className="text-[var(--ink-mute)]">机台费 / 件</div>
            <div className="text-[var(--ink)] mt-0.5">
              元/小时 × 时长秒 ÷ 3600
            </div>
          </div>
          <div>
            <div className="text-[var(--ink-mute)]">织造成本</div>
            <div className="text-[var(--ink)] mt-0.5">
              原料成本 + 机台费
            </div>
          </div>
        </div>
      </div>

      {/* 4 个部件×4 种纱线 详情表 */}
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[var(--secondary)]/40 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] font-mono">
              <th className="px-3 py-2 text-left">部件</th>
              <th className="px-3 py-2 text-left">纱线</th>
              <th className="px-3 py-2 text-left">供应商</th>
              <th className="px-3 py-2 text-left">批次</th>
              <th className="px-3 py-2 text-right">比例 %</th>
              <th className="px-3 py-2 text-right">单价</th>
              <th className="px-3 py-2 text-right">损耗 %</th>
              <th className="px-3 py-2 text-right">秒数</th>
              <th className="px-3 py-2 text-right">原料成本</th>
              <th className="px-3 py-2 text-right">机台费</th>
              <th className="px-3 py-2 text-right bg-[var(--accent)]">织造成本</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rowsWithCost.map((r, i) => (
              <tr key={i} className="border-t border-[var(--hairline)]">
                <td className="px-3 py-2 text-[var(--ink)]">{r.part}</td>
                <td className="px-3 py-2">
                  <div className="text-[var(--ink)]">{r.material}</div>
                  <div className="text-[10px] text-[var(--ink-mute)]">{r.code}</div>
                </td>
                <td className="px-3 py-2 text-[var(--ink-dim)]">{r.supplier}</td>
                <td className="px-3 py-2 text-[var(--ink-dim)]">{r.batch}</td>
                <td className="px-3 py-2 text-right tnum">{r.ratio}</td>
                <td className="px-3 py-2 text-right tnum">¥{r.unitPrice}</td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] tnum",
                      r.loss > 8
                        ? "bg-[oklch(0.95_0.04_22)] text-[var(--destructive)]"
                        : r.loss > 6
                        ? "bg-[var(--warn-soft)] text-[var(--warn)]"
                        : "bg-[var(--secondary)] text-[var(--ink-mute)]"
                    )}
                  >
                    {r.loss}%
                  </span>
                </td>
                <td className="px-3 py-2 text-right tnum text-[var(--ink-dim)]">{r.stitchSec}</td>
                <td className="px-3 py-2 text-right tnum">¥{r.materialCost.toFixed(2)}</td>
                <td className="px-3 py-2 text-right tnum">¥{r.machineCost.toFixed(2)}</td>
                <td className="px-3 py-2 text-right tnum font-medium bg-[var(--accent)]/30 text-[var(--ink)]">
                  ¥{r.totalCost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 合计行 */}
        <div className="border-t-2 border-[var(--ink)] bg-[var(--secondary)]/40 px-3 py-3 grid grid-cols-[1fr_auto] gap-6 text-[12px] font-mono">
          <span className="text-[var(--ink-mute)] text-[10px] uppercase tracking-[0.18em]">
            合计 · 4 条纱线
          </span>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] text-[var(--ink-mute)]">原料</div>
              <div className="tnum">¥{totals.material.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--ink-mute)]">机台</div>
              <div className="tnum">¥{totals.machine.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--ink)] font-medium">合计</div>
              <div className="tnum font-medium text-[14px] text-[var(--ink)]">
                ¥{totals.total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 公式一致性自检 */}
      <div className="border border-dashed border-[var(--hairline-strong)] rounded-md p-4 flex items-start gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--success)] border border-[var(--success)] px-1.5 py-0.5 rounded shrink-0">
          ✓ 通过
        </span>
        <div className="text-[12px]">
          <p className="text-[var(--ink)] font-medium">
            公式一致性校验：原料合计 + 机台合计 = 织造成本合计
          </p>
          <p className="font-mono text-[11px] text-[var(--ink-mute)] mt-0.5">
            ¥{totals.material.toFixed(2)} + ¥{totals.machine.toFixed(2)} ={" "}
            <span className="text-[var(--ink)]">¥{totals.total.toFixed(2)}</span> ✓
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 纱线排列：8 路喂纱口可视化
 */
function YarnLanesTab() {
  const lanes = [
    { n: 1, yarn: "澳毛 80s", part: "前片" },
    { n: 2, yarn: "澳毛 80s", part: "前片" },
    { n: 3, yarn: "长绒棉 60s", part: "前片" },
    { n: 4, yarn: "长绒棉 60s", part: "前片" },
    { n: 5, yarn: "长绒棉 60s", part: "后片" },
    { n: 6, yarn: "长绒棉 60s", part: "后片" },
    { n: 7, yarn: "长绒棉 60s", part: "袖" },
    { n: 8, yarn: "抗起球腈纶", part: "罗纹" },
  ];

  // 按部件上色
  const partColor: Record<string, string> = {
    前片: "var(--primary)",
    后片: "var(--info)",
    袖: "var(--success)",
    罗纹: "var(--warn)",
  };

  return (
    <div className="space-y-4">
      {/* 8 路可视化 */}
      <div className="border border-[var(--hairline)] rounded-md p-6 bg-[var(--secondary)]/30">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] mb-4">
          圆机喂纱口 · 8 路排布（俯视）
        </p>
        <div className="grid grid-cols-8 gap-2">
          {lanes.map((l) => (
            <div key={l.n} className="text-center">
              <div
                className="aspect-square rounded-md flex items-center justify-center text-[10px] font-mono tnum font-medium"
                style={{
                  background: partColor[l.part],
                  color: "white",
                }}
              >
                #{l.n}
              </div>
              <div className="mt-1 text-[10px] text-[var(--ink-dim)] truncate">{l.part}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-6 text-[11px] font-mono text-[var(--ink-dim)]">
        {Object.entries(partColor).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span>{name}</span>
          </div>
        ))}
      </div>

      {/* 表格 */}
      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <table className="w-full text-[12px] font-mono">
          <thead>
            <tr className="bg-[var(--secondary)]/40 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
              <th className="px-3 py-2 text-left">路 #</th>
              <th className="px-3 py-2 text-left">纱线</th>
              <th className="px-3 py-2 text-left">部件</th>
              <th className="px-3 py-2 text-left">穿纱方式</th>
              <th className="px-3 py-2 text-right">张力</th>
            </tr>
          </thead>
          <tbody>
            {lanes.map((l) => (
              <tr key={l.n} className="border-t border-[var(--hairline)]">
                <td className="px-3 py-2 text-[var(--ink)] font-medium">#{l.n}</td>
                <td className="px-3 py-2 text-[var(--ink)]">{l.yarn}</td>
                <td className="px-3 py-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                    style={{ background: partColor[l.part] }}
                  />
                  {l.part}
                </td>
                <td className="px-3 py-2 text-[var(--ink-dim)]">满穿</td>
                <td className="px-3 py-2 text-right tnum">2.5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 尺寸要求：白胚/色胚缩率
 */
function DimensionsTab() {
  const rows = [
    { part: "衣长", white: 96, dyed: 92, ratio: 4.2 },
    { part: "胸围", white: 122, dyed: 116, ratio: 5.0 },
    { part: "袖长", white: 64, dyed: 61, ratio: 4.7 },
  ];
  return (
    <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
      <table className="w-full text-[12px] font-mono">
        <thead>
          <tr className="bg-[var(--secondary)]/40 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <th className="px-3 py-2 text-left">部位</th>
            <th className="px-3 py-2 text-right">白胚尺寸 (cm)</th>
            <th className="px-3 py-2 text-right">色胚尺寸 (cm)</th>
            <th className="px-3 py-2 text-right">缩率 %</th>
            <th className="px-3 py-2 text-left">染整备注</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.part} className="border-t border-[var(--hairline)]">
              <td className="px-3 py-2 text-[var(--ink)]">{r.part}</td>
              <td className="px-3 py-2 text-right tnum">{r.white}</td>
              <td className="px-3 py-2 text-right tnum">{r.dyed}</td>
              <td className="px-3 py-2 text-right">
                <span className="px-1.5 py-0.5 rounded bg-[var(--warn-soft)] text-[var(--warn)] text-[10px] tnum">
                  {r.ratio.toFixed(1)}%
                </span>
              </td>
              <td className="px-3 py-2 text-[var(--ink-mute)]">需预缩</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-16 px-6 text-center">
      <h3 className="font-display text-[16px] font-medium text-[var(--ink)] mb-1">{title}</h3>
      <p className="text-[12px] text-[var(--ink-mute)] max-w-[420px] mx-auto">{hint}</p>
    </div>
  );
}
