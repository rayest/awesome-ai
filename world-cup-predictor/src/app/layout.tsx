import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "世界杯淘汰赛预测台",
  description: "2026 世界杯淘汰赛对阵、比分预测与证据面板。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
