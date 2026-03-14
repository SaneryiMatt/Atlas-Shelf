"use client";

import { useState, useRef, useCallback } from "react";
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
  ExternalLink,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  FileWarning
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportAllData, clearAllData, validateImportData } from "@/modules/settings/data-actions";

type SettingsSection = "account" | "appearance" | "api" | "data" | "about";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationItems = [
  { id: "account" as const, label: "账号管理", icon: User },
  { id: "appearance" as const, label: "外观定制", icon: Palette },
  { id: "api" as const, label: "API 配置", icon: Key },
  { id: "data" as const, label: "数据管理", icon: Database },
  { id: "about" as const, label: "关于信息", icon: Info }
];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
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
            "w-[calc(100vw-2rem)] max-w-4xl h-[min(85vh,680px)]",
            "rounded-2xl border border-border/40 bg-card/95 shadow-2xl backdrop-blur-xl",
            "ring-1 ring-white/[0.05]",
            "flex overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {/* 左侧导航 */}
          <div className="w-56 shrink-0 border-r border-border/40 bg-background/40 p-4 flex flex-col">
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

          {/* 右侧内容 */}
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
              {activeSection === "account" && <AccountSection />}
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

function AccountSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/40 bg-background/40 p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-xl font-semibold text-foreground">
            U
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">开发模式</p>
            <p className="text-sm text-muted-foreground">当前未登录账号</p>
          </div>
          <Button variant="outline" size="sm">
            登录账号
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">账号设置</h3>
        <div className="rounded-xl border border-border/40 bg-background/40 divide-y divide-border/40">
          <SettingsRow
            title="邮箱地址"
            description="用于登录和接收通知"
            action={<span className="text-sm text-muted-foreground">未设置</span>}
          />
          <SettingsRow
            title="修改密码"
            description="更新你的账户密码"
            action={
              <Button variant="ghost" size="sm" disabled>
                修改
              </Button>
            }
          />
          <SettingsRow
            title="删除账号"
            description="永久删除你的账号和所有数据"
            action={
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled>
                删除
              </Button>
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
        <p className="text-xs text-muted-foreground/70">当前版本仅支持深色模式，其他主题将在后续版本中提供。</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">显示设置</h3>
        <div className="rounded-xl border border-border/40 bg-background/40 divide-y divide-border/40">
          <SettingsRow
            title="紧凑模式"
            description="减少界面间距，显示更多内容"
            action={<ToggleSwitch checked={false} disabled />}
          />
          <SettingsRow
            title="显示评分"
            description="在列表中显示项目评分"
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
        <div className="rounded-xl border border-border/40 bg-background/40 p-4 space-y-4">
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
            <p className="text-xs text-muted-foreground/70">用于书籍、影视和旅行的智能补全功能。</p>
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
  const [exportLoading, setExportLoading] = useState<"json" | "csv" | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = useCallback(async () => {
    setExportLoading("json");
    try {
      const result = await exportAllData();
      if (result.status === "success" && result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `atlas-shelf-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setImportStatus({ type: "success", message: "数据导出成功！" });
      } else {
        setImportStatus({ type: "error", message: result.message || "导出失败" });
      }
    } catch {
      setImportStatus({ type: "error", message: "导出时发生错误" });
    } finally {
      setExportLoading(null);
    }
  }, []);

  const handleExportCSV = useCallback(async () => {
    setExportLoading("csv");
    try {
      const result = await exportAllData();
      if (result.status === "success" && result.data) {
        const csvParts: string[] = [];
        
        // Books CSV
        if (result.data.books.length > 0) {
          csvParts.push("# 书籍数据");
          csvParts.push("标题,作者,状态,评分,开始日期,完成日期,标签,备注");
          for (const book of result.data.books) {
            csvParts.push([
              `"${book.title.replace(/"/g, '""')}"`,
              `"${book.author.replace(/"/g, '""')}"`,
              book.status,
              book.rating || "",
              book.startedAt?.split("T")[0] || "",
              book.completedAt?.split("T")[0] || "",
              `"${book.tags.join(", ")}"`,
              `"${(book.summary || "").replace(/"/g, '""')}"`
            ].join(","));
          }
          csvParts.push("");
        }

        // Movies CSV
        if (result.data.movies.length > 0) {
          csvParts.push("# 影视数据");
          csvParts.push("标题,导演,上映年份,平台,状态,评分,标签,备注");
          for (const movie of result.data.movies) {
            csvParts.push([
              `"${movie.title.replace(/"/g, '""')}"`,
              `"${(movie.director || "").replace(/"/g, '""')}"`,
              movie.releaseYear || "",
              `"${(movie.platform || "").replace(/"/g, '""')}"`,
              movie.status,
              movie.rating || "",
              `"${movie.tags.join(", ")}"`,
              `"${(movie.note || "").replace(/"/g, '""')}"`
            ].join(","));
          }
          csvParts.push("");
        }

        // Travels CSV
        if (result.data.travels.length > 0) {
          csvParts.push("# 旅行数据");
          csvParts.push("地点,国家/地区,城市,状态,阶段,日期,描述");
          for (const travel of result.data.travels) {
            csvParts.push([
              `"${travel.placeName.replace(/"/g, '""')}"`,
              `"${travel.country.replace(/"/g, '""')}"`,
              `"${(travel.city || "").replace(/"/g, '""')}"`,
              travel.status,
              travel.stage,
              travel.travelDate || "",
              `"${(travel.description || "").replace(/"/g, '""')}"`
            ].join(","));
          }
        }

        const blob = new Blob(["\uFEFF" + csvParts.join("\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `atlas-shelf-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setImportStatus({ type: "success", message: "CSV 导出成功！" });
      } else {
        setImportStatus({ type: "error", message: result.message || "导出失败" });
      }
    } catch {
      setImportStatus({ type: "error", message: "导出时发生错误" });
    } finally {
      setExportLoading(null);
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    setImportLoading(true);
    setImportStatus(null);

    try {
      const text = await file.text();
      
      if (file.name.endsWith(".json")) {
        const data = JSON.parse(text);
        const validation = validateImportData(data);
        
        if (!validation.valid) {
          setImportStatus({ type: "error", message: validation.message });
          return;
        }

        const bookCount = data.books?.length || 0;
        const movieCount = data.movies?.length || 0;
        const travelCount = data.travels?.length || 0;

        setImportStatus({
          type: "info",
          message: `文件验证通过：${bookCount} 本书籍、${movieCount} 部影视、${travelCount} 个旅行地点。导入功能即将上线。`
        });
      } else if (file.name.endsWith(".csv")) {
        setImportStatus({
          type: "info",
          message: "CSV 文件已读取。完整导入功能即将上线。"
        });
      } else {
        setImportStatus({ type: "error", message: "不支持的文件格式，请使用 JSON 或 CSV 文件" });
      }
    } catch {
      setImportStatus({ type: "error", message: "文件解析失败，请检查文件格式是否正确" });
    } finally {
      setImportLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = "";
  }, [processFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".csv"))) {
      processFile(file);
    } else {
      setImportStatus({ type: "error", message: "请上传 JSON 或 CSV 格式的文件" });
    }
  }, [processFile]);

  const handleClearData = useCallback(async () => {
    if (clearConfirmText !== "确认清空") {
      return;
    }

    setClearLoading(true);
    try {
      const result = await clearAllData();
      if (result.status === "success") {
        setImportStatus({ type: "success", message: "所有数据已清空" });
        setShowClearConfirm(false);
        setClearConfirmText("");
      } else {
        setImportStatus({ type: "error", message: result.message });
      }
    } catch {
      setImportStatus({ type: "error", message: "清空数据时发生错误" });
    } finally {
      setClearLoading(false);
    }
  }, [clearConfirmText]);

  return (
    <div className="space-y-6">
      {/* 状态提示 */}
      {importStatus && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3",
            importStatus.type === "success" && "border-green-500/20 bg-green-500/10 text-green-400",
            importStatus.type === "error" && "border-red-500/20 bg-red-500/10 text-red-400",
            importStatus.type === "info" && "border-blue-500/20 bg-blue-500/10 text-blue-400"
          )}
        >
          {importStatus.type === "success" && <Check className="size-4 shrink-0" />}
          {importStatus.type === "error" && <FileWarning className="size-4 shrink-0" />}
          {importStatus.type === "info" && <Info className="size-4 shrink-0" />}
          <p className="text-sm">{importStatus.message}</p>
          <button
            onClick={() => setImportStatus(null)}
            className="ml-auto rounded p-0.5 hover:bg-white/10"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 数据导出 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Download className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">数据导出</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleExportJSON}
            disabled={exportLoading !== null}
            className={cn(
              "group flex items-center gap-4 rounded-xl border border-border/40 bg-background/40 p-4 text-left transition-all",
              "hover:border-foreground/20 hover:bg-accent/30",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/60 text-foreground/70 transition-colors group-hover:bg-accent group-hover:text-foreground">
              {exportLoading === "json" ? <Loader2 className="size-5 animate-spin" /> : <FileJson className="size-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">导出为 JSON</p>
              <p className="mt-0.5 text-xs text-muted-foreground">完整数据备份，支持重新导入</p>
            </div>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={exportLoading !== null}
            className={cn(
              "group flex items-center gap-4 rounded-xl border border-border/40 bg-background/40 p-4 text-left transition-all",
              "hover:border-foreground/20 hover:bg-accent/30",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/60 text-foreground/70 transition-colors group-hover:bg-accent group-hover:text-foreground">
              {exportLoading === "csv" ? <Loader2 className="size-5 animate-spin" /> : <FileSpreadsheet className="size-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">导出为 CSV</p>
              <p className="mt-0.5 text-xs text-muted-foreground">电子表格格式，便于查看编辑</p>
            </div>
          </button>
        </div>
      </div>

      {/* 数据导入 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">数据导入</h3>
        </div>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center transition-all",
            dragActive
              ? "border-foreground/40 bg-accent/40"
              : "border-border/50 bg-background/30 hover:border-foreground/20 hover:bg-accent/20"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {importLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-foreground/60" />
              <p className="text-sm text-muted-foreground">正在处理文件...</p>
            </div>
          ) : (
            <>
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent/60">
                <Upload className="size-6 text-foreground/60" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                拖拽文件到此处
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                或点击下方按钮选择文件
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                <FileJson className="size-3.5" />
                <span>JSON</span>
                <span className="mx-1">·</span>
                <FileSpreadsheet className="size-3.5" />
                <span>CSV</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                选择文件
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 危险操作 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive/70" />
          <h3 className="text-sm font-medium text-foreground">危险操作</h3>
        </div>

        {!showClearConfirm ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <Trash2 className="size-4 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-foreground">清空所有数据</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    永久删除所有书籍、影视和旅行记录。此操作无法撤销，请先导出数据备份。
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
              >
                清空
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">确认清空所有数据？</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  此操作将永久删除所有数据，包括书籍、影视、旅行记录及其标签。请输入「确认清空」以继续。
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Input
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="请输入「确认清空」"
                className="border-destructive/30 bg-background/50"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowClearConfirm(false);
                    setClearConfirmText("");
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={clearConfirmText !== "确认清空" || clearLoading}
                  onClick={handleClearData}
                >
                  {clearLoading ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      清空中...
                    </>
                  ) : (
                    "确认清空"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
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
        <div className="rounded-xl border border-border/40 bg-background/40 divide-y divide-border/40">
          <SettingsRow
            title="项目主页"
            description="查看源代码和贡献指南"
            action={
              <Button variant="ghost" size="sm" className="gap-1.5">
                访问 <ExternalLink className="size-3.5" />
              </Button>
            }
          />
          <SettingsRow
            title="问题反馈"
            description="报告 Bug 或提出功能建议"
            action={
              <Button variant="ghost" size="sm" className="gap-1.5">
                反馈 <ExternalLink className="size-3.5" />
              </Button>
            }
          />
          <SettingsRow
            title="更新日志"
            description="查看版本更新历史"
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
          Atlas Shelf 是一个��源的个人记录管理工具，帮助你追踪阅读、观影和旅行体验。
          使用 Next.js、Supabase 和 Tailwind CSS 构建。
        </p>
      </div>
    </div>
  );
}

interface SettingsRowProps {
  title: string;
  description: string;
  action: React.ReactNode;
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
