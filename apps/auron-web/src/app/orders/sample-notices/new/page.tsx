"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";
import { Badge } from "@/components/ui/badge";

/**
 * 新建打样通知 · 写入 crm_打样通知_基础信息表
 *
 * 27 字段中核心 17 字段由业务员录入，公式 3 个 + lookup 4 个 + auto_number 1 个由系统生成
 */

const CUSTOMERS = ["CUST-QS-001 乾盛服饰", "CUST-HD-002 弘大针织", "CUST-MD-019 鸣笛工贸", "CUST-YX-031 一针坊", "CUST-XF-088 霞飞外贸", "CUST-QD-044 巧岛针织"];
const TYPES = ["外套", "打底", "T恤", "配饰", "围巾"];
const PROGRESS_OPTIONS = ["未通知", "已通知", "已结束"];
const SPECIAL_OPTIONS = ["有定型", "需蒸馏", "常温缩水", "抗菌助剂", "无折痕"];
const YARN_OPTIONS = ["33D/12F","20/30","40/30","40/20/24F","100D","80D","55/48*2","200D","20D","75D/72F"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "均码"];
const EMPLOYEES = ["李白 业务", "刘韬 业务", "亚明 业务", "陈总 总经理", "老周 前道师傅", "阿亮 后道师傅", "王姐 业务跟单"];

const FIELDS: FieldDef[] = [
  { name: "customer",  label: "客户",         type: "select", required: true, options: CUSTOMERS, source: "link 客户（base text 收）" },
  { name: "clientName",label: "客户名称",     type: "text",   required: true, placeholder: "如：乾盛服饰有限公司", source: "text" },
  { name: "clientCode",label: "客户编码",     type: "text",   placeholder: "如：GH-QS-007", source: "text" },
  { name: "category",  label: "种类",         type: "select", options: TYPES, source: "link crm_字典_样品种类表" },
  { name: "product",   label: "品名",         type: "text",   placeholder: "如：羊毛双面呢", source: "text" },
  { name: "styleNo",   label: "厂款号",       type: "text",   placeholder: "如：GH-QS-001-26FW-0317", source: "text (link 键)" },
  { name: "color",     label: "颜色",         type: "text",   placeholder: "如：炭灰", source: "text" },
  { name: "specialYarn",label:"特殊纱线",     type: "text",   placeholder: "如：高弹莱卡 30D", source: "text" },
  { name: "specialCraft",label:"特殊工艺",    type: "select", options: SPECIAL_OPTIONS, source: "multi-select" },
  { name: "qty",       label: "交样数量",     type: "text",   placeholder: "如：3 件", source: "text（数量+尺码）" },
  { name: "sizes",     label: "交样尺码",     type: "select", options: SIZES, source: "link crm_字典_尺码配置表" },
  { name: "yarnSpec",  label: "纱线规格",     type: "select", options: YARN_OPTIONS, source: "select 10 选项（字典）" },
  { name: "deliveryDate", label:"交样日期",  type: "date",   source: "datetime" },
  { name: "noticeDate",   label:"通知日期",  type: "date",   source: "datetime" },
  { name: "dyeRequirement",label:"染色要求", type: "textarea", placeholder: "如：缸染低温 · 色牢度 ≥ 4 级", source: "text" },
  { name: "frontRequirement",label:"前道工艺要求", type: "textarea", placeholder: "如：双面织造 · 罗纹 1×1", source: "text" },
  { name: "backRequirement", label:"后道工艺要求", type: "textarea", placeholder: "如：免烫 · 蒸汽定型", source: "text" },
  { name: "gm",        label: "总经理",       type: "select", options: EMPLOYEES, source: "link crm_人员信息表" },
  { name: "frontMaster",label:"前道打样师傅",type: "select", options: EMPLOYEES, source: "link crm_人员信息表" },
  { name: "backMaster",label:"后道打样师傅", type: "select", options: EMPLOYEES, source: "link crm_人员信息表" },
  { name: "bizManager",label:"业务部负责人", type: "select", options: EMPLOYEES, source: "link crm_人员信息表" },
  { name: "progress",  label: "进度状态",     type: "select", options: PROGRESS_OPTIONS, source: "select 3 选项" },
  { name: "note",      label: "客户备注",     type: "textarea", placeholder: "下单偏好、付款节奏、特别要求", source: "text" },
];

export default function NewSampleNoticePage() {
  const router = useRouter();

  return (
    <AdminShell>
      <EntityForm
        title="新建打样通知"
        subtitle="业务员发起打样需求。crm_打样通知_基础信息表 · 写入 21 个字段（公式 + lookup + auto 由系统生成）"
        backUrl="/orders/sample-notices"
        backLabel="打样通知"
        fields={FIELDS}
        submitLabel="保存并发起打样"
        dataSourceNote="crm_打样通知_基础信息表 27 字段 · 3 个 formula 自动计算（辅料/尺寸/进度追踪） · 4 个 lookup 自动回填"
        rightSlot={
          <section>
            <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">创建后流程</p>
            <ol className="space-y-2 text-[14px] text-[var(--ink-dim)] font-mono">
              <li><Badge tone="info" size="sm">1</Badge> 自动跳转至新通知详情</li>
              <li><Badge tone="info" size="sm">2</Badge> 业务部负责人审批</li>
              <li><Badge tone="info" size="sm">3</Badge> 师傅接到通知 → 创建工艺单</li>
              <li><Badge tone="info" size="sm">4</Badge> 完成后生成报价</li>
            </ol>
          </section>
        }
        onSubmit={async (values) => {
          // mock submit
          await new Promise((r) => setTimeout(r, 500));
          const newId = `SMPL-2026-${String(Date.now()).slice(-5)}`;
          toast.success("打样通知已创建", {
            description: `${values.clientName} · ${values.product} · ${newId}`,
            duration: 4000,
          });
          router.push(`/orders/sample-notices/${newId}`);
        }}
      />
    </AdminShell>
  );
}
