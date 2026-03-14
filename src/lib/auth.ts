import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AppUserSummary {
  displayName: string;
  email: string | null;
  initials: string;
}

export async function getCurrentUser() {
  if (!hasSupabaseConfig) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

function getDisplayName(user: User) {
  const metadata = user.user_metadata;
  const displayNameCandidates = [
    metadata?.full_name,
    metadata?.name,
    metadata?.user_name,
    metadata?.preferred_username
  ];

  for (const candidate of displayNameCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "已登录账号";
}

function getInitials(displayName: string) {
  const normalized = displayName.trim();

  if (!normalized) {
    return "U";
  }

  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return normalized.slice(0, 2).toUpperCase();
}

export function toAppUserSummary(user: User): AppUserSummary {
  const displayName = getDisplayName(user);

  return {
    displayName,
    email: user.email ?? null,
    initials: getInitials(displayName)
  };
}

export async function requireUser() {
  if (!hasSupabaseConfig) {
    redirect("/login?error=supabase_not_configured");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
