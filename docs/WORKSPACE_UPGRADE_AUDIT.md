# WORKSPACE UPGRADE AUDIT — AI Professor + Personal Knowledge Workspace + File/Media Organizer

**Date:** 2026-09-26
**Branch:** arena/01a0dd70-my-goated-app
**Upgrade Prompt:** EXISTING APP — WORKSPACE STORAGE & NOTEBOOK-STYLE ORGANIZATION UPGRADE

---

## 1. Current Architecture Summary

### Framework & Stack
- Next.js 16 App Router, React 19, TypeScript 5, Tailwind v4, lucide-react, shadcn/ui Card/Button
- Supabase: Postgres + Auth + Storage + RLS + Realtime + pgvector, Prisma 6 with 26 models, 31 RLS policies
- AI: Provider-agnostic Gemini/OpenAI/Anthropic/Mock, model registry, router, fallback, usage, secure AES-256-CBC keys
- RAG: Full pipeline UPLOAD→EXTRACT→CLEAN→CHUNK→METADATA→EMBED→STORE→RETRIEVE→RERANK→LLM→ANSWER→CITATIONS

### Existing AI Professor / AI Expert Architecture

**Academic AI Professors:**
- `src/lib/academic/curriculum.ts` — sampleCurriculum 8 semesters ~170cr R2021, helpers getSemester/getCourseByCode etc.
- `/academics` — grid semesters, totalCredits
- `/academics/[semesterId]` — courses list per semester
- `/academics/[semesterId]/[courseId]` — Course AI UX: Overview, Units, Topics, COs, AI Professor central, Notes, Documents, PYQs, Practice, Tests, Viva, Mastery, Mistakes, Revision, Analytics, right context panel
- Course model has units, topics, COs, prerequisites, documents, pyqs, tests
- Conversation model has course_id optional — links chat to course
- Document model has course_id, unit_id, topic_id — RAG docs per course/unit/topic

**Professional AI Experts:**
- `src/lib/skills/skillDatabase.ts` — 8 skills Web/App/FullStack/AI-Automation/Video-Editing/Photography/Cybersecurity-educational/Finance-educational + SkillGraphNode
- `src/lib/experts/expertFramework.ts` — 10 builtin experts (ECE Professor, Web, App, Full Stack, AI Automation, Video Editing, Photography, Cybersecurity, Finance, Global Orchestrator) + createExpertFromPrompt + parseMasterPrompt heuristic + getAllExperts
- `src/lib/ai/personas/academic.ts` — ECE Professor persona, teaching modes
- `src/lib/ai/personas/orchestrator.ts` — Global Orchestrator persona
- `/skills` — professional dashboard NOW/NEXT/LATER/PARKED + skill graph + expert framework + Add Expert form Name+Master Prompt
- `/projects`, `/portfolio`, `/freelancing`, `/career` — project progression BEGINNER→CLIENT, portfolio evidence, freelancing readiness, career evidence graph
- Expert model: user_id nullable (builtin null), name, persona, expertise, roadmap JSON, teaching_style, master_prompt, is_custom, is_builtin
- Conversation model has expert_id optional — links chat to expert

**AI Hub (Central):**
- `/ai-hub` — ChatArea + MessageComposer + ModelSelector + TeachingModeButtons + CitationCard, streaming with abort, conversations sidebar, course & expert selectors, context panel with RAG citations, persistence localStorage mock + Supabase real
- `/api/chat` — provider router, fallback, RAG retrieve, citations, WHAT/WHY/WHAT_TO_DO errors
- `src/lib/ai/conversations.ts` — getConversations, createConversation, addMessageToConversation, getConversation, deleteConversation — localStorage + Supabase fallback
- `src/lib/ai/memory.ts` — Memory model type ACADEMIC/PROFESSIONAL/GLOBAL/EXPERT

**Documents & RAG (Existing File Handling):**
- `/documents` — upload, extract, chunk, metadata, list, delete, search
- `src/lib/supabase/storage.ts` — 5 buckets: documents (private), avatars (public), project-assets (private), portfolio (private), course-materials (private), RLS by user_id folder, size limits, signed URLs 1h, MIME validation
- `src/lib/rag/` — chunk.ts, embed.ts (mock hash vectors), retrieve.ts, citations.ts
- Document model: user_id, course_id, unit_id, topic_id, title, type PDF/DOCX/PPTX/TXT/CSV/IMAGE/OTHER, file_path, bucket, size, status UPLOADED/PROCESSING/READY/FAILED, page_count, chunks relation
- DocumentChunk: document_id, user_id, course_id, unit_id, topic_id, content, chunk_index, page, section, embedding JSON, metadata JSON
- `/api/documents/upload` — upload handling

