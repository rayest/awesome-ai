import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  display: "swap",
});
const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif-loaded",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Auron — 工坊协作",
  description: "Auron · 针织服装厂的工坊 ERP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${mono.variable} ${serif.variable}`}
    >
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
