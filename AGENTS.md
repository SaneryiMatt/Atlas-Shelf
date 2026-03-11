# AGENTS.md

## Project
This repository is a personal media and travel tracking system.
It manages books, movies/series/anime, and travel places in one unified product.

Primary goals:
- clean architecture
- polished UI
- scalable data model
- maintainable TypeScript code
- production-ready full-stack web app

## Tech stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- PostgreSQL
- Drizzle ORM
- Vercel

## Working style
When making changes:
1. Read the existing structure first.
2. Prefer small, targeted changes over large rewrites.
3. Reuse existing patterns and components.
4. Explain key file changes after implementation.
5. Do not introduce unnecessary abstractions.

## Architecture rules
- Prefer server components unless client interactivity is necessary.
- Keep data access logic out of page components when possible.
- Put database schema under `src/lib/db/schema`.
- Put database queries and mutations under `src/lib/db`.
- Keep feature-specific UI and logic grouped by module.
- Reuse shared UI components instead of duplicating markup.

## Code quality rules
- Use strict TypeScript-friendly patterns.
- Avoid `any` unless absolutely necessary.
- Keep functions focused and readable.
- Prefer explicit naming over clever shortcuts.
- Do not leave dead code or commented-out blocks.
- Keep imports tidy.

## Forms and validation
- Use Zod for form validation.
- Keep validation schemas near the relevant feature or form logic.
- Show meaningful validation feedback in the UI.
- Preserve a consistent form layout across books, movies, and travels.

## Database rules
- Use a shared `items` table for all item types.
- Use type-specific detail tables for book, screen, and travel metadata.
- Keep migrations consistent with schema changes.
- Do not make destructive schema changes unless the task explicitly requires it.

## UI rules
- The UI should feel modern, calm, and organized.
- Prefer clean spacing, good typography, and consistent card patterns.
- Reuse shadcn/ui primitives whenever possible.
- Avoid visual clutter.
- All new pages should work well on desktop and mobile.

## Product rules
The product has these main modules:
- Dashboard
- Books
- Movies
- Travels
- Timeline
- Analytics
- Settings

When implementing new features, keep long-term extensibility in mind.
Future content types may include games, podcasts, exhibitions, and courses.

## AI feature rules
- Keep AI integrations modular.
- Separate prompt construction from storage logic.
- Generated content should be stored in explicit fields.
- Do not hardcode model-specific assumptions deeply into feature code.

## File safety
- Do not rename or move large parts of the project unless required.
- Do not rewrite unrelated modules.
- Do not add dependencies unless they have a clear purpose.

## Completion checklist
Before finishing a task:
- Ensure the code is consistent with project structure.
- Ensure validation and types are reasonable.
- Ensure no obvious duplicated logic was introduced.
- Summarize changed files and rationale.
- Mention any follow-up improvements that are still optional.

## Commands
Use these commands when relevant:
- `npm run dev`
- `npm run lint`
- `npm run build`

If a command fails, inspect the error and fix the root cause rather than bypassing it.
