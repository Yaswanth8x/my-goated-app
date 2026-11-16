"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signUp, isSupabaseConfigured } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await signUp(email, password, displayName);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Sign up successful! Check email if confirmation required, then login.");
      setTimeout(() => router.push("/login"), 2000);
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
              Sign up requires Supabase. For now, use mock login at /login: <code>yaswanth@local / ceg-ece</code>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sign Up — Part 19</CardTitle>
          <CardDescription>
            {isSupabaseConfigured ? "Create account with Supabase Auth" : "Requires Supabase configuration"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Yaswanth"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
              <label className="text-sm font-medium">Password (min 6 chars)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <p className="font-medium">Sign up failed:</p>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !isSupabaseConfigured}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center space-y-2">
              <Link href="/login" className="text-sm text-indigo-600 hover:underline block">
                Already have account? Login
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:underline block">
                Back to Home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
