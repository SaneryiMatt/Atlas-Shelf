import type { AnalyticsMetric, CategoryBreakdown, SettingsPanel } from "@/lib/types/items";

export const bookNotes = [
  "优先保留和书籍主线进度直接相关的笔记，避免备注区重复堆信息。",
  "如果后续要支持阅读会话，再把书籍笔记拆成时间序列结构。",
  "当前阶段保留简洁备注即可，后续再决定是否增加 AI 摘要和引用聚合。"
];

export const analyticsMetrics: AnalyticsMetric[] = [
  {
    label: "完成节奏",
    value: "平均每 5.2 天",
    detail: "跨全部项目类型统计，反映近一段时间的记录频率。"
  },
  {
    label: "平均满意度",
    value: "4.6 / 5",
    detail: "书影音评分整体较稳定，旅行回顾满意度最高。"
  },
  {
    label: "有明确意图的队列占比",
    value: "71%",
    detail: "大多数排队项目都附带了原因、情绪或时间范围。"
  }
];

export const analyticsByType: CategoryBreakdown[] = [
  { label: "书籍", value: "64%", accent: "#8b6f47" },
  { label: "影视", value: "78%", accent: "#48645b" },
  { label: "旅行", value: "52%", accent: "#7f9b91" }
];

export const analyticsByRegion: CategoryBreakdown[] = [
  { label: "日本", value: "38%", accent: "#c48c66" },
  { label: "南欧", value: "24%", accent: "#7f9b91" },
  { label: "东亚城市", value: "18%", accent: "#5a796e" },
  { label: "其他", value: "20%", accent: "#d4bf98" }
];

export const analyticsInsights = [
  "当每个模块的短名单控制在 10 项以内时，执行效果最好。",
  "旅行规划在每个地点都附带一个街区锚点时，更容易持续推进。",
  "开启笔记采集的书，比完全不记笔记的书更容易被主动读完。"
];

export const settingsPanels: SettingsPanel[] = [
  {
    title: "数据库层",
    description: "Drizzle schema 已准备好连接 Supabase Postgres，核心是统一的 projects 主表和详情表。",
    status: "就绪",
    detail: "DATABASE_URL 可用后，就可以把 mock 查询切换为真实查询。"
  },
  {
    title: "AI 字段",
    description: "页面结构已经为生成式摘要、推荐和笔记蒸馏预留位置。",
    status: "模块化",
    detail: "保持 prompt 构造与持久化、展示逻辑分离。"
  },
  {
    title: "表单与校验",
    description: "Zod schema 按模块组织，方便后续把新增和编辑流程局部扩展。",
    status: "已准备",
    detail: "增加 server actions 或 route handlers 时，不需要重构页面树。"
  }
];
