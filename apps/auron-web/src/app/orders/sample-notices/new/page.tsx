"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, ClipboardList, Scissors, Users } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/components/ui/select";
import {
  ChoiceButton,
  CompletionList,
  FormControl,
  ReadOnlyFact,
  WorkflowProgress,
  WorkflowSection,
  workflowTextareaClass,
} from "@/components/domain/workflow-form";
import { getCustomers, getEmployees, getProducts } from "@/lib/data";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "均码"];
const CRAFTS = ["有定型", "需蒸馏", "常温缩水", "抗菌助剂", "无折痕"];

type NoticeForm = {
  customerId: string;
  styleNo: string;
  qty: string;
  sizes: string[];
  color: string;
  deliveryDate: string;
  specialCraft: string[];
  specialYarn: string;
  frontRequirement: string;
  backRequirement: string;
  dyeRequirement: string;
  frontMaster: string;
  backMaster: string;
  bizManager: string;
  note: string;
};

const INITIAL_FORM: NoticeForm = {
  customerId: "",
  styleNo: "",
  qty: "3",
  sizes: ["S", "M", "L"],
  color: "",
  deliveryDate: "",
  specialCraft: [],
  specialYarn: "",
  frontRequirement: "",
  backRequirement: "",
  dyeRequirement: "",
  frontMaster: "",
  backMaster: "",
  bizManager: "",
  note: "",
};

