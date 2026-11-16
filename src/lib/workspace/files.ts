// ============================================================
// Workspace Files — File Metadata System
// Every file has database metadata: user, AI space, workspace, block, folder, filename, storage_path, MIME, size, tags, AI-indexing status
// Storage layer independent Optional AI layer — file stored does NOT automatically enter AI context
// ============================================================

import { WorkspaceFile, WorkspaceBlockType } from "./types";

const STORAGE_KEY_FILES = "polymath_workspace_files";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function getStoredFiles(): WorkspaceFile[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredFiles(files: WorkspaceFile[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
}

// Determine block type from MIME or extension
export function determineBlockType(filename: string, mimeType?: string): WorkspaceBlockType {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const mime = mimeType?.toLowerCase() || "";

  if (["html", "htm"].includes(ext) || mime.includes("text/html")) return "HTML";
  if (ext === "pdf" || mime.includes("pdf")) return "PDF";
  if (["mp4", "mkv", "mov", "webm", "avi"].includes(ext) || mime.startsWith("video/")) return "VIDEO";
  if (["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(ext) || mime.startsWith("audio/")) return "AUDIO";
  if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext) || mime.startsWith("image/")) return "IMAGES";
  if (["csv", "json", "xlsx"].includes(ext)) return "DATA";
  if (["txt", "md", "docx", "doc", "rtf", "odt"].includes(ext) || mime.includes("text/")) return "DOCUMENTS";
  return "OTHER";
}

export function determineFileType(filename: string, mimeType?: string): string {
  return determineBlockType(filename, mimeType);
}

// Create file metadata — storage_path is user_id/workspace_id/block_type/filename
export function createFileMetadata(params: {
  user_id: string;
  workspace_id: string;
  block_id?: string;
  folder_id?: string;
  course_id?: string;
  expert_id?: string;
  filename: string;
  storage_path: string;
  bucket?: string;
  mime_type?: string;
  size_bytes: number;
  description?: string;
  tags?: string;
}): WorkspaceFile {
  const file: WorkspaceFile = {
    id: generateId(),
    user_id: params.user_id,
    workspace_id: params.workspace_id,
    block_id: params.block_id || null,
    folder_id: params.folder_id || null,
    course_id: params.course_id || null,
    expert_id: params.expert_id || null,
    filename: params.filename,
    storage_path: params.storage_path,
    bucket: params.bucket || "workspaces",
    mime_type: params.mime_type || null,
    size_bytes: params.size_bytes,
    file_type: determineFileType(params.filename, params.mime_type),
    description: params.description || null,
    tags: params.tags || null,
    is_favorite: false,
    is_archived: false,
    storage_status: "READY",
    ai_indexing_status: "NOT_REQUESTED",
    version: 1,
    created_at: now(),
    updated_at: now(),
  };

  const files = getStoredFiles();
  files.push(file);
  setStoredFiles(files);

  return file;
}

export function getFilesForWorkspace(workspaceId: string, userId: string): WorkspaceFile[] {
  return getStoredFiles().filter((f) => f.workspace_id === workspaceId && f.user_id === userId);
}

export function getFilesForBlock(blockId: string, userId: string): WorkspaceFile[] {
  return getStoredFiles().filter((f) => f.block_id === blockId && f.user_id === userId);
}

export function getFilesForFolder(folderId: string, userId: string): WorkspaceFile[] {
  return getStoredFiles().filter((f) => f.folder_id === folderId && f.user_id === userId);
}

export function getFileById(fileId: string, userId: string): WorkspaceFile | null {
  return getStoredFiles().find((f) => f.id === fileId && f.user_id === userId) || null;
}

export function deleteFile(fileId: string, userId: string): boolean {
  const files = getStoredFiles();
  const index = files.findIndex((f) => f.id === fileId && f.user_id === userId);
  if (index === -1) return false;
  files.splice(index, 1);
  setStoredFiles(files);
  return true;
}

export function renameFile(fileId: string, userId: string, newFilename: string): WorkspaceFile | null {
  const files = getStoredFiles();
  const file = files.find((f) => f.id === fileId && f.user_id === userId);
  if (!file) return null;
  file.filename = newFilename;
  file.file_type = determineFileType(newFilename, file.mime_type || undefined);
  file.updated_at = now();
  setStoredFiles(files);
  return file;
}

export function toggleFavorite(fileId: string, userId: string): WorkspaceFile | null {
  const files = getStoredFiles();
  const file = files.find((f) => f.id === fileId && f.user_id === userId);
  if (!file) return null;
  file.is_favorite = !file.is_favorite;
  file.updated_at = now();
  setStoredFiles(files);
  return file;
}

export function getStorageUsage(userId: string): { total: number; by_type: Record<string, number> } {
  const files = getStoredFiles().filter((f) => f.user_id === userId);
  const total = files.reduce((sum, f) => sum + f.size_bytes, 0);
  const by_type: Record<string, number> = {};
  files.forEach((f) => {
    const type = f.file_type || "OTHER";
    by_type[type] = (by_type[type] || 0) + f.size_bytes;
  });
  return { total, by_type };
}

export function searchFiles(userId: string, query: string, workspaceId?: string): WorkspaceFile[] {
  const q = query.toLowerCase();
  return getStoredFiles().filter((f) => {
    if (f.user_id !== userId) return false;
    if (workspaceId && f.workspace_id !== workspaceId) return false;
    return (
      f.filename.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q)) ||
      (f.tags && f.tags.toLowerCase().includes(q)) ||
      (f.file_type && f.file_type.toLowerCase().includes(q))
    );
  });
}
