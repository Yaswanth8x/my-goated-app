# CHANGELOG.md — Polymath OS

## [Unreleased] — Workspace 2 Complete (Parts 26-50) ✅

### Added — Workspace 2: LLM/AI Core + Course AI + RAG (Parts 26-50) — MOST IMPORTANT

#### Part 26: AI Architecture
- `AI.md` — Provider abstraction, model registry, router, fallback, cost control, chat UI, RAG, safety, offline mode, error UX

#### Part 27: Provider Interface
- `src/lib/ai/types.ts` — ChatMessage, Citation, CourseContext, ExpertContext, UserContext, MemoryContext, RetrievedChunk, AIRequest, AIResponse, ModelInfo, ProviderConfig, RouterInput/Output, UsageRecord, StreamChunk, TeachingMode, ProviderName, CostClass
- `src/lib/ai/provider.ts` — Abstract AIProvider with name, displayName, isConfigured(), getModels(), chat(), streamChat(), embed(), buildSystemPrompt() (SYSTEM + PERSONA + COURSE + USER + MEMORY + RAG + CONVERSATION + QUESTION), buildMessages() last 20, logUsage, handleError with WHAT/WHY/WHAT_TO_DO

#### Part 28-30: Adapters
- `src/lib/ai/gemini.ts` — GoogleGenerativeAI, 4 models (1.5-flash free 1M context, 1.5-pro 2M, 8b cheapest, embedding), chat, streamChat, embed, validateKey
- `src/lib/ai/openai.ts` — openai SDK, OpenAI-compatible (OpenRouter), 4 models (4o-mini low cost vision, 4o premium, 3.5 legacy, embedding), chat, streamChat, embed, cost estimation
- `src/lib/ai/anthropic.ts` — @anthropic-ai/sdk, Claude 3.5 Sonnet/Haiku/Opus, chat, streamChat, cost estimation

#### Part 31: Mock Adapter
- `src/lib/ai/mock.ts` — Always works, no credits, clearly labeled MOCK RESPONSE, deterministic, mock embeddings via hash 1536 dim normalized, teaching modes (explain_simply, deep_dive, example, pyq_mode with HIGH/MEDIUM/LOWER relevance, viva, quiz), citations, streaming simulation

#### Part 32: Model Registry
- `src/lib/ai/models.ts` — modelRegistry 14 models (mock, gemini, openai, anthropic, openrouter, embeddings), getModelById, getModelsByProvider, getFreeModels, getVisionModels, getEmbeddingModels, sortByCost, costClassOrder

#### Part 33-34: Provider Settings & Secure Keys
- `src/app/settings/ai-providers/page.tsx` — All providers with cost badges, enable toggle, API key input masked show/hide, model selector, links to get keys (aistudio.google.com free tier), how to configure via .env, model registry list, usage & cost control dashboard, router & fallback explanation
- `src/lib/ai/keys.ts` — Server-only, encryptApiKey AES-256-CBC with ENCRYPTION_KEY, decryptApiKey, validateApiKeyFormat (sk-, sk-ant-, sk-or-), getProviderConfigsForUser env fallback TODO Supabase, maskApiKey, never expose to client

#### Part 35: Router
- `src/lib/ai/router.ts` — AIRouter.route() based on task, teaching_mode, has_attachments, has_large_context, available_providers, user_preferences, needsVision/LargeContext/Reasoning/Coding/Simple, sortByCost, routeByTeachingMode

#### Part 36: Fallback
- `src/lib/ai/fallback.ts` — FallbackSystem.chatWithFallback and streamChatWithFallback, ordered configs preferred first mock last, tries chain Gemini→OpenAI→Anthropic→Mock, structured error, getProviderConfigsFromEnv

#### Part 37-38: Usage & Cost Control
- `src/lib/ai/usage.ts` — UsageTracker.track, getUsageForUser, getTotalCost, getUsageByProvider, checkBudget monthly_budget warning_threshold hard_stop, in-memory mock TODO Supabase, estimateCost
- `src/app/api/ai/usage/route.ts` — GET usage, total cost, by provider, budget
- `src/app/api/ai/models/route.ts` — GET models with filter free/vision/provider

