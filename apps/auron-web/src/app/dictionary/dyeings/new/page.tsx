"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增染色工艺 · 写入 crm_字典_染色工艺信息表
 *
 * 5 字段：染色工艺 ID / 名称 / 分类 / 单价 / 计费方式
 */

const CATEGORIES = ["标准染色", "特殊染色", "染整", "印花"];
const PRICING_MODES = ["按公斤", "按件", "按米", "按匹"];

const FIELDS: FieldDef[] = [
  { name: "name",        label: "染色工艺名", type: "text",   required: true, placeholder: "如：缸染低温", source: "text" },
  { name: "category",    label: "分类",       type: "select", required: true, options: CATEGORIES, source: "select 标准/特殊" },
  { name: "price",       label: "单价",       type: "text",   required: true, placeholder: "如：8.4元/公斤", source: "text" },
  { name: "pricingMode", label: "计费方式",   type: "select", required: true, options: PRICING_MODES, source: "text" },
];

export default function NewDyeingPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增染色工艺"
        subtitle="维护缸染、成衣染和整染等染色方案及标准费用，供工艺与报价复用。"
        backUrl="/dictionary/dyeings"
        backLabel="染色工艺"
        fields={FIELDS}
        submitLabel="保存并上架"
        dataSourceNote="crm_字典_染色工艺信息表 5 字段 · 染色工艺 ID auto_number 自动生成 · 双向 link 报价染色工艺表"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `dye-${Date.now()}`;
          toast.success("染色工艺已上架", {
            description: `${values.name} · ${values.price} · ${values.pricingMode}`,
            duration: 4000,
          });
          console.info("【染色工艺】工艺已保存，返回列表", { 工艺编号: newId, 工艺名称: values.name });
          router.push("/dictionary/dyeings");
        }}
      />
    </AdminShell>
  );
}
