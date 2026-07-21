"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Phone, MessageCircle, Calendar, GripVertical } from "lucide-react";

/**
 * 跟进看板 · Kanban
 *
 * 5 列状态：
 *   新跟进 · 已联系 · 待回访 · 客户确认 · 已成交
 *
 * 用 @dnd-kit 实现卡片跨列拖拽（drag-and-drop）
 * 这是销售 pipeline 看板，base 里没有这种视图。
 */

type ColId = "lead" | "contacted" | "followup" | "waiting" | "won";

const COLUMNS: { id: ColId; label: string; tone: string }[] = [
  { id: "lead",       label: "新跟进",   tone: "neutral" },
  { id: "contacted",  label: "已联系",   tone: "info" },
  { id: "followup",   label: "待回访",   tone: "warn" },
  { id: "waiting",    label: "客户确认", tone: "primary" },
  { id: "won",        label: "已成交",   tone: "success" },
];

type FollowUp = {
  id: string;
  customer: string;
  contact: string;
  phone: string;
  mode: "phone" | "im" | "visit";
  summary: string;
  ytd: number;
  due: string;
  charge: string;
  col: ColId;
};

const INITIAL: FollowUp[] = [
  { id: "1", customer: "乾盛", contact: "陈总", phone: "138-xxxx-9921", mode: "phone", summary: "确认 200 件立领大衣大货交期", ytd: 2_450_000, due: "今 16:00", charge: "李白", col: "followup" },
  { id: "2", customer: "弘大", contact: "马经理", phone: "189-xxxx-1102", mode: "im", summary: "罗纹打底衫的辅料清单确认", ytd: 1_820_000, due: "今 11:30", charge: "李白", col: "lead" },
  { id: "3", customer: "鸣笛", contact: "丁工", phone: "150-xxxx-7791", mode: "visit", summary: "下周一下午到访工厂看机器", ytd: 0, due: "今 14:00", charge: "刘韬", col: "contacted" },
  { id: "4", customer: "一针坊", contact: "亚明", phone: "138-xxxx-3308", mode: "im", summary: "围巾纱线打样进度跟进", ytd: 380_000, due: "今 09:00", charge: "亚明", col: "waiting" },
  { id: "5", customer: "巧岛", contact: "张设计", phone: "139-xxxx-5522", mode: "phone", summary: "卫衣色牢度报价被打回，重新算", ytd: 0, due: "今 17:00", charge: "刘韬", col: "followup" },
  { id: "6", customer: "霞飞", contact: "周总", phone: "186-xxxx-2287", mode: "im", summary: "3 个月未跟进，激活一下", ytd: 96_000, due: "明 10:00", charge: "李白", col: "lead" },
  { id: "7", customer: "乾盛", contact: "采购小张", phone: "138-xxxx-9922", mode: "phone", summary: "200 件合同的辅料清单送到", ytd: 2_450_000, due: "今 14:00", charge: "李白", col: "contacted" },
  { id: "8", customer: "弘大", contact: "李设计", phone: "189-xxxx-1103", mode: "im", summary: "Q3 季度返单询价", ytd: 1_820_000, due: "明 16:00", charge: "李白", col: "won" },
];

const MODE_ICON = {
  phone: Phone,
  im: MessageCircle,
  visit: Calendar,
};

