import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tide Window",
  description: "A quiet gallery of the world's seas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
