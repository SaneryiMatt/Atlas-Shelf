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
    label: "Active items",
    value: "42",
    detail: "Across reading, watching, and trip planning with a steady weekly review rhythm.",
    trend: "up"
  },
  {
    label: "Completed this quarter",
    value: "18",
    detail: "A healthy balance between long-form books, comfort rewatches, and one completed trip.",
    trend: "steady"
  },
  {
    label: "Priority backlog",
    value: "9",
    detail: "Curated shortlist for the next 30 days to keep decisions calm and focused.",
    trend: "down"
  }
];

export const dashboardFocusItems: QueueItem[] = [
  {
    id: "book-1",
    title: "The Creative Act",
    type: "book",
    status: "Reading",
    meta: "Rick Rubin ? 432 pages",
    summary: "High-signal notes and reflective pacing make this the current long-form focus.",
    tags: ["Creativity", "Non-fiction"]
  },
  {
    id: "screen-1",
    title: "Perfect Days",
    type: "screen",
    status: "Watch next",
    meta: "Movie ? Wim Wenders ? 124 min",
    summary: "Queued as a low-noise film pick for the next weekend reset.",
    tags: ["Film", "Quiet"]
  },
  {
    id: "travel-1",
    title: "Kyoto Autumn Return",
    type: "travel",
    status: "Planning",
    meta: "Japan ? 7 nights ? Late November",
    summary: "Route, ryokan shortlist, and neighborhood food map are already scoped.",
    tags: ["Culture", "Food"]
  }
];

export const dashboardRecentMoments: TimelineEvent[] = [
  {
    id: "moment-1",
    title: "Finished Before Sunrise",
    date: "March 8, 2026",
    kind: "screen",
    badge: "Watched",
    description: "Closed a mini trilogy sprint and logged a reflective note on dialogue-first storytelling."
  },
  {
    id: "moment-2",
    title: "Booked a Lisbon riverside stay",
    date: "March 5, 2026",
    kind: "travel",
    badge: "Booked",
    description: "Locked the base stay so the rest of the trip can be planned around walking routes and day trips."
  },
  {
    id: "moment-3",
    title: "Captured a margin note from The Creative Act",
    date: "March 3, 2026",
    kind: "book",
    badge: "Note added",
    description: "Saved a reusable idea about keeping taste and craft separate during rough drafts."
  }
];

export const booksStats: DashboardStat[] = [
  {
    label: "Reading now",
    value: "3",
    detail: "One deep nonfiction title, one novel, and one light essay collection in rotation.",
    trend: "steady"
  },
  {
    label: "Finished in 2026",
    value: "11",
    detail: "Average completion pace is comfortably above the target of two books per month.",
    trend: "up"
  },
  {
    label: "Annotated titles",
    value: "27",
    detail: "Reusable highlights and notes are increasingly captured as structured insights.",
    trend: "up"
  }
];

export const currentBooks: BookOverviewItem[] = [
  {
    id: "book-1",
    title: "The Creative Act",
    author: "Rick Rubin",
    status: "Reading",
    progress: "68%",
    pages: 432,
    rating: "4.6",
    summary: "Working through it slowly and extracting prompts for future writing and product thinking.",
    tags: ["Creativity", "Notes"]
  },
  {
    id: "book-2",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    status: "Reading",
    progress: "42%",
    pages: 416,
    rating: "4.4",
    summary: "Keeping it in rotation as the more emotional, character-driven counterweight to nonfiction.",
    tags: ["Novel", "Character"]
  },
  {
    id: "book-3",
    title: "The Book of Delights",
    author: "Ross Gay",
    status: "Paused",
    progress: "23%",
    pages: 288,
    rating: "4.1",
    summary: "Short daily entries make it a good morning book when schedule pressure is low.",
    tags: ["Essays", "Light"]
  }
];

export const bookBacklog: BookOverviewItem[] = [
  {
    id: "book-4",
    title: "Sea of Tranquility",
    author: "Emily St. John Mandel",
    status: "Queued",
    progress: "0%",
    pages: 272,
    rating: "4.3",
    summary: "Shortlisted as the next literary fiction read once the current nonfiction title wraps.",
    tags: ["Sci-fi", "Priority"]
  },
  {
    id: "book-5",
    title: "Clear Thinking",
    author: "Shane Parrish",
    status: "Queued",
    progress: "0%",
    pages: 304,
    rating: "4.0",
    summary: "Potential systems-thinking follow-up for dashboard and analytics decisions.",
    tags: ["Decision-making", "Non-fiction"]
  },
  {
    id: "book-6",
    title: "Pachinko",
    author: "Min Jin Lee",
    status: "Wishlist",
    progress: "0%",
    pages: 512,
    rating: "4.8",
    summary: "Long-form family saga sitting in the long-weekend bucket rather than immediate queue.",
    tags: ["Epic", "Wishlist"]
  }
];

