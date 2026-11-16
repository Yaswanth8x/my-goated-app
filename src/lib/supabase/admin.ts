import { createClient } from "@supabase/supabase-js";
import { env, assertServerEnv } from "@/lib/env";

// ============================================================
// Supabase Admin Client — Service Role, SERVER ONLY
// Workspace 1 Part 14
// NEVER expose service_role key to browser!
// Use only in API routes that need to bypass RLS (e.g., admin dashboard, triggers)
// ============================================================

export function createAdminClient() {
  assertServerEnv();

  const url = env.supabase.url;
  const serviceRoleKey = env.server.supabaseServiceRoleKey;

  if (!url || !serviceRoleKey || url.includes("your-project") || serviceRoleKey.includes("your-service")) {
    console.warn("Supabase admin not configured — service role key missing");
    // Return null to indicate not configured, caller should handle
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to check if admin is configured
export function isAdminConfigured(): boolean {
  const url = env.supabase.url;
  const key = env.server.supabaseServiceRoleKey;
  return !!url && !!key && !url.includes("your-project") && !key.includes("your-service");
}
