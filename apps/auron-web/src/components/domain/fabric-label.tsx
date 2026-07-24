import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * FabricLabel — 页面级业务摘要条。
 *
 * 原先是强品牌化的黑色唛头卡。实际 ERP 高频页面更需要快速进入列表、
 * 表单和异常处理，因此这里收敛为轻量、可扫描的业务状态条。
 */

export type FabricLabelItem = {
  label: string;
  value: string | number;
  mono?: boolean;
  hint?: string;
};

export type FabricLabelProps = {
  /** 主文档号，如 "SMPL-2026-0317-AURON" */
  docNo: string;
  /** 副标识，如客户代码 "GH-QS-007" */
  shortCode?: string;
  /** 季款 / 季度标识 */
  season?: string;
  /** 成分行（自由字符串） */
  composition?: string;
  /** 关键物理参数 */
  specs?: FabricLabelItem[];
  /** 价格快照 */
  prices?: FabricLabelItem[];
  /** 交期 / 状态 */
  delivery?: FabricLabelItem[];
  /** 右侧 main ID 块（如二维码占位） */
  rightSlot?: ReactNode;
  className?: string;
};

export function FabricLabel({
  docNo,
  shortCode,
  season,
  composition,
  specs = [],
  prices = [],
  delivery = [],
  rightSlot,
  className,
}: FabricLabelProps) {
  const metrics = [...specs, ...prices, ...delivery].filter((item) => !isTechnicalMetric(item));
  const summary = cleanBusinessSummary(composition);

  return (
    <section
      className={cn(
        "rounded-md border border-[var(--hairline)] bg-[var(--card)]",
        "px-4 py-3 shadow-[0_1px_0_rgba(18,24,38,0.02)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[14px] font-medium text-[var(--ink)] tracking-tight">
              {docNo}
            </span>
            {shortCode && <MetaPill>{shortCode}</MetaPill>}
            {season && <MetaPill>{season}</MetaPill>}
          </div>
          {summary && (
            <p className="mt-1 text-[14px] text-[var(--ink-dim)] truncate">
              {summary}
            </p>
          )}
        </div>

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {metrics.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          {metrics.map((it, i) => (
            <MetricItem key={`${it.label}-${i}`} item={it} />
          ))}
        </div>
      )}
    </section>
  );
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-[var(--hairline)] bg-[var(--secondary)] px-1.5 py-0.5 text-[12px] text-[var(--ink-mute)]">
      {children}
    </span>
  );
}

function cleanBusinessSummary(value?: string) {
  if (!value) return value;
  return value
    .split(/数据源|crm_|底表|字段对齐|表关系|关联关系/)
    [0]
    .trim()
    .replace(/[·。；;,\s]+$/, "");
}

function isTechnicalMetric(item: FabricLabelItem) {
  const text = `${item.label} ${item.value}`;
  return /数据源|字段对齐|底表|表关系|关联关系|crm_|link|lookup|formula|auto_number|RBAC|权限矩阵/.test(text);
}

function MetricItem({ item }: { item: FabricLabelItem }) {
  return (
    <div className="min-w-0 rounded bg-[var(--secondary)]/45 px-3 py-2">
      <p className="truncate text-[12px] text-[var(--ink-mute)]">
        {item.label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-[15px] font-medium text-[var(--ink)]",
          item.mono && "font-mono tnum"
        )}
        title={String(item.value)}
      >
        {item.value}
      </p>
    </div>
  );
}