export default function FollowUpKanbanPage() {
  const [cards, setCards] = useState<FollowUp[]>(INITIAL);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const byCol = useMemo(() => {
    const m: Record<ColId, FollowUp[]> = {
      lead: [], contacted: [], followup: [], waiting: [], won: [],
    };
    for (const c of cards) m[c.col].push(c);
    return m;
  }, [cards]);

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const overId = over.id as string;
    const activeCard = cards.find((c) => c.id === active.id);
    if (!activeCard) return;
    // over a column header (id = "col:lead") or another card
    let nextCol: ColId | null = null;
    if (overId.startsWith("col:")) {
      nextCol = overId.slice(4) as ColId;
    } else {
      const overCard = cards.find((c) => c.id === overId);
      if (overCard) nextCol = overCard.col;
    }
    if (!nextCol || nextCol === activeCard.col) return;
    setCards((cs) =>
      cs.map((c) => (c.id === activeCard.id ? { ...c, col: nextCol! } : c))
    );
  };

  return (
    <AdminShell>
      <div className="px-6 py-8 mx-auto max-w-[1480px]">
        {/* 顶部 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="FOLLOWUP-KANBAN-2026-07-21"
            shortCode="qs-app"
            season="今"
            composition={`${cards.length} 个跟进 · ${cards.filter((c) => c.col === "followup").length} 个待回访 · ${cards.filter((c) => c.col === "won").length} 已成交`}
            specs={[
              { label: "卡片", value: cards.length, mono: true },
              { label: "今日到期", value: cards.filter((c) => c.due.startsWith("今")).length, mono: true },
              { label: "已成交", value: cards.filter((c) => c.col === "won").length, mono: true },
            ]}
            prices={[
              { label: "在档客户", value: "6 家", mono: true },
              { label: "总 YTD 流水", value: "¥ 6.5M", mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              CRM · followup
            </p>
            <h1 className="font-display text-[28px] font-medium tracking-tight">跟进看板</h1>
            <p className="mt-1.5 text-[13px] text-[var(--ink-dim)] max-w-[520px]">
              销售 pipeline 一目了然。卡可拖拽流转。今天该跟进什么？点卡片 → 跳到客户。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">导出 CSV</Button>
            <Button variant="default" size="md">+ 新跟进</Button>
          </div>
        </div>

        {/* Kanban */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveId(String(e.active.id))}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="grid grid-cols-5 gap-3">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                cards={byCol[col.id]}
                count={byCol[col.id].length}
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
}: {
  col: typeof COLUMNS[number];
  cards: FollowUp[];
  count: number;
}) {
  // 用 useDroppable 简化版 - 通过 SortableContext 注册卡片 + ColumnHeader 作为 droppable
  // 这里用 dnd-kit 原生 useDroppable（避免引入 useDroppable 包装）
  return (
    <ColumnDropTarget id={`col:${col.id}`}>
      <div className="bg-[var(--card)] rounded-md border border-[var(--hairline)] flex flex-col min-h-[480px]">
        <div className="px-4 py-3 border-b border-[var(--hairline)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    col.tone === "neutral"
                      ? "var(--ink-mute)"
                      : col.tone === "info"
                      ? "var(--info)"
                      : col.tone === "warn"
                      ? "var(--warn)"
                      : col.tone === "primary"
                      ? "var(--primary)"
                      : "var(--success)",
                }}
              />
              <span className="font-display text-[14px] font-medium">{col.label}</span>
              <span className="font-mono text-[10px] text-[var(--ink-mute)] tnum">
                {count}
              </span>
            </div>
          </div>
        </div>

        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 p-2 space-y-2 min-h-0">
            {cards.map((c) => (
              <SortableCard key={c.id} c={c} />
            ))}
            {cards.length === 0 && (
              <div className="text-center text-[11px] font-mono text-[var(--ink-mute)] py-8">
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

function SortableCard({ c }: { c: FollowUp }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: c.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card c={c} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function Card({
  c,
  dragHandleProps,
  dragging = false,
}: {
  c: FollowUp;
  dragHandleProps?: Record<string, unknown>;
  dragging?: boolean;
}) {
  const ModeIcon = MODE_ICON[c.mode];
  return (
    <div
      className={cn(
        "group rounded-md border bg-[var(--card)] p-3 cursor-pointer",
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
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
              {c.customer}
            </span>
            <ModeIcon className="w-3 h-3 text-[var(--ink-dim)]" />
          </div>
          <p className="text-[13px] font-medium text-[var(--ink)] leading-snug mb-2 line-clamp-2">
            {c.summary}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-mute)]">
            <span className="truncate">{c.contact} · {c.phone.slice(-4)}</span>
            <span
              className={cn(
                "shrink-0 ml-2 font-medium",
                c.due.startsWith("今") && c.due.includes("已") === false
                  ? "text-[var(--warn)]"
                  : "text-[var(--ink-dim)]"
              )}
            >
              {c.due}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[var(--ink-mute)]">{c.charge}</span>
            <span className="text-[var(--ink)] tnum">
              ¥{(c.ytd / 10000).toFixed(1)}w
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
