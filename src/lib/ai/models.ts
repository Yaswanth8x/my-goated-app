// ============================================================
// Model Registry — Central registry, not hardcoded everywhere
// Workspace 2 Part 32
// ============================================================

import { ModelInfo, ProviderName, CostClass } from "./types";

export const modelRegistry: ModelInfo[] = [
  // Mock — always available
  {
    provider: "mock",
    model_id: "mock-v1",
    display_name: "Mock Provider (Free, No Credits)",
    capabilities: { text: true, vision: false, tools: false, reasoning: false, embeddings: true },
    context_window: 4096,
    supports_vision: false,
    supports_tools: false,
    supports_reasoning: false,
    supports_embeddings: true,
    cost_class: "FREE",
    enabled: true,
    description: "Deterministic mock for testing UI without API credits. Clearly labeled MOCK RESPONSE.",
  },
  {
    provider: "mock",
    model_id: "mock-vision",
    display_name: "Mock Vision (Free)",
    capabilities: { text: true, vision: true, tools: false, reasoning: false, embeddings: true },
    context_window: 4096,
    supports_vision: true,
    supports_tools: false,
    supports_reasoning: false,
    supports_embeddings: true,
    cost_class: "FREE",
    enabled: true,
    description: "Mock vision for testing image analysis.",
  },

  // Gemini — Free tier available
  {
    provider: "gemini",
    model_id: "gemini-1.5-flash",
    display_name: "Gemini 1.5 Flash (Free Tier, Fast)",
    capabilities: { text: true, vision: true, tools: true, reasoning: false, embeddings: false },
    context_window: 1000000,
    supports_vision: true,
    supports_tools: true,
    supports_reasoning: false,
    supports_embeddings: false,
    cost_class: "FREE",
    enabled: true,
    description: "Free tier, 1M context, fast, vision. Best free option.",
  },
  {
    provider: "gemini",
    model_id: "gemini-1.5-pro",
    display_name: "Gemini 1.5 Pro (Free Tier, 2M Context)",
    capabilities: { text: true, vision: true, tools: true, reasoning: true, embeddings: false },
    context_window: 2000000,
    supports_vision: true,
    supports_tools: true,
    supports_reasoning: true,
    supports_embeddings: false,
    cost_class: "FREE",
    enabled: true,
    description: "2M context, more capable, free tier. Good for large docs.",
  },
  {
    provider: "gemini",
    model_id: "gemini-1.5-flash-8b",
    display_name: "Gemini 1.5 Flash 8B (Cheapest)",
    capabilities: { text: true, vision: false, tools: false, reasoning: false, embeddings: false },
    context_window: 1000000,
    supports_vision: false,
    supports_tools: false,
    supports_reasoning: false,
    supports_embeddings: false,
    cost_class: "FREE",
    enabled: true,
    description: "Cheapest, fastest, for simple tasks.",
  },
  {
    provider: "gemini",
    model_id: "text-embedding-004",
    display_name: "Gemini Embedding 004",
    capabilities: { text: false, vision: false, tools: false, reasoning: false, embeddings: true },
    context_window: 2048,
    supports_vision: false,
    supports_tools: false,
    supports_reasoning: false,
    supports_embeddings: true,
    cost_class: "FREE",
    enabled: true,
    description: "For RAG embeddings.",
  },

  // OpenAI — Low cost and premium
  {
    provider: "openai",
    model_id: "gpt-4o-mini",
    display_name: "GPT-4o Mini (Low Cost, Vision)",
    capabilities: { text: true, vision: true, tools: true, reasoning: false, embeddings: false },
    context_window: 128000,
    supports_vision: true,
    supports_tools: true,
    supports_reasoning: false,
    supports_embeddings: false,
    cost_class: "LOW_COST",
    enabled: true,
    description: "Affordable, fast, vision. Good for most tasks. $0.15/1M input.",
  },
  {
    provider: "openai",
    model_id: "gpt-4o",
    display_name: "GPT-4o (Premium, Best)",
    capabilities: { text: true, vision: true, tools: true, reasoning: true, embeddings: false },
    context_window: 128000,
    supports_vision: true,
    supports_tools: true,
    supports_reasoning: true,
    supports_embeddings: false,
    cost_class: "PREMIUM",
    enabled: true,
    description: "Most capable, vision, reasoning. Higher cost.",
  },
  {
    provider: "openai",
    model_id: "text-embedding-3-small",
    display_name: "OpenAI Embedding 3 Small",
    capabilities: { text: false, vision: false, tools: false, reasoning: false, embeddings: true },
    context_window: 8191,
    supports_vision: false,
    supports_tools: false,
    supports_reasoning: false,
    supports_embeddings: true,
    cost_class: "LOW_COST",
    enabled: true,
    description: "For RAG embeddings.",
  },

  // Anthropic — Premium reasoning
  {
    provider: "anthropic",
    model_id: "claude-3-5-sonnet-20241022",
    display_name: "Claude 3.5 Sonnet (Premium, Best Reasoning)",
    capabilities: { text: true, vision: true, tools: true, reasoning: true, embeddings: false },
    context_window: 200000,
    supports_vision: true,
    supports_tools: true,
    supports_reasoning: true,
    supports_embeddings: false,
    cost_class: "PREMIUM",
    enabled: true,
    description: "Best reasoning, coding, vision. Higher cost but top quality.",
  },
  {
    provider: "anthropic",
    model_id: "claude-3-5-haiku-20241022",
    display_name: "Claude 3.5 Haiku (Fast, Low Cost)",
    capabilities: { text: true, vision: true, tools: true, reasoning: false, embeddings: false },
    context_window: 200000,
    supports_vision: true,
    supports_tools: true,
    supports_reasoning: false,
    supports_embeddings: false,
    cost_class: "LOW_COST",
    enabled: true,
    description: "Fast, affordable, good for most tasks.",
  },

  // OpenRouter — OpenAI-compatible, many models
  {
    provider: "openrouter",
    model_id: "openai/gpt-4o-mini",
    display_name: "OpenRouter: GPT-4o Mini",
    capabilities: { text: true, vision: true, tools: true, reasoning: false, embeddings: false },
    context_window: 128000,
    supports_vision: true,
    supports_tools: true,
    supports_reasoning: false,
    supports_embeddings: false,
    cost_class: "LOW_COST",
    enabled: true,
    description: "Via OpenRouter — access many models with one key.",
  },
  {
    provider: "openrouter",
    model_id: "google/gemini-flash-1.5",
    display_name: "OpenRouter: Gemini Flash 1.5",
    capabilities: { text: true, vision: true, tools: true, reasoning: false, embeddings: false },
    context_window: 1000000,
    supports_vision: true,
    supports_tools: true,
    supports_reasoning: false,
    supports_embeddings: false,
    cost_class: "FREE",
    enabled: true,
    description: "Gemini via OpenRouter.",
  },
];

