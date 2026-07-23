"use client";

import { use, useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Phone,
  MessageCircle,
  Calendar,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFollowups } from "@/lib/data";

const COLUMNS = [
  { id: "初步接触",     label: "初步接触", tone: "neutral" },
  { id: "需求确认",     label: "需求确认", tone: "info" },
  { id: "方案制定",     label: "方案制定", tone: "info" },
  { id: "商务洽谈",     label: "商务洽谈", tone: "primary" },
  { id: "签约成交",     label: "签约成交", tone: "success" },
  { id: "合作中",       label: "合作中",   tone: "success" },
  { id: "合作结束",     label: "合作结束", tone: "neutral" },
] as const;

type Status = typeof COLUMNS[number]["id"];

type FollowUp = {
  id: string;
  customer: string;          // 客户 (lookup crm_客户表)
  customerId: string;
  contactName: string;       // 联系人姓名 (lookup crm_客户联系人表)
  contactPhone: string;
  mode: "phone" | "im" | "visit";
  record: string;            // 跟进记录 text
  lastContactAt: string;     // 实际跟进时间 datetime
  nextContactAt: string;     // 下次跟进时间 datetime
  owner: string;             // 跟进人 user
  status: Status;            // 跟进状态 select
};

const MODE_ICON = { phone: Phone, im: MessageCircle, visit: Calendar } as const;

