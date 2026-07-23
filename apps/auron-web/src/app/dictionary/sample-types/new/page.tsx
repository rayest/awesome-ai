"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增样品种类 · 写入 crm_字典_样品种类表
 *
 * 2 字段：样品种类 ID / 名称
 */

const FIELDS: FieldDef[] = [
  { name: "name", label: "样品种类名", type: "text", required: true, placeholder: "如：外套 / 打底 / T恤 / 围巾", source: "text" },
];

export default function NewSampleTypePage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增样品种类"
        subtitle="通知单和报价单的「产品类目」下拉选项就从这里来。crm_字典_样品种类表 · 写入 2 字段"
        backUrl="/dictionary/sample-types"
        backLabel="样品种类"
        fields={FIELDS}
        submitLabel="保存并上架"
        dataSourceNote="crm_字典_样品种类表 2 字段 · 样品种类 ID auto_number 自动生成 · 单向 link 通知基础信息表.category"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `st-${Date.now()}`;
          toast.success("样品种类已上架", {
            description: `${values.name}`,
            duration: 4000,
          });
          router.push(`/dictionary/sample-types/${newId}`);
        }}
      />
    </AdminShell>
  );
}