import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartHub - 知识整理与交互学习",
  description: "个人知识库，学习笔记整理与分享",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
