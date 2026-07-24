"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useCurrentUser,
  useActivities,
  markRead,
  markAllRead,
  type Activity,
  type ActivityKind,
} from "@/lib/demo-state";

/**
 * /inbox · 通知中心（跨表变更聚合）
 *
 * 数据源：聚合 5-7 张 crm_* 表的"近期变更"
 *   - crm_客户跟进记录表 → kind=followup
 *   - crm_报价单_总计表   → kind=quotation
 *   - crm_打样通知_基础信息表 → kind=sample
 *   - crm_打样工艺单_基础信息表 → kind=workorder
 *   - /settings/audit    → kind=audit
 *   - crm_人员信息表     → kind=team
 *
 * 三段分组：
 *   1. @我 / 待我处理（mentions 含我）— 高亮
 *   2. 我客户/工单的动态（customerName 在我负责的客户范围内）
 *   3. 全局活动（其他人做了事）
 *
 * 点击活动 = markRead + 跳目标详情页
 */

export default function InboxPage() {
  const me = useCurrentUser();
  const { activities, unread } = useActivities();

  const { mentioned, mine } = (() => {
    const mentioned: Activity[] = [];
    const mine: Activity[] = [];
    for (const a of activities) {
      if (!a.mentions || a.mentions.length === 0) {
        mine.push(a);
        continue;
      }
      const tagMe = a.mentions.includes(me.role) || a.mentions.includes("OWNER") || a.mentions.includes("DIRECTOR");
      if (tagMe) mentioned.push(a);
      else mine.push(a);
    }
    return { mentioned, mine };
  })();

  return (
    <AdminShell
      pageTitle="通知中心"
      pageKicker="我的工作"
      pageDescription="集中查看待处理消息、业务提醒和系统通知，减少在不同模块之间来回查找。"
      pageActions={(
        <Button variant="outline" size="md" onClick={markAllRead} disabled={unread === 0}>
          {unread === 0 ? "已全部处理" : `全部标为已读 · ${unread}`}
        </Button>
      )}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
                {/* 1 · @我 */}
        <Section title={`@我 · 待我处理`} count={`${mentioned.length} 条`} tone="primary">
          {mentioned.length === 0 ? (
            <Empty msg="目前没有需要你处理的事" />
          ) : (
            <ActivityList items={mentioned} highlight />
          )}
        </Section>

        {/* 2 · 我的客户/工单 */}
        <Section title="我的客户 / 工单动态" count={`${mine.length} 条`}>
          <ActivityList items={mine} />
        </Section>

        {/* 3 · 全局动态 */}
        <Section title="全局动态" count={`${Math.max(activities.length - mentioned.length - mine.length, 0)} 条`}>
          <ActivityList items={activities.filter((a) => !mentioned.includes(a) && !mine.includes(a)).slice(0, 12)} />
        </Section>

      </div>
    </AdminShell>
  );
}

/* ─── 内部 ─── */

function Section({
  title, count, tone, children,
}: {
  title: string; count: string; tone?: "primary" | "neutral"; children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="font-display text-[18px] font-medium text-[var(--ink)]">{title}</p>
          {tone === "primary" && (
            <span className="font-mono text-[14px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded bg-[var(--primary)] text-[var(--primary-foreground)]">
              优先
            </span>
          )}
        </div>
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">{count}</span>
      </div>
      {children}
    </section>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="border border-dashed border-[var(--hairline-strong)] rounded-md py-8 px-6 text-center">
      <p className="text-[14px] text-[var(--ink-mute)] font-mono">{msg}</p>
    </div>
  );
}

function ActivityList({ items, highlight = false }: { items: Activity[]; highlight?: boolean }) {
  if (items.length === 0) return <Empty msg="没有数据" />;
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--hairline)] bg-[var(--card)]">
      {items.map((a) => (
        <Link
          key={a.id}
          href={a.href}
          onClick={() => { if (!a.read) markRead(a.id); }}
          className={cn(
            "grid min-w-[900px] grid-cols-[60px_40px_minmax(0,1fr)_100px_120px_60px_20px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors",
            !a.read && "bg-[var(--accent)]/20"
          )}
        >
          <Badge tone={KIND_TONE[a.kind]} size="sm">{KIND_LABEL[a.kind]}</Badge>
          <span className="w-7 h-7 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center text-[14px] font-mono">
            {a.whoInitials}
          </span>
          <div className="min-w-0">
            <p className={cn("text-[14px] truncate", !a.read ? "text-[var(--ink)] font-medium" : "text-[var(--ink-dim)]")}>
              {a.whoName} ·
              {a.kind === "audit" && <span className="text-[var(--warn)] font-medium"> [敏感修改] </span>}
              {a.summary}
            </p>
            {a.customerName && (
              <p className="text-[14px] font-mono text-[var(--ink-mute)] mt-0.5">
                客户 · {a.customerName}
                {highlight && a.mentions && (
                  <span className="ml-2 text-[var(--primary)]">→ {a.mentions.join(" / ")}</span>
                )}
              </p>
            )}
          </div>
          <span className="font-mono text-[14px] text-[var(--ink-dim)]">{a.whoName}</span>
          <span className="font-mono text-[14px] text-[var(--ink-mute)]">{a.at}</span>
          <span className={cn("font-mono text-[14px] uppercase tracking-[0.18em] text-center", a.read ? "text-[var(--ink-mute)]" : "text-[var(--primary)]")}>
            {a.read ? "已读" : "新"}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--ink-mute)]" />
        </Link>
      ))}
    </div>
  );
}

const KIND_LABEL: Record<ActivityKind, string> = {
  followup:  "跟进",
  quotation: "报价",
  sample:    "打样",
  workorder: "工艺",
  audit:     "审计",
  team:      "团队",
};

const KIND_TONE: Record<ActivityKind, "info" | "primary" | "warn" | "success" | "neutral" | "danger"> = {
  followup:  "info",
  quotation: "primary",
  sample:    "warn",
  workorder: "success",
  audit:     "neutral",
  team:      "neutral",
};
