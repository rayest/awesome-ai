"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";
import { Badge } from "@/components/ui/badge";

/**
 * 新建联系人 · 写入 crm_客户联系人表
 *
 * 11 字段中由业务员录入的核心 7 字段
 */

const CUSTOMERS = ["CUST-QS-001 乾盛服饰", "CUST-HD-002 弘大针织", "CUST-MD-019 鸣笛工贸", "CUST-YX-031 一针坊", "CUST-XF-088 霞飞外贸", "CUST-QD-044 巧岛针织"];
const ROLES = ["决策", "采购", "技术", "品控", "财务"];

const FIELDS: FieldDef[] = [
  { name: "customer",   label: "所属客户",  type: "select", required: true, options: CUSTOMERS, source: "link crm_客户表（必填）" },
  { name: "name",       label: "联系人姓名", type: "text",   required: true, placeholder: "如：陈总", source: "text" },
  { name: "title",      label: "职务",       type: "text",   placeholder: "如：总经理", source: "text" },
  { name: "dept",       label: "联系人部门", type: "text",   placeholder: "如：总经办", source: "text" },
  { name: "role",       label: "业务角色",   type: "select", required: true, options: ROLES, source: "前端分类（4 类）" },
  { name: "phone",      label: "联系人电话", type: "tel",    placeholder: "如：0571-8858-1234", source: "text" },
  { name: "mobile",     label: "联系人手机", type: "tel",    required: true, placeholder: "如：138-xxxx-9921", source: "text" },
  { name: "email",      label: "联系人邮箱", type: "email",  placeholder: "如：chen@xxx.com", source: "text" },
  { name: "bizcard",    label: "名片 OCR",   type: "textarea", placeholder: "上传名片后自动识别 — 二期功能", source: "attachment（crm 字段）" },
  { name: "addedAt",    label: "添加时间",   type: "date",   source: "datetime" },
];

export default function NewContactPage() {
  const router = useRouter();
  return (
    <AdminShell>
      <EntityForm
        title="新建联系人"
        subtitle="为客户档案增加对接人。crm_客户联系人表 · 写入 9 字段（含双向 link 跟进记录）"
        backUrl="/crm/contacts"
        backLabel="联系人"
        fields={FIELDS}
        submitLabel="保存并关联"
        dataSourceNote="crm_客户联系人表 11 字段 · 联系人ID 是 auto_number（自动生成） · crm_客户跟进记录表 通过此 link 双向跳转"
        rightSlot={
          <section>
            <p className="font-display text-[18px] font-medium mb-3 border-b border-[var(--hairline)] pb-2">角色说明</p>
            <div className="space-y-1.5 font-mono text-[14px]">
              <p><Badge tone="primary" size="sm">决策</Badge> 老板/总经理 — 拍板</p>
              <p><Badge tone="info" size="sm">采购</Badge> 采购经理 — 下单</p>
              <p><Badge tone="success" size="sm">技术</Badge> 设计师/技术 — 工艺</p>
              <p><Badge tone="warn" size="sm">品控</Badge> 品质部 — 收货</p>
              <p><Badge tone="neutral" size="sm">财务</Badge> 财务 — 对账</p>
            </div>
          </section>
        }
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          const newId = `ct-${String(Date.now()).slice(-5)}`;
          toast.success("联系人已创建", {
            description: `${values.name} · ${values.title} · ${values.role}`,
            duration: 4000,
          });
          router.push(`/crm/contacts/${newId}`);
        }}
      />
    </AdminShell>
  );
}
