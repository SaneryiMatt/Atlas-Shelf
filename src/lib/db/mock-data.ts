import type {
  AnalyticsMetric,
  BookOverviewItem,
  CategoryBreakdown,
  DashboardStat,
  QueueItem,
  ScreenOverviewItem,
  SettingsPanel,
  TimelineEvent,
  TravelOverviewItem
} from "@/lib/types/items";

export const dashboardStats: DashboardStat[] = [
  {
    label: "活跃项目",
    value: "42",
    detail: "覆盖阅读、观影和旅行规划，并保持每周稳定复盘。",
    trend: "up"
  },
  {
    label: "本季度完成",
    value: "18",
    detail: "在长篇阅读、舒适重温和一次完整旅行之间保持了不错的平衡。",
    trend: "steady"
  },
  {
    label: "优先积压",
    value: "9",
    detail: "未来 30 天只保留一份精简短名单，让决策更稳定。",
    trend: "down"
  }
];

export const dashboardFocusItems: QueueItem[] = [
  {
    id: "book-1",
    title: "The Creative Act",
    type: "book",
    status: "在读",
    meta: "Rick Rubin · 432 页",
    summary: "当前最值得持续投入的一本，适合边读边记下高质量想法。",
    tags: ["创作", "非虚构"]
  },
  {
    id: "screen-1",
    title: "完美的日子",
    type: "screen",
    status: "下一部",
    meta: "电影 · Wim Wenders · 124 分钟",
    summary: "适合周末放空时看的低噪音电影，已经排到最前面。",
    tags: ["电影", "安静"]
  },
  {
    id: "travel-1",
    title: "京都秋日重访",
    type: "travel",
    status: "规划中",
    meta: "日本 · 7 晚 · 11 月下旬",
    summary: "路线、旅馆候选和街区美食地图都已经开始收拢。",
    tags: ["文化", "美食"]
  }
];

export const dashboardRecentMoments: TimelineEvent[] = [
  {
    id: "moment-1",
    title: "看完《爱在黎明破晓前》",
    date: "2026年3月8日",
    kind: "screen",
    badge: "已观看",
    description: "完成了一次小型三部曲冲刺，并补了一条关于对白节奏的短评。"
  },
  {
    id: "moment-2",
    title: "预订里斯本河畔住宿",
    date: "2026年3月5日",
    kind: "travel",
    badge: "已预订",
    description: "先把住宿定下来，后续就能围绕步行路线和周边短途继续细化。"
  },
  {
    id: "moment-3",
    title: "记录《The Creative Act》的页边笔记",
    date: "2026年3月3日",
    kind: "book",
    badge: "新增笔记",
    description: "留下了一条关于“审美”和“手艺”应当分离的可复用观点。"
  }
];

export const booksStats: DashboardStat[] = [
  {
    label: "当前在读",
    value: "3",
    detail: "一本文学非虚构、一本小说和一本轻量随笔并行阅读。",
    trend: "steady"
  },
  {
    label: "2026 年已读完",
    value: "11",
    detail: "当前完成速度稳定高于每月两本的目标。",
    trend: "up"
  },
  {
    label: "带批注书目",
    value: "27",
    detail: "越来越多高亮和笔记被整理成结构化信息。",
    trend: "up"
  }
];

export const currentBooks: BookOverviewItem[] = [
  {
    id: "book-1",
    title: "The Creative Act",
    author: "Rick Rubin",
    status: "在读",
    progress: "68%",
    pages: 432,
    rating: "4.6",
    summary: "正在慢慢读，并持续提炼适合写作和产品思考的提示。",
    tags: ["创作", "笔记"]
  },
  {
    id: "book-2",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    status: "在读",
    progress: "42%",
    pages: 416,
    rating: "4.4",
    summary: "作为非虚构阅读之外更情绪化、更偏人物关系的一本搭配来读。",
    tags: ["小说", "人物"]
  },
  {
    id: "book-3",
    title: "The Book of Delights",
    author: "Ross Gay",
    status: "暂停",
    progress: "23%",
    pages: 288,
    rating: "4.1",
    summary: "篇幅短，适合早晨压力不大的时候随手读一点。",
    tags: ["随笔", "轻松"]
  }
];

