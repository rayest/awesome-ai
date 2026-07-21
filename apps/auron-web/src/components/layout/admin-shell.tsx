import Link from "next/link";
import { LogoMark } from "@/components/layout/logo-mark";

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
 */

const nav = [
  { group: "客户", items: [
    { href: "/crm/customers", label: "客户档案", icon: "Users" },
    { href: "/crm/followups", label: "跟进看板", icon: "BellRing" },
  ]},
  { group: "工坊", items: [
    { href: "/orders/sample-notices", label: "打样通知", icon: "Scissors" },
    { href: "/orders/sample-workorders", label: "打样工艺", icon: "Layers" },
    { href: "/orders/quotations", label: "报价", icon: "Receipt" },
    { href: "/products", label: "产品主数据", icon: "Package" },
  ]},
  { group: "字典", items: [
    { href: "/dictionary/materials", label: "物料 / 纱线", icon: "Wheat" },
    { href: "/dictionary/machines", label: "机型配置", icon: "Cog" },
  ]},
  { group: "管理", items: [
    { href: "/settings/team", label: "员工 / 角色", icon: "UserCog" },
    { href: "/settings/audit", label: "审计日志", icon: "ScrollText" },
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
            <span className="font-display text-[15px] font-medium tracking-tight">Auron</span>
            <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)] border border-[var(--hairline-strong)] px-1.5 py-0.5 rounded">
              qiansheng
            </span>
          </Link>
          <TenantSwitcher />
        </div>

        <div className="flex items-center gap-1">
          <button
            className="hidden md:flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--hairline-strong)] hover:border-[var(--primary)] transition-colors text-[12px] text-[var(--ink-mute)]"
          >
            <span>⌘K</span>
            <span className="hidden lg:inline">搜客户 / 工单 / 操作</span>
          </button>
          <button className="w-8 h-8 rounded-md hover:bg-[var(--accent)] flex items-center justify-center text-[var(--ink-dim)]">
            <span className="sr-only">通知</span>
            <span className="block w-1.5 h-1.5 rounded-full bg-[var(--primary)] absolute ml-3 -mt-3" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--background)] flex items-center justify-center text-[11px] font-mono">
            LB
          </div>
        </div>
      </header>

      {/* —— 二级 —— */}
      <div className="grid grid-cols-[200px_1fr_96px] min-h-0">
        {/* —— 左导航 —— */}
        <aside className="border-r border-[var(--hairline)] bg-[var(--card)]/50 py-4 overflow-y-auto">
          {nav.map((section) => (
            <div key={section.group} className="mb-4">
              <p className="px-4 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">
                {section.group}
              </p>
              <ul>
                {section.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="flex items-center gap-2.5 px-4 h-8 text-[13px] text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--accent)] border-l-2 border-transparent hover:border-[var(--primary)] transition-colors"
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

        {/* —— 主内容 —— */}
        <main className="overflow-auto bg-[var(--background)]">
          {children}
        </main>

        {/* —— 操作岛 —— */}
        <aside className="border-l border-[var(--hairline)] bg-[var(--card)]/50 py-4 flex flex-col items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-mute)] rotate-180 [writing-mode:vertical-rl] mb-4">
            ACTIONS
          </span>
          <button className="w-12 h-12 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent-foreground)] transition-colors flex items-center justify-center text-[10px] font-medium leading-tight">
            派单
          </button>
          <button className="w-12 h-12 rounded-md border border-[var(--hairline-strong)] text-[var(--ink-dim)] hover:bg-[var(--accent)] transition-colors flex items-center justify-center text-[10px] font-medium leading-tight">
            复制
            <br />
            上版
          </button>
          <button className="w-12 h-12 rounded-md border border-[var(--hairline-strong)] text-[var(--ink-dim)] hover:bg-[var(--accent)] transition-colors flex items-center justify-center text-[10px] font-medium leading-tight">
            导出
            <br />
            PDF
          </button>
        </aside>
      </div>
    </div>
  );
}

function TenantSwitcher() {
  return (
    <button className="flex items-center gap-2 h-8 px-3 rounded-md border border-[var(--hairline-strong)] hover:border-[var(--primary)] hover:bg-[var(--accent)] transition-colors">
      <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
      <span className="text-[12px] font-medium">乾盛服饰</span>
      <span className="font-mono text-[10px] text-[var(--ink-mute)]">qs-app</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[var(--ink-mute)]">
        <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
