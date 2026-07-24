import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "海豚服装智造",
  description: "面向服装工厂的订单、打样、报价与客户协作系统",
};

export default function RootLayout({
  children,
  drawer,
}: {
  children: React.ReactNode;
  drawer: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${mono.variable} ${serif.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        {children}
        {drawer}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              border: "1px solid var(--hairline-strong)",
              background: "var(--card)",
              color: "var(--ink)",
              boxShadow: "0 24px 48px -12px rgba(0,0,0,0.12)",
            },
            className: "rounded-md",
          }}
        />
      </body>
    </html>
  );
}
