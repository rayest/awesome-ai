import type { Metadata } from "next";
import "./globals.css";
import "./community.css";
import "./site.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

// 内容来自实时 API，不在构建阶段固化数据库快照。
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "知序 - AI 知识社区", template: "%s - 知序" },
  description: "把快速变化的 AI，整理成值得长期阅读的知识。",
  openGraph: { title: "知序 - AI 知识社区", description: "经过来源核验与编辑整理的 AI 文章、专题和播客。", type: "website", locale: "zh_CN" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body><a className="skip-link" href="#main-content">跳到主要内容</a><SiteHeader /><div id="main-content">{children}</div><SiteFooter /></body>
    </html>
  );
}
