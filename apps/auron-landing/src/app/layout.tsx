import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/lib/LenisProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-loaded", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-loaded", display: "swap" });
const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif-loaded",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Auron — Autonomous Intelligence Built for Scale",
  description:
    "Auron is the AI agent platform trusted by 13,247 teams to ship autonomous workflows in seconds. Sub-millisecond latency. Enterprise-grade.",
  openGraph: {
    title: "Auron — Autonomous Intelligence",
    description: "Ship autonomous AI workflows in seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${serif.variable}`}>
      <body className="bg-[var(--color-void)] text-[var(--color-bone)] antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
