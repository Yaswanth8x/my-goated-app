# REBUILD ROADMAP — 125 Parts in 5 Workspaces

## Philosophy
SMALL → TESTED → CONNECTED → STABLE → EXPANDED
Never build everything at once.

---

## WORKSPACE 1: CORE REPAIR + ARCHITECTURE + DATABASE + AUTH (Parts 1-25)
**Goal:** Make the app boot, have clean structure, Supabase, auth, storage, error handling.

- **Part 1 (DONE):** Repository audit → `PROJECT_AUDIT.md`, `HEALTH_REPORT.md`
- **Part 2:** Run existing application (we did: build fails)
- **Part 3:** Record all build/runtime errors (done, see HEALTH_REPORT)
- **Part 4:** Map existing frontend (none → document target)
- **Part 5:** Map existing backend (none → document target)
- **Part 6:** Map existing database (none → document target)
- **Part 7:** Map existing API routes (none → document target)
- **Part 8:** Map existing AI code (none → document target)
- **Part 9:** Create architecture diagram (create `ARCHITECTURE.md` + mermaid)
- **Part 10:** Define target architecture (finalize tech stack, folder structure)
- **Part 11:** Clean project structure (create `src/app`, `src/components`, `src/lib`, `src/types`, `prisma`, `supabase`, `docs`, `public`)
- **Part 12:** Create environment-variable architecture (`.env.example` with PUBLIC vs SECRET, validation with zod)
- **Part 13:** Set up development configuration (Tailwind, ESLint, TS, Next config for Supabase)
- **Part 14:** Integrate Supabase project (install `@supabase/supabase-js`, `@supabase/ssr`, create client/server/admin clients)
- **Part 15:** Create PostgreSQL schema (Prisma schema for all core entities, designed for Supabase Postgres)
- **Part 16:** Create migrations (SQL migration files + `supabase/migrations`)
- **Part 17:** Create Row Level Security architecture (RLS policies SQL, user_id ownership)
- **Part 18:** Create user profiles (profiles table, trigger on auth.users)
- **Part 19:** Create authentication (Supabase Auth UI, email/password, sign-up, login, logout)
- **Part 20:** Create protected routes (middleware.ts, auth guard)
- **Part 21:** Create user/session state (React Context + Supabase session provider)
- **Part 22:** Create cloud persistence (ensure all user data goes to Supabase, not just local)
- **Part 23:** Create file storage architecture (Supabase buckets: documents, avatars, project-assets, etc., with RLS)
- **Part 24:** Create error/logging system (error boundary, logger, toast)
- **Part 25:** Run Workspace 1 integration test (fresh install, signup, login, protected route, profile, storage)

**Exit Criteria:** App boots, user can signup/login, see dashboard, session persists, RLS prevents cross-user read.

---

## WORKSPACE 2: LLM / AI CORE + COURSE-SPECIFIC AI PROFESSORS + RAG (Parts 26-50)
**Goal:** Real AI chat that works, with provider abstraction, streaming, course context, RAG, citations.

