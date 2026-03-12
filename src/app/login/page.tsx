import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Clapperboard, Compass, ShieldCheck } from "lucide-react";

import { signInAction } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "登录"
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "请输入有效的邮箱地址，以及至少 8 位的密码。",
  supabase_not_configured: "缺少 Supabase 环境变量，请先完善配置再登录。",
  "Invalid login credentials": "邮箱或密码不正确，请重试。",
  "Email not confirmed": "请先在邮箱中确认账户。"
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const errorKey = params.error ?? "";
  const errorMessage = errorMessages[errorKey] ?? (errorKey || null);

  return (
    <div className="flex min-h-screen bg-background">
      {/* 左侧品牌区域 */}
      <div className="hidden flex-1 flex-col justify-between border-r border-border bg-card p-10 lg:flex">
        <div>
          <Link href="/" className="text-xl font-semibold text-foreground">
            Atlas Shelf
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">个人追踪系统</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight text-foreground">
            记录你的书籍、影视与旅行
          </h2>
          <p className="text-muted-foreground">
            一个简洁优雅的个人追踪系统，帮你统一管理阅读记录、观影笔记和旅行地点。
          </p>

          <div className="grid gap-4 pt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                <BookOpen className="size-5 text-foreground" />
              </div>
              <span>书籍管理 - 追踪阅读进度与笔记</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                <Clapperboard className="size-5 text-foreground" />
              </div>
              <span>影视记录 - 整理观影评分与标签</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                <Compass className="size-5 text-foreground" />
              </div>
              <span>旅行追踪 - 管理想去和已到访的地点</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Atlas Shelf. 保留所有权利。
        </p>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* 移动端 Logo */}
          <div className="text-center lg:hidden">
            <Link href="/" className="text-xl font-semibold text-foreground">
              Atlas Shelf
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">个人追踪系统</p>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-foreground">欢迎回来</h1>
            <p className="text-sm text-muted-foreground">
              输入您的邮箱和密码登录账户
            </p>
          </div>

          {/* Supabase 配置提示 */}
          {!hasSupabaseConfig && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">需要配置 Supabase</p>
                  <p className="mt-1 text-amber-400/80">
                    请在项目设置中添加 Supabase 集成以启用登录功能。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {errorMessage && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          {/* 登录表单 */}
          <form action={signInAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                邮箱
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                密码
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少 8 位字符"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={!hasSupabaseConfig}>
              登录
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  );
}
