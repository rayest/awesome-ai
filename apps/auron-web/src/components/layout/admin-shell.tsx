"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "@/components/layout/logo-mark";
import {
  useCurrentUser,
  setCurrentUser,
  useCurrentTenant,
  setCurrentTenant,
  TENANTS,
  DEMO_USERS,
  useActivities,
} from "@/lib/demo-state";

/**
 * AdminShell — ERP 主壳
 *
 * 3 区：
 *  ┌──────────────────────────────────────────┐
 *  │ 顶栏（48px，tenant 切换 / ⌘K / 通知 / 用户） │
 *  ├────────┬──────────────────────────┬───────┤
 *  │ 左导航 │  主内容                  │ 操作 │
 *  │ 200px  │  自适应                 │ 岛    │
 *  │        │                          │ 80px │
 *  └────────┴──────────────────────────┴───────┘
 *
 * 演示态增强：
 *   - TenantSwitcher 二级下拉（可在 乾盛/弘大/一针坊 间切）
 *   - Whoami 加角色切换下拉（演示态）
 *   - 顶栏铃铛 → /inbox + 未读红点
 *   - 全局顶部"Mock 模式"横幅（首次加载）
 */

const nav = [
  { group: "总览", items: [
    { href: "/dashboard",   label: "Dashboard",     icon: "LayoutDashboard" },
    { href: "/me",          label: "我的工作台",     icon: "User" },
  ]},
  { group: "客户", items: [
    { href: "/customers",    label: "客户档案",  icon: "Users" },
    { href: "/crm/followups", label: "跟进看板",  icon: "BellRing" },
    { href: "/crm/contacts",  label: "联系人",    icon: "Contact" },
    { href: "/inbox",        label: "通知中心",  icon: "Inbox" },
  ]},
  { group: "工坊", items: [
    { href: "/orders/sample-notices",   label: "打样通知",  icon: "Scissors" },
    { href: "/orders/sample-workorders", label: "打样工艺",  icon: "Layers" },
    { href: "/orders/quotations",       label: "报价",      icon: "Receipt" },
    { href: "/products",                label: "产品主数据", icon: "Package" },
  ]},
  { group: "字典", items: [
    { href: "/dictionary/materials",    label: "物料 / 纱线",    icon: "Wheat" },
    { href: "/dictionary/machines",     label: "机型配置",      icon: "Cog" },
    { href: "/dictionary/operations",   label: "工序字典",      icon: "ListChecks" },
    { href: "/dictionary/dyeings",      label: "染色工艺",      icon: "Droplets" },
    { href: "/dictionary/parts",        label: "测量部位",      icon: "Ruler" },
    { href: "/dictionary/components",   label: "部件配置",      icon: "Puzzle" },
    { href: "/dictionary/trims",        label: "辅料配置",      icon: "Tag" },
    { href: "/dictionary/sizes",        label: "尺码配置",      icon: "Maximize2" },
    { href: "/dictionary/sample-types", label: "样品种类",      icon: "Layers3" },
  ]},
  { group: "管理", items: [
    { href: "/settings/team",  label: "员工 / 角色", icon: "UserCog" },
    { href: "/settings/audit", label: "审计日志",   icon: "ScrollText" },
  ]},
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[48px_1fr] bg-[var(--background)]">
      {/* —— 顶栏 —— */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 border-b border-[var(--hairline)] bg-[var(--card)]/90 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <LogoMark />
            <span className="font-display text-[18px] font-medium tracking-tight">Auron</span>
            <span className="ml-1 font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] border border-[var(--hairline-strong)] px-1.5 py-0.5 rounded">
              qiansheng
            </span>
          </Link>
          <TenantSwitcher />
        </div>

        <div className="flex items-center gap-1">
          <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--hairline-strong)] hover:border-[var(--primary)] transition-colors text-[14px] text-[var(--ink-mute)]">
            <span>⌘K</span>
            <span className="hidden lg:inline">搜客户 / 工单 / 操作</span>
          </button>
          <NotificationBell />
          <Whoami />
        </div>
      </header>

      {/* —— 二级 —— */}
      <div className="grid grid-cols-[200px_1fr_96px] min-h-0">
        <aside className="border-r border-[var(--hairline)] bg-[var(--card)]/50 py-4 overflow-y-auto">
          {nav.map((section) => (
            <div key={section.group} className="mb-4">
              <p className="px-4 pb-1 font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">
                {section.group}
              </p>
              <ul>
                {section.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="flex items-center gap-2.5 px-4 h-8 text-[14px] text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--accent)] border-l-2 border-transparent hover:border-[var(--primary)] transition-colors"
                    >
                      <span className="w-4 h-4 rounded bg-[var(--hairline)] inline-block shrink-0" />
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main className="overflow-auto bg-[var(--background)]">
          {children}
        </main>

        <aside className="border-l border-[var(--hairline)] bg-[var(--card)]/50 py-4 flex flex-col items-center gap-2">
          <span className="font-mono text-[14px] uppercase tracking-[0.2em] text-[var(--ink-mute)] rotate-180 [writing-mode:vertical-rl] mb-4">
            ACTIONS
          </span>
          <button className="w-12 h-12 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent-foreground)] transition-colors flex items-center justify-center text-[14px] font-medium leading-tight">
            派单
          </button>
          <button className="w-12 h-12 rounded-md border border-[var(--hairline-strong)] text-[var(--ink-dim)] hover:bg-[var(--accent)] transition-colors flex items-center justify-center text-[14px] font-medium leading-tight">
            复制
            <br />
            上版
          </button>
          <button className="w-12 h-12 rounded-md border border-[var(--hairline-strong)] text-[var(--ink-dim)] hover:bg-[var(--accent)] transition-colors flex items-center justify-center text-[14px] font-medium leading-tight">
            导出
            <br />
            PDF
          </button>
        </aside>
      </div>
    </div>
  );
}

/* ── Tenant 切换器（二级菜单） ── */
function TenantSwitcher() {
  const [open, setOpen] = useState(false);
  const tenant = useCurrentTenant();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--hairline-strong)] hover:border-[var(--primary)] hover:bg-[var(--accent)] transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
        <span className="text-[14px] font-medium">{tenant.name}</span>
        <span className="font-mono text-[14px] text-[var(--ink-mute)]">{tenant.shortCode}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={open ? "rotate-180 transition-transform text-[var(--primary)]" : "text-[var(--ink-mute)] transition-transform"}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-9 left-0 z-50 w-[200px] border border-[var(--hairline)] rounded-md bg-[var(--card)] shadow-lg overflow-hidden">
          {TENANTS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setCurrentTenant(t.key); setOpen(false); }}
              className={
                "w-full flex items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-[var(--accent)] transition-colors " +
                (tenant.key === t.key ? "bg-[var(--accent)] font-medium" : "text-[var(--ink-dim)]")
              }
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.tone === "primary" ? "var(--primary)" : t.tone === "info" ? "var(--info)" : "var(--success)" }} />
              <span className="flex-1">{t.name}</span>
              {tenant.key === t.key && (
                <span className="font-mono text-[14px] text-[var(--primary)]">●</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 通知铃铛（跳 /inbox） ── */
function NotificationBell() {
  const { unread } = useActivities();
  return (
    <Link
      href="/inbox"
      title={unread > 0 ? `${unread} 条未读` : "通知中心"}
      className="relative w-8 h-8 rounded-md hover:bg-[var(--accent)] flex items-center justify-center text-[var(--ink-dim)]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-[14px] font-mono font-medium flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}

/* ── Whoami：员工 + 角色切换器 ── */
function Whoami() {
  const [open, setOpen] = useState(false);
  const me = useCurrentUser();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        title="点击切换演示用户"
        className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-[var(--accent)] transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center text-[14px] font-mono font-medium">
          {me.initials}
        </span>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[14px] font-medium text-[var(--ink)]">{me.name}</span>
          <span className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            {me.role} · {me.dept}
          </span>
        </div>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className={open ? "rotate-180 transition-transform" : "transition-transform text-[var(--ink-mute)]"}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-9 right-0 z-50 w-[240px] border border-[var(--hairline)] rounded-md bg-[var(--card)] shadow-lg overflow-hidden">
          <p className="px-3 py-2 font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)] bg-[var(--secondary)]/40 border-b border-[var(--hairline)]">
            演示态 · 切换用户
          </p>
          {DEMO_USERS.map((u) => (
            <button
              key={u.key}
              onClick={() => { setCurrentUser(u.key); setOpen(false); }}
              className={
                "w-full flex items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-[var(--accent)] transition-colors " +
                (me.key === u.key ? "bg-[var(--accent)] font-medium" : "text-[var(--ink-dim)]")
              }
            >
              <span className="w-6 h-6 rounded-full bg-[var(--hairline-strong)] text-[var(--ink)] flex items-center justify-center text-[14px] font-mono shrink-0">
                {u.initials}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] truncate">{u.name}</p>
                <p className="font-mono text-[14px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
                  {u.role} · {u.dept}
                </p>
              </div>
              {me.key === u.key && <span className="text-[var(--primary)] text-[14px]">✓</span>}
            </button>
          ))}
          <Link
            href="/me"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 border-t border-[var(--hairline)] text-[14px] font-mono text-[var(--primary)] hover:bg-[var(--accent)] text-center"
          >
            打开 /me 工作台 →
          </Link>
        </div>
      )}
    </div>
  );
}
