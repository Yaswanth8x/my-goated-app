// ============================================================
// Gemini Provider — Google Gemini
// Workspace 2 Part 28
// ============================================================

import { AIProvider } from "./provider";
import { AIRequest, AIResponse, ModelInfo, ProviderName } from "./types";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export class GeminiProvider extends AIProvider {
  readonly name: ProviderName = "gemini";
  readonly displayName = "Google Gemini";
  private genAI: GoogleGenerativeAI | null = null;
  private config: { apiKey: string; model: string };

  constructor(config: { apiKey: string; model?: string }) {
    super();
    this.config = {
      apiKey: config.apiKey,
      model: config.model || "gemini-1.5-flash",
    };

    if (this.config.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }

  getModels(): ModelInfo[] {
    return [
      {
        provider: "gemini",
        model_id: "gemini-1.5-flash",
        display_name: "Gemini 1.5 Flash (Free Tier, Fast, Vision)",
        capabilities: { text: true, vision: true, tools: true, reasoning: false, embeddings: false },
        context_window: 1000000,
        supports_vision: true,
        supports_tools: true,
        supports_reasoning: false,
        supports_embeddings: false,
        cost_class: "FREE",
        enabled: true,
        description: "Free tier available, 1M context, fast, vision. Best free option.",
      },
      {
        provider: "gemini",
        model_id: "gemini-1.5-pro",
        display_name: "Gemini 1.5 Pro (Free Tier, High Context)",
        capabilities: { text: true, vision: true, tools: true, reasoning: true, embeddings: false },
        context_window: 2000000,
        supports_vision: true,
        supports_tools: true,
        supports_reasoning: true,
        supports_embeddings: false,
        cost_class: "FREE",
        enabled: true,
        description: "2M context, more capable, free tier. Good for large docs.",
      },
      {
        provider: "gemini",
        model_id: "gemini-1.5-flash-8b",
        display_name: "Gemini 1.5 Flash 8B (Cheapest)",
        capabilities: { text: true, vision: false, tools: false, reasoning: false, embeddings: false },
        context_window: 1000000,
        supports_vision: false,
        supports_tools: false,
        supports_reasoning: false,
        supports_embeddings: false,
        cost_class: "FREE",
        enabled: true,
        description: "Cheapest, fastest, for simple tasks.",
      },
      {
        provider: "gemini",
        model_id: "text-embedding-004",
        display_name: "Text Embedding 004 (Embeddings)",
        capabilities: { text: false, vision: false, tools: false, reasoning: false, embeddings: true },
        context_window: 2048,
        supports_vision: false,
        supports_tools: false,
        supports_reasoning: false,
        supports_embeddings: true,
        cost_class: "FREE",
        enabled: true,
        description: "For RAG embeddings.",
      },
    ];
  }

  private getModel(modelId?: string): GenerativeModel {
    if (!this.genAI) {
      throw new Error("Gemini not configured — set GEMINI_API_KEY in .env or Settings → AI Providers");
    }
    return this.genAI.getGenerativeModel({ model: modelId || this.config.model });
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    try {
      const model = this.getModel(request.model_id);
      const messages = this.buildMessages(request);

      // Gemini uses different format — combine system + user messages
      // For simplicity, we join all as one prompt with roles
      const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
      const conversation = messages.filter((m) => m.role !== "system");

      // Build prompt with history
      let prompt = systemPrompt + "\n\n";
      for (const msg of conversation) {
        prompt += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
      }
      prompt += `ASSISTANT:`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const content = response.text();

      const aiResponse: AIResponse = {
        content,
        usage: {
          provider: "gemini",
          model: request.model_id || this.config.model,
          tokens_input: response.usageMetadata?.promptTokenCount,
          tokens_output: response.usageMetadata?.candidatesTokenCount,
          cost_estimate: 0, // Free tier
        },
        model: request.model_id || this.config.model,
        provider: "gemini",
        finish_reason: "stop",
      };

      this.logUsage(request, aiResponse);
      return aiResponse;
    } catch (error) {
      this.handleError(error, "Gemini chat");
    }
  }

  async *streamChat(request: AIRequest): AsyncIterable<string> {
    try {
      const model = this.getModel(request.model_id);
      const messages = this.buildMessages(request);

      const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
      const conversation = messages.filter((m) => m.role !== "system");

      let prompt = systemPrompt + "\n\n";
      for (const msg of conversation) {
        prompt += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
      }
      prompt += `ASSISTANT:`;

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      this.handleError(error, "Gemini streamChat");
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      const model = this.genAI?.getGenerativeModel({ model: "text-embedding-004" });
      if (!model) throw new Error("Gemini not configured");

      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      this.handleError(error, "Gemini embed");
    }
  }

  async validateKey(): Promise<{ valid: boolean; error?: string }> {
    if (!this.config.apiKey) {
      return { valid: false, error: "API key missing" };
    }

    try {
      const model = this.getModel();
      // Try a simple generation
      await model.generateContent("Hello");
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
