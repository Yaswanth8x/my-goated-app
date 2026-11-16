// ============================================================
// AI Memory — Structured useful info, not full history
// Workspace 2 Part 46
// ============================================================

import { logger } from "@/lib/logger";

export interface Memory {
  id: string;
  user_id: string;
  course_id?: string;
  expert_id?: string;
  type: "ACADEMIC" | "PROFESSIONAL" | "GLOBAL" | "EXPERT";
  key?: string; // e.g., "struggles_with", "prefers_visual", "completed_unit"
  content: string;
  created_at: string;
  updated_at: string;
}

const MEMORY_STORAGE_KEY = "polymath_memories";
let inMemoryMemories: Memory[] = [];

function loadMemories(): Memory[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.error("Failed to load memories", { error: String(error) });
  }

  return [];
}

function saveMemories(memories: Memory[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
  } catch (error) {
    logger.error("Failed to save memories", { error: String(error) });
  }
}

export function getMemories(userId: string, filters?: { course_id?: string; expert_id?: string; type?: Memory["type"] }): Memory[] {
  if (typeof window !== "undefined") {
    const stored = loadMemories();
    if (stored.length > 0) {
      inMemoryMemories = stored;
    }
  }

  let filtered = inMemoryMemories.filter((m) => m.user_id === userId);

  if (filters?.course_id) {
    filtered = filtered.filter((m) => m.course_id === filters.course_id || !m.course_id);
  }
  if (filters?.expert_id) {
    filtered = filtered.filter((m) => m.expert_id === filters.expert_id || !m.expert_id);
  }
  if (filters?.type) {
    filtered = filtered.filter((m) => m.type === filters.type);
  }

  return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function addMemory(data: {
  user_id: string;
  course_id?: string;
  expert_id?: string;
  type: Memory["type"];
  key?: string;
  content: string;
}): Memory {
  // Don't save every sentence — only structured useful info
  // Check if similar memory already exists
  const existing = inMemoryMemories.find(
    (m) =>
      m.user_id === data.user_id &&
      m.course_id === data.course_id &&
      m.expert_id === data.expert_id &&
      m.key === data.key &&
      m.content === data.content
  );

  if (existing) {
    // Update timestamp
    existing.updated_at = new Date().toISOString();
    saveMemories(inMemoryMemories);
    return existing;
  }

  const memory: Memory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: data.user_id,
    course_id: data.course_id,
    expert_id: data.expert_id,
    type: data.type,
    key: data.key,
    content: data.content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryMemories.push(memory);
  saveMemories(inMemoryMemories);

  logger.info(`Memory added: ${memory.content}`, { user_id: data.user_id, type: data.type, key: data.key });

  // TODO: Save to Supabase memories table

  // Keep only last 200 memories to avoid bloat
  if (inMemoryMemories.length > 200) {
    inMemoryMemories = inMemoryMemories.slice(-200);
    saveMemories(inMemoryMemories);
  }

  return memory;
}

// Auto-extract memory from conversation
export function extractMemoriesFromMessage(
  userId: string,
  message: string,
  courseId?: string,
  expertId?: string
): Memory[] {
  const memories: Memory[] = [];
  const lowerMessage = message.toLowerCase();

  // Detect struggles
  if (lowerMessage.includes("struggle") || lowerMessage.includes("don't understand") || lowerMessage.includes("confused")) {
    const match = message.match(/(?:struggle with|don't understand|confused about|hard to understand)\s+([^.,!?]+)/i);
    if (match) {
      memories.push(
        addMemory({
          user_id: userId,
          course_id: courseId,
          expert_id: expertId,
          type: courseId ? "ACADEMIC" : "GLOBAL",
          key: "struggles_with",
          content: `User struggles with ${match[1].trim()}`,
        })
      );
    }
  }

  // Detect preferences
  if (lowerMessage.includes("prefer visual") || lowerMessage.includes("show diagram") || lowerMessage.includes("visual")) {
    memories.push(
      addMemory({
        user_id: userId,
        type: "GLOBAL",
        key: "prefers_visual",
        content: "User prefers visual explanation",
      })
    );
  }

  if (lowerMessage.includes("simple") || lowerMessage.includes("like to a beginner") || lowerMessage.includes("explain simply")) {
    memories.push(
      addMemory({
        user_id: userId,
        type: "GLOBAL",
        key: "prefers_simple",
        content: "User prefers simple explanation",
      })
    );
  }

  // Detect completion
  if (lowerMessage.includes("completed") || lowerMessage.includes("finished unit") || lowerMessage.includes("done with")) {
    const match = message.match(/(?:completed|finished|done with)\s+([^.,!?]+)/i);
    if (match) {
      memories.push(
        addMemory({
          user_id: userId,
          course_id: courseId,
          type: "ACADEMIC",
          key: "completed",
          content: `User completed ${match[1].trim()}`,
        })
      );
    }
  }

  return memories;
}

export function clearMemories(userId: string): void {
  inMemoryMemories = inMemoryMemories.filter((m) => m.user_id !== userId);
  saveMemories(inMemoryMemories);
}
