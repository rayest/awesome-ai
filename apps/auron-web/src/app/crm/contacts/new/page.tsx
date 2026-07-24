"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { EntityForm, type FieldDef } from "@/components/domain/create-form";
import { Badge } from "@/components/ui/badge";
import { getCustomers, type Customer } from "@/lib/data";

const ROLES = ["决策", "采购", "技术", "品控", "财务"];

export default function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const params = use(searchParams);
  const router = useRouter();
  const customers = useMemo(() => getCustomers() as Customer[], []);
  const selectedCustomer = customers.find((customer) => customer.id === params.customer);
  const customerOptions = customers.map((customer) => `${customer.id} · ${customer.name}`);
  const fields: FieldDef[] = [
    {
      name: "customer",
      label: "所属客户",
      type: "select",
      required: true,
      options: customerOptions,
      defaultValue: selectedCustomer ? `${selectedCustomer.id} · ${selectedCustomer.name}` : "",
      section: {
        title: "客户与职责",
        description: "先确认联系人属于哪位客户，再标记其在合作链路中的职责。",
      },
    },
    { name: "name", label: "联系人姓名", type: "text", required: true, placeholder: "如：陈琳" },
    { name: "title", label: "职务", type: "text", placeholder: "如：采购经理" },
    { name: "dept", label: "所在部门", type: "text", placeholder: "如：采购部" },
    { name: "role", label: "合作角色", type: "select", required: true, options: ROLES },
    {
      name: "mobile",
      label: "手机",
      type: "tel",
      required: true,
      placeholder: "如：138 0000 9921",
      section: {
        title: "联系方式",
        description: "至少保留一种可直接联系的方式，手机号为必填。",
      },
    },
    { name: "phone", label: "办公电话", type: "tel", placeholder: "如：0571-8858-1234" },
    { name: "email", label: "邮箱", type: "email", placeholder: "如：chen@example.com" },
  ];

  return (
    <AdminShell>
      <EntityForm
        title="新建联系人"
        subtitle="为客户添加日常对接人，明确其在合作中的职责和首选联系方式。"
        backUrl="/crm/contacts"
        backLabel="联系人"
        fields={fields}
        submitLabel="保存联系人"
        rightSlot={
          <section className="rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-5">
            <p className="text-[16px] font-semibold">合作角色怎么选</p>
            <p className="mt-1 text-[12px] leading-5 text-[var(--ink-mute)]">
              角色用于后续快速找到合适的沟通对象，不需要与联系人职务完全一致。
            </p>
            <div className="mt-4 space-y-2 text-[13px]">
              <div><Badge tone="primary" size="sm">决策</Badge><span className="ml-2">确认合作与预算</span></div>
              <div><Badge tone="info" size="sm">采购</Badge><span className="ml-2">询价、下单与交期</span></div>
              <div><Badge tone="success" size="sm">技术</Badge><span className="ml-2">样品、工艺与参数</span></div>
              <div><Badge tone="warn" size="sm">品控</Badge><span className="ml-2">验货与质量反馈</span></div>
              <div><Badge tone="neutral" size="sm">财务</Badge><span className="ml-2">账期、发票与回款</span></div>
            </div>
          </section>
        }
        onSubmit={async (values) => {
          await new Promise((resolve) => setTimeout(resolve, 400));
          const newId = `ct-${String(Date.now()).slice(-5)}`;
          toast.success("联系人已创建", {
            description: `${values.name} · ${values.role}`,
            duration: 4000,
          });
          console.info("【联系人】联系人已保存并关联客户", {
            联系人编号: newId,
            客户: values.customer,
            姓名: values.name,
          });
          router.push("/crm/contacts");
        }}
      />
    </AdminShell>
  );
}
