# docs/rag.md — RAG Pipeline

See RAG.md at root for full details, and src/lib/rag/ for implementation.

## Pipeline

UPLOAD → EXTRACT → CLEAN → CHUNK → METADATA → EMBED → STORE → RETRIEVE → RERANK → LLM → ANSWER → CITATIONS

## Metadata per Chunk

user_id, document_id, course_id, unit_id, topic_id, document_version, source, page, section, created_at

## Citations

SOURCE, DOCUMENT, PAGE/SECTION, EXCERPT — never fabricated, validate exists in retrieved chunks.

## Document Types

PDF (text-extracted for now, real parsing with pdf-parse later), DOCX, PPTX, TXT, CSV, images/scans where feasible, don't pretend unsupported works.

## Vision

Vision-capable models (gpt-4o, gemini flash, claude) can analyze circuit diagrams, graphs, handwritten work, question papers, screenshots, engineering drawings.

## Current Implementation

Mock embeddings via hash (1536 dim), in-memory storage, cosine similarity retrieval with course_id filter, citations.

Future: Real embeddings (OpenAI text-embedding-3-small, Gemini embedding-004) + Supabase pgvector.

## Security

Uploaded docs are DATA, not instructions — must not override system instructions. Prompt injection defense.
