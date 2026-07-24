"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  BellRing,
  Cog,
  Contact,
  Droplets,
  Inbox,
  Layers,
  Layers3,
  LayoutDashboard,
  ListChecks,
  Menu,
  Maximize2,
  Package,
  Puzzle,
  Receipt,
  Ruler,
  Scissors,
  Search,
  ScrollText,
  Tag,
  User,
  UserCog,
  Users,
  Wheat,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/layout/logo-mark";
import { useDrawerPresentation } from "@/components/layout/route-presentation";
import {
  useCurrentUser,
  setCurrentUser,
  useCurrentTenant,
  setCurrentTenant,
  TENANTS,
  DEMO_USERS,
  useActivities,
  getRoleLabel,
} from "@/lib/demo-state";

/**
 * AdminShell — ERP 主壳
 *
 * 2 区：
 *  ┌──────────────────────────────────────────┐
 *  │ 顶栏（48px，tenant 切换 / 通知 / 用户）      │
 *  ├────────┬──────────────────────────┤
 *  │ 左导航 │  主内容                  │
 *  │ 200px  │  自适应                  │
 *  └────────┴──────────────────────────┘
 *
 * 演示态增强：
 *   - TenantSwitcher 二级下拉（可在 乾盛/弘大/一针坊 间切）
 *   - Whoami 加角色切换下拉（演示态）
 *   - 顶栏铃铛 → /inbox + 未读红点
 *   - 全局顶部"Mock 模式"横幅（首次加载）
 */

