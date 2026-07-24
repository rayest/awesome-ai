"use client";

import { use, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeftRight,
  Calendar,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Columns3,
  Clock3,
  GripVertical,
  MessageCircle,
  Phone,
  Search,
  Table2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getFollowups } from "@/lib/data";
import {
  FollowUpScheduleView,
  FollowUpTableView,
} from "./followup-alternative-views";
import {
  FOLLOWUP_COLUMNS,
  getDueState,
  isTodayDue,
  type DueState,
  type FollowUp,
  type FollowUpStatus,
  type FollowUpView,
} from "./followup-model";

type DueFilter = "all" | "today" | "overdue";

const MODE_ICON = { phone: Phone, im: MessageCircle, visit: Calendar } as const;
const MODE_LABEL = { phone: "电话", im: "即时沟通", visit: "到访" } as const;

function filterByCustomer(cards: FollowUp[], customer?: string) {
  if (!customer) return cards;
  return cards.filter(
    (card) => card.customerId === customer || card.customer === customer
  );
}

function getToneColor(tone: (typeof FOLLOWUP_COLUMNS)[number]["tone"]) {
  if (tone === "info") return "var(--info)";
  if (tone === "primary") return "var(--primary)";
  if (tone === "success") return "var(--success)";
  return "var(--ink-mute)";
}

