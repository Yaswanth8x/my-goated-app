// ============================================================
// Workspace Notes — Native notes, first-class objects
// Plain notes, rich notes, Markdown notes, concept notes, task notes, quick ideas, professor-specific reminders
// ============================================================

import { WorkspaceNote } from "./types";

const STORAGE_KEY_NOTES = "polymath_workspace_notes";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function getStoredNotes(): WorkspaceNote[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredNotes(notes: WorkspaceNote[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
}

export function createNote(params: {
  user_id: string;
  workspace_id: string;
  block_id?: string;
  folder_id?: string;
  course_id?: string;
  expert_id?: string;
  title: string;
  content: string;
  tags?: string;
}): WorkspaceNote {
  const note: WorkspaceNote = {
    id: generateId(),
    user_id: params.user_id,
    workspace_id: params.workspace_id,
    block_id: params.block_id || null,
    folder_id: params.folder_id || null,
    course_id: params.course_id || null,
    expert_id: params.expert_id || null,
    title: params.title,
    content: params.content,
    tags: params.tags || null,
    is_favorite: false,
    is_archived: false,
    created_at: now(),
    updated_at: now(),
  };

  const notes = getStoredNotes();
  notes.push(note);
  setStoredNotes(notes);

  return note;
}

export function getNotesForWorkspace(workspaceId: string, userId: string): WorkspaceNote[] {
  return getStoredNotes().filter((n) => n.workspace_id === workspaceId && n.user_id === userId);
}

export function getNotesForBlock(blockId: string, userId: string): WorkspaceNote[] {
  return getStoredNotes().filter((n) => n.block_id === blockId && n.user_id === userId);
}

export function getNoteById(noteId: string, userId: string): WorkspaceNote | null {
  return getStoredNotes().find((n) => n.id === noteId && n.user_id === userId) || null;
}

export function updateNote(noteId: string, userId: string, updates: { title?: string; content?: string; tags?: string }): WorkspaceNote | null {
  const notes = getStoredNotes();
  const note = notes.find((n) => n.id === noteId && n.user_id === userId);
  if (!note) return null;
  if (updates.title !== undefined) note.title = updates.title;
  if (updates.content !== undefined) note.content = updates.content;
  if (updates.tags !== undefined) note.tags = updates.tags;
  note.updated_at = now();
  setStoredNotes(notes);
  return note;
}

export function deleteNote(noteId: string, userId: string): boolean {
  const notes = getStoredNotes();
  const index = notes.findIndex((n) => n.id === noteId && n.user_id === userId);
  if (index === -1) return false;
  notes.splice(index, 1);
  setStoredNotes(notes);
  return true;
}

export function searchNotes(userId: string, query: string, workspaceId?: string): WorkspaceNote[] {
  const q = query.toLowerCase();
  return getStoredNotes().filter((n) => {
    if (n.user_id !== userId) return false;
    if (workspaceId && n.workspace_id !== workspaceId) return false;
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || (n.tags && n.tags.toLowerCase().includes(q));
  });
}
