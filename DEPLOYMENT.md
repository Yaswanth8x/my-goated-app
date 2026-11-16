# DEPLOYMENT.md — Deployment Guide

**Workspace 5 Part 124**

## Target Architecture

- **Frontend/Backend:** Vercel (or equivalent) — Next.js App Router
- **Database/Auth/Storage:** Supabase Cloud
- **AI:** Provider APIs (Gemini, OpenAI, Anthropic)

## Environments

- **Development:** localhost:3000 + Supabase local or cloud + Mock AI
- **Production:** Vercel + Supabase Cloud + Provider APIs

## Steps

### 1. Supabase Setup (Production)

1. Create project at https://supabase.com
2. Get URL, anon key, service_role key from Settings → API
3. Get DATABASE_URL from Settings → Database → Connection string URI
4. Run migrations:
   - Option A: `npx prisma db push` + run `supabase/migrations/001_initial_schema_rls.sql` in SQL Editor
   - Option B: Supabase CLI `supabase db push`
5. Create storage buckets in Dashboard → Storage → New Bucket:
   - documents (private)
   - avatars (public)
   - project-assets (private)
   - portfolio (private)
   - course-materials (private)
6. Set bucket policies via SQL or Dashboard (see RLS SQL file)

### 2. Vercel Setup

1. Go to https://vercel.com → New Project → Import GitHub repo Yaswanth8x/my-goated-app
2. Set Environment Variables in Vercel Dashboard → Settings → Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (secret)
   - DATABASE_URL (Supabase Postgres URI)
   - AUTH_SECRET (random 32+ chars)
   - ENCRYPTION_KEY (32 chars)
   - GEMINI_API_KEY (optional, free tier)
   - OPENAI_API_KEY (optional)
   - ANTHROPIC_API_KEY (optional)
   - NEXT_PUBLIC_APP_URL = your Vercel URL (e.g., https://my-goated-app.vercel.app)
   - Feature flags: NEXT_PUBLIC_AI_HUB_ENABLED=true, etc.
3. Deploy — Vercel will run `npm run build`
4. Check build logs — should see ✓ Compiled successfully with 21+ routes
5. Open deployed URL — should see Polymath OS dashboard

### 3. Environment Variables Separation

**PUBLIC (NEXT_PUBLIC_*):** Safe for browser, visible in JS
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_AI_PROVIDER
- Feature flags

**SERVER SECRET:** Never exposed to browser
- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL
- AUTH_SECRET
- ENCRYPTION_KEY
- OPENAI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY, OPENROUTER_API_KEY

Never commit .env with real secrets — .gitignore blocks it.

### 4. Feature Flags

Use env vars to disable half-built features:

```env
NEXT_PUBLIC_AI_HUB_ENABLED=true
NEXT_PUBLIC_RAG_ENABLED=true
NEXT_PUBLIC_FREELANCE_ENABLED=false
NEXT_PUBLIC_MULTI_USER_ENABLED=true
NEXT_PUBLIC_ACADEMIC_ENGINE_ENABLED=true
NEXT_PUBLIC_ADMIN_ENABLED=false
```

In code, check via `src/lib/featureFlags.ts` isFeatureEnabled()

### 5. Testing Deployment

- Fresh install test: Clone, install, build, dev
- Auth: Signup, login, logout
- Multi-user isolation: Two users, try to read each other's docs — RLS should block (0 rows)
- AI: Configure provider, chat with streaming, persistence
- RAG: Upload doc, ask question, citations
- PYQ, tests, mastery, CGPA, projects, portfolio, freelancing, orchestrator, backup/export, mobile UI, production build, security, RLS, error handling — see final 35-point quality gate in REBUILD_ROADMAP

### 6. Performance Optimization (Part 122)

- Avoid huge client bundles, unnecessary rerenders, loading entire libraries
- Use pagination, lazy loading, server-side retrieval, caching
- Bundle analyzer: `npm run build` shows route sizes
- For now, build is optimized via Next.js Turbopack

### 7. Security Audit (Part 123)

See SECURITY.md

### 8. Backup/Export (Part 120)

- JSON export via `src/lib/polymath/backup.ts` generateBackup(), exportToJson(), downloadFile()
- CSV where useful
- Document export where practical
- Future: encrypted backup
- Supabase is primary cloud, not just local browser storage

### 9. Monitoring

- Vercel logs for frontend/backend
- Supabase Dashboard → Logs for DB, Auth, Storage
- AI usage dashboard via /api/ai/usage
- Admin dashboard via /admin (shows users, provider status, usage, errors, DB health, storage, logs, feature flags — not private conversations)

### 10. Rollback

If deployment fails:

```bash
git log --oneline
# Find latest stable checkpoint, e.g., checkpoint/workspace-4-parts-76-to-100
git checkout <checkpoint-commit>
git checkout -b rollback/stable
git push origin rollback/stable
# Or in Vercel, redeploy previous deployment
```

## Current Status

- Workspace 1-4 complete, Workspace 5 in progress
- Build passes 21+ routes
- Mock mode works without Supabase or AI keys
- Real mode requires Supabase project + AI keys (Gemini free tier recommended)
- Deployment ready for Vercel + Supabase