**Polymath & Global:**
- `src/lib/polymath/orchestrator.ts` — Goal, Task, Priority, getMockGoals, calculatePriority, getCrossDomainGraph, getCrossDomainProjects, generateWeeklyPlanner
- `src/lib/polymath/analytics.ts` — LearningAnalytics, getMockAnalytics, generateReview weekly/monthly/semester/year
- `src/lib/polymath/backup.ts` — BackupData generateBackup exportToJson downloadFile
- `/career` — Global AI Coordinator What should I do next? + cross-domain + goals + weekly planner + evidence graph
- `/analytics` — mastery, usage, time tracking, reviews
- `/admin` — users, conversations, chunks, provider status, usage, system health
- `/settings` + `/settings/ai-providers` + `/settings/backup` — auth status, env PUBLIC vs SECRET, AI providers, storage, logging, backup

**Layout & Navigation:**
- `src/app/layout.tsx` — ErrorBoundary + AuthProvider + Sidebar + Header
- `src/components/layout/Sidebar.tsx` — 11 nav items HOME ACADEMICS SKILLS PROJECTS PORTFOLIO FREELANCING CAREER DOCUMENTS AI HUB ANALYTICS SETTINGS + SYSTEM Admin Backup, 125/125 COMPLETE 100% footer polished
- `src/components/layout/Header.tsx` — Cmd+K search placeholder Part 118 preview, Bell notifications Part 119 preview with pulse dot, UserMenu, mobile menu polished slide-in 13 items
- `src/components/ui/` — Button, Card, ErrorBoundary
- `src/components/layout/UserMenu.tsx` — avatar dropdown Settings AI Providers Sign Out
- `src/components/ai/` — ChatArea, MessageComposer, ModelSelector, TeachingModeButtons, CitationCard
- `src/components/auth/AuthProvider.tsx` — Supabase Auth + mock fallback yaswanth@local / ceg-ece

**Database (Prisma 26 models):**
- Core: Profile (user_id unique, email unique, role USER/ADMIN, avatar_url, relations documents conversations messages ai_providers ai_usage projects portfolio skills experts goals)
- Academic: Semester, Course (code unique, semester_id, credits, regulation, description, is_elective), CoursePrerequisite, Unit (course_id number unique), Topic, CourseOutcome, UserCoMastery
- Documents & RAG: Document (user_id course_id unit_id topic_id title type file_path bucket size status page_count), DocumentChunk (document_id user_id course_id unit_id topic_id content chunk_index page section embedding metadata)
- AI: Conversation (user_id course_id expert_id title model_id provider), Message (conversation_id user_id role user/assistant/system content tokens model citations), AiProvider (user_id provider unique api_key_encrypted enabled), AiUsage (user_id provider model tokens_input tokens_output cost_estimate task), ModelRegistry (provider model_id unique display_name capabilities context_window supports_vision supports_tools cost_class FREE/LOW_COST/PREMIUM), Memory (user_id course_id expert_id type ACADEMIC/PROFESSIONAL/GLOBAL/EXPERT key content)
- PYQ & Tests: Pyq (user_id course_id unit_id year exam_type CA1/CA2/ENDSEM/ASSIGNMENT/OTHER question_text marks source_file), Test (user_id course_id type title total_marks duration), TestQuestion, TestAttempt
- Skills & Experts: Skill (name unique category description), UserSkill (user_id skill_id unique level status NOW/NEXT/LATER/PARKED), Expert (user_id nullable name persona expertise roadmap JSON teaching_style master_prompt is_custom is_builtin)
- Projects & Portfolio: Project (user_id skill_id expert_id title description level BEGINNER→CLIENT status NOT_STARTED/IN_PROGRESS/COMPLETED/ARCHIVED tech_stack github_url demo_url), PortfolioItem (user_id project_id title problem solution tech skills JSON screenshots JSON links JSON docs role date quality review evidence), FreelanceService (user_id title description pricing)
- Goals & Polymath: Goal (user_id title type ACADEMIC/PROFESSIONAL/PERSONAL deadline status NOT_STARTED/IN_PROGRESS/COMPLETED/PARKED), CgpaRecord (user_id semester_id gpa credits courses JSON)

