// ============================================================
// Database Types — Workspace 1 Part 15 starter
// Will be expanded with full schema
// ============================================================

export type UserRole = "USER" | "ADMIN";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  number: number;
  name: string;
  total_credits: number;
  is_current: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  semester_id: string;
  credits: number;
  regulation: string;
  description?: string;
  is_elective: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  course_id: string;
  number: number;
  title: string;
  description?: string;
}

export interface Document {
  id: string;
  user_id: string;
  course_id?: string;
  unit_id?: string;
  title: string;
  type: "PDF" | "DOCX" | "PPTX" | "TXT" | "CSV" | "IMAGE";
  file_path: string;
  bucket: string;
  size: number;
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  course_id?: string;
  expert_id?: string;
  title: string;
  model_id: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: number;
  model?: string;
  created_at: string;
}
