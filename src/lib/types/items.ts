export type ItemType = "book" | "screen" | "travel";
export type ItemStatus = "wishlist" | "planned" | "in_progress" | "completed" | "paused";
export type TrendDirection = "up" | "steady" | "down";

export interface DashboardStat {
  label: string;
  value: string;
  detail: string;
  trend: TrendDirection;
}

export interface QueueItem {
  id: string;
  title: string;
  type: ItemType;
  status: string;
  meta: string;
  summary: string;
  tags: string[];
}

export interface BookOverviewItem {
  id: string;
  title: string;
  author: string;
  status: string;
  progress: string;
  pages: number;
  rating: string;
  summary: string;
  tags: string[];
}

export interface ScreenOverviewItem {
  id: string;
  title: string;
  format: string;
  director: string;
  platform: string;
  status: string;
  runtime: string;
  rating: string;
  summary: string;
  tags: string[];
}

export interface TravelOverviewItem {
  id: string;
  title: string;
  country: string;
  window: string;
  stage: string;
  budget: string;
  summary: string;
  highlights: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  kind: ItemType;
  badge: string;
  description: string;
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  detail: string;
}

export interface CategoryBreakdown {
  label: string;
  value: string;
  accent: string;
}

export interface SettingsPanel {
  title: string;
  description: string;
  status: string;
  detail: string;
}

export interface ProjectPreview {
  id: string;
  title: string;
  type: ItemType;
  status: string;
  updatedAtLabel: string;
}

export interface ProjectNotePreview {
  id: string;
  projectTitle: string;
  noteType: string;
  noteTitle: string;
  recordedAtLabel: string;
}

export interface ProjectTagPreview {
  id: string;
  name: string;
  usageCount: number;
}

