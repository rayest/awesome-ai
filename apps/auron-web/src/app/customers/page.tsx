"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  ExternalLink,
  Filter,
  MoreHorizontal,
  PackageOpen,
  Search,
  Tag as TagIcon,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { NewCustomerSheet } from "@/components/domain/customer-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyIllustration, EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { cn, fmtPrice } from "@/lib/utils";
import {
  getCustomers,
  getFollowups,
  type Customer,
  type CustomerType,
  type Followup,
  type Tag,
} from "@/lib/data";

type CustomerView = "全部客户" | "待跟进" | "重要客户" | "未合作";

type FollowupState = {
  tone: "danger" | "warn" | "info" | "success" | "neutral";
  label: string;
  detail: string;
  priority: number;
};

const TYPE_TONE: Record<CustomerType, "neutral" | "info" | "danger"> = {
  "未合作": "neutral",
  "已合作": "info",
  "重要": "danger",
};

const VIEW_OPTIONS: CustomerView[] = ["全部客户", "待跟进", "重要客户", "未合作"];
const TYPE_OPTIONS: Array<"全部" | CustomerType> = ["全部", "未合作", "已合作", "重要"];
const TAG_OPTIONS: Array<"全部" | Tag> = ["全部", "品牌商", "跨境"];

export default function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; tag?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const customers = useMemo(() => getCustomers() as Customer[], []);
  const followups = useMemo(() => getFollowups() as Followup[], []);

  const [q, setQ] = useState(sp.q ?? "");
  const [activeView, setActiveView] = useState<CustomerView>("全部客户");
  const [typeFilter, setTypeFilter] = useState<"全部" | CustomerType>(
    isCustomerType(sp.type) ? sp.type : "全部"
  );
  const [tagFilter, setTagFilter] = useState<"全部" | Tag>(
    isCustomerTag(sp.tag) ? sp.tag : "全部"
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [urgentFirst, setUrgentFirst] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(customers[0]?.id ?? null);

  useEffect(() => {
    setQ(sp.q ?? "");
    setTypeFilter(isCustomerType(sp.type) ? sp.type : "全部");
    setTagFilter(isCustomerTag(sp.tag) ? sp.tag : "全部");
  }, [sp]);

  const followupByCustomer = useMemo(() => {
    return new Map(
      customers.map((customer) => [
        customer.id,
        findLatestFollowup(customer, followups),
      ])
    );
  }, [customers, followups]);

  const viewCounts = useMemo(() => {
    const needsFollowup = customers.filter((customer) => {
      const state = getFollowupState(customer, followupByCustomer.get(customer.id));
      return state.priority >= 3;
    }).length;

    return {
      "全部客户": customers.length,
      "待跟进": needsFollowup,
      "重要客户": customers.filter((customer) => customer.type === "重要").length,
      "未合作": customers.filter((customer) => customer.type === "未合作").length,
    } satisfies Record<CustomerView, number>;
  }, [customers, followupByCustomer]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = customers.filter((customer) => {
      if (!matchesView(customer, activeView, followupByCustomer.get(customer.id))) return false;
      if (typeFilter !== "全部" && customer.type !== typeFilter) return false;
      if (tagFilter !== "全部" && !(customer.tags ?? []).includes(tagFilter)) return false;
      if (!query) return true;
      return [
        customer.name,
        customer.shortName,
        customer.id,
        customer.owner,
        ...(customer.tags ?? []),
      ].some((value) => (value ?? "").toLowerCase().includes(query));
    });

    if (!urgentFirst) return filtered;
    return [...filtered].sort((a, b) => {
      const aState = getFollowupState(a, followupByCustomer.get(a.id));
      const bState = getFollowupState(b, followupByCustomer.get(b.id));
      return bState.priority - aState.priority;
    });
  }, [activeView, customers, followupByCustomer, q, tagFilter, typeFilter, urgentFirst]);

  const selectedCustomer =
    rows.find((customer) => customer.id === selectedId) ??
    rows[0] ??
    null;

  const activeFilterCount = Number(typeFilter !== "全部") + Number(tagFilter !== "全部");

  const clearFilters = () => {
    setTypeFilter("全部");
    setTagFilter("全部");
    console.info("[客户档案] 已清除合作状态与客户标签筛选");
  };

  const selectCustomer = (customerId: string) => {
    setSelectedId(customerId);
    console.info("[客户档案] 选择客户并展示行动面板", { customerId });
  };

  return (
    <AdminShell
      pageTitle="客户档案"
      pageKicker="客户管理"
      pageDescription="统一管理客户资料、跟进情况和未结打样，从客户视角快速回到下一步业务动作。"
      pageActions={(
        <>
          <Button variant="outline" size="md">导入 Excel</Button>
          <NewCustomerSheet />
        </>
      )}
    >
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--card)]">
          <CustomerViews
            activeView={activeView}
            counts={viewCounts}
            onChange={setActiveView}
          />

          <div className="border-b border-[var(--hairline)] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[240px] flex-1 sm:max-w-[360px]">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-mute)]"
                />
                <Input
                  aria-label="搜索客户"
                  placeholder="搜索客户名称 / ID / 业务员 / 标签"
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  className="pl-9 pr-9"
                />
                {q ? (
                  <button
                    type="button"
                    aria-label="清空搜索"
                    onClick={() => setQ("")}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--ink-mute)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </label>

              <button
                type="button"
                aria-expanded={filtersOpen}
                aria-controls="customer-filters"
                onClick={() => setFiltersOpen((open) => !open)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  filtersOpen || activeFilterCount > 0
                    ? "border-[var(--ink)] bg-[var(--secondary)] text-[var(--ink)]"
                    : "border-[var(--hairline-strong)] text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                <Filter className="h-4 w-4" />
                筛选
                {activeFilterCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1.5 font-mono text-[12px] text-[var(--background)]">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                aria-pressed={urgentFirst}
                onClick={() => setUrgentFirst((value) => !value)}
                className={cn(
                  "ml-auto inline-flex h-9 items-center gap-2 rounded-md px-3 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  urgentFirst
                    ? "bg-[var(--secondary)] font-medium text-[var(--ink)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                <ArrowUpDown className="h-4 w-4" />
                {urgentFirst ? "紧急优先" : "默认排序"}
              </button>

              <span className="font-mono text-[13px] text-[var(--ink-mute)]">
                {rows.length} 个客户
              </span>
            </div>

            {filtersOpen ? (
              <CustomerFilters
                typeFilter={typeFilter}
                tagFilter={tagFilter}
                activeFilterCount={activeFilterCount}
                onTypeChange={setTypeFilter}
                onTagChange={setTagFilter}
                onClear={clearFilters}
              />
            ) : null}
          </div>

          <div className="grid min-h-[620px] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(330px,0.5fr)]">
            <div className="min-w-0 overflow-x-auto">
              <div className="min-w-[650px]">
                <div className="grid grid-cols-[minmax(190px,1.5fr)_78px_110px_84px_125px_32px] items-center gap-2 border-b border-[var(--hairline)] bg-[var(--secondary)]/35 px-3 py-2.5 font-mono text-[12px] tracking-[0.08em] text-[var(--ink-mute)]">
                  <div>客户</div>
                  <div>状态</div>
                  <div>最后联系</div>
                  <div>负责人</div>
                  <div>跟进提醒</div>
                  <div aria-hidden />
                </div>

                {rows.map((customer) => {
                  const followup = followupByCustomer.get(customer.id);
                  return (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      followup={followup}
                      selected={selectedCustomer?.id === customer.id}
                      onSelect={() => selectCustomer(customer.id)}
                    />
                  );
                })}

                {rows.length === 0 ? (
                  <EmptyState
                    density="card"
                    title={q ? "没有匹配的客户" : "当前视图没有客户"}
                    description={
                      q
                        ? `没有客户名称、ID、业务员或标签包含「${q}」的记录。`
                        : "调整视图或清除筛选后再试。"
                    }
                    illustration={<EmptyIllustration kind="box" />}
                  />
                ) : null}
              </div>
            </div>

            <CustomerActionPanel
              customer={selectedCustomer}
              followup={
                selectedCustomer ? followupByCustomer.get(selectedCustomer.id) : undefined
              }
            />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function CustomerViews({
  activeView,
  counts,
  onChange,
}: {
  activeView: CustomerView;
  counts: Record<CustomerView, number>;
  onChange: (view: CustomerView) => void;
}) {
  return (
    <nav aria-label="客户视图" className="flex overflow-x-auto border-b border-[var(--hairline)] px-2 sm:px-4">
      {VIEW_OPTIONS.map((view) => (
        <button
          key={view}
          type="button"
          aria-pressed={activeView === view}
          onClick={() => onChange(view)}
          className={cn(
            "relative flex h-12 shrink-0 items-center gap-2 px-3 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] sm:px-4",
            activeView === view
              ? "font-medium text-[var(--ink)]"
              : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
          )}
        >
          {view}
          <span
            className={cn(
              "rounded px-1.5 py-0.5 font-mono text-[12px]",
              activeView === view
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "bg-[var(--secondary)] text-[var(--ink-mute)]"
            )}
          >
            {counts[view]}
          </span>
          {activeView === view ? (
            <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[var(--primary)]" />
          ) : null}
        </button>
      ))}
    </nav>
  );
}

function CustomerFilters({
  typeFilter,
  tagFilter,
  activeFilterCount,
  onTypeChange,
  onTagChange,
  onClear,
}: {
  typeFilter: "全部" | CustomerType;
  tagFilter: "全部" | Tag;
  activeFilterCount: number;
  onTypeChange: (type: "全部" | CustomerType) => void;
  onTagChange: (tag: "全部" | Tag) => void;
  onClear: () => void;
}) {
  return (
    <div
      id="customer-filters"
      className="mt-3 grid gap-3 border-t border-[var(--hairline)] pt-3 lg:grid-cols-[1fr_1fr_auto]"
    >
      <FilterGroup
        label="合作状态"
        options={TYPE_OPTIONS}
        value={typeFilter}
        onChange={onTypeChange}
      />
      <FilterGroup
        label="客户标签"
        options={TAG_OPTIONS}
        value={tagFilter}
        onChange={onTagChange}
      />
      <button
        type="button"
        disabled={activeFilterCount === 0}
        onClick={onClear}
        className="h-8 self-end rounded-md px-2.5 text-[13px] text-[var(--ink-dim)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-40"
      >
        清除筛选
      </button>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[12px] font-medium text-[var(--ink-mute)]">{label}</legend>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cn(
              "h-8 rounded-md px-3 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              value === option
                ? "bg-[var(--ink)] text-[var(--background)]"
                : "text-[var(--ink-dim)] hover:bg-[var(--accent)] hover:text-[var(--ink)]"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CustomerRow({
  customer,
  followup,
  selected,
  onSelect,
}: {
  customer: Customer;
  followup?: Followup;
  selected: boolean;
  onSelect: () => void;
}) {
  const state = getFollowupState(customer, followup);
  const lastContact = customer.lastContactAt ?? followup?.lastContactAt ?? "暂无记录";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative grid min-h-[82px] cursor-pointer grid-cols-[minmax(190px,1.5fr)_78px_110px_84px_125px_32px] items-center gap-2 border-b border-[var(--hairline)] px-3 py-3 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]",
        selected ? "bg-[var(--accent)]/45" : "hover:bg-[var(--secondary)]/45"
      )}
    >
      {selected ? <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--primary)]" /> : null}

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-[var(--ink)]">
            {customer.name}
          </span>
          {customer.type === "重要" ? (
            <span className="shrink-0 text-[12px] font-medium text-[var(--primary)]">重要</span>
          ) : null}
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-2 font-mono text-[12px] text-[var(--ink-mute)]">
          <span className="truncate">{customer.id}</span>
          {(customer.tags ?? []).map((tag) => (
            <span key={tag} className="shrink-0">
              #{tag}
            </span>
          ))}
          {(customer.collaborators ?? []).length > 0 ? (
            <span className="shrink-0">+{customer.collaborators?.length} 协作</span>
          ) : null}
        </div>
      </div>

      <div>
        <Badge tone={TYPE_TONE[customer.type]} size="sm">{customer.type}</Badge>
      </div>

      <div className="min-w-0">
        <div className="truncate font-mono text-[13px] text-[var(--ink)]">{lastContact}</div>
        <div className="mt-1 truncate text-[12px] text-[var(--ink-mute)]">
          {followup?.contactName ? `联系 ${followup.contactName}` : "尚无联系人记录"}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] font-mono text-[12px] text-[var(--background)]">
          {(customer.owner ?? "未")[0]}
        </span>
        <span className="truncate text-[13px] text-[var(--ink-dim)]">
          {customer.owner ?? "未分配"}
        </span>
      </div>

      <div className="min-w-0">
        <div className={cn("flex items-center gap-1.5 text-[13px] font-medium", followupToneClass(state.tone))}>
          {state.priority >= 3 ? <CircleAlert className="h-3.5 w-3.5 shrink-0" /> : <Clock3 className="h-3.5 w-3.5 shrink-0" />}
          <span className="truncate">{state.label}</span>
        </div>
        <div className="mt-1 truncate text-[12px] text-[var(--ink-mute)]">{state.detail}</div>
      </div>

      <Link
        href={`/customers/${customer.id}`}
        aria-label={`查看 ${customer.name} 的完整档案`}
        onClick={(event) => event.stopPropagation()}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-mute)] opacity-60 transition-all hover:bg-[var(--card)] hover:text-[var(--ink)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Link>
    </div>
  );
}

