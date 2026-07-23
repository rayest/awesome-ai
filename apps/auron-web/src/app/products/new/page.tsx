"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新增产品 · 写入 crm_产品表
 *
 * 9 字段（全部 text）由师傅在工艺沉淀后录入
 */

const CATEGORIES = ["外套", "打底", "T恤", "配饰", "围巾", "其他"];

const FIELDS: FieldDef[] = [
  { name: "styleNo",    label: "款号",         type: "text",     required: true, placeholder: "如：GH-26FW-0317", source: "text（主键）" },
  { name: "programName",label: "程序名",       type: "text",     required: true, placeholder: "如：WO0317-DBL-AURON", source: "text（机台识别）" },
  { name: "category",   label: "类目",         type: "select",   required: true, options: CATEGORIES, source: "text（前端归类）" },
  { name: "name",       label: "品名",         type: "text",     required: true, placeholder: "如：羊毛双面呢立领大衣", source: "text" },
  { name: "yarn",       label: "纱线",         type: "text",     placeholder: "如：澳毛80s / 长绒棉60s (60/40)", source: "text（多种以 / 分隔）" },
  { name: "craft",      label: "工艺描述",     type: "textarea", placeholder: "如：圆机双面 · 罗纹 1×1 · 缸染低温", source: "text" },
  { name: "sizeRange",  label: "尺码",         type: "text",     placeholder: "如：S/M/L/XL", source: "text" },
  { name: "gsm",        label: "平方克 GSM",   type: "text",     placeholder: "如：320", source: "text（数字字符串）" },
  { name: "color",      label: "颜色",         type: "text",     placeholder: "如：炭灰/墨黑/驼色（多种以 / 分隔）", source: "text" },
];

export default function NewProductPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增产品主数据"
        subtitle="crm_产品表 · 写入 9 字段（全部 text，无 link）"
        backUrl="/products"
        backLabel="产品主数据"
        fields={FIELDS}
        submitLabel="保存并加入字典"
        dataSourceNote="crm_产品表 9 字段 · 全部 text · 产品表是 crm 中的'孤岛'，需要按款号人工 join 工艺 / 报价"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          toast.success("产品已加入字典", {
            description: `${values.name} · ${values.styleNo}`,
            duration: 4000,
          });
          router.push("/products");
        }}
      />
    </AdminShell>
  );
}
