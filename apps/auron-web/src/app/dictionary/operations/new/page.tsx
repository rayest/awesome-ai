"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增工序 · 写入 crm_字典_工序表
 *
 * 3 字段：工序 ID / 类目 / 工序名 + 单价
 */

const CATEGORIES = [
  "前道 - 复合",
  "前道 - 拉毛",
  "染整 - 缸染",
  "染整 - 浸染",
  "染整 - 整染",
  "缝制 - 平缝",
  "缝制 - 锁边",
  "缝制 - 整烫",
  "复合 - 复合",
];

const FIELDS: FieldDef[] = [
  { name: "category", label: "工序类目",  type: "select",   required: true, options: CATEGORIES, source: "text" },
  { name: "name",     label: "工序名",    type: "text",     required: true, placeholder: "如：复合 + 拉毛", source: "text" },
  { name: "price",    label: "单价",      type: "text",     required: true, placeholder: "如：18 元/件", source: "text" },
];

export default function NewOperationPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增工序"
        subtitle="报价单的「染整 + 缝制 + 辅料 + 其他费用」就是从这张表挑出来的。crm_字典_工序表 · 写入 3 字段"
        backUrl="/dictionary/operations"
        backLabel="工序字典"
        fields={FIELDS}
        submitLabel="保存并上架"
        dataSourceNote="crm_字典_工序表 3 字段 · 工序 ID auto_number 自动生成 · 双向 link 报价染色/缝制工艺表"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `op-${Date.now()}`;
          toast.success("工序已上架", {
            description: `${values.name} · ${values.price}`,
            duration: 4000,
          });
          router.push(`/dictionary/operations/${newId}`);
        }}
      />
    </AdminShell>
  );
}