export const bookNotes = [
  "Keep note capture separate from completion state so unfinished books can still generate reusable knowledge.",
  "Support multiple reading sessions per title for better habit analytics later.",
  "Reserve room for AI-generated summaries and quote clustering on each book record."
];

export const screenStats: DashboardStat[] = [
  {
    label: "Watchlist focus",
    value: "7",
    detail: "A deliberately small queue split between movies, one prestige series, and one anime season.",
    trend: "down"
  },
  {
    label: "Completed in 2026",
    value: "24",
    detail: "Strong follow-through on movie nights without turning the watchlist into clutter.",
    trend: "up"
  },
  {
    label: "Rewatch candidates",
    value: "5",
    detail: "Saved intentionally for comfort viewing and seasonal rituals.",
    trend: "steady"
  }
];

export const currentScreens: ScreenOverviewItem[] = [
  {
    id: "screen-1",
    title: "Perfect Days",
    format: "Movie",
    director: "Wim Wenders",
    platform: "Theater list",
    status: "Watch next",
    runtime: "124 min",
    rating: "4.8",
    summary: "Expected to land as a quiet, restorative watch rather than an action-heavy weekend pick.",
    tags: ["Film", "Calm"]
  },
  {
    id: "screen-2",
    title: "Frieren",
    format: "Anime",
    director: "Keiichiro Saito",
    platform: "Crunchyroll",
    status: "Watching",
    runtime: "28 eps",
    rating: "4.9",
    summary: "Currently the strongest long-form screen companion, with episode notes worth preserving.",
    tags: ["Anime", "Fantasy"]
  },
  {
    id: "screen-3",
    title: "The Bear",
    format: "Series",
    director: "Christopher Storer",
    platform: "Disney+",
    status: "Paused",
    runtime: "3 seasons",
    rating: "4.7",
    summary: "Paused intentionally until there is enough space to absorb the tone and pacing properly.",
    tags: ["Series", "Character"]
  }
];

export const screenBacklog: ScreenOverviewItem[] = [
  {
    id: "screen-4",
    title: "Past Lives",
    format: "Movie",
    director: "Celine Song",
    platform: "Digital rental",
    status: "Queued",
    runtime: "106 min",
    rating: "4.8",
    summary: "Pinned for a reflective solo watch night with room for post-watch journaling.",
    tags: ["Drama", "Priority"]
  },
  {
    id: "screen-5",
    title: "Shogun",
    format: "Series",
    director: "Jonathan van Tulleken",
    platform: "Disney+",
    status: "Wishlist",
    runtime: "10 eps",
    rating: "4.6",
    summary: "Saved as a prestige-series commitment once another long-form show is completed.",
    tags: ["Historical", "Queue"]
  },
  {
    id: "screen-6",
    title: "Whisper of the Heart",
    format: "Movie",
    director: "Yoshifumi Kondo",
    platform: "Blu-ray",
    status: "Rewatch",
    runtime: "111 min",
    rating: "4.9",
    summary: "Comfort rewatch candidate for times when new picks feel too mentally expensive.",
    tags: ["Animation", "Comfort"]
  }
];

export const travelStats: DashboardStat[] = [
  {
    label: "Trips in planning",
    value: "4",
    detail: "A balanced mix of one near-term city break and three slower-burn wishlist itineraries.",
    trend: "steady"
  },
  {
    label: "Visited places logged",
    value: "19",
    detail: "Past trips are increasingly documented with enough detail to revisit favorite neighborhoods.",
    trend: "up"
  },
  {
    label: "Bucket list confidence",
    value: "83%",
    detail: "Most saved destinations now include timing, cost, and at least one concrete anchor idea.",
    trend: "up"
  }
];

export const activeTrips: TravelOverviewItem[] = [
  {
    id: "travel-1",
    title: "Kyoto Autumn Return",
    country: "Japan",
    window: "November 18 to November 25",
    stage: "Planning",
    budget: "$2,600 est.",
    summary: "Refining the pace around foliage timing, tea houses, and one slower day outside the city center.",
    highlights: ["Arashiyama dawn", "Uji tea route", "Ryokan shortlist"]
  },
  {
    id: "travel-2",
    title: "Lisbon Light Winter",
    country: "Portugal",
    window: "January 12 to January 17",
    stage: "Booked",
    budget: "$1,450 est.",
    summary: "Stay and flights are in place, leaving room to design a low-friction walking-first itinerary.",
    highlights: ["Alfama stay", "Sintra day trip", "River sunset map"]
  },
  {
    id: "travel-3",
    title: "Seoul Design Weekend",
    country: "South Korea",
    window: "Flexible spring slot",
    stage: "Idea",
    budget: "$1,900 est.",
    summary: "Saved around neighborhoods, bookstores, and exhibitions rather than a traditional checklist trip.",
    highlights: ["Seongsu", "MMCA", "Stationery crawl"]
  }
];

