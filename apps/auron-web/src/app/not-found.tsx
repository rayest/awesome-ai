import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/layout/admin-shell";

export default function NotFound() {
  return (
    <AdminShell>
      <div className="px-8 py-24 mx-auto max-w-[720px] text-center">
        <div className="font-mono text-[120px] leading-none font-semibold text-[var(--primary)] mb-2">
          404
        </div>
        <h1 className="font-display text-[24px] font-medium tracking-tight text-[var(--ink)] mb-3">
          这个路由不存在
        </h1>
        <p className="text-[14px] text-[var(--ink-dim)] max-w-[420px] mx-auto mb-8 leading-relaxed">
          检查链接是不是完整。常见的导航见左侧菜单。
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/customers">
            <Button variant="default" size="md">回客户档案</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="md">所有模块</Button>
          </Link>
        </div>

        <div className="mt-12 text-left text-[14px] font-mono space-y-1 border-t border-[var(--hairline)] pt-6 max-w-[480px] mx-auto">
          <p className="text-[var(--ink-mute)] uppercase tracking-[0.18em] mb-2">
            你可能想去：
          </p>
          {[
            { href: "/customers",               label: "客户档案" },
            { href: "/orders/sample-notices",   label: "打样通知" },
            { href: "/orders/sample-workorders",label: "打样工艺" },
            { href: "/orders/quotations",      label: "报价" },
            { href: "/settings/audit",         label: "审计日志" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-[var(--ink)] hover:text-[var(--primary)] hover:underline"
            >
              → {l.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
