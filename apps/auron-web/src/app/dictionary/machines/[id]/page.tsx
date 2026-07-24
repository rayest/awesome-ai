"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMachine } from "@/lib/data";
import { Pencil } from "lucide-react";

/**
 * /dictionary/machines/[id] · 机型配置详情
 *
 * 数据源 · crm_字典_机型配置表（共 6 字段）
 *   link crm_打样工艺单_基础信息表 (双向) ·
 *   机型ID(auto_number) · 普通/高速机(select) ·
 *   机型/口径（寸） · 针数(number) · 转速（转/min）
 */

type Machine = {
  id: string;
  type: "高速机" | "普通机";
  modelSpec: string;       // 机型/口径（寸）
  needle: number;
  rpm: number;
};


const USED_BY_PROCESS = [
  { workNo: "WO-0317-A", programName: "WO0317-DBL-AURON", part: "前片+后片+袖+罗纹",  status: "织造中" },
];

export default function MachineDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const machine = getMachine(id);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success("已保存修改", { description: `${machine?.modelSpec ?? id}`, duration: 3000 });
    setSaving(false);
  };

  if (!machine) {
    return (
      <AdminShell>
        <div className="px-8 py-16 mx-auto max-w-[1280px] text-center">
          <h1 className="font-display text-[24px] font-medium mb-2">未找到机型 {id}</h1>
          <Link href="/dictionary/machines"><Button variant="default" size="md">返回机型配置</Button></Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-[14px] font-mono text-[var(--ink-mute)]">
            <Link href="/dictionary/machines" className="hover:text-[var(--ink)]">机型配置</Link>
            <span>›</span>
            <span className="text-[var(--ink)]">{machine.modelSpec}</span>
            <span className="text-[var(--ink-mute)] ml-2">· {machine.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => router.push("/dictionary/machines")}>返回列表</Button>
            <Button variant="default" size="md" onClick={save} disabled={saving}>
              {saving ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <FabricLabel
            docNo={`MACHINE-${machine.id}`}
            shortCode={machine.modelSpec}
            season={machine.type}
            composition={`${machine.modelSpec} · ${machine.needle}G · ${machine.rpm} 转/min · 普通/高速=${machine.type}`}
            specs={[
              { label: "机型 ID", value: machine.id, mono: true },
              { label: "类型", value: machine.type, mono: false },
              { label: "针数", value: `${machine.needle}G`, mono: true },
              { label: "口径", value: machine.modelSpec.match(/\d+/)?.[0] ?? "—", mono: true },
              { label: "转速", value: `${machine.rpm} r/min`, mono: true },
              { label: "字段数", value: "6 / 6", mono: true },
            ]}
            prices={[
              { label: "运行时数", value: "1,260 h", mono: true },
              { label: "利用率", value: "92%", mono: true },
              { label: "工艺引用", value: `${USED_BY_PROCESS.length} 件`, mono: true },
            ]}
          />
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          <div className="space-y-8">
            <BaseFields machine={machine} />
            <UsedBy rows={USED_BY_PROCESS} />
          </div>
          <div className="space-y-6">
            <Actions id={machine.id} />
            <DataSourceNote />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function FieldRow({ label, value, mono, source }: { label: string; value: string; mono?: boolean; source?: string }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-[var(--hairline)] last:border-b-0">
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0 w-[120px]">{label}</span>
      <span className={`text-[14px] text-[var(--ink)] flex-1 ${mono ? "font-mono tnum" : ""}`}>{value}</span>
      {source && <span className="font-mono text-[14px] text-[var(--ink-mute)]">{source}</span>}
    </div>
  );
}

function BaseFields({ machine }: { machine: Machine }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">
        机型档案 · crm_字典_机型配置表
        <span className="ml-2 font-mono text-[14px] text-[var(--ink-mute)]">6 / 6 字段</span>
      </p>
      <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)]">
        <div className="grid grid-cols-2 gap-x-12">
          <FieldRow label="机型 ID (auto)" value={machine.id} mono source="auto_number" />
          <FieldRow label="机型/口径（寸）" value={machine.modelSpec} source="text" />
          <FieldRow label="普通/高速机" value={machine.type} source="select 高速机/普通机" />
          <FieldRow label="针数" value={`${machine.needle}G`} mono source="number" />
          <FieldRow label="转速（转/min）" value={`${machine.rpm}`} mono source="number" />
          <FieldRow label="双链引用" value="crm_打样工艺单_基础信息表" source="link 双向" />
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
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">源 crm_打样工艺单_基础信息表.机型ID (link)</span>
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
              <span className="text-[14px] text-[var(--ink-dim)] truncate">{r.programName}</span>
              <span className="text-[14px] text-[var(--ink-dim)]">{r.part}</span>
              <Badge tone={r.status === "织造中" ? "info" : "success"} size="sm">{r.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Actions({ id }: { id: string }) {
  return (
    <section>
      <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">快捷操作</p>
      <div className="space-y-2">
        <Link href={`/orders/sample-workorders/new?machine=${id}`} className="block">
          <div className="rounded-md bg-[var(--accent)]/45 p-3 transition-colors hover:bg-[var(--accent)]">
            <p className="text-[14px] font-medium text-[var(--ink)]">+ 用此机型起工艺</p>
            <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">工艺表.机型ID 自动 link</p>
          </div>
        </Link>
        <button className="w-full rounded-md bg-[var(--secondary)] p-3 hover:bg-[var(--accent)]/50 transition-colors text-left">
          <p className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--ink)]">
            <Pencil className="h-3.5 w-3.5" />
            编辑机型
          </p>
          <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">改针数 / 转速 / 类型</p>
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
          <span>主表</span><span className="text-[var(--ink-dim)]">crm_字典_机型配置表 6/6</span>
        </p>
        <p className="text-[var(--ink-mute)] flex justify-between">
          <span>反向 link</span><span className="text-[var(--ink-dim)]">crm_打样工艺单_基础信息表 双向</span>
        </p>
      </div>
    </section>
  );
}
