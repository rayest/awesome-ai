"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Badge } from "@/components/ui/badge";
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
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        <div className="mb-6">
          <FabricLabel
            docNo="INBOX-2026-07-22"
            shortCode="qs-app"
            season={me.role}
            composition={`${activities.length} 条活动 · ${unread} 条未读 · 当前角色 ${me.role} · ${me.name}`}
            specs={[
              { label: "总活动", value: activities.length, mono: true },
              { label: "未读", value: unread, mono: true },
              { label: "@我", value: mentioned.length, mono: true },
              { label: "我的", value: mine.length, mono: true },
            ]}
            prices={[
              { label: "跨表源", value: "5 张 crm_*", mono: true },
              { label: "聚合范围", value: "按角色过滤", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">/inbox</p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">通知中心</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              跨 5 张 crm_* 表的活动聚合，三段分组：<span className="text-[var(--warn)] font-medium">@我</span> · 我的客户/工单动态 · 全局动态
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllRead()}
              className="h-9 px-4 rounded-md text-[14px] border border-[var(--hairline-strong)] hover:bg-[var(--accent)] transition-colors text-[var(--ink-dim)]"
            >
              全部标为已读
            </button>
            <Link
              href="/me"
              className="h-9 px-4 rounded-md text-[14px] inline-flex items-center bg-[var(--ink)] text-[var(--background)] hover:bg-[var(--accent-foreground)] transition-colors"
            >
              跳到 /me
            </Link>
          </div>
        </div>

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

        <p className="mt-6 text-[14px] font-mono text-[var(--ink-mute)] text-center">
          数据源 · 聚合自 crm_客户跟进 / crm_报价单_总计 / crm_打样通知_基础 / crm_打样工艺单_基础 / crm_人员信息
        </p>
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
              HIGH
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
    <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
      {items.map((a) => (
        <Link
          key={a.id}
          href={a.href}
          onClick={() => { if (!a.read) markRead(a.id); }}
          className={cn(
            "grid grid-cols-[60px_40px_1fr_100px_120px_60px] gap-3 px-4 py-3 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/40 transition-colors",
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
              {a.kind === "audit" && <span className="text-[var(--warn)] font-medium"> [字段级] </span>}
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