const nav = [
  { group: "总览", items: [
    { href: "/dashboard",   label: "经营总览",       icon: "LayoutDashboard" },
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

type PageHeaderMeta = {
  label: string;
  value: ReactNode;
};

type AdminShellProps = {
  children: ReactNode;
  pageTitle?: string;
  pageKicker?: string;
  pageDescription?: string;
  pageActions?: ReactNode;
  pageMeta?: PageHeaderMeta[];
};

export function AdminShell({
  children,
  pageTitle,
  pageDescription,
  pageActions,
  pageMeta,
}: AdminShellProps) {
  const inDrawer = useDrawerPresentation();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => setMobileNavOpen(false), [pathname]);
  const activeNav = getActiveNav(pathname);
  const showPageHeader = Boolean(pageTitle || pageDescription || pageActions || pageMeta?.length);

  if (inDrawer) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="grid min-h-screen grid-rows-[72px_1fr] overflow-hidden bg-[var(--background)]">
        {/* —— 顶栏 —— */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--hairline)] bg-[var(--card)] px-4 lg:px-7">
          <div className="flex min-w-0 items-center gap-4 lg:w-[245px]">
            <button
              type="button"
              aria-label={mobileNavOpen ? "关闭导航" : "打开导航"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ink-dim)] hover:bg-[var(--secondary)] lg:hidden"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
              <LogoMark size={26} />
              <span className="font-display text-[19px] font-semibold tracking-[-0.03em]">
                AURON
              </span>
            </Link>
            <div className="hidden md:block lg:hidden xl:block"><TenantSwitcher /></div>
          </div>

          <label className="mx-6 hidden h-11 max-w-[460px] flex-1 items-center gap-3 rounded-xl bg-[var(--secondary)] px-4 text-[var(--ink-mute)] lg:flex">
            <Search className="h-4 w-4 shrink-0 text-[var(--ink)]" />
            <span className="sr-only">全局搜索</span>
            <input
              type="search"
              placeholder="搜索客户、报价、打样单..."
              className="w-full bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)]"
            />
          </label>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Whoami />
          </div>
        </header>

        <div className="grid min-h-0 lg:grid-cols-[245px_minmax(0,1fr)]">
          <aside className="hidden overflow-y-auto border-r border-[var(--hairline)] bg-[var(--card)] px-3 py-5 lg:block">
            {nav.map((section) => (
              <div key={section.group} className="mb-5">
                <p className="px-3 pb-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--ink-mute)]">
                  {section.group}
                </p>
                <ul className="space-y-1">
                  {section.items.map((it) => (
                    <NavItem key={it.href} item={it} active={isActive(pathname, it.href)} />
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          {mobileNavOpen && (
            <div className="fixed inset-0 top-[72px] z-40 lg:hidden">
              <button
                type="button"
                aria-label="关闭导航"
                className="absolute inset-0 bg-black/25 backdrop-blur-sm"
                onClick={() => setMobileNavOpen(false)}
              />
              <aside className="relative h-full w-[280px] overflow-y-auto border-r border-[var(--hairline)] bg-[var(--card)] px-3 py-5 shadow-2xl">
                {nav.map((section) => (
                  <div key={section.group} className="mb-5">
                    <p className="px-3 pb-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--ink-mute)]">{section.group}</p>
                    <ul className="space-y-1">
                      {section.items.map((it) => (
                        <NavItem key={it.href} item={it} active={isActive(pathname, it.href)} />
                      ))}
                    </ul>
                  </div>
                ))}
              </aside>
            </div>
          )}

          <section className="grid min-h-0 grid-rows-[auto_1fr]">
            {showPageHeader && (
              <div className="bg-[var(--background)] px-4 pb-3 pt-6 lg:px-7 lg:pb-4 lg:pt-7">
                <nav className="mb-2 flex items-center text-[13px] font-medium text-[var(--ink-mute)]">
                  <span>{activeNav?.group ?? "工作台"}</span>
                </nav>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    {pageTitle && (
                      <h1 className="truncate text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[var(--ink)] lg:text-[34px]">
                        {pageTitle}
                      </h1>
                    )}
                    {pageDescription && (
                      <p className="mt-1.5 max-w-[760px] text-[14px] leading-6 text-[var(--ink-dim)]">
                        {pageDescription}
                      </p>
                    )}
                  </div>

                  {pageActions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {pageActions}
                    </div>
                  )}
                </div>

                {pageMeta?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pageMeta.map((item) => (
                      <span
                        key={item.label}
                        className="inline-flex h-8 items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--card)] px-3 text-[13px] text-[var(--ink-dim)]"
                      >
                        <span className="text-[var(--ink-mute)]">{item.label}</span>
                        <span className="font-semibold text-[var(--ink)]">{item.value}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            <main className="overflow-auto bg-[var(--background)]">
              {children}
            </main>
          </section>
        </div>
      </div>
    </div>
  );
}

function getActiveNav(pathname: string) {
  for (const section of nav) {
    const item = section.items.find((it) => isActive(pathname, it.href));
    if (item) return { group: section.group, label: item.label };
  }
  return null;
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  item,
  active,
}: {
  item: { href: string; label: string; icon: string };
  active: boolean;
}) {
  const Icon = NAV_ICONS[item.icon] ?? LayoutDashboard;

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={
          "flex h-11 items-center gap-3 rounded-xl border-l-[3px] px-3 text-[15px] transition-colors " +
          (active
            ? "border-[var(--ink)] bg-[var(--secondary)] font-semibold text-[var(--ink)]"
            : "border-transparent text-[var(--ink-dim)] hover:bg-[var(--secondary)] hover:text-[var(--ink)]")
        }
      >
        <Icon className={active ? "h-[18px] w-[18px] text-[var(--ink)]" : "h-[18px] w-[18px] text-[var(--ink-dim)]"} strokeWidth={1.8} />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

const NAV_ICONS: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  BellRing,
  Cog,
  Contact,
  Droplets,
  Inbox,
  Layers,
  Layers3,
  LayoutDashboard,
  ListChecks,
  Maximize2,
  Package,
  Puzzle,
  Receipt,
  Ruler,
  Scissors,
  ScrollText,
  Tag,
  User,
  UserCog,
  Users,
  Wheat,
};

/* ── Tenant 切换器（二级菜单） ── */
function TenantSwitcher() {
  const [open, setOpen] = useState(false);
  const tenant = useCurrentTenant();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex h-10 items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--card)] px-3 transition-colors hover:bg-[var(--secondary)]"
      >
        <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
        <span className="text-[14px] font-medium">{tenant.name}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={open ? "rotate-180 transition-transform text-[var(--primary)]" : "text-[var(--ink-mute)] transition-transform"}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-50 w-[220px] overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--card)] shadow-xl">
          {TENANTS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setCurrentTenant(t.key); setOpen(false); }}
              className={
                "flex w-full items-center gap-2 px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-[var(--secondary)] " +
                (tenant.key === t.key ? "bg-[var(--accent)] font-medium" : "text-[var(--ink-dim)]")
              }
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.tone === "primary" ? "var(--primary)" : t.tone === "info" ? "var(--info)" : "var(--success)" }} />
              <span className="flex-1">{t.name}</span>
              {tenant.key === t.key && <span className="text-[14px] font-semibold text-[var(--success)]">✓</span>}
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
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--hairline)] bg-[var(--card)] text-[var(--ink)] transition-colors hover:bg-[var(--secondary)]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[var(--destructive)] px-1 text-[10px] font-semibold text-white">
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
        className="flex h-10 items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--card)] px-1.5 transition-colors hover:bg-[var(--secondary)] min-[430px]:px-2.5"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)] text-[13px] font-semibold text-white">
          {me.initials}
        </span>
        <div className="hidden flex-col items-start leading-tight min-[430px]:flex">
          <span className="text-[14px] font-medium text-[var(--ink)]">{me.name}</span>
          <span className="text-[12px] text-[var(--ink-mute)]">
            {getRoleLabel(me.role)} · {me.dept}
          </span>
        </div>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className={(open ? "rotate-180 " : "") + "hidden transition-transform text-[var(--ink-mute)] min-[430px]:block"}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[260px] overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--card)] shadow-xl">
          <p className="px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--ink-mute)] bg-[var(--secondary)]/40 border-b border-[var(--hairline)]">
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
                <p className="text-[12px] text-[var(--ink-mute)]">
                  {getRoleLabel(u.role)} · {u.dept}
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
            打开我的工作台 →
          </Link>
        </div>
      )}
    </div>
  );
}
