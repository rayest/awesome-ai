"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/domain/a-status";
import { getContacts } from "@/lib/data";

const ROLE_TONE = {
  决策: "primary",
  采购: "info",
  技术: "success",
  品控: "warn",
  财务: "neutral",
} as const;

const FILTERS = ["全部", "决策", "采购", "技术", "品控", "财务"] as const;

export default function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string; q?: string }>;
}) {
  const sp = use(searchParams);
  const [q, setQ] = useState(sp.q ?? "");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");
  const [hideStale, setHideStale] = useState(false);

  const rows = useMemo(() => {
    return getContacts().filter((c) => {
      // URL 级过滤：客户名锁定
      if (sp.customer && c.customer !== sp.customer) return false;
      if (pf !== "全部" && c.role !== pf) return false;
      if (hideStale && c.lastTouchAt.includes("天前") && !c.lastTouchAt.includes("1 天")) return false;
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
  }, [q, pf, hideStale, sp.customer]);

  /* 浏览器前进/后退时跟随 URL */
  useEffect(() => {
    setQ(sp.q ?? "");
  }, [sp]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 顶部 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="CONTACTS-2026-07-21"
            shortCode="qs-app"
            season="本周"
            composition={`${getContacts().length} 位联系人 · ${getContacts().filter((c) => c.role === "决策").length} 位决策人 · ${getContacts().filter((c) => c.lastTouchAt.includes("天前") && !c.lastTouchAt.includes("1 天")).length} 人长期未联系`}
            specs={[
              { label: "联系人", value: getContacts().length, mono: true },
              { label: "决策人", value: getContacts().filter((c) => c.role === "决策").length, mono: true },
              { label: "微信号", value: getContacts().filter((c) => c.hasWechat).length, mono: true },
            ]}
            prices={[
              { label: "未联系 > 7d", value: getContacts().filter((c) => c.lastTouchAt.includes("天前")).length, mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              CRM · contacts
            </p>
            <h1 className="font-display text-[32px] font-medium tracking-tight">联系人</h1>
            <p className="mt-1.5 text-[14px] text-[var(--ink-dim)] max-w-[520px]">
              每个客户多名对接人：老板/采购/技术/品控。一个客户离开，全员联系不断。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">批量导入</Button>
            <Link href="/crm/contacts/new">
              <Button variant="default" size="md">+ 新联系人</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
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
        </div>

        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="grid grid-cols-[40px_140px_60px_90px_80px_140px_140px_60px_80px_50px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[14px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
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
            <div
              key={c.id}
              className="grid grid-cols-[40px_140px_60px_90px_80px_140px_140px_60px_80px_50px_60px] gap-2 px-3 py-2 items-center border-b border-[var(--hairline)] last:border-b-0 hover:bg-[var(--accent)]/30 cursor-pointer"
            >
              <div className="flex items-center justify-center">
                <StatusDot
                  tone={
                    c.lastTouchAt.startsWith("今")
                      ? "success"
                      : c.lastTouchAt.includes("天")
                      ? "warn"
                      : "neutral"
                  }
                />
              </div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">
                {c.customer} <span className="text-[var(--ink-mute)]">{c.customerId}</span>
              </div>
              <div className="text-[14px] font-medium text-[var(--ink)]">{c.name}</div>
              <div className="text-[14px] text-[var(--ink-dim)] truncate">{c.title}</div>
              <div className="text-[14px] text-[var(--ink-mute)] truncate">{c.dept}</div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate">{c.phone}</div>
              <div className="font-mono text-[14px] text-[var(--ink-dim)] truncate underline decoration-[var(--hairline-strong)]">{c.email}</div>
              <div>
                <Badge tone={ROLE_TONE[c.role as keyof typeof ROLE_TONE]} size="sm">{c.role}</Badge>
              </div>
              <div className="text-right font-mono tnum text-[14px] text-[var(--ink)]">{c.touchCount}</div>
              <div className="text-[14px] font-mono text-[var(--ink-mute)]">{c.lastTouchAt}</div>
              <div className="flex items-center gap-1.5">
                {c.hasWechat && (
                  <span
                    className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0"
                    title="微信可联系"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