- **Part 26:** AI architecture (design doc `AI.md`, provider interface diagram)
- **Part 27:** Provider interface (`src/lib/ai/provider.ts` - abstract class)
- **Part 28:** Gemini adapter
- **Part 29:** OpenAI adapter
- **Part 30:** Anthropic adapter
- **Part 31:** Mock adapter (clearly labeled MOCK RESPONSE, no credits)
- **Part 32:** Model registry (`src/lib/ai/models.ts` - provider, model_id, display_name, capabilities, context_window, vision, tools, cost_class)
- **Part 33:** Provider settings UI (Settings → AI Providers, enable/disable)
- **Part 34:** Secure API key handling (server-only, never expose to client, encrypted storage design)
- **Part 35:** AI router (task → appropriate provider/model, cost-aware)
- **Part 36:** Fallback system (Gemini → OpenAI → Anthropic → Mock, with user consent for paid)
- **Part 37:** AI usage tracking (provider, model, tokens, requests, cost, date, user, task → table)
- **Part 38:** Cost control (monthly budget, warning threshold, hard stop)
- **Part 39:** Chat UI (sidebar, conversation list, new chat, course selector, expert selector, model selector, chat area, composer, attachments, stop, retry, copy, save, feedback)
- **Part 40:** Streaming (SSE / ReadableStream, stop generation)
- **Part 41:** Course AI selector (when in course, AI knows course)
- **Part 42:** Course-specific context (CURRENT COURSE + UNIT + RELEVANT DOCS + PYQs + MASTERY + CONVERSATION)
- **Part 43:** Academic professor persona (deep explainer, Socratic, Feynman, exam analyst, problem solver, visual, viva examiner, mentor)
- **Part 44:** Teaching modes (Explain, Simply, Deep dive, Visualize, Example, Analogy, Derive, Solve, Hint, Quiz, Viva, PYQ mode, Exam mode, Mistakes, Connect, Real-world)
- **Part 45:** Conversation persistence (conversations + messages tables, user_id, course_id, expert_id)
- **Part 46:** Memory (structured memory: "User struggles with pointers" not full history, per-course and global)
- **Part 47:** Document ingestion (PDF/DOCX/PPTX/TXT/CSV/images — extract, clean, chunk, metadata)
- **Part 48:** Embeddings/RAG (mock hash vectors first, then real embeddings, pgvector storage, retrieve, rerank)
- **Part 49:** Citations (SOURCE, DOCUMENT, PAGE/SECTION, EXCERPT, never fabricate)
- **Part 50:** Complete AI integration test (open app, select course, select provider/model, send message, receive real streaming response, continue conversation, reload, recover from Supabase)

**Exit Criteria:** User can chat with course AI, see streaming, conversation persists, RAG citations work, mock works without keys.

---

## WORKSPACE 3: ACADEMIC ENGINE + PYQ + TEST + MASTERY + CGPA (Parts 51-75)

- **51:** Curriculum ingestion (parse syllabi refs)
- **52:** Course database (courses table, credits, regulation)
- **53:** Semester structure (semesters 1-8, ~170 credits, unofficial sample label)
- **54:** Units/topics (units per course, topics per unit)
- **55:** Course Outcomes (COs per course)
- **56:** CO mastery (user_co_mastery table)
- **57:** Prerequisite graph (course dependencies)
- **58:** PYQ upload (upload previous year questions)
- **59:** PYQ extraction (text extraction from PDFs)
- **60:** PYQ classification (by unit, CO, marks, type)
- **61:** Question family detection (similar questions grouping)
- **62:** Question frequency analysis (how often asked)
- **63:** Three-level probability classification (HIGH/MEDIUM/LOWER HISTORICAL RELEVANCE — never guarantee future)
- **64:** Question generator (generate practice questions from PYQ patterns)
- **65:** CA-1 simulator (test engine, timer)
- **66:** CA-2 simulator
- **67:** End-sem simulator
- **68:** Viva mode (oral exam simulation)
- **69:** Answer evaluation (AI evaluates answer vs rubric)
- **70:** Error classification (conceptual, calculation, presentation)
- **71:** Spaced revision (SM-2 algorithm)
- **72:** Mastery engine (overall course mastery %)
- **73:** CGPA/GPA engine (honest, no hallucinated regulation tables, allows custom)
- **74:** Academic dashboard (overview of all semesters, progress, weak areas)
- **75:** Academic integration testing

**UX:** ACADEMICS → SEMESTER 1 → PROGRAMMING IN C → Overview, Units, Topics, COs, AI Professor, Notes, Documents, PYQs, Practice, Tests, Viva, Mastery, Mistakes, Revision, Analytics

---

## WORKSPACE 4: SKILLS + MULTI-EXPERT + PROJECTS + PORTFOLIO + FREELANCING (76-100)

