"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("yaswanth@local");
  const [password, setPassword] = useState("ceg-ece");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signIn, isSupabaseConfigured } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Login successful! Redirecting to home...");
      setTimeout(() => router.push("/"), 1000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      {!isSupabaseConfigured && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">⚠️ Supabase not configured — Mock Mode</p>
            <p className="text-amber-700 dark:text-amber-300 mt-1">
              Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env for real auth.
              For now, use mock login: <code>yaswanth@local / ceg-ece</code>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Login — Part 19 ✅</CardTitle>
          <CardDescription>
            {isSupabaseConfigured ? "Supabase Auth enabled" : "Mock Auth (Supabase not configured)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ceg.edu.in"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <p className="font-medium">Login failed:</p>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                {isSupabaseConfigured
                  ? "Real Supabase Auth — your data is isolated via RLS"
                  : "Mock mode — no real DB, but UI works. Configure Supabase for real persistence."}
              </p>
              <Link href="/signup" className="text-sm text-indigo-600 hover:underline block">
                Don't have account? Sign Up
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:underline block">
                Back to Home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How Auth Works (Beginner)</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-muted-foreground">
          <p><strong>1. Supabase Auth</strong> handles email/password securely, not us.</p>
          <p><strong>2. RLS</strong> ensures you can only see your own documents, chats, projects.</p>
          <p><strong>3. Session</strong> stored in cookies, refreshed via middleware.</p>
          <p><strong>4. Profile</strong> auto-created via trigger when you sign up (see supabase/migrations/001...sql)</p>
          <p><strong>5. Mock mode</strong> lets you test UI without Supabase: yaswanth@local / ceg-ece</p>
        </CardContent>
      </Card>
    </div>
  );
}
