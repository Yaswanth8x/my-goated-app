// ============================================================
// Secure API Key Handling — Server-only, encrypted storage
// Workspace 2 Part 34
// ============================================================

import { createHash, createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { assertServerEnv, env } from "@/lib/env";

// NEVER expose these functions to client — server-only
// Use only in API routes

function getEncryptionKey(): Buffer {
  assertServerEnv();
  const key = env.server.encryptionKey || env.server.authSecret;

  if (!key || key.length < 16) {
    throw new Error("ENCRYPTION_KEY or AUTH_SECRET must be at least 16 chars for key encryption");
  }

  // Hash to 32 bytes for AES-256
  return createHash("sha256").update(key).digest();
}

// Encrypt API key for storage in DB
export function encryptApiKey(plainKey: string): string {
  assertServerEnv();

  if (!plainKey) return "";

  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(plainKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return iv:encrypted
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt API key from DB
export function decryptApiKey(encryptedKey: string): string {
  assertServerEnv();

  if (!encryptedKey) return "";

  // Check if it's already plain (for migration or env fallback)
  if (!encryptedKey.includes(":")) {
    // Might be plain key — return as is (but should be encrypted in DB)
    return encryptedKey;
  }

  try {
    const key = getEncryptionKey();
    const [ivHex, encrypted] = encryptedKey.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt API key", error);
    // Fallback: return as is if decryption fails (might be plain)
    return encryptedKey;
  }
}

// Validate API key format (basic)
export function validateApiKeyFormat(provider: string, apiKey: string): { valid: boolean; error?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: "API key is empty" };
  }

  // Basic format checks
  switch (provider) {
    case "openai":
      if (!apiKey.startsWith("sk-")) {
        return { valid: false, error: "OpenAI key should start with sk-" };
      }
      break;
    case "gemini":
      if (apiKey.length < 20) {
        return { valid: false, error: "Gemini key seems too short" };
      }
      break;
    case "anthropic":
      if (!apiKey.startsWith("sk-ant-")) {
        return { valid: false, error: "Anthropic key should start with sk-ant-" };
      }
      break;
    case "openrouter":
      if (!apiKey.startsWith("sk-or-")) {
        return { valid: false, error: "OpenRouter key should start with sk-or-" };
      }
      break;
  }

  return { valid: true };
}

// Get provider config from DB + env fallback
// This should be called server-side only
export async function getProviderConfigsForUser(userId: string): Promise<
  { provider: string; apiKey: string; enabled: boolean; model?: string; baseUrl?: string }[]
> {
  assertServerEnv();

  // For now, return env-based configs
  // In future, query from Supabase ai_providers table and decrypt

  // TODO: Implement Supabase query when DB is set up
  // const supabase = createAdminClient()
  // const { data } = await supabase.from('ai_providers').select('*').eq('user_id', userId)
  // Decrypt each api_key_encrypted

  // For now, env fallback
  const configs = [];

  // Mock always
  configs.push({ provider: "mock", apiKey: "", enabled: true, model: "mock-v1" });

  if (env.server.openai.apiKey) {
    configs.push({
      provider: "openai",
      apiKey: env.server.openai.apiKey,
      enabled: true,
      model: env.server.openai.model,
      baseUrl: env.server.openai.baseUrl,
    });
  }

  if (env.server.gemini.apiKey) {
    configs.push({
      provider: "gemini",
      apiKey: env.server.gemini.apiKey,
      enabled: true,
      model: env.server.gemini.model,
    });
  }

  if (env.server.anthropic.apiKey) {
    configs.push({
      provider: "anthropic",
      apiKey: env.server.anthropic.apiKey,
      enabled: true,
      model: env.server.anthropic.model,
    });
  }

  if (env.server.openrouter.apiKey) {
    configs.push({
      provider: "openrouter",
      apiKey: env.server.openrouter.apiKey,
      enabled: true,
      model: env.server.openrouter.model,
      baseUrl: env.server.openrouter.baseUrl,
    });
  }

  return configs;
}

// Securely store provider key (to be used in API route)
// Returns encrypted key for DB storage
export function prepareKeyForStorage(plainKey: string): string {
  assertServerEnv();
  return encryptApiKey(plainKey);
}

// For client-side: Never expose real keys, only show if configured (masked)
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return "••••••••";
  return apiKey.slice(0, 4) + "••••••••" + apiKey.slice(-4);
}
