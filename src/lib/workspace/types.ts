// ============================================================
// Workspace Types — AI Professor + Personal Knowledge Workspace
// Every AI Space has AI Interface + Workspace Vault
// ============================================================

export type AiSpaceType = "COURSE" | "EXPERT" | "CUSTOM" | "GLOBAL";

export type WorkspaceBlockType =
  | "DOCUMENTS"
  | "HTML"
  | "PDF"
  | "VIDEO"
  | "AUDIO"
  | "DATA"
  | "NOTES"
  | "IMAGES"
  | "OTHER";

export interface Workspace {
  id: string;
  user_id: string;
  course_id?: string | null;
  expert_id?: string | null;
  ai_space_type: AiSpaceType;
  ai_space_id?: string | null;
  name: string;
  description?: string | null;
  icon?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceBlock {
  id: string;
  workspace_id: string;
  block_type: WorkspaceBlockType;
  name: string;
  description?: string | null;
  icon?: string | null;
  settings?: any;
  created_at: string;
  updated_at?: string;
}

export interface WorkspaceFolder {
  id: string;
  workspace_id: string;
  block_id?: string | null;
  parent_folder_id?: string | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceFile {
  id: string;
  user_id: string;
  workspace_id: string;
  block_id?: string | null;
  folder_id?: string | null;
  course_id?: string | null;
  expert_id?: string | null;
  filename: string;
  storage_path: string;
  bucket: string;
  mime_type?: string | null;
  size_bytes: number;
  file_type?: string | null;
  description?: string | null;
  tags?: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  storage_status: "READY" | "UPLOADING" | "FAILED";
  ai_indexing_status: "NOT_REQUESTED" | "PROCESSING" | "COMPLETE" | "FAILED";
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceNote {
  id: string;
  user_id: string;
  workspace_id: string;
  block_id?: string | null;
  folder_id?: string | null;
  course_id?: string | null;
  expert_id?: string | null;
  title: string;
  content: string;
  tags?: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceDataTable {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  schema_definition?: any;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceDataRow {
  id: string;
  table_id: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface PinnedResource {
  id: string;
  user_id: string;
  workspace_id: string;
  file_id?: string | null;
  note_id?: string | null;
  document_id?: string | null;
  data_table_id?: string | null;
  course_id?: string | null;
  expert_id?: string | null;
  created_at: string;
}

// Default blocks for every workspace — configurable per AI space
export const DEFAULT_BLOCKS: { type: WorkspaceBlockType; name: string; icon: string; description: string; primary?: boolean }[] = [
  { type: "DOCUMENTS", name: "My Documents", icon: "📄", description: "Personal documents, assignments, lab records", primary: true },
  { type: "HTML", name: "HTML Concepts", icon: "🌐", description: "HTML reference files, concept files", primary: true },
  { type: "PDF", name: "PDF Library", icon: "📑", description: "Books, notes, PYQs, references", primary: true },
  { type: "VIDEO", name: "Videos", icon: "🎥", description: "Lectures, tutorials, project demos", primary: false },
  { type: "AUDIO", name: "Audio / Journal", icon: "🎧", description: "Podcasts, voice notes, learning journals", primary: false },
  { type: "DATA", name: "Data / Database", icon: "🗃", description: "Structured info: Topics, Assignments, Revision Tracker", primary: false },
  { type: "NOTES", name: "Notes", icon: "📝", description: "Native workspace notes, Markdown", primary: true },
  { type: "IMAGES", name: "Images", icon: "🖼", description: "Diagrams, references, screenshots", primary: false },
];

// For different AI spaces, primary blocks can differ
export function getPrimaryBlocksForSpace(aiSpaceType: AiSpaceType, aiSpaceId?: string): WorkspaceBlockType[] {
  if (aiSpaceType === "COURSE") {
    return ["DOCUMENTS", "PDF", "NOTES", "HTML"]; // Academic focus
  }
  if (aiSpaceType === "EXPERT") {
    // Photography → Images, Videos, PDFs, Notes
    if (aiSpaceId?.includes("photo") || aiSpaceId?.toLowerCase().includes("photography")) {
      return ["IMAGES", "VIDEO", "PDF", "NOTES"];
    }
    // Web Dev → HTML, Documents, Images, Notes
    if (aiSpaceId?.includes("web") || aiSpaceId?.toLowerCase().includes("web")) {
      return ["HTML", "DOCUMENTS", "IMAGES", "NOTES"];
    }
    return ["DOCUMENTS", "NOTES", "PDF", "IMAGES"];
  }
  return ["DOCUMENTS", "PDF", "NOTES", "IMAGES"];
}
