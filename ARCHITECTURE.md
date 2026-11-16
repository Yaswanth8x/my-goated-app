# ARCHITECTURE.md — Target Architecture

**Date:** 2026-09-26
**Workspace 1 Parts 9-10**

## WHAT WE ARE BUILDING
We are defining the target architecture for the entire 125-part Polymath OS.

## WHY
So we don't build randomly. Architecture is the blueprint.

## CURRENT ARCHITECTURE (What exists)
```
[Empty]
- Only package.json, tsconfig, next.config
- No app/, no src/, no DB, no AI
```

## TARGET ARCHITECTURE (What we will build)

### 1. High-Level System Diagram

```
                    ┌─────────────────────────────────┐
                    │   USER BROWSER (Next.js App)    │
                    │  - React 19 Server Components   │
                    │  - Tailwind v4                  │
                    │  - Mobile Responsive            │
                    └──────────┬──────────────────────┘
                               │ HTTPS
                    ┌──────────▼──────────────────────┐
                    │   NEXT.JS APP ROUTER (Vercel)   │
                    │  - /app (pages)                 │
                    │  - /api (backend routes)        │
                    │  - middleware.ts (auth guard)   │
                    │  - Server Actions               │
                    └──────────┬──────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│   SUPABASE     │    │   AI PROVIDERS  │    │   STORAGE       │
│  - PostgreSQL  │    │  - Gemini       │    │  - documents    │
│  - Auth        │    │  - OpenAI       │    │  - avatars      │
│  - RLS         │    │  - Anthropic    │    │  - project-     │
│  - Realtime    │    │  - Mock         │    │    assets       │
│  - pgvector    │    │  - OpenRouter   │    │  - portfolio    │
└────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. Folder Structure (Clean Project Structure — Part 11)

```
my-goated-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (HOME)
│   │   ├── globals.css
│   │   ├── (auth)/login, signup
│   │   ├── academics/ [semester]/[course]
│   │   ├── skills/
│   │   ├── projects/
│   │   ├── portfolio/
│   │   ├── freelancing/
│   │   ├── career/
│   │   ├── documents/
│   │   ├── ai-hub/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── api/
│   │       ├── health/
│   │       ├── chat/
│   │       ├── conversations/
│   │       ├── documents/
│   │       ├── courses/
│   │       ├── skills/
│   │       ├── experts/
│   │       ├── projects/
│   │       ├── pyq/
│   │       └── admin/
│   ├── components/
│   │   ├── ui/ (Button, Card, Input, Dialog, etc.)
│   │   ├── layout/ (Sidebar, Header, Navigation, CommandBar)
│   │   ├── academic/ (CourseCard, UnitList, COMastery, PYQCard)
│   │   ├── ai/ (ChatSidebar, ChatArea, Composer, ModelSelector, TeachingModes, Citation)
│   │   ├── skills/ (SkillCard, ExpertCard, Roadmap)
│   │   └── projects/ (ProjectCard, PortfolioCard)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts (browser)
│   │   │   ├── server.ts (server with cookies)
│   │   │   └── admin.ts (service_role, server-only)
│   │   ├── ai/
│   │   │   ├── types.ts
│   │   │   ├── provider.ts (abstract)
│   │   │   ├── models.ts (registry)
│   │   │   ├── router.ts
│   │   │   ├── fallback.ts
│   │   │   ├── gemini.ts
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── mock.ts
│   │   │   ├── usage.ts
│   │   │   └── personas/ (academic, orchestrator, experts)
│   │   ├── rag/
│   │   │   ├── ingest.ts
│   │   │   ├── extract.ts
│   │   │   ├── chunk.ts
│   │   │   ├── embed.ts
│   │   │   ├── store.ts
│   │   │   ├── retrieve.ts
│   │   │   └── citations.ts
│   │   ├── academic/
│   │   │   ├── curriculum.ts
│   │   │   ├── pyq.ts
│   │   │   ├── mastery.ts
│   │   │   └── cgpa.ts
│   │   ├── utils.ts
│   │   ├── validation.ts (zod schemas)
│   │   └── logger.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── ai.ts
│   │   └── academic.ts
│   └── hooks/
│       ├── useAuth.ts
│       ├── useCourse.ts
│       └── useChat.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── supabase/
│   ├── migrations/ (SQL for RLS, buckets, pgvector)
│   └── config.toml
├── docs/
│   ├── frontend-map.md
│   ├── backend-map.md
│   ├── database-map.md
│   ├── api-map.md
│   ├── ai-map.md
│   ├── architecture.md (this file)
│   ├── data-model.md
│   ├── rag.md
│   ├── agents.md
│   └── roadmap.md
├── public/
├── storage/uploads/.gitkeep
├── middleware.ts
├── .env.example
├── .gitignore
└── package.json
```

### 3. Database Architecture (Supabase PostgreSQL)

```
auth.users (Supabase managed)
  |
  +-- profiles (id, user_id FK, role USER/ADMIN, display_name)
        |
        +-- semesters (id, number, name)
        |     +-- courses (id, semester_id, code, name, credits)
        |           +-- units (id, course_id, number, title)
        |           |     +-- topics (id, unit_id, title)
        |           +-- course_outcomes (id, course_id, code)
        |           +-- documents (id, user_id, course_id, unit_id, bucket, path)
        |                 +-- document_chunks (id, document_id, user_id, course_id, embedding vector)
        |           +-- pyqs (id, course_id, year, question_text)
        |           +-- tests (id, course_id, type)
        |
        +-- conversations (id, user_id, course_id, expert_id)
        |     +-- messages (id, conversation_id, user_id, role, content)
        |     +-- memories (id, user_id, course_id, expert_id, content)
        |
        +-- skills (id, name)
        |     +-- user_skills (user_id, skill_id, level, status NOW/NEXT/LATER/PARKED)
        |
        +-- experts (id, user_id, name, persona, master_prompt)
        |     +-- expert_memory (id, expert_id, user_id)
        |
        +-- projects (id, user_id, skill_id, expert_id, level BEGINNER→CLIENT)
        |     +-- portfolio_items (id, user_id, project_id)
        |
        +-- freelance_services, leads, clients, etc.
        |
        +-- ai_providers (id, user_id, provider, api_key_encrypted, enabled)
        +-- ai_usage (id, user_id, provider, model, tokens, cost)
        +-- goals, planner, analytics, notifications
