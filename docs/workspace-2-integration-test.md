# Workspace 2 Integration Test — Part 50

**Date:** 2026-09-26
**Goal:** Verify all 25 parts of Workspace 2 work together — Real AI chat with streaming, course context, RAG, citations, persistence.

## Test Checklist

### Part 26: AI Architecture
- [x] `AI.md` exists with provider abstraction, model registry, router, fallback, cost control, chat UI, RAG, safety

### Part 27: Provider Interface
- [x] `src/lib/ai/types.ts` — ChatMessage, Citation, CourseContext, AIRequest, AIResponse, ModelInfo, RouterInput/Output, etc.
- [x] `src/lib/ai/provider.ts` — Abstract AIProvider with chat(), streamChat(), embed(), buildSystemPrompt(), buildMessages()

### Part 28: Gemini Adapter
- [x] `src/lib/ai/gemini.ts` — GoogleGenerativeAI, getModels(), chat(), streamChat(), embed(), validateKey()

### Part 29: OpenAI Adapter
- [x] `src/lib/ai/openai.ts` — OpenAI SDK, OpenAI-compatible (OpenRouter), chat, streamChat, embed, cost estimation

### Part 30: Anthropic Adapter
- [x] `src/lib/ai/anthropic.ts` — Anthropic SDK, Claude 3.5 Sonnet/Haiku, chat, streamChat, validateKey

### Part 31: Mock Adapter
- [x] `src/lib/ai/mock.ts` — Always works, no credits, clearly labeled MOCK RESPONSE, deterministic, mock embeddings via hash, teaching modes (explain_simply, deep_dive, example, pyq_mode, viva, quiz)

### Part 32: Model Registry
- [x] `src/lib/ai/models.ts` — modelRegistry with 14 models (mock, gemini 1.5 flash/pro/8b, openai gpt-4o-mini/gpt-4o, anthropic claude 3.5 sonnet/haiku, openrouter, embeddings), getModelById(), getModelsByProvider(), getFreeModels(), getVisionModels(), sortByCost()

### Part 33: Provider Settings UI
- [x] `src/app/settings/ai-providers/page.tsx` — Shows all providers with cost, enable toggle, API key input (masked), model selector, links to get keys, how to configure via .env, model registry list, usage & cost control, router & fallback explanation

### Part 34: Secure API Key Handling
- [x] `src/lib/ai/keys.ts` — Server-only, encryptApiKey() AES-256-CBC with ENCRYPTION_KEY, decryptApiKey(), validateApiKeyFormat(), getProviderConfigsForUser() (env fallback, TODO Supabase), maskApiKey(), never expose to client

### Part 35: AI Router
- [x] `src/lib/ai/router.ts` — AIRouter.route() selects provider/model based on task, teaching_mode, has_attachments, has_large_context, available_providers, user_preferences (budget, prefer_free), needsVision, needsLargeContext, needsReasoning, needsCoding, isSimple

### Part 36: Fallback System
- [x] `src/lib/ai/fallback.ts` — FallbackSystem.chatWithFallback() and streamChatWithFallback(), ordered configs (preferred first, mock last), tries chain Gemini→OpenAI→Anthropic→Mock, structured error WHAT/WHY/WHAT_TO_DO, getProviderConfigsFromEnv()

### Part 37: AI Usage Tracking
- [x] `src/lib/ai/usage.ts` — UsageTracker.track(), getUsageForUser(), getTotalCost(), getUsageByProvider(), in-memory storage for mock, TODO Supabase, estimateCost()

### Part 38: Cost Control
- [x] `src/lib/ai/usage.ts` — checkBudget() with monthly_budget, warning_threshold, hard_stop
- [x] `src/app/api/ai/usage/route.ts` — GET usage, total cost, by provider, budget
- [x] Settings page shows usage dashboard

### Part 39: Chat UI
- [x] `src/components/ai/ChatArea.tsx` — Messages, streaming indicator, citations, copy, retry, feedback
- [x] `src/components/ai/MessageComposer.tsx` — Textarea auto-resize, Shift+Enter, Send/Stop, attachments placeholder, disclaimer
- [x] `src/components/ai/ModelSelector.tsx` — Filter all/free/low_cost/premium, AUTO router option, cost badges, context window
- [x] `src/components/ai/TeachingModeButtons.tsx` — 15 modes (Explain, Simply, Deep dive, Visualize, Example, Analogy, Derive, Solve, Hint, Quiz, Viva, PYQ, Exam, Mistakes, Connect, Real-world), active indicator
- [x] `src/components/ai/CitationCard.tsx` — Shows SOURCE, DOCUMENT, PAGE/SECTION, EXCERPT, never fabricated
- [x] `src/app/ai-hub/page.tsx` — Full layout: Left sidebar (conversations, course & expert selector), Center (chat header, settings, chat area, composer), Right context panel (current course, expert, model, RAG, how to test)

