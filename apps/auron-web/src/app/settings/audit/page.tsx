"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { ArrowRight, Search, Filter, Lock } from "lucide-react";

/**
 * 审计日志
 *
 * 这是 底表 **完全缺** 的能力：
 *  - 底表 没有 created_at / updated_at / updated_by
 *  - 底表 没有「字段级」修改记录
 *
 * 这里 demo：
 *  - 每条记录的创建、修改、删除
 *  - 字段级 diff（前 vs 后）
 *  - 关键字段（毛利率、含税价）的访问会单独留痕
 *  - 谁、改了哪个字段、改成什么、为何改、来自什么 IP
 */

type Action = "create" | "update" | "delete" | "view" | "export";

type AuditEntry = {
  id: string;
  ts: string;
  actor: string;
  actorRole: string;
  action: Action;
  record: string;          // e.g. "Q-2026-0317-A"
  recordType: string;       // e.g. "quotation"
  summary: string;
  diff?: {
    field: string;
    before: string;
    after: string;
    sensitive?: boolean;
  }[];
  reason?: string;
  ip: string;
};

const MOCK: AuditEntry[] = [
  {
    id: "1",
    ts: "2026-07-21 18:42:11",
    actor: "李白",
    actorRole: "QUOTER",
    action: "update",
    record: "Q-2026-0317-A",
    recordType: "报价单",
    summary: "修改含税成本",
    diff: [
      { field: "含税成本", before: "¥ 308.20", after: "¥ 311.65", sensitive: true },
      { field: "不含税成本", before: "¥ 270.00", after: "¥ 275.80", sensitive: false },
      { field: "备案含税价", before: "¥ 415.00", after: "¥ 410.40", sensitive: true },
    ],
    reason: "染厂通知 7/22 起原料涨价 1.5%，重新核算",
    ip: "10.0.32.41",
  },
  {
    id: "2",
    ts: "2026-07-21 17:11:03",
    actor: "李白",
    actorRole: "QUOTER",
    action: "create",
    record: "Q-2026-0317-A",
    recordType: "报价单",
    summary: "从工艺单 WO-2026-0317-A 创建",
    ip: "10.0.32.41",
  },
  {
    id: "3",
    ts: "2026-07-21 14:02:55",
    actor: "老周",
    actorRole: "KNIT_MASTER",
    action: "update",
    record: "WO-2026-0317-A",
    recordType: "工艺单",
    summary: "更新织造用料 — 罗纹改款",
    diff: [
      { field: "罗纹纱线", before: "抗起球腈纶 (1%)", after: "抗起球腈纶 (2%)" },
      { field: "罗纹比例% (修正)", before: "1", after: "2" },
    ],
    reason: "试织发现 1% 罗纹太薄，客户要求加厚到 2%",
    ip: "10.0.4.18",
  },
  {
    id: "4",
    ts: "2026-07-21 09:14:32",
    actor: "李白",
    actorRole: "SALES",
    action: "create",
    record: "SMPL-2026-0317-A",
    recordType: "打样通知",
    summary: "新建打样通知（来源客户：乾盛）",
    ip: "10.0.32.41",
  },
  {
    id: "5",
    ts: "2026-07-20 22:08:14",
    actor: "陈总",
    actorRole: "DIRECTOR",
    action: "view",
    record: "Q-2026-0315-A",
    recordType: "报价单",
    summary: "查阅毛利详情",
    ip: "10.0.16.7",
  },
  {
    id: "6",
    ts: "2026-07-20 11:30:48",
    actor: "刘韬",
    actorRole: "SALES",
    action: "update",
    record: "C-QD-044",
    recordType: "客户",
    summary: "客户类型 潜客 → 流失",
    diff: [
      { field: "客户类型", before: "潜客", after: "流失" },
      { field: "最后接触", before: "62 天前", after: "今 11:30" },
    ],
    reason: "客户 4 个月没有任何业务往来，标记流失",
    ip: "10.0.32.55",
  },
];

const ACTION_TONE: Record<Action, { tone: string; label: string }> = {
  create:  { tone: "success", label: "新建" },
  update:  { tone: "info",    label: "修改" },
  delete:  { tone: "danger",  label: "删除" },
  view:    { tone: "neutral", label: "查阅" },
  export:  { tone: "warn",    label: "导出" },
};

const ROLES_TONE: Record<string, string> = {
  QUOTER:       "var(--primary)",
  OWNER:        "var(--ink)",
  ADMIN:        "var(--ink-dim)",
  SALES:        "var(--info)",
  ORDER:        "var(--warn)",
  KNIT_MASTER:  "var(--success)",
  SEW_MASTER:   "var(--success)",
  DIRECTOR:     "var(--ink)",
};

