"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { modelRegistry } from "@/lib/ai/models";
import { usageTracker } from "@/lib/ai/usage";

export default function AIProvidersSettingsPage() {
  const [providers, setProviders] = useState([
    { id: "mock", name: "Mock Provider", enabled: true, key: "", model: "mock-v1", cost: "FREE", status: "✅ Always works" },
    { id: "gemini", name: "Google Gemini", enabled: false, key: "", model: "gemini-1.5-flash", cost: "FREE", status: "❌ Not configured" },
    { id: "openai", name: "OpenAI", enabled: false, key: "", model: "gpt-4o-mini", cost: "LOW_COST", status: "❌ Not configured" },
    { id: "anthropic", name: "Anthropic", enabled: false, key: "", model: "claude-3-5-sonnet-20241022", cost: "PREMIUM", status: "❌ Not configured" },
    { id: "openrouter", name: "OpenRouter", enabled: false, key: "", model: "openai/gpt-4o-mini", cost: "LOW_COST", status: "❌ Not configured" },
  ]);

  const [usage, setUsage] = useState<any>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load usage
    fetch("/api/ai/usage")
      .then((res) => res.json())
      .then((data) => setUsage(data))
      .catch(() => {});

    // Check env (client can't see server env, but we can show placeholder)
    // Real implementation would fetch from /api/ai/providers
  }, []);

  const handleToggle = (id: string) => {
    setProviders(providers.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const handleKeyChange = (id: string, key: string) => {
    setProviders(providers.map((p) => (p.id === id ? { ...p, key, status: key ? "✅ Configured (local, not saved to DB yet)" : "❌ Not configured" } : p)));
  };

  const handleSave = () => {
    alert(
      "In production, this would:\n1. Encrypt keys server-side (ENCRYPTION_KEY)\n2. Save encrypted to ai_providers table (user_id, provider, api_key_encrypted, enabled)\n3. Never expose to client\n\nFor now (Workspace 2), set keys in .env:\n- GEMINI_API_KEY (free tier)\n- OPENAI_API_KEY\n- ANTHROPIC_API_KEY\n- OPENROUTER_API_KEY\n\nThen restart dev server.\n\nMock provider always works without keys."
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">AI Providers — Part 33-34</h1>
        <p className="text-muted-foreground">Configure Gemini, OpenAI, Anthropic, Mock — Secure key handling, Router, Fallback, Cost Control</p>
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">🔒 Secure Handling Design (Part 34)</p>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            Keys must never be stored in plain frontend state, HTML, browser JS, logs, GitHub, or plaintext DB without encryption.
            <br />
            <strong>Flow:</strong> User enters key → POST to /api/ai/providers (server) → Server encrypts with ENCRYPTION_KEY → Store encrypted in ai_providers table → Decrypt only when needed for API call, never send to client.
            <br />
            For now, set keys in .env (server-only) and restart. Full encrypted DB storage in Part 34 final.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {provider.name}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        provider.cost === "FREE" ? "bg-green-100 text-green-700" : provider.cost === "LOW_COST" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {provider.cost}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Model: {provider.model} • {provider.status}
                  </CardDescription>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={provider.enabled} onChange={() => handleToggle(provider.id)} className="rounded" />
                  <span className="text-sm">Enabled</span>
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {provider.id !== "mock" ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">API Key (server-only, encrypted)</label>
                    <div className="flex gap-2">
                      <input
                        type={showKeys[provider.id] ? "text" : "password"}
                        value={provider.key}
                        onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                        placeholder={`${provider.name} API key`}
                        className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={() => setShowKeys({ ...showKeys, [provider.id]: !showKeys[provider.id] })}>
                        {showKeys[provider.id] ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Get key:{" "}
                      {provider.id === "gemini" && <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-600 hover:underline">aistudio.google.com/app/apikey (free tier)</a>}
                      {provider.id === "openai" && <a href="https://platform.openai.com/api-keys" target="_blank" className="text-indigo-600 hover:underline">platform.openai.com/api-keys</a>}
                      {provider.id === "anthropic" && <a href="https://console.anthropic.com/settings/keys" target="_blank" className="text-indigo-600 hover:underline">console.anthropic.com/settings/keys</a>}
                      {provider.id === "openrouter" && <a href="https://openrouter.ai/keys" target="_blank" className="text-indigo-600 hover:underline">openrouter.ai/keys</a>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Model</label>
                    <select value={provider.model} onChange={(e) => setProviders(providers.map((p) => (p.id === provider.id ? { ...p, model: e.target.value } : p)))} className="w-full px-3 py-2 rounded-lg border bg-background text-sm">
                      {modelRegistry
                        .filter((m) => m.provider === provider.id)
                        .map((m) => (
                          <option key={m.model_id} value={m.model_id}>
                            {m.display_name} — {m.context_window.toLocaleString()} context
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
                  <p className="font-medium text-green-800">✅ Mock Provider — Always Works</p>
                  <p className="text-green-700 text-xs mt-1">
                    No API key needed, no credits, deterministic responses, clearly labeled <code>MOCK RESPONSE</code>. Use for testing UI without API keys. For real AI, configure Gemini (free tier) or OpenAI.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Configure (Beginner)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <p className="font-medium">Option 1: .env (Quick, for dev)</p>
            <pre className="mt-1 p-2 rounded bg-secondary text-xs overflow-auto">
{`GEMINI_API_KEY="your-gemini-key"
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
# Then restart: npm run dev`}
            </pre>
          </div>
          <div>
            <p className="font-medium">Option 2: Settings UI (Future, encrypted DB)</p>
            <p className="text-muted-foreground text-xs">Enter keys above → Click Save → Server encrypts → Store in ai_providers table → Never exposed to client. (Full implementation in Part 34 final)</p>
          </div>
          <Button onClick={handleSave}>Save (Mock — See Alert)</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Model Registry — Part 32</CardTitle>
          <CardDescription>Central registry, not hardcoded outdated names everywhere</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {modelRegistry.map((model) => (
              <div key={model.model_id} className="p-2 rounded border text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{model.display_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary">{model.provider}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  {model.model_id} • {model.context_window.toLocaleString()} context • {model.supports_vision ? "Vision" : "Text"} • {model.cost_class}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage & Cost Control — Parts 37-38</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {usage ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded bg-secondary">
                  <p className="text-xs text-muted-foreground">Total Cost (30d)</p>
                  <p className="font-bold">${usage.total_cost?.toFixed(4) || "0.0000"}</p>
                </div>
                <div className="p-2 rounded bg-secondary">
                  <p className="text-xs text-muted-foreground">Requests</p>
                  <p className="font-bold">{usage.total_requests || 0}</p>
                </div>
                <div className="p-2 rounded bg-secondary">
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-bold">${usage.budget?.monthly_budget || 10}/mo</p>
                </div>
              </div>
              <div>
                <p className="font-medium">By Provider:</p>
                <pre className="mt-1 p-2 rounded bg-secondary text-xs overflow-auto">{JSON.stringify(usage.by_provider, null, 2)}</pre>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Loading usage...</p>
          )}
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-xs">
            <p className="font-medium text-amber-800">Cost Control Design:</p>
            <p className="text-amber-700">Monthly budget, warning threshold (80%), hard stop option. Tracks provider, model, tokens, cost, date, user, task. Mock provider cost $0.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Router & Fallback — Parts 35-36</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <p>
            <strong>Router:</strong> Task → appropriate model. Simple explanation → cheap/free, large doc → high-context (Gemini 1.5 Pro 1M), coding → capable (Claude 3.5 Sonnet), vision → vision-capable, reasoning → reasoning model.
          </p>
          <p>
            <strong>Fallback:</strong> If Provider A fails → Provider B if configured → Mock. Never auto-consume paid credits unless user enabled. Example: Gemini ↓ OpenAI ↓ Anthropic ↓ Mock.
          </p>
          <p className="text-muted-foreground">Try: Ask with AUTO model, disconnect one provider, see fallback to next.</p>
        </CardContent>
      </Card>
    </div>
  );
}
