import { z } from "zod";

// ============================================================
// Environment Validation Schema (Workspace 1 Part 12)
// Ensures env vars are present and correctly formatted
// ============================================================

export const envSchema = z.object({
  // PUBLIC
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_AI_PROVIDER: z.enum(["mock", "openai", "gemini", "anthropic", "openrouter"]).default("mock"),

  // Feature Flags
  NEXT_PUBLIC_AI_HUB_ENABLED: z.string().optional(),
  NEXT_PUBLIC_RAG_ENABLED: z.string().optional(),

  // SERVER SECRET
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 chars"),
  ENCRYPTION_KEY: z.string().optional(),

  // AI Providers
  OPENAI_API_KEY: z.string().optional().or(z.literal("")),
  OPENAI_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

  GEMINI_API_KEY: z.string().optional().or(z.literal("")),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),

  ANTHROPIC_API_KEY: z.string().optional().or(z.literal("")),
  ANTHROPIC_MODEL: z.string().default("claude-3-5-sonnet-20241022"),

  OPENROUTER_API_KEY: z.string().optional().or(z.literal("")),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o-mini"),

  AI_PROVIDER: z.enum(["mock", "openai", "gemini", "anthropic", "openrouter"]).default("mock"),
});

export type Env = z.infer<typeof envSchema>;

// Validate on server only
export function validateEnv(): { success: boolean; errors?: string[]; env?: Env } {
  // Only validate server env in Node, not in browser
  if (typeof window !== "undefined") {
    return { success: true };
  }

  try {
    const parsed = envSchema.parse(process.env);
    return { success: true, env: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!anonKey && url !== "" && anonKey !== "" && !url.includes("your-project");
}

// Helper to check if any AI provider is configured
export function isAIConfigured(): boolean {
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENROUTER_API_KEY
  );
}

// API Key validation helpers
export const apiKeySchemas = {
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  courseCode: z.string().min(1).max(20),
  documentTitle: z.string().min(1).max(200),
};

// Chat validation
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(10000),
});

export const chatRequestSchema = z.object({
  conversation_id: z.string().optional(),
  course_id: z.string().optional(),
  expert_id: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  messages: z.array(chatMessageSchema).min(1),
  teaching_mode: z.string().optional(),
});
