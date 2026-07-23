"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";
import { Badge } from "@/components/ui/badge";

/**
 * 新建报价单 · 写入 crm_报价单_基础信息表
 *
 * 33 字段中由报价员录入的核心 17 字段
 * 5 张子表（染色/缝制/辅料/其他/总计）在详情页补
 */

const CUSTOMERS = ["CUST-QS-001 乾盛服饰", "CUST-HD-002 弘大针织", "CUST-MD-019 鸣笛工贸", "CUST-QD-044 巧岛针织"];
const WORKORDERS = ["WO-2026-0317-A 羊毛双面呢", "WO-2026-0316-B 罗纹打底衫", "WO-2026-0315-A 圆机 T 恤"];
const DEPTS = ["管理层", "业务部", "报价组", "财务部"];
const COLORS = ["黑色", "白色", "灰色"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const FIELDS: FieldDef[] = [
  { name: "customer",      label: "客户",            type: "select", required: true, options: CUSTOMERS, source: "lookup 客户表" },
  { name: "workorder",     label: "打样工艺单",      type: "select", required: true, options: WORKORDERS, source: "link 工艺基础表" },
  { name: "dept",          label: "部门",            type: "select", options: DEPTS, source: "link 部门表（填报人所在）" },
  { name: "product",       label: "品名",            type: "text",   placeholder: "如：羊毛双面呢", source: "lookup 通知表" },
  { name: "styleNo",       label: "款号",            type: "text",   placeholder: "如：GH-QS-007-26FW-0317", source: "lookup" },
  { name: "orderQty",      label: "订单数量",         type: "number", required: true, placeholder: "如：200", source: "number" },
  { name: "orderColor",    label: "订单颜色",         type: "select", options: COLORS, source: "select 3 选项" },
  { name: "quoteSizes",    label: "订单尺码范围",     type: "select", options: SIZES, source: "link 尺码字典（多选）" },
  { name: "quoteSizeMain", label: "报价尺码",         type: "select", options: SIZES, source: "link 尺码字典" },
  { name: "weaveLoss",     label: "织造损耗",         type: "text",   placeholder: "如：5%", source: "text（crm 总计也存了一份）" },
  { name: "dyeLoss",       label: "染色损耗",         type: "text",   placeholder: "如：5%", source: "text" },
  { name: "rate",          label: "税率",             type: "text",   defaultValue: "13%", source: "13% 增值税" },
  { name: "machineRate",   label: "机台费标准",       type: "text",   placeholder: "如：¥ 8 / 小时", source: "text" },
  { name: "mgmtFee",       label: "管理费系数",       type: "text",   defaultValue: "1.30", source: "number（缝制公式 F18 用）" },
  { name: "dyeReq",        label: "染色要求",         type: "textarea", placeholder: "如：缸染低温 · 色牢度 ≥ 4 级" },
  { name: "seamCraft",     label: "缝合工艺",         type: "textarea", placeholder: "如：1×1 罗纹 · 双面拼合" },
  { name: "packMethod",    label: "包装方式",         type: "text",   placeholder: "如：PE 自封袋 · 10 件 / 包" },
  { name: "delivery",      label: "送货方式 / 地址",   type: "text",   placeholder: "如：义乌 · 物流 5 天" },
  { name: "expiresAt",     label: "有效期",           type: "date",   source: "datetime" },
  { name: "note",          label: "其他信息",         type: "textarea", placeholder: "客户要求 7/28 前交样" },
];

export default function NewQuotationPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新建报价单"
        subtitle="报价员出价。crm_报价单_基础信息表 · 写入 17 字段；5 张子表（染色 / 缝制 / 辅料 / 其他 / 总计）在详情页录入"
        backUrl="/orders/quotations"
        backLabel="报价"
        fields={FIELDS}
        submitLabel="保存并开始报价"
        dataSourceNote="crm_报价单_基础信息表 33 字段 · 5 张子表 + 19 字段 crm_报价单_总计表（公式 F21-F25 自动算含税成本 / 毛利）"
        rightSlot={
          <section>
            <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">5 个步骤</p>
            <ol className="space-y-2 text-[14px] text-[var(--ink-dim)] font-mono">
              <li><Badge tone="primary" size="sm">1</Badge> 录基础信息（当前页）</li>
              <li><Badge tone="info" size="sm">2</Badge> 加染色工艺（按部件）</li>
              <li><Badge tone="info" size="sm">3</Badge> 加缝制工序</li>
              <li><Badge tone="info" size="sm">4</Badge> 加辅料 + 其他费用</li>
              <li><Badge tone="info" size="sm">5</Badge> 校对总计毛利 · 发送</li>
            </ol>
          </section>
        }
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 500));
          const newId = `Q-${String(Date.now()).slice(-6)}`;
          toast.success("报价单已创建", {
            description: `${values.product} · ${values.styleNo} · ${newId}`,
            duration: 4000,
          });
          router.push(`/orders/quotations/${newId}`);
        }}
      />
    </AdminShell>
  );
}
