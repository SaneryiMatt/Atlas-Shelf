"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const signUpSchema = signInSchema.extend({
  confirmPassword: z.string().min(8)
});

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");

  if (!host) {
    return null;
  }

  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol = forwardedProto ?? (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function signInAction(formData: FormData) {
  if (!hasSupabaseConfig) {
    redirect("/login?error=supabase_not_configured");
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login?error=invalid_credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signUpAction(formData: FormData) {
  if (!hasSupabaseConfig) {
    redirect("/login?mode=signup&error=supabase_not_configured");
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    redirect("/login?mode=signup&error=invalid_signup_input");
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    redirect("/login?mode=signup&error=password_mismatch");
  }

  const supabase = await createSupabaseServerClient();
  const origin = await getRequestOrigin();
  const emailRedirectTo = origin
    ? new URL("/login?status=email_confirmed", origin).toString()
    : undefined;

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: emailRedirectTo ? { emailRedirectTo } : undefined
  });

  if (error) {
    redirect(`/login?mode=signup&error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?status=check_email");
}

export async function signOutAction() {
  if (!hasSupabaseConfig) {
    redirect("/login?error=supabase_not_configured");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}