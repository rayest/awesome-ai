"use client";

import type { ReactNode } from "react";
import { use, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getParts, getSizeConfs, getTrims } from "@/lib/data";

/**
 * 打样通知 · 详情页
 *
 * 数据源（5 张表）：
 *   主表 crm_打样通知_基础信息表  (27 字段)
 *   子表 crm_打样通知_成品尺寸表  (8 字段)
 *   子表 crm_打样通知_辅料表      (9 字段)
 *   关联 crm_打样工艺单_基础信息表 (29 字段)
 *   关联 crm_报价单_基础信息表     (33 字段)
 *
 * 修复要点：
 *   - 成品尺寸子表 → 按行存（crm schema: 部位(link) + 尺码(link) + 尺寸(text) + 公差(text)），
 *     当前页面之前误为 pivot 矩阵，已改为按行列表
 *   - 基础信息 Tab 补 5 个字段：业务跟单 / 审批日期 / 进度状态 (select) / 种类 (link) / 特殊工艺 (multi-select)
 *
 * 进度状态 select 三个固定值：未通知 / 已通知 / 已结束
 * 特殊工艺 multi-select 五个值：有定型 / 需蒸馏 / 常温缩水 / 抗菌助剂 / 无折痕
 */

export default function SampleNoticeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 面包屑 */}
        <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/orders/sample-notices" className="hover:text-[var(--ink)]">
            打样通知
          </Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{id}</span>
        </div>

        {/* 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="SMPL-2026-0317-A"
            shortCode="CUST-QS-001"
            season="Q3-26"
            composition="60% 澳毛 80s · 40% 长绒棉 60s · 320 GSM · 18G 双面"
            specs={[
              { label: "GSM", value: 320, mono: true },
              { label: "针数", value: "18G", mono: true },
              { label: "颜色", value: "炭灰", mono: true },
              { label: "染色", value: "缸染低温", mono: true },
              { label: "尺码", value: "S/M/L", mono: true },
              { label: "数量", value: "3 件", mono: true },
            ]}
            prices={[
              { label: "申报价", value: "¥ 420.00", mono: true },
              { label: "内部成本", value: "¥ 312.00", mono: true },
              { label: "预估毛利", value: "25.7%", mono: true },
            ]}
            delivery={[
              { label: "交样", value: "2026-07-28", mono: true },
              { label: "剩余", value: "7 天", mono: true },
              { label: "前道师傅", value: "老周", mono: true },
              { label: "跟单", value: "王姐", mono: true },
            ]}
          />
        </div>

        {/* 页面级操作按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-medium tracking-tight">
              羊毛双面呢 · 立领大衣
            </h1>
            <p className="mt-1 flex items-center gap-2 text-[14px] font-mono text-[var(--ink-mute)]">
              <span>客户：乾盛服饰</span>
              <span className="text-[var(--hairline-strong)]">|</span>
              <span>业务：李白</span>
              <span className="text-[var(--hairline-strong)]">|</span>
              <Badge tone="info" size="sm">前道中</Badge>
              <span className="text-[var(--hairline-strong)]">|</span>
              <Badge tone="success" size="sm">已通知</Badge>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">打回</Button>
            <Button variant="outline" size="md">复制上版</Button>
            <Button variant="default" size="md">推进至下一道</Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notice">
          <TabsList>
            <TabsTrigger value="notice" count={27}>
              通知基础信息
            </TabsTrigger>
            <TabsTrigger value="size" count={9}>
              成品尺寸
            </TabsTrigger>
            <TabsTrigger value="accessory" count={4}>
              辅料
            </TabsTrigger>
            <TabsTrigger value="workorder">
              工艺单
            </TabsTrigger>
            <TabsTrigger value="quote">
              报价
            </TabsTrigger>
          </TabsList>

          {/* Tab 1：通知基础信息 —— 27 字段全部展示 */}
          <TabsContent value="notice">
            <NoticeBaseFields />
          </TabsContent>

          {/* Tab 2：成品尺寸 —— 按行（修复 bug） */}
          <TabsContent value="size">
            <SizeTable noticeId={id} />
          </TabsContent>

          {/* Tab 3：辅料 */}
          <TabsContent value="accessory">
            <AccessoryTable noticeId={id} />
          </TabsContent>

          <TabsContent value="workorder">
            <EmptyState
              title="尚未创建工艺单"
              hint="本打样通知可以转工艺单，用于配置织造用料 / 纱线排列 / 尺寸要求。"
              action={<Link href="/orders/sample-workorders/new"><Button variant="default" size="md">转工艺单 →</Button></Link>}
            />
          </TabsContent>

          <TabsContent value="quote">
            <EmptyState
              title="尚未生成报价"
              hint="只有产生报价后，系统才会写入客户档案与产品主数据。"
              action={<Link href="/orders/quotations/new"><Button variant="default" size="md">生成报价 →</Button></Link>}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}

