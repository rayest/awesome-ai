"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";

/**
 * 新建物料 · 写入 crm_字典_物料信息表
 *
 * 11 字段由师傅/仓库录入的核心 9 项
 */

const CATEGORIES = ["纱线", "面料", "辅料"];
const SPEC_OPTIONS = ["33D/12F", "20/30", "40/30", "40/20/24F", "100D", "80D", "55/48*2", "200D", "20D", "75D/72F"];
const TWIST = ["Z", "S"];
const SUPPLIERS = ["康赛妮", "溢达", "兰精", "吉林化纤", "桐昆", "新凤鸣"];

const FIELDS: FieldDef[] = [
  { name: "yarnName",  label: "物料名称",     type: "text",     required: true, placeholder: "如：澳毛 80s / 树脂纽扣", source: "text" },
  { name: "category",  label: "类别",         type: "select",   required: true, options: CATEGORIES, source: "text（前端归类）" },
  { name: "spec",      label: "纱线规格",     type: "select",   required: true, options: SPEC_OPTIONS, source: "select 10 选项（base 内置）", visibleWhen: { field: "category", equals: "纱线" } },
  { name: "twist",     label: "捻向",         type: "select",   required: true, options: TWIST, source: "select Z/S", visibleWhen: { field: "category", equals: "纱线" } },
  { name: "color",     label: "颜色",         type: "text",     placeholder: "如：本白/原色", source: "text" },
  { name: "batch",     label: "批号",         type: "text",     placeholder: "如：B2408", source: "text" },
  { name: "supplier",  label: "供应商",       type: "select",   required: true, options: SUPPLIERS, source: "text（前端枚举）" },
  { name: "unitPrice", label: "单价（元/㎏）", type: "number",   required: true, placeholder: "如：420", source: "number", mono: true },
  { name: "yarnMode",  label: "穿纱方式",     type: "text",     placeholder: "如：满穿 Z·S 交替", source: "formula F26（基线为参考）", visibleWhen: { field: "category", equals: "纱线" } },
];

export default function NewMaterialPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增物料 / 纱线"
        subtitle="先选择物料类别，再填写对应的规格、供应商和价格。纱线类会额外显示捻向与穿纱方式。"
        backUrl="/dictionary/materials"
        backLabel="物料字典"
        fields={FIELDS}
        submitLabel="保存并上架"
        dataSourceNote="crm_字典_物料信息表 11 字段 · 物料ID auto_number 自动生成 · 双向 link 织造用料表"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `MAT-${String(Date.now()).slice(-5)}`;
          toast.success("物料已上架", {
            description: `${values.yarnName} · ¥${values.unitPrice}/公斤`,
            duration: 4000,
          });
          console.info("【物料字典】新物料已保存，返回列表", { 物料编号: newId, 物料名称: values.yarnName });
          router.push("/dictionary/materials");
        }}
      />
    </AdminShell>
  );
}
