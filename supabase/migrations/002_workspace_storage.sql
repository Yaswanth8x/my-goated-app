-- ============================================================
-- Migration 002 — Workspace Storage & Notebook-Style Organization
-- Every AI Professor / AI Expert has AI Interface + Workspace Vault
-- Blocks: My Documents, HTML Concepts, PDFs, Videos, Audio/Journal, Data/Database, Notes, Images
-- ============================================================

-- Enable pgcrypto for cuid if needed (Prisma uses cuid)
-- Note: Supabase already has pgcrypto, pgvector from 001

-- ------------------------------------------------------------
-- WORKSPACES — Per AI Space, per User
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  expert_id TEXT REFERENCES experts(id) ON DELETE SET NULL,
  ai_space_type TEXT DEFAULT 'GLOBAL', -- COURSE, EXPERT, CUSTOM, GLOBAL
  ai_space_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraints: One workspace per course per user, one per expert per user
CREATE UNIQUE INDEX IF NOT EXISTS workspaces_user_course_unique ON workspaces(user_id, course_id) WHERE course_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS workspaces_user_expert_unique ON workspaces(user_id, expert_id) WHERE expert_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workspaces_user_id_idx ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS workspaces_course_id_idx ON workspaces(course_id);
CREATE INDEX IF NOT EXISTS workspaces_expert_id_idx ON workspaces(expert_id);
CREATE INDEX IF NOT EXISTS workspaces_ai_space_type_idx ON workspaces(ai_space_type);
CREATE INDEX IF NOT EXISTS workspaces_ai_space_id_idx ON workspaces(ai_space_id);

