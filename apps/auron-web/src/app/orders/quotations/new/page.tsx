"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Layers3,
  PackageCheck,
  ReceiptText,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getCustomers, getNotices, getWorkorders } from "@/lib/data";

const COLORS = ["炭灰", "墨黑", "本白", "藏蓝", "驼色", "其他"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const BASE_WEAVE_COST: Record<string, number> = {
  "WO-2026-0317-A": 199.6,
  "WO-2026-0316-A": 76.8,
  "WO-2026-0315-A": 51.4,
  "WO-2026-0314-C": 118.2,
};

type QuoteForm = {
  customerId: string;
  workorderId: string;
  orderQty: string;
  orderColor: string;
  quoteSizes: string[];
  dyeCost: string;
  sewCost: string;
  trimCost: string;
  otherCost: string;
  mgmtFee: string;
  taxRate: string;
  weaveLoss: string;
  dyeLoss: string;
  filedPriceInc: string;
  validUntil: string;
  packMethod: string;
  delivery: string;
  note: string;
};

const INITIAL_FORM: QuoteForm = {
  customerId: "",
  workorderId: "",
  orderQty: "",
  orderColor: "",
  quoteSizes: ["S", "M", "L"],
  dyeCost: "18.60",
  sewCost: "26.00",
  trimCost: "8.50",
  otherCost: "4.00",
  mgmtFee: "1.30",
  taxRate: "13",
  weaveLoss: "5",
  dyeLoss: "5",
  filedPriceInc: "",
  validUntil: "2026-07-30",
  packMethod: "PE 自封袋 · 10 件 / 包",
  delivery: "",
  note: "",
};

export default function NewQuotationPage() {
  const router = useRouter();
  const customers = useMemo(() => getCustomers(), []);
  const notices = useMemo(() => getNotices(), []);
  const workorders = useMemo(() => getWorkorders(), []);
  const [form, setForm] = useState<QuoteForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const selectedWorkorderIndex = workorders.findIndex((row) => row.id === form.workorderId);
  const selectedWorkorder = selectedWorkorderIndex >= 0 ? workorders[selectedWorkorderIndex] : undefined;
  const selectedNotice = selectedWorkorderIndex >= 0 ? notices[selectedWorkorderIndex] : undefined;
  const selectedCustomer = customers.find((row) => row.id === form.customerId);
  const productName = selectedNotice?.product ?? selectedWorkorder?.programName ?? "选择工艺单后自动带入";
  const styleNo = selectedNotice?.styleNo ?? "—";

  const totals = useMemo(() => {
    const weave = BASE_WEAVE_COST[form.workorderId] ?? 0;
    const directCost = weave
      + numberOf(form.dyeCost)
      + numberOf(form.sewCost)
      + numberOf(form.trimCost)
      + numberOf(form.otherCost);
    const costExc = directCost * numberOf(form.mgmtFee, 1);
    const costInc = costExc * (1 + numberOf(form.taxRate) / 100);
    const price = numberOf(form.filedPriceInc);
    const margin = price > 0 ? ((price - costInc) / price) * 100 : 0;
    return { weave, directCost, costExc, costInc, price, margin };
  }, [form]);

  const readiness = [
    { label: "客户与工艺单", done: Boolean(form.customerId && form.workorderId) },
    { label: "订单范围", done: Boolean(numberOf(form.orderQty) > 0 && form.orderColor && form.quoteSizes.length) },
    { label: "费用与系数", done: totals.costInc > 0 },
    { label: "报价与有效期", done: totals.price > 0 && Boolean(form.validUntil) },
  ];

  function update<K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  function chooseWorkorder(id: string) {
    const workorder = workorders.find((row) => row.id === id);
    const customer = customers.find((row) => {
      const workorderCustomer = workorder?.customer ?? "";
      return row.id === workorder?.customerId
        || row.name?.includes(workorderCustomer)
        || workorderCustomer.includes(row.name ?? "");
    });
    setForm((current) => ({
      ...current,
      workorderId: id,
      customerId: customer?.id ?? current.customerId,
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.workorderId;
      if (customer) delete next.customerId;
      return next;
    });
  }

  function toggleSize(size: string) {
    setForm((current) => ({
      ...current,
      quoteSizes: current.quoteSizes.includes(size)
        ? current.quoteSizes.filter((item) => item !== size)
        : [...current.quoteSizes, size],
    }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.customerId) next.customerId = "请选择本次报价对应的客户";
    if (!form.workorderId) next.workorderId = "请选择已完成基础参数的打样工艺单";
    if (numberOf(form.orderQty) <= 0) next.orderQty = "请输入大于 0 的订单数量";
    if (!form.orderColor) next.orderColor = "请选择订单颜色";
    if (!form.quoteSizes.length) next.quoteSizes = "至少选择一个报价尺码";
    if (totals.price <= 0) next.filedPriceInc = "请输入客户可见的含税单价";
    if (!form.validUntil) next.validUntil = "请选择报价有效期";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitQuote() {
    if (!validate()) {
      toast.error("还有报价信息未完成", { description: "请检查页面中标红的项目。" });
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newId = `Q-${String(Date.now()).slice(-6)}`;
    console.info("【报价】报价草稿已创建", {
      报价编号: newId,
      客户: selectedCustomer?.name,
      工艺单: form.workorderId,
      含税报价: totals.price,
      预计毛利: `${totals.margin.toFixed(1)}%`,
    });
    toast.success("报价草稿已保存", {
      description: `${selectedCustomer?.name} · ${productName} · ${newId}`,
      duration: 4000,
    });
    router.push("/orders/quotations");
  }

  return (
    <AdminShell
      pageTitle="新建报价"
      pageKicker="报价管理"
      pageDescription="从已确认的打样工艺出发，补齐费用和商务条件，确认毛利后形成客户报价。"
      pageActions={(
        <>
          <Link href="/orders/quotations">
            <Button variant="ghost" size="md">取消</Button>
          </Link>
          <Button
            form="quotation-workflow"
            type="submit"
            variant="default"
            size="md"
            disabled={saving}
          >
            {saving ? "正在保存…" : "保存报价草稿"}
          </Button>
        </>
      )}
      pageMeta={[
        { label: "完成度", value: `${readiness.filter((item) => item.done).length}/4` },
        { label: "含税成本", value: money(totals.costInc) },
        { label: "预计毛利", value: totals.price ? `${totals.margin.toFixed(1)}%` : "待报价" },
      ]}
    >
      <form
        id="quotation-workflow"
        className="mx-auto max-w-[1440px] px-8 py-6"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuote();
        }}
      >
        <Link
          href="/orders/quotations"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回报价台账
        </Link>

        <div className="mb-5 grid overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)] md:grid-cols-4">
          {readiness.map((item, index) => (
            <a
              key={item.label}
              href={`#quote-step-${index + 1}`}
              className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3 transition-colors hover:bg-[var(--accent)]/35 md:border-b-0 md:border-r"
            >
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                item.done
                  ? "border-[var(--success)] bg-[var(--success)] text-white"
                  : "border-[var(--hairline-strong)] text-[var(--ink-mute)]",
              )}>
                {item.done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className={cn("text-[13px] font-medium", item.done ? "text-[var(--ink)]" : "text-[var(--ink-dim)]")}>
                {item.label}
              </span>
            </a>
          ))}
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <WorkflowSection
              id="quote-step-1"
              index="01"
              icon={<Layers3 className="h-4 w-4" />}
              title="确定报价对象"
              description="选择已形成工艺参数的打样单，系统自动关联客户、品名、款号和基础织造成本。"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="客户" required error={errors.customerId}>
                  <SelectControl
                    value={form.customerId || undefined}
                    onValueChange={(value) => update("customerId", value)}
                    placeholder="请选择客户"
                    invalid={Boolean(errors.customerId)}
                    options={customers.map((customer) => ({ value: customer.id, label: `${customer.name} · ${customer.id}` }))}
                  />
                </FormControl>

                <FormControl label="打样工艺单" required error={errors.workorderId}>
                  <SelectControl
                    value={form.workorderId || undefined}
                    onValueChange={chooseWorkorder}
                    placeholder="请选择工艺单"
                    invalid={Boolean(errors.workorderId)}
                    options={workorders.map((workorder) => {
                      const notice = notices[workorders.indexOf(workorder)];
                      return {
                        value: workorder.id,
                        label: `${workorder.id} · ${notice?.product ?? workorder.programName}`,
                      };
                    })}
                  />
                </FormControl>
              </div>

              <div className="grid gap-px overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
                <ReadOnlyFact label="产品" value={productName} />
                <ReadOnlyFact label="款号" value={styleNo} mono />
                <ReadOnlyFact label="程序" value={selectedWorkorder?.programName ?? "—"} mono />
                <ReadOnlyFact label="基础织造成本" value={totals.weave ? money(totals.weave) : "待选择"} mono />
              </div>
            </WorkflowSection>

            <WorkflowSection
              id="quote-step-2"
              index="02"
              icon={<PackageCheck className="h-4 w-4" />}
              title="确认订单范围"
              description="客户会看到的数量、颜色和报价尺码。尺码可以多选，不再用单个下拉框代替。"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="订单数量" required error={errors.orderQty}>
                  <Input
                    type="number"
                    min="1"
                    value={form.orderQty}
                    onChange={(event) => update("orderQty", event.target.value)}
                    placeholder="如：200"
                    mono
                  />
                </FormControl>

                <FormControl label="订单颜色" required error={errors.orderColor}>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <ChoiceButton
                        key={color}
                        selected={form.orderColor === color}
                        onClick={() => update("orderColor", color)}
                      >
                        {color}
                      </ChoiceButton>
                    ))}
                  </div>
                </FormControl>
              </div>

              <FormControl label="报价尺码" required error={errors.quoteSizes}>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <ChoiceButton
                      key={size}
                      selected={form.quoteSizes.includes(size)}
                      onClick={() => toggleSize(size)}
                      mono
                    >
                      {size}
                    </ChoiceButton>
                  ))}
                </div>
              </FormControl>
            </WorkflowSection>

            <WorkflowSection
              id="quote-step-3"
              index="03"
              icon={<Calculator className="h-4 w-4" />}
              title="核对成本结构"
              description="基础织造成本从工艺单带入，只补充本次报价特有的加工、辅料和费用。"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MoneyInput label="染整费" value={form.dyeCost} onChange={(value) => update("dyeCost", value)} />
                <MoneyInput label="缝制费" value={form.sewCost} onChange={(value) => update("sewCost", value)} />
                <MoneyInput label="辅料费" value={form.trimCost} onChange={(value) => update("trimCost", value)} />
                <MoneyInput label="其他费用" value={form.otherCost} onChange={(value) => update("otherCost", value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <PercentInput label="织造损耗" value={form.weaveLoss} onChange={(value) => update("weaveLoss", value)} />
                <PercentInput label="染色损耗" value={form.dyeLoss} onChange={(value) => update("dyeLoss", value)} />
                <FormControl label="管理费系数">
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.mgmtFee}
                    onChange={(event) => update("mgmtFee", event.target.value)}
                    mono
                  />
                </FormControl>
                <PercentInput label="税率" value={form.taxRate} onChange={(value) => update("taxRate", value)} />
              </div>
            </WorkflowSection>

            <WorkflowSection
              id="quote-step-4"
              index="04"
              icon={<ReceiptText className="h-4 w-4" />}
              title="确定报价与商务条件"
              description="输入客户可见的含税单价，确认有效期、包装和交付方式后保存草稿。"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="备案含税单价" required error={errors.filedPriceInc} hint="按单件报价">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[13px] text-[var(--ink-mute)]">¥</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.filedPriceInc}
                      onChange={(event) => update("filedPriceInc", event.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                      mono
                    />
                  </div>
                </FormControl>

                <FormControl label="报价有效期" required error={errors.validUntil}>
                  <DatePicker
                    value={form.validUntil}
                    onChange={(value) => update("validUntil", value)}
                    required
                    aria-label="报价有效期"
                  />
                </FormControl>

                <FormControl label="包装方式">
                  <Input
                    value={form.packMethod}
                    onChange={(event) => update("packMethod", event.target.value)}
                    placeholder="如：PE 自封袋 · 10 件 / 包"
                  />
                </FormControl>

                <FormControl label="送货方式 / 地址">
                  <Input
                    value={form.delivery}
                    onChange={(event) => update("delivery", event.target.value)}
                    placeholder="如：义乌工厂 · 物流 5 天"
                  />
                </FormControl>
              </div>

              <FormControl label="报价说明" hint="客户要求、付款方式或本次报价的特殊约定">
                <textarea
                  value={form.note}
                  onChange={(event) => update("note", event.target.value)}
                  rows={3}
                  placeholder="如：客户要求 7 月 28 日前交样，首单需确认色卡。"
                  className={textareaClass}
                />
              </FormControl>
            </WorkflowSection>

            <div className="flex items-center justify-between rounded-lg border border-[var(--hairline)] bg-[var(--card)] px-5 py-4">
              <div>
                <p className="text-[14px] font-medium text-[var(--ink)]">先保存为草稿，再补充明细或发送客户</p>
                <p className="mt-1 text-[12px] text-[var(--ink-mute)]">保存后返回报价台账，不会进入尚未生成的详情页。</p>
              </div>
              <Button type="submit" variant="default" size="md" disabled={saving}>
                {saving ? "正在保存…" : "保存报价草稿"}
              </Button>
            </div>
          </div>

          <aside className="sticky top-[72px] space-y-4">
            <section className="overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)]">
              <div className="border-b border-[var(--hairline)] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-[var(--primary)]" />
                    <h2 className="text-[15px] font-semibold text-[var(--ink)]">报价测算</h2>
                  </div>
                  <Badge tone={marginTone(totals.margin)} size="sm">
                    {totals.price ? `${totals.margin.toFixed(1)}% 毛利` : "待报价"}
                  </Badge>
                </div>
                <p className="mt-1 text-[12px] text-[var(--ink-mute)]">修改费用或报价后即时更新</p>
              </div>

              <div className="space-y-3 px-5 py-4">
                <SummaryRow label="基础织造" value={money(totals.weave)} />
                <SummaryRow label="加工与其他" value={money(totals.directCost - totals.weave)} />
                <SummaryRow label="不含税成本" value={money(totals.costExc)} />
                <SummaryRow label={`含税成本 · ${form.taxRate}%`} value={money(totals.costInc)} />
                <div className="border-t border-[var(--hairline)] pt-3">
                  <SummaryRow label="客户含税单价" value={totals.price ? money(totals.price) : "待填写"} strong />
                </div>
              </div>

              <div className={cn(
                "border-t border-[var(--hairline)] px-5 py-4",
                totals.price && totals.margin < 15 ? "bg-[var(--destructive)]/5" : "bg-[var(--secondary)]/35",
              )}>
                <p className="text-[12px] text-[var(--ink-mute)]">预计单件毛利</p>
                <div className="mt-1 flex items-end justify-between">
                  <strong className="font-mono text-[28px] font-semibold tabular-nums text-[var(--ink)]">
                    {totals.price ? money(totals.price - totals.costInc) : "—"}
                  </strong>
                  <span className={cn(
                    "font-mono text-[14px] font-medium tabular-nums",
                    totals.margin >= 25 ? "text-[var(--success)]" : totals.margin >= 15 ? "text-[var(--warning)]" : "text-[var(--destructive)]",
                  )}>
                    {totals.price ? `${totals.margin.toFixed(1)}%` : "输入报价后计算"}
                  </span>
                </div>
                {totals.price > 0 && totals.margin < 15 && (
                  <p className="mt-2 text-[12px] leading-4 text-[var(--destructive)]">
                    当前毛利低于 15%，建议复核费用或申请低毛利审批。
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-[var(--ink-dim)]" />
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">完成情况</h2>
              </div>
              <div className="mt-3 space-y-2.5">
                {readiness.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-[var(--ink-dim)]">{item.label}</span>
                    <span className={cn("flex items-center gap-1", item.done ? "text-[var(--success)]" : "text-[var(--ink-mute)]")}>
                      {item.done ? <Check className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      {item.done ? "已完成" : "待填写"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--primary)]/25 bg-[var(--primary)]/[0.035] p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                <div>
                  <h2 className="text-[13px] font-semibold text-[var(--ink)]">保存后下一步</h2>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--ink-dim)]">
                    草稿会出现在报价台账的“草稿”视图。完成染整、缝制和辅料明细后，再发送给客户确认。
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </AdminShell>
  );
}

function WorkflowSection({
  id,
  index,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  index: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)]">
      <div className="flex items-start gap-4 border-b border-[var(--hairline)] px-5 py-4">
        <span className="font-mono text-[12px] font-medium text-[var(--primary)]">{index}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[var(--ink)]">
            {icon}
            <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
          </div>
          <p className="mt-1 text-[13px] leading-5 text-[var(--ink-dim)]">{description}</p>
        </div>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

function FormControl({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink)]">
        {label}
        {required && <span className="text-[var(--destructive)]">*</span>}
        {hint && <span className="ml-auto text-[11px] font-normal text-[var(--ink-mute)]">{hint}</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error && <span className="mt-1.5 block text-[12px] text-[var(--destructive)]">{error}</span>}
    </label>
  );
}

