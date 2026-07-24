"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  ChevronLeft,
  Clock3,
  ContactRound,
  MessageCircle,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectControl } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getContacts,
  getCustomers,
  type Contact,
  type Customer,
} from "@/lib/data";

type FollowupMode = "phone" | "im" | "visit";

type FollowupContact = {
  id: string;
  customerName: string;
  name: string;
  title: string;
  dept: string;
  phone: string;
  mobile: string;
  email: string;
};

type FollowupForm = {
  customerId: string;
  contactId: string;
  status: string;
  mode: FollowupMode;
  record: string;
  lastContactAt: string;
  nextContactAt: string;
  owner: string;
};

const STATUS_OPTIONS = [
  "初步接触",
  "需求确认",
  "方案制定",
  "商务洽谈",
  "签约成交",
  "合作中",
  "合作结束",
] as const;

const MODE_OPTIONS: Array<{
  value: FollowupMode;
  label: string;
  description: string;
  icon: typeof Phone;
}> = [
  { value: "phone", label: "电话", description: "电话或语音沟通", icon: Phone },
  { value: "im", label: "微信", description: "微信、飞书等即时沟通", icon: MessageCircle },
  { value: "visit", label: "面访", description: "到店、到厂或线下会面", icon: Users },
];

const EMPLOYEES = ["李白", "刘韬", "亚明", "王姐"];
const FORM_ID = "new-followup-form";