export default function FollowUpKanbanPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string; contact?: string }>;
}) {
  const sp = use(searchParams);
  const [cards, setCards] = useState<FollowUp[]>(() =>
    filterByCustomer(getFollowups() as FollowUp[], sp.customer)
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [view, setView] = useState<FollowUpView>("board");
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setCards(filterByCustomer(getFollowups() as FollowUp[], sp.customer));
  }, [sp.customer]);

  useEffect(() => {
    const updateNow = () => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedView = window.localStorage.getItem("crm-followups-view");
    if (savedView === "board" || savedView === "table" || savedView === "schedule") {
      setView(savedView);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const owners = useMemo(
    () => Array.from(new Set(cards.map((card) => card.owner))).sort(),
    [cards]
  );

  const visibleCards = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
    return cards.filter((card) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          card.customer,
          card.record,
          card.contactName,
          card.contactPhone,
          card.owner,
        ].some((value) =>
          value?.toLocaleLowerCase("zh-CN").includes(normalizedQuery)
        );
      const matchesOwner = owner === "all" || card.owner === owner;
      const dueState = getDueState(card.nextContactAt, nowMinutes);
      const matchesDue =
        dueFilter === "all" ||
        (dueFilter === "today" && isTodayDue(dueState)) ||
        (dueFilter === "overdue" && dueState === "overdue");
      return matchesQuery && matchesOwner && matchesDue;
    });
  }, [cards, dueFilter, nowMinutes, owner, query]);

  const byColumn = useMemo(() => {
    const grouped = Object.fromEntries(
      FOLLOWUP_COLUMNS.map((column) => [column.id, [] as FollowUp[]])
    ) as Record<FollowUpStatus, FollowUp[]>;
    for (const card of visibleCards) {
      const column = card.status && grouped[card.status]
        ? grouped[card.status]
        : grouped["初步接触"];
      column.push(card);
    }
    return grouped;
  }, [visibleCards]);

  const dueSummary = useMemo(() => {
    let today = 0;
    let overdue = 0;
    for (const card of visibleCards) {
      const state = getDueState(card.nextContactAt, nowMinutes);
      if (isTodayDue(state)) today += 1;
      if (state === "overdue") overdue += 1;
    }
    return { today, overdue };
  }, [nowMinutes, visibleCards]);

  const selectedCard = selectedId
    ? cards.find((card) => card.id === selectedId) ?? null
    : null;
  const activeCard = activeId
    ? cards.find((card) => card.id === activeId) ?? null
    : null;
  const hasFilters = Boolean(query) || owner !== "all" || dueFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setOwner("all");
    setDueFilter("all");
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) {
      setAnnouncement("移动已取消");
      return;
    }

    const activeCard = cards.find((card) => card.id === active.id);
    if (!activeCard) return;

    const overId = String(over.id);
    let nextStatus: FollowUpStatus | null = null;
    if (overId.startsWith("col:")) {
      nextStatus = overId.slice(4) as FollowUpStatus;
    } else {
      nextStatus = cards.find((card) => card.id === overId)?.status ?? null;
    }
    if (!nextStatus || nextStatus === activeCard.status) return;

    const previousStatus = activeCard.status;
    setCards((current) =>
      current.map((card) =>
        card.id === activeCard.id ? { ...card, status: nextStatus } : card
      )
    );
    setAnnouncement(`${activeCard.customer}已移至${nextStatus}`);
    console.info(
      `[客户跟进] ${activeCard.customer} · ${activeCard.id}：${previousStatus} → ${nextStatus}`
    );
    toast.success("跟进阶段已更新", {
      description: `${activeCard.customer}已移至「${nextStatus}」`,
      action: {
        label: "撤销",
        onClick: () => {
          setCards((current) =>
            current.map((card) =>
              card.id === activeCard.id
                ? { ...card, status: previousStatus }
                : card
            )
          );
          setAnnouncement(`${activeCard.customer}已恢复到${previousStatus}`);
          console.info(
            `[客户跟进] 已撤销阶段调整：${activeCard.customer} · ${activeCard.id} → ${previousStatus}`
          );
        },
      },
    });
  };

  const changeView = (nextView: FollowUpView) => {
    setView(nextView);
    window.localStorage.setItem("crm-followups-view", nextView);
  };

  return (
    <AdminShell
      pageTitle="跟进看板"
      pageKicker="客户管理"
      pageDescription="集中查看销售动作、负责人和下次联系时间，及时推进重要客户。"
      pageActions={(
        <Button asChild variant="default" size="md">
          <Link href="/crm/followups/new">新增跟进</Link>
        </Button>
      )}
    >
      <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
        <section
          aria-label="跟进筛选"
          className="mb-4 rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-3"
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1 xl:max-w-[420px]">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-mute)]"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索客户、跟进事项或联系人"
                aria-label="搜索跟进"
                className="pl-9"
              />
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="relative">
                <UserRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-mute)]"
                />
                <SelectControl
                  value={owner}
                  onValueChange={setOwner}
                  aria-label="按负责人筛选"
                  className="min-w-[148px] pl-9"
                  options={[
                    { value: "all", label: "全部负责人" },
                    ...owners.map((value) => ({ value, label: value })),
                  ]}
                />
              </div>

              <div
                className="inline-flex h-9 items-center rounded-md border border-[var(--hairline-strong)] bg-[var(--secondary)]/40 p-0.5"
                aria-label="按跟进时间筛选"
              >
                {([
                  ["all", "全部"],
                  ["today", "今天"],
                  ["overdue", "已逾期"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDueFilter(value)}
                    aria-pressed={dueFilter === value}
                    className={cn(
                      "h-8 rounded px-3 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                      dueFilter === value
                        ? "bg-[var(--card)] text-[var(--ink)] shadow-sm"
                        : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {hasFilters ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  清除筛选
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-3 text-[14px] text-[var(--ink-mute)] xl:ml-auto">
              <span>共 <strong className="font-mono font-medium text-[var(--ink)]">{visibleCards.length}</strong> 条</span>
              <span className="h-3 w-px bg-[var(--hairline-strong)]" />
              <span>今天 <strong className="font-mono font-medium text-[var(--ink)]">{dueSummary.today}</strong></span>
              <span className={cn(dueSummary.overdue > 0 && "text-[var(--destructive)]")}>
                逾期 <strong className="font-mono font-medium">{dueSummary.overdue}</strong>
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-[var(--hairline)] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="group"
              aria-label="切换跟进视图"
              className="inline-flex w-fit items-center rounded-md border border-[var(--hairline-strong)] bg-[var(--secondary)]/40 p-0.5"
            >
              {([
                ["board", "看板", Columns3],
                ["table", "表格", Table2],
                ["schedule", "日程", CalendarDays],
              ] as const).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => changeView(value)}
                  aria-pressed={view === value}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    view === value
                      ? "bg-[var(--card)] text-[var(--ink)] shadow-sm"
                      : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
                  )}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <ViewHint view={view} />
          </div>
        </section>

        {view === "board" ? (
          <DndContext
            id="followup-kanban"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => {
              const id = String(event.active.id);
              const card = cards.find((item) => item.id === id);
              setActiveId(id);
              setAnnouncement(card ? `正在移动${card.customer}` : "正在移动跟进");
            }}
            onDragEnd={onDragEnd}
            onDragCancel={() => {
              setActiveId(null);
              setAnnouncement("移动已取消");
            }}
          >
            <section
              aria-label="客户跟进阶段"
              className="overflow-x-auto pb-4 [scrollbar-color:var(--hairline-strong)_transparent] [scrollbar-width:thin]"
            >
              <div className="grid min-w-max auto-cols-[minmax(18rem,20rem)] grid-flow-col gap-3">
                {FOLLOWUP_COLUMNS.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    cards={byColumn[column.id]}
                    isFiltered={hasFilters}
                    nowMinutes={nowMinutes}
                    onOpen={setSelectedId}
                  />
                ))}
              </div>
            </section>

            <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
              {activeCard ? (
                <div className="w-[19rem]">
                  <FollowUpCard
                    card={activeCard}
                    dragging
                    nowMinutes={nowMinutes}
                    onOpen={() => undefined}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : view === "table" ? (
          <FollowUpTableView
            cards={visibleCards}
            nowMinutes={nowMinutes}
            onOpen={setSelectedId}
          />
        ) : (
          <FollowUpScheduleView
            cards={visibleCards}
            nowMinutes={nowMinutes}
            onOpen={setSelectedId}
          />
        )}

        <p className="sr-only" aria-live="polite">{announcement}</p>
      </main>

      <FollowUpDetailSheet
        card={selectedCard}
        nowMinutes={nowMinutes}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </AdminShell>
  );
}

function ViewHint({ view }: { view: FollowUpView }) {
  const content = {
    board: {
      icon: ArrowLeftRight,
      text: "拖动卡片调整阶段，横向滚动查看更多",
    },
    table: {
      icon: Table2,
      text: "点击表头排序，点击客户或事项查看详情",
    },
    schedule: {
      icon: CalendarDays,
      text: "按约定时间排序，优先处理逾期跟进",
    },
  }[view];
  const Icon = content.icon;

  return (
    <p className="flex items-center gap-1.5 text-[13px] text-[var(--ink-mute)]">
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {content.text}
    </p>
  );
}

function KanbanColumn({
  column,
  cards,
  isFiltered,
  nowMinutes,
  onOpen,
}: {
  column: (typeof FOLLOWUP_COLUMNS)[number];
  cards: FollowUp[];
  isFiltered: boolean;
  nowMinutes: number | null;
  onOpen: (id: string) => void;
}) {
  return (
    <ColumnDropTarget id={`col:${column.id}`}>
      {(isOver) => (
        <section
          aria-labelledby={`column-${column.id}`}
          className={cn(
            "flex min-h-[520px] flex-col rounded-lg border bg-[var(--card)] transition-colors duration-150",
            isOver
              ? "border-[var(--primary)] bg-[var(--primary)]/[0.025] ring-2 ring-[var(--primary)]/10"
              : "border-[var(--hairline)]"
          )}
        >
          <header
            className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b border-[var(--hairline)] bg-[var(--card)]/95 px-4 py-3 backdrop-blur"
            style={{ borderTop: `2px solid ${getToneColor(column.tone)}` }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: getToneColor(column.tone) }}
              />
              <h2
                id={`column-${column.id}`}
                className="truncate font-display text-[17px] font-semibold tracking-tight text-[var(--ink)]"
              >
                {column.label}
              </h2>
            </div>
            <span className="inline-flex min-w-6 items-center justify-center rounded bg-[var(--secondary)] px-1.5 py-0.5 font-mono text-[12px] font-medium tabular-nums text-[var(--ink-mute)]">
              {cards.length}
            </span>
          </header>

          <SortableContext
            items={cards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 space-y-2.5 p-2.5">
              {cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  nowMinutes={nowMinutes}
                  onOpen={() => onOpen(card.id)}
                />
              ))}
              {cards.length === 0 ? (
                <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-[var(--hairline)] px-5 text-center">
                  <p className="text-[14px] font-medium text-[var(--ink-dim)]">
                    {isFiltered ? "没有符合条件的跟进" : "当前阶段暂无跟进"}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--ink-mute)]">
                    {isFiltered ? "调整筛选条件后再试" : "可将其他阶段的卡片拖到这里"}
                  </p>
                </div>
              ) : null}
            </div>
          </SortableContext>
        </section>
      )}
    </ColumnDropTarget>
  );
}

