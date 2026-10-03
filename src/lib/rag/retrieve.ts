// ============================================================
// RAG — Retrieval (Similarity search + course filter)
// Workspace 2 Part 48
// ============================================================

import { cosineSimilarity, embedText, EmbedConfig } from "./embed";
import { logger } from "@/lib/logger";

export interface StoredChunk {
  id: string;
  document_id: string;
  document_title: string;
  content: string;
  embedding: number[];
  user_id: string;
  course_id?: string;
  unit_id?: string;
  page?: number;
  section?: string;
  created_at: string;
}

export interface RetrieveOptions {
  query: string;
  user_id: string;
  course_id?: string;
  unit_id?: string;
  topK?: number;
  threshold?: number; // minimum similarity score
  embedConfig: EmbedConfig;
}

// In-memory storage for mock mode
// In production, this would be Supabase with pgvector: SELECT * FROM document_chunks ORDER BY embedding <=> query_embedding LIMIT topK
let inMemoryChunks: StoredChunk[] = [];

export function addChunksToMemory(chunks: StoredChunk[]): void {
  inMemoryChunks.push(...chunks);
  logger.info(`Added ${chunks.length} chunks to memory, total ${inMemoryChunks.length}`);

  // Keep only last 1000 to avoid memory leak in mock mode
  if (inMemoryChunks.length > 1000) {
    inMemoryChunks = inMemoryChunks.slice(-1000);
  }
}

export function clearMemory(): void {
  inMemoryChunks = [];
}

export function getMemoryChunks(): StoredChunk[] {
  return [...inMemoryChunks];
}

export async function retrieveRelevantChunks(options: RetrieveOptions): Promise<
  (StoredChunk & { score: number })[]
> {
  const { query, user_id, course_id, unit_id, topK = 5, threshold = 0.1, embedConfig } = options;

  // Embed query
  const queryEmbedding = await embedText(query, embedConfig);

  // Filter by user_id and optionally course_id, unit_id
  let candidates = inMemoryChunks.filter((chunk) => {
    if (chunk.user_id !== user_id) return false;
    if (course_id && chunk.course_id && chunk.course_id !== course_id) return false;
    if (unit_id && chunk.unit_id && chunk.unit_id !== unit_id) return false;
    return true;
  });

  // If no candidates after filtering, try without course filter (maybe general docs)
  if (candidates.length === 0 && course_id) {
    candidates = inMemoryChunks.filter((chunk) => chunk.user_id === user_id);
  }

  // Calculate similarity
  const scored = candidates.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Filter by threshold and sort by score descending
  const filtered = scored
    .filter((c) => c.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  logger.info(`Retrieved ${filtered.length} chunks for query "${query.slice(0, 50)}"`, {
    user_id,
    course_id,
    topK,
    threshold,
    totalCandidates: candidates.length,
  });

  return filtered;
}

// For Supabase pgvector, the SQL would be:
// SELECT *, (embedding <=> query_embedding) as distance, 1 - (embedding <=> query_embedding) as score
// FROM document_chunks
// WHERE user_id = $1 AND (course_id = $2 OR $2 IS NULL)
// ORDER BY embedding <=> query_embedding
// LIMIT $3

// Rerank (optional, simple for now)
export function rerankChunks(
  chunks: (StoredChunk & { score: number })[],
  query: string
): (StoredChunk & { score: number })[] {
  // Simple rerank: boost if query terms appear in content
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  return chunks
    .map((chunk) => {
      const contentLower = chunk.content.toLowerCase();
      let boost = 0;
      for (const term of queryTerms) {
        if (contentLower.includes(term)) {
          boost += 0.05;
        }
      }
      return { ...chunk, score: Math.min(1, chunk.score + boost) };
    })
    .sort((a, b) => b.score - a.score);
}
