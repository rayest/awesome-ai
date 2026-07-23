"use client";

import type { ReactNode } from "react";
import { use } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getWorkorderYarnLanes,
  getMaterials,
  getParts,
  getWorkorder,
  type Material,
  type Part,
} from "@/lib/data";

/**
 * 打样工艺单 · 详情页
 *
 * 4 tabs 覆盖 crm 里 4 张表的全部字段：
 *  - 基础信息 (29 fields, crm_打样工艺单_基础信息表)
 *  - 织造用料 (26 fields, crm_打样工艺单_织造用料表)
 *  - 纱线排列 (13 fields, crm_打样工艺单_纱线排列表)
 *  - 尺寸要求 (7 fields, crm_打样工艺单_尺寸要求表)
 *
 * 公式严格对齐 crm 字段 F6/F9/F10：
 *  - 原料成本 = 下机克重(g) × 面料单价(元/kg) × (1 + 损耗系数) × 配比 ÷ 1000
 *  - 机台费 = 机台费标准 ÷ 79200 × 下机时间(秒) × 配比 × (1 + 损耗系数)
 *  - 织造成本 = 原料成本 + 机台费（机台费只算一次）
 *
 * 单位约定（base description）：
 *  - 下机克重 g；面料单价 元/kg；原料成本 元
 *  - 配比 0-100（百分数 / 100 入乘式）
 */

export default function WorkOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)] mb-4">
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
            <p className="mt-1 text-[14px] font-mono text-[var(--ink-mute)]">
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
            <TabsTrigger value="lanes" count={52}>
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
            <YarnMixTab workorderId={id} />
          </TabsContent>

          {/* Tab 3：纱线排列（8 路 × 8 纱嘴） */}
          <TabsContent value="lanes">
            <YarnLanesTab workorderId={id} />
          </TabsContent>

          {/* Tab 4：尺寸要求 */}
          <TabsContent value="dimensions">
            <DimensionsTab workorderId={id} />
          </TabsContent>

          {/* Tab 5：审计日志（占位） */}
          <TabsContent value="audit">
            <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-10 text-center">
              <p className="text-[14px] font-mono text-[var(--ink-mute)]">
                工艺单还没有改动 · 字段修改人 + 修改时间 + 修改前后值将在此展示
              </p>
            </div>
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
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[140px]">
        {label}
      </span>
      <span className={cn("text-[14px] text-[var(--ink)]", mono && "font-mono tnum")}>
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
 * 严格按 crm F6 / F9 / F10 重写：
 *   原料成本（每件 / 元）
 *     = 下机克重(g) × 面料单价(元/kg) × (1 + 损耗系数) × 配比 ÷ 1000
 *   机台费（每件 / 元）
 *     = 机台费标准 ÷ 79200 × 该部件下机时间(秒) × 配比 × (1 + 损耗系数)
 *   织造成本 = 原料成本 + 机台费（机台费只算一次 — base 注明）
 *
 * 单位（base description）：
 *   下机克重 g / 面料单价 元/kg / 原料成本 元 / 配比 0-100 / 损耗系数 0-1
 */
type YarnMixRow = {
  id: string;
  part: string;
  materialId: string;
  ratio: number;
  loss: number;
  stitchSec: number;
};

/** 关联基 Banner —— 显示「当前 tab 写入哪张表，外键是哪张表」 */
function BaseLinkBanner({ workorderId, table }: { workorderId: string; table: string }) {
  return (
    <div className="border border-[var(--hairline)] rounded-md px-3 py-2 bg-[var(--card)] flex items-center justify-between text-[14px] font-mono">
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 rounded border border-[var(--primary)] text-[var(--primary)]">link</span>
        <span className="text-[var(--ink-mute)]">写入</span>
        <span className="text-[var(--ink)]">{table}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[var(--ink-mute)]">关联基 →</span>
        <span className="text-[var(--ink)]">crm_打样工艺单_基础信息表</span>
        <code className="px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--ink)]">{workorderId}</code>
      </div>
    </div>
  );
}