**Supabase Storage:**
- Buckets: documents (private), avatars (public), project-assets (private), portfolio (private), course-materials (private) — to be created in Dashboard, RLS by user_id folder, size limits 10MB docs 5MB avatars, signed URLs 1h, MIME validation, path traversal protection

**Auth & Security:**
- Supabase Auth email/password, session cookies, middleware refresh + auth guard, mock fallback
- RLS: 31 policies, 25 tables, every private table user_id FK + auth.uid()::text = user_id, storage RLS user_id folder
- API keys server-only AES-256-CBC + ENCRYPTION_KEY encrypted, never frontend/HTML/logs/GitHub/plaintext DB, masked UI
- Validation zod, file type/size, prompt injection defense DATA not instructions, system distinguishes SYSTEM/DEVELOPER/USER/RETRIEVED, safety rules no hallucinated regulations/PYQs/videos/guaranteed grades/income/fake evidence

---

## 2. Current Gaps vs Required Upgrade

### What Exists That We Can Reuse
- **KEEP:** All existing AI Professor/Course AI pages, Expert framework, AI Hub chat, Document model + storage.ts, Supabase client/server/admin, AuthProvider, RLS patterns, feature flags, UI components Card/Button, Header/Sidebar polished
- **EXTEND:** Document model could be extended OR new workspace_files model created — better to create new workspace tables to keep separation between RAG docs and workspace vault (as per requirement: Storage layer independent optional AI layer)
- **REUSE:** FileUploader logic from documents page, FileCard/FileList patterns, Folder organization concepts, Supabase storage buckets, signed URLs, MIME validation, search/filter/sort patterns, drag-and-drop

### What Is Missing for Upgrade
- **No ai_spaces abstraction:** Currently Course and Expert are separate models, not unified as AI Space — need ai_spaces concept OR treat Course and Expert as AI Space types with workspace per space
- **No workspaces table:** No dedicated workspace per AI space
- **No workspace_blocks:** No My Documents, HTML Concepts, PDFs, Videos, Audio/Journal, Data/Database, Notes, Images blocks
- **No workspace_folders:** No folder hierarchy inside blocks
- **No workspace_files:** No file metadata with user_id + ai_space_id + workspace_id + block_id + folder_id + filename + storage_path + mime_type + size + tags + description + AI-indexing status
- **No workspace_notes:** No native notes as first-class objects (only documents as files)
- **No workspace_data_tables:** No structured data tables for user workspace data
- **No pinned_resources:** No concept of pinned resources for AI context
- **No file-to-AI context controls:** No Ask AI about this file, Add to current conversation, Pin to AI context, Remove from AI context, Summarize, etc.
- **No workspace overview:** No Workspace Overview with files count, storage used, recently added, favorites, etc.
- **No per-AI-space isolation in UI:** Currently documents are global per user + optional course_id, not per expert workspace with separate vaults
- **No HTML safe preview:** No sandboxed iframe for HTML preview
- **No video/audio players with graceful fallback:** Existing documents preview limited
- **No drag-and-drop upload manager:** Basic file picker exists but not modern drag-and-drop with progress pause/cancel/resume
- **No search across workspace:** No workspace-level search filenames, note titles, content, tags
- **No storage usage display:** No per-workspace storage used breakdown

### Conflicts / Risks
- **Risk:** Creating workspace tables that duplicate Document model — Mitigation: Keep Document for RAG docs, create workspace_files for workspace vault, allow linking workspace file to RAG when explicitly requested (Ask AI about this file)
- **Risk:** Supabase storage buckets already 5 buckets — Need to extend to workspace bucket OR reuse documents bucket with structured path user_id/ai_space_id/workspace_id/block/folder/filename — Better to create new bucket `workspaces` private with RLS user_id folder, or reuse `documents` bucket with new path structure
- **Risk:** Course and Expert are separate — Need unified ai_space_id that can be course_id OR expert_id OR custom expert id — Solution: workspace has ai_space_type enum COURSE/EXPERT/CUSTOM + ai_space_id string, OR workspace has optional course_id and expert_id, OR create ai_spaces table that unifies
- **Risk:** Breaking existing AI functionality — Mitigation: EXTEND not REPLACE, keep existing AI Hub, Course AI, Expert framework working, add workspace as new tab/section inside existing Professor pages
- **Risk:** Large video files loading entire file into RAM — Mitigation: Use streaming, signed URLs, not loading entire file into browser memory, upload progress, chunked upload where feasible
- **Risk:** HTML execution XSS — Mitigation: Sandboxed iframe with sandbox="allow-scripts? No, should be sandbox without allow-same-origin, or use srcdoc with sandbox, or render via separate origin, prevent access to tokens/cookies/APIs

