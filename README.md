# Vibe Coding Test

A production-ready foundation for a personal media and travel tracking platform built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, PostgreSQL, and Drizzle ORM.

## Modules

- Dashboard
- Books
- Movies
- Travels
- Timeline
- Analytics
- Settings

## Architecture highlights

- `src/app`: route entrypoints and shared app layouts
- `src/modules`: feature-grouped page rendering and module-specific schemas
- `src/components`: shared layout, data display, and shadcn-style UI primitives
- `src/lib/db/schema`: unified `items` table with detail tables for books, screens, and travels
- `src/lib/db/queries`: page-facing server query functions that can swap from mock data to database reads

## Getting started

```bash
npm install
npm run dev
```

## Environment

Set these when wiring the project to real services:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