export const bookBacklog: BookOverviewItem[] = [
  {
    id: "book-4",
    title: "Sea of Tranquility",
    author: "Emily St. John Mandel",
    status: "排队中",
    progress: "0%",
    pages: 272,
    rating: "4.3",
    summary: "大概率会成为当前非虚构读完后的下一本小说。",
    tags: ["科幻", "优先"]
  },
  {
    id: "book-5",
    title: "Clear Thinking",
    author: "Shane Parrish",
    status: "排队中",
    progress: "0%",
    pages: 304,
    rating: "4.0",
    summary: "适合作为系统思考的延伸阅读，为总览和分析模块提供灵感。",
    tags: ["决策", "非虚构"]
  },
  {
    id: "book-6",
    title: "Pachinko",
    author: "Min Jin Lee",
    status: "想读",
    progress: "0%",
    pages: 512,
    rating: "4.8",
    summary: "更适合长周末集中阅读，因此暂时不放进近期队列。",
    tags: ["史诗", "愿望单"]
  }
];

export const bookNotes = [
  "笔记采集应与完成状态解耦，这样未读完的书也能沉淀可复用内容。",
  "后续可以支持一本书对应多次阅读会话，为习惯分析提供更细粒度数据。",
  "每本书都应预留 AI 摘要、引用聚类等显式字段，而不是临时拼装。"
];

export const screenStats: DashboardStat[] = [
  {
    label: "片单焦点",
    value: "7",
    detail: "刻意把队列控制在较小规模，包含电影、一部剧和一季动漫。",
    trend: "down"
  },
  {
    label: "2026 年已看完",
    value: "24",
    detail: "观影执行力不错，没有让片单继续失控膨胀。",
    trend: "up"
  },
  {
    label: "重温候选",
    value: "5",
    detail: "保留下来用于舒适重看或季节性重复观看。",
    trend: "steady"
  }
];

export const currentScreens: ScreenOverviewItem[] = [
  {
    id: "screen-1",
    title: "完美的日子",
    format: "电影",
    director: "Wim Wenders",
    platform: "影院待看",
    status: "下一部",
    runtime: "124 分钟",
    rating: "4.8",
    summary: "更像一次安静修复性的观看，而不是周末高刺激片单。",
    tags: ["电影", "平静"]
  },
  {
    id: "screen-2",
    title: "葬送的芙莉莲",
    format: "动漫",
    director: "斋藤圭一郎",
    platform: "Crunchyroll",
    status: "观看中",
    runtime: "28 集",
    rating: "4.9",
    summary: "目前最适合作为长线追更搭档的一部，值得保留分集笔记。",
    tags: ["动漫", "奇幻"]
  },
  {
    id: "screen-3",
    title: "熊家餐馆",
    format: "剧集",
    director: "Christopher Storer",
    platform: "Disney+",
    status: "暂停",
    runtime: "3 季",
    rating: "4.7",
    summary: "刻意暂停，等有足够心力时再回到它的节奏和情绪里。",
    tags: ["剧集", "人物"]
  }
];

export const screenBacklog: ScreenOverviewItem[] = [
  {
    id: "screen-4",
    title: "Past Lives",
    format: "电影",
    director: "Celine Song",
    platform: "数字租赁",
    status: "排队中",
    runtime: "106 分钟",
    rating: "4.8",
    summary: "适合留给一个能看完后顺手记点感受的独处夜晚。",
    tags: ["剧情", "优先"]
  },
  {
    id: "screen-5",
    title: "幕府将军",
    format: "剧集",
    director: "Jonathan van Tulleken",
    platform: "Disney+",
    status: "想看",
    runtime: "10 集",
    rating: "4.6",
    summary: "等另一部长篇剧集看完后，再认真投入这类高成本追剧项目。",
    tags: ["历史", "队列"]
  },
  {
    id: "screen-6",
    title: "侧耳倾听",
    format: "电影",
    director: "近藤喜文",
    platform: "蓝光",
    status: "重看",
    runtime: "111 分钟",
    rating: "4.9",
    summary: "当新内容显得过于费脑时，这是一部很好的安慰型重看候选。",
    tags: ["动画", "舒适"]
  }
];