---

## 3. Proposed Architecture Extension

### Database Model (Extend Existing, Not Random Disconnected)

**Option A (Recommended): Create new workspace tables that reference existing Course/Expert**

```prisma
model Workspace {
  id           String   @id @default(cuid())
  user_id      String
  // AI Space association — either course or expert or custom
  course_id    String?  // For academic professors
  expert_id    String?  // For professional/custom experts
  // OR generic
  ai_space_type String? // "COURSE" | "EXPERT" | "CUSTOM" | "GLOBAL"
  ai_space_id   String? // course_id or expert_id or custom id
  name         String   // e.g., "ECE Professor Workspace", "Photography Workspace"
  description  String?  @db.Text
  icon         String?  // emoji or icon name
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  profile Profile @relation? (need to add relation) OR via user_id
  course  Course? @relation?
  expert  Expert? @relation?
  blocks  WorkspaceBlock[]
  folders WorkspaceFolder[]
  files   WorkspaceFile[]
  notes   WorkspaceNote[]
  data_tables WorkspaceDataTable[]
  pinned_resources PinnedResource[]

  @@unique([user_id, course_id]) // One workspace per course per user
  @@unique([user_id, expert_id]) // One workspace per expert per user
  @@index([user_id])
  @@index([course_id])
  @@index([expert_id])
  @@map("workspaces")
}

model WorkspaceBlock {
  id           String   @id @default(cuid())
  workspace_id String
  block_type   WorkspaceBlockType // DOCUMENTS, HTML, PDF, VIDEO, AUDIO, DATA, NOTES, IMAGES, OTHER
  name         String   // "My Documents", "HTML Concepts", etc.
  description  String?  @db.Text
  icon         String?  // 📄, 🌐, 📑, 🎥, 🎧, 🗃, 📝, 🖼
  settings     Json?    // { primary: bool, order: int, etc. }
  created_at   DateTime @default(now())

  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  folders   WorkspaceFolder[]
  files     WorkspaceFile[]
  notes     WorkspaceNote[]

  @@index([workspace_id])
  @@map("workspace_blocks")
}

enum WorkspaceBlockType {
  DOCUMENTS
  HTML
  PDF
  VIDEO
  AUDIO
  DATA
  NOTES
  IMAGES
  OTHER
}

model WorkspaceFolder {
  id               String   @id @default(cuid())
  workspace_id     String
  block_id         String?
  parent_folder_id String?  // For nested folders
  name             String
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  block     WorkspaceBlock? @relation(fields: [block_id], references: [id], onDelete: Cascade)
  parent    WorkspaceFolder? @relation("FolderHierarchy", fields: [parent_folder_id], references: [id])
  children  WorkspaceFolder[] @relation("FolderHierarchy")
  files     WorkspaceFile[]
  notes     WorkspaceNote[]

  @@index([workspace_id])
  @@index([block_id])
  @@index([parent_folder_id])
  @@map("workspace_folders")
}

model WorkspaceFile {
  id                String   @id @default(cuid())
  user_id           String
  workspace_id      String
  block_id          String?
  folder_id         String?
  // AI Space denormalized for quick filtering
  course_id         String?
  expert_id         String?
  filename          String   // original filename
  storage_path      String   // e.g., user_id/workspace_id/block_id/filename or user_id/ai_space_id/workspace_id/...
  bucket            String   @default("workspaces") // or "documents"
  mime_type         String?
  size_bytes        Int
  file_type         String?  // DOCUMENT, PDF, HTML, VIDEO, AUDIO, IMAGE, DATA, etc.
  // Metadata
  description       String?  @db.Text
  tags              String?  // JSON array or comma separated
  is_favorite       Boolean  @default(false)
  is_archived       Boolean  @default(false)
  // AI processing status
  storage_status    String   @default("READY") // READY, UPLOADING, FAILED
  ai_indexing_status String  @default("NOT_REQUESTED") // NOT_REQUESTED, PROCESSING, COMPLETE, FAILED
  // For versioning future
  version           Int      @default(1)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  profile   Profile @relation? (via user_id)
  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  block     WorkspaceBlock? @relation(fields: [block_id], references: [id], onDelete: SetNull)
  folder    WorkspaceFolder? @relation(fields: [folder_id], references: [id], onDelete: SetNull)

  @@index([user_id])
  @@index([workspace_id])
  @@index([block_id])
  @@index([folder_id])
  @@index([course_id])
  @@index([expert_id])
  @@index([created_at])
  @@map("workspace_files")
}

model WorkspaceNote {
  id           String   @id @default(cuid())
  user_id      String
  workspace_id String
  block_id     String?
  folder_id    String?
  course_id    String?
  expert_id    String?
  title        String
  content      String   @db.Text // Markdown
  tags         String?  // JSON array
  is_favorite  Boolean  @default(false)
  is_archived  Boolean  @default(false)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  block     WorkspaceBlock? @relation(fields: [block_id], references: [id], onDelete: SetNull)
  folder    WorkspaceFolder? @relation(fields: [folder_id], references: [id], onDelete: SetNull)

  @@index([user_id])
  @@index([workspace_id])
  @@index([block_id])
  @@index([folder_id])
  @@map("workspace_notes")
}

model WorkspaceDataTable {
  id           String   @id @default(cuid())
  user_id      String
  workspace_id String
  name         String   // e.g., "Topics", "Assignments", "Revision Tracker"
  description  String?  @db.Text
  schema_definition Json? // { columns: [{ name, type, etc. }] }
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  rows      WorkspaceDataRow[]

  @@index([user_id])
  @@index([workspace_id])
  @@map("workspace_data_tables")
}

model WorkspaceDataRow {
  id           String   @id @default(cuid())
  table_id     String
  data         Json     // { column_name: value }
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  table WorkspaceDataTable @relation(fields: [table_id], references: [id], onDelete: Cascade)

  @@index([table_id])
  @@map("workspace_data_rows")
}

model PinnedResource {
  id           String   @id @default(cuid())
  user_id      String
  workspace_id String
  // Can pin file or note or data table or document
  file_id      String?
  note_id      String?
  document_id  String?  // Existing Document model
  data_table_id String?
  // For quick filtering
  course_id    String?
  expert_id    String?
  created_at   DateTime @default(now())

  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  // Relations optional

  @@index([user_id])
  @@index([workspace_id])
  @@index([course_id])
  @@index([expert_id])
  @@map("pinned_resources")
}
```