```

**Every private table has:**
- `user_id` FK to auth.users
- RLS policy: `auth.uid() = user_id`
- Indexes on user_id, course_id, created_at

### 4. AI Architecture (Provider-Agnostic)

```
User Message
    |
    v
[Teaching Mode Buttons] -> "Explain simply", "Deep dive", "PYQ mode", etc.
    |
    v
[Context Builder]
  - SYSTEM prompt
  - EXPERT PERSONA (ECE Professor, Web Dev Expert, Global Orchestrator)
  - USER PROFILE
  - CURRENT COURSE/DOMAIN (course, unit, COs, mastery)
  - RELEVANT MEMORY (structured: "User struggles with pointers")
  - RETRIEVED DOCUMENTS (RAG: chunks filtered by course_id + similarity)
  - CURRENT CONVERSATION (last N messages, not entire history)
  - USER QUESTION
    |
    v
[AI Router]
  - Task analysis: simple explanation → cheap/free model
  - Large doc → high-context model
  - Coding → coding-capable model
  - Vision → vision-capable model
  - Deep reasoning → reasoning model
    |
    v
[Model Registry]
  - Lookup: provider, model_id, display_name, capabilities, context_window, cost_class
    |
    v
[Provider Interface]
  - abstract chat(), streamChat(), embed()
    |
    +-- GeminiProvider -> @google/generative-ai
    +-- OpenAIProvider -> openai SDK
    +-- AnthropicProvider -> @anthropic-ai/sdk
    +-- MockProvider -> deterministic, labeled "MOCK RESPONSE"
    |
    v
[Fallback System]
  - Try Gemini -> OpenAI -> Anthropic -> Mock
  - Only use paid if user enabled
    |
    v
[Streaming Response]
  - ReadableStream, text/event-stream
  - Stop generation button
    |
    v
[Save]
  - messages table
  - usage tracking (provider, model, tokens, cost)
  - citations (SOURCE, DOCUMENT, PAGE/SECTION, EXCERPT)
```

### 5. RAG Pipeline (Real)

```
UPLOAD (PDF/DOCX/PPTX/TXT/CSV/image)
  |
  v
EXTRACT (text extraction, OCR for images if possible)
  |
  v
CLEAN (remove headers/footers, normalize)
  |
  v
CHUNK (split into ~500 token chunks, overlap, preserve metadata)
  |
  v
METADATA (user_id, document_id, course_id, unit_id, topic_id, version, source, page, section, created_at)
  |
  v
EMBED (mock hash vectors first, then real embeddings via provider)
  |
  v
STORE (document_chunks table with pgvector)
  |
  v
RETRIEVE (when user asks: filter by course_id, similarity search, top K)
  |
  v
RERANK (if available, else skip)
  |
  v
LLM (with retrieved chunks as context)
  |
  v
ANSWER + CITATIONS (never fabricate citations)
```

### 6. Multi-User Architecture

```
User A (auth.uid() = a)
  - Can only see where user_id = a
  - RLS enforces at DB level, not just frontend
  - Manipulating ID in frontend does NOT bypass RLS

User B (auth.uid() = b)
  - Isolated workspace

