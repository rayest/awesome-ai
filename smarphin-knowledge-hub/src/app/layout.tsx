import type { Metadata } from "next";
import "./globals.css";
import "./community.css";

export const metadata: Metadata = {
  title: "SmartHub - AI 知识社区",
  description: "分享 AI、Agent、技术开发框架与相关信息流的知识社区。",
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