-- ------------------------------------------------------------
-- WORKSPACE BLOCKS — My Documents, HTML, PDF, Video, Audio, Data, Notes, Images, Other
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_blocks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL, -- DOCUMENTS, HTML, PDF, VIDEO, AUDIO, DATA, NOTES, IMAGES, OTHER
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspace_blocks_workspace_id_idx ON workspace_blocks(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_blocks_block_type_idx ON workspace_blocks(block_type);

-- ------------------------------------------------------------
-- WORKSPACE FOLDERS — Folder hierarchy inside blocks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_folders (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  block_id TEXT REFERENCES workspace_blocks(id) ON DELETE CASCADE,
  parent_folder_id TEXT REFERENCES workspace_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspace_folders_workspace_id_idx ON workspace_folders(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_folders_block_id_idx ON workspace_folders(block_id);
CREATE INDEX IF NOT EXISTS workspace_folders_parent_folder_id_idx ON workspace_folders(parent_folder_id);

-- ------------------------------------------------------------
-- WORKSPACE FILES — File metadata, storage_path, mime_type, size, tags, AI status
-- Storage bucket: workspaces (private, RLS by user_id folder)
-- Path: user_id/workspace_id/block_type/folder_id/filename OR user_id/ai_space_type/ai_space_id/workspace_id/block_type/filename
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  block_id TEXT REFERENCES workspace_blocks(id) ON DELETE SET NULL,
  folder_id TEXT REFERENCES workspace_folders(id) ON DELETE SET NULL,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  expert_id TEXT REFERENCES experts(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  bucket TEXT DEFAULT 'workspaces',
  mime_type TEXT,
  size_bytes INTEGER NOT NULL,
  file_type TEXT, -- DOCUMENT, PDF, HTML, VIDEO, AUDIO, IMAGE, DATA, etc.
  description TEXT,
  tags TEXT, -- JSON array or comma separated
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  storage_status TEXT DEFAULT 'READY', -- READY, UPLOADING, FAILED
  ai_indexing_status TEXT DEFAULT 'NOT_REQUESTED', -- NOT_REQUESTED, PROCESSING, COMPLETE, FAILED
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspace_files_user_id_idx ON workspace_files(user_id);
CREATE INDEX IF NOT EXISTS workspace_files_workspace_id_idx ON workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_files_block_id_idx ON workspace_files(block_id);
CREATE INDEX IF NOT EXISTS workspace_files_folder_id_idx ON workspace_files(folder_id);
CREATE INDEX IF NOT EXISTS workspace_files_course_id_idx ON workspace_files(course_id);
CREATE INDEX IF NOT EXISTS workspace_files_expert_id_idx ON workspace_files(expert_id);
CREATE INDEX IF NOT EXISTS workspace_files_file_type_idx ON workspace_files(file_type);
CREATE INDEX IF NOT EXISTS workspace_files_created_at_idx ON workspace_files(created_at);

-- ------------------------------------------------------------
-- WORKSPACE NOTES — Native notes, first-class objects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  block_id TEXT REFERENCES workspace_blocks(id) ON DELETE SET NULL,
  folder_id TEXT REFERENCES workspace_folders(id) ON DELETE SET NULL,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  expert_id TEXT REFERENCES experts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown
  tags TEXT, -- JSON array
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspace_notes_user_id_idx ON workspace_notes(user_id);
CREATE INDEX IF NOT EXISTS workspace_notes_workspace_id_idx ON workspace_notes(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_notes_block_id_idx ON workspace_notes(block_id);
CREATE INDEX IF NOT EXISTS workspace_notes_folder_id_idx ON workspace_notes(folder_id);
CREATE INDEX IF NOT EXISTS workspace_notes_created_at_idx ON workspace_notes(created_at);

-- ------------------------------------------------------------
-- WORKSPACE DATA TABLES — Structured data
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_data_tables (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  schema_definition JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspace_data_tables_user_id_idx ON workspace_data_tables(user_id);
CREATE INDEX IF NOT EXISTS workspace_data_tables_workspace_id_idx ON workspace_data_tables(workspace_id);

CREATE TABLE IF NOT EXISTS workspace_data_rows (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL REFERENCES workspace_data_tables(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspace_data_rows_table_id_idx ON workspace_data_rows(table_id);

-- ------------------------------------------------------------
-- PINNED RESOURCES — User explicitly pins resources for AI context
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pinned_resources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  file_id TEXT REFERENCES workspace_files(id) ON DELETE SET NULL,
  note_id TEXT REFERENCES workspace_notes(id) ON DELETE SET NULL,
  document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  data_table_id TEXT REFERENCES workspace_data_tables(id) ON DELETE SET NULL,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  expert_id TEXT REFERENCES experts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pinned_resources_user_id_idx ON pinned_resources(user_id);
CREATE INDEX IF NOT EXISTS pinned_resources_workspace_id_idx ON pinned_resources(workspace_id);
CREATE INDEX IF NOT EXISTS pinned_resources_course_id_idx ON pinned_resources(course_id);
CREATE INDEX IF NOT EXISTS pinned_resources_expert_id_idx ON pinned_resources(expert_id);
CREATE INDEX IF NOT EXISTS pinned_resources_file_id_idx ON pinned_resources(file_id);
CREATE INDEX IF NOT EXISTS pinned_resources_note_id_idx ON pinned_resources(note_id);

-- ------------------------------------------------------------
-- RLS — Every workspace object isolated by user
-- ------------------------------------------------------------
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_data_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_data_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_resources ENABLE ROW LEVEL SECURITY;

-- Workspaces RLS
DROP POLICY IF EXISTS "Users can manage own workspaces" ON workspaces;
CREATE POLICY "Users can manage own workspaces" ON workspaces
  FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Workspace Blocks RLS — via workspace user_id
DROP POLICY IF EXISTS "Users can manage own workspace blocks" ON workspace_blocks;
CREATE POLICY "Users can manage own workspace blocks" ON workspace_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_blocks.workspace_id AND w.user_id = auth.uid()::text)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_blocks.workspace_id AND w.user_id = auth.uid()::text)
  );

-- Workspace Folders RLS
DROP POLICY IF EXISTS "Users can manage own workspace folders" ON workspace_folders;
CREATE POLICY "Users can manage own workspace folders" ON workspace_folders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_folders.workspace_id AND w.user_id = auth.uid()::text)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_folders.workspace_id AND w.user_id = auth.uid()::text)
  );

-- Workspace Files RLS
DROP POLICY IF EXISTS "Users can manage own workspace files" ON workspace_files;
CREATE POLICY "Users can manage own workspace files" ON workspace_files
  FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Workspace Notes RLS
DROP POLICY IF EXISTS "Users can manage own workspace notes" ON workspace_notes;
CREATE POLICY "Users can manage own workspace notes" ON workspace_notes
  FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Workspace Data Tables RLS
DROP POLICY IF EXISTS "Users can manage own workspace data tables" ON workspace_data_tables;
CREATE POLICY "Users can manage own workspace data tables" ON workspace_data_tables
  FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Workspace Data Rows RLS — via table user_id
DROP POLICY IF EXISTS "Users can manage own workspace data rows" ON workspace_data_rows;
CREATE POLICY "Users can manage own workspace data rows" ON workspace_data_rows
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workspace_data_tables t WHERE t.id = workspace_data_rows.table_id AND t.user_id = auth.uid()::text)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_data_tables t WHERE t.id = workspace_data_rows.table_id AND t.user_id = auth.uid()::text)
  );