function CustomerActionPanel({
  customer,
  followup,
}: {
  customer: Customer | null;
  followup?: Followup;
}) {
  if (!customer) {
    return (
      <aside className="flex min-h-[420px] items-center justify-center border-t border-[var(--hairline)] bg-[var(--secondary)]/20 p-8 text-center xl:border-l xl:border-t-0">
        <div>
          <Users className="mx-auto h-8 w-8 text-[var(--ink-mute)]" />
          <p className="mt-3 text-[14px] font-medium text-[var(--ink)]">选择一个客户</p>
          <p className="mt-1 text-[13px] text-[var(--ink-mute)]">查看最近联系和下一步动作。</p>
        </div>
      </aside>
    );
  }

  const state = getFollowupState(customer, followup);
  const lastContact = customer.lastContactAt ?? followup?.lastContactAt ?? "暂无联系记录";
  const collaborators = customer.collaborators ?? [];

  return (
    <aside className="flex min-h-[620px] flex-col border-t border-[var(--hairline)] bg-[var(--secondary)]/15 xl:border-l xl:border-t-0">
      <div className="border-b border-[var(--hairline)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[20px] font-semibold tracking-tight text-[var(--ink)]">
                {customer.name}
              </h2>
              <Badge tone={TYPE_TONE[customer.type]} size="sm">{customer.type}</Badge>
            </div>
            <p className="mt-1 font-mono text-[12px] text-[var(--ink-mute)]">
              客户 ID：{customer.id}
            </p>
          </div>
          <Link
            href={`/customers/${customer.id}`}
            aria-label="打开完整客户档案"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--ink-mute)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex-1 divide-y divide-[var(--hairline)] px-5">
        <PanelSection icon={<Clock3 className="h-4 w-4" />} title="最近联系">
          <p className="font-mono text-[13px] text-[var(--ink)]">{lastContact}</p>
          <p className="mt-1 text-[13px] leading-5 text-[var(--ink-dim)]">
            {followup?.record ?? "还没有跟进记录，可以从这里发起第一次联系。"}
          </p>
        </PanelSection>

        <PanelSection icon={<CalendarDays className="h-4 w-4" />} title="下一步跟进">
          <div className={cn("text-[13px] font-semibold", followupToneClass(state.tone))}>
            {state.label}
          </div>
          <p className="mt-1 font-mono text-[12px] text-[var(--ink-mute)]">
            {followup?.nextContactAt ?? "尚未安排时间"}
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[var(--ink-dim)]">{state.detail}</p>
        </PanelSection>

        <PanelSection icon={<PackageOpen className="h-4 w-4" />} title="未结打样">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[18px] font-semibold text-[var(--ink)]">
              {customer.openNotices ?? 0}
            </span>
            <span className="text-[12px] text-[var(--ink-mute)]">项</span>
          </div>
          <p className="mt-1 text-[13px] text-[var(--ink-dim)]">
            {(customer.openNotices ?? 0) > 0 ? "需要继续确认打样进度。" : "当前没有未结打样。"}
          </p>
        </PanelSection>

        <PanelSection icon={<Users className="h-4 w-4" />} title="负责人与协作">
          <div className="flex flex-wrap items-center gap-2">
            <PersonChip name={customer.owner ?? "未分配"} />
            {collaborators.map((name) => <PersonChip key={name} name={name} secondary />)}
          </div>
        </PanelSection>

        <PanelSection icon={<TagIcon className="h-4 w-4" />} title="标签与备注">
          <div className="flex flex-wrap gap-1.5">
            {(customer.tags ?? []).length > 0
              ? customer.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-[var(--accent)] px-2 py-1 text-[12px] text-[var(--accent-foreground)]"
                  >
                    #{tag}
                  </span>
                ))
              : <span className="text-[13px] text-[var(--ink-mute)]">暂无标签</span>}
          </div>
          <p className="mt-2 text-[13px] leading-5 text-[var(--ink-dim)]">
            {customer.note ?? "暂无客户备注。"}
          </p>
        </PanelSection>

        {customer.ytdRevenue ? (
          <div className="flex items-center justify-between py-3 text-[12px] text-[var(--ink-mute)]">
            <span>年度营收</span>
            <span className="font-mono text-[var(--ink-dim)]">¥{fmtPrice(customer.ytdRevenue)}</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-[var(--hairline)] p-4">
        <Button asChild variant="default" size="md">
          <Link href={`/crm/followups/new?customer=${customer.id}`}>
            <UserRoundPlus className="h-4 w-4" />
            新增跟进
          </Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href={`/customers/${customer.id}`}>
            查看详情
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}

function PanelSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-[96px_1fr] gap-3 py-4">
      <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--ink-mute)]">
        {icon}
        {title}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function PersonChip({ name, secondary = false }: { name: string; secondary?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-[13px]",
        secondary
          ? "border-[var(--hairline)] bg-[var(--background)] text-[var(--ink-dim)]"
          : "border-[var(--hairline-strong)] bg-[var(--card)] font-medium text-[var(--ink)]"
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ink)] font-mono text-[11px] text-[var(--background)]">
        {name[0]}
      </span>
      {name}
    </span>
  );
}

