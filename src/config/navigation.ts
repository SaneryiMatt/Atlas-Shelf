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
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Unified pulse across media and travel."
  },
  {
    title: "Books",
    href: "/books",
    icon: BookOpen,
    description: "Reading pipeline, notes, and backlog."
  },
  {
    title: "Movies",
    href: "/movies",
    icon: Clapperboard,
    description: "Films, series, anime, and watchlists."
  },
  {
    title: "Travels",
    href: "/travels",
    icon: Compass,
    description: "Dream trips, bookings, and memories."
  },
  {
    title: "Timeline",
    href: "/timeline",
    icon: TimerReset,
    description: "A chronological view of everything tracked."
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Completion patterns and habit insights."
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Data, integrations, and AI workflow settings."
  }
] as const;

export const workspaceHighlights = [
  "Shared item core with extensible detail tables",
  "Server-first page composition with isolated query functions",
  "Consistent cards, tables, and calm visual language"
] as const;

export const productTagline = "Track stories, screens, and journeys in one calm workspace.";

export const productBadge = {
  label: "Production-ready foundation",
  icon: Sparkles
};

