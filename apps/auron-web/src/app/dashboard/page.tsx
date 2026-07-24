"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Factory,
  Plus,
  Receipt,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FLOW_DATA = [
  { day: "周日", quote: 9.2, profit: 2.1, risk: -1.6 },
  { day: "周一", quote: 7.8, profit: 1.8, risk: -1.2 },
  { day: "周二", quote: 11.5, profit: 2.8, risk: -2.4 },
  { day: "周三", quote: 14.6, profit: 4.8, risk: -3.1 },
  { day: "周四", quote: 13.2, profit: 3.5, risk: -2.7 },
  { day: "周五", quote: 16.8, profit: 4.3, risk: -4.2 },
  { day: "周六", quote: 18.4, profit: 3.9, risk: -5.1 },
] as const;

const TODO_GROUPS = [
  {
    key: "priority",
    label: "重点",
    items: [
      { role: "业务员", time: "11:30", title: "弘大马经理 · 辅料清单确认", href: "/crm/followups?customer=CUST-HD-002" },
      { role: "业务跟单", time: "12:00", title: "卫衣辅料清单送到乾盛", href: "/orders/sample-notices?customer=CUST-QS-001" },
      { role: "报价员", time: "14:00", title: "完成 Q-0318 染色工艺重算", href: "/orders/quotations?customer=CUST-HD-002" },
      { role: "老板", time: "17:00", title: "审批乾盛 200 件报价", href: "/orders/quotations/Q-0317-A?customer=CUST-QS-001", alert: true },
      { role: "老板", time: "18:00", title: "复核染厂涨价对本月的影响", href: "/settings/audit" },
    ],
  },
  {
    key: "approval",
    label: "审批",
    items: [
      { role: "老板", time: "17:00", title: "审批乾盛 200 件报价", href: "/orders/quotations/Q-0317-A?customer=CUST-QS-001", alert: true },
      { role: "老板", time: "18:00", title: "确认染厂涨价调整方案", href: "/settings/audit" },
    ],
  },
  {
    key: "workshop",
    label: "工坊",
    items: [
      { role: "前道师傅", time: "14:00", title: "老周 · 织造中巡检 5 批次", href: "/orders/sample-workorders?master=%E8%80%81%E5%91%A8" },
      { role: "前道师傅", time: "16:30", title: "阿亮 · 高领打底试产首件", href: "/dictionary/machines?type=%E9%AB%98%E9%80%9F%E6%9C%BA" },
      { role: "业务跟单", time: "17:20", title: "确认乾盛辅料到厂状态", href: "/orders/sample-notices?customer=CUST-QS-001" },
    ],
  },
] as const;

const DELIVERY_GOALS = [
  { label: "本周报价", value: "18 / 24", progress: 75, tone: "lime" },
  { label: "打样交付", value: "9 / 12", progress: 75, tone: "yellow" },
  { label: "大货确认", value: "6 / 10", progress: 60, tone: "orange" },
] as const;

const ALERTS = [
  {
    severity: "danger",
    title: "染色毛利低于 15%",
    body: "4 张报价受染料涨价影响，需要重新核算。",
    meta: "预计影响 ¥18,400",
    href: "/orders/quotations",
  },
  {
    severity: "warn",
    title: "跟进超期 7 天",
    body: "巧岛、霞飞两个客户超过一周未触达。",
    meta: "最久 62 天",
    href: "/crm/followups",
  },
  {
    severity: "info",
    title: "物料字段待补齐",
    body: "安全库存尚未进入物料字典，暂不生成库存预警。",
    meta: "需要产品确认",
    href: "/dictionary/materials",
  },
] as const;