**Reuse Existing:** Document model stays for RAG docs, but workspace_files is new for workspace vault. PinnedResource can reference both Document and WorkspaceFile and WorkspaceNote.

**Alternative Simpler (Phase 1):** Start with Workspace, WorkspaceBlock, WorkspaceFile, WorkspaceNote, WorkspaceFolder — Data tables and PinnedResource can be Phase 2.

**Supabase Storage:**
- Create new bucket `workspaces` private with RLS by user_id folder
- Path structure: `user_id/workspace_id/block_type/folder_id/filename` OR `user_id/ai_space_type/ai_space_id/workspace_id/block_type/filename`
- Keep existing buckets documents, avatars, etc.
- For migration safety, use `workspaces` bucket new, not modify existing buckets

**RLS:**
- Every workspace table has user_id + RLS auth.uid()::text = user_id
- Storage bucket workspaces private RLS by user_id folder
- Test ownership isolation User A cannot access User B files

---

## 4. Classification KEEP/REPAIR/REFACTOR/EXTEND/REPLACE/REMOVE/DEFER

- **KEEP:** All existing AI Professor/Course AI pages, Expert framework, AI Hub chat, Document model + storage.ts, Supabase clients, AuthProvider, RLS patterns, feature flags, UI Card/Button, Header/Sidebar polished, polymath orchestrator, analytics, backup, admin, settings
- **REPAIR:** None major — build passes 23 routes
- **REFACTOR:** Slight refactor of Course page to add Workspace tab — extend existing tabs Overview/Units/PYQ/Practice/Mastery to include Workspace Vault tab
- **EXTEND:** 
  - Prisma schema — add Workspace, WorkspaceBlock, WorkspaceFolder, WorkspaceFile, WorkspaceNote, WorkspaceDataTable, WorkspaceDataRow, PinnedResource
  - Supabase storage — add workspaces bucket + RLS
  - Course page — add Workspace tab with blocks My Documents, HTML Concepts, PDFs, Videos, Audio/Journal, Data/Database, Notes, Images
  - Expert page — similar workspace tab (need to create expert workspace pages)
  - AI Hub — add file-to-AI context controls Ask AI about this file, Add to current conversation, Pin to AI context
  - Documents page — keep but also show workspace vault distinction Global vs Space files
  - Create reusable components: FileUploader, FileCard, FileList, FolderBrowser, WorkspaceBlock, FilePreview, MediaPlayer, AudioPlayer, VideoPlayer, FileMetadataPanel, TagEditor, SearchBar, UploadManager
  - Create lib for workspace: src/lib/workspace/ — workspace.ts, blocks.ts, files.ts, notes.ts, data.ts, pinned.ts, storage.ts, search.ts