function matchesView(customer: Customer, view: CustomerView, followup?: Followup) {
  if (view === "重要客户") return customer.type === "重要";
  if (view === "未合作") return customer.type === "未合作";
  if (view === "待跟进") return getFollowupState(customer, followup).priority >= 3;
  return true;
}

function findLatestFollowup(customer: Customer, followups: Followup[]) {
  for (let index = followups.length - 1; index >= 0; index -= 1) {
    const followup = followups[index];
    if (
      followup.customerId === customer.id ||
      customer.name.includes(followup.customer) ||
      (customer.shortName && customer.shortName.includes(followup.customer))
    ) {
      return followup;
    }
  }
  return undefined;
}

function getFollowupState(customer: Customer, followup?: Followup): FollowupState {
  const lastContact = customer.lastContactAt ?? followup?.lastContactAt ?? "";
  const nextContact = followup?.nextContactAt ?? "";
  const note = customer.note ?? "";

  if (!followup && !customer.lastContactAt) {
    return {
      tone: "warn",
      label: "未开始跟进",
      detail: "建议尽快建立第一次联系",
      priority: 3,
    };
  }

  if (isLongOverdue(lastContact) || /个月.*未|需激活/.test(note)) {
    return {
      tone: "danger",
      label: "超过 7 天未联系",
      detail: followup?.record ?? "需要重新激活客户关系",
      priority: 4,
    };
  }

  if (lastContact.includes("今")) {
    return {
      tone: "success",
      label: "今天已联系",
      detail: followup?.record ?? "跟进记录已更新",
      priority: 1,
    };
  }

  if (nextContact.includes("今")) {
    return {
      tone: "warn",
      label: "今天待跟进",
      detail: followup?.record ?? "按计划完成客户沟通",
      priority: 3,
    };
  }

  if (nextContact.includes("明")) {
    return {
      tone: "info",
      label: "明天跟进",
      detail: followup?.record ?? "已安排下一次联系",
      priority: 2,
    };
  }

  return {
    tone: "neutral",
    label: "计划跟进",
    detail: followup?.record ?? "保持客户联系节奏",
    priority: 1,
  };
}

function isLongOverdue(value: string) {
  const days = value.match(/(\d+)\s*天前/);
  return Boolean(days && Number(days[1]) > 7);
}

function followupToneClass(tone: FollowupState["tone"]) {
  if (tone === "danger") return "text-[var(--destructive)]";
  if (tone === "warn") return "text-[var(--warn)]";
  if (tone === "info") return "text-[var(--info)]";
  if (tone === "success") return "text-[var(--success)]";
  return "text-[var(--ink-dim)]";
}

function isCustomerType(value?: string): value is CustomerType {
  return value === "未合作" || value === "已合作" || value === "重要";
}

function isCustomerTag(value?: string): value is Tag {
  return value === "品牌商" || value === "跨境";
}