export default function DashboardPage() {
  return (
    <AdminShell
      pageTitle="经营总览"
      pageDescription="把报价、毛利、交付和异常放在同一个经营视图里。"
      pageActions={(
        <>
          <Button variant="outline" size="md">
            <CalendarDays className="h-4 w-4" />
            2026 年 7 月
          </Button>
          <Button variant="default" size="md">
            <Plus className="h-4 w-4" />
            新建报价
          </Button>
        </>
      )}
      pageMeta={[
        { label: "当前租户", value: "乾盛服饰" },
        { label: "待处理", value: 5 },
        { label: "异常", value: 3 },
      ]}
    >
      <div className="mx-auto max-w-[1660px] px-4 pb-8 sm:px-6 lg:px-7">
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <BusinessOverview />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MarginCard />
              <HealthCard />
              <DeliveryCard />
            </div>

            <section>
              <SectionHeading
                title="需要关注"
                subtitle="3 项业务风险"
                icon={<AlertTriangle className="h-4 w-4" />}
              />
              <div className="grid gap-3 lg:grid-cols-3">
                {ALERTS.map((alert) => (
                  <AlertCard key={alert.title} {...alert} />
                ))}
              </div>
            </section>

            <TeamPulse />
          </div>

          <aside className="space-y-4">
            <QuickActions />
            <TodoPanel />
            <OperationSnapshot />
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}

function BusinessOverview() {
  const [range, setRange] = useState<"7d" | "30d">("7d");

  return (
    <section className="overflow-hidden rounded-2xl bg-[var(--card)]">
      <div className="flex flex-col gap-4 px-5 pb-2 pt-5 sm:flex-row sm:items-start sm:justify-between lg:px-6 lg:pt-6">
        <div>
          <p className="text-[14px] text-[var(--ink-mute)]">本周确认报价</p>
          <div className="mt-1 flex flex-wrap items-end gap-3">
            <strong className="text-[42px] font-semibold leading-none tracking-[-0.055em] text-[var(--ink)] sm:text-[48px]">
              ¥82,400
            </strong>
            <span className="mb-1 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--success)]">
              <TrendingUp className="h-3.5 w-3.5" />
              5.1% 较上周
            </span>
          </div>
        </div>

        <div className="flex rounded-xl bg-[var(--secondary)] p-1">
          {(["7d", "30d"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={cn(
                "h-8 rounded-lg px-3 text-[13px] font-medium transition-colors",
                range === item
                  ? "bg-[var(--card)] text-[var(--ink)] shadow-sm"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
              )}
            >
              {item === "7d" ? "7 天" : "30 天"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="min-w-0 px-2 pb-4 sm:px-4 lg:px-5">
          <div className="mb-2 flex flex-wrap items-center gap-4 px-2 text-[12px] text-[var(--ink-dim)]">
            <LegendDot color="var(--chart-lime)" label="确认报价" />
            <LegendDot color="var(--chart-yellow)" label="预计毛利" />
            <LegendDot color="var(--chart-orange)" label="风险敞口" />
          </div>
          <BusinessBarChart />
        </div>

        <div className="grid border-t border-[var(--divider)] sm:grid-cols-3 lg:block lg:border-l lg:border-t-0">
          <MetricSummary label="年度营收" value="¥650万" delta="12.4%" positive />
          <MetricSummary label="年度毛利" value="¥170万" delta="2.1%" positive />
          <MetricSummary label="风险敞口" value="¥18.4万" delta="15.5%" />
        </div>
      </div>
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function BusinessBarChart() {
  const [activeIndex, setActiveIndex] = useState(3);
  const active = FLOW_DATA[activeIndex];

  return (
    <div
      className="relative h-[280px] w-full overflow-hidden"
      role="img"
      aria-label="最近七天确认报价、预计毛利和风险敞口柱状图"
    >
      <div
        className="pointer-events-none absolute z-20 min-w-[150px] -translate-x-1/2 rounded-xl bg-[var(--card)] p-3 text-[11px] shadow-[0_14px_36px_rgba(20,24,18,0.14)]"
        style={{
          left: `${((activeIndex + 0.5) / FLOW_DATA.length) * 100}%`,
          top: `${Math.max(10, 124 - (active.quote + active.profit) * 3)}px`,
        }}
      >
        <p className="mb-2 font-medium text-[var(--ink-mute)]">{active.day} · 2026 年 7 月</p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-[var(--ink-dim)]">确认报价</span>
          <strong>{active.quote.toFixed(1)} 万</strong>
        </p>
        <p className="mt-1 flex items-center justify-between gap-4">
          <span className="text-[var(--ink-dim)]">预计毛利</span>
          <strong>{active.profit.toFixed(1)} 万</strong>
        </p>
        <p className="mt-1 flex items-center justify-between gap-4">
          <span className="text-[var(--ink-dim)]">风险敞口</span>
          <strong>{Math.abs(active.risk).toFixed(1)} 万</strong>
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-9 bottom-[58px] top-3 flex flex-col justify-between">
        {[20, 15, 10, 5, 0].map((tick) => (
          <div key={tick} className="relative border-t border-[var(--divider)]">
            <span className="absolute -left-8 -top-2 text-[10px] text-[var(--ink-mute)]">{tick}万</span>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-9 bottom-7 top-3 grid grid-cols-7 gap-3">
        {FLOW_DATA.map((item) => (
          <button
            key={item.day}
            type="button"
            onMouseEnter={() => setActiveIndex(FLOW_DATA.indexOf(item))}
            onFocus={() => setActiveIndex(FLOW_DATA.indexOf(item))}
            onClick={() => setActiveIndex(FLOW_DATA.indexOf(item))}
            className="grid min-w-0 grid-rows-[1fr_42px_22px] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            aria-label={`${item.day}，确认报价 ${item.quote} 万，预计毛利 ${item.profit} 万，风险敞口 ${Math.abs(item.risk)} 万`}
          >
            <div className="flex flex-col justify-end">
              <div
                className="mx-auto w-[62%] min-w-5 rounded-t-[7px] bg-[var(--chart-yellow)]"
                style={{ height: `${item.profit * 5}px` }}
                title={`${item.day}预计毛利 ${item.profit} 万`}
              />
              <div
                className="mx-auto w-[62%] min-w-5 bg-[var(--chart-lime)]"
                style={{ height: `${item.quote * 5}px` }}
                title={`${item.day}确认报价 ${item.quote} 万`}
              />
            </div>
            <div className="border-t border-[var(--hairline-strong)]">
              <div
                className="mx-auto w-[62%] min-w-5 rounded-b-[7px] bg-[var(--chart-orange)]"
                style={{ height: `${Math.abs(item.risk) * 5}px` }}
                title={`${item.day}风险敞口 ${Math.abs(item.risk)} 万`}
              />
            </div>
            <span className="pt-2 text-center text-[11px] text-[var(--ink-mute)]">{item.day}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MetricSummary({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="border-b border-[var(--divider)] px-5 py-5 last:border-b-0 lg:py-6">
      <p className="text-[13px] text-[var(--ink-dim)]">{label}</p>
      <strong className="mt-1 block text-[29px] font-semibold tracking-[-0.045em] text-[var(--ink)]">{value}</strong>
      <span className={cn(
        "mt-1 inline-flex items-center gap-1 text-[12px] font-medium",
        positive ? "text-[var(--success)]" : "text-[var(--warn)]"
      )}>
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {delta} 较上月
      </span>
    </div>
  );
}

function MarginCard() {
  const segments = [
    { label: "织造", value: 18, color: "var(--chart-orange)" },
    { label: "染色", value: 7, color: "#f3c95c" },
    { label: "辅料", value: 6, color: "var(--chart-yellow)" },
    { label: "工费", value: 9, color: "#b8d85d" },
    { label: "毛利", value: 32, color: "var(--chart-lime)" },
  ];

  return (
    <article className="rounded-2xl bg-[var(--card)] p-5">
      <CardTitle title="成本分析" subtitle="本月报价结构" action="7 月" />
      <strong className="mt-8 block text-[38px] font-semibold tracking-[-0.05em]">¥84.5万</strong>
      <div className="mt-4 flex h-8 overflow-hidden rounded-lg bg-[var(--secondary)]">
        {segments.map((segment) => (
          <span
            key={segment.label}
            className="h-full border-r-2 border-white last:border-r-0"
            style={{ width: `${segment.value}%`, backgroundColor: segment.color }}
            title={`${segment.label} ${segment.value}%`}
          />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-3 text-[12px]">
            <LegendDot color={segment.color} label={segment.label} />
            <span className="font-medium text-[var(--ink-dim)]">{segment.value}%</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function HealthCard() {
  return (
    <article className="rounded-2xl bg-[var(--card)] p-5">
      <CardTitle title="经营健康度" subtitle="聚合近 30 天指标" action="30 天" />
      <div className="mt-9 text-center">
        <strong className="block text-[46px] font-semibold leading-none tracking-[-0.055em]">82%</strong>
        <span className="mt-2 block text-[12px] text-[var(--ink-mute)]">报价与交付处于健康区间</span>
        <div className="mt-6 grid grid-cols-10 gap-1" role="img" aria-label="经营健康度 82%">
          {Array.from({ length: 10 }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-7 rounded-md",
                index < 8 ? "bg-[var(--chart-lime)]" : "bg-[var(--secondary)]",
                index === 8 && "bg-[var(--chart-yellow)]"
              )}
            />
          ))}
        </div>
      </div>
      <p className="mt-1 text-[13px] leading-5 text-[var(--ink-dim)]">
        毛利稳定，但染色成本上涨，需要优先重算 4 张报价。
      </p>
    </article>
  );
}

function DeliveryCard() {
  return (
    <article className="rounded-2xl bg-[var(--card)] p-5 md:col-span-2 xl:col-span-1">
      <CardTitle title="本周目标" subtitle="核心经营动作" action="+ 新目标" />
      <div className="mt-7 space-y-5">
        {DELIVERY_GOALS.map((goal) => {
          const color = goal.tone === "lime"
            ? "var(--chart-lime)"
            : goal.tone === "yellow"
            ? "var(--chart-yellow)"
            : "var(--chart-orange)";
          return (
            <div key={goal.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-[13px]">
                <span className="font-medium text-[var(--ink)]">{goal.label}</span>
                <span className="text-[var(--ink-mute)]">{goal.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--secondary)]">
                <div className="h-full rounded-full" style={{ width: `${goal.progress}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
      <Link href="/me" className="mt-6 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--ink)] hover:underline">
        查看我的工作台
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

function CardTitle({ title, subtitle, action }: { title: string; subtitle: string; action: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[19px] font-semibold tracking-[-0.025em]">{title}</h2>
        <p className="mt-0.5 text-[12px] text-[var(--ink-mute)]">{subtitle}</p>
      </div>
      <button type="button" className="rounded-lg bg-[var(--secondary)] px-2.5 py-1.5 text-[12px] font-medium hover:bg-[var(--hairline)]">
        {action}
      </button>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: "新报价", icon: Receipt, href: "/orders/quotations/new" },
    { label: "新打样", icon: Factory, href: "/orders/sample-notices/new" },
    { label: "客户", icon: Users, href: "/customers" },
    { label: "更多", icon: Boxes, href: "/me" },
  ];

  return (
    <section className="rounded-2xl bg-[var(--card)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.03em]">今日经营卡</h2>
          <p className="text-[12px] text-[var(--ink-mute)]">快速操作</p>
        </div>
        <Link href="/me" className="rounded-lg bg-[var(--secondary)] px-2.5 py-1.5 text-[12px] font-medium hover:bg-[var(--hairline)]">
          查看全部
        </Link>
      </div>

      <Link
        href="/orders/quotations"
        className="mt-5 block overflow-hidden rounded-2xl bg-[var(--chart-lime)] p-5 text-[var(--ink)] transition-transform hover:-translate-y-0.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium">待审批报价</span>
          <FileCheck2 className="h-5 w-5" />
        </div>
        <strong className="mt-7 block text-[42px] font-semibold leading-none tracking-[-0.055em]">5</strong>
        <div className="mt-6 flex items-center justify-between text-[12px]">
          <span>合计 ¥126,800</span>
          <span className="inline-flex items-center gap-1 font-semibold">
            立即处理
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href} className="group text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--secondary)] transition-colors group-hover:bg-[var(--hairline)]">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <span className="mt-2 block text-[11px] text-[var(--ink-dim)]">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function TodoPanel() {
  const [activeKey, setActiveKey] = useState<(typeof TODO_GROUPS)[number]["key"]>("priority");
  const active = TODO_GROUPS.find((group) => group.key === activeKey) ?? TODO_GROUPS[0];

  return (
    <section className="overflow-hidden rounded-2xl bg-[var(--card)]">
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.03em]">今日待办</h2>
          <p className="text-[12px] text-[var(--ink-mute)]">11 项待处理</p>
        </div>
        <Clock3 className="h-5 w-5 text-[var(--ink-mute)]" />
      </div>

      <div role="tablist" aria-label="待办分类" className="flex gap-1 border-b border-[var(--divider)] px-4">
        {TODO_GROUPS.map((group) => (
          <button
            key={group.key}
            type="button"
            role="tab"
            aria-selected={activeKey === group.key}
            onClick={() => setActiveKey(group.key)}
            className={cn(
              "border-b-2 px-2 py-2.5 text-[12px] font-medium transition-colors",
              activeKey === group.key
                ? "border-[var(--ink)] text-[var(--ink)]"
                : "border-transparent text-[var(--ink-mute)] hover:text-[var(--ink)]"
            )}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {active.items.map((item) => (
          <Link
            key={`${item.time}-${item.title}`}
            href={item.href}
            className="group flex items-start gap-3 border-b border-[var(--divider)] px-5 py-4 last:border-b-0 hover:bg-[var(--secondary)]"
          >
            <span className="w-11 shrink-0 text-[12px] font-medium text-[var(--ink-mute)]">{item.time}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                {"alert" in item && item.alert ? <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--chart-orange)]" /> : null}
                <span className="truncate text-[13px] font-medium text-[var(--ink)]">{item.title}</span>
              </span>
              <span className="mt-1 block text-[11px] text-[var(--ink-mute)]">{item.role}</span>
            </span>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--ink-mute)] group-hover:text-[var(--ink)]" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function OperationSnapshot() {
  const rows = [
    { icon: Factory, label: "在手工艺", value: "4 单", tone: "var(--chart-lime)" },
    { icon: CircleDollarSign, label: "报价转化", value: "64%", tone: "var(--chart-yellow)" },
    { icon: Target, label: "逾期跟进", value: "2 个", tone: "var(--chart-orange)" },
  ];

  return (
    <section className="rounded-2xl bg-[var(--card)] p-5">
      <h2 className="text-[20px] font-semibold tracking-[-0.03em]">运营快照</h2>
      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: row.tone }}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-[13px] text-[var(--ink-dim)]">{row.label}</span>
              <strong className="text-[17px] font-semibold">{row.value}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AlertCard({
  severity,
  title,
  body,
  meta,
  href,
}: {
  severity: string;
  title: string;
  body: string;
  meta: string;
  href: string;
}) {
  const tone = severity === "danger"
    ? { bg: "#fff0e9", ink: "var(--destructive)", dot: "var(--destructive)" }
    : severity === "warn"
    ? { bg: "var(--warn-soft)", ink: "#9a6121", dot: "var(--chart-orange)" }
    : { bg: "var(--info-soft)", ink: "var(--info)", dot: "var(--info)" };

  return (
    <Link
      href={href}
      className="group rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: tone.bg }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone.dot }} />
        <ArrowUpRight className="h-4 w-4 text-[var(--ink-mute)] group-hover:text-[var(--ink)]" />
      </div>
      <h3 className="mt-5 text-[15px] font-semibold" style={{ color: tone.ink }}>{title}</h3>
      <p className="mt-1.5 text-[13px] leading-5 text-[var(--ink-dim)]">{body}</p>
      <p className="mt-4 text-[11px] font-medium text-[var(--ink-mute)]">{meta}</p>
    </Link>
  );
}

function TeamPulse() {
  const team = [
    { name: "李白", role: "老板", activity: "审批 1 件", color: "#11150f" },
    { name: "陈总", role: "厂长", activity: "复核毛利", color: "var(--chart-lime)" },
    { name: "刘韬", role: "业务员", activity: "跟进 3 次", color: "var(--chart-yellow)" },
    { name: "亚明", role: "业务员", activity: "报价 2 单", color: "var(--chart-orange)" },
  ];

  return (
    <section>
      <SectionHeading title="团队动态" subtitle="今天" icon={<Users className="h-4 w-4" />} />
      <div className="grid overflow-hidden rounded-2xl bg-[var(--card)] sm:grid-cols-2 xl:grid-cols-4">
        {team.map((person) => (
          <div key={person.name} className="flex items-center gap-3 border-b border-r border-[var(--divider)] p-4 last:border-r-0 xl:border-b-0">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold"
              style={{
                backgroundColor: person.color,
                color: person.color === "#11150f" ? "#ffffff" : "#11150f",
              }}
            >
              {person.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold">{person.name}</p>
              <p className="text-[11px] text-[var(--ink-mute)]">{person.role}</p>
            </div>
            <span className="text-[11px] text-[var(--ink-dim)]">{person.activity}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-3 mt-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-[var(--ink)]">{icon}</span>
        <h2 className="text-[18px] font-semibold tracking-[-0.025em]">{title}</h2>
      </div>
      <span className="text-[12px] text-[var(--ink-mute)]">{subtitle}</span>
    </div>
  );
}
