// ============================================================
// Workspace Entity — Per AI Space, Per User
// Every AI Professor/Expert has independent workspace vault
// Auto-creation: Create AI Space → Create Workspace automatically → Create default blocks → Ready
// ============================================================

import { Workspace, WorkspaceBlock, DEFAULT_BLOCKS, AiSpaceType, getPrimaryBlocksForSpace } from "./types";

// Mock storage for now — localStorage fallback, future Supabase
const STORAGE_KEY_WORKSPACES = "polymath_workspaces";
const STORAGE_KEY_BLOCKS = "polymath_workspace_blocks";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

// Get workspaces from localStorage (mock mode)
function getStoredWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredWorkspaces(workspaces: Workspace[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
}

function getStoredBlocks(): WorkspaceBlock[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BLOCKS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredBlocks(blocks: WorkspaceBlock[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(blocks));
}

// Create workspace for a given AI space — auto-creates default blocks
export function createWorkspace(params: {
  user_id: string;
  course_id?: string;
  expert_id?: string;
  ai_space_type: AiSpaceType;
  ai_space_id?: string;
  name: string;
  description?: string;
  icon?: string;
}): Workspace {
  const workspace: Workspace = {
    id: generateId(),
    user_id: params.user_id,
    course_id: params.course_id || null,
    expert_id: params.expert_id || null,
    ai_space_type: params.ai_space_type,
    ai_space_id: params.ai_space_id || null,
    name: params.name,
    description: params.description || null,
    icon: params.icon || null,
    created_at: now(),
    updated_at: now(),
  };

  const workspaces = getStoredWorkspaces();
  workspaces.push(workspace);
  setStoredWorkspaces(workspaces);

  // Auto-create default blocks
  const blocks: WorkspaceBlock[] = DEFAULT_BLOCKS.map((def) => ({
    id: generateId(),
    workspace_id: workspace.id,
    block_type: def.type,
    name: def.name,
    description: def.description,
    icon: def.icon,
    settings: { primary: def.primary || false, order: DEFAULT_BLOCKS.indexOf(def) },
    created_at: now(),
    updated_at: now(),
  }));

  const allBlocks = getStoredBlocks();
  allBlocks.push(...blocks);
  setStoredBlocks(allBlocks);

  return workspace;
}

// Get or create workspace for AI space — ensures every AI space has workspace
export function getOrCreateWorkspace(params: {
  user_id: string;
  course_id?: string;
  expert_id?: string;
  ai_space_type: AiSpaceType;
  ai_space_id?: string;
  name: string;
  description?: string;
  icon?: string;
}): Workspace {
  const workspaces = getStoredWorkspaces();

  // Find existing
  let existing: Workspace | undefined;
  if (params.course_id) {
    existing = workspaces.find((w) => w.user_id === params.user_id && w.course_id === params.course_id);
  } else if (params.expert_id) {
    existing = workspaces.find((w) => w.user_id === params.user_id && w.expert_id === params.expert_id);
  } else if (params.ai_space_id) {
    existing = workspaces.find((w) => w.user_id === params.user_id && w.ai_space_id === params.ai_space_id);
  }

  if (existing) {
    return existing;
  }

  // Create new
  return createWorkspace(params);
}

export function getWorkspaces(userId: string): Workspace[] {
  return getStoredWorkspaces().filter((w) => w.user_id === userId);
}

export function getWorkspaceById(workspaceId: string, userId: string): Workspace | null {
  const workspaces = getStoredWorkspaces();
  return workspaces.find((w) => w.id === workspaceId && w.user_id === userId) || null;
}

export function getWorkspaceByCourse(courseId: string, userId: string): Workspace | null {
  const workspaces = getStoredWorkspaces();
  return workspaces.find((w) => w.user_id === userId && w.course_id === courseId) || null;
}

export function getWorkspaceByExpert(expertId: string, userId: string): Workspace | null {
  const workspaces = getStoredWorkspaces();
  return workspaces.find((w) => w.user_id === userId && w.expert_id === expertId) || null;
}

export function getBlocksForWorkspace(workspaceId: string): WorkspaceBlock[] {
  return getStoredBlocks().filter((b) => b.workspace_id === workspaceId);
}

export function deleteWorkspace(workspaceId: string, userId: string): boolean {
  const workspaces = getStoredWorkspaces();
  const index = workspaces.findIndex((w) => w.id === workspaceId && w.user_id === userId);
  if (index === -1) return false;

  workspaces.splice(index, 1);
  setStoredWorkspaces(workspaces);

  // Delete blocks
  const blocks = getStoredBlocks();
  const remainingBlocks = blocks.filter((b) => b.workspace_id !== workspaceId);
  setStoredBlocks(remainingBlocks);

  // TODO: Delete files, notes, folders, etc. — for now just workspace + blocks

  return true;
}

// For custom expert creation — auto-provision workspace
export function createWorkspaceForCustomExpert(params: { user_id: string; expert_id: string; expert_name: string }): Workspace {
  return getOrCreateWorkspace({
    user_id: params.user_id,
    expert_id: params.expert_id,
    ai_space_type: "CUSTOM",
    ai_space_id: params.expert_id,
    name: `${params.expert_name} Workspace`,
    description: `Personal workspace for ${params.expert_name}`,
    icon: "🧠",
  });
}

// Global personal vault — for files belonging to user generally, not specific AI space
export function getOrCreateGlobalVault(userId: string): Workspace {
  return getOrCreateWorkspace({
    user_id: userId,
    ai_space_type: "GLOBAL",
    ai_space_id: "global",
    name: "My Personal Vault",
    description: "General documents, notes, media — not specific to any AI Professor",
    icon: "📦",
  });
}
