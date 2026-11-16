/**
 * RAG pipeline tests — chunking, embeddings, retrieval isolation, citations.
 * The security test here is the important one: user A must never retrieve user B's chunks.
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { chunkText } from "@/lib/rag/chunk";
import { mockEmbed, cosineSimilarity, embedText, embedBatch } from "@/lib/rag/embed";
import {
  addChunksToMemory,
  clearMemory,
  retrieveRelevantChunks,
  rerankChunks,
  getMemoryChunks,
  StoredChunk,
} from "@/lib/rag/retrieve";
import { buildCitationsFromChunks, validateCitations, formatCitationsForPrompt } from "@/lib/rag/citations";

const base = {
  user_id: "user-a",
  document_id: "doc-1",
  course_id: "EC3351",
  source: "unit1.pdf",
};

function storedChunk(over: Partial<StoredChunk> = {}): StoredChunk {
  return {
    id: "c1",
    document_id: "doc-1",
    document_title: "Unit 1 Notes",
    content: "A PN junction diode conducts when forward biased.",
    embedding: mockEmbed("A PN junction diode conducts when forward biased."),
    user_id: "user-a",
    course_id: "EC3351",
    created_at: new Date().toISOString(),
    ...over,
  };
}

// ---------- Chunking ----------

test("chunkText attaches all required RAG metadata", () => {
  const chunks = chunkText("First paragraph about diodes.\n\nSecond paragraph about transistors.", base);
  assert.ok(chunks.length >= 1);
  for (const c of chunks) {
    assert.equal(c.metadata.user_id, "user-a");
    assert.equal(c.metadata.document_id, "doc-1");
    assert.equal(c.metadata.course_id, "EC3351");
    assert.equal(c.metadata.source, "unit1.pdf");
    assert.ok(c.metadata.created_at);
    assert.ok(typeof c.metadata.page === "number");
  }
});

test("chunkText respects the requested chunk size", () => {
  const text = Array.from({ length: 20 }, (_, i) => `Paragraph ${i} ` + "x".repeat(250)).join("\n\n");
  const chunks = chunkText(text, { ...base, chunkSize: 500 });
  // Allow a little slack for overlap text and unsplittable paragraphs.
  for (const c of chunks) {
    assert.ok(c.content.length <= 700, `chunk too large: ${c.content.length}`);
  }
});

test("chunkText returns no chunks for empty input", () => {
  assert.deepEqual(chunkText("", base), []);
  assert.deepEqual(chunkText("   \n\n  ", base), []);
});

test("chunk indexes are unique and sequential", () => {
  const text = Array.from({ length: 10 }, (_, i) => `Sentence block ${i}. ` + "y".repeat(400)).join("\n\n");
  const chunks = chunkText(text, { ...base, chunkSize: 600 });
  const indexes = chunks.map((c) => c.chunk_index);
  assert.deepEqual(indexes, [...Array(chunks.length).keys()]);
});

// ---------- Embeddings ----------

test("mock embeddings are deterministic", () => {
  assert.deepEqual(mockEmbed("hello world"), mockEmbed("hello world"));
});

test("mock embeddings are unit-normalised", () => {
  const v = mockEmbed("ECE syllabus");
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  assert.ok(Math.abs(norm - 1) < 1e-9, `norm was ${norm}`);
});

test("different text produces different embeddings", () => {
  assert.notDeepEqual(mockEmbed("diodes"), mockEmbed("antennas"));
});

test("cosine similarity: identical is 1, mismatched length throws", () => {
  const v = mockEmbed("same text");
  assert.ok(Math.abs(cosineSimilarity(v, v) - 1) < 1e-9);
  assert.throws(() => cosineSimilarity([1, 2], [1, 2, 3]), /dimensions mismatch/i);
});

test("embedText falls back to mock when a provider key is missing", async () => {
  const v = await embedText("no key here", { provider: "openai" });
  assert.equal(v.length, 1536);
});

test("embedBatch preserves input order", async () => {
  const out = await embedBatch(["a", "b"], { provider: "mock" });
  assert.equal(out.length, 2);
  assert.deepEqual(out[0], mockEmbed("a"));
});

// ---------- Retrieval ----------

beforeEach(() => clearMemory());

test("retrieval never returns another user's chunks", async () => {
  addChunksToMemory([
    storedChunk({ id: "a1", user_id: "user-a", content: "diode forward bias", embedding: mockEmbed("diode forward bias") }),
    storedChunk({ id: "b1", user_id: "user-b", content: "diode forward bias", embedding: mockEmbed("diode forward bias") }),
  ]);

  const results = await retrieveRelevantChunks({
    query: "diode forward bias",
    user_id: "user-a",
    embedConfig: { provider: "mock" },
  });

  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.user_id === "user-a"));
});

test("retrieval filters by course when candidates exist", async () => {
  addChunksToMemory([
    storedChunk({ id: "c1", course_id: "EC3351", embedding: mockEmbed("diode") }),
    storedChunk({ id: "c2", course_id: "EC3401", content: "diode", embedding: mockEmbed("diode") }),
  ]);

  const results = await retrieveRelevantChunks({
    query: "diode",
    user_id: "user-a",
    course_id: "EC3351",
    embedConfig: { provider: "mock" },
  });

  assert.ok(results.every((r) => r.course_id === "EC3351"));
});

test("retrieval honours topK", async () => {
  addChunksToMemory(
    Array.from({ length: 8 }, (_, i) =>
      storedChunk({ id: `c${i}`, content: `diode fact ${i}`, embedding: mockEmbed(`diode fact ${i}`) })
    )
  );
  const results = await retrieveRelevantChunks({
    query: "diode fact",
    user_id: "user-a",
    topK: 3,
    embedConfig: { provider: "mock" },
    threshold: 0,
  });
  assert.equal(results.length, 3);
});

test("retrieval on an empty store returns an empty list", async () => {
  const results = await retrieveRelevantChunks({
    query: "anything",
    user_id: "user-a",
    embedConfig: { provider: "mock" },
  });
  assert.deepEqual(results, []);
});

test("memory is capped so it cannot grow without bound", () => {
  addChunksToMemory(Array.from({ length: 1100 }, (_, i) => storedChunk({ id: `x${i}` })));
  assert.ok(getMemoryChunks().length <= 1000);
});

test("rerank boosts chunks that contain query terms", () => {
  const ranked = rerankChunks(
    [
      { ...storedChunk({ id: "1" }), score: 0.5, content: "unrelated content" },
      { ...storedChunk({ id: "2" }), score: 0.5, content: "the diode equation is important" },
    ],
    "diode equation"
  );
  assert.equal(ranked[0].id, "2");
});

// ---------- Citations ----------

test("citations are built only from retrieved chunks", () => {
  const chunks = [{ ...storedChunk({ id: "c1" }), score: 0.9 }];
  const citations = buildCitationsFromChunks(chunks);
  assert.equal(citations.length, 1);
  assert.equal(citations[0].chunk_id, "c1");
  assert.equal(citations[0].source, "Unit 1 Notes");
});

test("fabricated citations are detected", () => {
  const citations = buildCitationsFromChunks([{ ...storedChunk({ id: "c1" }), score: 0.9 }]);
  assert.equal(validateCitations(citations, ["c1"]).valid, true);

  const fabricated = [...citations, { source: "Made Up", chunk_id: "ghost" }];
  const result = validateCitations(fabricated, ["c1"]);
  assert.equal(result.valid, false);
  assert.equal(result.invalid.length, 1);
});

test("no citations means no prompt injection text", () => {
  assert.equal(formatCitationsForPrompt([]), "");
  assert.match(formatCitationsForPrompt(buildCitationsFromChunks([{ ...storedChunk(), score: 0.9 }])), /SOURCE:/);
});
