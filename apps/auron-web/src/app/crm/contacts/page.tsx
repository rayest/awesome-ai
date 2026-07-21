"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FabricLabel } from "@/components/domain/fabric-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/domain/a-status";
import { cn } from "@/lib/utils";
import { Phone, Mail, Building2 } from "lucide-react";

type Contact = {
  id: string;
  customer: string;
  customerCode: string;
  name: string;
  title: string;        // 总经理/采购/技术/品控
  dept: string;
  phone: string;
  email: string;
  role: "决策" | "采购" | "技术" | "品控" | "财务";
  lastTouchAt: string;
  touchCount: number;
  hasWechat: boolean;
};

const MOCK: Contact[] = [
  { id: "1", customer: "乾盛", customerCode: "GH-QS-007", name: "陈总", title: "总经理",     dept: "总经办", phone: "138-xxxx-9921", email: "chen@qiansheng.cn", role: "决策", lastTouchAt: "今 09:14", touchCount: 23, hasWechat: true },
  { id: "2", customer: "乾盛", customerCode: "GH-QS-007", name: "小张",   title: "采购经理",    dept: "采购部", phone: "138-xxxx-9922", email: "zhang@qiansheng.cn", role: "采购", lastTouchAt: "昨 16:48", touchCount: 41, hasWechat: true },
  { id: "3", customer: "弘大", customerCode: "GH-HD-002", name: "马经理", title: "运营总监",    dept: "运营部", phone: "189-xxxx-1102", email: "ma@hongda.cn", role: "决策", lastTouchAt: "今 11:30", touchCount: 18, hasWechat: true },
  { id: "4", customer: "弘大", customerCode: "GH-HD-002", name: "李设计", title: "主设计师",   dept: "设计部", phone: "189-xxxx-1103", email: "li@hongda.cn", role: "技术", lastTouchAt: "3 天前", touchCount: 9, hasWechat: false },
  { id: "5", customer: "鸣笛", customerCode: "GH-MD-019", name: "丁工",   title: "技术负责人",  dept: "技术部", phone: "150-xxxx-7791", email: "ding@mingdi.cn", role: "技术", lastTouchAt: "8 天前", touchCount: 4, hasWechat: false },
  { id: "6", customer: "一针坊", customerCode: "GH-YX-031", name: "亚明",   title: "创始人",     dept: "—",  phone: "138-xxxx-3308", email: "yaming@yizhenfang.cn", role: "决策", lastTouchAt: "今 09:00", touchCount: 27, hasWechat: true },
  { id: "7", customer: "巧岛", customerCode: "GH-QD-044", name: "张设计", title: "设计师",      dept: "设计部", phone: "139-xxxx-5522", email: "zhang@qiaodao.cn", role: "技术", lastTouchAt: "今 17:00", touchCount: 6, hasWechat: true },
  { id: "8", customer: "霞飞", customerCode: "GH-XF-088", name: "周总",   title: "总经理",     dept: "总经办", phone: "186-xxxx-2287", email: "zhou@xiafei.cn", role: "决策", lastTouchAt: "62 天前", touchCount: 12, hasWechat: true },
];

const ROLE_TONE = {
  决策: "primary",
  采购: "info",
  技术: "success",
  品控: "warn",
  财务: "neutral",
} as const;

const FILTERS = ["全部", "决策", "采购", "技术", "品控", "财务"] as const;

export default function ContactsPage() {
  const [q, setQ] = useState("");
  const [pf, setPf] = useState<(typeof FILTERS)[number]>("全部");
  const [hideStale, setHideStale] = useState(false);

  const rows = useMemo(() => {
    return MOCK.filter((c) => {
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
  }, [q, pf, hideStale]);

  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 顶部 唛头 */}
        <div className="mb-6">
          <FabricLabel
            docNo="CONTACTS-2026-07-21"
            shortCode="qs-app"
            season="本周"
            composition={`${MOCK.length} 位联系人 · ${MOCK.filter((c) => c.role === "决策").length} 位决策人 · ${MOCK.filter((c) => c.lastTouchAt.includes("天前") && !c.lastTouchAt.includes("1 天")).length} 人长期未联系`}
            specs={[
              { label: "联系人", value: MOCK.length, mono: true },
              { label: "决策人", value: MOCK.filter((c) => c.role === "决策").length, mono: true },
              { label: "微信号", value: MOCK.filter((c) => c.hasWechat).length, mono: true },
            ]}
            prices={[
              { label: "未联系 > 7d", value: MOCK.filter((c) => c.lastTouchAt.includes("天前")).length, mono: true },
            ]}
          />
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)] mb-1.5">
              CRM · contacts
            </p>
            <h1 className="font-display text-[28px] font-medium tracking-tight">联系人</h1>
            <p className="mt-1.5 text-[13px] text-[var(--ink-dim)] max-w-[520px]">
              每个客户多名对接人：老板/采购/技术/品控。一个客户离开，全员联系不断。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md">批量导入</Button>
            <Button variant="default" size="md">+ 新联系人</Button>
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
                  "h-9 px-3 rounded-md text-[12px] transition-colors font-mono tracking-tight",
                  pf === f
                    ? "bg-[var(--ink)] text-[var(--background)]"
                    : "text-[var(--ink-dim)] hover:bg-[var(--accent)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-2 text-[12px] text-[var(--ink-dim)] cursor-pointer">
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
          <div className="grid grid-cols-[40px_140px_60px_90px_80px_140px_140px_60px_80px_50px_60px] gap-2 px-3 py-2.5 bg-[var(--secondary)]/40 border-b border-[var(--hairline)] text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-mute)]">
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
              <div className="font-mono text-[11px] text-[var(--ink-dim)] truncate">
                {c.customer} <span className="text-[var(--ink-mute)]">{c.customerCode}</span>
              </div>
              <div className="text-[13px] font-medium text-[var(--ink)]">{c.name}</div>
              <div className="text-[12px] text-[var(--ink-dim)] truncate">{c.title}</div>
              <div className="text-[11px] text-[var(--ink-mute)] truncate">{c.dept}</div>
              <div className="font-mono text-[11px] text-[var(--ink-dim)] truncate">{c.phone}</div>
              <div className="font-mono text-[11px] text-[var(--ink-dim)] truncate underline decoration-[var(--hairline-strong)]">{c.email}</div>
              <div>
                <Badge tone={ROLE_TONE[c.role]} size="sm">{c.role}</Badge>
              </div>
              <div className="text-right font-mono tnum text-[12px] text-[var(--ink)]">{c.touchCount}</div>
              <div className="text-[11px] font-mono text-[var(--ink-mute)]">{c.lastTouchAt}</div>
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