function ColumnDropTarget({
  id,
  children,
}: {
  id: string;
  children: (isOver: boolean) => ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="h-full">
      {children(isOver)}
    </div>
  );
}

function SortableCard({
  card,
  nowMinutes,
  onOpen,
}: {
  card: FollowUp;
  nowMinutes: number | null;
  onOpen: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <FollowUpCard
        card={card}
        dragHandleProps={{ ...attributes, ...listeners }}
        nowMinutes={nowMinutes}
        onOpen={onOpen}
      />
    </div>
  );
}

function FollowUpCard({
  card,
  dragHandleProps,
  dragging = false,
  nowMinutes,
  onOpen,
}: {
  card: FollowUp;
  dragHandleProps?: Record<string, unknown>;
  dragging?: boolean;
  nowMinutes: number | null;
  onOpen: () => void;
}) {
  const ModeIcon = card.mode ? MODE_ICON[card.mode] : MessageCircle;
  const dueState = getDueState(card.nextContactAt, nowMinutes);

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-md border bg-[var(--card)] transition-[border-color,box-shadow,transform] duration-150",
        dragging
          ? "rotate-1 border-[var(--primary)] shadow-2xl"
          : "border-[var(--hairline-strong)] hover:-translate-y-px hover:border-[var(--primary)]/60 hover:shadow-[0_10px_28px_-20px_rgba(40,35,30,0.45)]"
      )}
    >
      <div className="flex items-start gap-1 p-3 pb-2">
        <button
          {...(dragHandleProps ?? {})}
          type="button"
          aria-label={`拖动${card.customer}的跟进卡片`}
          className="flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded text-[var(--ink-mute)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:cursor-grabbing"
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          aria-label={`查看${card.customer}的跟进详情`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[13px] font-medium text-[var(--ink-mute)]">
              {card.customer}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[12px] text-[var(--ink-mute)]">
              <ModeIcon aria-hidden="true" className="h-3.5 w-3.5" />
              {card.mode ? MODE_LABEL[card.mode] : "沟通"}
            </span>
          </div>
          <h3 className="mt-1.5 line-clamp-3 text-[15px] font-semibold leading-[1.5] text-[var(--ink)]">
            {card.record}
          </h3>
        </button>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="block w-full px-3 pb-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
        aria-label={`打开${card.customer}跟进详情`}
      >
        <DueBadge value={card.nextContactAt} state={dueState} />
        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-[var(--hairline)] pt-2.5 text-[13px]">
          <span className="min-w-0 truncate text-[var(--ink-mute)]">
            联系人 · <span className="text-[var(--ink-dim)]">{card.contactName || "未填写"}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[var(--ink-dim)]">
            <UserRound aria-hidden="true" className="h-3.5 w-3.5 text-[var(--ink-mute)]" />
            {card.owner}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-[12px] font-medium text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          查看详情
          <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
        </div>
      </button>
    </article>
  );
}

