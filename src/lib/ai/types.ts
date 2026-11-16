// ============================================================
// AI Types — Workspace 2 Part 27
// Provider-agnostic types for chat, embeddings, models
// ============================================================

export type ProviderName = "mock" | "openai" | "gemini" | "anthropic" | "openrouter" | "ollama";
export type CostClass = "FREE" | "LOW_COST" | "PREMIUM";
export type TeachingMode =
  | "explain"
  | "explain_simply"
  | "deep_dive"
  | "visualize"
  | "example"
  | "analogy"
  | "derive"
  | "solve"
  | "hint"
  | "quiz"
  | "viva"
  | "pyq_mode"
  | "exam_mode"
  | "common_mistakes"
  | "connect"
  | "real_world"
  | "default";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  citations?: Citation[];
  tokens?: number;
  model?: string;
}

export interface Citation {
  source: string; // e.g., "C Notes.pdf"
  document_id?: string;
  document_title?: string;
  page?: number;
  section?: string;
  excerpt?: string; // relevant excerpt
  chunk_id?: string;
}

export interface CourseContext {
  course_id?: string;
  course_code?: string;
  course_name?: string;
  unit_id?: string;
  unit_number?: number;
  unit_title?: string;
  topics?: string[];
  cos?: { code: string; description: string }[];
  mastery?: number; // 0-100
  weak_concepts?: string[];
}

export interface ExpertContext {
  expert_id?: string;
  expert_name?: string;
  persona?: string;
  expertise?: string;
}

export interface UserContext {
  user_id?: string;
  display_name?: string;
  email?: string;
  learning_preferences?: {
    prefers_visual?: boolean;
    prefers_simple?: boolean;
    prefers_examples?: boolean;
  };
}

export interface MemoryContext {
  academic?: string[]; // e.g., ["User struggles with pointers", "Completed Unit 2 test"]
  professional?: string[];
  global?: string[];
  expert?: string[];
}

export interface RetrievedChunk {
  id: string;
  document_id: string;
  document_title: string;
  content: string;
  page?: number;
  section?: string;
  score: number; // similarity score
  course_id?: string;
  unit_id?: string;
}

export interface AIRequest {
  messages: ChatMessage[];
  course_context?: CourseContext;
  expert_context?: ExpertContext;
  user_context?: UserContext;
  memory_context?: MemoryContext;
  retrieved_chunks?: RetrievedChunk[];
  teaching_mode?: TeachingMode;
  provider?: ProviderName;
  model_id?: string;
  stream?: boolean;
  attachments?: { type: "image"; url: string; base64?: string }[];
  temperature?: number;
  max_tokens?: number;
}

export interface AIResponse {
  content: string;
  citations?: Citation[];
  usage?: {
    provider: ProviderName;
    model: string;
    tokens_input?: number;
    tokens_output?: number;
    cost_estimate?: number;
  };
  model?: string;
  provider?: ProviderName;
  finish_reason?: "stop" | "length" | "error";
}

export interface ModelInfo {
  provider: ProviderName;
  model_id: string;
  display_name: string;
  capabilities: {
    text: boolean;
    vision: boolean;
    tools: boolean;
    reasoning: boolean;
    embeddings: boolean;
  };
  context_window: number;
  supports_vision: boolean;
  supports_tools: boolean;
  supports_reasoning: boolean;
  supports_embeddings: boolean;
  cost_class: CostClass;
  enabled: boolean;
  description?: string;
}

export interface ProviderConfig {
  provider: ProviderName;
  api_key?: string;
  base_url?: string;
  model?: string;
  enabled: boolean;
}

export interface RouterInput {
  task: string; // e.g., "simple explanation", "large doc analysis", "coding", "vision", "deep reasoning"
  teaching_mode?: TeachingMode;
  has_attachments?: boolean;
  has_large_context?: boolean;
  course_context?: CourseContext;
  user_preferences?: {
    prefer_free?: boolean;
    budget?: "FREE" | "LOW_COST" | "PREMIUM";
  };
  available_providers: ProviderConfig[];
}

export interface RouterOutput {
  provider: ProviderName;
  model_id: string;
  reason: string; // why this model was selected
}

export interface UsageRecord {
  user_id: string;
  provider: ProviderName;
  model: string;
  tokens_input?: number;
  tokens_output?: number;
  cost_estimate?: number;
  task?: string;
  course_id?: string;
  expert_id?: string;
  conversation_id?: string;
  created_at: string;
}

// For streaming
export type StreamChunk = {
  type: "content" | "citation" | "usage" | "error" | "done";
  content?: string;
  citation?: Citation;
  usage?: AIResponse["usage"];
  error?: string;
};
