"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增测量部位 · 写入 crm_字典_部位配置表
 *
 * 2 字段：部位 ID / 部位名
 */

const FIELDS: FieldDef[] = [
  { name: "name", label: "部位名", type: "text", required: true, placeholder: "如：衣长 / 袖长 / 肩宽", source: "text" },
];

export default function NewPartPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增测量部位"
        subtitle="工艺单的尺寸要求表就是从这些部位里选。crm_字典_部位配置表 · 写入 2 字段"
        backUrl="/dictionary/parts"
        backLabel="测量部位"
        fields={FIELDS}
        submitLabel="保存并上架"
        dataSourceNote="crm_字典_部位配置表 2 字段 · 部位 ID auto_number 自动生成 · 单向 link 工艺单尺寸要求表"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `p-${Date.now()}`;
          toast.success("部位已上架", {
            description: `${values.name}`,
            duration: 4000,
          });
          router.push(`/dictionary/parts/${newId}`);
        }}
      />
    </AdminShell>
  );
}