import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { signInAction } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "登录"
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "请输入有效的邮箱地址，以及至少 8 位的密码。",
  supabase_not_configured: "缺少 Supabase 环境变量，请先完善 .env.local 再登录。",
  "Invalid login credentials": "Supabase 拒绝了当前邮箱或密码。",
  "Email not confirmed": "请先在 Supabase 中完成该邮箱的确认。"
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
  const message = params.error ? errorMessages[params.error] ?? params.error : null;

  return (
    <main className="min-h-screen bg-page-glow px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[2rem] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,242,235,0.88))] p-8 shadow-soft">
          <Badge variant="warm" className="w-fit gap-2">
            <ShieldCheck className="size-3.5" />
            Supabase 保护的工作区
          </Badge>
          <div className="space-y-3">
            <h1 className="font-serif text-5xl text-foreground">Atlas Shelf</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              认证由 Supabase Auth 处理，Postgres 通过服务端查询层访问，Storage 用于封面、旅行照片和附件等媒体资源。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
              登录会话通过 Next 中间件自动刷新。
            </div>
            <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
              Drizzle 继续使用 Supabase Postgres 连接串。
            </div>
            <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
              Storage 辅助层已支持基于 Bucket 的上传与公开资源地址。
            </div>
          </div>
        </section>

        <Card className="border-white/50 bg-white/85">
          <CardHeader>
            <CardTitle>登录</CardTitle>
            <CardDescription>使用已在 Supabase Auth 中配置的邮箱密码账户登录。</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signInAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  邮箱
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={!hasSupabaseConfig}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={!hasSupabaseConfig}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="至少 8 位字符"
                />
              </div>
              {message ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {message}
                </div>
              ) : null}
              <Button type="submit" className="h-11 w-full gap-2" disabled={!hasSupabaseConfig}>
                <LockKeyhole className="size-4" />
                登录
              </Button>
            </form>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              配置完成后，请先在 Supabase Auth 中创建第一个用户，或通过控制台邀请自己。
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <Link href="https://supabase.com/dashboard" className="underline underline-offset-4">
                打开 Supabase 控制台
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