export default function FollowUpKanbanPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string; contact?: string }>;
}) {
  const sp = use(searchParams);
  const initialCustomer = sp.customer ?? null;
  const [cards, setCards] = useState<FollowUp[]>(
    initialCustomer
      ? getFollowups().filter((c) => c.customerId === initialCustomer)
      : getFollowups()
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* 浏览器前进/后退时跟随 URL 过滤 */
  useEffect(() => {
    if (sp.customer) {
      setCards(getFollowups().filter((c) => c.customerId === sp.customer));
    }
  }, [sp]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const byCol = useMemo(() => {
    const m = Object.fromEntries(COLUMNS.map((c) => [c.id, [] as FollowUp[]])) as Record<Status, FollowUp[]>;
    for (const c of cards) m[c.status].push(c);
    return m;
  }, [cards]);

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const overId = over.id as string;
    const activeCard = cards.find((c) => c.id === active.id);
    if (!activeCard) return;
    let nextStatus: Status | null = null;
    if (overId.startsWith("col:")) {
      nextStatus = overId.slice(4) as Status;
    } else {
      const overCard = cards.find((c) => c.id === overId);
      if (overCard) nextStatus = overCard.status;
    }
    if (!nextStatus || nextStatus === activeCard.status) return;
    setCards((cs) =>
      cs.map((c) => (c.id === activeCard.id ? { ...c, status: nextStatus! } : c))
    );
  };

  return (
    <AdminShell>
      <div className="px-6 py-8 mx-auto max-w-[1480px]">
        {/* 顶部 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="FOLLOWUP-KANBAN-2026-07-22"
            shortCode="qs-app"
            season="今"
            composition={`${cards.length} 个跟进 · ${cards.filter((c) => c.nextContactAt.startsWith("今")).length} 个今日到期 · ${cards.filter((c) => c.status === "签约成交" || c.status === "合作中").length} 成交`}
            specs={[
              { label: "卡片", value: cards.length, mono: true },
              { label: "今日到期", value: cards.filter((c) => c.nextContactAt.startsWith("今")).length, mono: true },
              { label: "已成交", value: cards.filter((c) => c.status === "签约成交" || c.status === "合作中").length, mono: true },
            ]}
            prices={[
              { label: "状态分列", value: "7", mono: true },
              { label: "数据源", value: "crm_客户跟进记录表", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              CRM · followup
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">跟进看板</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              7 列 = crm_客户跟进记录表.跟进状态 select 选项。卡片可跨列拖拽，点击展开沟通摘要。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">导出 CSV</Button>
            <Button variant="default" size="md">+ 新跟进</Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveId(String(e.active.id))}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="grid grid-cols-7 gap-2">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                cards={byCol[col.id]}
                count={byCol[col.id].length}
                expandedId={expandedId}
                onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId
              ? (() => {
                  const c = cards.find((x) => x.id === activeId);
                  return c ? <Card c={c} dragging /> : null;
                })()
              : null}
          </DragOverlay>
        </DndContext>
      </div>
    </AdminShell>
  );
}

function KanbanColumn({
  col,
  cards,
  count,
  expandedId,
  onToggle,
}: {
  col: typeof COLUMNS[number];
  cards: FollowUp[];
  count: number;
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <ColumnDropTarget id={`col:${col.id}`}>
      <div className="bg-[var(--card)] rounded-md border border-[var(--hairline)] flex flex-col min-h-[480px]">
        <div className="px-3 py-2.5 border-b border-[var(--hairline)]">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    col.tone === "neutral" ? "var(--ink-mute)" :
                    col.tone === "info"     ? "var(--info)" :
                    col.tone === "primary"  ? "var(--primary)" :
                    col.tone === "success"  ? "var(--success)" :
                                               "var(--warn)",
                }}
              />
              <span className="font-display text-[18px] font-medium">{col.label}</span>
            </div>
            <span className="font-mono text-[14px] text-[var(--ink-mute)] tnum">
              {count}
            </span>
          </div>
        </div>

        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 p-2 space-y-2 min-h-0">
            {cards.map((c) => (
              <SortableCard
                key={c.id}
                c={c}
                expanded={expandedId === c.id}
                onToggle={() => onToggle(c.id)}
              />
            ))}
            {cards.length === 0 && (
              <div className="text-center text-[14px] font-mono text-[var(--ink-mute)] py-8">
                空
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </ColumnDropTarget>
  );
}

function ColumnDropTarget({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="h-full">{children}</div>;
}

function SortableCard({
  c, expanded, onToggle,
}: { c: FollowUp; expanded: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: c.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        c={c}
        dragHandleProps={{ ...attributes, ...listeners }}
        expanded={expanded}
        onToggle={onToggle}
      />
    </div>
  );
}

function Card({
  c,
  dragHandleProps,
  dragging = false,
  expanded = false,
  onToggle,
}: {
  c: FollowUp;
  dragHandleProps?: Record<string, unknown>;
  dragging?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const ModeIcon = c.mode ? MODE_ICON[c.mode] : MessageCircle;
  const overdue = c.nextContactAt.startsWith("今");
  return (
    <div
      className={cn(
        "group rounded-md border bg-[var(--card)] p-2.5",
        "hover:border-[var(--primary)] transition-colors",
        dragging ? "border-[var(--primary)] shadow-2xl rotate-1" : "border-[var(--hairline)]"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...(dragHandleProps ?? {})}
          className="text-[var(--ink-mute)] hover:text-[var(--ink)] pt-0.5 cursor-grab active:cursor-grabbing"
          aria-label="拖拽卡片"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] truncate">
              {c.customer}{c.customerId ? ` · ${c.customerId.slice(5)}` : ""}
            </span>
            <ModeIcon className="w-3 h-3 text-[var(--ink-dim)] shrink-0" />
          </div>
          <p className="text-[14px] font-medium text-[var(--ink)] leading-snug mb-2 line-clamp-2">
            {c.record}
          </p>

          {/* 紧凑视图：联系人 + 下次跟进 */}
          <div className="flex items-center justify-between text-[14px] font-mono text-[var(--ink-mute)]">
            <span className="truncate">{c.contactName}{c.contactPhone ? ` · ${c.contactPhone.slice(-4)}` : ""}</span>
            <span className={cn("shrink-0 ml-2 font-medium", overdue ? "text-[var(--warn)]" : "text-[var(--ink-dim)]")}>
              {c.nextContactAt}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[14px] font-mono">
            <span className="text-[var(--ink-mute)]">{c.owner}</span>
            <button
              onClick={onToggle}
              className="text-[var(--ink-mute)] hover:text-[var(--ink)] inline-flex items-center gap-0.5"
              aria-label={expanded ? "收起详情" : "展开详情"}
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* 展开视图：跟进摘要 / 实际跟进时间 / 联系人姓名 / 关联客户 */}
          {expanded && (
            <div className="mt-2 pt-2 border-t border-[var(--hairline)] space-y-1.5 font-mono text-[14px]">
              <div className="flex justify-between">
                <span className="text-[var(--ink-mute)]">实际跟进时间</span>
                <span className="text-[var(--ink-dim)]">{c.lastContactAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-mute)]">下次约定</span>
                <span className={cn(overdue ? "text-[var(--warn)] font-medium" : "text-[var(--ink-dim)]")}>
                  {c.nextContactAt}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-mute)]">联系人</span>
                <span className="text-[var(--ink-dim)] truncate ml-2">{c.contactName} · {c.contactPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-mute)]">客户</span>
                <span className="text-[var(--ink-dim)]">{c.customer}</span>
              </div>
              <div className="pt-1 border-t border-[var(--hairline)]/50">
                <p className="text-[var(--ink-mute)] mb-0.5">跟进摘要</p>
                <p className="text-[14px] text-[var(--ink)] leading-relaxed">{c.record}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
