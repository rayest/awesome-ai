import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 与 admin-web 一致的 cn() */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 价格格式化：固定保留 2 位小数，带千分位 */
export function fmtPrice(n: number, withSign = false): string {
  if (Number.isNaN(n)) return "—";
  const sign = withSign && n > 0 ? "+" : "";
  return (
    sign +
    n.toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** 数字简短显示：1200 → 1.2k */
export function fmtCompact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1) + "k";
  return (n / 10000).toFixed(1) + "w";
}
