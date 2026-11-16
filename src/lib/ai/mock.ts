// ============================================================
// Mock Provider — Always works, no API credits, clearly labeled
// Workspace 2 Part 31 — MUST be implemented first
// ============================================================

import { AIProvider } from "./provider";
import { AIRequest, AIResponse, ModelInfo, ProviderName } from "./types";

export class MockProvider extends AIProvider {
  readonly name: ProviderName = "mock";
  readonly displayName = "Mock Provider";

  isConfigured(): boolean {
    return true; // Always configured
  }

  getModels(): ModelInfo[] {
    return [
      {
        provider: "mock",
        model_id: "mock-v1",
        display_name: "Mock Provider (Free, No Credits) — Clearly Labeled",
        capabilities: {
          text: true,
          vision: false,
          tools: false,
          reasoning: false,
          embeddings: true, // mock embeddings via hash
        },
        context_window: 4096,
        supports_vision: false,
        supports_tools: false,
        supports_reasoning: false,
        supports_embeddings: true,
        cost_class: "FREE",
        enabled: true,
        description: "Deterministic mock provider for testing without API credits. Responses are clearly labeled MOCK RESPONSE.",
      },
      {
        provider: "mock",
        model_id: "mock-vision",
        display_name: "Mock Vision (Free)",
        capabilities: {
          text: true,
          vision: true,
          tools: false,
          reasoning: false,
          embeddings: true,
        },
        context_window: 4096,
        supports_vision: true,
        supports_tools: false,
        supports_reasoning: false,
        supports_embeddings: true,
        cost_class: "FREE",
        enabled: true,
        description: "Mock vision provider for testing image analysis without credits.",
      },
    ];
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    const lastUserMessage = request.messages.filter((m) => m.role === "user").pop();
    const userContent = lastUserMessage?.content || "Hello";
    const teachingMode = request.teaching_mode || "default";
    const courseName = request.course_context?.course_name || "General";
    const hasRag = request.retrieved_chunks && request.retrieved_chunks.length > 0;

    // Generate deterministic mock response based on input
    let response = `[MOCK RESPONSE — No API credits used, for testing only]\n\n`;

    response += `You asked: "${userContent.slice(0, 200)}"\n\n`;

    if (request.course_context) {
      response += `**Course Context:** ${courseName}`;
      if (request.course_context.unit_title) {
        response += ` → ${request.course_context.unit_title}`;
      }
      response += `\n\n`;
    }

    if (teachingMode !== "default") {
      response += `**Teaching Mode:** ${teachingMode}\n\n`;
    }

    // Mock different teaching modes
    switch (teachingMode) {
      case "explain_simply":
        response += `**Simple Explanation (Feynman-style):**\nImagine ${courseName} is like building with LEGO blocks. ${userContent} is one of the blocks. Let me break it down simply:\n\n1. First, think of it as...\n2. Then, it connects to...\n3. Finally, you can use it to...\n\nDoes that make sense? Want an analogy?`;
        break;
      case "deep_dive":
        response += `**Deep Dive:**\nLet's derive ${userContent} from first principles:\n\n**Step 1: Fundamentals**\n- Definition: ...\n- Mathematical formulation: ...\n\n**Step 2: Derivation**\n- Starting from...\n- Applying...\n- We get...\n\n**Step 3: Advanced implications**\n- This connects to...\n- In research, ...\n\n**References:** For real deep dive, configure Gemini/OpenAI/Anthropic in Settings → AI Providers.`;
        break;
      case "example":
        response += `**Examples for: ${userContent}**\n\n**Example 1 (Beginner):**\n\`\`\`c\n// Simple example\nint main() { printf("Hello"); }\n\`\`\`\n\n**Example 2 (Intermediate):**\nMore complex...\n\n**Example 3 (Advanced):**\nReal-world...\n`;
        break;
      case "pyq_mode":
        response += `**PYQ Mode — Historical Relevance Analysis:**\n\nThis topic has:\n- HIGH HISTORICAL RELEVANCE: Asked 5 times in last 6 years (2019, 2020, 2021, 2023, 2024)\n- Common in CA1 and EndSem\n- Usually 8-10 marks\n- Question family: Similar to "Explain X with diagram" family\n\n**Important:** We use HIGH/MEDIUM/LOWER HISTORICAL RELEVANCE, not guarantee of future questions. Always prepare all topics.\n\n**Sample PYQ:** "Explain ${userContent} with neat diagram (8 marks)" — appeared 2023 EndSem.`;
        break;
      case "viva":
        response += `**Viva Mode — I am your examiner:**\n\nQuestion 1: Can you define ${userContent} in your own words?\n\n(Wait for your answer, then I'll ask follow-up)\n\nQuestion 2: What happens if...\n\nQuestion 3: How would you explain this to a junior?\n\nReady? Start with Q1.`;
        break;
      case "quiz":
        response += `**Quiz Me Mode:**\n\nQ1: What is ${userContent}?\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\n\nTake your best shot! I'll give you feedback.\n\n(Real quiz with evaluation comes after you configure real AI provider)`;
        break;
      default:
        response += `**Answer:**\nThis is a mock response for "${userContent}".\n\nIn a real implementation with Gemini/OpenAI/Anthropic, you would get:\n- Deep explanation tailored to ${courseName}\n- Citations from your uploaded documents\n- Code examples, diagrams description\n- Common mistakes, exam tips\n- Connections to other subjects\n\n**To get real AI:**\n1. Go to Settings → AI Providers\n2. Enter your API key (Gemini has free tier, OpenAI has low-cost gpt-4o-mini)\n3. Enable provider\n4. Select model in chat\n5. Ask again\n\n**RAG Status:** ${hasRag ? `Found ${request.retrieved_chunks!.length} relevant chunks — in real mode, these would be cited` : "No relevant documents found — upload notes/PDFs in Documents for RAG"}\n\n**Memory:** I remember you are studying ${courseName}. (Real memory will track weak concepts, preferences)`;
    }

    if (hasRag) {
      response += `\n\n**Citations (Mock):**\n`;
      request.retrieved_chunks!.slice(0, 2).forEach((chunk, idx) => {
        response += `[${idx + 1}] ${chunk.document_title} — Page ${chunk.page || "N/A"}, Section ${chunk.section || "N/A"}\nExcerpt: "${chunk.content.slice(0, 100)}..."\n\n`;
      });
    }

    response += `\n\n---\n*This is MOCK RESPONSE — clearly labeled, no credits used, for testing UI without API keys. Configure real provider in Settings → AI Providers for real answers.*`;

    return {
      content: response,
      citations: request.retrieved_chunks?.map((chunk) => ({
        source: chunk.document_title,
        document_id: chunk.document_id,
        document_title: chunk.document_title,
        page: chunk.page,
        section: chunk.section,
        excerpt: chunk.content.slice(0, 200),
        chunk_id: chunk.id,
      })),
      usage: {
        provider: "mock",
        model: "mock-v1",
        tokens_input: Math.floor(userContent.length / 4),
        tokens_output: Math.floor(response.length / 4),
        cost_estimate: 0,
      },
      model: "mock-v1",
      provider: "mock",
      finish_reason: "stop",
    };
  }

  async *streamChat(request: AIRequest): AsyncIterable<string> {
    const fullResponse = await this.chat(request);
    const content = fullResponse.content;

    // Simulate streaming by yielding chunks
    const chunkSize = 10 + Math.floor(Math.random() * 10);
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      yield chunk;
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 40));
    }
  }

  async embed(text: string): Promise<number[]> {
    // Deterministic mock embeddings via hash — for testing RAG without real embeddings
    // In production, swap for real embeddings + pgvector
    const hash = this.simpleHash(text);
    const embedding: number[] = [];
    for (let i = 0; i < 1536; i++) {
      // Generate deterministic pseudo-random numbers based on hash
      const val = Math.sin(hash + i) * 10000;
      embedding.push(val - Math.floor(val));
    }
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / norm);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async validateKey(): Promise<{ valid: boolean; error?: string }> {
    return { valid: true }; // Mock always valid
  }
}
