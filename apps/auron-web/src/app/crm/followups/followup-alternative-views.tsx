"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  ContactRound,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FOLLOWUP_COLUMNS,
  getDueState,
  getFollowUpTimeOrder,
  type DueState,
  type FollowUp,
} from "./followup-model";

type SortKey = "customer" | "status" | "owner" | "nextContactAt";
type SortDirection = "asc" | "desc";

const STATUS_ORDER = new Map(
  FOLLOWUP_COLUMNS.map((column, index) => [column.id, index])
);

const SCHEDULE_GROUPS = [
  {
    id: "overdue",
    title: "已逾期",
    description: "优先处理已经超过约定时间的跟进",
    icon: CircleAlert,
  },
  {
    id: "today",
    title: "今天",
    description: "今天仍需完成的客户联系",
    icon: Clock3,
  },
  {
    id: "upcoming",
    title: "后续计划",
    description: "明天及之后已安排的跟进",
    icon: CalendarClock,
  },
  {
    id: "unscheduled",
    title: "未安排",
    description: "需要补充下次联系时间",
    icon: CheckCircle2,
  },
] as const;

export function FollowUpTableView({
  cards,
  nowMinutes,
  onOpen,
}: {
  cards: FollowUp[];
  nowMinutes: number | null;
  onOpen: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("nextContactAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedCards = useMemo(() => {
    const nextCards = [...cards];
    nextCards.sort((left, right) => {
      let comparison = 0;
      if (sortKey === "nextContactAt") {
        comparison =
          getFollowUpTimeOrder(left.nextContactAt) -
          getFollowUpTimeOrder(right.nextContactAt);
      } else if (sortKey === "status") {
        comparison =
          (STATUS_ORDER.get(left.status) ?? 0) -
          (STATUS_ORDER.get(right.status) ?? 0);
      } else {
        comparison = left[sortKey].localeCompare(right[sortKey], "zh-CN");
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return nextCards;
  }, [cards, sortDirection, sortKey]);

  const changeSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  };

  if (cards.length === 0) {
    return <AlternativeEmptyState />;
  }

  return (
    <section
      aria-label="跟进表格"
      className="overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)]"
    >
      <div className="overflow-x-auto [scrollbar-color:var(--hairline-strong)_transparent] [scrollbar-width:thin]">
        <table className="w-full min-w-[1060px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--hairline)] bg-[var(--secondary)]/45">
              <SortableHeader
                label="客户"
                sortKey="customer"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={changeSort}
                className="w-[160px]"
              />
              <th className="px-4 py-3 text-[12px] font-medium text-[var(--ink-mute)]">
                下一步动作
              </th>
              <SortableHeader
                label="当前阶段"
                sortKey="status"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={changeSort}
                className="w-[132px]"
              />
              <th className="w-[150px] px-4 py-3 text-[12px] font-medium text-[var(--ink-mute)]">
                联系人
              </th>
              <SortableHeader
                label="负责人"
                sortKey="owner"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={changeSort}
                className="w-[110px]"
              />
              <th className="w-[128px] px-4 py-3 text-[12px] font-medium text-[var(--ink-mute)]">
                最近跟进
              </th>
              <SortableHeader
                label="下次跟进"
                sortKey="nextContactAt"
                activeKey={sortKey}
                direction={sortDirection}
                onSort={changeSort}
                className="w-[180px]"
              />
              <th className="w-12 px-3 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCards.map((card) => {
              const dueState = getDueState(card.nextContactAt, nowMinutes);
              return (
                <tr
                  key={card.id}
                  className="group border-b border-[var(--hairline)] transition-colors last:border-b-0 hover:bg-[var(--secondary)]/35"
                >
                  <td className="px-4 py-3.5 align-top">
                    <button
                      type="button"
                      onClick={() => onOpen(card.id)}
                      className="max-w-[145px] truncate text-[14px] font-semibold text-[var(--ink)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      {card.customer}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <button
                      type="button"
                      onClick={() => onOpen(card.id)}
                      className="line-clamp-2 max-w-[360px] text-left text-[14px] font-medium leading-5 text-[var(--ink)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      {card.record}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <StatusLabel status={card.status} />
                  </td>
                  <td className="px-4 py-3.5 align-top text-[13px] text-[var(--ink-dim)]">
                    <span className="flex items-center gap-1.5">
                      <ContactRound aria-hidden="true" className="h-3.5 w-3.5 text-[var(--ink-mute)]" />
                      {card.contactName || "未填写"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-top text-[13px] text-[var(--ink-dim)]">
                    <span className="flex items-center gap-1.5">
                      <UserRound aria-hidden="true" className="h-3.5 w-3.5 text-[var(--ink-mute)]" />
                      {card.owner}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-top font-mono text-[13px] tabular-nums text-[var(--ink-mute)]">
                    {card.lastContactAt || "—"}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <CompactDueStatus value={card.nextContactAt} state={dueState} />
                  </td>
                  <td className="px-3 py-3.5 align-top">
                    <button
                      type="button"
                      onClick={() => onOpen(card.id)}
                      aria-label={`查看${card.customer}跟进详情`}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-mute)] opacity-0 transition-[opacity,background-color,color] hover:bg-[var(--accent)] hover:text-[var(--ink)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] group-hover:opacity-100"
                    >
                      <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = activeKey === sortKey;
  const Icon = !isActive ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-4 py-3", className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`${label}${isActive ? `，当前${direction === "asc" ? "升序" : "降序"}` : "，点击排序"}`}
        className={cn(
          "inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          isActive ? "text-[var(--ink)]" : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
        )}
      >
        {label}
        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}

export function FollowUpScheduleView({
  cards,
  nowMinutes,
  onOpen,
}: {
  cards: FollowUp[];
  nowMinutes: number | null;
  onOpen: (id: string) => void;
}) {
  const groupedCards = useMemo(() => {
    const groups: Record<(typeof SCHEDULE_GROUPS)[number]["id"], FollowUp[]> = {
      overdue: [],
      today: [],
      upcoming: [],
      unscheduled: [],
    };
    for (const card of cards) {
      const state = getDueState(card.nextContactAt, nowMinutes);
      if (state === "overdue") groups.overdue.push(card);
      else if (state === "soon" || state === "today") groups.today.push(card);
      else if (state === "upcoming") groups.upcoming.push(card);
      else groups.unscheduled.push(card);
    }
    for (const group of Object.values(groups)) {
      group.sort(
        (left, right) =>
          getFollowUpTimeOrder(left.nextContactAt) -
          getFollowUpTimeOrder(right.nextContactAt)
      );
    }
    return groups;
  }, [cards, nowMinutes]);

  if (cards.length === 0) {
    return <AlternativeEmptyState />;
  }

  return (
    <section aria-label="跟进日程" className="space-y-4">
      {SCHEDULE_GROUPS.map((group) => {
        const groupCards = groupedCards[group.id];
        if (groupCards.length === 0) return null;
        const GroupIcon = group.icon;
        return (
          <section
            key={group.id}
            aria-labelledby={`schedule-${group.id}`}
            className="overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)]"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] bg-[var(--secondary)]/35 px-4 py-3 sm:px-5">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 items-center justify-center rounded-md",
                    group.id === "overdue"
                      ? "bg-[var(--destructive)]/8 text-[var(--destructive)]"
                      : "bg-[var(--secondary)] text-[var(--ink-dim)]"
                  )}
                >
                  <GroupIcon aria-hidden="true" className="h-4 w-4" />
                </div>
                <div>
                  <h2 id={`schedule-${group.id}`} className="text-[15px] font-semibold text-[var(--ink)]">
                    {group.title}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-[var(--ink-mute)]">
                    {group.description}
                  </p>
                </div>
              </div>
              <span className="rounded bg-[var(--secondary)] px-2 py-1 font-mono text-[12px] font-medium tabular-nums text-[var(--ink-mute)]">
                {groupCards.length}
              </span>
            </header>

            <div className="divide-y divide-[var(--hairline)]">
              {groupCards.map((card) => (
                <ScheduleRow
                  key={card.id}
                  card={card}
                  state={getDueState(card.nextContactAt, nowMinutes)}
                  onOpen={() => onOpen(card.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

function ScheduleRow({
  card,
  state,
  onOpen,
}: {
  card: FollowUp;
  state: DueState;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--secondary)]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:items-center sm:px-5"
    >
      <div>
        <p
          className={cn(
            "font-mono text-[14px] font-semibold tabular-nums",
            state === "overdue" ? "text-[var(--destructive)]" : "text-[var(--ink)]"
          )}
        >
          {card.nextContactAt || "待安排"}
        </p>
        <p className="mt-1 text-[11px] text-[var(--ink-mute)]">
          {state === "overdue" ? "超过约定" : state === "soon" ? "即将开始" : "计划时间"}
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-[var(--ink-mute)]">{card.customer}</span>
          <StatusLabel status={card.status} />
        </div>
        <p className="mt-1.5 truncate text-[15px] font-semibold text-[var(--ink)]">
          {card.record}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--ink-mute)]">
          <span>联系人 · {card.contactName || "未填写"}</span>
          <span>负责人 · {card.owner}</span>
        </p>
      </div>

      <ChevronRight
        aria-hidden="true"
        className="hidden h-4 w-4 text-[var(--ink-mute)] transition-transform group-hover:translate-x-0.5 sm:block"
      />
    </button>
  );
}

function StatusLabel({ status }: { status: FollowUp["status"] }) {
  return (
    <span className="inline-flex rounded bg-[var(--secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink-dim)]">
      {status}
    </span>
  );
}

function CompactDueStatus({ value, state }: { value: string; state: DueState }) {
  return (
    <div>
      <p
        className={cn(
          "font-mono text-[13px] font-medium tabular-nums",
          state === "overdue" && "text-[var(--destructive)]",
          state === "soon" && "text-[var(--warn)]",
          (state === "today" || state === "upcoming") && "text-[var(--ink-dim)]",
          state === "unscheduled" && "text-[var(--ink-mute)]"
        )}
      >
        {value || "尚未安排"}
      </p>
      <p className="mt-1 text-[11px] text-[var(--ink-mute)]">
        {state === "overdue" ? "已逾期" :
          state === "soon" ? "即将到期" :
          state === "today" ? "今天" :
          state === "upcoming" ? "计划跟进" :
          "待补充"}
      </p>
    </div>
  );
}

function AlternativeEmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--hairline-strong)] bg-[var(--card)] px-6 text-center">
      <CalendarClock aria-hidden="true" className="h-8 w-8 text-[var(--ink-mute)]" />
      <p className="mt-4 text-[15px] font-semibold text-[var(--ink)]">没有符合条件的跟进</p>
      <p className="mt-1 text-[13px] text-[var(--ink-mute)]">调整搜索、负责人或时间筛选后再试</p>
    </div>
  );
}
