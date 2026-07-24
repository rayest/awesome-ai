"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Pencil } from "lucide-react";
import { getMaterial } from "@/lib/data";

/**
 * /dictionary/materials/[id] · 物料字典详情
 *
 * 数据源 · crm_字典_物料信息表（共 11 字段）
 *   纱线名称 · 供应商 · 规格(select 10 选项) · 单价(元/㎏) ·
 *   link crm_打样工艺单_织造用料表 (双向) · 颜色 ·
 *   类别 · 捻向(select Z/S) · 物料ID(auto_number) ·
 *   批号 · 穿纱方式(formula)
 */

type Material = {
  id: string;
  yarnName: string;
  category: string;
  spec: string;
  twist: "Z" | "S";
  color: string;
  batch: string;
  supplier: string;
  unitPrice: number;
  yarnMode: string;             // 穿纱方式（公式）
};


const USED_BY_PROCESS = [
  { workNo: "WO-0317-A", part: "前片+后片+袖+罗纹", ratio: "60/40",  programName: "WO0317-DBL-AURON" },
];

export default function MaterialDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const material = getMaterial(id);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success("已保存修改", { description: `${material?.yarnName ?? id} · ¥${material?.unitPrice}/公斤`, duration: 3000 });
    setSaving(false);
  };

  if (!material) {
    return (
      <AdminShell>
        <div className="px-8 py-16 mx-auto max-w-[1280px] text-center">
          <h1 className="font-display text-[24px] font-medium mb-2">未找到物料 {id}</h1>
          <Link href="/dictionary/materials"><Button variant="default" size="md">返回物料字典</Button></Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)]">
            <Link href="/dictionary/materials" className="hover:text-[var(--ink)]">物料 / 纱线</Link>
            <span>›</span>
            <span className="text-[var(--ink)]">{material.yarnName}</span>
            <span className="text-[var(--ink-mute)] ml-2">· {material.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => router.push("/dictionary/materials")}>返回列表</Button>
            <Button variant="default" size="md" onClick={save} disabled={saving}>
              {saving ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <FabricLabel
            docNo={`MATERIAL-${material.id}`}
            shortCode={material.spec}
            season={material.supplier}
            composition={`${material.yarnName} · ${material.supplier} · ${material.color}`}
            specs={[
              { label: "物料 ID", value: material.id, mono: true },
              { label: "纱线名", value: material.yarnName },
              { label: "规格", value: material.spec, mono: true },
              { label: "捻向", value: material.twist, mono: true },
              { label: "类别", value: material.category },
              { label: "穿纱", value: material.yarnMode },
            ]}
            prices={[
              { label: "单价", value: `¥ ${material.unitPrice}/公斤`, mono: true },
              { label: "批号", value: material.batch, mono: true },
              { label: "被工艺引用", value: `${USED_BY_PROCESS.length} 件`, mono: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          <div className="space-y-8">
            <BaseFields material={material} />
            <UsedBy rows={USED_BY_PROCESS} />
          </div>
          <div className="space-y-6">
            <Actions mid={material.id} />
            <DataSourceNote />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function FieldRow({ label, value, mono, source }: { label: string; value: React.ReactNode; mono?: boolean; source?: string }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[120px]">{label}</span>
      <span className={`text-[14px] text-[var(--ink)] flex-1 ${mono ? "font-mono tnum" : ""}`}>{value}</span>
      {source && <span className="font-mono text-[14px] text-[var(--ink-mute)]">{source}</span>}
    </div>
  );
}

function BaseFields({ material }: { material: Material }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">
        物料档案 · crm_字典_物料信息表
        <span className="ml-2 font-mono text-[14px] text-[var(--ink-mute)]">11 / 11 字段</span>
      </p>
      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)]">
        <div className="grid grid-cols-2 gap-x-12">
          <FieldRow label="物料ID (auto)" value={material.id} mono source="auto_number" />
          <FieldRow label="纱线名称" value={material.yarnName} source="text" />
          <FieldRow label="供应商" value={material.supplier} source="text" />
          <FieldRow label="类别" value={material.category} source="text" />
          <FieldRow label="规格" value={material.spec} mono source="select 10 选项" />
          <FieldRow label="捻向" value={material.twist} mono source="select Z/S" />
          <FieldRow label="批号" value={material.batch} mono source="text" />
          <FieldRow label="颜色" value={material.color} source="text" />
          <FieldRow label="单价（元/㎏）" value={`¥ ${material.unitPrice.toLocaleString()}`} mono source="number" />
          <FieldRow label="穿纱方式" value={material.yarnMode} source="formula F26" />
          <FieldRow label="双链引用" value={
            <span className="font-mono text-[14px] text-[var(--info)]">crm_打样工艺单_织造用料表</span>
          } source="link 双向" />
        </div>
      </div>
    </section>
  );
}

function UsedBy({ rows }: { rows: typeof USED_BY_PROCESS }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 border-b border-[var(--hairline)] pb-2">
        <p className="font-display text-[18px] font-medium text-[var(--ink)]">被工艺单引用</p>
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">源 crm_打样工艺单_织造用料表（双向 link）</span>
      </div>
      {rows.length === 0 ? (
        <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-6 text-center">
          <p className="text-[14px] font-mono text-[var(--ink-mute)]">暂无工艺引用</p>
        </div>
      ) : (
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          {rows.map((r, i) => (
            <Link
              key={i}
              href={`/orders/sample-workorders/${r.workNo}`}
              className="grid grid-cols-[140px_1fr_1fr_120px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors"
            >
              <span className="font-mono text-[14px] font-medium text-[var(--ink)]">{r.workNo}</span>
              <span className="text-[14px] text-[var(--ink-dim)]">{r.part}</span>
              <span className="text-[14px] text-[var(--ink-dim)] truncate">{r.programName}</span>
              <span className="font-mono text-[14px] text-[var(--ink-mute)] text-right">{r.ratio}<ArrowUpRight className="inline w-3 h-3 ml-1" /></span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Actions({ mid }: { mid: string }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">快捷操作</p>
      <div className="space-y-2">
        <Link href={`/orders/sample-workorders/new?material=${mid}`} className="block">
          <div className="rounded-md bg-[var(--accent)]/45 p-3 transition-colors hover:bg-[var(--accent)]">
            <p className="text-[14px] font-medium text-[var(--ink)]">+ 用此纱线新增工艺</p>
            <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">织造用料表自动 link</p>
          </div>
        </Link>
        <button className="w-full rounded-md bg-[var(--secondary)] p-3 hover:bg-[var(--accent)]/50 transition-colors text-left">
          <p className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--ink)]">
            <Pencil className="h-3.5 w-3.5" />
            编辑物料
          </p>
          <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">改单价 / 供应商 / 批号</p>
        </button>
      </div>
    </section>
  );
}

function DataSourceNote() {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">数据源</p>
      <div className="border border-[var(--hairline)] rounded-md p-3 bg-[var(--secondary)]/40 space-y-1 font-mono text-[14px]">
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>主表</span><span className="text-[var(--ink-dim)]">crm_字典_物料信息表 11/11</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>反向 link</span><span className="text-[var(--ink-dim)]">crm_打样工艺单_织造用料表 双向</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>Formula</span><span className="text-[var(--ink-dim)]">穿纱方式 F26</span>
        </p>
      </div>
    </section>
  );
}