export const travelStats: DashboardStat[] = [
  {
    label: "规划中的旅行",
    value: "4",
    detail: "保持一趟近期出行和三条慢慢酝酿的愿望路线。",
    trend: "steady"
  },
  {
    label: "已记录去过地点",
    value: "19",
    detail: "过去的旅行正被补充到足够细，可以复用到下次行程设计。",
    trend: "up"
  },
  {
    label: "愿望清单把握度",
    value: "83%",
    detail: "多数已保存目的地已经附带时间、预算和至少一个具体锚点。",
    trend: "up"
  }
];

export const activeTrips: TravelOverviewItem[] = [
  {
    id: "travel-1",
    title: "京都秋日重访",
    country: "日本",
    window: "11 月 18 日 - 11 月 25 日",
    stage: "规划中",
    budget: "预计 ¥18,800",
    summary: "正在围绕红叶时机、茶屋和一个慢节奏的郊外日进行微调。",
    highlights: ["岚山清晨", "宇治茶路线", "旅馆候选"]
  },
  {
    id: "travel-2",
    title: "里斯本轻冬之行",
    country: "葡萄牙",
    window: "1 月 12 日 - 1 月 17 日",
    stage: "已预订",
    budget: "预计 ¥10,500",
    summary: "机酒已定，接下来重点是设计以步行为主、摩擦更低的路线。",
    highlights: ["阿尔法玛住宿", "辛特拉一日", "河岸日落地图"]
  },
  {
    id: "travel-3",
    title: "首尔设计周末",
    country: "韩国",
    window: "春季可弹性安排",
    stage: "灵感",
    budget: "预计 ¥13,800",
    summary: "更偏向街区、书店和展览的城市探索，而不是传统打卡清单。",
    highlights: ["圣水洞", "国立现代美术馆", "文具巡游"]
  }
];

export const travelArchive: TravelOverviewItem[] = [
  {
    id: "travel-4",
    title: "台北吃饭回血之旅",
    country: "中国台湾",
    window: "2025 年 10 月",
    stage: "已到访",
    budget: "实际 ¥8,100",
    summary: "一次紧凑的城市旅行，街区节奏和用餐安排比景点数量更重要。",
    highlights: ["大稻埕", "早市", "茶馆笔记"]
  },
  {
    id: "travel-5",
    title: "大阪咖啡与唱片漫游",
    country: "日本",
    window: "2025 年 5 月",
    stage: "已到访",
    budget: "实际 ¥12,900",
    summary: "已经整理出可复用地图、喜欢的街道和更适合未来日本旅行的模板。",
    highlights: ["中崎町", "中之岛", "爵士酒吧清单"]
  }
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "timeline-1",
    title: "开始阅读《The Creative Act》",
    date: "2026年2月14日",
    kind: "book",
    badge: "书籍",
    description: "季度规划后，把它从积压清单提升为当前重点阅读。"
  },
  {
    id: "timeline-2",
    title: "看完《爱在黎明破晓前》",
    date: "2026年3月8日",
    kind: "screen",
    badge: "电影",
    description: "补了一条简短观后笔记，记录对白节奏和克制情绪表达。"
  },
  {
    id: "timeline-3",
    title: "预订里斯本住宿",
    date: "2026年3月5日",
    kind: "travel",
    badge: "旅行",
    description: "把行程状态从规划中推进到已预订，并附上街区参考。"
  },
  {
    id: "timeline-4",
    title: "把《Sea of Tranquility》加入优先队列",
    date: "2026年3月2日",
    kind: "book",
    badge: "书籍",
    description: "大概率会成为当前非虚构读完后的下一本小说。"
  },
  {
    id: "timeline-5",
    title: "暂停《熊家餐馆》",
    date: "2026年2月27日",
    kind: "screen",
    badge: "剧集",
    description: "主动暂停，避免把注意力切得过碎。"
  }
];

export const analyticsMetrics: AnalyticsMetric[] = [
  {
    label: "完成节奏",
    value: "平均每 5.2 天",
    detail: "跨全部项目类型统计，旅行阶段变化也计入节奏。"
  },
  {
    label: "平均满意度",
    value: "4.6 / 5",
    detail: "书籍评分更稳定，旅行回忆的满意度整体最高。"
  },
  {
    label: "有明确意图的队列占比",
    value: "71%",
    detail: "大多数排队项目都已经附带原因、情绪或时间范围。"
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
    detail: "DATABASE_URL 可用后，就可以把 mock 查询切换为真实 select。"
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