-- Pinned Resources RLS
DROP POLICY IF EXISTS "Users can manage own pinned resources" ON pinned_resources;
CREATE POLICY "Users can manage own pinned resources" ON pinned_resources
  FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- ------------------------------------------------------------
-- Storage Bucket — workspaces (private, RLS by user_id folder)
-- Note: Bucket creation via Supabase Dashboard or SQL API
-- For SQL, use storage.buckets insert if allowed, otherwise create via Dashboard
-- Path structure: user_id/workspace_id/block_type/filename
-- ------------------------------------------------------------
-- Insert bucket if not exists (Supabase storage.buckets)
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspaces', 'workspaces', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for workspaces bucket — private by user_id folder
-- Users can only access their own folder: user_id/*
DROP POLICY IF EXISTS "Users can manage own workspace files storage" ON storage.objects;
CREATE POLICY "Users can manage own workspace files storage" ON storage.objects
  FOR ALL USING (
    bucket_id = 'workspaces' AND auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'workspaces' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Also keep existing buckets RLS from 001 if not already
-- documents bucket RLS already in 001

-- ------------------------------------------------------------
-- Updated_at triggers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_blocks_updated_at ON workspace_blocks;
CREATE TRIGGER update_workspace_blocks_updated_at BEFORE UPDATE ON workspace_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_folders_updated_at ON workspace_folders;
CREATE TRIGGER update_workspace_folders_updated_at BEFORE UPDATE ON workspace_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_files_updated_at ON workspace_files;
CREATE TRIGGER update_workspace_files_updated_at BEFORE UPDATE ON workspace_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_notes_updated_at ON workspace_notes;
CREATE TRIGGER update_workspace_notes_updated_at BEFORE UPDATE ON workspace_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_data_tables_updated_at ON workspace_data_tables;
CREATE TRIGGER update_workspace_data_tables_updated_at BEFORE UPDATE ON workspace_data_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_data_rows_updated_at ON workspace_data_rows;
CREATE TRIGGER update_workspace_data_rows_updated_at BEFORE UPDATE ON workspace_data_rows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- Comments for documentation
-- ------------------------------------------------------------
COMMENT ON TABLE workspaces IS 'Per AI Space, per User — Every AI Professor/Expert has independent workspace vault';
COMMENT ON TABLE workspace_blocks IS 'Blocks: My Documents, HTML Concepts, PDFs, Videos, Audio/Journal, Data/Database, Notes, Images';
COMMENT ON TABLE workspace_folders IS 'Folder hierarchy inside blocks';
COMMENT ON TABLE workspace_files IS 'File metadata with user_id workspace_id block_id folder_id filename storage_path mime_type size tags AI-indexing status — Storage independent Optional AI layer';
COMMENT ON TABLE workspace_notes IS 'Native notes first-class objects not merely files — Markdown';
COMMENT ON TABLE workspace_data_tables IS 'Structured data — Topics, Assignments, Revision Tracker, etc.';
COMMENT ON TABLE pinned_resources IS 'User explicitly pins resources for AI context — Pinned Resources';
