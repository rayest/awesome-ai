"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/domain/a-status";
import { AttentionRail, WorkflowListHeader, WorkflowPulse } from "@/components/domain/workflow-list";
import { getContacts } from "@/lib/data";

const ROLE_TONE = {
  决策: "primary",
  采购: "info",
  技术: "success",
  品控: "warn",
  财务: "neutral",
} as const;

const FILTERS = ["全部", "决策", "采购", "技术", "品控", "财务"] as const;

function inferRole(title?: string) {
  if (!title) return undefined;
  if (/总经理|总监|负责人/.test(title)) return "决策";
  if (/采购/.test(title)) return "采购";
  if (/技术|设计|工艺/.test(title)) return "技术";
  if (/品质|品控|质量/.test(title)) return "品控";
  if (/财务|会计/.test(title)) return "财务";
  return undefined;
}

function normalizeContact(row: any) {
  return {
    ...row,
    customer: row.customer ?? row.customerName ?? (row.contactName ? row.name : undefined),
    name: row.contactName ?? row.name,
    role: row.role ?? inferRole(row.title),
  };
}

export default function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const [q, setQ] = useState(sp.q ?? "");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");
  const [hideStale, setHideStale] = useState(false);
  const allRows = useMemo(() => getContacts().map(normalizeContact), []);

  const rows = useMemo(() => {
    return allRows.filter((c) => {
      // URL 级过滤：客户名锁定
      if (sp.customer && c.customer !== sp.customer) return false;
      if (pf !== "全部" && c.role !== pf) return false;
      if (hideStale && c.lastTouchAt?.includes("天前") && !c.lastTouchAt?.includes("1 天")) return false;
      if (!q) return true;
      const lq = q.toLowerCase();
      return (
        c.name.includes(q) ||
        c.customer.includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(lq) ||
        c.title.includes(q)
      );
    });
  }, [allRows, q, pf, hideStale, sp.customer]);

  const staleRows = allRows.filter((row) => {
    const dayMatch = row.lastTouchAt?.match(/(\d+)\s*天/);
    return !row.lastTouchAt || (dayMatch ? Number(dayMatch[1]) >= 7 : false);
  });
  const attentionItems = staleRows.map((row) => ({
    title: `${row.name} · ${row.customer}`,
    eyebrow: row.role ?? row.dept ?? "联系人",
    meta: row.lastTouchAt
      ? `上次联系 ${row.lastTouchAt}，建议安排下一步沟通`
      : "暂无联系记录，建议完成首次触达",
    href: `/crm/contacts/${row.id}`,
    tone: row.lastTouchAt ? "warn" as const : "danger" as const,
  }));

  /* 浏览器前进/后退时跟随 URL */
  useEffect(() => {
    setQ(sp.q ?? "");
  }, [sp]);

  return (
    <AdminShell
      pageTitle="联系人"
      pageKicker="客户管理"
      pageDescription="维护客户侧联系人、职务和联系方式，方便业务跟进时快速找到对应窗口。"
      pageActions={(
        <Link href="/crm/contacts/new">
          <Button variant="default" size="md">新增联系人</Button>
        </Link>
      )}
      pageMeta={[
        { label: "联系人", value: allRows.length },
        { label: "客户数", value: new Set(allRows.map((row) => row.customer)).size },
        { label: "7 天待联系", value: staleRows.length },
      ]}
    >
      <div className="mx-auto max-w-[1440px] space-y-5 px-8 py-6">
        <WorkflowPulse
          items={[
            { label: "关键决策人", value: allRows.filter((row) => row.role === "决策").length, detail: "影响合作推进与关键方案确认", tone: "primary", active: pf === "决策", onClick: () => setPf("决策") },
            { label: "采购窗口", value: allRows.filter((row) => row.role === "采购").length, detail: "报价、交期和订单沟通的主要入口", active: pf === "采购", onClick: () => setPf("采购") },
            { label: "微信可达", value: allRows.filter((row) => row.hasWechat).length, detail: "已建立即时沟通渠道的联系人", tone: "success" },
            { label: "长期未联系", value: staleRows.length, detail: "7 天以上无沟通或尚未完成首次触达", tone: staleRows.length ? "warn" : "success" },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0">
            <WorkflowListHeader title="客户关系网络" count={rows.length}>
          <Input
            placeholder="搜姓名 / 公司 / 电话 / 邮箱..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-[320px]"
          />
          <div className="flex items-center gap-1 ml-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setPf(f)}
                className={cn(
                  "h-9 px-3 rounded-md text-[14px] transition-colors font-mono tracking-tight",
                  pf === f
                    ? "bg-[var(--ink)] text-[var(--background)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-2 text-[14px] text-[var(--ink-dim)] cursor-pointer">
            <input
              type="checkbox"
              checked={hideStale}
              onChange={(e) => setHideStale(e.target.checked)}
              className="w-3.5 h-3.5 accent-[var(--primary)]"
            />
            <span>隐藏 7 天未联系</span>
          </label>
            </WorkflowListHeader>

        <div className="overflow-x-auto rounded-md border border-[var(--hairline)] bg-[var(--card)]">
          <div className="grid min-w-[1080px] grid-cols-[40px_140px_60px_90px_80px_140px_140px_60px_80px_50px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            <div></div>
            <div>客户</div>
            <div>姓名</div>
            <div>职务</div>
            <div>部门</div>
            <div>电话</div>
            <div>邮箱</div>
            <div>角色</div>
            <div className="text-right">联系</div>
            <div>上次</div>
            <div>工具</div>
          </div>

          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/crm/contacts/${c.id}`}
              className="grid min-w-[1080px] grid-cols-[40px_140px_60px_90px_80px_140px_140px_60px_80px_50px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="flex items-center justify-center">
                <StatusDot
                  tone={
                    c.lastTouchAt?.startsWith("今")
                      ? "success"
                      : c.lastTouchAt?.includes("天")
                      ? "warn"
                      : "neutral"
                  }
                />
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">
                {c.customer} {c.customerId && <span className="text-[var(--ink-mute)]">{c.customerId}</span>}
              </div>
              <div className="text-[14px] font-medium text-[var(--ink)]">{c.name}</div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{c.title}</div>
              <div className="text-[14px] text-[var(--ink-mute)] truncate">{c.dept}</div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">{c.phone}</div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate underline decoration-[var(--hairline-strong)]">{c.email}</div>
              <div>
                <Badge tone={ROLE_TONE[c.role as keyof typeof ROLE_TONE]} size="sm">{c.role}</Badge>
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{c.touchCount ?? "—"}</div>
              <div className="text-[14px] font-mono text-[var(--ink-mute)]">{c.lastTouchAt ?? "—"}</div>
              <div className="flex items-center gap-1.5">
                {c.hasWechat && (
                  <span
                    className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0"
                    title="微信可联系"
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
          </section>

          <AttentionRail
            title="关系维护"
            description="把久未联系和从未触达的客户窗口集中起来，形成明确的维护队列。"
            items={attentionItems}
          />
        </div>
      </div>
    </AdminShell>
  );
}