function YarnMixTab({ workorderId }: { workorderId: string }) {
  const materials = getMaterials();
  const w = getWorkorder(workorderId);
  const 下机克重 = w?.finishedWeight ?? 310;
  const 机台费标准 = 2.4;

  const [rows, setRows] = useState<YarnMixRow[]>([
    { id: "r1", part: "前片", materialId: "MAT-001", ratio: 60, loss: 0.08, stitchSec: 100 },
    { id: "r2", part: "后片", materialId: "MAT-002", ratio: 30, loss: 0.06, stitchSec: 90  },
    { id: "r3", part: "袖",   materialId: "MAT-002", ratio: 8,  loss: 0.05, stitchSec: 35  },
    { id: "r4", part: "罗纹", materialId: "MAT-004", ratio: 2,  loss: 0.04, stitchSec: 15  },
  ]);

  const update = (id: string, patch: Partial<YarnMixRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [
      ...rs,
      { id: `r${Date.now()}`, part: "新部件", materialId: materials[0]?.id ?? "", ratio: 0, loss: 0.05, stitchSec: 30 },
    ]);

  const materialOf = (id: string): Material | undefined => materials.find((m) => m.id === id);
  const enriched = rows.map((r) => {
    const m = materialOf(r.materialId);
    const unitPrice = m?.unitPrice ?? 0;
    const materialCost = (下机克重 * unitPrice * (1 + r.loss) * (r.ratio / 100)) / 1000;
    const machineCost  = (机台费标准 / 79200) * r.stitchSec * (r.ratio / 100) * (1 + r.loss);
    return { ...r, m, unitPrice, materialCost, machineCost, total: materialCost + machineCost };
  });
  const totals = enriched.reduce(
    (acc, r) => ({
      material: acc.material + r.materialCost,
      machine:  acc.machine  + r.machineCost,
      total:    acc.total    + r.total,
      ratio:    acc.ratio    + r.ratio,
    }),
    { material: 0, machine: 0, total: 0, ratio: 0 }
  );

  const PART_OPTIONS = ["前片", "后片", "袖", "罗纹", "领", "口袋"];

  return (
    <div className="space-y-4">
      <BaseLinkBanner workorderId={workorderId} table="crm_打样工艺单_织造用料表" />

      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="grid grid-cols-[90px_1fr_120px_120px_120px_90px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          <div>部件</div>
          <div>物料 · 来自 crm_字典_物料信息表</div>
          <div className="text-right">配比 %</div>
          <div className="text-right">损耗系数</div>
          <div className="text-right">下机时间 s</div>
          <div className="text-right">小计 / 元</div>
          <div></div>
        </div>

        {enriched.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[90px_1fr_120px_120px_120px_90px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 font-mono text-[14px]"
          >
            <select
              value={r.part}
              onChange={(e) => update(r.id, { part: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
            >
              {PART_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <div className="flex items-center gap-2 min-w-0">
              <select
                value={r.materialId}
                onChange={(e) => update(r.id, { materialId: e.target.value })}
                className="flex-1 min-w-0 bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">— 选择物料 —</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.yarnName} · {m.spec} · ¥{m.unitPrice}/kg · {m.supplier}
                  </option>
                ))}
              </select>
              {r.m && (
                <span className="text-[14px] text-[var(--ink-mute)] truncate shrink-0" title={r.m.batch}>
                  {r.m.batch}
                </span>
              )}
            </div>

            <input
              type="number" min={0} max={100} step={1}
              value={r.ratio}
              onChange={(e) => update(r.id, { ratio: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
            />
            <input
              type="number" min={0} max={0.5} step={0.01}
              value={r.loss}
              onChange={(e) => update(r.id, { loss: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
            />
            <input
              type="number" min={0} step={1}
              value={r.stitchSec}
              onChange={(e) => update(r.id, { stitchSec: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
            />

            <div className="text-right tnum text-[var(--ink)]">¥{r.total.toFixed(3)}</div>

            <button
              onClick={() => remove(r.id)}
              className="font-mono text-[14px] text-[var(--ink-mute)] hover:text-[var(--destructive)] text-center"
              title="删除此行"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="px-3 py-2 bg-[var(--background)]/40 border-t border-[var(--hairline)]">
          <button onClick={add} className="font-mono text-[14px] text-[var(--primary)] hover:underline">
            + 添加一行
          </button>
        </div>

        <div className="border-t-2 border-[var(--ink)] bg-[var(--secondary)]/40 px-3 py-3 grid grid-cols-[1fr_auto] gap-6 text-[14px] font-mono">
          <span className="text-[var(--ink-mute)] uppercase tracking-[0.18em]">
            合计 · {rows.length} 条 · 配比 {totals.ratio}%
          </span>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[var(--ink-mute)]">原料</div>
              <div className="tnum">¥{totals.material.toFixed(3)}</div>
            </div>
            <div className="text-right">
              <div className="text-[var(--ink-mute)]">机台</div>
              <div className="tnum">¥{totals.machine.toFixed(4)}</div>
            </div>
            <div className="text-right">
              <div className="text-[var(--ink)] font-medium">合计 / 件</div>
              <div className="tnum font-medium text-[var(--ink)]">¥{totals.total.toFixed(3)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--secondary)]/40 text-[14px] font-mono">
        <p className="uppercase tracking-[0.18em] text-[var(--ink-mute)] mb-2">
          公式引擎 · 来自 crm F6 / F9 / F10
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[var(--ink-mute)]">原料成本 (F6)</div>
            <div className="text-[var(--ink)] mt-0.5 leading-relaxed">
              下机克重 × 单价 × (1 + 损耗) × 配比 ÷ 1000
            </div>
          </div>
          <div>
            <div className="text-[var(--ink-mute)]">机台费 (F9)</div>
            <div className="text-[var(--ink)] mt-0.5 leading-relaxed">
              机台费标准 ÷ 79200 × 下机秒 × 配比 × (1 + 损耗)
            </div>
          </div>
          <div>
            <div className="text-[var(--ink-mute)]">织造成本 (F10)</div>
            <div className="text-[var(--ink)] mt-0.5 leading-relaxed">
              原料成本 + 机台费 (机台费只算一次)
            </div>
          </div>
        </div>
        <p className="mt-3 text-[var(--ink-mute)]">
          下机克重 = {下机克重} g（来自 crm_打样工艺单_基础信息表.下机克重）；
          机台费标准 = {机台费标准} 元/件（演示值）
        </p>
      </div>

      <div className="border border-dashed border-[var(--hairline-strong)] rounded-md p-3 text-[14px] font-mono text-[var(--ink-mute)]">
        💾 点「保存」将 {rows.length} 行写入 crm_打样工艺单_织造用料表，
        每条记录的 <span className="text-[var(--ink)]">workorderId</span> 自动 link 到 crm_打样工艺单_基础信息表.{workorderId}。
      </div>
    </div>
  );
}
/**
 * 纱线排列：8 路 × 8 纱嘴 可视化
 *
 * 上方：crm_打样工艺单_织造用料表 数据源（所有用料的扁平列表）
 * 下方：每个程序（部件）一张 8 路 × 8 纱嘴 的网格，行=F1-F8，列=1#-8#
 */
type LaneCell = {
  materialId: string;   // 来自 crm_字典_物料信息表
  mode: string;         // 满穿 / 空穿 / 衬氨
  tension: number;
};

type LaneProgram = {
  name: string;         // 程序名 / 部件
  grid: Record<number, Record<number, LaneCell>>;  // lane[1..8] -> feeder[1..8]
};

function YarnLanesTab({ workorderId }: { workorderId: string }) {
  const initialLanes = getWorkorderYarnLanes(workorderId);
  const materials = getMaterials();

  // 把已有数据按 programName 分组成 grid
  const seed: Record<string, LaneProgram> = {};
  for (const r of initialLanes) {
    if (!seed[r.programName]) seed[r.programName] = { name: r.programName, grid: {} };
    if (!seed[r.programName].grid[r.lane]) seed[r.programName].grid[r.lane] = {};
    seed[r.programName].grid[r.lane][r.feeder] = {
      materialId: r.yarnId,
      mode: r.mode,
      tension: r.tension,
    };
  }

  const [programs, setPrograms] = useState<Record<string, LaneProgram>>(
    Object.keys(seed).length > 0 ? seed : defaultPrograms(workorderId)
  );

  const updateCell = (prog: string, lane: number, feeder: number, cell: LaneCell | null) =>
    setPrograms((ps) => {
      const next = { ...ps, [prog]: { ...ps[prog], grid: { ...ps[prog].grid } } };
      if (!next[prog].grid[lane]) next[prog].grid[lane] = {};
      if (cell === null) delete next[prog].grid[lane][feeder];
      else next[prog].grid[lane][feeder] = cell;
      return next;
    });

  const addProgram = () =>
    setPrograms((ps) => {
      const n = `新程序 ${Object.keys(ps).length + 1}`;
      return { ...ps, [n]: { name: n, grid: {} } };
    });

  const partColor: Record<string, string> = {
    前片: "var(--primary)",
    后片: "var(--info)",
    袖: "var(--success)",
    罗纹: "var(--warn)",
    大身: "var(--primary)",
    领布: "var(--warn)",
    领: "var(--warn)",
    口袋: "var(--info)",
  };
  const fallbackPalette = ["var(--primary)", "var(--info)", "var(--success)", "var(--warn)"];
  const programList = Object.values(programs);
  const programColor = (p: string): string => {
    const prog = programs[p];
    return partColor[prog?.name ?? ""] ?? fallbackPalette[programList.findIndex((x) => x.name === p) % fallbackPalette.length];
  };

  return (
    <div className="space-y-6">
      <BaseLinkBanner workorderId={workorderId} table="crm_打样工艺单_纱线排列表" />

      <div className="flex items-center justify-between text-[14px] font-mono text-[var(--ink-mute)]">
        <span>物料 ↓ 来自 crm_字典_物料信息表（点单元格选择）；共 {programList.length} 个程序</span>
        <button onClick={addProgram} className="text-[var(--primary)] hover:underline">
          + 添加程序
        </button>
      </div>

      {programList.map((prog) => {
        const usedCount = Object.values(prog.grid).reduce(
          (s, feeders) => s + Object.keys(feeders).length,
          0
        );
        return (
          <section key={prog.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="inline-block w-2 h-6 rounded-sm" style={{ background: programColor(prog.name) }} />
                <span className="font-display text-[18px] font-medium">{prog.name}</span>
                <span className="font-mono text-[14px] text-[var(--ink-mute)]">
                  · {usedCount} 个单元 · 行 = 路 F1-F8 · 列 = 纱嘴 1#-8#
                </span>
              </div>
              <span className="font-mono text-[14px] text-[var(--ink-mute)]">
                点单元格选择物料 · 清空请选「— 空 —」
              </span>
            </div>

            <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
              <div className="grid grid-cols-[80px_repeat(8,1fr)] gap-0 border-b border-[var(--hairline)]">
                <div className="px-3 py-2 bg-[var(--secondary)]/60 font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] flex items-center">路</div>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
                  <div key={f} className="px-2 py-2 text-center bg-[var(--secondary)]/60 font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] border-l border-[var(--hairline)]">
                    {f}#
                  </div>
                ))}
              </div>

              {[1, 2, 3, 4, 5, 6, 7, 8].map((lane) => (
                <div key={lane} className="grid grid-cols-[80px_repeat(8,1fr)] gap-0 border-b border-[var(--hairline)] last:border-b-0">
                  <div className="px-3 py-2 bg-[var(--secondary)]/30 font-mono text-[14px] font-medium text-[var(--ink)] flex items-center">
                    F{lane}
                  </div>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((feeder) => {
                    const cell = prog.grid[lane]?.[feeder];
                    const mat = cell ? materials.find((m) => m.id === cell.materialId) : null;
                    return (
                      <div
                        key={feeder}
                        className="px-1 py-1 min-h-[48px] border-l border-[var(--hairline)] flex items-center justify-center bg-[var(--background)]/40"
                      >
                        <select
                          value={cell?.materialId ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") updateCell(prog.name, lane, feeder, null);
                            else updateCell(prog.name, lane, feeder, {
                              materialId: v,
                              mode: cell?.mode ?? "满穿",
                              tension: cell?.tension ?? 2.5,
                            });
                          }}
                          className="w-full bg-transparent border border-transparent hover:border-[var(--hairline)] rounded px-1 py-0.5 text-center text-[14px] font-mono focus:outline-none focus:border-[var(--primary)]"
                        >
                          <option value="">— 空 —</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.yarnName}
                            </option>
                          ))}
                        </select>
                        {mat && (
                          <span
                            className="hidden"
                            title={`${mat.yarnName} · ${mat.spec} · 张力 ${cell?.tension}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** 默认初始 3 个程序（前片/后片/袖），空 grid 让用户填写 */
function defaultPrograms(workorderId: string): Record<string, LaneProgram> {
  return {
    "WO0317-DBL-FRONT": { name: "WO0317-DBL-FRONT", grid: {} },
    "WO0317-DBL-BACK":  { name: "WO0317-DBL-BACK",  grid: {} },
    "WO0317-DBL-SLEEVE":{ name: "WO0317-DBL-SLEEVE",grid: {} },
  };
}
/**
 * 尺寸要求：白胚/色胚缩率
 */
type DimRow = {
  id: string;
  part: string;       // 部位（来自 crm_字典_部位配置表）
  white: number;      // 白胚尺寸 cm
  dyed: number;       // 色胚尺寸 cm
  note: string;       // 染整备注
};

function DimensionsTab({ workorderId }: { workorderId: string }) {
  const parts = getParts();   // 来自 crm_字典_部位配置表
  const [rows, setRows] = useState<DimRow[]>([
    { id: "d1", part: "衣长", white: 96,  dyed: 92,  note: "需预缩" },
    { id: "d2", part: "胸围", white: 122, dyed: 116, note: "需预缩" },
    { id: "d3", part: "袖长", white: 64,  dyed: 61,  note: "需预缩" },
  ]);

  const update = (id: string, patch: Partial<DimRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [
      ...rs,
      { id: `d${Date.now()}`, part: parts[0]?.name ?? "新部位", white: 0, dyed: 0, note: "" },
    ]);

  const ratioOf = (r: DimRow) =>
    r.white > 0 ? ((r.white - r.dyed) / r.white) * 100 : 0;

  const partOptions = parts.length > 0 ? parts.map((p) => p.name) : ["衣长", "胸围", "袖长", "肩宽", "下摆"];

  return (
    <div className="space-y-4">
      <BaseLinkBanner workorderId={workorderId} table="crm_打样工艺单_尺寸要求表" />

      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_120px_1fr_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          <div>部位 · 来自 crm_字典_部位配置表</div>
          <div className="text-right">白胚 cm</div>
          <div className="text-right">色胚 cm</div>
          <div className="text-right">缩率 %</div>
          <div>染整备注</div>
          <div></div>
        </div>

        {rows.map((r) => {
          const ratio = ratioOf(r);
          const high = ratio >= 5;
          return (
            <div
              key={r.id}
              className="grid grid-cols-[1fr_120px_120px_120px_1fr_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 font-mono text-[14px]"
            >
              <select
                value={r.part}
                onChange={(e) => update(r.id, { part: e.target.value })}
                className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
              >
                {partOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>

              <input
                type="number" min={0} step={0.5}
                value={r.white}
                onChange={(e) => update(r.id, { white: Number(e.target.value) })}
                className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
              />
              <input
                type="number" min={0} step={0.5}
                value={r.dyed}
                onChange={(e) => update(r.id, { dyed: Number(e.target.value) })}
                className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
              />
              <div className="text-right tnum">
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[14px] tnum",
                    high
                      ? "bg-[var(--warn-soft)] text-[var(--warn)]"
                      : "bg-[var(--secondary)] text-[var(--ink-mute)]"
                  )}
                >
                  {ratio.toFixed(1)}%
                </span>
              </div>
              <input
                type="text"
                value={r.note}
                placeholder="如：需预缩 / 拉幅后..."
                onChange={(e) => update(r.id, { note: e.target.value })}
                className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
              />
              <button
                onClick={() => remove(r.id)}
                className="font-mono text-[14px] text-[var(--ink-mute)] hover:text-[var(--destructive)] text-center"
                title="删除此行"
              >
                ✕
              </button>
            </div>
          );
        })}

        <div className="px-3 py-2 bg-[var(--background)]/40 border-t border-[var(--hairline)]">
          <button onClick={add} className="font-mono text-[14px] text-[var(--primary)] hover:underline">
            + 添加一行
          </button>
        </div>
      </div>

      <div className="border border-dashed border-[var(--hairline-strong)] rounded-md p-3 text-[14px] font-mono text-[var(--ink-mute)]">
        💾 点「保存」将 {rows.length} 行写入 crm_打样工艺单_尺寸要求表，
        每条记录的 <span className="text-[var(--ink)]">workorderId</span> 自动 link 到 crm_打样工艺单_基础信息表.{workorderId}。
        缩率 = (白胚 − 色胚) ÷ 白胚 × 100%。
      </div>
    </div>
  );
}