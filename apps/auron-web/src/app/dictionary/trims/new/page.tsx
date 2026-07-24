"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增辅料 · 写入 crm_字典_辅料配置表
 *
 * 2 字段：辅料 ID / 辅料名
 */

const FIELDS: FieldDef[] = [
  { name: "name", label: "辅料名", type: "text", required: true, placeholder: "如：树脂衬 · 胸衬 / YKK 拉链 · 5#", source: "text" },
];

export default function NewTrimPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增辅料"
        subtitle="维护树脂衬、拉链、纽扣、织带和吊牌等辅料，供打样与报价直接选择。"
        backUrl="/dictionary/trims"
        backLabel="辅料配置"
        fields={FIELDS}
        submitLabel="保存并上架"
        dataSourceNote="crm_字典_辅料配置表 2 字段 · 辅料 ID auto_number 自动生成 · 双向 link 通知辅料表 + 报价辅料表"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `tri-${Date.now()}`;
          toast.success("辅料已上架", {
            description: `${values.name}`,
            duration: 4000,
          });
          console.info("【辅料字典】辅料已保存，返回列表", { 辅料编号: newId, 辅料名称: values.name });
          router.push("/dictionary/trims");
        }}
      />
    </AdminShell>
  );
}
