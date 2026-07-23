"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增机型 · 写入 crm_字典_机型配置表
 *
 * 6 字段由仓库/师傅录入
 */

const MACHINE_TYPES = ["高速机", "普通机"];

const FIELDS: FieldDef[] = [
  { name: "modelSpec", label: "机型 / 口径（寸）", type: "text",     required: true, placeholder: "如：广源 GY-18 寸", source: "text" },
  { name: "type",      label: "普通 / 高速机",    type: "select",   required: true, options: MACHINE_TYPES, source: "select 2 选项" },
  { name: "needles",   label: "针数 (G)",         type: "number",   required: true, placeholder: "如：18", source: "number", mono: true },
  { name: "rpm",       label: "转速（转/min）",    type: "number",   required: true, placeholder: "如：28", source: "number", mono: true },
];

export default function NewMachinePage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增机型配置"
        subtitle="师傅录入。crm_字典_机型配置表 · 写入 4 字段"
        backUrl="/dictionary/machines"
        backLabel="机型配置"
        fields={FIELDS}
        submitLabel="保存并加入字典"
        dataSourceNote="crm_字典_机型配置表 6 字段 · 机型ID auto_number 自动生成 · 双向 link 工艺基础表"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `M-${String(Date.now()).slice(-5)}`;
          toast.success("机型已加入字典", {
            description: `${values.modelSpec} · ${values.needles}G · ${values.rpm} r/min`,
            duration: 4000,
          });
          router.push(`/dictionary/machines/${newId}`);
        }}
      />
    </AdminShell>
  );
}
