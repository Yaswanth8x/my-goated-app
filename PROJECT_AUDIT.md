# PROJECT_AUDIT.md — Workspace 1 / Part 1

**Date:** 2026-09-26
**Branch:** arena/01a0dd70-my-goated-app
**Base Commit:** 23b588140e0a38116da3018297171412f910ec9a (main)
**Auditor Role:** Senior Full-Stack + RAG + Supabase Architect

---

## 0. EXECUTIVE SUMMARY

The repository `Yaswanth8x/my-goated-app` as cloned contains **only scaffolding files** from `create-next-app`:
- `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.env.example`, `.env`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`
- **No `app/`, no `src/`, no `prisma/`, no `components/`, no `lib/`, no `docs/`**
- `README.md` describes a much larger Polymath OS with Prisma + SQLite + mock AI, curriculum, RAG, experts, freelance, etc. That code is **not present** in git history. The single commit "Add files via upload" only uploaded config files, not source.
- Therefore the app is 95% missing. We must rebuild from near-zero while preserving the intended stack and vision.

Framework detected: **Next.js 16.3.6, React 19.2.8, TypeScript 5, Tailwind v4, Prisma 6.16.3 (intended), npm**.

---

## 1. WHAT ALREADY WORKS

- `package.json` defines valid Next.js scripts: `dev`, `build`, `start`, `lint`, `db:push`, `db:seed`, `db:setup`.
- `tsconfig.json` is valid with path alias `@/* -> ./src/*` (though src missing).
- `next.config.ts` is minimal but valid.
- `.env.example` provides starter env shape.
- `.gitignore` correctly ignores `node_modules`, `.next`, `.env*`, `prisma/dev.db`.
- Git remote is configured and branch tracking works.
- Node tooling versions are modern.

Nothing else works because there is no application code.

## 2. WHAT PARTIALLY WORKS

- **Package dependencies declared** but not installed (no `node_modules` in repo, as expected). `npm install` will be needed.
- **Prisma intention**: scripts reference Prisma but no `prisma/schema.prisma` exists, so `npx prisma generate` will fail.
- **Tailwind v4**: declared as dependency but no `app/globals.css` or `tailwind.config` — will not produce styles.
- **ENV architecture**: `.env` and `.env.example` exist but only contain `DATABASE_URL=file:./dev.db`, `AUTH_SECRET`, `AI_PROVIDER`, `OPENAI_*`. No Supabase keys, no separation of public vs secret.
- **README** describes architecture that is not implemented.

## 3. WHAT IS BROKEN

- **Build fails**: `next build` requires `app/` or `pages/` directory. Currently fails with "Couldn't find any `pages` or `app` directory".
- **Dev fails**: `next dev` same issue.
- **Prisma fails**: No schema file.
- **No routing**: No file-system routes.
- **No components**: No UI.
- **No database**: No schema, no migrations.
- **No auth**: No Supabase, no NextAuth, no session handling.
- **No AI code**: No provider abstraction, no chat, no RAG.
- **Path alias broken**: `@/*` points to `./src/*` but src doesn't exist; any import will fail.

## 4. WHAT IS MISSING (vs 125 Requirements)

**Workspace 1 (1-25) missing all:**
- Architecture diagram, target architecture, project structure, env architecture, dev config, Supabase integration, PostgreSQL schema, migrations, RLS, user profiles, auth, protected routes, session state, cloud persistence, storage, error/logging, integration test.

**Workspace 2 (26-50) missing all:**
- AI provider interface, Gemini/OpenAI/Anthropic/Mock adapters, model registry, settings UI, secure key handling, router, fallback, usage tracking, cost control, chat UI, streaming, course AI selector, course context, professor persona, teaching modes, conversation persistence, memory, ingestion, embeddings/RAG, citations.

**Workspace 3 (51-75) missing all:**
- Curriculum ingestion, course DB, semester structure, units/topics, COs, mastery, prerequisite graph, PYQ upload/extraction/classification/family/frequency/probability, question generator, CA simulators, viva, answer evaluation, error classification, spaced revision, mastery engine, CGPA engine, academic dashboard.

**Workspace 4 (76-100) missing all:**
- Professional dashboard, skill DB/graph, expert framework, custom expert creation, prompt upload/parser/config, expert memory/RAG, 9+ expert implementations, project engine, portfolio, freelancing engine, client simulation, readiness.

**Workspace 5 (101-125) missing all:**
- Global coordinator, cross-domain graphs, academic/professional bridge, goal/priority/anti-overload/academic protection, weekly/monthly/semester/year reviews, career/research dashboards, resume bridge, evidence graph, analytics, global search, notifications, backup/export, admin dashboard, performance, security audit, deployment.

**Docs missing:** `ARCHITECTURE.md`, `SETUP.md`, `DATABASE.md`, `AI.md`, `RAG.md`, `DEPLOYMENT.md`, `TROUBLESHOOTING.md`, `CHANGELOG.md`, `docs/` folder.

## 5. WHAT SHOULD BE PRESERVED

- **Stack choice**: Next.js 16 + React 19 + TypeScript + Tailwind v4 + Prisma is solid for Polymath OS. Keep.
- **npm** as package manager (lock file exists).
- **.env.example pattern**: Keep concept, but expand.
- **README vision**: The Polymath OS vision (World A CEG ECE + World B skills + global orchestrator) is well articulated; preserve as product spec.
- **Git history**: Single commit is clean; we will build checkpoints on top.
- **.gitignore**: Good, keep and extend slightly for Supabase.
- **Prisma scripts**: `db:push`, `db:seed`, `db:setup` naming is useful, keep.

## 6. WHAT SHOULD BE REFACTORED

- **tsconfig path**: Currently `@/* -> ./src/*`. For App Router we typically want `./src/*` OR `./*`. Decide: Use `./src/*` and create `src/` folder. This is better for large app. Keep but ensure src exists.
- **.env structure**: Must be split into PUBLIC (NEXT_PUBLIC_*) vs SERVER SECRET. Add Supabase URL, anon key, service role, AI keys separation.
- **package.json**: Add Supabase packages: `@supabase/supabase-js`, `@supabase/ssr`. Add `zod` already there good for validation. Add AI SDKs later incrementally.
- **next.config.ts**: Needs to allow Supabase image domains, env validation.
- **README**: Currently mixes run instructions for Windows only; refactor to beginner-friendly cross-platform.

## 7. WHAT SHOULD BE REMOVED

- Nothing destructive yet because almost no code. But:
- Remove any claim in README that features are "real" when code missing — we will replace with honest status in new docs.
- Remove unused `CLAUDE.md` placeholder (contains only "11") — replace with proper docs.
- Remove `AGENTS.md` nextjs-agent-rules placeholder once we have real app — it's auto-generated by Next dev, not needed in git.

## 8. WHAT SHOULD BE POSTPONED

- **YouTube engine** (explicitly noted as absent in README to avoid hallucination) — postpone to Workspace 5.
- **Exam timer simulator UI** — postpone to Workspace 3 Part 65-67.
- **Real embeddings + pgvector** — start with mock/deterministic vectors in Workspace 2, swap to real embeddings later.
- **Realtime collaboration** — postpone, use only where useful.
- **Enterprise roles (Teacher/Mentor/Collaborator)** — MVP only USER/ADMIN.
- **Encrypted backup** — basic JSON export first, encryption later.
- **Performance optimization** (Part 122) — postpone until app exists.
- **Multi-provider local Ollama** — postpone, interface should allow but not implement fully now.

## 9. CRITICAL ARCHITECTURAL PROBLEMS

1. **No source tree**: The biggest blocker — no `app/` directory means Next.js cannot boot.
2. **No database schema**: 125-part spec requires ~30+ tables (users, profiles, courses, units, topics, COs, documents, chunks, embeddings, conversations, messages, memory, skills, experts, projects, portfolio, freelance, etc.). Zero tables exist.
3. **No Supabase integration**: Spec requires Supabase as default backend, but current `.env` uses SQLite file. Must design migration path: Prisma can target PostgreSQL (Supabase) — we should configure Prisma to use PostgreSQL and create Supabase client.
4. **No auth architecture**: No session, no RLS, no protected routes — multi-user isolation impossible.
5. **No AI abstraction**: No provider interface — if we hardcode one provider now, we violate core principle.
6. **No RAG pipeline**: Document upload → chunk → embed → retrieve → cite is core product, but zero code.
7. **No state management**: No user/session context, no course context.
8. **No error/logging**: No boundaries, no structured logging.
9. **No testing harness**: No vitest/jest/playwright — cannot verify parts.
10. **Scalability risk**: If we build all 125 parts in one app folder without modular `src/` structure, it will become unmaintainable. Need clean `src/` layering: `src/app`, `src/components`, `src/lib`, `src/lib/supabase`, `src/lib/ai`, `src/lib/rag`, etc.

## 10. RECOMMENDED REBUILD ORDER (5 Workspaces)

### Workspace 1: CORE REPAIR + ARCHITECTURE + DATABASE + AUTH (Parts 1-25)
- **1-3**: Audit (this file), try to run app, record errors.
- **4-10**: Map (frontend/backend/db/api/ai) — document that nothing exists, create target architecture diagrams, decide stack.
- **11-13**: Clean structure: create `src/app`, `src/components`, `src/lib`, `src/types`, `prisma/`, `supabase/`, `docs/`, `public/`. Create `.env.example` architecture with PUBLIC vs SECRET. Setup dev config (ESLint, Tailwind, TS).
- **14-18**: Integrate Supabase: install `@supabase/supabase-js`, `@supabase/ssr`, create client files (`src/lib/supabase/client.ts`, `server.ts`, `admin.ts`), create PostgreSQL schema in Prisma (User, Profile, Course, Semester, Unit, Topic, CO, Document, Chunk, Conversation, Message, etc.), create migrations, create RLS policies SQL.
- **19-25**: Auth: Supabase Auth email/password, user profiles table, protected routes via middleware, session state via Context, cloud persistence, file storage buckets, error/logging system, Workspace 1 integration test.

### Workspace 2: LLM / AI CORE + COURSE AI + RAG (26-50)
- Provider interface (`src/lib/ai/types.ts`, `provider.ts`), adapters (`gemini.ts`, `openai.ts`, `anthropic.ts`, `mock.ts`), model registry (`models.ts`), settings UI, secure key handling (server-only), router, fallback, usage tracking, cost control.
- Chat UI: sidebar, conversation list, composer, streaming via SSE, course selector, expert selector, model selector.
- Course-specific context, professor persona, teaching modes, conversation persistence, memory, document ingestion (PDF/DOCX/TXT), embeddings (mock first, then real), RAG retrieval + citations, integration test that real streaming + persistence works.

### Workspace 3: ACADEMIC ENGINE (51-75)
- Curriculum ingestion from syllabi refs, course DB, semester structure, units/topics, COs, mastery, prerequisite graph.
- PYQ pipeline: upload, extraction (text), classification, family detection, frequency analysis, HIGH/MEDIUM/LOWER relevance (never guarantee future).
- Question generator, CA-1/CA-2/End-sem simulators, viva mode, answer evaluation, error classification, spaced revision, mastery engine, CGPA/GPA engine (honest, no hallucinated regulation), academic dashboard.

### Workspace 4: SKILLS + MULTI-EXPERT + PROJECTS + PORTFOLIO + FREELANCING (76-100)
- Professional dashboard, skill DB/graph, expert framework, custom expert creation via master prompt upload, prompt parser, expert config, expert memory/RAG.
- Implement 9 experts: Web Dev, App Dev, Full Stack, AI Automation, Video Editing, Photography, Cybersecurity (educational), Finance (educational), plus future creation.
- Project engine (BEGINNER→CLIENT), portfolio engine, freelancing engine (services, leads, clients, briefs, proposals, deliverables), client simulation, readiness matrix.

### Workspace 5: POLYMATH + ORCHESTRATOR + ANALYTICS + POLISH + DEPLOY (101-125)
- Global coordinator, cross-domain skill graph, academic/professional bridge, cross-domain project suggestions, goal engine, priority engine, anti-overload, academic protection, weekly/monthly/semester/year planners, career/research dashboards, resume/portfolio bridge, evidence graph, analytics, global search, notifications, backup/export, admin dashboard, performance optimization, security audit, deployment (Vercel + Supabase), final 35-point quality gate.

---

## APPENDIX: File Inventory (git ls-tree)

Only 12 files in HEAD:
- .env, .env.example, .gitignore, AGENTS.md, CLAUDE.md, README.md, eslint.config.mjs, next-env.d.ts, next.config.ts, package-lock.json, package.json, postcss.config.mjs, tsconfig.json

No app code.

## APPENDIX: Build Error Reproduction (anticipated)

Expected when running `npm run dev` without app folder:
```
Error: Couldn't find any `pages` or `app` directory. Please create one under the project root.
```

Expected when running `npx prisma generate`:
```
Error: Could not find Prisma Schema that is required for this command.
```

We will record actual outputs in Part 3.

## NEXT ACTION

Proceed to Workspace 1 Part 2: Run existing application and document errors.
Then Part 3: Record build/runtime errors.
Then Part 4-10: Architecture definition.
