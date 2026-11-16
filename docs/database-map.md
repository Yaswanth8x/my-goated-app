# PART 6 — Map Existing Database

**Date:** 2026-09-26
**Workspace 1 Part 6**

## WHAT WE ARE BUILDING
Mapping existing database.

## CURRENT STATE

- No `prisma/schema.prisma`
- No `prisma/migrations/`
- No `supabase/migrations/`
- `.env` says `DATABASE_URL="file:./dev.db"` (SQLite)
- No `dev.db` file exists
- README says production target is PostgreSQL + pgvector, but not implemented
- No tables, no RLS, no indexes

**Conclusion:** Database = 0% implemented.

## TARGET DATABASE (from spec + README vision)

### Core Principle
- **Supabase PostgreSQL** as primary cloud DB
- **Prisma** as ORM that can target both SQLite (local quick) and PostgreSQL (Supabase)
- **Every private resource has user_id** + foreign keys
- **RLS** enforced: user can NEVER read another user's private data by manipulating ID
- **Indexes** on: user_id, course_id, domain_id, document_id, created_at

### Entities Needed (from 125 parts)

#### Workspace 1 Core
- **users** (Supabase auth.users)
- **profiles** (id, user_id, email, display_name, role: USER/ADMIN, avatar_url, created_at)
- **semesters** (id, number, name, total_credits, is_current)
- **courses** (id, code, name, semester_id, credits, regulation, description, is_elective)
- **units** (id, course_id, number, title, description)
- **topics** (id, unit_id, title, description)
- **course_outcomes** (id, course_id, code, description)
- **user_course_enrollments** (user_id, course_id, semester, status)
- **user_co_mastery** (user_id, co_id, mastery_level, last_tested)

#### Workspace 2 AI + RAG
- **documents** (id, user_id, course_id, unit_id, title, type: PDF/DOCX/TXT/etc, file_path, bucket, size, status, created_at)
- **document_chunks** (id, document_id, user_id, course_id, unit_id, topic_id, content, chunk_index, page, section, embedding [vector], metadata)
- **conversations** (id, user_id, course_id, expert_id, title, model_id, provider, created_at, updated_at)
- **messages** (id, conversation_id, user_id, role: user/assistant/system, content, tokens, model, created_at)
- **memories** (id, user_id, course_id, expert_id, type: academic/professional/global, content, structured_key, created_at)
- **ai_providers** (id, user_id, provider: gemini/openai/anthropic/mock, api_key_encrypted, enabled, created_at)
- **ai_usage** (id, user_id, provider, model, tokens_input, tokens_output, cost_estimate, task, created_at)
- **model_registry** (provider, model_id, display_name, capabilities, context_window, supports_vision, supports_tools, cost_class, enabled)

#### Workspace 3 Academic
- **pyqs** (id, user_id, course_id, unit_id, year, exam_type: CA1/CA2/EndSem, question_text, marks, source_file)
- **pyq_classifications** (pyq_id, co_id, topic_id, difficulty, type)
- **question_families** (id, representative_question, pattern)
- **question_frequency** (family_id, count, years)
- **tests** (id, user_id, course_id, type, title, total_marks, created_at)
- **test_questions** (test_id, question_text, co_id, marks, order)
- **test_attempts** (id, test_id, user_id, score, answers_json, started_at, submitted_at)
- **cgpa_records** (user_id, semester_id, gpa, credits, courses_json)

#### Workspace 4 Professional
- **skills** (id, name, category, description)
- **skill_graph** (skill_id, prerequisite_skill_id)
- **user_skills** (user_id, skill_id, level, status: NOW/NEXT/LATER/PARKED)
- **experts** (id, user_id, name, persona, expertise, roadmap, teaching_style, master_prompt, is_custom, is_builtin, created_at)
- **expert_memory** (id, expert_id, user_id, content, key)
- **projects** (id, user_id, skill_id, expert_id, title, description, level: BEGINNER→CLIENT, status, tech_stack, github_url, created_at)
- **portfolio_items** (id, user_id, project_id, title, problem, solution, tech, skills, screenshots, links, docs, role, date, quality, review, evidence)
- **freelance_services** (id, user_id, title, description, pricing)
- **freelance_leads**, **clients**, **briefs**, **proposals**, **deliverables** etc.

#### Workspace 5 Polymath
- **goals** (id, user_id, title, type: academic/professional, deadline, status)
- **planner** (user_id, week, tasks_json)
- **analytics** (user_id, date, metrics_json)
- **notifications** (user_id, type, content, read)

### Storage Buckets (Supabase Storage)
- `documents` (private, RLS: user_id)
- `avatars` (public or private)
- `project-assets`
- `portfolio`
- `course-materials`

### RLS Policies (Critical)
For each private table:
```sql
-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY "Users can manage own documents"
ON documents FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

Same for conversations, messages, projects, etc.

### Migrations Strategy
- **Prisma Migrate** for local SQLite → PostgreSQL
- **Supabase Migrations** (`supabase/migrations/*.sql`) for RLS, buckets, pgvector extension
- Keep both in sync

### What Should Be Preserved
- Idea of versioned academic profile + curriculum versions (from README) — good, keep in schema

### What Should Be Created Next (Part 15-16)
- `prisma/schema.prisma` with core tables first (profiles, semesters, courses, units, topics, COs, documents, chunks, conversations, messages)
- Then expand to all 30+ tables incrementally

## TEST
- No DB to test now
- After Part 15, `npx prisma validate` should pass
- After Part 16, `npx prisma db push` should create tables (if Supabase connected) or local SQLite

## STATUS
✅ Mapped — Database 0% implemented, target defined with 30+ tables.

