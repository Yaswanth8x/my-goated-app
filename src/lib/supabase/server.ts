import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { assertServerEnv } from "@/lib/env";

// ============================================================
// Supabase Server Client — For server components and API routes
// Workspace 1 Part 14
// ============================================================

export async function createClient() {
  assertServerEnv();

  const cookieStore = await cookies();

  const url = env.supabase.url;
  const anonKey = env.supabase.anonKey;

  if (!url || !anonKey || url.includes("your-project")) {
    console.warn("Supabase not configured on server — mock mode");
  }

  return createServerClient(url || "https://placeholder.supabase.co", anonKey || "placeholder-anon-key", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

// Helper to get user in server components
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  return user;
}

// Helper to get session
export async function getSession() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return session;
}
