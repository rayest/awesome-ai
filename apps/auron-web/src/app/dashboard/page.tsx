"use client";

import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { KpiCard } from "@/components/domain/kpi-card";
import { MiniSparkline } from "@/components/domain/sparkline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRoleLabel, type Role } from "@/lib/demo-state";
import {
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  ArrowUpRight,
} from "lucide-react";

/**
 * Dashboard · 厂长视角
 *
 * 三大块（自上而下）：
 *  1. 唛头速览：今日关键流水
 *  2. KPI 8 卡：年度营收/毛利/平均客单/报价转化/在手工艺/待审/低库存/逾期
 *  3. 双栏：
 *     - 今日待办（按角色）
 *     - 需关注的异常（margin / 库存 / 跟进 / 打样 4 类）
 *
 * 设计原则：
 *  - 全 mono 数字
 *  - KPI 卡可点击直达（href 跳转）
 *  - sparkline 自动着色（同 direction）
 *  - 异常按 alert 框标红
 *  - 没有饼图、没有大屏、没有装饰渐变
 */

export default function DashboardPage() {
  return (
    <AdminShell
      pageTitle="经营总览"
      pageKicker="今日总览"
      pageDescription="老板视角查看今日经营、待办和异常，优先处理会影响交期、报价和毛利的事项。"
      pageActions={(
        <>
          <Button variant="outline" size="md">
            <Calendar className="w-4 h-4" />
            切换日期
          </Button>
          <Button variant="default" size="md">
            <Receipt className="w-4 h-4" />
            今日报价单
          </Button>
        </>
      )}
      pageMeta={[
        { label: "在途订单", value: "18.6w" },
        { label: "待处理", value: 5 },
        { label: "异常", value: 3 },
      ]}
    >
      <div className="px-8 py-8 mx-auto max-w-[1480px]">
        {/* 一、核心 KPI (8 卡) ——
             派生：年度营收/毛利/转化率 在手工艺/逾期跟进 → 都从对应 crm_* 表聚合
             在档纱线 → crm_字典_物料信息表 行数
        */}
        <section className="mb-10">
          <p className="font-display text-[18px] font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
            关键指标
            <span className="font-mono text-[14px] text-[var(--ink-mute)]">聚合多表</span>
          </p>
          <div className="grid grid-cols-4 gap-3">
            <KpiCard
              label="年度营收"
              value="¥ 6.5M"
              delta={{ value: 12.4, period: "同比", positive: true }}
              spark={[3.2, 3.5, 3.3, 3.8, 4.2, 5.1, 6.5]}
              sparkTone="primary"
              href="/orders/quotations"
            />
            <KpiCard
              label="年度毛利"
              value="¥ 1.7M"
              delta={{ value: 2.1, period: "环比", positive: true }}
              spark={[2.0, 2.1, 2.0, 2.2, 1.6, 1.7, 1.7]}
              sparkTone="success"
              href="/orders/quotations"
            />
            <KpiCard
              label="平均含税毛利"
              value="32.4"
              unit="%"
              delta={{ value: -1.2, period: "环比", positive: false }}
              spark={[34, 33, 34, 31, 30, 31, 32]}
              sparkTone="warn"
              alert
              href="/orders/quotations"
            />
            <KpiCard
              label="报价转化率"
              value="64"
              unit="%"
              delta={{ value: 8.2, period: "同比", positive: true }}
              spark={[55, 58, 57, 60, 62, 63, 64]}
              sparkTone="success"
              href="/crm/followups"
            />
            <KpiCard
              label="在手工艺"
              value="4"
              unit="单"
              delta={{ value: 0, period: "环比" }}
              spark={[6, 5, 5, 4, 5, 4, 4]}
              sparkTone="neutral"
              href="/orders/sample-workorders"
            />
            <KpiCard
              label="未结打样"
              value="2"
              unit="单"
              delta={{ value: 1, period: "今日新增", positive: false }}
              alert
              href="/orders/sample-notices"
            />
            <KpiCard
              label="在档纱线"
              value="12"
              unit="款"
              delta={{ value: 0, period: "字典行数" }}
              spark={[12, 12, 12, 12, 12, 12, 12]}
              sparkTone="neutral"
              href="/dictionary/materials"
            />
            <KpiCard
              label="逾期跟进"
              value="2"
              unit="个"
              delta={{ value: 1, period: "本周新增", positive: false }}
              spark={[0, 0, 1, 1, 1, 2, 2]}
              sparkTone="danger"
              alert
              href="/crm/followups"
            />
          </div>
        </section>

        {/* 二、今日动态 (双栏) */}
        <section className="grid grid-cols-2 gap-6 mb-10">
          {/* 左：今日待办 */}
          <div>
            <p className="font-display text-[18px] font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--info)]" />
              今日待办
              <span className="font-mono text-[14px] text-[var(--ink-mute)]">按角色</span>
            </p>
            <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
              <TodoGroup role="OWNER" color="var(--ink)" items={[
                { time: "今 17:00", title: "审批乾盛 200 件报价（¥ 41,640）", href: "/orders/quotations/Q-0317-A?customer=CUST-QS-001", alert: true },
                { time: "今 18:00", title: "复核老周染厂价 7/22 涨价对本月的影响", href: "/settings/audit" },
              ]} />
              <TodoGroup role="QUOTER" color="var(--primary)" items={[
                { time: "今 14:00", title: "完成 Q-0318 染色工艺重算", href: "/orders/quotations?customer=CUST-HD-002" },
                { time: "今 16:30", title: "回复巧岛采购（重算报价）", href: "/orders/quotations/Q-0314-C?customer=CUST-QD-044" },
              ]} />
              <TodoGroup role="SALES" color="var(--info)" items={[
                { time: "今 11:30", title: "弘大马经理 — 辅料清单确认", href: "/crm/followups?customer=CUST-HD-002" },
                { time: "今 14:00", title: "鸣笛丁工 — 到访工厂", href: "/crm/followups?customer=CUST-MD-019" },
                { time: "今 16:00", title: "乾盛陈总 — 200 件大货确认", href: "/crm/followups?customer=CUST-QS-001" },
                { time: "今 17:00", title: "巧岛张设计 — 色牢度被打回，重新算", href: "/crm/followups?customer=CUST-QD-044" },
              ]} />
              <TodoGroup role="KNIT_MASTER" color="var(--success)" items={[
                { time: "今 14:00", title: "老周 — 织造中巡检（5 个批次）", href: "/orders/sample-workorders?master=%E8%80%81%E5%91%A8" },
                { time: "今 16:30", title: "阿亮 — 高领打底试产首件", href: "/dictionary/machines?type=%E9%AB%98%E9%80%9F%E6%9C%BA" },
              ]} />
              <TodoGroup role="ORDER" color="var(--warn)" items={[
                { time: "今 12:00", title: "王姐 — 卫衣辅料清单送到乾盛", href: "/orders/sample-notices?customer=CUST-QS-001" },
              ]} />
            </div>
          </div>

          {/* 右：需关注的异常 */}
          <div>
            <p className="font-display text-[18px] font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--destructive)]" />
              需关注的异常
              <span className="font-mono text-[14px] text-[var(--destructive)] bg-[oklch(0.95_0.04_22)] px-1.5 py-0.5 rounded">3 个</span>
            </p>
            <div className="space-y-3">
              <AlertCard
                severity="danger"
                title="染色毛利 < 15% — 4 单受影响"
                body="7/22 起天丝 LF 染料涨价 12%。涉及：Q-0315-A、T-0317-临时、Q-0314-D、T-0318-A。建议重新核算。"
                href="/orders/quotations"
                cta="立即重算"
              />
              <AlertCard
                severity="info"
                title="物料字典状态 — crm 实际未支撑库存"
                body="crm_字典_物料信息表不存储库存/安全库存字段。前端不再模拟低库存预警。请确认是否要新增库存字段、补 crm 表或换形式。"
                href="/dictionary/materials"
                cta="去字典"
              />
              <AlertCard
                severity="warn"
                title="跟进超期 7 天未触达 — 2 个客户"
                body="巧岛（62 天前最后联系）、霞飞（62 天前最后联系）。3 个月无业务往来。"
                href="/crm/followups"
                cta="激活"
              />
            </div>
          </div>
        </section>

        {/* 三、流水与趋势 */}
        <section className="mb-10">
          <p className="font-display text-[18px] font-medium mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[var(--ink-dim)]" />
            流水 · 趋势
          </p>
          <div className="grid grid-cols-3 gap-3">
            <TrendBlock
              title="7 天营收走势"
              sub="今日 ¥ 8.2w"
              values={[4.2, 5.8, 6.1, 7.4, 6.9, 7.8, 8.2]}
              tone="primary"
              unit="万 ¥"
              peak="周五峰值 ¥7.8w"
            />
            <TrendBlock
              title="7 天毛利走势"
              sub="今日 32.4%"
              values={[31, 33, 30, 32, 28, 30, 32]}
              tone="success"
              unit="%"
              peak="周二峰值 33%"
            />
            <TrendBlock
              title="30 天报价转化"
              sub="转化率 64%"
              values={[50, 55, 55, 60, 58, 60, 64]}
              tone="warn"
              unit="%"
              peak="本周峰值 64%"
            />
          </div>
        </section>

        {/* 四、人员 */}
        <section>
          <p className="font-display text-[18px] font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--ink-dim)]" />
            团队
          </p>
          <div className="grid grid-cols-4 gap-3">
            <PersonStat role="OWNER" name="李白" today="审批 1 件 / 浏览报价 12 条" />
            <PersonStat role="DIRECTOR" name="陈总" today="查阅毛利 1 次 / 审计 0 条" />
            <PersonStat role="SALES" name="刘韬 · 亚明" today="客户跟进 5 次" />
            <PersonStat role="KNIT_MASTER" name="老周 · 阿亮" today="工艺巡检 5 批次" />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

/* ─── Helpers ─── */

function TodoGroup({
  role,
  color,
  items,
}: {
  role: Role;
  color: string;
  items: { time: string; title: string; href: string; alert?: boolean }[];
}) {
  return (
    <div className="border-b border-[var(--hairline)] last:border-b-0">
      <div className="px-3 py-2 bg-[var(--secondary)]/30 flex items-center gap-2">
        <span
          className="font-mono text-[14px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded"
          style={{ background: color + "20", color }}
        >
          {getRoleLabel(role)}
        </span>
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">
          {items.length} 项
        </span>
      </div>
      {items.map((it, i) => (
        <Link
          key={i}
          href={it.href}
          className="block px-3 py-2.5 hover:bg-[var(--accent)]/30 border-b border-[var(--hairline)] last:border-b-0 transition-colors group"
        >
          <div className="flex items-start gap-3">
            <span className="font-mono text-[14px] text-[var(--ink-mute)] shrink-0 pt-0.5 w-[58px]">
              {it.time}
            </span>
            <span className="flex-1 text-[14px] text-[var(--ink)] leading-snug">
              {it.alert && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--destructive)] mr-1.5 align-middle" />
              )}
              {it.title}
            </span>
            <ArrowUpRight className="w-3 h-3 text-[var(--ink-mute)] group-hover:text-[var(--primary)] shrink-0 mt-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function AlertCard({
  severity,
  title,
  body,
  href,
  cta,
}: {
  severity: "info" | "warn" | "danger";
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-md border p-4 transition-colors group",
        severity === "danger"
          ? "border-[var(--destructive)]/40 hover:border-[var(--destructive)] bg-[oklch(0.97_0.02_25)]"
          : severity === "warn"
          ? "border-[var(--warn)]/40 hover:border-[var(--warn)] bg-[var(--warn-soft)]/30"
          : "border-[var(--info)]/40 hover:border-[var(--info)] bg-[oklch(0.97_0.02_240)]"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
            severity === "danger"
              ? "border-[var(--destructive)]/25 bg-[oklch(0.95_0.04_22)] text-[var(--destructive)]"
              : severity === "warn"
              ? "border-[var(--warn)]/30 bg-[var(--warn-soft)] text-[var(--warn)]"
              : "border-[var(--info)]/30 bg-[var(--info-soft)] text-[var(--info)]"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-[14px] mb-1",
            severity === "danger" ? "text-[var(--destructive)]" : "text-[var(--warn)]"
          )}>
            {title}
          </p>
          <p className="text-[14px] text-[var(--ink-dim)] leading-relaxed mb-2">{body}</p>
          <div className="flex items-center gap-1 text-[14px] font-mono text-[var(--ink-mute)] group-hover:text-[var(--ink)]">
            <span>{cta}</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TrendBlock({
  title,
  sub,
  values,
  tone,
  unit,
  peak,
}: {
  title: string;
  sub: string;
  values: number[];
  tone: "primary" | "success" | "warn";
  unit: string;
  peak: string;
}) {
  return (
    <div className="border border-[var(--hairline)] rounded-md p-4 bg-[var(--card)]">
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          {title}
        </p>
        <p className="text-[14px] font-mono text-[var(--ink-mute)]">
          顶 {peak}
        </p>
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="font-display text-[32px] font-medium tnum text-[var(--ink)]">
          {sub.split(" ")[0]}
        </span>
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">
          {sub.split(" ")[1] ?? unit}
        </span>
      </div>
      <div className="h-12">
        <MiniSparkline values={values} tone={tone} height={48} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">{values.length} 天前</span>
        <span className="font-mono text-[14px] text-[var(--ink)] font-medium">今天</span>
      </div>
    </div>
  );
}

function PersonStat({
  role,
  name,
  today,
}: {
  role: Role;
  name: string;
  today: string;
}) {
  return (
    <div className="border border-[var(--hairline)] rounded-md p-3 bg-[var(--card)]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          {getRoleLabel(role)}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
      </div>
      <p className="text-[14px] font-medium text-[var(--ink)]">{name}</p>
      <p className="font-mono text-[14px] text-[var(--ink-mute)] mt-1.5 leading-relaxed">
        {today}
      </p>
    </div>
  );
}
