"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const [showEnv, setShowEnv] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">SETTINGS — System Config</h1>
        <p className="text-muted-foreground text-[13px]">Profile, AI Providers, Env Architecture, Storage, Logging, Backup</p>
      </div>

      {/* Auth Status — Polished */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">Authentication — Part 19 ✓</CardTitle>
          <CardDescription className="text-xs">Supabase Auth + RLS + Session State + Mock Fallback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center justify-between p-3 rounded-xl border ${isSupabaseConfigured ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"}`}>
            <div>
              <p className="text-[13px] font-medium">Supabase Configured</p>
              <p className="text-xs text-muted-foreground">
                {isSupabaseConfigured ? "✅ Yes — Real Auth, RLS, Storage" : "⚠️ No — Mock Mode (yaswanth@local / ceg-ece) — Works without Supabase"}
              </p>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}></div>
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border bg-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[13px]">
                  <p><span className="text-muted-foreground">User ID:</span> <span className="font-mono text-xs">{user.id.slice(0, 8)}…</span></p>
                  <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
                  <p><span className="text-muted-foreground">Display Name:</span> {user.user_metadata?.display_name || "N/A"}</p>
                  <p><span className="text-muted-foreground">Provider:</span> {user.app_metadata?.provider || "mock"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
                <Link href="/settings/backup">
                  <Button variant="secondary" size="sm">Backup/Export</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[13px] text-muted-foreground">Not logged in — use mock login or Supabase auth</p>
              <div className="flex gap-2">
                <Link href="/login"><Button size="sm">Login</Button></Link>
                <Link href="/signup"><Button variant="outline" size="sm">Sign Up</Button></Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Env Architecture — Polished */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">Environment Variables — Part 12 ✓</CardTitle>
          <CardDescription className="text-xs">PUBLIC vs SERVER SECRET separation — never expose service role or LLM keys in frontend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-[13px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900">
              <p className="font-medium text-green-800 dark:text-green-200 text-[13px]">✅ PUBLIC (NEXT_PUBLIC_*)</p>
              <p className="text-green-700/70 dark:text-green-300/70 text-xs mt-1">Safe for browser, visible in JS bundle</p>
              <ul className="mt-2 space-y-1 text-xs text-green-700 dark:text-green-300 font-mono">
                <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>• NEXT_PUBLIC_APP_URL</li>
                <li>• Feature flags</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900">
              <p className="font-medium text-red-800 dark:text-red-200 text-[13px]">🔒 SERVER SECRET</p>
              <p className="text-red-700/70 dark:text-red-300/70 text-xs mt-1">Never expose to browser — server-only</p>
              <ul className="mt-2 space-y-1 text-xs text-red-700 dark:text-red-300 font-mono">
                <li>• SUPABASE_SERVICE_ROLE_KEY</li>
                <li>• DATABASE_URL</li>
                <li>• OPENAI/GEMINI/ANTHROPIC_API_KEY</li>
                <li>• AUTH_SECRET, ENCRYPTION_KEY</li>
              </ul>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowEnv(!showEnv)} className="h-8 text-xs">
            {showEnv ? "Hide" : "Show"} Env Check
          </Button>

          {showEnv && (
            <div className="p-3 rounded-xl bg-secondary font-mono text-xs space-y-1.5 border">
              <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set (mock mode)"}</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set (mock mode)"}</p>
              <p>NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000 (default)"}</p>
              <p className="text-muted-foreground">Server secrets hidden — check Vercel env or .env locally</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">See <code className="px-1 py-0.5 rounded bg-secondary">.env.example</code> for full architecture. Never commit <code className="px-1 py-0.5 rounded bg-secondary">.env</code> — .gitignore blocks it. Server secrets via <code className="px-1 py-0.5 rounded bg-secondary">assertServerEnv()</code> guard.</p>
        </CardContent>
      </Card>

      {/* AI Providers — Polished Complete */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">AI Providers — Parts 33-34 ✓ Complete</CardTitle>
          <CardDescription className="text-xs">Settings → AI Providers — Gemini, OpenAI, Anthropic, Mock — Secure handling, encrypted storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2.5">
            {[
              { name: "Google Gemini", key: "GEMINI_API_KEY", model: "gemini-1.5-flash", cost: "FREE", desc: "Free tier, fast, good for course AI" },
              { name: "OpenAI", key: "OPENAI_API_KEY", model: "gpt-4o-mini", cost: "LOW_COST", desc: "Balanced cost/quality" },
              { name: "Anthropic", key: "ANTHROPIC_API_KEY", model: "claude-3-5-sonnet", cost: "PREMIUM", desc: "High quality, reasoning" },
              { name: "Mock", key: "None", model: "mock-v1", cost: "FREE", desc: "Always works, labeled MOCK RESPONSE" },
            ].map((provider) => (
              <div key={provider.name} className="flex items-center justify-between p-3 rounded-xl border hover:bg-secondary/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-[13px]">{provider.name} — <span className="font-mono text-xs text-muted-foreground">{provider.model}</span></p>
                  <p className="text-xs text-muted-foreground">{provider.desc} • {provider.cost}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${provider.name === "Mock" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-secondary text-muted-foreground"}`}>
                    {provider.name === "Mock" ? "✓ Enabled" : "○ Not configured"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 text-[13px]">
            <p className="font-medium text-amber-800 dark:text-amber-200">Secure Handling — Part 34 ✓</p>
            <p className="text-amber-700/80 dark:text-amber-300/80 text-xs mt-1 leading-relaxed">
              Keys never stored in plain frontend state, HTML, browser JS, logs, GitHub, or plaintext DB without encryption. Flow: User enters key in Settings → encrypted server-side with AES-256-CBC + ENCRYPTION_KEY → stored encrypted in <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50">ai_providers</code> table → accessed only via server API routes with RLS <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50">auth.uid()=user_id</code> → masked in UI (first 4 + last 4). See <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50">src/lib/ai/secure.ts</code>.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/settings/ai-providers">
              <Button size="sm">Manage AI Providers</Button>
            </Link>
            <Link href="/ai-hub">
              <Button size="sm" variant="outline">Open AI Hub</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Storage + Logging — Polished */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">File Storage — Part 23 ✓</CardTitle>
            <CardDescription className="text-xs">Supabase Storage buckets with RLS by user_id folder</CardDescription>
          </CardHeader>
          <CardContent className="text-[13px] space-y-2">
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /><code className="text-xs">documents</code> — private, RLS user_id folder</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /><code className="text-xs">avatars</code> — public</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /><code className="text-xs">project-assets</code> — private</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /><code className="text-xs">portfolio</code> — private</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /><code className="text-xs">course-materials</code> — private</li>
            </ul>
            <p className="text-xs text-muted-foreground pt-2 border-t">Access controls prevent private docs from being public accidentally. Signed URLs 1h expiry.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Error / Logging — Part 24 ✓</CardTitle>
            <CardDescription className="text-xs">Structured WHAT/WHY/WHAT_TO_DO, not "Something went wrong"</CardDescription>
          </CardHeader>
          <CardContent className="text-[13px] space-y-2">
            <p className="text-xs">Logger: <code className="px-1 py-0.5 rounded bg-secondary">src/lib/logger.ts</code></p>
            <pre className="p-2.5 rounded-xl bg-secondary text-[11px] overflow-auto border font-mono">
{`{
  "what": "Document not found",
  "why": "No doc xyz for user abc",
  "what_to_do": "Check /documents or upload"
}`}
            </pre>
            <p className="text-xs text-muted-foreground">Future: system_logs table for admin dashboard — see /admin</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links — Polished */}
      <Card className="border-dashed">
        <CardContent className="pt-6 flex flex-wrap gap-2">
          <Link href="/settings/ai-providers"><Button size="sm" variant="outline" className="h-8 text-xs">AI Providers + Usage</Button></Link>
          <Link href="/settings/backup"><Button size="sm" variant="outline" className="h-8 text-xs">Backup / Export</Button></Link>
          <Link href="/admin"><Button size="sm" variant="outline" className="h-8 text-xs">Admin Dashboard</Button></Link>
          <Link href="/analytics"><Button size="sm" variant="outline" className="h-8 text-xs">Analytics</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