- **REPLACE:** None — do not replace working features
- **REMOVE:** None
- **DEFER:** Advanced AI processing video transcription, audio transcription, OCR, automatic tagging, knowledge graphs, flashcard/quiz generation — future, not initial storage implementation

---

## 5. Implementation Sequence (Staged)

**Phase A — Audit (Current):** Audit existing workspace/AI architecture — DONE this doc

**Phase B — DB Migrations:** Design database migrations for workspace system — Create 002_workspace_storage.sql + update prisma/schema.prisma with new models, add indexes, RLS policies

**Phase C — Workspace Entity & Per-AI-Space Association:** Implement workspace entity and per-AI-space association — lib/workspace/workspace.ts getOrCreateWorkspace for course/expert, ensure every AI space auto-creates workspace

**Phase D — Supabase Storage Integration:** Implement Supabase Storage integration — workspaces bucket private RLS, path structure user_id/workspace_id/block_type/filename, storage.ts extended

**Phase E — Generic File Metadata System:** Implement generic file metadata system — workspace_files table with user_id, workspace_id, block_id, folder_id, filename, storage_path, mime_type, size, tags, description, AI-indexing status, etc.

**Phase F — Upload Manager:** Implement upload manager — FileUploader component with drag-and-drop, file picker, multiple files, upload progress, failure reporting, retry, cancel, duplicate handling, upload status, not loading entire file into RAM

**Phase G — Documents Block:** Implement Documents block — My Documents with upload/download/rename/delete/move/copy/folder/sort/search/tags/metadata/preview/last modified/size/upload date

**Phase H — HTML Block:** Implement HTML block — upload .html/.htm, rename, delete, download, preview sandboxed iframe, search, folder, tags, metadata, code/source view, rendered preview safe

**Phase I — PDF Block:** Implement PDF block — upload PDF, preview, download, rename, delete, move, folder, search, tags, metadata page count upload date size, optional text extraction separate from storage

**Phase J — Video Block:** Implement Video block — upload MP4/MKV/MOV/WebM/AVI, upload progress pause/cancel/resume, rename delete move folder size duration thumbnail streaming/preview where codec supported, graceful fallback Preview unavailable [Download] when browser cannot play MKV

**Phase K — Audio Block:** Implement Audio block — upload MP3/WAV/M4A/AAC/OGG/FLAC, play pause seek download rename delete move folder duration metadata upload date size, optional transcribe/summarize explicit actions

**Phase L — Notes Block:** Implement Notes block — lightweight notes plain/rich/Markdown, first-class workspace objects not merely files, create/edit/delete, tags, search

**Phase M — Data/Database Block:** Implement Data/Database block — structured records CSV/JSON/XLSX/manual tables, Topics Status Priority example, distinguish app DB vs user workspace data, no raw PostgreSQL admin to users, controlled app feature

**Phase N — Images Block:** Implement Images block — JPG/JPEG/PNG/WEBP/GIF/SVG secure handling, circuit diagrams engineering drawings screenshots references, optional analysis separate

**Phase O — Workspace Search/Filter/Sort:** Implement workspace search filenames note titles content tags descriptions file types, filter Documents/PDF/HTML/Video/Audio/Images/Notes/Data, sort Name/Date Added/Last Modified/File Type/File Size

