"use client";

import Link from "next/link";
import { X } from "lucide-react";

/**
 * URL Filter 工具 — 跨表过滤参数（继承自 Dashboard / 详情页跳转）
 *
 * 用法：
 *
 *   // A · 服务端接收 searchParams
 *   export default function Page({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
 *     const sp = use(searchParams);
 *     const [filter, setFilter] = useState(sp.customer ?? "");
 *
 *   // B · 构造带参数的 URL
 *   const url = withQuery("/orders/sample-notices", { customer: "CUST-QS-001" });
 *
 *   // C · 显示"已过滤"提示卡
 *   <FromQueryBadge baseUrl="/customers" params={{ type: "重要" }} />
 *
 * 命名约定：
 *   customer = 客户 ID (CUST-XXX-NNN)
 *   contact  = 联系人 ID (ct-xxx)
 *   master   = 前道师傅姓名（demo 用）
 *   yarnName = 纱线名（demo 用）
 *   type     = 类型 select 值
 *   tag      = 标签值
 *   status   = 状态 select 值
 *   category = 类目
 *   machine  = 机型
 *   styleNo  = 款号
 */

export type FilterParams = Record<string, string | number | undefined | null>;

/**
 * 构造带 query 的 URL
 */
export function withQuery(baseUrl: string, params: FilterParams): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

/**
 * 把过滤参数转成"来源摘要"——给页面顶部显示"我从哪儿来"
 */
export function describeSource(params: FilterParams): string | null {
  const entries = Object.entries(params).filter(([_, v]) => v != null && v !== "");
  if (entries.length === 0) return null;

  const labels: Record<string, string> = {
    customer:  "客户",
    contact:   "联系人",
    master:    "师傅",
    yarnName:  "纱线",
    supplier:  "供应商",
    type:      "类型",
    tag:       "标签",
    status:    "状态",
    category:  "类目",
    machine:   "机型",
    styleNo:   "款号",
  };

  return entries
    .map(([k, v]) => `${labels[k] ?? k}：${v}`)
    .join(" · ");
}

/**
 * "已过滤"提示卡
 */
export function FromQueryBadge({
  baseUrl,
  params,
  className = "",
}: {
  baseUrl: string;
  params: FilterParams;
  className?: string;
}) {
  const text = describeSource(params);
  if (!text) return null;

  const clearAll = withQuery(baseUrl, {});

  return (
    <div className={`flex items-center gap-2 font-mono text-[12px] ${className}`}>
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--primary)]/20">
        <span className="font-medium uppercase tracking-[0.18em] text-[10px]">已过滤</span>
        <span>{text}</span>
      </span>
      <Link
        href={clearAll}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--accent)] transition-colors"
        title="清除所有过滤"
      >
        <X className="w-3 h-3" />
        清除
      </Link>
    </div>
  );
}
