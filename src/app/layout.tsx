import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

import "@/app/globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: {
    default: "Atlas Shelf",
    template: "%s | Atlas Shelf"
  },
  description: "一个用于记录书籍、影视、旅行与求职投递进度的个人追踪系统。",
  metadataBase: new URL("https://example.com")
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={cn(inter.variable, "font-sans")}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