function DueBadge({ value, state }: { value: string; state: DueState }) {
  const label =
    state === "overdue" ? "已逾期" :
    state === "soon" ? "即将到期" :
    state === "today" ? "今天" :
    state === "unscheduled" ? "未安排" :
    "计划跟进";
  const Icon = state === "overdue" ? CircleAlert : Clock3;

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium",
        state === "overdue" && "bg-[var(--destructive)]/8 text-[var(--destructive)]",
        state === "soon" && "bg-[var(--warn)]/10 text-[var(--warn)]",
        state === "today" && "bg-[var(--info)]/8 text-[var(--info)]",
        state === "upcoming" && "bg-[var(--secondary)] text-[var(--ink-dim)]",
        state === "unscheduled" && "bg-[var(--secondary)] text-[var(--ink-mute)]"
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="font-mono tabular-nums opacity-80">{value || "待补充"}</span>
    </span>
  );
}

function FollowUpDetailSheet({
  card,
  nowMinutes,
  onOpenChange,
}: {
  card: FollowUp | null;
  nowMinutes: number | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={Boolean(card)} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[min(92vw,520px)]"
        title={card?.customer ?? "跟进详情"}
        description={card ? `${card.status} · ${card.owner}负责` : undefined}
      >
        {card ? (
          <div className="flex min-h-full flex-col">
            <div className="flex-1 space-y-6 p-5 sm:p-6">
              <section>
                <p className="text-[12px] font-medium text-[var(--ink-mute)]">下一步动作</p>
                <h2 className="mt-2 text-[20px] font-semibold leading-relaxed tracking-tight text-[var(--ink)]">
                  {card.record}
                </h2>
                <div className="mt-3">
                  <DueBadge
                    value={card.nextContactAt}
                    state={getDueState(card.nextContactAt, nowMinutes)}
                  />
                </div>
              </section>

              <section className="rounded-lg bg-[var(--secondary)]/55 p-4">
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">跟进信息</h3>
                <dl className="mt-4 grid grid-cols-[104px_minmax(0,1fr)] gap-x-4 gap-y-3 text-[14px]">
                  <DetailRow label="当前阶段" value={card.status} />
                  <DetailRow label="实际跟进" value={card.lastContactAt || "暂无记录"} mono />
                  <DetailRow label="下次约定" value={card.nextContactAt || "尚未安排"} mono />
                  <DetailRow label="沟通方式" value={card.mode ? MODE_LABEL[card.mode] : "沟通"} />
                  <DetailRow label="负责人" value={card.owner} />
                </dl>
              </section>

              <section>
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">联系人</h3>
                <div className="mt-3 rounded-md border border-[var(--hairline)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--ink-dim)]">
                      <UserRound aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--ink)]">{card.contactName || "未填写联系人"}</p>
                      <p className="mt-0.5 font-mono text-[13px] text-[var(--ink-mute)]">
                        {card.contactPhone || "暂无联系电话"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-[var(--hairline)] bg-[var(--card)] px-5 py-4 sm:px-6">
              <Button asChild variant="outline">
                <Link href={`/crm/followups/${card.id}`}>查看完整档案</Link>
              </Button>
              <Button asChild>
                <Link
                  href={`/crm/followups/new?customer=${encodeURIComponent(
                    card.customerId ?? card.customer
                  )}`}
                >
                  新增后续跟进
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <>
      <dt className="text-[var(--ink-mute)]">{label}</dt>
      <dd className={cn("min-w-0 text-[var(--ink)]", mono && "font-mono tabular-nums")}>
        {value}
      </dd>
    </>
  );
}
