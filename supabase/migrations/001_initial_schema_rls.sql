-- ============================================================
-- Supabase Migration — Initial Schema + RLS
-- Workspace 1 Part 16-17
-- ============================================================
-- This file is for Supabase SQL editor or supabase CLI
-- It creates RLS policies for all private tables
-- Run this after Prisma db push or as part of Supabase migrations
-- ============================================================

-- Enable pgvector extension (for embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- PROFILES — Trigger to auto-create profile on signup
-- ============================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'USER'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS — Enable Row Level Security on all private tables
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid()::text = user_id OR auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own documents" ON public.documents;
CREATE POLICY "Users manage own documents"
ON public.documents FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Document Chunks
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own chunks" ON public.document_chunks;
CREATE POLICY "Users manage own chunks"
ON public.document_chunks FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own conversations" ON public.conversations;
CREATE POLICY "Users manage own conversations"
ON public.conversations FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own messages" ON public.messages;
CREATE POLICY "Users manage own messages"
ON public.messages FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Memories
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own memories" ON public.memories;
CREATE POLICY "Users manage own memories"
ON public.memories FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- AI Providers
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own ai providers" ON public.ai_providers;
CREATE POLICY "Users manage own ai providers"
ON public.ai_providers FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- AI Usage
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own usage" ON public.ai_usage;
CREATE POLICY "Users view own usage"
ON public.ai_usage FOR SELECT
USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users insert own usage" ON public.ai_usage;
CREATE POLICY "Users insert own usage"
ON public.ai_usage FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own projects" ON public.projects;
CREATE POLICY "Users manage own projects"
ON public.projects FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Portfolio
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own portfolio" ON public.portfolio_items;
CREATE POLICY "Users manage own portfolio"
ON public.portfolio_items FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- User Skills
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own skills" ON public.user_skills;
CREATE POLICY "Users manage own skills"
ON public.user_skills FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own goals" ON public.goals;
CREATE POLICY "Users manage own goals"
ON public.goals FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- User CO Mastery
ALTER TABLE public.user_co_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own mastery" ON public.user_co_mastery;
CREATE POLICY "Users manage own mastery"
ON public.user_co_mastery FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- CGPA Records
ALTER TABLE public.cgpa_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own cgpa" ON public.cgpa_records;
CREATE POLICY "Users manage own cgpa"
ON public.cgpa_records FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Freelance Services
ALTER TABLE public.freelance_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own freelance" ON public.freelance_services;
CREATE POLICY "Users manage own freelance"
ON public.freelance_services FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Public tables (no RLS or read-only for all)
-- Semesters, Courses, Units, Topics, CourseOutcomes, Skills, Experts (builtin), ModelRegistry
-- These are public curriculum data, not private user data

ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read semesters" ON public.semesters;
CREATE POLICY "Public read semesters" ON public.semesters FOR SELECT USING (true);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read units" ON public.units;
CREATE POLICY "Public read units" ON public.units FOR SELECT USING (true);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read topics" ON public.topics;
CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);

ALTER TABLE public.course_outcomes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read cos" ON public.course_outcomes;
CREATE POLICY "Public read cos" ON public.course_outcomes FOR SELECT USING (true);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read skills" ON public.skills;
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);

ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read builtin experts" ON public.experts;
CREATE POLICY "Public read builtin experts" ON public.experts FOR SELECT USING (is_builtin = true OR auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Users manage own custom experts" ON public.experts;
CREATE POLICY "Users manage own custom experts" ON public.experts FOR ALL USING (auth.uid()::text = user_id OR is_builtin = true) WITH CHECK (auth.uid()::text = user_id);

ALTER TABLE public.model_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read models" ON public.model_registry;
CREATE POLICY "Public read models" ON public.model_registry FOR SELECT USING (true);

-- PYQs, Tests — public read, but user_id filtered if private
ALTER TABLE public.pyqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pyqs" ON public.pyqs;
CREATE POLICY "Public read pyqs" ON public.pyqs FOR SELECT USING (true);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tests" ON public.tests;
CREATE POLICY "Public read tests" ON public.tests FOR SELECT USING (true);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Create buckets (if not exists via API, these are SQL for reference)
-- You should create buckets via Supabase Dashboard or storage API:
-- - documents (private)
-- - avatars (public)
-- - project-assets (private)
-- - portfolio (private)
-- - course-materials (private)

-- Example bucket policies (to be applied via Supabase Dashboard)
-- For documents bucket:
-- CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can read own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- INDEXES — for performance (Prisma also creates some)
-- ============================================================

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_documents_user_course ON public.documents(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_chunks_user_course ON public.document_chunks(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated ON public.conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at);

-- ============================================================
-- NOTES
-- ============================================================
-- 1. This file should be run in Supabase SQL editor after Prisma db push
-- 2. Or use supabase CLI: supabase migration up
-- 3. Test RLS: Try to query another user's data — should return 0 rows
-- 4. Admin bypass: Use service_role key (admin client) to bypass RLS when needed
