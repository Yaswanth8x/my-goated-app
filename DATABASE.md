# DATABASE.md — PostgreSQL Schema & RLS

**Workspace 1 Part 15-17**

## WHAT WE ARE BUILDING
PostgreSQL schema for Polymath OS, designed for Supabase, with Row Level Security for multi-user isolation.

## WHY
Every user's courses, documents, conversations, projects must be isolated. RLS ensures a user can NEVER read another user's private data by manipulating ID in frontend.

## CURRENT STATE
- `prisma/schema.prisma` created with 20+ models
- `supabase/migrations/001_initial_schema_rls.sql` created with RLS policies
- Seed file `prisma/seed.ts` with sample ECE curriculum (8 semesters, 12 courses, skills, experts, models)

## SCHEMA OVERVIEW

### Core Tables (Workspace 1)
- **profiles**: user_id (FK auth.users), email, display_name, role USER/ADMIN
- **semesters**: 1-8, total_credits, is_current
- **courses**: code, name, semester_id, credits, regulation
- **units**: course_id, number, title
- **topics**: unit_id, title
- **course_outcomes**: course_id, code (CO1...), description
- **user_co_mastery**: user_id, co_id, mastery 0-100

### RAG & AI (Workspace 2)
- **documents**: user_id, course_id, unit_id, title, type, file_path, bucket, size, status
- **document_chunks**: document_id, user_id, course_id, content, chunk_index, page, embedding (JSON or vector), metadata
- **conversations**: user_id, course_id, expert_id, title, model_id, provider
- **messages**: conversation_id, user_id, role, content, tokens, citations
- **memories**: user_id, course_id, expert_id, type ACADEMIC/PROFESSIONAL/GLOBAL/EXPERT, key, content
- **ai_providers**: user_id, provider, api_key_encrypted, enabled
- **ai_usage**: user_id, provider, model, tokens_input/output, cost_estimate, task
- **model_registry**: provider, model_id, display_name, capabilities, context_window, supports_vision, cost_class FREE/LOW_COST/PREMIUM

### Academic (Workspace 3)
- **pyqs**: course_id, year, exam_type CA1/CA2/ENDSEM, question_text, marks
- **tests**: course_id, type, title, total_marks, duration
- **test_questions**: test_id, question_text, co_id, marks, order
- **test_attempts**: test_id, user_id, score, answers_json
- **cgpa_records**: user_id, semester_id, gpa, credits, courses JSON

### Professional (Workspace 4)
- **skills**: name, category, description
- **user_skills**: user_id, skill_id, level 0-100, status NOW/NEXT/LATER/PARKED
- **experts**: user_id (null for builtin), name, persona, expertise, roadmap JSON, master_prompt, is_custom, is_builtin
- **projects**: user_id, skill_id, expert_id, title, level BEGINNER→CLIENT, status, tech_stack, github_url
- **portfolio_items**: user_id, project_id, title, problem, solution, tech, skills, screenshots JSON, links JSON
- **freelance_services**: user_id, title, description, pricing
- **goals**: user_id, title, type ACADEMIC/PROFESSIONAL/PERSONAL, deadline, status

### Indexes
Every table has indexes on:
- user_id
- course_id (where applicable)
- created_at
- Plus composite indexes for common queries (e.g., user_id + course_id)

## RLS POLICIES (Critical)

For private tables:
```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents"
ON documents FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);
```

For public tables (curriculum):
```sql
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
```

For builtin experts + custom:
```sql
CREATE POLICY "Public read builtin experts" ON experts FOR SELECT USING (is_builtin = true OR auth.uid()::text = user_id);
```

## STORAGE BUCKETS

- **documents** (private, RLS by user_id folder)
- **avatars** (public or private)
- **project-assets** (private)
- **portfolio** (private)
- **course-materials** (private)

Create via Supabase Dashboard → Storage → New Bucket, then set policies.

## HOW TO RUN MIGRATIONS

### Option 1: Prisma (Local SQLite or Supabase Postgres)
```bash
# Set DATABASE_URL in .env
# For Supabase: postgresql://postgres:password@db.project.supabase.co:5432/postgres
# For local: file:./dev.db (change provider to sqlite in schema.prisma temporarily)

npx prisma generate
npx prisma db push
npm run db:seed
```

### Option 2: Supabase SQL Editor
1. Go to https://app.supabase.com/project/[project]/editor
2. Copy contents of `supabase/migrations/001_initial_schema_rls.sql`
3. Run in SQL editor

### Option 3: Supabase CLI (Advanced)
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

## TESTING RLS

1. Create two users (User A, User B)
2. As User A, create a document
3. As User B, try to query `SELECT * FROM documents WHERE user_id = 'User A id'` — should return 0 rows
4. Try to manipulate ID in frontend — should still be blocked by RLS

## WHAT TO DO IF IT FAILS

- If `npx prisma generate` fails with network error: Try again, or check internet, or use `prisma generate --no-engine`
- If `npx prisma db push` fails: Check DATABASE_URL, ensure Supabase DB is reachable, check password
- If RLS blocks everything: Check `auth.uid()` returns correct user, check policies, use service_role key for admin

## NEXT
- Part 18: User profiles (trigger auto-create on signup)
- Part 19: Authentication (Supabase Auth UI)
- Part 20: Protected routes (middleware)