#### Part 39-40: Chat UI & Streaming
- `src/components/ai/ChatArea.tsx` — Messages, streaming indicator, citations, copy, retry, feedback, auto-scroll, empty state with try examples
- `src/components/ai/MessageComposer.tsx` — Textarea auto-resize, Shift+Enter, Send/Stop, attachments placeholder, disclaimer
- `src/components/ai/ModelSelector.tsx` — Filter all/free/low_cost/premium, AUTO router option, cost badges, context window, description
- `src/components/ai/TeachingModeButtons.tsx` — 15 modes (Explain, Simply, Deep dive, Visualize, Example, Analogy, Derive, Solve, Hint, Quiz, Viva, PYQ, Exam, Mistakes, Connect, Real-world), active indicator
- `src/components/ai/CitationCard.tsx` — SOURCE, DOCUMENT, PAGE/SECTION, EXCERPT, never fabricated
- `src/app/ai-hub/page.tsx` — Full real chat: Left sidebar conversations + course/expert selector, Center chat header + settings + chat area + composer, Right context panel (course, expert, model, RAG, how to test), streaming via fetch + reader.read() + decoder, abort controller stop, conversation persistence via localStorage, course context, teaching modes, citations, mock mode warning
- `src/app/api/chat/route.ts` — POST streaming ReadableStream text/event-stream, validates with zod, gets user via Supabase or mock, provider configs from env, router selects provider/model if AUTO, RAG retrieval if course_id, builds AIRequest with course/expert/user/memory/retrieved/teaching_mode, budget check, stream with fallback, track usage, citations, error handling WHAT/WHY/WHAT_TO_DO

#### Part 41-42: Course AI Selector & Context
- Course selector in AI Hub sidebar (CS3353, EC3352, EC3401, etc.), passed as course_id to API, AIRequest course_context, buildSystemPrompt includes CURRENT COURSE CONTEXT, RAG filter by course_id, right panel shows context

#### Part 43: Personas
- `src/lib/ai/personas/academic.ts` — academicPersona deep explainer Socratic exam analyst problem solver visual viva mentor Feynman clarity safety no hallucination HIGH/MEDIUM/LOWER relevance, course-specific personas C/Digital/Math, getAcademicPersona()
- `src/lib/ai/personas/orchestrator.ts` — globalOrchestratorPersona coordination not teaching What should I do next prioritization academic protection anti-overload, expertBasePersona, expertPersonas web/photography/ai-automation, getExpertPersona()

#### Part 44: Teaching Modes
- TeachingMode type 15 modes + default, TeachingModeButtons UI, buildSystemPrompt mode instructions, mock different responses per mode

#### Part 45: Conversation Persistence
- `src/lib/ai/conversations.ts` — Conversation interface, getConversations, getConversation, createConversation, updateConversation, addMessageToConversation, deleteConversation, clearAll, localStorage + in-memory mock TODO Supabase, auto-title from first message

#### Part 46: Memory
- `src/lib/ai/memory.ts` — Memory interface, getMemories, addMemory, extractMemoriesFromMessage detects struggles prefers_visual prefers_simple completed, clearMemories, structured useful info not full history, per course/expert/global, localStorage TODO Supabase

#### Part 47-49: RAG
- `src/lib/rag/chunk.ts` — chunkText 2000 chars 500 tokens overlap 200 preserve paragraphs split sentences detect page numbers metadata user_id document_id course_id unit_id topic_id source page section created_at, extractTextFromFileType
- `src/lib/rag/embed.ts` — mockEmbed hash 1536 dim normalized, embedText with provider fallback to mock, cosineSimilarity, embedBatch
- `src/lib/rag/retrieve.ts` — StoredChunk RetrieveOptions in-memory addChunksToMemory clearMemory getMemoryChunks retrieveRelevantChunks user_id course_id filter cosine similarity topK threshold rerankChunks boost
- `src/lib/rag/citations.ts` — buildCitationsFromChunks formatCitationsForPrompt formatCitationsForDisplay validateCitations
- `src/app/api/documents/upload/route.ts` — POST FormData file course_id unit_id title validate 10MB extract text chunk embed store in memory return doc metadata + preview chunks
- `src/app/documents/page.tsx` — Real upload UI with file input, title, course, unit, upload & ingest, result + error display, stored chunks list in-memory mock, how to test RAG + citations, pipeline details
- `RAG.md` — Full pipeline doc, metadata, citations, doc types, vision, cost optimization, current implementation, next steps, testing, security

#### Part 50: Integration Test
- `docs/workspace-2-integration-test.md` — Checklist, how to run fresh install mock mode test, real provider test, RAG test, course context, teaching modes, persistence, model registry, router, usage, security, known limitations, exit criteria
- Build: 21 routes (added /api/ai/models, /api/ai/usage, /api/chat, /api/documents/upload, /settings/ai-providers)
- Exit criteria met: Can open app, select course, select provider/model, send message, receive real streaming response (mock works without keys, real with keys), see streaming, continue conversation, reload page, recover conversation

