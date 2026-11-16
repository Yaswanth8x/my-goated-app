// ============================================================
// OpenAI Provider — OpenAI + OpenAI-compatible APIs (OpenRouter, etc.)
// Workspace 2 Part 29
// ============================================================

import { AIProvider } from "./provider";
import { AIRequest, AIResponse, ModelInfo, ProviderName } from "./types";
import OpenAI from "openai";

export class OpenAIProvider extends AIProvider {
  readonly name: ProviderName = "openai";
  readonly displayName = "OpenAI";
  private client: OpenAI | null = null;
  private config: { apiKey: string; baseUrl: string; model: string };

  constructor(config: { apiKey: string; baseUrl?: string; model?: string }) {
    super();
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "https://api.openai.com/v1",
      model: config.model || "gpt-4o-mini",
    };

    if (this.config.apiKey) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseUrl,
        dangerouslyAllowBrowser: false, // server-only
      });
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }

  getModels(): ModelInfo[] {
    return [
      {
        provider: "openai",
        model_id: "gpt-4o-mini",
        display_name: "GPT-4o Mini (Low Cost, Vision)",
        capabilities: { text: true, vision: true, tools: true, reasoning: false, embeddings: false },
        context_window: 128000,
        supports_vision: true,
        supports_tools: true,
        supports_reasoning: false,
        supports_embeddings: false,
        cost_class: "LOW_COST",
        enabled: true,
        description: "Affordable, fast, vision-capable. Good for most tasks.",
      },
      {
        provider: "openai",
        model_id: "gpt-4o",
        display_name: "GPT-4o (Premium, Vision, Best)",
        capabilities: { text: true, vision: true, tools: true, reasoning: true, embeddings: false },
        context_window: 128000,
        supports_vision: true,
        supports_tools: true,
        supports_reasoning: true,
        supports_embeddings: false,
        cost_class: "PREMIUM",
        enabled: true,
        description: "Most capable, vision, reasoning. Higher cost.",
      },
      {
        provider: "openai",
        model_id: "gpt-3.5-turbo",
        display_name: "GPT-3.5 Turbo (Legacy, Cheap)",
        capabilities: { text: true, vision: false, tools: true, reasoning: false, embeddings: false },
        context_window: 16385,
        supports_vision: false,
        supports_tools: true,
        supports_reasoning: false,
        supports_embeddings: false,
        cost_class: "FREE",
        enabled: false,
        description: "Legacy, cheaper but less capable. Consider gpt-4o-mini instead.",
      },
      {
        provider: "openai",
        model_id: "text-embedding-3-small",
        display_name: "Text Embedding 3 Small (Embeddings)",
        capabilities: { text: false, vision: false, tools: false, reasoning: false, embeddings: true },
        context_window: 8191,
        supports_vision: false,
        supports_tools: false,
        supports_reasoning: false,
        supports_embeddings: true,
        cost_class: "LOW_COST",
        enabled: true,
        description: "For RAG embeddings.",
      },
    ];
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    if (!this.client) {
      throw new Error("OpenAI not configured — set OPENAI_API_KEY in .env or Settings → AI Providers");
    }

    try {
      const messages = this.buildMessages(request);
      const model = request.model_id || this.config.model;

      // Convert to OpenAI format
      const openaiMessages = messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      }));

      const completion = await this.client.chat.completions.create({
        model,
        messages: openaiMessages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2000,
      });

      const choice = completion.choices[0];
      const content = choice?.message?.content || "";

      const response: AIResponse = {
        content,
        usage: {
          provider: "openai",
          model,
          tokens_input: completion.usage?.prompt_tokens,
          tokens_output: completion.usage?.completion_tokens,
          cost_estimate: this.estimateCost(model, completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0),
        },
        model,
        provider: "openai",
        finish_reason: choice?.finish_reason === "stop" ? "stop" : "length",
      };

      this.logUsage(request, response);
      return response;
    } catch (error) {
      this.handleError(error, "OpenAI chat");
    }
  }

  async *streamChat(request: AIRequest): AsyncIterable<string> {
    if (!this.client) {
      throw new Error("OpenAI not configured");
    }

    try {
      const messages = this.buildMessages(request);
      const model = request.model_id || this.config.model;

      const openaiMessages = messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      }));

      const stream = await this.client.chat.completions.create({
        model,
        messages: openaiMessages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      this.handleError(error, "OpenAI streamChat");
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.client) {
      throw new Error("OpenAI not configured for embeddings");
    }

    try {
      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      this.handleError(error, "OpenAI embed");
    }
  }

  async validateKey(): Promise<{ valid: boolean; error?: string }> {
    if (!this.config.apiKey) {
      return { valid: false, error: "API key missing" };
    }

    try {
      // Try to list models as validation
      if (!this.client) return { valid: false, error: "Client not initialized" };
      await this.client.models.list();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Rough estimates, update with current pricing
    const pricing: Record<string, { input: number; output: number }> = {
      "gpt-4o-mini": { input: 0.00000015, output: 0.0000006 }, // $0.15/1M input, $0.6/1M output
      "gpt-4o": { input: 0.0000025, output: 0.00001 },
      "gpt-3.5-turbo": { input: 0.0000005, output: 0.0000015 },
    };

    const price = pricing[model] || pricing["gpt-4o-mini"];
    return inputTokens * price.input + outputTokens * price.output;
  }
}
