/**
 * LogoMark — 圆机俯视 + 针眼
 *
 * 灵感：针织核心机械「圆机」的俯视简笔 —— 圆 + 中央针眼 + 围绕的纱线。
 */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
    >
      {/* 圆机外环 */}
      <circle
        cx="11"
        cy="11"
        r="9"
        stroke="var(--ink)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* 圆机内环（机针轨道） */}
      <circle
        cx="11"
        cy="11"
        r="6"
        stroke="var(--ink)"
        strokeWidth="0.8"
        strokeDasharray="1.5 2"
        fill="none"
        opacity="0.5"
      />
      {/* 中心针眼 */}
      <circle cx="11" cy="11" r="2" fill="var(--primary)" />
      {/* 围绕的纱线点 */}
      <circle cx="11" cy="2" r="0.6" fill="var(--ink)" />
      <circle cx="20" cy="11" r="0.6" fill="var(--ink)" />
      <circle cx="11" cy="20" r="0.6" fill="var(--ink)" />
      <circle cx="2" cy="11" r="0.6" fill="var(--ink)" />
    </svg>
  );
}
