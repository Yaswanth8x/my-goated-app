// ============================================================
// RAG — Embeddings (Mock first, then real)
// Workspace 2 Part 48
// ============================================================

import { MockProvider } from "@/lib/ai/mock";
import { OpenAIProvider } from "@/lib/ai/openai";
import { GeminiProvider } from "@/lib/ai/gemini";
import { ProviderName } from "@/lib/ai/types";
import { logger } from "@/lib/logger";

export interface EmbedConfig {
  provider: ProviderName;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

// Deterministic mock embeddings (same as in MockProvider, extracted for reuse)
export function mockEmbed(text: string): number[] {
  const mock = new MockProvider();
  // Use the same hash logic
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  hash = Math.abs(hash);

  const embedding: number[] = [];
  for (let i = 0; i < 1536; i++) {
    const val = Math.sin(hash + i) * 10000;
    embedding.push(val - Math.floor(val));
  }
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / norm);
}

export async function embedText(text: string, config: EmbedConfig): Promise<number[]> {
  try {
    switch (config.provider) {
      case "openai":
        if (!config.apiKey) throw new Error("OpenAI API key missing for embeddings");
        const openai = new OpenAIProvider({ apiKey: config.apiKey, baseUrl: config.baseUrl, model: config.model });
        return await openai.embed!(text);

      case "gemini":
        if (!config.apiKey) throw new Error("Gemini API key missing for embeddings");
        const gemini = new GeminiProvider({ apiKey: config.apiKey, model: config.model });
        return await gemini.embed!(text);

      case "mock":
      default:
        // Mock embeddings — deterministic hash vectors
        logger.info(`Using mock embeddings for text length ${text.length}`);
        return mockEmbed(text);
    }
  } catch (error) {
    logger.warn(`Embedding failed with ${config.provider}, falling back to mock`, { error: String(error) });
    return mockEmbed(text);
  }
}

// Cosine similarity
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding dimensions mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

// Batch embed
export async function embedBatch(texts: string[], config: EmbedConfig): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const emb = await embedText(text, config);
    embeddings.push(emb);
  }

  return embeddings;
}
