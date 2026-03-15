import { BookOpen, Briefcase, Clapperboard, Compass, LayoutDashboard } from "lucide-react";

import { analyticsFeatureEnabled } from "@/config/features";

export const productName = "Atlas Shelf";
export const productTagline = "你的书影音、旅行与求职记录";

export const primaryNavigation = [
  {
    title: "首页",
    href: "/",
    icon: LayoutDashboard,
    description: "集中查看当前在读、在看、年度分析和最近记录。"
  },
  {
    title: "书籍",
    href: "/books",
    icon: BookOpen,
    description: "管理阅读进度、评分、标签和笔记。"
  },
  {
    title: "影视",
    href: "/movies",
    icon: Clapperboard,
    description: "管理电影、剧集、动画和纪录片记录。"
  },
  {
    title: "旅行",
    href: "/travels",
    icon: Compass,
    description: "整理想去的地方、去过的地点和旅行回忆。"
  },
  {
    title: "投递",
    href: "/applications",
    icon: Briefcase,
    description: "记录公司、岗位、进度、面试安排和最终结果。"
  }
] as const;

export function getPageHeaderMeta(pathname: string) {
  if (pathname === "/") {
    return {
      title: "首页",
      description: "集中查看当前在读、在看、年度分析和最近时间线。"
    };
  }

  if (pathname === "/books") {
    return {
      title: "书籍",
      description: "整理阅读进度、评分、标签和笔记。"
    };
  }

  if (pathname.startsWith("/books/")) {
    return {
      title: "书籍详情",
      description: "查看这本书的记录、标签、笔记和图片。"
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
      description: "记录想去的地方、去过的地点和旅行计划。"
    };
  }

  if (pathname.startsWith("/travels/")) {
    return {
      title: "旅行详情",
      description: "查看地点信息、笔记和图片。"
    };
  }

  if (pathname === "/applications") {
    return {
      title: "投递",
      description: "管理公司、岗位、投递时间、面试和结果。"
    };
  }

  if (pathname.startsWith("/applications/")) {
    return {
      title: "投递详情",
      description: "查看这条投递记录的阶段、时间和备注。"
    };
  }

  if (pathname === "/search") {
    return {
      title: "搜索",
      description: "快速找到书籍、影视、旅行和投递记录。"
    };
  }

  if (pathname === "/timeline") {
    return {
      title: "时间线",
      description: "按时间查看全部书籍、影视、旅行和投递记录。"
    };
  }

  if (analyticsFeatureEnabled && pathname === "/analytics") {
    return {
      title: "分析",
      description: "查看近期记录节奏和偏好变化。"
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
    description: "你的书影音、旅行与求职记录。"
  };
}
