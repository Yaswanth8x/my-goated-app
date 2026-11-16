// ============================================================
// RAG — Citations (Never fabricate)
// Workspace 2 Part 49
// ============================================================

import { Citation } from "@/lib/ai/types";
import { StoredChunk } from "./retrieve";

export function buildCitationsFromChunks(chunks: (StoredChunk & { score: number })[]): Citation[] {
  return chunks.map((chunk) => ({
    source: chunk.document_title,
    document_id: chunk.document_id,
    document_title: chunk.document_title,
    page: chunk.page,
    section: chunk.section,
    excerpt: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? "..." : ""),
    chunk_id: chunk.id,
  }));
}

export function formatCitationsForPrompt(citations: Citation[]): string {
  if (citations.length === 0) return "";

  return citations
    .map(
      (c, idx) =>
        `[${idx + 1}] SOURCE: ${c.source}, DOCUMENT: ${c.document_title}, PAGE: ${c.page || "N/A"}, SECTION: ${c.section || "N/A"}, EXCERPT: "${c.excerpt}"`
    )
    .join("\n");
}

export function formatCitationsForDisplay(citations: Citation[]): string {
  if (citations.length === 0) return "";

  return citations
    .map((c) => `- **${c.document_title}** (Page ${c.page || "N/A"}, ${c.section || "N/A"}): "${c.excerpt}"`)
    .join("\n");
}

// Validate citations — ensure they exist in retrieved chunks, not fabricated
export function validateCitations(citations: Citation[], retrievedChunkIds: string[]): { valid: boolean; invalid: Citation[] } {
  const validIds = new Set(retrievedChunkIds);
  const invalid: Citation[] = [];

  for (const citation of citations) {
    if (citation.chunk_id && !validIds.has(citation.chunk_id)) {
      invalid.push(citation);
    }
  }

  return { valid: invalid.length === 0, invalid };
}