/* ─── Subcomponents ─── */

function FieldRow({ label, value, mono, source }: { label: string; value: ReactNode; mono?: boolean; source?: string }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[140px] flex items-center justify-between pr-2">
        <span>{label}</span>
      </span>
      <span className={cn("text-[14px] text-[var(--ink)]", mono && "font-mono tnum")}>
        {value}
      </span>
      {source && (
        <span className="font-mono text-[14px] text-[var(--ink-mute)] ml-auto" title={source}>
          {source}
        </span>
      )}
    </div>
  );
}

function FieldGrid({ fields }: { fields: Array<{ label: string; value: ReactNode; mono?: boolean; source?: string }> }) {
  return (
    <div className="grid grid-cols-2 gap-x-12">
      {fields.map((f, i) => (
        <FieldRow key={i} label={f.label} value={f.value} mono={f.mono} source={f.source} />
      ))}
    </div>
  );
}

function NoticeBaseFields() {
  /* crm_打样通知_基础信息表 27 字段，全部覆盖 */
  const f: Array<{ label: string; value: ReactNode; mono?: boolean; source?: string }> = [
    { label: "通知单 ID",     value: "SMPL-2026-0317-A", mono: true, source: "auto_number" },
    { label: "厂款号",         value: "GH-QS-001-26FW-0317", mono: true, source: "text (关联键)" },
    { label: "品名",           value: "羊毛双面呢",                   source: "text" },
    { label: "种类",           value: <>外套 · 羊毛呢</>,            source: "link → crm_字典_样品种类表" },
    { label: "客户名称",       value: "乾盛服饰有限公司",            source: "text" },
    { label: "颜色",           value: "炭灰",                          source: "text" },
    { label: "特殊纱线",       value: "— ",                              source: "text" },
    { label: "交样数量",       value: "3 件",                          source: "text（数量 + 尺码合一）" },
    { label: "交样尺码",       value: <>S · M · L</>,                 source: "link → crm_字典_尺码配置表" },
    { label: "交样日期",       value: "2026-07-28",                    mono: true, source: "datetime" },
    { label: "通知日期",       value: "2026-07-15",                    mono: true, source: "datetime" },
    { label: "审批日期",       value: "2026-07-16",                    mono: true, source: "datetime" },
    { label: "进度状态",       value: <Badge tone="success" size="sm">已通知</Badge>, source: "select: 未通知 / 已通知 / 已结束" },
    { label: "进度追踪",       value: "前道织造中（80%）",            source: "formula F1" },
    { label: "染色要求",       value: "缸染低温 · 色牢度 ≥ 4 级",     source: "text" },
    { label: "特殊工艺",       value: (
        <span className="inline-flex items-center gap-1">
          <span className="font-mono text-[14px] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--ink-dim)]">需蒸馏</span>
          <span className="font-mono text-[14px] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--ink-dim)]">无折痕</span>
        </span>
      ), source: "multi-select: 有定型/需蒸馏/常温缩水/抗菌助剂/无折痕" },
    { label: "前道工艺要求",   value: "双面织造 · 罗纹 1×1",          source: "text（业务员录入）" },
    { label: "后道工艺要求",   value: "免烫 · 蒸汽定型",              source: "text（业务员录入）" },
    { label: "业务跟单",       value: (
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center text-[14px] font-mono">王</span>
          王姐
        </span>
      ), source: "user（创建表的员工）" },
    { label: "业务部负责人",   value: "李白",                          source: "link → crm_人员信息表" },
    { label: "前道打样师傅",   value: "老周",                          source: "link → crm_人员信息表" },
    { label: "后道打样师傅",   value: "阿亮",                          source: "link → crm_人员信息表" },
    { label: "总经理",         value: "陈总",                          source: "link → crm_人员信息表" },
    { label: "产品图示",       value: <span className="font-mono text-[14px]">已上传 · 2 张</span>, source: "attachment" },
    { label: "客户备注",       value: "确保色牢度 ≥ 4 级，请回寄 3 件以确认手感。", source: "text" },
    { label: "辅料明细",       value: "树脂衬 3片 · PBT 拉链 3条 · 涤纶线 1卷 · 树脂纽扣 6颗", mono: true, source: "formula F2" },
    { label: "成品尺寸明细",   value: "衣长 92cm · 胸围 116cm · 肩宽 46cm", mono: true, source: "formula F3" },
    { label: "工艺单 ID",      value: <span className="text-[var(--primary)] underline">WO-2026-0317-A</span>, source: "link → crm_打样工艺单_基础信息表 (双向)" },
  ];
  return <FieldGrid fields={f} />;
}

