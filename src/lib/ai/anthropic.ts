// ============================================================
// Anthropic Provider — Claude
// Workspace 2 Part 30
// ============================================================

import { AIProvider } from "./provider";
import { AIRequest, AIResponse, ModelInfo, ProviderName } from "./types";
import Anthropic from "@anthropic-ai/sdk";

export class AnthropicProvider extends AIProvider {
  readonly name: ProviderName = "anthropic";
  readonly displayName = "Anthropic Claude";
  private client: Anthropic | null = null;
  private config: { apiKey: string; model: string };

  constructor(config: { apiKey: string; model?: string }) {
    super();
    this.config = {
      apiKey: config.apiKey,
      model: config.model || "claude-3-5-sonnet-20241022",
    };

    if (this.config.apiKey) {
      this.client = new Anthropic({
        apiKey: this.config.apiKey,
      });
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }

  getModels(): ModelInfo[] {
    return [
      {
        provider: "anthropic",
        model_id: "claude-3-5-sonnet-20241022",
        display_name: "Claude 3.5 Sonnet (Premium, Best Reasoning)",
        capabilities: { text: true, vision: true, tools: true, reasoning: true, embeddings: false },
        context_window: 200000,
        supports_vision: true,
        supports_tools: true,
        supports_reasoning: true,
        supports_embeddings: false,
        cost_class: "PREMIUM",
        enabled: true,
        description: "Best reasoning, coding, vision. Higher cost but top quality.",
      },
      {
        provider: "anthropic",
        model_id: "claude-3-5-haiku-20241022",
        display_name: "Claude 3.5 Haiku (Fast, Low Cost)",
        capabilities: { text: true, vision: true, tools: true, reasoning: false, embeddings: false },
        context_window: 200000,
        supports_vision: true,
        supports_tools: true,
        supports_reasoning: false,
        supports_embeddings: false,
        cost_class: "LOW_COST",
        enabled: true,
        description: "Fast, affordable, good for most tasks.",
      },
      {
        provider: "anthropic",
        model_id: "claude-3-opus-20240229",
        display_name: "Claude 3 Opus (Legacy Premium)",
        capabilities: { text: true, vision: true, tools: true, reasoning: true, embeddings: false },
        context_window: 200000,
        supports_vision: true,
        supports_tools: true,
        supports_reasoning: true,
        supports_embeddings: false,
        cost_class: "PREMIUM",
        enabled: false,
        description: "Legacy, powerful but expensive. Use 3.5 Sonnet instead.",
      },
    ];
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    if (!this.client) {
      throw new Error("Anthropic not configured — set ANTHROPIC_API_KEY in .env or Settings → AI Providers");
    }

    try {
      const messages = this.buildMessages(request);
      const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
      const conversation = messages.filter((m) => m.role !== "system").map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const model = request.model_id || this.config.model;

      const response = await this.client.messages.create({
        model,
        max_tokens: request.max_tokens ?? 2000,
        temperature: request.temperature ?? 0.7,
        system: systemPrompt,
        messages: conversation,
      });

      const content = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as any).text)
        .join("");

      const aiResponse: AIResponse = {
        content,
        usage: {
          provider: "anthropic",
          model,
          tokens_input: response.usage.input_tokens,
          tokens_output: response.usage.output_tokens,
          cost_estimate: this.estimateCost(model, response.usage.input_tokens, response.usage.output_tokens),
        },
        model,
        provider: "anthropic",
        finish_reason: response.stop_reason === "end_turn" ? "stop" : "length",
      };

      this.logUsage(request, aiResponse);
      return aiResponse;
    } catch (error) {
      this.handleError(error, "Anthropic chat");
    }
  }

  async *streamChat(request: AIRequest): AsyncIterable<string> {
    if (!this.client) {
      throw new Error("Anthropic not configured");
    }

    try {
      const messages = this.buildMessages(request);
      const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
      const conversation = messages.filter((m) => m.role !== "system").map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const model = request.model_id || this.config.model;

      const stream = await this.client.messages.stream({
        model,
        max_tokens: request.max_tokens ?? 2000,
        temperature: request.temperature ?? 0.7,
        system: systemPrompt,
        messages: conversation,
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }
    } catch (error) {
      this.handleError(error, "Anthropic streamChat");
    }
  }

  async validateKey(): Promise<{ valid: boolean; error?: string }> {
    if (!this.config.apiKey) {
      return { valid: false, error: "API key missing" };
    }

    try {
      if (!this.client) return { valid: false, error: "Client not initialized" };
      // Try to list models or simple call — Anthropic doesn't have list, so try small message
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [{ role: "user", content: "Hello" }],
      });
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      "claude-3-5-sonnet-20241022": { input: 0.000003, output: 0.000015 },
      "claude-3-5-haiku-20241022": { input: 0.0000008, output: 0.000004 },
      "claude-3-opus-20240229": { input: 0.000015, output: 0.000075 },
    };

    const price = pricing[model] || pricing["claude-3-5-sonnet-20241022"];
    return inputTokens * price.input + outputTokens * price.output;
  }
}