- **76:** Professional dashboard
- **77:** Skill database (skills table, levels)
- **78:** Skill graph (dependencies between skills)
- **79:** Expert framework (expert interface)
- **80:** Custom expert creation (ADD EXPERT button)
- **81:** Expert prompt upload (paste master prompt)
- **82:** Expert prompt parser (extract persona, expertise, roadmap, teaching style, assessment, projects)
- **83:** Expert configuration (edit expert)
- **84:** Expert-specific memory
- **85:** Expert-specific RAG
- **86:** Web Development expert (prebuilt)
- **87:** App Development expert
- **88:** Full Stack expert
- **89:** AI Automation expert
- **90:** Video Editing expert
- **91:** Photography expert
- **92:** Cybersecurity/Ethical Hacking educational expert (with safety constraints)
- **93:** Finance education expert (no guaranteed income claims)
- **94:** Future expert creation (extensibility)
- **95:** Project engine (BEGINNER→INTERMEDIATE→ADVANCED→REAL-WORLD→PORTFOLIO→CLIENT/PRODUCT)
- **96:** Portfolio engine (project, problem, solution, tech, skills, screenshots, links, docs, role, date, quality, review, evidence)
- **97:** Freelancing engine (Services, Leads, Clients, Projects, Briefs, Proposals, Deliverables, Revisions, Portfolio, Readiness)
- **98:** Client simulation
- **99:** Freelance readiness (matrix, not fake score)
- **100:** Professional integration testing

**Every expert gets:** Overview, AI Chat, Roadmap, Current Lesson, Practice, Assessments, Projects, Portfolio, Resources, Memory, Mastery, Professional Simulation

---

## WORKSPACE 5: POLYMATH + GLOBAL ORCHESTRATOR + ANALYTICS + POLISH + DEPLOYMENT (101-125)

- **101:** Global AI coordinator (not another professor, coordination: academics + skills + projects + deadlines)
- **102:** Cross-domain skill graph
- **103:** Academic/professional bridge (how ECE helps web dev etc.)
- **104:** Cross-domain project suggestions
- **105:** Goal engine (OKR style)
- **106:** Priority engine (what to do next based on deadlines)
- **107:** Anti-overload system (NOW/NEXT/LATER/PARKED)
- **108:** Academic protection (during exams, academics priority, reduce professional load)
- **109:** Weekly planner
- **110:** Monthly review
- **111:** Semester review
- **112:** Year review
- **113:** Career dashboard
- **114:** Research dashboard
- **115:** Resume/portfolio bridge
- **116:** Professional evidence graph
- **117:** Analytics (learning analytics, skill analytics, time tracking)
- **118:** Global search (search across courses, docs, conversations, projects)
- **119:** Notifications
- **120:** Backup/export (JSON, CSV, docs, encrypted backup future)
- **121:** Admin dashboard (users, provider status, usage, errors, DB health, storage, logs, feature flags — not private conversations)
- **122:** Performance optimization (bundle size, lazy loading, pagination, caching)
- **123:** Security audit (auth, RLS, private docs, API keys, input validation, prompt injection defense, file upload validation)
- **124:** Deployment (Vercel + Supabase, dev/prod env, feature flags)
- **125:** FINAL SYSTEM INTEGRATION TEST (35-point quality gate)

**Final Hierarchy:**
```
GLOBAL AI COORDINATOR
  ├─ ACADEMIC AI HUB
  │   └─ COURSE PROFESSORS (C AI, Digital Elec AI, Math AI) → PYQ/TEST/RAG → COURSE MEMORY
  └─ PROFESSIONAL AI HUB
      └─ DOMAIN EXPERTS (Web AI, Edit AI, Photo AI) → PROJECTS → PORTFOLIO
Backed by Supabase (Postgres, Auth, Storage, RLS, Realtime)
AI via Provider Abstraction (Gemini, OpenAI, Anthropic, Mock) + Model Registry + Router + Fallback + Cost Control
```

---

## Current Status
- ✅ Part 1 DONE: Audit
- ✅ Part 2 DONE: Ran app, confirmed build fails (expected)
- ✅ Part 3 DONE: Recorded errors
- ⏳ Part 4 NEXT: Map frontend (need to create target mapping since none exists)

Waiting for CONTINUE command to proceed to Part 4 onwards.
