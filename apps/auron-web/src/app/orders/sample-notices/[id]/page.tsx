"use client";

import type { ReactNode } from "react";
import { use } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * 打样通知 · 详情页
 *
 * 这是 Auron 的「文档级」页面 —— 顶部唛头承载全部关键参数，
 * 下方 tabs 区分不同子表。
 *
 * 这里演示：
 *  - 唛头的实际用法（代替传统详情页头）
 *  - Tabs (shadcn 风格) 在文档上的应用
 *  - 操作岛 + 顶部 CTA 区的协调
 */

export default function SampleNoticeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 面包屑 */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-mute)] mb-4">
          <Link href="/orders/sample-notices" className="hover:text-[var(--ink)]">
            打样通知
          </Link>
          <span>›</span>
          <span className="text-[var(--ink)]">{id}</span>
        </div>

        {/* ─── 唛头：文档级头部 ─── */}
        <div className="mb-6">
          <FabricLabel
            docNo="SMPL-2026-0317-A"
            shortCode="GH-QS-007"
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
              { label: "跟单", value: "李白", mono: true },
            ]}
          />
        </div>

        {/* 页面级操作按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-medium tracking-tight">
              羊毛双面呢 · 立领大衣
            </h1>
            <p className="mt-1 flex items-center gap-2 text-[12px] font-mono text-[var(--ink-mute)]">
              <span>客户：乾盛服饰</span>
              <span className="text-[var(--hairline-strong)]">|</span>
              <span>业务：李白</span>
              <span className="text-[var(--hairline-strong)]">|</span>
              <Badge tone="info" size="sm">前道中</Badge>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">打回</Button>
            <Button variant="outline" size="md">复制上版</Button>
            <Button variant="default" size="md">推进至下一道</Button>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <Tabs defaultValue="notice">
          <TabsList>
            <TabsTrigger value="notice" count={1}>
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

          {/* Tab 1：通知基础信息 */}
          <TabsContent value="notice">
            <NoticeBaseFields />
          </TabsContent>

          {/* Tab 2：成品尺寸 */}
          <TabsContent value="size">
            <SizeTable />
          </TabsContent>

          {/* Tab 3：辅料 */}
          <TabsContent value="accessory">
            <AccessoryTable />
          </TabsContent>

          {/* Tab 4：工艺单（占位） */}
          <TabsContent value="workorder">
            <EmptyState
              title="尚未创建工艺单"
              hint="本打样通知可以转工艺单，用于配置织造用料 / 纱线排列 / 尺寸要求。点击下方按钮立刻转。"
              action={
                <Link href="/orders/sample-workorders/new">
                  <Button variant="default" size="md">转工艺单 →</Button>
                </Link>
              }
            />
          </TabsContent>

          {/* Tab 5：报价（占位） */}
          <TabsContent value="quote">
            <EmptyState
              title="尚未生成报价"
              hint="只有产生报价后，系统才会写入客户档案与产品主数据。"
              action={
                <Link href="/orders/quotations/new">
                  <Button variant="default" size="md">生成报价 →</Button>
                </Link>
              }
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
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[120px]">
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

function NoticeBaseFields() {
  const fields: Array<[string, ReactNode, boolean?]> = [
    ["通知单号", "SMPL-2026-0317-A"],
    ["客户名称", "乾盛服饰有限公司"],
    ["客户编码", "GH-QS-007"],
    ["产品名", "羊毛双面呢 · 立领大衣"],
    ["品名", "羊毛双面呢"],
    ["厂款号", "GH-QS-007-26FW-0317"],
    ["颜色", "炭灰"],
    ["交样数量", "3 件"],
    ["交样尺码", "S / M / L"],
    ["交样日期", "2026-07-28"],
    ["通知日期", "2026-07-15"],
    ["业务部负责人", "李白"],
    ["总经理", "陈总"],
    ["前道打样师傅", "老周"],
    ["后道打样师傅", "阿亮"],
    ["特殊纱线", "—"],
    ["染色要求", "缸染低温 · 色牢度 ≥ 4 级"],
    ["前道工艺要求", "双面织造 · 罗纹 1×1"],
    ["后道工艺要求", "免烫 · 蒸汽定型"],
    ["产品图示", "已上传（2 张）"],
    ["进度追踪", "前道织造中（80%）"],
  ];
  return <FieldGrid fields={fields} />;
}

function SizeTable() {
  // 9 行尺寸：3 尺码 × 3 部位
  const rows = [
    { part: "衣长",   s: 88,  m: 92,  l: 96,  tolerance: "±1.5" },
    { part: "胸围",   s: 108, m: 114, l: 120, tolerance: "±2.0" },
    { part: "肩宽",   s: 44,  m: 46,  l: 48,  tolerance: "±1.0" },
  ];
  return (
    <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
      <table className="w-full font-mono text-[12px]">
        <thead>
          <tr className="bg-[var(--secondary)]/40 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <th className="px-3 py-2 text-left">部位</th>
            <th className="px-3 py-2 text-right">S</th>
            <th className="px-3 py-2 text-right">M</th>
            <th className="px-3 py-2 text-right">L</th>
            <th className="px-3 py-2 text-right">公差 +/-</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.part} className="border-t border-[var(--hairline)]">
              <td className="px-3 py-2 text-[var(--ink)]">{r.part}</td>
              <td className="px-3 py-2 text-right tnum">{r.s}</td>
              <td className="px-3 py-2 text-right tnum">{r.m}</td>
              <td className="px-3 py-2 text-right tnum">{r.l}</td>
              <td className="px-3 py-2 text-right tnum text-[var(--ink-mute)]">{r.tolerance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccessoryTable() {
  const rows = [
    { name: "树脂衬 · 胸衬", spec: "60g", qty: 3, unit: "片", color: "炭灰", note: "低温压烫" },
    { name: "PBT 拉链 · 5#", spec: "60cm", qty: 3, unit: "条", color: "炭灰", note: "YKK 同色" },
    { name: "涤纶缝纫线", spec: "60/2", qty: 1, unit: "卷", color: "炭灰", note: "— " },
    { name: "树脂纽扣 · 4 眼", spec: "15mm", qty: 6, unit: "颗", color: "本体染色", note: "外发染色" },
  ];
  return (
    <div className="border border-[var(--hairline)] rounded-md overflow-hidden">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[var(--secondary)]/40 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] font-mono">
            <th className="px-3 py-2 text-left">辅料</th>
            <th className="px-3 py-2 text-left">规格</th>
            <th className="px-3 py-2 text-right">数量</th>
            <th className="px-3 py-2 text-left">单位</th>
            <th className="px-3 py-2 text-left">颜色</th>
            <th className="px-3 py-2 text-left">备注</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-[var(--hairline)]">
              <td className="px-3 py-2 text-[var(--ink)]">{r.name}</td>
              <td className="px-3 py-2 tnum text-[var(--ink-dim)]">{r.spec}</td>
              <td className="px-3 py-2 text-right tnum">{r.qty}</td>
              <td className="px-3 py-2 text-[var(--ink-mute)]">{r.unit}</td>
              <td className="px-3 py-2 text-[var(--ink-dim)]">{r.color}</td>
              <td className="px-3 py-2 text-[var(--ink-mute)]">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <h3 className="font-display text-[16px] font-medium text-[var(--ink)] mb-1">{title}</h3>
      <p className="text-[12px] text-[var(--ink-mute)] max-w-[420px] mx-auto mb-5">{hint}</p>
      {action}
    </div>
  );
}
