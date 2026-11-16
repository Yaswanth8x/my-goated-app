// ============================================================
// Env Helper — Centralized env access with safety
// Workspace 1 Part 12
// ============================================================

export const env = {
  // PUBLIC — safe for client
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  aiProvider: process.env.NEXT_PUBLIC_AI_PROVIDER || "mock",

  // SERVER ONLY — never import this in client components directly
  // Use via API routes or server components
  server: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
    authSecret: process.env.AUTH_SECRET || "dev-only-change-me",
    encryptionKey: process.env.ENCRYPTION_KEY || "",

    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || "",
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || "",
      baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    },
    aiProvider: process.env.AI_PROVIDER || "mock",
  },

  // Feature Flags
  features: {
    aiHub: process.env.NEXT_PUBLIC_AI_HUB_ENABLED !== "false",
    rag: process.env.NEXT_PUBLIC_RAG_ENABLED !== "false",
    freelance: process.env.NEXT_PUBLIC_FREELANCE_ENABLED === "true",
    multiUser: process.env.NEXT_PUBLIC_MULTI_USER_ENABLED !== "false",
  },
};

// Safety check: Prevent server env from being used in client
export function assertServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("Server env accessed in client — this would expose secrets! Use API routes instead.");
  }
}