**Phase P — Preview/Media Viewers:** Implement preview common experience PDF preview Open Download Add to AI Context, HTML Source Preview Download, Video Player Download, Audio Player Download, Document Preview where supported Download, Unsupported Preview unavailable Download Original, fail gracefully

**Phase Q — File-to-AI Context Controls:** Implement file-to-AI context controls — Ask AI about this file, Add file to current conversation, Use as AI context, Pin to AI context, Remove from AI context, Summarize, Generate notes, Search inside file — explicit controls not automatic injection

**Phase R — Pinned Resources:** Implement pinned resources — user explicitly selects resources professor allowed to use as persistent contextual material, AI context system retrieves from pinned when appropriate with relevance filtering not full injection

**Phase S — Security/RLS Testing:** Implement security/RLS testing — every workspace object isolated by user, RLS policies, private storage default signed URLs, MIME/type/extension/size validation, ownership validation, safe filename handling, path traversal protection, authorization checks, safe HTML preview isolation, never expose SERVICE_ROLE_KEY/AI keys/DB creds to client

**Phase T — Integration Testing & Polish:** Implement integration testing and polish — workspace creation auto, file upload PDF/DOCX/HTML/MP4/MKV/MP3/PNG/CSV classification, isolation User A vs User B, organization folders rename move delete search filter sorting, preview PDFs HTML safely videos audio, AI separation file stored NOT automatically enter AI context then explicit Ask AI About This only selected/relevant resource supplied, multiple AI spaces independent workspaces, custom expert auto provisioned workspace

---

## 6. Next Step

**Phase B — Database Migrations**

Design and implement database migration for workspace system:

- Update prisma/schema.prisma with new models: Workspace, WorkspaceBlock, WorkspaceBlockType, WorkspaceFolder, WorkspaceFile, WorkspaceNote, WorkspaceDataTable, WorkspaceDataRow, PinnedResource
- Add relations to Profile, Course, Expert
- Create supabase/migrations/002_workspace_storage.sql with tables, indexes, RLS policies
- Test migration safety — preserve existing data, no deletion

After Phase B, proceed to Phase C — Workspace Entity & Per-AI-Space Association.

---

## 7. Success Criteria for Upgrade

- Every AI Professor/Expert has independent workspace — auto-created
- Workspace data isolated per user — RLS
- Files stored persistently in cloud storage — Supabase workspaces bucket private RLS user_id folder
- Metadata stored in database — workspace_files with user_id workspace_id block_id folder_id filename storage_path mime_type size tags description AI-indexing status etc.
- Documents can be uploaded — My Documents block
- HTML files can be stored and safely previewed — sandboxed iframe
- PDFs can be stored and previewed — PDF block
- Videos can be stored and played where supported — Video block with graceful fallback Preview unavailable [Download] for MKV unsupported
- MKV handled gracefully
- Audio files can be stored and played — Audio block
- Notes can be created — Notes block first-class objects
- Structured data can be stored — Data/Database block CSV/JSON/XLSX/manual tables
- Folders and organization work — folders, rename, move, delete, search, filter, sorting
- Search works — filenames, note titles, content, tags, descriptions, file types
- File management works — upload/download/preview/rename/delete/move/copy/folder/tag/search/sort/filter/favorite/archive/restore
- Storage usage can be displayed — Workspace Overview files count storage used breakdown PDFs Videos Audio Documents Other
- AI does NOT automatically ingest all stored resources — storage independent optional AI layer
- User can explicitly connect selected resources to AI — Ask AI about this file, Add to current conversation, Pin to AI context, etc.
- Pinned resources work — user selects resources professor allowed to use as persistent context, AI retrieves with relevance filtering not full injection
- Multi-user isolation works — User A cannot access User B files/workspaces/conversations/notes/media
- RLS works — 31 existing + new policies for workspace tables
- Existing AI functionality remains operational — no regression, EXTEND not REPLACE
- Custom AI experts automatically receive workspaces — generic AI-space lifecycle Create AI Space → Create Workspace automatically → Create default blocks → Ready
- No major regression — build passes 23 routes → 24+ routes with workspace
- Documentation updated — docs/WORKSPACE_UPGRADE_AUDIT.md + migration docs + integration test
- Database migrations documented — 002_workspace_storage.sql
- Tests pass — workspace creation auto, file upload classification, isolation, organization, preview, AI separation, multiple AI spaces independent, custom expert auto provisioned

---

**END OF AUDIT — Ready for Phase B Database Migrations**
