/**
 * AI provider layer, validation, feature flags, and workspace security tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { modelRegistry, getModelById, getModelsByProvider, getFreeModels, getVisionModels, sortByCost } from "@/lib/ai/models";
import { AIRouter } from "@/lib/ai/router";
import { chatRequestSchema, isSupabaseConfigured, validateEnv } from "@/lib/validation";
import { featureFlags, isFeatureEnabled, getFeatureStatus } from "@/lib/featureFlags";
import { generateStoragePath, validateFile } from "@/lib/workspace/storage";

const config = (provider: string, api_key: string) => ({
  provider: provider as never,
  enabled: true,
  api_key,
  model: "x",
});

// ---------- Model registry ----------

test("model registry has no duplicate provider/model pairs", () => {
  const keys = modelRegistry.map((m) => `${m.provider}:${m.model_id}`);
  assert.equal(new Set(keys).size, keys.length);
});

test("every registered model declares a cost class", () => {
  for (const m of modelRegistry) {
    assert.ok(["FREE", "LOW_COST", "PREMIUM"].includes(m.cost_class), m.model_id);
  }
});

test("getModelById finds mock-v1 and rejects unknown ids", () => {
  assert.equal(getModelById("mock-v1")?.provider, "mock");
  assert.equal(getModelById("does-not-exist"), undefined);
});

test("registry supports all required providers", () => {
  for (const p of ["mock", "openai", "gemini", "anthropic"] as const) {
    assert.ok(getModelsByProvider(p).length > 0, `${p} has no models`);
  }
});

test("free models and vision models are filterable", () => {
  assert.ok(getFreeModels().every((m) => m.cost_class === "FREE"));
  assert.ok(getVisionModels().every((m) => m.supports_vision));
});

test("sortByCost puts FREE before PREMIUM", () => {
  const sorted = sortByCost(modelRegistry);
  const first = sorted[0].cost_class;
  const last = sorted[sorted.length - 1].cost_class;
  assert.equal(first, "FREE");
  assert.notEqual(last, "FREE");
});

// ---------- Router ----------

test("router falls back to mock when no provider is configured", () => {
  const out = new AIRouter().route({
    task: "explain simply",
    available_providers: [],
  });
  assert.equal(out.provider, "mock");
  assert.match(out.reason, /mock/i);
});

test("router uses mock when only mock is configured", () => {
  const out = new AIRouter().route({
    task: "explain",
    available_providers: [config("mock", "none")],
  });
  assert.equal(out.provider, "mock");
});

test("router picks a vision-capable model for attachments", () => {
  const out = new AIRouter().route({
    task: "analyse image",
    has_attachments: true,
    available_providers: [config("mock", "none"), config("gemini", "key")],
  });
  const model = getModelById(out.model_id);
  assert.ok(model?.supports_vision, `expected vision model, got ${out.model_id}`);
});

test("router prefers a configured real provider over mock", () => {
  const out = new AIRouter().route({
    task: "explain",
    available_providers: [config("mock", "none"), config("openai", "sk-test")],
  });
  assert.notEqual(out.provider, "mock");
});

// ---------- Validation ----------

test("chat request validation accepts a valid payload", () => {
  const parsed = chatRequestSchema.safeParse({
    messages: [{ role: "user", content: "What is a diode?" }],
    course_id: "EC3351",
  });
  assert.equal(parsed.success, true);
});

test("chat request validation rejects an empty message list", () => {
  const parsed = chatRequestSchema.safeParse({ messages: [] });
  assert.equal(parsed.success, false);
});

test("chat request validation rejects blank content and bad roles", () => {
  assert.equal(chatRequestSchema.safeParse({ messages: [{ role: "user", content: "" }] }).success, false);
  assert.equal(chatRequestSchema.safeParse({ messages: [{ role: "hacker", content: "hi" }] }).success, false);
});

test("chat request validation caps content length at 10000 chars", () => {
  const tooLong = "x".repeat(10001);
  assert.equal(chatRequestSchema.safeParse({ messages: [{ role: "user", content: tooLong }] }).success, false);
});

test("placeholder Supabase values are not treated as configured", () => {
  const before = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-anon-key-here";
  assert.equal(isSupabaseConfigured(), false);
  if (before.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = before.url;
  if (before.key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = before.key;
});

test("env validation produces readable error strings", () => {
  const result = validateEnv();
  assert.equal(typeof result.success, "boolean");
  if (!result.success) {
    assert.ok(result.errors && result.errors.length > 0);
  }
});

// ---------- Feature flags ----------

test("feature flags expose required systems", () => {
  for (const key of ["AI_HUB_ENABLED", "RAG_ENABLED", "FREELANCE_ENABLED", "ACADEMIC_ENGINE_ENABLED"]) {
    assert.equal(typeof featureFlags[key as keyof typeof featureFlags], "boolean", key);
  }
});

test("disabled feature returns an explanatory placeholder message", () => {
  const status = getFeatureStatus("FREELANCE_ENABLED");
  assert.equal(status.enabled, isFeatureEnabled("FREELANCE_ENABLED"));
  if (!status.enabled) assert.match(status.message, /disabled/i);
});

// ---------- Workspace security ----------

test("storage paths are scoped under the user's own folder", () => {
  const path = generateStoragePath({
    user_id: "user-123",
    workspace_id: "ws-1",
    block_type: "PDF",
    filename: "notes.pdf",
  });
  assert.ok(path.startsWith("user-123/"));
  assert.ok(path.endsWith("notes.pdf"));
});

test("storage path strips path traversal from the filename", () => {
  const path = generateStoragePath({
    user_id: "u1",
    workspace_id: "w1",
    block_type: "DOCUMENTS",
    filename: "../../../etc/passwd",
  });
  assert.ok(!path.includes(".."), `traversal survived: ${path}`);
  assert.ok(!path.includes("/etc/"), `absolute path survived: ${path}`);
});

test("storage path sanitises hostile folder ids", () => {
  const path = generateStoragePath({
    user_id: "u1",
    workspace_id: "w1",
    block_type: "PDF",
    filename: "a.pdf",
    folder_id: "../../evil",
  });
  assert.ok(!path.includes(".."), `folder traversal survived: ${path}`);
});

test("validateFile rejects oversized files", () => {
  const big = { name: "big.pdf", type: "application/pdf", size: 101 * 1024 * 1024 } as File;
  const result = validateFile(big);
  assert.equal(result.valid, false);
  assert.match(result.error!, /too large/i);
});

test("validateFile enforces the allowed type list", () => {
  const exe = { name: "virus.exe", type: "application/x-msdownload", size: 10 } as File;
  assert.equal(validateFile(exe, ["application/pdf"]).valid, false);

  const pdf = { name: "ok.pdf", type: "application/pdf", size: 10 } as File;
  assert.equal(validateFile(pdf, ["application/pdf"]).valid, true);
});

test("validateFile rejects hostile filenames", () => {
  const evil = { name: "../../x.pdf", type: "application/pdf", size: 10 } as File;
  assert.equal(validateFile(evil).valid, false);
});
