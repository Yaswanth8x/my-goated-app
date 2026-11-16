// ============================================================
// Fallback System — Try providers in chain if one fails
// Workspace 2 Part 36
// ============================================================

import { AIProvider } from "./provider";
import { AIRequest, AIResponse, ProviderName } from "./types";
import { MockProvider } from "./mock";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { AnthropicProvider } from "./anthropic";
import { logger } from "@/lib/logger";

export interface ProviderConfig {
  provider: ProviderName;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  enabled: boolean;
}

export class FallbackSystem {
  private createProviderInstance(config: ProviderConfig): AIProvider | null {
    if (!config.enabled) return null;

    try {
      switch (config.provider) {
        case "mock":
          return new MockProvider();
        case "openai":
          if (!config.apiKey) return null;
          return new OpenAIProvider({ apiKey: config.apiKey, baseUrl: config.baseUrl, model: config.model });
        case "gemini":
          if (!config.apiKey) return null;
          return new GeminiProvider({ apiKey: config.apiKey, model: config.model });
        case "anthropic":
          if (!config.apiKey) return null;
          return new AnthropicProvider({ apiKey: config.apiKey, model: config.model });
        case "openrouter":
          if (!config.apiKey) return null;
          // OpenRouter uses OpenAI-compatible API
          return new OpenAIProvider({ apiKey: config.apiKey, baseUrl: config.baseUrl || "https://openrouter.ai/api/v1", model: config.model });
        default:
          return null;
      }
    } catch (error) {
      logger.error(`Failed to create provider ${config.provider}`, { error: String(error) });
      return null;
    }
  }

  // Try providers in order, return first successful response
  async chatWithFallback(
    request: AIRequest,
    providerConfigs: ProviderConfig[],
    preferredProvider?: ProviderName
  ): Promise<AIResponse> {
    // Build ordered list: preferred first, then others, then mock last
    const orderedConfigs = this.orderConfigs(providerConfigs, preferredProvider);

    let lastError: any = null;

    for (const config of orderedConfigs) {
      const provider = this.createProviderInstance(config);
      if (!provider) continue;

      if (!provider.isConfigured()) {
        logger.warn(`Provider ${config.provider} not configured, skipping`);
        continue;
      }

      try {
        logger.info(`Trying provider ${config.provider} with model ${request.model_id || config.model}`);
        const response = await provider.chat(request);
        logger.info(`Provider ${config.provider} succeeded`);
        return response;
      } catch (error) {
        lastError = error;
        logger.warn(`Provider ${config.provider} failed, trying next`, { error: String(error) });

        // Check if error is structured with WHAT/WHY/WHAT TO DO
        try {
          const parsed = JSON.parse((error as Error).message);
          if (parsed.what && parsed.why) {
            logger.error(`Provider ${config.provider} error: ${parsed.what}`, { why: parsed.why });
          }
        } catch {
          // Not structured, just log
        }

        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new Error(
      JSON.stringify({
        what: "All AI providers failed",
        why: lastError ? String(lastError) : "No providers configured or all failed",
        what_to_do: "Check Settings → AI Providers, ensure at least one provider is configured and enabled. Mock provider always works as fallback. If using real providers, check API keys and network.",
        last_error: String(lastError),
      })
    );
  }

  // Streaming with fallback — if first provider fails during streaming, try next
  async *streamChatWithFallback(
    request: AIRequest,
    providerConfigs: ProviderConfig[],
    preferredProvider?: ProviderName
  ): AsyncIterable<string> {
    const orderedConfigs = this.orderConfigs(providerConfigs, preferredProvider);

    let lastError: any = null;

    for (const config of orderedConfigs) {
      const provider = this.createProviderInstance(config);
      if (!provider) continue;

      if (!provider.isConfigured()) continue;

      try {
        logger.info(`Streaming with provider ${config.provider}`);
        let hasYielded = false;

        for await (const chunk of provider.streamChat(request)) {
          hasYielded = true;
          yield chunk;
        }

        // If we got here without error, streaming succeeded
        if (hasYielded) {
          logger.info(`Streaming with ${config.provider} completed`);
          return;
        }
      } catch (error) {
        lastError = error;
        logger.warn(`Streaming with ${config.provider} failed, trying next`, { error: String(error) });
        continue;
      }
    }

    // All failed, yield error message
    yield `\n\n[ERROR: All AI providers failed. Last error: ${String(lastError)}\n\nWHAT TO DO: Check Settings → AI Providers, ensure at least one provider is configured. Mock provider always works.]`;
  }

  private orderConfigs(configs: ProviderConfig[], preferred?: ProviderName): ProviderConfig[] {
    // Always put mock last as ultimate fallback, unless it's the preferred
    const mockConfigs = configs.filter((c) => c.provider === "mock");
    const nonMockConfigs = configs.filter((c) => c.provider !== "mock");

    // Sort non-mock by: preferred first, then FREE, then LOW_COST, then PREMIUM
    // For now, simple: preferred first, then as provided
    let ordered = [...nonMockConfigs];

    if (preferred && preferred !== "mock") {
      const preferredConfig = ordered.find((c) => c.provider === preferred);
      if (preferredConfig) {
        ordered = [preferredConfig, ...ordered.filter((c) => c.provider !== preferred)];
      }
    }

    // Mock last
    ordered = [...ordered, ...mockConfigs];

    // If no mock in configs, add mock as ultimate fallback
    if (mockConfigs.length === 0) {
      ordered.push({ provider: "mock", enabled: true });
    }

    return ordered;
  }

  // Get all available providers from configs + env
  static getProviderConfigsFromEnv(): ProviderConfig[] {
    const configs: ProviderConfig[] = [];

    // Mock always enabled
    configs.push({ provider: "mock", enabled: true });

    // From env vars
    if (process.env.OPENAI_API_KEY) {
      configs.push({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        enabled: true,
      });
    }

    if (process.env.GEMINI_API_KEY) {
      configs.push({
        provider: "gemini",
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        enabled: true,
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      configs.push({
        provider: "anthropic",
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
        enabled: true,
      });
    }

    if (process.env.OPENROUTER_API_KEY) {
      configs.push({
        provider: "openrouter",
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        enabled: true,
      });
    }

    return configs;
  }
}

export const fallbackSystem = new FallbackSystem();
