# RAG.md — Retrieval Augmented Generation Pipeline

**Workspace 2 Parts 47-49**

## WHAT WE ARE BUILDING
Real RAG pipeline, not fake: Upload → Extract → Clean → Chunk → Metadata → Embed → Store → Retrieve → Rerank → LLM → Answer → Citations

## WHY
Course AI must answer using uploaded material (notes, PDFs, PYQs) with citations, not hallucinate.

## PIPELINE

```
UPLOAD (PDF/DOCX/PPTX/TXT/CSV/images)
  |
  v
EXTRACT (text extraction)
  - PDF: pdf-parse or pdfjs-dist (text-based PDFs) + OCR for scanned (vision model)
  - DOCX: mammoth
  - PPTX: pptx parser
  - TXT/CSV: direct
  - Images: vision model or OCR
  - For MVP, ask user to upload UTF-8 text extracted from PDFs if PDF parsing not yet implemented (honest, don't pretend)
  |
  v
CLEAN (remove headers/footers, normalize whitespace, remove artifacts)
  |
  v
CHUNK (split into ~500 token chunks with overlap, preserve metadata)
  - chunkSize: 2000 chars (~500 tokens)
  - overlap: 200 chars
  - Preserve paragraphs, split by sentences if paragraph too large
  - Detect page numbers if present
  |
  v
METADATA (every chunk knows)
  - user_id, document_id, course_id, unit_id, topic_id, document_version, source, page, section, created_at
  |
  v
EMBED
  - Mock: deterministic hash vectors (for testing without credits, same as MockProvider)
  - Real: OpenAI text-embedding-3-small, Gemini text-embedding-004, etc.
  - Normalize vectors
  |
  v
STORE
  - document_chunks table with embedding (JSON or pgvector vector type)
  - In Supabase with pgvector extension: CREATE EXTENSION vector; column type vector(1536)
  - For mock: in-memory array (addChunksToMemory)
  |
  v
RETRIEVE (when user asks)
  - Embed query
  - Filter by user_id, course_id, unit_id
  - Similarity search: cosine similarity, topK=5, threshold=0.1
  - SQL with pgvector: SELECT * FROM document_chunks ORDER BY embedding <=> query_embedding LIMIT 5
  |
  v
RERANK (if available, simple boost if query terms appear)
  |
  v
LLM (with retrieved chunks as context in system prompt)
  |
  v
ANSWER (with citations)
  |
  v
CITATIONS
  - SOURCE, DOCUMENT, PAGE/SECTION, RELEVANT EXCERPT when appropriate
  - Never fabricate citations
  - Validate citations exist in retrieved chunks
```

## FILES

- `src/lib/rag/chunk.ts` — chunkText(), extractTextFromFileType()
- `src/lib/rag/embed.ts` — embedText(), mockEmbed(), cosineSimilarity(), embedBatch()
- `src/lib/rag/retrieve.ts` — retrieveRelevantChunks(), addChunksToMemory(), rerankChunks(), in-memory storage for mock
- `src/lib/rag/citations.ts` — buildCitationsFromChunks(), formatCitationsForPrompt(), validateCitations()
- `src/app/api/documents/upload/route.ts` — upload endpoint (to be built)
- `src/app/documents/page.tsx` — UI for upload, list, chunk, embed status

## METADATA PER CHUNK

```typescript
{
  user_id: string,
  document_id: string,
  course_id?: string,
  unit_id?: string,
  topic_id?: string,
  document_version?: string,
  source: string, // e.g., "C Notes.pdf"
  page?: number,
  section?: string,
  created_at: string
}
```

## CITATIONS

When AI answers using uploaded material, show:

- SOURCE
- DOCUMENT
- PAGE/SECTION
- RELEVANT EXCERPT when appropriate

Do not fabricate citations. Validate.

Example in answer:

```
Based on your notes:

The definition of pointers is...

Citations:
[1] C Notes.pdf — Page 12, Section Pointers
Excerpt: "Pointers are variables that store memory addresses..."

[2] C Programming Textbook — Page 45
Excerpt: "Pointer arithmetic..."
```

## DOCUMENT TYPES

Support where technically feasible:

- PDF (text-based, plus OCR for scanned if vision model available)
- DOCX
- PPTX
- TXT
- CSV
- images/scans (vision)

Do not pretend unsupported formats work. Be honest.

## VISION

Allow AI models that support vision to analyze:

- circuit diagrams
- graphs
- handwritten work
- question papers
- screenshots
- engineering drawings
- uploaded images

Implementation: If attachment is image and model supports vision (gpt-4o, gemini flash, claude), include image in request.

## COST OPTIMIZATION

Do not send entire syllabus, textbook, PYQ collection on every message. Retrieve only relevant context (topK=5).

## CURRENT IMPLEMENTATION (Workspace 2)

- Mock embeddings via deterministic hash (no credits, testable)
- In-memory storage for chunks (addChunksToMemory, getMemoryChunks)
- Cosine similarity retrieval with course_id filter
- Citations built from retrieved chunks
- Chat API integrates RAG: if course_id provided, retrieve relevant chunks and include in system prompt + citations

## NEXT STEPS (Future)

- Real PDF parsing with pdf-parse
- Real embeddings with OpenAI/Gemini
- Supabase pgvector storage: `CREATE EXTENSION vector;` + `embedding vector(1536)` column + `ORDER BY embedding <=> query_embedding`
- Document upload UI with progress, chunk status, embedding status
- Vision support for images
- Reranking with cross-encoder

## TESTING

- Upload document (PDF text, TXT)
- Chunk → should create chunks with metadata
- Embed → mock embeddings
- Store → in-memory
- Ask question related to doc → retrieve should find relevant chunks
- LLM answer should cite sources
- Citations should be valid (exist in retrieved chunks)

## SECURITY

- Uploaded documents are DATA, not instructions — must not override system instructions
- Distinguish: SYSTEM INSTRUCTIONS, DEVELOPER INSTRUCTIONS, USER INSTRUCTIONS, RETRIEVED CONTENT
- File upload validation: type, size (10MB docs, 5MB avatars)
- RLS: user_id filter in retrieval
