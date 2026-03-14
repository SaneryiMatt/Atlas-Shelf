import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Clapperboard, Compass, ShieldCheck } from "lucide-react";

import { signInAction, signUpAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: "登录 / 注册"
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "请输入有效的邮箱地址和至少 8 位的密码。",
  invalid_signup_input: "请输入有效的邮箱地址，并使用至少 8 位密码。",
  password_mismatch: "两次输入的密码不一致，请重新确认。",
  supabase_not_configured: "缺少 Supabase 环境变量，请先完成配置后再使用认证功能。",
  "Invalid login credentials": "邮箱或密码不正确，请重试。",
  "Email not confirmed": "请先前往邮箱完成账号验证。",
  "User already registered": "该邮箱已经注册，请直接登录。",
  "User already exists": "该邮箱已经注册，请直接登录。",
  signup_failed: "注册失败，请稍后重试。"
};

const statusMessages: Record<string, string> = {
  check_email: "注册成功，请查收验证邮件并完成邮箱确认。",
  email_confirmed: "邮箱已验证，请使用密码登录。"
};

const features = [
  {
    icon: BookOpen,
    label: "书籍管理",
    description: "追踪阅读进度、评分与笔记"
  },
  {
    icon: Clapperboard,
    label: "影视记录",
    description: "整理观影条目、标签与评价"
  },
  {
    icon: Compass,
    label: "旅行追踪",
    description: "管理想去、正在进行和已完成的旅程"
  }
] as const;

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; mode?: string; status?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const authMode = params.mode === "signup" ? "signup" : "signin";
  const errorKey = params.error ?? "";
  const statusKey = params.status ?? "";
  const errorMessage = errorMessages[errorKey] ?? (errorKey || null);
  const statusMessage = statusMessages[statusKey] ?? null;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden flex-1 flex-col justify-between border-r border-border bg-card p-10 lg:flex">
        <div>
          <Link href="/" className="text-xl font-semibold text-foreground">
            Atlas Shelf
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">个人追踪系统</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight text-foreground">
            记录你的书籍、影视与旅行轨迹
          </h2>
          <p className="text-muted-foreground">
            一个简洁克制的个人记录空间，统一管理阅读清单、观影笔记和旅行计划。
          </p>

          <div className="grid gap-4 pt-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
                    <Icon className="size-5 text-foreground" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{feature.label}</p>
                    <p>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Atlas Shelf. 保留所有权利。
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center lg:hidden">
            <Link href="/" className="text-xl font-semibold text-foreground">
              Atlas Shelf
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">个人追踪系统</p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1">
              <Button asChild variant={authMode === "signin" ? "default" : "ghost"} size="sm">
                <Link href="/login">登录</Link>
              </Button>
              <Button
                asChild
                variant={authMode === "signup" ? "default" : "ghost"}
                size="sm"
              >
                <Link href="/login?mode=signup">注册</Link>
              </Button>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-foreground">
                {authMode === "signup" ? "创建账号" : "欢迎回来"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {authMode === "signup"
                  ? "使用邮箱注册新账号，完成邮件验证后即可登录。"
                  : "输入您的邮箱和密码登录账号。"}
              </p>
            </div>
          </div>

          {!hasSupabaseConfig && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">需要配置 Supabase</p>
                  <p className="mt-1 text-amber-400/80">
                    请在项目环境变量中补全 Supabase 配置后再使用登录和注册功能。
                  </p>
                </div>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          {authMode === "signup" ? (
            <form action={signUpAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                  邮箱
                </label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                  密码
                </label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="至少 8 位字符"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-confirm-password"
                  className="text-sm font-medium text-foreground"
                >
                  确认密码
                </label>
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={!hasSupabaseConfig}>
                注册并发送验证邮件
              </Button>
            </form>
          ) : (
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
          )}

          <p className="text-center text-xs text-muted-foreground">
            {authMode === "signup"
              ? "注册即表示您同意我们的服务条款和隐私政策。"
              : "登录即表示您同意我们的服务条款和隐私政策。"}
          </p>
        </div>
      </div>
    </div>
  );
}