/* ─── 关联基 Banner ─── */
function BaseLinkBanner({ noticeId, table }: { noticeId: string; table: string }) {
  return (
    <div className="border border-[var(--hairline)] rounded-md px-3 py-2 bg-[var(--card)] flex items-center justify-between text-[14px] font-mono">
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 rounded border border-[var(--primary)] text-[var(--primary)]">link</span>
        <span className="text-[var(--ink-mute)]">写入</span>
        <span className="text-[var(--ink)]">{table}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[var(--ink-mute)]">关联基 →</span>
        <span className="text-[var(--ink)]">crm_打样通知_基础信息表</span>
        <code className="px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--ink)]">{noticeId}</code>
      </div>
    </div>
  );
}

type SizeRow = {
  id: string; part: string; size: string; value: number; tol: string;
};

function SizeTable({ noticeId }: { noticeId: string }) {
  const parts = getParts();         // 来自 crm_字典_部位配置表
  const sizes = getSizeConfs();      // 来自 crm_字典_尺码配置表

  const [rows, setRows] = useState<SizeRow[]>([
    { id: "s1", part: "衣长", size: "S", value: 88,  tol: "±1.5" },
    { id: "s2", part: "衣长", size: "M", value: 92,  tol: "±1.5" },
    { id: "s3", part: "衣长", size: "L", value: 96,  tol: "±1.5" },
    { id: "s4", part: "胸围", size: "S", value: 108, tol: "±2.0" },
    { id: "s5", part: "胸围", size: "M", value: 114, tol: "±2.0" },
    { id: "s6", part: "胸围", size: "L", value: 120, tol: "±2.0" },
    { id: "s7", part: "肩宽", size: "S", value: 44,  tol: "±1.0" },
    { id: "s8", part: "肩宽", size: "M", value: 46,  tol: "±1.0" },
    { id: "s9", part: "肩宽", size: "L", value: 48,  tol: "±1.0" },
  ]);

  const update = (id: string, p: Partial<SizeRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [
      ...rs,
      {
        id: `s${Date.now()}`,
        part: parts[0]?.name ?? "新部位",
        size: sizes[0]?.size ?? "S",
        value: 0,
        tol: "±1.0",
      },
    ]);

  const partOptions = parts.length > 0 ? parts.map((p) => p.name) : ["衣长", "胸围", "肩宽", "袖长", "下摆"];
  const sizeOptions = sizes.length > 0 ? sizes.map((s) => s.size) : ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="space-y-3">
      <BaseLinkBanner noticeId={noticeId} table="crm_打样通知_成品尺寸表" />

      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_100px_120px_120px_1fr_60px] gap-2 px-3 py-2 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          <div>序号</div>
          <div>部位 · 来自 crm_字典_部位配置表</div>
          <div>尺码 · 来自 crm_字典_尺码配置表</div>
          <div className="text-right">尺寸 (cm)</div>
          <div className="text-right">公差</div>
          <div>聚合 (formula F4)</div>
          <div></div>
        </div>
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-[60px_1fr_100px_120px_120px_1fr_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 font-mono text-[14px]">
            <div className="text-[var(--ink-mute)]">{String(i + 1).padStart(2, "0")}</div>
            <select value={r.part} onChange={(e) => update(r.id, { part: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]">
              {partOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={r.size} onChange={(e) => update(r.id, { size: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]">
              {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" step={0.5} min={0} value={r.value}
              onChange={(e) => update(r.id, { value: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <input value={r.tol} onChange={(e) => update(r.id, { tol: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right focus:outline-none focus:border-[var(--primary)]" />
            <div className="text-[var(--ink-dim)]">{r.part} · {r.size} · {r.value}{r.tol}</div>
            <button onClick={() => remove(r.id)} className="text-[var(--ink-mute)] hover:text-[var(--destructive)] text-center">✕</button>
          </div>
        ))}
        <div className="px-3 py-2 bg-[var(--background)]/40 border-t border-[var(--hairline)]">
          <button onClick={add} className="font-mono text-[14px] text-[var(--primary)] hover:underline">
            + 添加一行
          </button>
        </div>
      </div>

      <div className="border border-dashed border-[var(--hairline-strong)] rounded-md p-3 text-[14px] font-mono text-[var(--ink-mute)]">
        💾 点「保存」将 {rows.length} 行写入 crm_打样通知_成品尺寸表，
        每条记录的 <span className="text-[var(--ink)]">noticeId</span> 自动 link 到 crm_打样通知_基础信息表.{noticeId}。
      </div>
    </div>
  );
}


type AccRow = {
  id: string; name: string; spec: string; qty: number; unit: string; color: string;
};

function AccessoryTable({ noticeId }: { noticeId: string }) {
  const trims = getTrims();   // 来自 crm_字典_辅料配置表

  const [rows, setRows] = useState<AccRow[]>([
    { id: "a1", name: trims[0]?.name ?? "树脂衬 · 胸衬", spec: "60g",  qty: 3, unit: "片", color: "炭灰"     },
    { id: "a2", name: trims[1]?.name ?? "PBT 拉链 · 5#",  spec: "60cm", qty: 3, unit: "条", color: "炭灰"     },
    { id: "a3", name: trims[2]?.name ?? "涤纶缝纫线",     spec: "60/2", qty: 1, unit: "卷", color: "炭灰"     },
    { id: "a4", name: trims[3]?.name ?? "树脂纽扣 · 4眼", spec: "15mm", qty: 6, unit: "颗", color: "本体染色" },
  ]);

  const update = (id: string, p: Partial<AccRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [
      ...rs,
      {
        id: `a${Date.now()}`,
        name: trims[0]?.name ?? "新辅料",
        spec: "",
        qty: 1,
        unit: "个",
        color: "",
      },
    ]);

  const trimOptions = trims.length > 0 ? trims.map((t) => t.name) : ["树脂衬", "拉链", "纽扣", "缝纫线", "包装袋"];

  return (
    <div className="space-y-3">
      <BaseLinkBanner noticeId={noticeId} table="crm_打样通知_辅料表" />

      <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_100px_80px_80px_100px_1fr_60px] gap-2 px-3 py-2 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          <div>编号</div>
          <div>辅料名称 · 来自 crm_字典_辅料配置表</div>
          <div>规格</div>
          <div className="text-right">数量</div>
          <div>单位</div>
          <div>颜色</div>
          <div>辅料聚合 (formula F5)</div>
          <div></div>
        </div>
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-[60px_1fr_100px_80px_80px_100px_1fr_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 font-mono text-[14px]">
            <div className="text-[var(--ink-mute)]">{String(i + 1).padStart(3, "0")}</div>
            <select value={r.name} onChange={(e) => update(r.id, { name: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]">
              {trimOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <input value={r.spec} onChange={(e) => update(r.id, { spec: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]" />
            <input type="number" min={0} step={1} value={r.qty}
              onChange={(e) => update(r.id, { qty: Number(e.target.value) })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 text-right tnum focus:outline-none focus:border-[var(--primary)]" />
            <select value={r.unit} onChange={(e) => update(r.id, { unit: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]">
              {["片", "条", "卷", "颗", "个", "套", "米"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input value={r.color} onChange={(e) => update(r.id, { color: e.target.value })}
              className="bg-transparent border border-[var(--hairline)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--primary)]" />
            <div className="text-[var(--ink)]">
              {r.name} {r.qty}{r.unit} × {r.spec} {r.color}
            </div>
            <button onClick={() => remove(r.id)} className="text-[var(--ink-mute)] hover:text-[var(--destructive)] text-center">✕</button>
          </div>
        ))}
        <div className="px-3 py-2 bg-[var(--background)]/40 border-t border-[var(--hairline)]">
          <button onClick={add} className="font-mono text-[14px] text-[var(--primary)] hover:underline">
            + 添加一行
          </button>
        </div>
      </div>

      <div className="border border-dashed border-[var(--hairline-strong)] rounded-md p-3 text-[14px] font-mono text-[var(--ink-mute)]">
        💾 点「保存」将 {rows.length} 行写入 crm_打样通知_辅料表，
        每条记录的 <span className="text-[var(--ink)]">noticeId</span> 自动 link 到 crm_打样通知_基础信息表.{noticeId}。
      </div>
    </div>
  );
}


function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-16 px-6 text-center">
      <h3 className="font-display text-[18px] font-medium text-[var(--ink)] mb-1">{title}</h3>
      <p className="text-[14px] text-[var(--ink-mute)] max-w-[420px] mx-auto mb-5">{hint}</p>
      {action}
    </div>
  );
}
