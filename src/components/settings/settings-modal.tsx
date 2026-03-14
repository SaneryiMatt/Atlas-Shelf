"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  User,
  Palette,
  Key,
  Database,
  Info,
  ChevronRight,
  X,
  Monitor,
  Moon,
  Sun,
  CheckCircle2,
  CircleDashed,
  ExternalLink
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppUserSummary } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SettingsSection = "account" | "appearance" | "api" | "data" | "about";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUserSummary;
}

const navigationItems = [
  { id: "account" as const, label: "账号管理", icon: User },
  { id: "appearance" as const, label: "外观定制", icon: Palette },
  { id: "api" as const, label: "API 配置", icon: Key },
  { id: "data" as const, label: "数据管理", icon: Database },
  { id: "about" as const, label: "关于信息", icon: Info }
];

export function SettingsModal({ open, onOpenChange, user }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/70 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "h-[min(85vh,680px)] w-[calc(100vw-2rem)] max-w-4xl",
            "flex overflow-hidden rounded-2xl border border-border/40 bg-card/95 shadow-2xl backdrop-blur-xl",
            "ring-1 ring-white/[0.05]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <div className="flex w-56 shrink-0 flex-col border-r border-border/40 bg-background/40 p-4">
            <DialogPrimitive.Title className="px-3 pb-4 text-lg font-semibold tracking-tight text-foreground">
              设置
            </DialogPrimitive.Title>

            <nav className="flex flex-col gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                    {isActive && <ChevronRight className="ml-auto size-4 text-muted-foreground" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-4">
              <p className="px-3 text-xs text-muted-foreground/60">Atlas Shelf v1.0.0</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
              <h2 className="text-base font-medium text-foreground">
                {navigationItems.find((item) => item.id === activeSection)?.label}
              </h2>
              <DialogPrimitive.Close className="rounded-lg p-1.5 text-muted-foreground/60 transition-all hover:bg-accent hover:text-foreground">
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>

            <div className="p-6">
              {activeSection === "account" && <AccountSection user={user} />}
              {activeSection === "appearance" && <AppearanceSection />}
              {activeSection === "api" && <ApiSection />}
              {activeSection === "data" && <DataSection />}
              {activeSection === "about" && <AboutSection />}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function AccountSection({ user }: { user: AppUserSummary }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/40 bg-background/40 p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-xl font-semibold text-foreground">
            {user.initials}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{user.displayName}</p>
              <Badge variant="success">已登录</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              当前账号会话由 Supabase 管理，你可以在这里安全退出当前账号。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">账号设置</h3>
        <div className="divide-y divide-border/40 rounded-xl border border-border/40 bg-background/40">
          <SettingsRow
            title="修改密码"
            description="当前版本暂未开放在线修改密码入口。"
            action={
              <Button variant="ghost" size="sm" disabled>
                暂不可用
              </Button>
            }
          />
          <SettingsRow
            title="登出账号"
            description="安全退出当前账号，并返回登录页面。"
            action={
              <SignOutButton
                showLabel
                label="登出账号"
                pendingLabel="正在登出"
                variant="outline"
                size="sm"
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("dark");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">主题模式</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "system" as const, label: "跟随系统", icon: Monitor },
            { id: "light" as const, label: "浅色模式", icon: Sun },
            { id: "dark" as const, label: "深色模式", icon: Moon }
          ].map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                  isSelected
                    ? "border-foreground/30 bg-accent/60 ring-1 ring-foreground/10"
                    : "border-border/40 bg-background/40 hover:border-foreground/20 hover:bg-accent/30"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg transition-colors",
                    isSelected ? "bg-foreground text-background" : "bg-accent text-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <span className="text-sm font-medium text-foreground">{option.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground/70">
          当前版本仅完整适配深色模式，其它主题将在后续版本补齐。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">显示设置</h3>
        <div className="divide-y divide-border/40 rounded-xl border border-border/40 bg-background/40">
          <SettingsRow
            title="紧凑模式"
            description="减少界面间距，在同一屏内显示更多内容。"
            action={<ToggleSwitch checked={false} disabled />}
          />
          <SettingsRow
            title="显示评分"
            description="在列表中直接显示项目评分。"
            action={<ToggleSwitch checked={true} disabled />}
          />
        </div>
      </div>
    </div>
  );
}

