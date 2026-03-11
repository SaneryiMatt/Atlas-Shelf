import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { signInAction } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login"
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "Enter a valid email address and a password with at least 8 characters.",
  supabase_not_configured: "Supabase environment variables are missing. Populate .env.local before signing in.",
  "Invalid login credentials": "Supabase rejected the email or password.",
  "Email not confirmed": "Confirm the user email in Supabase before signing in."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const message = params.error ? errorMessages[params.error] ?? params.error : null;

  return (
    <main className="min-h-screen bg-page-glow px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[2rem] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,242,235,0.88))] p-8 shadow-soft">
          <Badge variant="warm" className="w-fit gap-2">
            <ShieldCheck className="size-3.5" />
            Supabase protected workspace
          </Badge>
          <div className="space-y-3">
            <h1 className="font-serif text-5xl text-foreground">Atlas Shelf</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Authentication is handled by Supabase Auth. Postgres stays behind the server query layer and storage is reserved for media assets such as covers, travel photos, and attachments.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
              Auth sessions refresh through Next middleware.
            </div>
            <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
              Drizzle continues to use the Supabase Postgres connection string.
            </div>
            <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
              Storage helpers are ready for bucket-backed uploads and public asset URLs.
            </div>
          </div>
        </section>

        <Card className="border-white/50 bg-white/85">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use an email and password account configured in Supabase Auth.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signInAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={!hasSupabaseConfig}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={!hasSupabaseConfig}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="At least 8 characters"
                />
              </div>
              {message ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {message}
                </div>
              ) : null}
              <Button type="submit" className="h-11 w-full gap-2" disabled={!hasSupabaseConfig}>
                <LockKeyhole className="size-4" />
                Sign in
              </Button>
            </form>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              After setup, create your first user in Supabase Auth or invite yourself via the dashboard.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <Link href="https://supabase.com/dashboard" className="underline underline-offset-4">
                Open Supabase dashboard
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}