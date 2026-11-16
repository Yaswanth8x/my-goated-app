// ============================================================
// AI Router — Selects appropriate provider/model based on task
// Workspace 2 Part 35
// ============================================================

import { RouterInput, RouterOutput, ProviderName } from "./types";
import { modelRegistry, sortByCost, getEnabledModels } from "./models";
import { logger } from "@/lib/logger";

export class AIRouter {
  route(input: RouterInput): RouterOutput {
    const { task, teaching_mode, has_attachments, has_large_context, available_providers, user_preferences } = input;

    // Filter to enabled and configured providers
    const configuredProviders = available_providers.filter((p) => p.enabled && p.api_key);
    const hasMock = available_providers.some((p) => p.provider === "mock" && p.enabled);
    // Mock is FREE, so sorting by cost would always pick it. It must only be used
    // when no real provider is configured — never instead of a provider the user paid for.
    const hasRealProvider = configuredProviders.some((p) => p.provider !== "mock");

    // If no providers configured, use mock
    if (configuredProviders.length === 0) {
      if (hasMock) {
        return {
          provider: "mock",
          model_id: has_attachments ? "mock-vision" : "mock-v1",
          reason: "No providers configured, using Mock (free, no credits)",
        };
      }
      // Even if mock not in available_providers, fallback to mock
      return {
        provider: "mock",
        model_id: "mock-v1",
        reason: "No providers configured, fallback to Mock",
      };
    }

    // Determine requirements
    const needsVision = has_attachments || task.toLowerCase().includes("image") || task.toLowerCase().includes("diagram") || task.toLowerCase().includes("circuit");
    const needsLargeContext = has_large_context || task.toLowerCase().includes("large document") || task.toLowerCase().includes("entire textbook");
    const needsReasoning = task.toLowerCase().includes("reasoning") || task.toLowerCase().includes("derive") || teaching_mode === "deep_dive" || teaching_mode === "derive";
    const needsCoding = task.toLowerCase().includes("code") || task.toLowerCase().includes("debug") || task.toLowerCase().includes("programming");
    const isSimple = task.toLowerCase().includes("simple") || teaching_mode === "explain_simply" || task.toLowerCase().includes("explain simply");

    // Filter models by capabilities
    let candidates = getEnabledModels().filter((m) => {
      // Mock is only a fallback, never a first choice when a real provider exists
      if (m.provider === "mock" && hasRealProvider) return false;

      // Must be from configured providers
      const isConfigured = configuredProviders.some((p) => p.provider === m.provider);
      if (!isConfigured && m.provider !== "mock") return false;

      // Vision requirement
      if (needsVision && !m.supports_vision) return false;

      // Large context requirement
      if (needsLargeContext && m.context_window < 100000) return false;

      // Reasoning requirement
      if (needsReasoning && !m.supports_reasoning) return false;

      // User budget preference
      if (user_preferences?.budget) {
        if (user_preferences.budget === "FREE" && m.cost_class !== "FREE") return false;
        if (user_preferences.budget === "LOW_COST" && m.cost_class === "PREMIUM") return false;
      }

      // Prefer free if user prefers free
      if (user_preferences?.prefer_free && m.cost_class === "PREMIUM") return false;

      return true;
    });

    // If no candidates after filtering, relax constraints
    if (candidates.length === 0) {
      candidates = getEnabledModels().filter((m) => {
        const isConfigured = configuredProviders.some((p) => p.provider === m.provider);
        return isConfigured;
      });
    }

    // If still none, use mock
    if (candidates.length === 0) {
      return {
        provider: "mock",
        model_id: "mock-v1",
        reason: "No suitable models found, fallback to Mock",
      };
    }

    // Sort by cost (prefer FREE, then LOW_COST, then PREMIUM) and context window
    candidates = sortByCost(candidates);

    // Apply task-specific preferences
    let selected;
    if (isSimple) {
      // Simple explanation → cheapest/free
      selected = candidates.find((m) => m.cost_class === "FREE") || candidates[0];
    } else if (needsCoding || needsReasoning) {
      // Coding/reasoning → capable model, prefer Claude or GPT-4o
      selected = candidates.find((m) => m.model_id.includes("claude-3-5-sonnet") || m.model_id.includes("gpt-4o")) || candidates[0];
    } else if (needsLargeContext) {
      // Large context → high context window
      selected = candidates.sort((a, b) => b.context_window - a.context_window)[0];
    } else if (needsVision) {
      // Vision → vision-capable
      selected = candidates.find((m) => m.supports_vision) || candidates[0];
    } else {
      // Default → balanced, prefer low cost
      selected = candidates[0];
    }

    const reason = `Selected ${selected.display_name} for task "${task}" — ${needsVision ? "vision needed, " : ""}${needsLargeContext ? "large context, " : ""}${needsReasoning ? "reasoning, " : ""}${needsCoding ? "coding, " : ""}cost ${selected.cost_class}, context ${selected.context_window}`;

    logger.info(`Router: ${reason}`, { task, provider: selected.provider, model: selected.model_id });

    return {
      provider: selected.provider,
      model_id: selected.model_id,
      reason,
    };
  }

  // Auto-select based on teaching mode
  routeByTeachingMode(teachingMode: string, availableProviders: RouterInput["available_providers"]): RouterOutput {
    const taskMap: Record<string, string> = {
      explain: "simple explanation",
      explain_simply: "simple explanation",
      deep_dive: "deep reasoning",
      visualize: "vision explanation",
      example: "example generation",
      analogy: "simple explanation with analogy",
      derive: "deep reasoning and derivation",
      solve: "problem solving",
      hint: "hint",
      quiz: "quiz generation",
      viva: "viva examination",
      pyq_mode: "PYQ analysis",
      exam_mode: "exam preparation",
      common_mistakes: "error analysis",
      connect: "cross-domain connection",
      real_world: "real-world application",
    };

    const task = taskMap[teachingMode] || "general explanation";

    return this.route({
      task,
      teaching_mode: teachingMode as any,
      available_providers: availableProviders,
      user_preferences: { prefer_free: true },
    });
  }
}

export const aiRouter = new AIRouter();