### Added — Workspace 1 Complete (Parts 1-25)

#### Part 1: Repository Audit
- `PROJECT_AUDIT.md` — Full audit: what works, broken, missing, preserve, refactor, remove, postpone, critical problems, rebuild order
- `HEALTH_REPORT.md` — Quick health check: Build ❌, Frontend ❌, Backend ❌, DB ❌, AI ❌, etc.
- `REBUILD_ROADMAP.md` — 125 parts in 5 workspaces with exit criteria

#### Part 4-8: Mapping
- `docs/frontend-map.md` — Frontend 0% implemented, target App Router structure
- `docs/backend-map.md` — Backend 0% implemented, target API routes + Supabase
- `docs/database-map.md` — DB 0% implemented, target 30+ tables, RLS, indexes
- `docs/api-map.md` — API 0% implemented, target 30 endpoints
- `docs/ai-map.md` — AI 0% implemented, target provider abstraction, RAG, safety

#### Part 9-10: Architecture
- `ARCHITECTURE.md` — Target architecture with diagrams: high-level, folder structure, DB, AI, RAG, multi-user, navigation, orchestrator, env, security, deployment

#### Part 11: Clean Project Structure
- Created `src/app/` with `layout.tsx`, `page.tsx`, `globals.css`
- Created `src/components/layout/Sidebar.tsx`, `Header.tsx`
- Created `src/components/ui/Button.tsx`, `Card.tsx`
- Created placeholder pages: `/academics`, `/skills`, `/projects`, `/portfolio`, `/freelancing`, `/career`, `/documents`, `/ai-hub`, `/analytics`, `/settings`, `/login`, `/signup`
- Created `src/app/api/health/route.ts` — health check
- Build now succeeds: `npm run build` → Compiled successfully (previously failed with "Couldn't find any pages or app directory")
- `src/lib/utils.ts`, `src/types/database.ts`

#### Part 12: Env Architecture
- Updated `.env.example` with PUBLIC vs SERVER SECRET separation
- Created `src/lib/validation.ts` — zod validation for env
- Created `src/lib/env.ts` — centralized env access with safety
- Documented feature flags: AI_HUB_ENABLED, RAG_ENABLED, etc.

#### Part 13: Dev Config
- Updated `next.config.ts` — Supabase image domains, server actions, headers
- Created `middleware.ts` — placeholder for auth guard (full in Part 20)
- Created `src/lib/logger.ts` — structured logging (WHAT, WHY, WHAT TO DO)
- Added `@supabase/supabase-js`, `@supabase/ssr` dependencies

#### Part 14: Supabase Integration
- Created `src/lib/supabase/client.ts` — browser client
- Created `src/lib/supabase/server.ts` — server client with cookies, getUser, getSession
- Created `src/lib/supabase/admin.ts` — service_role client (server-only)
- Updated `middleware.ts` — Supabase session refresh + protected routes logic

