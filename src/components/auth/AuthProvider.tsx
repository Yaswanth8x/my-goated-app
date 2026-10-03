"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Check if Supabase is configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const configured = !!url && !!anonKey && !url.includes("your-project") && !url.includes("placeholder");
    setIsSupabaseConfigured(configured);

    if (!configured) {
      logger.warn("Supabase not configured — auth in mock mode");
      // Mock user for dev without Supabase
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      logger.auth(`Auth event: ${event}`, { user_id: session?.user?.id });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const supabase = getSupabaseBrowserClient();
    
    if (!isSupabaseConfigured) {
      return { error: { message: "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env. See SETUP.md" } };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split("@")[0],
        },
      },
    });

    if (error) {
      logger.error("Sign up failed", { error: error.message, email });
    } else {
      logger.auth("User signed up", { email });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseBrowserClient();

    if (!isSupabaseConfigured) {
      // Mock login for dev
      if (email === "yaswanth@local" && password === "ceg-ece") {
        logger.auth("Mock login successful", { email });
        // Create mock user
        const mockUser = {
          id: "mock-user-id",
          email: "yaswanth@local",
          user_metadata: { display_name: "Yaswanth (Mock)" },
        } as unknown as User;
        setUser(mockUser);
        return { error: null };
      }
      return { error: { message: "Supabase not configured. Use yaswanth@local / ceg-ece for mock login, or configure Supabase. See SETUP.md" } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error("Sign in failed", { error: error.message, email });
    } else {
      logger.auth("User signed in", { email });
    }

    return { error };
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    
    setUser(null);
    setSession(null);
    logger.auth("User signed out");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