Admin (role = ADMIN)
  - Can see system health, users count, provider status, errors, DB health, storage
  - NOT private conversations unless explicitly authorized
```

### 7. Navigation & UX (FUNCTION > DECORATION)

```
Main Nav:
HOME
ACADEMICS -> SEMESTER 1 -> PROGRAMMING IN C -> Overview, Units, Topics, COs, AI Professor, Notes, Docs, PYQs, Practice, Tests, Viva, Mastery, Mistakes, Revision, Analytics
SKILLS -> Skill Graph -> Expert List
PROJECTS -> Project Engine (BEGINNER→CLIENT)
PORTFOLIO
FREELANCING -> Services, Leads, Clients, Briefs, Proposals, Deliverables
CAREER
DOCUMENTS
AI HUB -> Recent Chats, Course Professors, Domain Experts, New Chat, New Expert, Recent Docs, Current Context
ANALYTICS
SETTINGS -> AI Providers, Profile, Backup/Export
```

### 8. Global Orchestrator (Polymath)

```
                    GLOBAL AI COORDINATOR
                              |
              +---------------+---------------+
              |                               |
       ACADEMIC AI HUB                 PROFESSIONAL AI HUB
              |                               |
       COURSE PROFESSORS              DOMAIN EXPERTS
              |                               |
      +-------+-------+             +---------+---------+
      |       |       |             |         |         |
     C    Digital   Math          Web       Edit      Photo
     AI   Elec.     AI            AI         AI        AI
              |
        PYQ / TEST / RAG
              |
         COURSE MEMORY

Backed by:
SUPABASE (PostgreSQL, Auth, Storage, RLS, Realtime)

AI via:
AI PROVIDER ABSTRACTION (Gemini, OpenAI, Anthropic, Mock) + Model Registry + Router + Fallback + Cost Control
```

**Orchestrator answers:** "What should I do next?" based on deadlines, mastery, career goals, not just encouraging everything.

**Anti-overload:** Every skill has NOW/NEXT/LATER/PARKED. During exams, academics take priority, reduce professional workload.

### 9. Environment Variable Architecture (Part 12)

```
PUBLIC (NEXT_PUBLIC_* — exposed to browser, safe):
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_APP_URL

SERVER SECRET (never exposed to browser):
  SUPABASE_SERVICE_ROLE_KEY
  DATABASE_URL (for Prisma, points to Supabase Postgres)
  AUTH_SECRET
  OPENAI_API_KEY (if server default)
  GEMINI_API_KEY
  ANTHROPIC_API_KEY
  ENCRYPTION_KEY (for encrypting user-provided keys)

User-provided keys (stored encrypted in DB, via ai_providers table):
  - User enters in Settings → AI Providers
  - Encrypted server-side, never in frontend state
```

### 10. Security Architecture

- Auth: Supabase Auth email/password
- RLS: All private tables have `auth.uid() = user_id` policies
- Storage RLS: Buckets private, user_id based
- API keys: Server-only, never in HTML/JS/logs/GitHub/plaintext DB without encryption
- Input validation: zod on all routes
- File upload validation: type, size
- Prompt injection defense: Retrieved docs are DATA, not instructions
- No hallucinated regulations, PYQs, videos, guaranteed grades/income

### 11. Deployment Architecture

```
Development: localhost:3000 + Supabase local or cloud + Mock AI
Production: Vercel (frontend+backend) + Supabase Cloud (DB, Auth, Storage) + Provider APIs (Gemini, OpenAI, Anthropic)

Feature Flags:
  AI_HUB_ENABLED
  RAG_ENABLED
  FREELANCE_ENABLED
  MULTI_USER_ENABLED

Separate dev/prod envs
```

### 12. What Should Be Preserved vs Refactored

**Preserve:**
- Next.js 16 + React 19 + TypeScript + Tailwind v4 + Prisma intention
- npm
- .env.example pattern
- README vision (Polymath OS)
- zod for validation
- Mock provider concept

**Refactor:**
- tsconfig path alias — keep but ensure src exists (we did)
- .env — split PUBLIC vs SECRET
- next.config.ts — add Supabase image domains
- README — make beginner-friendly cross-platform

**Remove:**
- AGENTS.md auto-generated placeholder (after real app exists)
- CLAUDE.md placeholder (contains only "11")

**Postpone:**
- YouTube engine (no fabricated links)
- Exam timer UI
- Real embeddings + pgvector (mock first)
- Realtime everywhere (only where useful)
- Enterprise roles (USER/ADMIN only for MVP)
- Encrypted backup (JSON export first)
- Performance optimization until app exists
- Ollama local provider (interface allows, but not implement fully now)

## STATUS
✅ Architecture defined — Parts 9-10 complete.

## NEXT
Part 11: Clean project structure (create real files, not just empty folders)
Part 12: Env architecture
Part 13: Dev config
