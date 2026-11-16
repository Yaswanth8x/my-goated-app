import { NextResponse } from "next/server";
import { isSupabaseConfigured, isAIConfigured } from "@/lib/validation";

// ============================================================
// Health endpoint — reports what is actually configured.
// Never report a subsystem as "ok" when it is running in mock mode.
// ============================================================

export async function GET() {
  const supabase = isSupabaseConfigured();
  const aiConfigured = isAIConfigured();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    mode: supabase && aiConfigured ? "configured" : "mock",
    checks: {
      frontend: { state: "ok", detail: "Next.js App Router is serving requests" },
      backend: { state: "ok", detail: "API routes are responding" },
      database: supabase
        ? { state: "configured", detail: "Supabase URL + anon key present" }
        : { state: "mock", detail: "Supabase not configured — data stays in browser localStorage / process memory" },
      auth: supabase
        ? { state: "configured", detail: "Supabase Auth available" }
        : { state: "mock", detail: "Mock login only: yaswanth@local / ceg-ece" },
      ai: aiConfigured
        ? { state: "configured", detail: "At least one real provider key present" }
        : { state: "mock", detail: "No AI provider key — responses are labelled MOCK RESPONSE" },
      storage: supabase
        ? { state: "configured", detail: "Supabase Storage bucket 'workspaces' expected" }
        : { state: "mock", detail: "Uploads are not persisted to a real bucket" },
    },
    next_step: supabase
      ? "Run: npm test && npm run build"
      : "Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env. See SETUP.md.",
  });
}
