"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["外套", "打底", "T恤", "配饰", "围巾", "其他"];

const FIELDS: FieldDef[] = [
  {
    name: "styleNo",
    label: "款号",
    type: "text",
    required: true,
    placeholder: "如：GH-26FW-0317",
    mono: true,
    section: {
      title: "产品身份",
      description: "款号用于跨单据识别产品，品名和类目帮助业务人员快速查找。",
    },
  },
  { name: "name", label: "品名", type: "text", required: true, placeholder: "如：羊毛双面立领外套" },
  { name: "category", label: "类目", type: "select", required: true, options: CATEGORIES },
  { name: "programName", label: "机台程序名", type: "text", required: true, placeholder: "如：WO0317-DBL-AURON", mono: true },
  {
    name: "yarn",
    label: "主要纱线",
    type: "text",
    required: true,
    placeholder: "如：澳毛 80s 60% / 长绒棉 60s 40%",
    section: {
      title: "生产规格",
      description: "记录可复用的核心工艺信息；详细工艺仍以打样工艺单为准。",
    },
  },
  { name: "gsm", label: "目标克重（g/㎡）", type: "number", required: true, placeholder: "如：320" },
  { name: "sizeRange", label: "可用尺码", type: "text", required: true, placeholder: "如：S / M / L / XL" },
  { name: "color", label: "常用颜色", type: "text", required: true, placeholder: "如：炭灰 / 墨黑 / 驼色" },
  {
    name: "craft",
    label: "工艺要点",
    type: "textarea",
    required: true,
    placeholder: "说明组织、织法、染整和生产时需要特别留意的事项。",
  },
];

export default function NewProductPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新增产品"
        subtitle="沉淀已经确认的产品与工艺信息，后续打样、报价时可以直接复用。"
        backUrl="/products"
        backLabel="产品主数据"
        fields={FIELDS}
        submitLabel="保存产品"
        rightSlot={
          <section className="rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-5">
            <p className="text-[16px] font-semibold">保存后可用于</p>
            <div className="mt-4 space-y-3 text-[13px]">
              <div><Badge tone="info" size="sm">打样</Badge><span className="ml-2">通知单快速带入款号与品名</span></div>
              <div><Badge tone="success" size="sm">工艺</Badge><span className="ml-2">复用程序名与生产规格</span></div>
              <div><Badge tone="primary" size="sm">报价</Badge><span className="ml-2">减少重复录入与款号错配</span></div>
            </div>
            <p className="mt-4 border-t border-[var(--hairline)] pt-4 text-[12px] leading-5 text-[var(--ink-mute)]">
              如果工艺仍在试样，请先在打样流程中完善，确认后再沉淀为产品。
            </p>
          </section>
        }
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          toast.success("产品已加入字典", {
            description: `${values.name} · ${values.styleNo}`,
            duration: 4000,
          });
          console.info("【产品】产品主数据已保存，可用于后续打样和报价", {
            款号: values.styleNo,
            品名: values.name,
          });
          router.push("/products");
        }}
      />
    </AdminShell>
  );
}