#### Part 15-16: PostgreSQL Schema & Migrations
- Created `prisma/schema.prisma` — 20+ models: Profile, Semester, Course, Unit, Topic, CO, Document, Chunk, Conversation, Message, AiProvider, AiUsage, ModelRegistry, Memory, Pyq, Test, Skill, UserSkill, Expert, Project, Portfolio, FreelanceService, Goal, CgpaRecord
- Created `prisma/seed.ts` — sample data: 8 semesters, 12 ECE courses, 5 units each, 3 topics per unit, 5 COs per course, 8 skills, 4 builtin experts, 4 models
- Created `prisma.config.ts` — Prisma config file (replaces deprecated package.json#prisma)
- Created `supabase/migrations/001_initial_schema_rls.sql` — pgvector extension, handle_new_user trigger, RLS policies for all private tables, public read for curriculum, storage bucket notes, indexes
- Created `DATABASE.md` — schema overview, RLS, storage buckets, how to run migrations

#### Part 18-19: Auth
- Created `src/components/auth/AuthProvider.tsx` — Context with user, session, signUp, signIn, signOut, isSupabaseConfigured, mock mode (yaswanth@local / ceg-ece)
- Created `src/hooks/useAuth.ts`
- Updated `src/app/layout.tsx` — wrapped with AuthProvider
- Updated `src/app/(auth)/login/page.tsx` — functional login with mock fallback, error handling, beginner explanation
- Updated `src/app/(auth)/signup/page.tsx` — functional signup, requires Supabase

#### Part 20-24: Protected Routes, Session, Storage, Logging
- Updated `middleware.ts` — real Supabase session refresh, protected route check (currently permissive for mock mode, strict in production)
- Updated `src/app/settings/page.tsx` — shows auth status, env architecture PUBLIC vs SECRET, AI providers placeholder, storage buckets, error logging format
- `src/lib/supabase/storage.ts` — upload, getUrl, delete, list, 5 buckets
- Logger already in `src/lib/logger.ts`

#### Part 25: Integration Test
- `docs/workspace-1-integration-test.md` — Full checklist, tests
- `SETUP.md` — Beginner setup guide
- `TROUBLESHOOTING.md` — Common errors & fixes
- `CHANGELOG.md` — this file
- `README.md` updated

### Fixed
- Critical blocker: `npm run build` now succeeds (was failing with "Couldn't find any pages or app directory")
- `package.json` — removed deprecated `prisma` property, added `prisma.config.ts`
- `tsconfig.json` path alias `@/*` now works because `src/` exists
- AI Hub now has real streaming chat, not just placeholder

### Known Issues / Blocked
- `npx prisma generate` fails in some sandboxes due to network blocking binaries.prisma.sh — workaround: use Supabase SQL editor or mock mode. App boots without Prisma client if not imported.
- Supabase not configured by default — app runs in mock mode, real persistence requires Supabase project (see SETUP.md)
- RLS policies SQL file created but not yet applied to real Supabase — need to run in Supabase SQL editor after `db push`
- Storage buckets need manual creation in Supabase Dashboard
- Real PDF parsing not fully implemented — upload TXT extracted from PDFs for now (honest)
- Real embeddings use mock hash vectors for now — real via OpenAI/Gemini when configured, pgvector for storage

---

## [0.1.0] — Initial Commit (2026-09-26)

- Only config files: package.json, tsconfig, next.config, .env.example, README, AGENTS.md, CLAUDE.md, .gitignore
- No app code — build failed

---

## Roadmap

- **Workspace 1 (1-25):** Core Repair — ✅ COMPLETE (25/25)
- **Workspace 2 (26-50):** LLM/AI Core + RAG — ✅ COMPLETE (25/25) — Mock works without keys, real with keys, streaming, course context, RAG, citations, persistence
- **Workspace 3 (51-75):** Academic Engine — TODO NEXT
- **Workspace 4 (76-100):** Skills + Experts + Projects + Portfolio + Freelancing — TODO
- **Workspace 5 (101-125):** Polymath + Orchestrator + Analytics + Deploy — TODO


### Added — Part 1: Repository Audit
- `PROJECT_AUDIT.md` — Full audit: what works, broken, missing, preserve, refactor, remove, postpone, critical problems, rebuild order
- `HEALTH_REPORT.md` — Quick health check: Build ❌, Frontend ❌, Backend ❌, DB ❌, AI ❌, etc.
- `REBUILD_ROADMAP.md` — 125 parts in 5 workspaces with exit criteria

### Added — Part 4-8: Mapping
- `docs/frontend-map.md` — Frontend 0% implemented, target App Router structure
- `docs/backend-map.md` — Backend 0% implemented, target API routes + Supabase
- `docs/database-map.md` — DB 0% implemented, target 30+ tables, RLS, indexes
- `docs/api-map.md` — API 0% implemented, target 30 endpoints
- `docs/ai-map.md` — AI 0% implemented, target provider abstraction, RAG, safety

### Added — Part 9-10: Architecture
- `ARCHITECTURE.md` — Target architecture with diagrams: high-level, folder structure, DB, AI, RAG, multi-user, navigation, orchestrator, env, security, deployment

### Added — Part 11: Clean Project Structure
- Created `src/app/` with `layout.tsx`, `page.tsx`, `globals.css`
- Created `src/components/layout/Sidebar.tsx`, `Header.tsx`
- Created `src/components/ui/Button.tsx`, `Card.tsx`
- Created placeholder pages: `/academics`, `/skills`, `/projects`, `/portfolio`, `/freelancing`, `/career`, `/documents`, `/ai-hub`, `/analytics`, `/settings`, `/login`, `/signup`
- Created `src/app/api/health/route.ts` — health check
- Build now succeeds: `npm run build` → Compiled successfully (previously failed with "Couldn't find any pages or app directory")
- `src/lib/utils.ts`, `src/types/database.ts`

### Added — Part 12: Env Architecture
- Updated `.env.example` with PUBLIC vs SERVER SECRET separation
- Created `src/lib/validation.ts` — zod validation for env
- Created `src/lib/env.ts` — centralized env access with safety
- Documented feature flags: AI_HUB_ENABLED, RAG_ENABLED, etc.

### Added — Part 13: Dev Config
- Updated `next.config.ts` — Supabase image domains, server actions, headers
- Created `middleware.ts` — placeholder for auth guard (full in Part 20)
- Created `src/lib/logger.ts` — structured logging (WHAT, WHY, WHAT TO DO)
- Added `@supabase/supabase-js`, `@supabase/ssr` dependencies

### Added — Part 14: Supabase Integration
- Created `src/lib/supabase/client.ts` — browser client
- Created `src/lib/supabase/server.ts` — server client with cookies, getUser, getSession
- Created `src/lib/supabase/admin.ts` — service_role client (server-only)
- Updated `middleware.ts` — Supabase session refresh + protected routes logic

### Added — Part 15-16: PostgreSQL Schema & Migrations
- Created `prisma/schema.prisma` — 20+ models: Profile, Semester, Course, Unit, Topic, CO, Document, Chunk, Conversation, Message, AiProvider, AiUsage, ModelRegistry, Memory, Pyq, Test, Skill, UserSkill, Expert, Project, Portfolio, FreelanceService, Goal, CgpaRecord
- Created `prisma/seed.ts` — sample data: 8 semesters, 12 ECE courses, 5 units each, 3 topics per unit, 5 COs per course, 8 skills, 4 builtin experts, 4 models
- Created `prisma.config.ts` — Prisma config file (replaces deprecated package.json#prisma)
- Created `supabase/migrations/001_initial_schema_rls.sql` — pgvector extension, handle_new_user trigger, RLS policies for all private tables, public read for curriculum, storage bucket notes, indexes
- Created `DATABASE.md` — schema overview, RLS, storage buckets, how to run migrations

### Added — Part 18-19: Auth
- Created `src/components/auth/AuthProvider.tsx` — Context with user, session, signUp, signIn, signOut, isSupabaseConfigured, mock mode (yaswanth@local / ceg-ece)
- Created `src/hooks/useAuth.ts`
- Updated `src/app/layout.tsx` — wrapped with AuthProvider
- Updated `src/app/(auth)/login/page.tsx` — functional login with mock fallback, error handling, beginner explanation
- Updated `src/app/(auth)/signup/page.tsx` — functional signup, requires Supabase

### Added — Part 20-24: Protected Routes, Session, Storage, Logging
- Updated `middleware.ts` — real Supabase session refresh, protected route check (currently permissive for mock mode, strict in production)
- Updated `src/app/settings/page.tsx` — shows auth status, env architecture PUBLIC vs SECRET, AI providers placeholder, storage buckets, error logging format
- Logger already in `src/lib/logger.ts`

### Added — Documentation
- `SETUP.md` — Beginner-friendly setup: Node, Git, Supabase, clone, install, env, DB, dev server, test
- `TROUBLESHOOTING.md` — Common errors & fixes: build, Prisma, Supabase, auth, AI, dev server, env, git
- `CHANGELOG.md` — this file

### Fixed
- Critical blocker: `npm run build` now succeeds (was failing with "Couldn't find any pages or app directory")
- `package.json` — removed deprecated `prisma` property, added `prisma.config.ts`
- `tsconfig.json` path alias `@/*` now works because `src/` exists

### Known Issues / Blocked
- `npx prisma generate` fails in some sandboxes due to network blocking binaries.prisma.sh — workaround: use Supabase SQL editor or mock mode. App boots without Prisma client if not imported.
- Supabase not configured by default — app runs in mock mode, real persistence requires Supabase project (see SETUP.md)
- RLS policies SQL file created but not yet applied to real Supabase — need to run in Supabase SQL editor after `db push`
- Workspace 1 not yet complete: Parts 22-25 (cloud persistence, file storage UI, error boundary, integration test) still pending

---

## [0.1.0] — Initial Commit (2026-09-26)

- Only config files: package.json, tsconfig, next.config, .env.example, README, AGENTS.md, CLAUDE.md, .gitignore
- No app code — build failed

---

## Roadmap

- **Workspace 1 (1-25):** Core Repair — IN PROGRESS (15/25 done)
- **Workspace 2 (26-50):** LLM/AI Core + RAG — NEXT
- **Workspace 3 (51-75):** Academic Engine — TODO
- **Workspace 4 (76-100):** Skills + Experts + Projects + Portfolio + Freelancing — TODO
- **Workspace 5 (101-125):** Polymath + Orchestrator + Analytics + Deploy — TODO