export const travelArchive: TravelOverviewItem[] = [
  {
    id: "travel-4",
    title: "Taipei Food Reset",
    country: "Taiwan",
    window: "October 2025",
    stage: "Visited",
    budget: "$1,120 actual",
    summary: "A compact city trip where neighborhoods and meal pacing were more valuable than attraction count.",
    highlights: ["Dadaocheng", "Morning market", "Tea house notes"]
  },
  {
    id: "travel-5",
    title: "Osaka Café + Record Crawl",
    country: "Japan",
    window: "May 2025",
    stage: "Visited",
    budget: "$1,780 actual",
    summary: "Logged with reusable maps, favorite streets, and a tighter template for future Japan trips.",
    highlights: ["Nakazakicho", "Nakanoshima", "Jazz bar list"]
  }
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "timeline-1",
    title: "Started reading The Creative Act",
    date: "February 14, 2026",
    kind: "book",
    badge: "Book",
    description: "Promoted from backlog to active reading after a quarterly planning reset."
  },
  {
    id: "timeline-2",
    title: "Finished Before Sunrise",
    date: "March 8, 2026",
    kind: "screen",
    badge: "Movie",
    description: "Logged with a short post-watch note about conversational pacing and emotional restraint."
  },
  {
    id: "timeline-3",
    title: "Booked Lisbon accommodation",
    date: "March 5, 2026",
    kind: "travel",
    badge: "Travel",
    description: "Moved the trip from planning to booked and attached neighborhood-level references."
  },
  {
    id: "timeline-4",
    title: "Added Sea of Tranquility to priority queue",
    date: "March 2, 2026",
    kind: "book",
    badge: "Book",
    description: "Pulled forward as the likely fiction follow-up to the current nonfiction read."
  },
  {
    id: "timeline-5",
    title: "Paused The Bear",
    date: "February 27, 2026",
    kind: "screen",
    badge: "Series",
    description: "Paused intentionally to avoid splitting attention across too many heavy shows."
  }
];

export const analyticsMetrics: AnalyticsMetric[] = [
  {
    label: "Completion cadence",
    value: "Every 5.2 days",
    detail: "Average across all item types with travel milestones treated as stage changes."
  },
  {
    label: "Average satisfaction",
    value: "4.6 / 5",
    detail: "Books are slightly more consistent than screens, while travel memories score highest."
  },
  {
    label: "Intentional queue ratio",
    value: "71%",
    detail: "Most queued items already have a clear reason, mood, or time-box attached."
  }
];

export const analyticsByType: CategoryBreakdown[] = [
  { label: "Books", value: "64%", accent: "#8b6f47" },
  { label: "Movies & series", value: "78%", accent: "#48645b" },
  { label: "Travels", value: "52%", accent: "#7f9b91" }
];

export const analyticsByRegion: CategoryBreakdown[] = [
  { label: "Japan", value: "38%", accent: "#c48c66" },
  { label: "Southern Europe", value: "24%", accent: "#7f9b91" },
  { label: "East Asia cities", value: "18%", accent: "#5a796e" },
  { label: "Other", value: "20%", accent: "#d4bf98" }
];

export const analyticsInsights = [
  "Shortlists perform best when capped below ten items per module.",
  "Travel planning momentum improves when each saved place includes one anchor neighborhood.",
  "Books with note capture enabled are twice as likely to be completed intentionally rather than abandoned."
];

export const settingsPanels: SettingsPanel[] = [
  {
    title: "Database layer",
    description: "Drizzle schema is ready for Supabase Postgres with a unified items table plus detail tables.",
    status: "Ready",
    detail: "Swap mock queries to live selects once DATABASE_URL is present."
  },
  {
    title: "AI fields",
    description: "Pages are structured to support generated summaries, recommendations, and note distillation.",
    status: "Modular",
    detail: "Keep prompt construction isolated from persistence and display logic."
  },
  {
    title: "Forms and validation",
    description: "Zod schemas are grouped by module so create and edit flows can stay local and typed.",
    status: "Prepared",
    detail: "Add server actions or route handlers without reworking the page tree."
  }
];