export default function NewFollowupPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const sp = use(searchParams);
  const router = useRouter();
  const customers = useMemo(() => getCustomers() as Customer[], []);
  const contacts = useMemo(
    () => (getContacts() as Contact[]).map(normalizeContact),
    []
  );
  const initialCustomer = customers.some((customer) => customer.id === sp.customer)
    ? sp.customer ?? ""
    : "";

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FollowupForm>(() => ({
    customerId: initialCustomer,
    contactId: "",
    status: "初步接触",
    mode: "im",
    record: "",
    lastContactAt: "",
    nextContactAt: "",
    owner: customers.find((customer) => customer.id === initialCustomer)?.owner ?? "李白",
  }));

  useEffect(() => {
    setForm((current) => (
      current.lastContactAt
        ? current
        : { ...current, lastContactAt: getLocalDateTime() }
    ));
  }, []);

  const selectedCustomer = customers.find((customer) => customer.id === form.customerId);
  const availableContacts = useMemo(
    () => contacts.filter((contact) => matchesCustomer(contact, selectedCustomer)),
    [contacts, selectedCustomer]
  );
  const selectedContact = contacts.find((contact) => contact.id === form.contactId);

  const update = <K extends keyof FollowupForm>(key: K, value: FollowupForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectCustomer = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId);
    setForm((current) => ({
      ...current,
      customerId,
      contactId: "",
      owner: customer?.owner ?? current.owner,
    }));
  };

  const missingFields = [
    !form.customerId && "客户",
    !form.contactId && "联系人",
    !form.record.trim() && "跟进记录",
    !form.lastContactAt && "实际跟进时间",
    !form.owner && "跟进人",
  ].filter(Boolean) as string[];
  const isValid = missingFields.length === 0;

  const submit = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    console.info("[新建跟进] 开始保存客户跟进记录", {
      customerId: form.customerId,
      contactId: form.contactId,
      status: form.status,
      mode: form.mode,
    });

    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("跟进已创建", {
      description: `${selectedCustomer?.name ?? "客户"} · ${form.status}`,
      duration: 4000,
    });
    router.push("/crm/followups");
  };

  return (
    <AdminShell
      pageTitle="新建跟进"
      pageKicker="客户管理"
      pageDescription="记录本次客户沟通，并明确下一次联系时间和推进阶段。"
      pageActions={(
        <>
          <Button asChild variant="ghost" size="md">
            <Link href="/crm/followups">取消</Link>
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="default"
            size="md"
            disabled={!isValid || saving}
          >
            {saving ? "保存中…" : "保存跟进"}
          </Button>
        </>
      )}
    >
      <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/crm/followups"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          返回跟进看板
        </Link>

        <form
          id={FORM_ID}
          className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--card)]">
            <FormSection
              number="01"
              title="选择客户对象"
              description="联系人会根据客户自动过滤，避免把沟通记录挂到错误客户。"
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="客户" required>
                  <SelectControl
                    aria-label="客户"
                    value={form.customerId || undefined}
                    onValueChange={selectCustomer}
                    placeholder="请选择客户"
                    options={customers.map((customer) => ({
                      value: customer.id,
                      label: `${customer.name} · ${customer.id}`,
                    }))}
                  />
                </Field>

                <Field
                  label="联系人"
                  required
                  help={
                    form.customerId && availableContacts.length === 0
                      ? "该客户还没有联系人记录"
                      : "仅显示当前客户的联系人"
                  }
                >
                  <SelectControl
                    aria-label="联系人"
                    value={form.contactId || undefined}
                    disabled={!form.customerId || availableContacts.length === 0}
                    onValueChange={(value) => update("contactId", value)}
                    placeholder={form.customerId ? "请选择联系人" : "请先选择客户"}
                    options={availableContacts.map((contact) => ({
                      value: contact.id,
                      label: `${contact.name} · ${contact.title || contact.dept}`,
                    }))}
                  />
                </Field>
              </div>

              {selectedContact ? (
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md bg-[var(--secondary)]/55 px-3 py-2.5 text-[13px] text-[var(--ink-dim)]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[var(--ink)]">
                    <ContactRound className="h-4 w-4 text-[var(--primary)]" />
                    {selectedContact.name}
                  </span>
                  <span>{selectedContact.title || "职务未填写"}</span>
                  <span className="font-mono">
                    {selectedContact.mobile || selectedContact.phone || "电话未填写"}
                  </span>
                  <span>{selectedContact.email || "邮箱未填写"}</span>
                </div>
              ) : null}
            </FormSection>

            <FormSection
              number="02"
              title="记录本次沟通"
              description="先确认推进阶段和沟通方式，再写下事实、结论与客户反馈。"
            >
              <Field label="推进阶段" required>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
                  {STATUS_OPTIONS.map((status, index) => (
                    <button
                      key={status}
                      type="button"
                      aria-pressed={form.status === status}
                      onClick={() => update("status", status)}
                      className={cn(
                        "relative min-h-10 rounded-md border px-2 py-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                        form.status === status
                          ? "border-[var(--ink)] bg-[var(--ink)] font-medium text-[var(--background)]"
                          : "border-[var(--hairline-strong)] text-[var(--ink-dim)] hover:bg-[var(--accent)] hover:text-[var(--ink)]"
                      )}
                    >
                      <span className="mr-1 font-mono text-[11px] opacity-60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {status}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="沟通方式" required>
                <div className="grid gap-2 sm:grid-cols-3">
                  {MODE_OPTIONS.map((mode) => {
                    const Icon = mode.icon;
                    const selected = form.mode === mode.value;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => update("mode", mode.value)}
                        className={cn(
                          "flex min-h-[68px] items-center gap-3 rounded-md border px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                          selected
                            ? "border-[var(--primary)] bg-[var(--accent)]"
                            : "border-[var(--hairline-strong)] hover:bg-[var(--secondary)]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                            selected
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "bg-[var(--secondary)] text-[var(--ink-mute)]"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-[14px] font-medium text-[var(--ink)]">
                            {mode.label}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-[var(--ink-mute)]">
                            {mode.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="跟进记录" required>
                <textarea
                  aria-label="跟进记录"
                  value={form.record}
                  onChange={(event) => update("record", event.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="记录客户需求、关键结论和需要协同的事项。例如：客户确认 200 件立领大衣交期，希望明天下午补充辅料清单。"
                  className="w-full resize-y rounded-md border border-[var(--hairline-strong)] bg-[var(--card)] px-3 py-2.5 text-[14px] leading-6 text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
                />
                <div className="mt-1 flex justify-between text-[12px] text-[var(--ink-mute)]">
                  <span>建议包含：客户反馈、确认事项、风险和下一步</span>
                  <span className="font-mono">{form.record.length}/500</span>
                </div>
              </Field>
            </FormSection>

            <FormSection
              number="03"
              title="安排后续动作"
              description="记录实际沟通时间，并为需要继续推进的事项设置下一次联系。"
              last
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="实际跟进时间" required>
                  <DatePicker
                    aria-label="实际跟进时间"
                    value={form.lastContactAt}
                    onChange={(value) => update("lastContactAt", value)}
                    withTime
                    required
                  />
                  <button
                    type="button"
                    onClick={() => update("lastContactAt", getLocalDateTime())}
                    className="mt-1.5 text-[12px] text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    设为现在
                  </button>
                </Field>

                <Field label="下次跟进时间" help="没有明确后续动作时可以暂不设置">
                  <DatePicker
                    aria-label="下次跟进时间"
                    value={form.nextContactAt}
                    min={form.lastContactAt || undefined}
                    onChange={(value) => update("nextContactAt", value)}
                    withTime
                  />
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {[
                      { label: "明天", days: 1 },
                      { label: "3 天后", days: 3 },
                      { label: "一周后", days: 7 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => update("nextContactAt", addDays(preset.days))}
                        className="text-[12px] text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="跟进人" required>
                <SelectControl
                  aria-label="跟进人"
                  value={form.owner}
                  onValueChange={(value) => update("owner", value)}
                  className="lg:max-w-[calc(50%-0.5rem)]"
                  options={EMPLOYEES.map((value) => ({ value, label: value }))}
                />
              </Field>
            </FormSection>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--hairline)] bg-[var(--secondary)]/25 px-5 py-4 lg:hidden">
              <span className="text-[12px] text-[var(--ink-mute)]">
                {isValid ? "必填信息已完成" : `还需填写：${missingFields.join("、")}`}
              </span>
              <Button type="submit" disabled={!isValid || saving}>
                {saving ? "保存中…" : "保存跟进"}
              </Button>
            </div>
          </div>

          <FollowupSummary
            customer={selectedCustomer}
            contact={selectedContact}
            form={form}
            missingFields={missingFields}
          />
        </form>
      </div>
    </AdminShell>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={cn("px-5 py-5 sm:px-6 sm:py-6", !last && "border-b border-[var(--hairline)]")}>
      <div className="mb-5 grid gap-1 sm:grid-cols-[52px_1fr]">
        <span className="font-mono text-[12px] text-[var(--primary)]">{number}</span>
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight text-[var(--ink)]">{title}</h2>
          <p className="mt-1 max-w-[620px] text-[13px] leading-5 text-[var(--ink-mute)]">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-5 sm:pl-[52px]">{children}</div>
    </section>
  );
}

function Field({
  label,
  required = false,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-[var(--ink-dim)]">
          {label}
          {required ? <span className="ml-1 text-[var(--destructive)]">*</span> : null}
        </span>
        {help ? <span className="text-right text-[12px] text-[var(--ink-mute)]">{help}</span> : null}
      </div>
      {children}
    </div>
  );
}

function FollowupSummary({
  customer,
  contact,
  form,
  missingFields,
}: {
  customer?: Customer;
  contact?: FollowupContact;
  form: FollowupForm;
  missingFields: string[];
}) {
  const selectedMode = MODE_OPTIONS.find((mode) => mode.value === form.mode);
  const statusIndex = STATUS_OPTIONS.indexOf(form.status as typeof STATUS_OPTIONS[number]);

  return (
    <aside className="sticky top-5 overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--card)]">
      <div className="border-b border-[var(--hairline)] px-5 py-4">
        <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-mute)]">
          跟进摘要
        </p>
        <h2 className="mt-1 text-[18px] font-semibold text-[var(--ink)]">
          {customer?.name ?? "尚未选择客户"}
        </h2>
        {customer ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={customer.type === "重要" ? "danger" : "info"} size="sm">
              {customer.type}
            </Badge>
            {(customer.tags ?? []).map((tag) => (
              <span key={tag} className="text-[12px] text-[var(--ink-mute)]">#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="divide-y divide-[var(--hairline)] px-5">
        <SummaryRow icon={<ContactRound className="h-4 w-4" />} label="联系人">
          <p className="text-[13px] font-medium text-[var(--ink)]">
            {contact?.name ?? "待选择"}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--ink-mute)]">
            {contact ? `${contact.title || contact.dept} · ${contact.mobile || contact.phone}` : "选择客户后关联联系人"}
          </p>
        </SummaryRow>

        <SummaryRow icon={<MessageCircle className="h-4 w-4" />} label="本次沟通">
          <p className="text-[13px] font-medium text-[var(--ink)]">
            {selectedMode?.label} · {form.status}
          </p>
          <p className="mt-0.5 line-clamp-3 text-[12px] leading-5 text-[var(--ink-mute)]">
            {form.record || "跟进记录会显示在这里"}
          </p>
        </SummaryRow>

        <SummaryRow icon={<CalendarClock className="h-4 w-4" />} label="时间安排">
          <p className="font-mono text-[12px] text-[var(--ink)]">
            本次：{formatDateTime(form.lastContactAt)}
          </p>
          <p className="mt-1 font-mono text-[12px] text-[var(--ink-mute)]">
            下次：{formatDateTime(form.nextContactAt)}
          </p>
        </SummaryRow>

        <SummaryRow icon={<UserRound className="h-4 w-4" />} label="跟进人">
          <p className="text-[13px] font-medium text-[var(--ink)]">{form.owner || "待选择"}</p>
          <p className="mt-0.5 text-[12px] text-[var(--ink-mute)]">
            {customer?.owner && customer.owner !== form.owner
              ? `客户负责人：${customer.owner}`
              : "与客户负责人保持一致"}
          </p>
        </SummaryRow>
      </div>

      <div className="border-t border-[var(--hairline)] bg-[var(--secondary)]/25 px-5 py-4">
        <div className="mb-3 flex items-center justify-between text-[12px]">
          <span className="text-[var(--ink-mute)]">当前阶段</span>
          <span className="font-mono text-[var(--ink-dim)]">
            {statusIndex + 1}/{STATUS_OPTIONS.length}
          </span>
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((status, index) => (
            <span
              key={status}
              title={status}
              className={cn(
                "h-1.5 flex-1 rounded-sm",
                index <= statusIndex ? "bg-[var(--primary)]" : "bg-[var(--hairline-strong)]"
              )}
            />
          ))}
        </div>

        <div className={cn(
          "mt-4 flex items-start gap-2 rounded-md px-3 py-2.5 text-[12px] leading-5",
          missingFields.length === 0
            ? "bg-[var(--success-soft)] text-[var(--success)]"
            : "bg-[var(--accent)] text-[var(--accent-foreground)]"
        )}>
          {missingFields.length === 0 ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <span>
            {missingFields.length === 0
              ? "必填信息已完成，可以保存跟进。"
              : `还需填写：${missingFields.join("、")}`}
          </span>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[84px_1fr] gap-3 py-4">
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--ink-mute)]">
        {icon}
        {label}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function matchesCustomer(contact: FollowupContact, customer?: Customer) {
  if (!customer) return false;
  return (
    customer.name.includes(contact.customerName) ||
    Boolean(customer.shortName && customer.shortName.includes(contact.customerName))
  );
}

function normalizeContact(contact: Contact): FollowupContact {
  const raw = contact as Contact & { contactName?: string };
  return {
    id: raw.id,
    customerName:
      raw.customer ??
      raw.customerName ??
      (raw.contactName ? raw.name : ""),
    name: raw.contactName ?? raw.name,
    title: raw.title,
    dept: raw.dept,
    phone: raw.phone,
    mobile: raw.mobile,
    email: raw.email,
  };
}

function getLocalDateTime(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateTime(date);
}

function formatDateTime(value: string) {
  if (!value) return "未安排";
  return value.replace("T", " ");
}
