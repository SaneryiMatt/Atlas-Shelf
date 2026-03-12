import {
  BarChart3,
  BookOpen,
  Clapperboard,
  Compass,
  LayoutDashboard,
  Settings,
  Sparkles,
  TimerReset
} from "lucide-react";

export const navigation = [
  {
    title: "总览",
    href: "/",
    icon: LayoutDashboard,
    description: "集中查看书籍、影视与旅行动态。"
  },
  {
    title: "书籍",
    href: "/books",
    icon: BookOpen,
    description: "阅读进度、笔记与待读清单。"
  },
  {
    title: "影视",
    href: "/movies",
    icon: Clapperboard,
    description: "电影、剧集、动漫与片单管理。"
  },
  {
    title: "旅行",
    href: "/travels",
    icon: Compass,
    description: "灵感目的地、行程安排与旅行回忆。"
  },
  {
    title: "时间线",
    href: "/timeline",
    icon: TimerReset,
    description: "按时间顺序查看所有记录。"
  },
  {
    title: "分析",
    href: "/analytics",
    icon: BarChart3,
    description: "完成趋势与使用习惯洞察。"
  },
  {
    title: "设置",
    href: "/settings",
    icon: Settings,
    description: "数据、集成与 AI 工作流配置。"
  }
] as const;

export const workspaceHighlights = [
  "共享项目主表，配合可扩展的详情表",
  "以服务端为主的页面组织，查询逻辑独立",
  "统一的卡片、列表与克制的视觉语言"
] as const;

export const productTagline = "在一个清晰克制的空间里，记录书籍、影视与旅程。";

export const productBadge = {
  label: "生产可用基础架构",
  icon: Sparkles
};

