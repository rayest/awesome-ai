import { AdminShell } from "@/components/layout/admin-shell";

/** Suspense fallback - 在数据加载时显示骨架 */
export default function Loading() {
  return (
    <AdminShell>
      <div className="px-8 py-8 mx-auto max-w-[1280px]">
        {/* 头部骨架 */}
        <div className="h-[120px] rounded-md bg-[var(--secondary)] animate-pulse mb-6" />

        {/* 工具栏骨架 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-[320px] rounded-md bg-[var(--secondary)] animate-pulse" />
          <div className="h-9 w-20 rounded-md bg-[var(--secondary)] animate-pulse" />
          <div className="ml-auto h-9 w-24 rounded-md bg-[var(--secondary)] animate-pulse" />
        </div>

        {/* 表格骨架 */}
        <div className="border border-[var(--hairline)] rounded-md overflow-hidden bg-[var(--card)]">
          <div className="h-9 bg-[var(--secondary)]/40 border-b border-[var(--hairline)]" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-10 border-b border-[var(--hairline)] last:border-b-0 px-3 flex items-center gap-3"
            >
              <div className="h-3 w-1/4 rounded bg-[var(--secondary)] animate-pulse" />
              <div className="h-3 w-1/6 rounded bg-[var(--secondary)] animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-[var(--secondary)] animate-pulse" />
              <div className="h-3 w-1/6 rounded bg-[var(--secondary)] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
