import { cn } from "@/lib/utils";

/**
 * FabricLabel — Auron 的唯一品牌签名元素。
 *
 * 灵感：服装上缝制的洗涤唛头（fabric care label）。
 * 用法：每张「工艺文档」（打样通知 / 工艺单 / 报价单 / 产品主数据）顶部。
 *
 * 设计语言：
 *  - 深靛底（ink 色）+ 织带纹理（1px 横向条纹 hairline）
 *  - 全部数字 / SKU 用 mono 字体（工业仪表感）
 *  - 白色文字 + 印泥红 accent（与 shadcn 主题一致）
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
  rightSlot?: React.ReactNode;
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
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)]",
        "bg-[var(--ink)] text-[var(--background)]",
        "care-label-band",
        "border border-[var(--hairline-strong)]",
        className
      )}
    >
      {/* 织带纹理 */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 4px)",
        }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_160px] gap-4 px-6 py-5">
        <div className="space-y-2.5">
          {/* 主编号行 */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-[22px] leading-none tracking-tight">
              {docNo}
            </span>
            {shortCode && (
              <span className="font-mono text-[12px] text-[var(--accent)] tracking-wider">
                {shortCode}
              </span>
            )}
            {season && (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)] border border-white/10 px-1.5 py-0.5">
                {season}
              </span>
            )}
          </div>

          {/* 成分 */}
          {composition && (
            <div className="font-mono text-[13px] text-[var(--bone-dim,#c9c5b8)] tracking-wide">
              {composition}
            </div>
          )}

          {/* 物理规格 */}
          {specs.length > 0 && (
            <FieldRow items={specs} variant="default" />
          )}

          {/* 价格快照 */}
          {prices.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <FieldRow items={prices} variant="price" />
            </div>
          )}

          {/* 交期 */}
          {delivery.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <FieldRow items={delivery} variant="default" />
            </div>
          )}
        </div>

        {/* 右侧 */}
        <div className="flex md:flex-col items-end md:items-center justify-center md:justify-center gap-2 md:border-l md:border-white/10 md:pl-4">
          {rightSlot ?? (
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">
                QR
              </div>
              <div className="mt-1 grid grid-cols-6 gap-[2px] w-16 h-16 mx-auto">
                {Array.from({ length: 36 }).map((_, i) => (
                  <span
                    key={i}
                    className="block w-full h-full"
                    style={{
                      background: i % 5 < 3 ? "white" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  items,
  variant,
}: {
  items: FabricLabelItem[];
  variant: "default" | "price";
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-baseline gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-mute)] shrink-0">
            {it.label}
          </span>
          <span
            className={cn(
              "text-[13px] leading-none",
              it.mono && "font-mono tnum",
              variant === "price" &&
                "text-[15px] font-mono tnum text-white font-medium"
            )}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}
