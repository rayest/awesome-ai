"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增尺码 · 写入 crm_字典_尺码配置表
 *
 * 5 字段：尺码 ID / 尺码 / 身高 cm / 欧码 / 号型
 */

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "均码"];

const FIELDS: FieldDef[] = [
  { name: "size",      label: "尺码",      type: "select",   required: true, options: SIZE_OPTIONS, source: "select 7 选项" },
  { name: "heightCm",  label: "身高 (cm)", type: "number",   required: true, placeholder: "如：170", source: "number", mono: true },
  { name: "euLetter",  label: "欧码",      type: "text",     placeholder: "如：M / —", source: "text" },
  { name: "ageOrNumeric", label: "号型",   type: "text",     required: true, placeholder: "如：170/88A", source: "text" },
];

export default function NewSizePage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增尺码"
        subtitle="通知单和报价单的尺码都从这里选。crm_字典_尺码配置表 · 写入 5 字段"
        backUrl="/dictionary/sizes"
        backLabel="尺码配置"
        fields={FIELDS}
        submitLabel="保存并上架"
        dataSourceNote="crm_字典_尺码配置表 5 字段 · 尺码 ID auto_number 自动生成 · link 通知成品尺寸 + 报价尺码范围"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `sz-${Date.now()}`;
          toast.success("尺码已上架", {
            description: `${values.size} · ${values.heightCm}cm · ${values.ageOrNumeric}`,
            duration: 4000,
          });
          router.push(`/dictionary/sizes/${newId}`);
        }}
      />
    </AdminShell>
  );
}