export default function AuditLogPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"全部" | "create" | "update" | "delete" | "view">("全部");

  const rows = useMemo(() => {
    return MOCK.filter((e) => {
      if (filter !== "全部" && e.action !== filter) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        e.actor.includes(q) ||
        e.record.toLowerCase().includes(lq) ||
        e.summary.includes(q)
      );
    });
  }, [q, filter]);

  const sensitiveCount = rows.filter((e) =>
    e.diff?.some((d) => d.sensitive)
  ).length;

  return (
    <AdminShell
      pageTitle="审计日志"
      pageKicker="系统管理"
      pageDescription="记录关键修改、敏感字段变更和异常操作，方便老板、厂长和管理员追溯。"
      pageActions={(
        <>
          <Button variant="outline" size="md">
            <Filter className="w-4 h-4" />
            高级筛选
          </Button>
          <Button variant="outline" size="md">导出表格</Button>
        </>
      )}
      pageMeta={[
        { label: "全部", value: MOCK.length },
        { label: "当前", value: rows.length },
        { label: "敏感改动", value: sensitiveCount },
      ]}
    >
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
                {/* 搜索 + 过滤 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1 max-w-[420px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-mute)]" />
            <Input
              placeholder="搜操作人 / 记录 / 摘要..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1">
            {(["全部", "create", "update", "view", "delete"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-9 px-3 rounded-md text-[14px] transition-colors font-mono tracking-tight",
                  filter === f
                    ? "bg-[var(--ink)] text-[var(--background)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 时间线式审计条目 */}
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="px-4 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)] grid grid-cols-[180px_120px_180px_1fr] gap-3">
            <div>时间</div>
            <div>操作人</div>
            <div>类型 / 记录</div>
            <div>摘要 + 字段差异</div>
          </div>

          {rows.map((e) => (
            <AuditRow key={e.id} entry={e} />
          ))}
        </div>

        {/* 说明卡 */}
        <div className="mt-4 border border-dashed border-[var(--hairline-strong)] rounded-md p-4 text-[14px] text-[var(--ink-mute)] font-mono space-y-1">
          <p className="flex items-center gap-1.5 text-[var(--ink-dim)]">
            <Lock className="w-3 h-3" />
            敏感字段（含税成本 / 备案价 / 毛利率）的访问会单独留痕，且 value 经过 AES-256-GCM 加密存储。
          </p>
          <p className="text-[14px]">
            系统每 15 分钟生成完整性哈希链；任何条目被改动，验签会失败。
          </p>
        </div>
      </div>
    </AdminShell>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const actionMeta = ACTION_TONE[entry.action];
  const roleColor = ROLES_TONE[entry.actorRole] ?? "var(--ink-dim)";

  return (
    <div className="border-b border-[var(--hairline)] last:border-b-0">
      <div className="px-4 py-3 grid grid-cols-[180px_120px_180px_1fr] gap-3 items-start">
        <div className="font-mono text-[14px] text-[var(--ink-dim)]">
          {entry.ts}
          <div className="text-[14px] text-[var(--ink-mute)] mt-0.5">{entry.ip}</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className="font-mono text-[14px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded"
              style={{ background: roleColor + "20", color: roleColor }}
            >
              {entry.actorRole}
            </span>
          </div>
          <div className="text-[14px] text-[var(--ink)] mt-1">{entry.actor}</div>
        </div>
        <div>
          <Badge tone={actionMeta.tone as "success" | "info" | "danger" | "warn" | "neutral"} size="sm">
            {actionMeta.label}
          </Badge>
          <div className="font-mono text-[14px] text-[var(--ink-dim)] mt-1.5 truncate">
            {entry.record}
          </div>
          <div className="text-[14px] font-mono text-[var(--ink-mute)] truncate">
            {entry.recordType}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[14px] text-[var(--ink)]">{entry.summary}</p>
          {entry.diff && entry.diff.length > 0 && (
            <div className="mt-2 space-y-1">
              {entry.diff.map((d, i) => (
                <DiffRow key={i} d={d} />
              ))}
            </div>
          )}
          {entry.reason && (
            <p className="mt-2 text-[14px] text-[var(--ink-mute)] italic">
              备注：{entry.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DiffRow({ d }: { d: { field: string; before: string; after: string; sensitive?: boolean } }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[14px] font-mono",
        d.sensitive ? "text-[var(--warn)]" : "text-[var(--ink-dim)]"
      )}
    >
      <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] min-w-[80px]">
        {d.field}
      </span>
      <span className="line-through opacity-50">{d.before}</span>
      <ArrowRight className="w-3 h-3 opacity-50" />
      <span className={cn(d.sensitive && "font-medium")}>{d.after}</span>
      {d.sensitive && (
        <span className="text-[14px] uppercase tracking-[0.18em] text-[var(--warn)] border border-[var(--warn)] px-1 rounded">
          敏感
        </span>
      )}
    </div>
  );
}