function ApiSection() {
  const envStatus = [
    { key: "SUPABASE_URL", configured: true, hint: "Supabase 项目的 API 地址" },
    { key: "SUPABASE_ANON_KEY", configured: true, hint: "Supabase 匿名访问密钥" },
    { key: "OPENAI_API_KEY", configured: false, hint: "用于 AI 自动补全功能" }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">环境变量状态</h3>
        <div className="space-y-3">
          {envStatus.map((entry) => (
            <div
              key={entry.key}
              className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-background/40 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-medium text-foreground">{entry.key}</code>
                  <Badge variant={entry.configured ? "success" : "outline"} className="gap-1.5">
                    {entry.configured ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <CircleDashed className="size-3" />
                    )}
                    {entry.configured ? "已配置" : "待配置"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{entry.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">AI 配置</h3>
        <div className="space-y-4 rounded-xl border border-border/40 bg-background/40 p-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key" className="text-sm text-foreground/90">
              OpenAI API Key
            </Label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              className="border-border/50 bg-background/50"
            />
            <p className="text-xs text-muted-foreground/70">
              用于书籍、影视和旅行条目的智能补全能力。
            </p>
          </div>
          <Button size="sm" disabled>
            保存配置
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">数据导出</h3>
        <div className="divide-y divide-border/40 rounded-xl border border-border/40 bg-background/40">
          <SettingsRow
            title="导出所有数据"
            description="下载包含书籍、影视和旅行记录的 JSON 文件。"
            action={
              <Button variant="outline" size="sm" disabled>
                导出
              </Button>
            }
          />
          <SettingsRow
            title="导出为 CSV"
            description="导出为可用于电子表格分析的 CSV 格式。"
            action={
              <Button variant="outline" size="sm" disabled>
                导出
              </Button>
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">数据导入</h3>
        <div className="rounded-xl border border-dashed border-border/50 bg-background/30 p-6 text-center">
          <Database className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">拖拽文件到这里，或点击选择文件</p>
          <p className="mt-1 text-xs text-muted-foreground/60">支持 JSON、CSV 格式</p>
          <Button variant="outline" size="sm" className="mt-4" disabled>
            选择文件
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">危险操作</h3>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">清空所有数据</p>
              <p className="mt-1 text-sm text-muted-foreground">
                永久删除所有书籍、影视和旅行记录，此操作无法撤销。
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:border-destructive/60 hover:text-destructive" disabled>
              清空
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/40 bg-background/40 p-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-foreground">
          A
        </div>
        <h3 className="mt-4 text-xl font-semibold text-foreground">Atlas Shelf</h3>
        <p className="mt-1 text-sm text-muted-foreground">你的书影音与旅行记录</p>
        <p className="mt-3 text-xs text-muted-foreground/60">版本 1.0.0</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">相关链接</h3>
        <div className="divide-y divide-border/40 rounded-xl border border-border/40 bg-background/40">
          <SettingsRow
            title="项目主页"
            description="查看源码、文档和贡献说明。"
            action={
              <Button variant="ghost" size="sm" className="gap-1.5">
                访问 <ExternalLink className="size-3.5" />
              </Button>
            }
          />
          <SettingsRow
            title="问题反馈"
            description="报告 Bug 或提交功能建议。"
            action={
              <Button variant="ghost" size="sm" className="gap-1.5">
                反馈 <ExternalLink className="size-3.5" />
              </Button>
            }
          />
          <SettingsRow
            title="更新日志"
            description="查看版本更新历史。"
            action={
              <Button variant="ghost" size="sm" className="gap-1.5">
                查看 <ExternalLink className="size-3.5" />
              </Button>
            }
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-background/40 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Atlas Shelf 是一个开源的个人记录管理工具，用来整理阅读、观影和旅行体验。当前版本基于
          Next.js、Supabase 和 Tailwind CSS 构建。
        </p>
      </div>
    </div>
  );
}

interface SettingsRowProps {
  title: string;
  description: string;
  action: ReactNode;
}

function SettingsRow({ title, description, action }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function ToggleSwitch({ checked, disabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-foreground" : "bg-border"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