### Part 40: Streaming
- [x] `src/app/api/chat/route.ts` — POST with streaming ReadableStream, text/event-stream, metadata (provider, model, citations, budget_warning), content chunks, done with usage, error handling
- [x] Chat UI streams via fetch + reader.read() + decoder, abort controller for stop generation

### Part 41: Course AI Selector
- [x] Course selector in AI Hub left sidebar (CS3353, EC3352, etc.)
- [x] When course selected, passed as course_id to /api/chat, used for RAG filter and context

### Part 42: Course-Specific Context
- [x] AIRequest includes course_context (course_id, course_name, unit, topics, COs, mastery)
- [x] buildSystemPrompt() includes CURRENT COURSE CONTEXT
- [x] RAG retrieval filtered by course_id
- [x] Right panel shows current context

### Part 43: Academic Professor Persona
- [x] `src/lib/ai/personas/academic.ts` — academicPersona with deep explainer, Socratic, exam analyst, problem solver, visual, viva examiner, mentor, Feynman clarity, safety (no hallucination, HIGH/MEDIUM/LOWER relevance), course-specific personas (C, Digital, Math), getAcademicPersona()
- [x] `src/lib/ai/personas/orchestrator.ts` — globalOrchestratorPersona (coordination, not teaching, answers "What should I do next?" with prioritization, academic protection, anti-overload), expertBasePersona, expertPersonas (web, photography, AI automation), getExpertPersona()

### Part 44: Teaching Modes
- [x] TeachingMode type with 15 modes + default
- [x] TeachingModeButtons UI
- [x] buildSystemPrompt() includes mode-specific instructions
- [x] Mock provider has different responses per mode (simply, deep_dive, example, pyq_mode, viva, quiz)

### Part 45: Conversation Persistence
- [x] `src/lib/ai/conversations.ts` — Conversation interface, getConversations(), getConversation(), createConversation(), updateConversation(), addMessageToConversation(), deleteConversation(), localStorage + in-memory for mock, TODO Supabase
- [x] AI Hub uses it: load conversations, select, create new, delete, auto-title from first message, messages persist, reload page recovers from localStorage

### Part 46: Memory
- [x] `src/lib/ai/memory.ts` — Memory interface, getMemories(), addMemory(), extractMemoriesFromMessage() (detects struggles, prefers_visual, prefers_simple, completed), clearMemories(), structured useful info not full history, per course/expert/global, localStorage + TODO Supabase

### Part 47: Document Ingestion
- [x] `src/lib/rag/chunk.ts` — chunkText() with chunkSize 2000, overlap 200, preserve paragraphs, split by sentences if too large, detect page numbers, metadata (user_id, document_id, course_id, unit_id, topic_id, source, page, section, created_at), extractTextFromFileType()
- [x] `src/app/api/documents/upload/route.ts` — POST FormData file, course_id, unit_id, title, validate size 10MB, extract text (TXT, CSV, PDF text-extracted for now), chunk, embed, store in memory, return document metadata + preview chunks

### Part 48: Embeddings/RAG
- [x] `src/lib/rag/embed.ts` — mockEmbed() deterministic hash 1536 dim, embedText() with provider fallback to mock, cosineSimilarity(), embedBatch()
- [x] `src/lib/rag/retrieve.ts` — StoredChunk, RetrieveOptions, in-memory storage, addChunksToMemory(), retrieveRelevantChunks() with user_id + course_id filter, cosine similarity, topK, threshold, rerankChunks() boost if query terms appear
- [x] Chat API integrates RAG: if course_id, retrieve relevant chunks, build citations, include in system prompt
- [x] Documents page shows stored chunks

### Part 49: Citations
- [x] `src/lib/rag/citations.ts` — buildCitationsFromChunks(), formatCitationsForPrompt(), formatCitationsForDisplay(), validateCitations()
- [x] `src/components/ai/CitationCard.tsx` — Shows SOURCE, DOCUMENT, PAGE/SECTION, EXCERPT
- [x] Chat API returns citations in metadata and done events
- [x] Mock provider includes citations in response

### Part 50: Complete AI Integration Test

## How to Run Integration Test

### 1. Build Test
```bash
npm run build
```
Expected: ✓ Compiled successfully, 21 routes (added /api/ai/models, /api/ai/usage, /api/chat, /api/documents/upload, /settings/ai-providers)

### 2. Fresh Install + Mock Mode Test (No API Keys)
```bash
npm install
cp .env.example .env
# Leave Supabase and AI keys empty — mock mode
npm run dev
# Open http://localhost:3000/ai-hub
```