// Helper functions

export function getModelById(modelId: string): ModelInfo | undefined {
  return modelRegistry.find((m) => m.model_id === modelId);
}

export function getModelsByProvider(provider: ProviderName): ModelInfo[] {
  return modelRegistry.filter((m) => m.provider === provider);
}

export function getEnabledModels(): ModelInfo[] {
  return modelRegistry.filter((m) => m.enabled);
}

export function getFreeModels(): ModelInfo[] {
  return modelRegistry.filter((m) => m.cost_class === "FREE" && m.enabled);
}

export function getModelsByCapability(capability: keyof ModelInfo["capabilities"]): ModelInfo[] {
  return modelRegistry.filter((m) => m.capabilities[capability] && m.enabled);
}

export function getVisionModels(): ModelInfo[] {
  return modelRegistry.filter((m) => m.supports_vision && m.enabled);
}

export function getEmbeddingModels(): ModelInfo[] {
  return modelRegistry.filter((m) => m.supports_embeddings && m.enabled);
}

// Cost class ordering for preference
export const costClassOrder: Record<CostClass, number> = {
  FREE: 0,
  LOW_COST: 1,
  PREMIUM: 2,
};

export function sortByCost(models: ModelInfo[]): ModelInfo[] {
  return [...models].sort((a, b) => costClassOrder[a.cost_class] - costClassOrder[b.cost_class]);
}
