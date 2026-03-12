import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces"
});

export const metadata: Metadata = {
  title: {
    default: "Atlas Shelf",
    template: "%s | Atlas Shelf"
  },
  description: "一个用于记录书籍、影视与旅行地点的个人追踪系统。",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={cn(manrope.variable, fraunces.variable)}>{children}</body>
    </html>
  );
}