export default function NewSampleNoticePage() {
  const router = useRouter();
  const customers = useMemo(() => getCustomers(), []);
  const products = useMemo(() => getProducts(), []);
  const employees = useMemo(() => getEmployees(), []);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const selectedCustomer = customers.find((row) => row.id === form.customerId);
  const selectedProduct = products.find((row) => row.styleNo === form.styleNo);
  const frontMasters = employees.filter((row) => /前道|师傅|车间/.test(`${row.dept}${row.position}`));
  const backMasters = employees.filter((row) => /后道|师傅|车间/.test(`${row.dept}${row.position}`));
  const businessOwners = employees.filter((row) => /业务|管理/.test(`${row.dept}${row.position}`));

  const readiness = [
    { label: "客户与产品", done: Boolean(form.customerId && form.styleNo), href: "#notice-step-1" },
    { label: "样衣目标", done: Boolean(Number(form.qty) > 0 && form.sizes.length && form.color && form.deliveryDate), href: "#notice-step-2" },
    { label: "工艺要求", done: Boolean(form.frontRequirement || form.backRequirement || form.dyeRequirement), href: "#notice-step-3" },
    { label: "人员与核对", done: Boolean(form.frontMaster && form.bizManager), href: "#notice-step-4" },
  ];

  function update<K extends keyof NoticeForm>(key: K, value: NoticeForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  }

  function toggleList(key: "sizes" | "specialCraft", value: string) {
    const current = form[key];
    update(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.customerId) next.customerId = "请选择发起打样的客户";
    if (!form.styleNo) next.styleNo = "请选择已有产品，避免重复录入款号和品名";
    if (Number(form.qty) <= 0) next.qty = "请输入大于 0 的交样数量";
    if (!form.sizes.length) next.sizes = "至少选择一个交样尺码";
    if (!form.color) next.color = "请输入本次样衣颜色";
    if (!form.deliveryDate) next.deliveryDate = "请选择计划交样日期";
    if (!form.frontMaster) next.frontMaster = "请选择接收通知的前道师傅";
    if (!form.bizManager) next.bizManager = "请选择业务负责人";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!validate()) {
      toast.error("还有打样信息未完成", { description: "请检查页面中标红的项目。" });
      return;
    }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newId = `SMPL-${String(Date.now()).slice(-6)}`;
    console.info("【打样通知】通知已创建并进入待下发队列", {
      通知编号: newId,
      客户: selectedCustomer?.name,
      产品: selectedProduct?.product ?? selectedProduct?.name,
      前道师傅: form.frontMaster,
      交样日期: form.deliveryDate,
    });
    toast.success("打样通知已创建", {
      description: `${selectedCustomer?.name} · ${selectedProduct?.product ?? selectedProduct?.name} · 等待下发`,
    });
    router.push("/orders/sample-notices");
  }

  return (
    <AdminShell
      pageTitle="新建打样通知"
      pageDescription="从客户和产品出发，明确样衣目标、工艺要求与接收人，创建后进入待下发队列。"
      pageActions={(
        <>
          <Link href="/orders/sample-notices"><Button variant="ghost" size="md">取消</Button></Link>
          <Button form="notice-workflow" type="submit" size="md" disabled={saving}>
            {saving ? "正在创建…" : "创建并进入待下发"}
          </Button>
        </>
      )}
      pageMeta={[
        { label: "完成度", value: `${readiness.filter((item) => item.done).length}/4` },
        { label: "交样数量", value: Number(form.qty) || "待填写" },
        { label: "计划交样", value: form.deliveryDate || "待安排" },
      ]}
    >
      <form
        id="notice-workflow"
        className="mx-auto max-w-[1440px] px-8 py-6"
        onSubmit={(event) => { event.preventDefault(); submit(); }}
      >
        <Link href="/orders/sample-notices" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-mute)] hover:text-[var(--ink)]">
          <ArrowLeft className="h-3.5 w-3.5" />返回打样调度
        </Link>

        <WorkflowProgress items={readiness} />

        <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <WorkflowSection id="notice-step-1" index="01" title="确定客户与产品" description="选择已有客户和产品，自动带入款号、品名、类目和基础工艺。">
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="客户" required error={errors.customerId}>
                  <SelectControl
                    value={form.customerId || undefined}
                    onValueChange={(value) => update("customerId", value)}
                    placeholder="请选择客户"
                    options={customers.map((row) => ({ value: row.id, label: `${row.name} · ${row.id}` }))}
                  />
                </FormControl>
                <FormControl label="产品" required error={errors.styleNo}>
                  <SelectControl
                    value={form.styleNo || undefined}
                    onValueChange={(value) => update("styleNo", value)}
                    placeholder="请选择产品"
                    options={products.map((row) => ({ value: row.styleNo, label: `${row.styleNo} · ${row.product ?? row.name}` }))}
                  />
                </FormControl>
              </div>
              <div className="grid gap-px overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
                <ReadOnlyFact label="客户负责人" value={selectedCustomer?.owner ?? "选择客户后带入"} />
                <ReadOnlyFact label="品名" value={selectedProduct?.product ?? selectedProduct?.name ?? "—"} />
                <ReadOnlyFact label="类目" value={selectedProduct?.category ?? "—"} />
                <ReadOnlyFact label="基础工艺" value={selectedProduct?.craft ?? "—"} />
              </div>
            </WorkflowSection>

            <WorkflowSection id="notice-step-2" index="02" title="明确样衣目标" description="这些信息会直接影响工坊排期、用料和验货标准。">
              <div className="grid gap-4 md:grid-cols-3">
                <FormControl label="交样数量" required error={errors.qty}>
                  <Input type="number" min="1" value={form.qty} onChange={(e) => update("qty", e.target.value)} mono />
                </FormControl>
                <FormControl label="颜色" required error={errors.color}>
                  <Input value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="如：炭灰" />
                </FormControl>
                <FormControl label="计划交样日期" required error={errors.deliveryDate}>
                  <DatePicker
                    value={form.deliveryDate}
                    onChange={(value) => update("deliveryDate", value)}
                    required
                    aria-label="计划交样日期"
                  />
                </FormControl>
              </div>
              <FormControl label="交样尺码" required error={errors.sizes}>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => <ChoiceButton key={size} selected={form.sizes.includes(size)} onClick={() => toggleList("sizes", size)} mono>{size}</ChoiceButton>)}
                </div>
              </FormControl>
            </WorkflowSection>

            <WorkflowSection id="notice-step-3" index="03" title="补充工艺要求" description="只填写本次样衣相对产品主数据的特殊要求，通用工艺无需重复录入。">
              <FormControl label="特殊工艺" hint="可多选">
                <div className="flex flex-wrap gap-2">
                  {CRAFTS.map((craft) => <ChoiceButton key={craft} selected={form.specialCraft.includes(craft)} onClick={() => toggleList("specialCraft", craft)}>{craft}</ChoiceButton>)}
                </div>
              </FormControl>
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="特殊纱线"><Input value={form.specialYarn} onChange={(e) => update("specialYarn", e.target.value)} placeholder="仅填写本次特殊用纱" /></FormControl>
                <FormControl label="染色要求"><Input value={form.dyeRequirement} onChange={(e) => update("dyeRequirement", e.target.value)} placeholder="如：低温缸染、色牢度 ≥ 4 级" /></FormControl>
                <FormControl label="前道要求"><textarea rows={3} className={workflowTextareaClass} value={form.frontRequirement} onChange={(e) => update("frontRequirement", e.target.value)} placeholder="织造、张力、下机等要求" /></FormControl>
                <FormControl label="后道要求"><textarea rows={3} className={workflowTextareaClass} value={form.backRequirement} onChange={(e) => update("backRequirement", e.target.value)} placeholder="整烫、定型、包装等要求" /></FormControl>
              </div>
            </WorkflowSection>

            <WorkflowSection id="notice-step-4" index="04" title="安排人员并核对" description="明确谁接收、谁负责，创建后所有人会看到相同的交样目标。">
              <div className="grid gap-4 md:grid-cols-3">
                <FormControl label="前道师傅" required error={errors.frontMaster}>
                  <SelectControl
                    value={form.frontMaster || undefined}
                    onValueChange={(value) => update("frontMaster", value)}
                    placeholder="请选择"
                    options={(frontMasters.length ? frontMasters : employees).map((row) => ({ value: row.name, label: `${row.name} · ${row.position}` }))}
                  />
                </FormControl>
                <FormControl label="后道师傅">
                  <SelectControl
                    value={form.backMaster || undefined}
                    onValueChange={(value) => update("backMaster", value)}
                    placeholder="暂不安排"
                    options={(backMasters.length ? backMasters : employees).map((row) => ({ value: row.name, label: `${row.name} · ${row.position}` }))}
                  />
                </FormControl>
                <FormControl label="业务负责人" required error={errors.bizManager}>
                  <SelectControl
                    value={form.bizManager || undefined}
                    onValueChange={(value) => update("bizManager", value)}
                    placeholder="请选择"
                    options={(businessOwners.length ? businessOwners : employees).map((row) => ({ value: row.name, label: `${row.name} · ${row.position}` }))}
                  />
                </FormControl>
              </div>
              <FormControl label="内部备注"><textarea rows={3} className={workflowTextareaClass} value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="需要审批或特别提醒的内容" /></FormControl>
            </WorkflowSection>
          </div>

          <aside className="sticky top-[72px] space-y-4">
            <section className="rounded-lg border border-[var(--hairline)] bg-[var(--card)]">
              <header className="border-b border-[var(--hairline)] px-5 py-4">
                <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-[var(--primary)]" /><h2 className="text-[15px] font-semibold">通知摘要</h2></div>
              </header>
              <div className="space-y-4 p-5">
                <Summary icon={<Users />} label="客户与产品" value={selectedCustomer ? `${selectedCustomer.name} · ${selectedProduct?.product ?? selectedProduct?.name ?? "待选产品"}` : "待选择"} />
                <Summary icon={<Scissors />} label="样衣范围" value={`${form.qty || "—"} 件 · ${form.sizes.join("/") || "待选尺码"} · ${form.color || "待定颜色"}`} />
                <Summary icon={<CalendarDays />} label="交样安排" value={form.deliveryDate ? `${form.deliveryDate} · ${form.frontMaster || "待安排师傅"}` : "待安排"} />
              </div>
            </section>
            <section className="rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-5">
              <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--ink-dim)]" /><h2 className="text-[14px] font-semibold">完成情况</h2></div>
              <CompletionList items={readiness} />
            </section>
            <section className="rounded-lg bg-[var(--accent)]/45 p-4 text-[12px] leading-5 text-[var(--ink-dim)]">
              创建后进入“等待下发”。确认资料无误后，再由业务负责人下发给前道师傅并创建工艺单。
            </section>
          </aside>
        </div>
      </form>
    </AdminShell>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactElement<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[var(--ink-mute)] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div><p className="text-[11px] text-[var(--ink-mute)]">{label}</p><p className="mt-1 text-[13px] font-medium leading-5 text-[var(--ink)]">{value}</p></div>
    </div>
  );
}
