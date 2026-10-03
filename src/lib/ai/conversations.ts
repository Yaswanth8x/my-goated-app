// ============================================================
// Conversation Persistence — Local + Supabase
// Workspace 2 Part 45
// ============================================================

import { ChatMessage, Citation, ProviderName, TeachingMode } from "./types";
import { logger } from "@/lib/logger";

export interface Conversation {
  id: string;
  user_id: string;
  course_id?: string;
  expert_id?: string;
  title: string;
  model_id: string;
  provider: ProviderName;
  teaching_mode?: TeachingMode;
  created_at: string;
  updated_at: string;
  messages?: (ChatMessage & { citations?: Citation[] })[];
}

const STORAGE_KEY = "polymath_conversations";

// In-memory + localStorage for mock mode + Supabase for real mode
let inMemoryConversations: Conversation[] = [];

// Load from localStorage
function loadFromStorage(): Conversation[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.error("Failed to load conversations from storage", { error: String(error) });
  }

  return [];
}

// Save to localStorage
function saveToStorage(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    logger.error("Failed to save conversations to storage", { error: String(error) });
  }
}

export function getConversations(userId: string): Conversation[] {
  // Try Supabase first if configured, fallback to localStorage
  // For now, localStorage is primary for mock mode, Supabase TODO for real persistence
  // In future: if Supabase configured, query Supabase first, then merge with localStorage

  if (typeof window !== "undefined") {
    const stored = loadFromStorage();
    if (stored.length > 0) {
      inMemoryConversations = stored;
    }
  }

  return inMemoryConversations
    .filter((c) => c.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

// Async version that tries Supabase
export async function getConversationsAsync(userId: string): Promise<Conversation[]> {
  // If Supabase configured, try to fetch from Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project") && !supabaseUrl.includes("placeholder")) {
    try {
      // Dynamic import to avoid server/client issues
      const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        // Merge with in-memory? For now, return Supabase data
        // Also need to fetch messages for each conversation
        logger.info(`Fetched ${data.length} conversations from Supabase`);
        return data as Conversation[];
      }
    } catch (error) {
      logger.warn("Failed to fetch conversations from Supabase, falling back to localStorage", { error: String(error) });
    }
  }

  // Fallback to localStorage
  return getConversations(userId);
}

export function getConversation(id: string, userId: string): Conversation | undefined {
  const conversations = getConversations(userId);
  return conversations.find((c) => c.id === id);
}

export function createConversation(data: {
  user_id: string;
  course_id?: string;
  expert_id?: string;
  title?: string;
  model_id: string;
  provider: ProviderName;
  teaching_mode?: TeachingMode;
}): Conversation {
  const conversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: data.user_id,
    course_id: data.course_id,
    expert_id: data.expert_id,
    title: data.title || "New Conversation",
    model_id: data.model_id,
    provider: data.provider,
    teaching_mode: data.teaching_mode,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [],
  };

  inMemoryConversations.push(conversation);
  saveToStorage(inMemoryConversations);

  logger.info(`Created conversation ${conversation.id}`, { user_id: data.user_id, course_id: data.course_id });

  // TODO: Save to Supabase when configured
  // const supabase = getSupabaseBrowserClient()
  // await supabase.from('conversations').insert(conversation)

  return conversation;
}

export function updateConversation(id: string, userId: string, updates: Partial<Conversation>): Conversation | undefined {
  const index = inMemoryConversations.findIndex((c) => c.id === id && c.user_id === userId);
  if (index === -1) return undefined;

  inMemoryConversations[index] = {
    ...inMemoryConversations[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  saveToStorage(inMemoryConversations);

  return inMemoryConversations[index];
}

export function addMessageToConversation(
  conversationId: string,
  userId: string,
  message: ChatMessage & { citations?: Citation[] }
): Conversation | undefined {
  const conversation = getConversation(conversationId, userId);
  if (!conversation) return undefined;

  if (!conversation.messages) conversation.messages = [];

  conversation.messages.push(message);
  conversation.updated_at = new Date().toISOString();

  // Auto-generate title from first user message
  if (conversation.messages.length === 1 && message.role === "user") {
    conversation.title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "");
  }

  saveToStorage(inMemoryConversations);

  // TODO: Save to Supabase messages table

  return conversation;
}

export function deleteConversation(id: string, userId: string): boolean {
  const index = inMemoryConversations.findIndex((c) => c.id === id && c.user_id === userId);
  if (index === -1) return false;

  inMemoryConversations.splice(index, 1);
  saveToStorage(inMemoryConversations);

  // TODO: Delete from Supabase

  return true;
}

export function clearAllConversations(userId: string): void {
  inMemoryConversations = inMemoryConversations.filter((c) => c.user_id !== userId);
  saveToStorage(inMemoryConversations);
}
