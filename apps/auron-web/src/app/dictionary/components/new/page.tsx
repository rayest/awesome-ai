"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增部件 · 写入 crm_字典_部件配置表
 *
 * 5 字段：部件 ID / 位置 / 名称 / 是否主片 / 备注
 */

const LOCATIONS = ["前身", "后身", "袖子", "领", "口袋", "下摆", "侧缝", "其他"];

const FIELDS: FieldDef[] = [
  { name: "location", label: "位置",     type: "select",   required: true, options: LOCATIONS, source: "text" },
  { name: "name",     label: "名称",     type: "text",     required: true, placeholder: "如：前片 / 后片 / 袖片", source: "text" },
  { name: "isPart",   label: "是否主片", type: "select",   required: true, options: ["是", "否"], source: "checkbox" },
  { name: "remark",   label: "备注",     type: "textarea", placeholder: "如：领口-下摆，2 片对称", source: "text" },
];

export default function NewComponentPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增部件"
        subtitle="一件衣服由哪些裁片组成 — 前片/后片/袖/领/口袋。crm_字典_部件配置表 · 写入 5 字段"
        backUrl="/dictionary/components"
        backLabel="部件配置"
        fields={FIELDS}
        submitLabel="保存并上架"
        dataSourceNote="crm_字典_部件配置表 5 字段 · 部件 ID auto_number 自动生成 · 单向 link 工艺单基础信息表.part"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `pa-${Date.now()}`;
          toast.success("部件已上架", {
            description: `${values.location} · ${values.name} · ${values.isPart === "是" ? "主片" : "辅料位"}`,
            duration: 4000,
          });
          router.push(`/dictionary/components/${newId}`);
        }}
      />
    </AdminShell>
  );
}