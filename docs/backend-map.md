# PART 5 — Map Existing Backend

**Date:** 2026-09-26
**Workspace 1 Part 5**

## WHAT WE ARE BUILDING
Mapping what backend code exists.

## CURRENT STATE

**Files found:**
- No `src/app/api/` folder
- No `app/api/` folder
- No server actions
- No middleware.ts
- No Supabase clients
- No Prisma schema (package.json references Prisma but prisma/ folder was empty, we just created placeholder)

**package.json scripts:**
- `db:push`, `db:seed`, `db:setup` — intend Prisma but no schema

**Conclusion:** Backend = 0% implemented.

## TARGET BACKEND (from 125-part spec)

### Architecture Choice
- **Next.js API Routes** + **Server Actions** + **Supabase**
- Supabase provides: PostgreSQL, Auth, Storage, Realtime, RLS
- No separate Express server needed — Next.js handles backend

### Folder Structure
```
src/app/api/
  auth/
    callback/route.ts       // Supabase auth callback
  chat/
    route.ts                // POST message, streaming response
    [id]/route.ts
  conversations/
    route.ts
  documents/
    route.ts                // upload
    [id]/route.ts
    chunk/route.ts
  courses/
    route.ts
  skills/
    route.ts
  experts/
    route.ts
  projects/
    route.ts
  portfolio/
    route.ts
  pyq/
    route.ts
  usage/
    route.ts                // AI usage tracking

src/lib/supabase/
  client.ts                 // createBrowserClient
  server.ts                 // createServerClient with cookies
  admin.ts                  // service role, server-only
  middleware.ts             // refresh session

middleware.ts               // Root middleware for protected routes

prisma/
  schema.prisma             // For local dev + Supabase Postgres target
  seed.ts                   // Seed data (sample curriculum)
  migrations/               // Or supabase/migrations/

supabase/
  migrations/               // SQL migrations for RLS, buckets, etc.
  config.toml               // Supabase config
```

### API Design Principles
- **REST** via Next.js route handlers
- **Validation** with zod (already in dependencies)
- **Auth check** on every private route: get user from Supabase server client, check user_id ownership
- **Never expose** service_role key, LLM keys to client
- **Error handling**: Return WHAT happened, WHY, WHAT TO DO — not just "Something went wrong"

### Security
- Every table has `user_id` foreign key
- RLS policies: `auth.uid() = user_id`
- File upload validation
- Input validation with zod
- Prompt injection defense: Retrieved documents are DATA, not instructions

### What Should Be Preserved
- `zod` dependency — keep for validation
- Prisma intention — keep but configure for PostgreSQL (Supabase)

### What Should Be Created
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `middleware.ts`
- `prisma/schema.prisma` with all entities
- `src/app/api/*` routes incrementally

## TEST
- Currently no backend to test
- After Part 14, `src/lib/supabase/*` should exist and `npm run build` should not error on missing modules

## STATUS
✅ Mapped — Backend 0% implemented, target defined.

