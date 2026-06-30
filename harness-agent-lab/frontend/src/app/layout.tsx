import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harness Agent Lab",
  description: "Agent patterns practice lab built with FastAPI, LangChain and Next.js.",
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