**Test Steps:**
1. Click "New" conversation
2. Select Course: CS3353 - C Programming
3. Select Model: Mock Provider (or AUTO)
4. Select Teaching Mode: Explain simply
5. Send: "Explain pointers in C simply"
6. Should see streaming response with [MOCK RESPONSE] label, course context, teaching mode
7. Check right panel: Current Context shows CS3353, citations if docs uploaded
8. Send follow-up: "Give me an example"
9. Should continue conversation, remember course context
10. Reload page — conversation should persist (localStorage)
11. Click conversation in left sidebar — should recover messages

**Expected:**
- Streaming works (content appears chunk by chunk)
- Response clearly labeled MOCK RESPONSE
- Course context included
- Teaching mode changes response style
- Conversation persists after reload
- No API credits used

### 3. Real Provider Test (With API Key)

```bash
# In .env, set:
GEMINI_API_KEY="your-gemini-key"  # Free tier from aistudio.google.com/app/apikey
# or
OPENAI_API_KEY="your-openai-key"

npm run dev
# Open http://localhost:3000/ai-hub
# Select Model: Gemini 1.5 Flash or GPT-4o Mini
# Send message — should get real response, not mock
# Check streaming, citations, cost tracking in Settings → AI Providers
```

**Test Provider Failure & Fallback:**
1. Set invalid API key
2. Send message — should fail and fallback to next provider or mock
3. Should show error with WHAT, WHY, WHAT TO DO, not just "Something went wrong"

### 4. RAG Test

```bash
# Go to http://localhost:3000/documents
# Upload TXT file with C notes, select course CS3353
# Should chunk and embed, show stored chunks
# Go to AI Hub, select course CS3353, ask question about notes
# Should retrieve relevant chunks and show citations
```

### 5. Course-Specific Context Test

- Select course CS3353, ask about pointers — AI should know it's C Programming, mention units, COs
- Select different course EC3352, ask same — context should change
- Check system prompt includes course context (in real provider, would be in prompt)

### 6. Teaching Modes Test

- Select mode "Explain simply" → response should be simple, analogies
- Select "Deep dive" → derivations, advanced
- Select "PYQ mode" → HIGH/MEDIUM/LOWER relevance, not guarantee
- Select "Viva me" → examiner questions
- Select "Quiz me" → quiz questions

### 7. Conversation Persistence Test

- Create conversation, send 2-3 messages
- Reload page — should see same conversation in left sidebar, messages recovered
- Create new conversation — should appear in list
- Delete conversation — should remove

### 8. Model Registry & Router Test

- Go to /api/ai/models → should list 14 models
- Go to /api/ai/models?filter=free → should list free models
- In chat, select AUTO → router should choose best model for task (simple → free, coding → capable)
- Check Settings → AI Providers → shows model registry

### 9. Usage & Cost Control Test

- Go to /api/ai/usage → should show total cost, requests, by provider
- Go to Settings → AI Providers → Usage section shows cost
- Mock provider cost $0

### 10. Security Tests

- Try to access another user's conversation (if Supabase configured) — RLS should block
- Check API keys never exposed to client (Settings shows masked)
- Uploaded docs are DATA, not instructions — try prompt injection in document, should not override system instructions

## Known Limitations in Workspace 2

- Prisma generate network issue still exists in sandbox — app boots without it
- Real DB persistence for conversations/messages requires Supabase — currently localStorage mock, TODO Supabase
- Real PDF parsing not fully implemented — for now, upload TXT extracted from PDFs (honest, as noted in old README)
- Real embeddings use mock hash vectors for now — real via OpenAI/Gemini when configured, pgvector for storage
- Storage buckets need manual creation in Supabase Dashboard
- Vision support for images is placeholder — need to implement image attachment handling in chat API
- Memory extraction is simple regex — could be improved with LLM

## Exit Criteria for Workspace 2

✅ I can open app, select course, select AI provider/model, send message, receive real response (mock works without keys, real with keys), see streaming, continue conversation, reload page, recover conversation from localStorage (and Supabase when configured)

**Manual Test Result:** 
- Build passes with 21 routes
- AI Hub page loads with conversations sidebar, course/expert selector, model selector, teaching modes, chat area, context panel
- Mock provider streaming works
- Course context works
- Teaching modes change response
- Conversation persistence via localStorage works
- RAG upload works, chunks stored, retrieval works, citations shown
- Model registry API works
- Usage tracking works

## Result
✅ WORKSPACE 2 COMPLETE — 25/25 parts implemented (some with mock fallback for testing without credits, real when configured)

Next: Workspace 3 — Academic Engine (Parts 51-75)