function ReadOnlyFact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 bg-[var(--secondary)]/35 px-4 py-3">
      <p className="text-[11px] text-[var(--ink-mute)]">{label}</p>
      <p className={cn("mt-1 truncate text-[13px] font-medium text-[var(--ink)]", mono && "font-mono tabular-nums")}>{value}</p>
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  mono,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-w-11 rounded-md border px-3 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30",
        selected
          ? "border-[var(--primary)] bg-[var(--primary)]/8 font-medium text-[var(--primary)]"
          : "border-[var(--hairline-strong)] bg-[var(--card)] text-[var(--ink-dim)] hover:bg-[var(--accent)]",
        mono && "font-mono",
      )}
    >
      {children}
    </button>
  );
}

function MoneyInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <FormControl label={label} hint="元 / 件">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[var(--ink-mute)]">¥</span>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-7"
          mono
        />
      </div>
    </FormControl>
  );
}

function PercentInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <FormControl label={label}>
      <div className="relative">
        <Input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-8"
          mono
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[var(--ink-mute)]">%</span>
      </div>
    </FormControl>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px] text-[var(--ink-dim)]">{label}</span>
      <span className={cn("font-mono text-[13px] tabular-nums text-[var(--ink)]", strong && "text-[15px] font-semibold")}>{value}</span>
    </div>
  );
}

function numberOf(value: string | number | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value: number) {
  return `¥${value.toFixed(2)}`;
}

function marginTone(value: number): "neutral" | "warn" | "success" | "danger" {
  if (!value) return "neutral";
  if (value < 15) return "danger";
  if (value < 25) return "warn";
  return "success";
}

const textareaClass = "w-full resize-y rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-2 text-[14px] leading-5 text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20";
