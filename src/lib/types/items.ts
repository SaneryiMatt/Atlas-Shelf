export type ItemType = "book" | "screen" | "travel" | "application";
export type ItemStatus = "wishlist" | "planned" | "in_progress" | "completed" | "paused";
export type TrendDirection = "up" | "steady" | "down";
export type ModuleListSort = "updated" | "rating" | "applied";

export interface DashboardStat {
  label: string;
  value: string;
  detail: string;
  trend: TrendDirection;
}

export interface QueueItem {
  id: string;
  title: string;
  type: "book" | "screen";
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
  pages: number | null;
  rating: string;
  summary: string;
  tags: string[];
}

export interface BookListItem extends BookOverviewItem {
  updatedAtLabel: string;
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

export interface ScreenListItem extends ScreenOverviewItem {
  updatedAtLabel: string;
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

export interface TravelListItem extends TravelOverviewItem {
  ratingLabel: string;
  updatedAtLabel: string;
}

export interface ApplicationOverviewItem {
  id: string;
  title: string;
  company: string;
  role: string;
  source: string;
  stageLabel: string;
  resultLabel: string;
  appliedAtLabel: string;
  interviewAtLabel: string;
  summary: string;
}

export interface ApplicationListItem extends ApplicationOverviewItem {
  updatedAtLabel: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  kind: ItemType;
  badge: string;
  description: string;
  href?: string;
}

export interface TimelineMonthGroup {
  key: string;
  label: string;
  events: TimelineEvent[];
}

export interface TimelinePageData {
  totalCount: number;
  groups: TimelineMonthGroup[];
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

export interface ChartDatum {
  label: string;
  value: number;
  displayValue: string;
  accent?: string;
}

export interface DashboardAnalyticsData {
  year: number;
  annualTotal: number;
  typeDistribution: ChartDatum[];
  ratingDistribution: ChartDatum[];
  monthlyTrend: ChartDatum[];
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

export type SearchResultKind = "book" | "movie" | "travel" | "application";

export interface SearchResultItem {
  id: string;
  kind: SearchResultKind;
  title: string;
  href: string;
  summary: string;
  meta: string;
  statusLabel: string;
  metricLabel: string;
  metricValue: string;
  updatedAtLabel: string;
  tags: string[];
}

export interface SearchResultGroup {
  key: SearchResultKind;
  title: string;
  description: string;
  items: SearchResultItem[];
}

export interface SearchPageData {
  query: string;
  totalCount: number;
  groups: SearchResultGroup[];
}

export interface ProjectDetailField {
  label: string;
  value: string;
}

export interface ProjectDetailMetaItem {
  label: string;
  value: string;
  badge?: boolean;
}

export interface ProjectDetailTag {
  id: string;
  name: string;
  color: string;
}

export interface ProjectDetailNote {
  id: string;
  title: string;
  body: string;
  typeLabel: string;
  recordedAtLabel: string;
  sourceUrl: string | null;
  pinned: boolean;
}

export interface ProjectDetailPhoto {
  id: string;
  url: string | null;
  caption: string | null;
  altText: string;
  kindLabel: string;
  createdAtLabel: string;
  isPrimary: boolean;
  storageLabel: string;
}

export interface ProjectDetailPageData {
  id: string;
  title: string;
  statusLabel: string;
  ratingLabel: string;
  summary: string | null;
  updatedAtLabel: string;
  fields: ProjectDetailField[];
  tags: ProjectDetailTag[];
  notes: ProjectDetailNote[];
  photos: ProjectDetailPhoto[];
  canManage: boolean;
}

export interface BookEditorValues {
  title: string;
  author: string;
  status: ItemStatus;
  rating: string;
  startedAt: string;
  completedAt: string;
  summary: string;
  tags: string;
}

export interface MovieEditorValues {
  title: string;
  director: string;
  releaseYear: string;
  platform: string;
  status: ItemStatus;
  rating: string;
  note: string;
  tags: string;
}

export interface TravelEditorValues {
  placeName: string;
  country: string;
  city: string;
  status: ItemStatus;
  travelDate: string;
  description: string;
}

export interface ApplicationEditorValues {
  company: string;
  role: string;
  source: string;
  stage: string;
  result: string;
  appliedAt: string;
  interviewAt: string;
  notes: string;
}

export interface BookDetailPagePayload {
  detail: ProjectDetailPageData;
  editor: BookEditorValues;
}

export interface MovieDetailPagePayload {
  detail: ProjectDetailPageData;
  editor: MovieEditorValues;
}

export interface TravelDetailPagePayload {
  detail: ProjectDetailPageData;
  editor: TravelEditorValues;
}

export interface ApplicationDetailPagePayload {
  detail: ProjectDetailPageData;
  editor: ApplicationEditorValues;
  headerMeta: ProjectDetailMetaItem[];
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type NotificationStatus = "active" | "read" | "processed";
export type NotificationKind = "book_stale" | "screen_stale" | "travel_upcoming";

export interface NotificationItem {
  key: string;
  kind: NotificationKind;
  sourceType: "book" | "screen" | "travel";
  title: string;
  description: string;
  href: string;
  meta: string;
  status: NotificationStatus;
  statusLabel: string;
  triggeredAtLabel: string;
}

export interface NotificationCenterData {
  unreadCount: number;
  items: NotificationItem[];
  canManage: boolean;
}
