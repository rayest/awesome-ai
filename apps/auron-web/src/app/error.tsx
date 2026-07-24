"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/layout/admin-shell";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reportedAt, setReportedAt] = useState("");

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[App Error]", error);
    setReportedAt(new Date().toISOString().slice(0, 19).replace("T", " "));
  }, [error]);

  return (
    <AdminShell>
      <div className="px-8 py-24 mx-auto max-w-[720px] text-center">
        <div className="font-mono text-[14px] uppercase tracking-[0.3em] text-[var(--primary)] mb-3 border border-[var(--primary)] inline-block px-2 py-0.5 rounded">
          错误
        </div>
        <h1 className="font-display text-[40px] font-medium tracking-tight text-[var(--ink)] mb-3">
          系统挂了
        </h1>
        <p className="text-[14px] text-[var(--ink-dim)] max-w-[480px] mx-auto mb-3 leading-relaxed">
          这个页面崩了。技术团队已收到通知，工程师正在抢修。
        </p>
        {error.message && (
          <p className="font-mono text-[14px] text-[var(--destructive)] bg-[var(--secondary)]/40 inline-block px-3 py-1.5 rounded mb-6 max-w-[480px] truncate">
            {error.message}
          </p>
        )}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="md" onClick={() => reset()}>
            重试
          </Button>
          <Link href="/">
            <Button variant="default" size="md">回到首页</Button>
          </Link>
        </div>

        <div className="mt-12 border-t border-[var(--hairline)] pt-6 grid grid-cols-3 gap-4 text-left text-[14px] font-mono">
          <div>
            <p className="text-[var(--ink-mute)] uppercase tracking-[0.18em]">报错时间</p>
            <p className="text-[var(--ink)] mt-0.5">{reportedAt || "正在记录…"}</p>
          </div>
          <div>
            <p className="text-[var(--ink-mute)] uppercase tracking-[0.18em]">错误码</p>
            <p className="text-[var(--ink)] mt-0.5">{error.digest ?? "—"}</p>
          </div>
          <div>
            <p className="text-[var(--ink-mute)] uppercase tracking-[0.18em]">建议</p>
            <p className="text-[var(--ink)] mt-0.5">F5 重试或联系技术</p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
