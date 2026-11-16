"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

// ============================================================
// Supabase Browser Client — For client components
// Workspace 1 Part 14
// ============================================================

export function createClient() {
  const url = env.supabase.url;
  const anonKey = env.supabase.anonKey;

  if (!url || !anonKey || url.includes("your-project")) {
    // Return a mock client that warns when Supabase not configured
    console.warn("Supabase not configured — using mock mode. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env");
    // Still create client with dummy values to avoid crashes, but it will fail on requests
    // Better to throw clear error in UI
  }

  return createBrowserClient(url || "https://placeholder.supabase.co", anonKey || "placeholder-anon-key");
}

// Singleton for client-side
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
