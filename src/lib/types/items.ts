export type ItemType = "book" | "screen" | "travel";
export type ItemStatus = "wishlist" | "planned" | "in_progress" | "completed" | "paused";
export type TrendDirection = "up" | "steady" | "down";
export type ModuleListSort = "updated" | "rating";

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

export type SearchResultKind = "book" | "movie" | "travel";

export interface SearchResultItem {
  id: string;
  kind: SearchResultKind;
  title: string;
  href: string;
  summary: string;
  meta: string;
  statusLabel: string;
  ratingLabel: string;
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
  travelDate: string;
  description: string;
  latitude: string;
  longitude: string;
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

export interface PaginationInfo {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

