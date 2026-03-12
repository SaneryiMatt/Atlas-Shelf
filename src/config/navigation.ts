import {
  BookOpen,
  Clapperboard,
  Compass,
  LayoutDashboard,
  Search,
  Settings,
  TimerReset
} from "lucide-react";

import { analyticsFeatureEnabled, timelineFeatureEnabled } from "@/config/features";

export const productName = "Atlas Shelf";
export const productTagline = "你的书影音与旅行记录";

export const primaryNavigation = [
  {
    title: "首页",
    href: "/",
    icon: LayoutDashboard,
    description: "最近记录、进行中内容和快捷入口"
  },
  {
    title: "书籍",
    href: "/books",
    icon: BookOpen,
    description: "在读、想读和阅读笔记"
  },
  {
    title: "影视",
    href: "/movies",
    icon: Clapperboard,
    description: "电影记录、评分和观后感"
  },
  {
    title: "旅行",
    href: "/travels",
    icon: Compass,
    description: "想去的地方、已去过的地点和旅程回忆"
  }
] as const;

export const quickAccessLinks = [
  {
    title: "全局搜索",
    href: "/search",
    icon: Search
  },
  ...(timelineFeatureEnabled
    ? [
        {
          title: "时间线",
          href: "/timeline",
          icon: TimerReset
        }
      ]
    : []),
  {
    title: "设置",
    href: "/settings",
    icon: Settings
  }
] as const;

export function getPageHeaderMeta(pathname: string) {
  if (pathname === "/") {
    return {
      title: "首页",
      description: "看看最近在读、在看和准备去的地方。"
    };
  }

  if (pathname === "/books") {
    return {
      title: "书籍",
      description: "整理阅读进度、评分和笔记。"
    };
  }

  if (pathname.startsWith("/books/")) {
    return {
      title: "书籍详情",
      description: "查看这本书的记录、标签和图片。"
    };
  }

  if (pathname === "/movies") {
    return {
      title: "影视",
      description: "集中管理作品条目、评分和观后感。"
    };
  }

  if (pathname.startsWith("/movies/")) {
    return {
      title: "影视详情",
      description: "查看作品信息、笔记和图片。"
    };
  }

  if (pathname === "/travels") {
    return {
      title: "旅行",
      description: "记录想去的地方、去过的地点和旅程计划。"
    };
  }

  if (pathname.startsWith("/travels/")) {
    return {
      title: "旅行详情",
      description: "查看地点信息、笔记和图片。"
    };
  }

  if (pathname === "/search") {
    return {
      title: "搜索",
      description: "快速找到书籍、影视和旅行记录。"
    };
  }

  if (timelineFeatureEnabled && pathname === "/timeline") {
    return {
      title: "时间线",
      description: "按时间查看最近记录。"
    };
  }

  if (analyticsFeatureEnabled && pathname === "/analytics") {
    return {
      title: "分析",
      description: "看看最近的记录节奏和偏好变化。"
    };
  }

  if (pathname === "/settings") {
    return {
      title: "设置",
      description: "管理账户、连接和个性化配置。"
    };
  }

  return {
    title: "首页",
    description: "你的书影音与旅行记录。"
  };
}
